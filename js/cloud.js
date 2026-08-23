// ============================================================
// BRAW — the app's view of the backend.
//
// One layer above supabase.js, and the only thing the rest of the app
// talks to. Two reasons for the seam:
//
//   * Supabase is a starting point, not a decision. When this moves to
//     a server of its own, this file is what gets rewritten; app.js
//     should not know the difference.
//   * Everything here is optional. With no project configured, or with
//     no signal, every function below either no-ops or reports a
//     failure the caller can shrug off. The app is local-first: the
//     cloud is a copy of the truth, never the truth itself. Nothing in
//     a view may wait on a network call to render.
// ============================================================

import { CLOUD, cloudConfigured, storeConfigured } from './cloud-config.js';
import { auth, db, storage, currentSession, signedIn, onSessionChange } from './supabase.js';
import { markUploaded, allPhotos } from './photos.js';
import { dataUrlToBlob } from './vault.js';

const REV_KEY = 'braw_cloud_rev_v1';

export { onSessionChange, storeConfigured };

/** Configured, and the key is a real anon key. */
export function cloudAvailable() {
  return cloudConfigured() && auth.ready();
}

export function cloudSignedIn() {
  return cloudAvailable() && signedIn();
}

export function cloudUser() {
  return cloudAvailable() ? (currentSession()?.user || null) : null;
}

/** The stable account key photographs and profiles are filed under. */
export function ownerKeyFor(user) {
  return user?.id || '';
}

function requireCloud() {
  if (!cloudAvailable()) {
    const err = new Error('cloud not configured');
    err.i18nKey = 'cloud.err.offConfig';
    throw err;
  }
}

// ------------------------------------------------------------------
// Accounts
// ------------------------------------------------------------------

export const account = {
  async signUp(email, password, displayName) {
    requireCloud();
    return auth.signUp(email.trim(), password, displayName.trim());
  },

  async signIn(email, password) {
    requireCloud();
    return auth.signIn(email.trim(), password);
  },

  async signOut() {
    if (!cloudAvailable()) return;
    await auth.signOut();
  },

  async sendReset(email) {
    requireCloud();
    return auth.sendReset(email.trim());
  },
};

// ------------------------------------------------------------------
// Profile sync
//
// The local profile stays the working copy; this pushes a snapshot of
// it so a second device can pick it up. The revision counter is what
// keeps two devices from quietly destroying each other's history: a
// push carrying a stale revision is refused by the server and the
// caller is handed the conflict to resolve, rather than the newest
// arrival simply winning.
// ------------------------------------------------------------------

function revisions() {
  try { return JSON.parse(localStorage.getItem(REV_KEY)) || {}; }
  catch { return {}; }
}

function rememberRevision(userId, rev) {
  try {
    const all = revisions();
    all[userId] = rev;
    localStorage.setItem(REV_KEY, JSON.stringify(all));
  } catch { /* the next push will simply be told it is stale */ }
}

export function knownRevision(userId) {
  return Number(revisions()[userId] ?? -1);
}

/** What the server holds, or null if there is nothing there yet. */
export async function pullProfile() {
  requireCloud();
  const me = cloudUser();
  const rows = await db.select('profiles', `select=data,revision,display_name&id=eq.${me.id}`);
  const row = rows?.[0];
  if (!row) return null;
  rememberRevision(me.id, row.revision);
  return {
    data: row.data && Object.keys(row.data).length ? row.data : null,
    revision: row.revision,
    displayName: row.display_name,
  };
}

/**
 * Push a snapshot.
 *
 * Returns { ok, revision } — and on a refusal, { ok: false, conflict: true }
 * with the server's current revision, so the caller can pull, show the
 * user both, and let them choose. It deliberately does not resolve the
 * conflict itself: merging two divergent XP histories produces a state
 * neither device was ever in, which is worse than asking.
 */
export async function pushProfile(profile) {
  requireCloud();
  const me = cloudUser();
  if (!me) return { ok: false, reason: 'signedOut' };

  let rev = knownRevision(me.id);
  if (rev < 0) {
    // Never synced on this device: find out where the server is first,
    // otherwise the first push is guaranteed to look like a conflict.
    const remote = await pullProfile();
    rev = remote ? remote.revision : 0;
  }

  const snapshot = {
    name: profile.name,
    createdAt: profile.createdAt,
    xp: profile.xp,
    achievements: profile.achievements,
    trips: profile.trips,
    activity: profile.activity,
    stamps: profile.stamps,
    game: profile.game,
    eggs: profile.eggs,
    lore: profile.lore,
  };

  const rows = await db.rpc('push_profile', { p_data: snapshot, p_revision: rev });
  const result = Array.isArray(rows) ? rows[0] : rows;
  if (result?.ok) {
    rememberRevision(me.id, result.revision);
    return { ok: true, revision: result.revision };
  }
  if (result && result.revision >= 0) rememberRevision(me.id, result.revision);
  return { ok: false, conflict: true, revision: result?.revision ?? -1 };
}

/**
 * A debounced push, for calling after ordinary saves.
 *
 * Saves happen constantly — every visited stop, every XP award — and
 * one request each would be both wasteful and a good way to hit a rate
 * limit. Failures are swallowed: a sync that could not happen is not
 * something to interrupt someone's walk about.
 */
let pushTimer = null;
let pushPending = null;

export function schedulePush(profile, delay = 8000) {
  if (!cloudSignedIn() || !CLOUD.syncProfile) return;
  pushPending = profile;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(async () => {
    const p = pushPending;
    pushPending = null;
    try { await pushProfile(p); } catch { /* tries again after the next save */ }
  }, delay);
}

/** Push now if one is waiting — used when the tab is being hidden. */
export async function flushPush() {
  if (!pushPending) return;
  clearTimeout(pushTimer);
  const p = pushPending;
  pushPending = null;
  try { await pushProfile(p); } catch { /* nothing useful to do here */ }
}

// ------------------------------------------------------------------
// Photographs
//
// Upload is always something the user asked for, never automatic. The
// local copy remains the original; the remote one is a safety net and
// the thing a print shop can be pointed at.
// ------------------------------------------------------------------

export async function uploadPhoto(record) {
  requireCloud();
  const me = cloudUser();
  if (!me) throw new Error('signed out');

  const path = `${me.id}/${record.id}.jpg`;
  await storage.upload(path, dataUrlToBlob(record.full || record.thumb));

  await db.insert('photos', {
    id: record.id,
    user_id: me.id,
    trip_id: record.tripId || null,
    poi_id: record.poiId,
    taken_at: new Date(record.at).toISOString(),
    width: record.w || null,
    height: record.h || null,
    bytes: record.bytes || null,
    storage_path: path,
  }, { upsert: true });

  await markUploaded(record.id, path);
  return path;
}

/**
 * Upload everything not yet uploaded, one at a time.
 *
 * Sequential on purpose. These are megabyte files on what is often a
 * phone connection; running them in parallel makes every one of them
 * slower and the failures harder to report. `onProgress` is what the
 * UI shows, and a single failure stops the run rather than pressing on
 * — usually it means the signal has gone, and twenty more attempts
 * will not go better.
 */
export async function uploadAll(owner, onProgress) {
  requireCloud();
  const pending = (await allPhotos(owner)).filter(p => !p.remote);
  let done = 0;
  for (const p of pending) {
    await uploadPhoto(p);
    done++;
    onProgress?.(done, pending.length);
  }
  return { uploaded: done, total: pending.length };
}

export async function removeRemotePhoto(record) {
  if (!cloudSignedIn() || !record?.remote?.path) return;
  try {
    await storage.remove(record.remote.path);
    await db.remove('photos', `id=eq.${encodeURIComponent(record.id)}`);
  } catch { /* the row may already be gone; not worth surfacing */ }
}

export async function photoUrl(record) {
  if (!record?.remote?.path) return null;
  requireCloud();
  return storage.signedUrl(record.remote.path);
}

// ------------------------------------------------------------------
// The shop
// ------------------------------------------------------------------

/**
 * The price list, from the server.
 *
 * Prices are never taken from the client — see create_order() in
 * schema.sql — so this is display only, and a failure to fetch it is
 * survivable: the Store falls back to its built-in catalogue and says
 * prices could not be confirmed.
 */
export async function products() {
  requireCloud();
  return db.products();
}

export async function placeOrder(productId, items) {
  requireCloud();
  const rows = await db.rpc('create_order', { p_product_id: productId, p_items: items });
  return Array.isArray(rows) ? rows[0] : rows;
}

export async function myOrders() {
  requireCloud();
  return db.select('orders', 'select=*&order=created_at.desc&limit=20');
}

export async function markOrderSubmitted(id) {
  requireCloud();
  return db.update('orders', `id=eq.${encodeURIComponent(id)}`, { status: 'submitted' });
}

/**
 * Where to send someone to actually pay.
 *
 * The reference is carried in the URL so the shop can pick the basket
 * up. Nothing else goes with it — no email, no name, no photographs.
 * The shop can ask for a delivery address itself; there is no reason
 * for it to arrive from here.
 */
export function checkoutUrl(order) {
  if (!storeConfigured() || !order?.ref) return null;
  const url = new URL(CLOUD.storeUrl);
  url.searchParams.set('ref', order.ref);
  url.searchParams.set('product', order.product_id || order.kind || '');
  return url.toString();
}
