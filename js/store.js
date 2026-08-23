// ============================================================
// Accounts and the local profile.
//
// Every profile lives here, in this browser, whether or not there is a
// backend. That is the whole design: the app works on a hillside with
// no signal, so the local copy is the working copy and the server — when
// one is configured — holds a copy of it, not the other way round.
//
// Two kinds of account share this store:
//
//   local:<name>  a name and a password, kept in this browser only.
//                 Still the default, and all the demo needs.
//   cloud:<uuid>  backed by a real account; the profile syncs, and
//                 photographs can be uploaded.
//
// Both are ordinary profiles with the same shape. The key is stable and
// is what photographs are filed under, so renaming yourself no longer
// orphans your pictures — which it used to, silently.
// ============================================================

const USERS_KEY = 'braw_users_v1';
const SESSION_KEY = 'braw_session_v1';

function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch { return {}; }
}

function persistUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

async function hashPassword(str) {
  if (crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`braw·${str}`));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Non-secure-context fallback (prototype only).
  let h = 7;
  for (const c of str) h = ((h * 31) + c.charCodeAt(0)) >>> 0;
  return 'x' + h.toString(16);
}

/**
 * Auth failures carry a translation key rather than English prose, so the
 * UI can render them in whichever language is active when they surface.
 */
function authError(key) {
  const err = new Error(key);
  err.i18nKey = key;
  return err;
}

function freshProfile(name, id) {
  return {
    id,
    name,
    createdAt: Date.now(),
    xp: 0,
    achievements: [],   // [{ id, at }]
    trips: [],          // trip objects, see planner.js
    activity: [],       // [{ at, icon, key, params, xp }]
    stamps: {},         // { regionName: timestamp } — passport
    game: { best: 0, plays: 0, xpDate: null, xpToday: 0 },
    eggs: {},          // { eggKey: timestamp } — hidden library entries found
    lore: {},          // { loreId: timestamp } — entries actually read
  };
}

/**
 * Fill in fields added after a profile was first written. Profiles live in
 * the user's browser indefinitely, so every read has to tolerate a shape
 * from an older build rather than assuming the current one.
 */
function normalise(user, key) {
  if (!user) return user;
  // The key in `users` *is* the id, and always has been — for local
  // accounts that is the lower-cased name. Adopting it verbatim rather
  // than inventing a prefixed form is what keeps already-stored
  // photographs attached: the v1 photo migration files them under the
  // same lower-cased name. A cloud account cannot collide with one,
  // because ':' is not a legal character in an explorer name.
  user.id ||= key || String(user.name || '').toLowerCase();
  user.stamps ||= {};
  user.game ||= { best: 0, plays: 0, xpDate: null, xpToday: 0 };
  user.eggs ||= {};
  user.lore ||= {};
  user.achievements ||= [];
  user.trips ||= [];
  user.activity ||= [];
  return user;
}

export const store = {
  users: loadUsers(),

  get sessionName() { return localStorage.getItem(SESSION_KEY); },

  currentUser() {
    const key = this.sessionName;
    return key ? normalise(this.users[key], key) || null : null;
  },

  async register(name, password) {
    const key = name.trim().toLowerCase();
    if (!/^[a-z0-9_ .-]{3,24}$/i.test(name.trim())) throw authError('auth.err.nameFormat');
    if (password.length < 4) throw authError('auth.err.passShort');
    if (this.users[key]) throw authError('auth.err.taken');
    const user = freshProfile(name.trim(), key);
    user.passHash = await hashPassword(password);
    this.users[key] = user;
    persistUsers(this.users);
    localStorage.setItem(SESSION_KEY, key);
    return normalise(user, key);
  },

  async login(name, password) {
    const key = name.trim().toLowerCase();
    const user = this.users[key];
    if (!user) throw authError('auth.err.noUser');
    if (user.passHash !== await hashPassword(password)) throw authError('auth.err.wrongPass');
    localStorage.setItem(SESSION_KEY, key);
    return normalise(user, key);
  },

  /**
   * Open — or start — the local profile belonging to a cloud account.
   *
   * The signed-in account decides the key, so the same person on a
   * second device lands on the same profile without a password ever
   * being stored here. There is no passHash on a cloud profile: the
   * server holds the credential, and keeping a second copy of it in
   * localStorage would be a liability with no purpose.
   */
  openCloudProfile(cloudUser) {
    const key = `cloud:${cloudUser.id}`;
    const name = (cloudUser.displayName || '').trim() || (cloudUser.email || '').split('@')[0] || 'Explorer';
    let user = this.users[key];
    if (!user) {
      user = freshProfile(name, key);
      user.email = cloudUser.email || '';
      this.users[key] = user;
    } else if (cloudUser.displayName && user.name !== cloudUser.displayName) {
      user.name = cloudUser.displayName;
    }
    user.cloudId = cloudUser.id;
    persistUsers(this.users);
    localStorage.setItem(SESSION_KEY, key);
    return normalise(user, key);
  },

  /** Replace the signed-in profile's contents from a server snapshot. */
  adoptRemote(snapshot) {
    const key = this.sessionName;
    const existing = key && this.users[key];
    if (!existing) throw authError('auth.err.noUser');
    this.users[key] = normalise({
      ...existing, ...snapshot,
      id: existing.id, name: existing.name, cloudId: existing.cloudId, email: existing.email,
    }, key);
    persistUsers(this.users);
    return this.users[key];
  },

  /**
   * Carry a local profile up to a freshly made cloud account.
   *
   * Used once, at the moment someone with existing progress signs up:
   * without it their trips and badges would appear to vanish behind the
   * new account. Photographs are moved separately, by their owner key.
   */
  promoteLocal(localKey, cloudUser) {
    const from = this.users[localKey];
    const user = this.openCloudProfile(cloudUser);
    if (!from) return user;
    const merged = normalise({
      ...user,
      xp: from.xp, achievements: from.achievements, trips: from.trips,
      activity: from.activity, stamps: from.stamps, game: from.game,
      eggs: from.eggs, lore: from.lore, createdAt: from.createdAt,
    }, user.id);
    this.users[user.id] = merged;
    persistUsers(this.users);
    return merged;
  },

  isCloudProfile(user) { return Boolean(user?.cloudId); },

  logout() { localStorage.removeItem(SESSION_KEY); },

  /**
   * Anyone who wants to know when the profile changed.
   *
   * save() is called from dozens of places — every visited stop, every
   * XP award — so a listener here is how the cloud copy stays current
   * without threading a sync call through all of them. Listeners must
   * not throw and must not block; this is a local write, and it stays
   * one whether or not there is any signal.
   */
  saveListeners: new Set(),
  onSave(fn) { this.saveListeners.add(fn); return () => this.saveListeners.delete(fn); },

  save() {
    persistUsers(this.users);
    const current = this.currentUser();
    this.saveListeners.forEach(fn => {
      try { fn(current); } catch { /* a bad listener must not lose the save */ }
    });
  },

  /**
   * Overwrite the signed-in profile from a backup, keeping the existing
   * password so the account still opens with the credentials the person
   * already knows. Everything else is replaced wholesale — a restore is
   * a restore, not a merge, because merging two divergent XP histories
   * would produce a state neither device ever had.
   */
  restore(profile) {
    const key = this.sessionName;
    const existing = key && this.users[key];
    if (!existing) throw authError('auth.err.noUser');
    const passHash = existing.passHash;
    this.users[key] = normalise({
      ...existing, ...profile,
      id: existing.id, name: existing.name, passHash,
      cloudId: existing.cloudId, email: existing.email,
    }, key);
    persistUsers(this.users);
    return this.users[key];
  },
};
