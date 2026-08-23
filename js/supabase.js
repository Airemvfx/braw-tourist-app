// ============================================================
// BRAW — a small Supabase client, written by hand.
//
// The official SDK is about 120KB and would have to come from a CDN,
// because this project has no build step. That is a poor trade here.
// This app already learned once what a render-blocking third-party
// request costs it — a webfont import turned first paint into twelve
// seconds — and a mapping app is used in glens with one bar of signal,
// where every extra host is another thing that can hang.
//
// Supabase's three services are plain HTTP and the parts this app needs
// are small: sign in, sign out, refresh, read and write a few rows, put
// and sign an object. That is what is below, in about the space the
// SDK's import statement would have cost.
//
//   /auth/v1     GoTrue      accounts and tokens
//   /rest/v1     PostgREST   tables and functions
//   /storage/v1  Storage     the photo bucket
//
// Everything here throws Errors carrying an `i18nKey`, matching the
// convention store.js already uses, so failures can be shown in
// whichever language is on screen rather than in English from a server.
// ============================================================

import { CLOUD } from './cloud-config.js';

const SESSION_KEY = 'braw_cloud_session_v1';
const TIMEOUT_MS = 15000;
// Refresh a little before the token actually dies, so a request that
// takes a moment does not land on the far side of the expiry.
const REFRESH_MARGIN_MS = 60000;

// ------------------------------------------------------------------
// Errors
// ------------------------------------------------------------------

function cloudError(key, detail) {
  const err = new Error(detail || key);
  err.i18nKey = `cloud.err.${key}`;
  err.cloudCode = key;
  return err;
}

/**
 * Turn whatever the server said into one of our own codes.
 *
 * GoTrue has changed its error shape more than once, so all three forms
 * are read: the OAuth-style {error, error_description}, the older
 * {msg}, and the current {error_code, msg}.
 */
function mapError(status, body) {
  const code = String(body?.error_code || body?.error || '').toLowerCase();
  const msg = String(body?.error_description || body?.msg || body?.message || '').toLowerCase();
  const has = s => code.includes(s) || msg.includes(s);

  if (status === 429 || has('rate limit') || has('over_request_rate')) return 'rateLimit';
  if (has('invalid login') || has('invalid_grant')) return 'badLogin';
  if (has('already registered') || has('already been registered') || status === 422 && has('user')) return 'taken';
  if (has('email not confirmed') || has('email_not_confirmed')) return 'unconfirmed';
  if (has('password') && (has('short') || has('least') || has('weak'))) return 'passShort';
  if (has('invalid email') || has('validation_failed') && has('email')) return 'badEmail';
  if (status === 401 || status === 403) return 'denied';
  if (status >= 500) return 'server';
  return 'failed';
}

// ------------------------------------------------------------------
// The service_role guard
//
// Pasting the service_role key into a public client is the single most
// damaging Supabase mistake there is: it bypasses row-level security,
// so every visitor to the site gets read and write on every user's
// data, and once the key is committed it is in git history forever.
//
// It is easy to do — the two keys sit next to each other on the same
// settings page and look identical. So the key is inspected here and a
// service_role token is refused outright rather than quietly working,
// which is exactly what makes the mistake so hard to notice.
// ------------------------------------------------------------------

function jwtRole(token) {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).role || null;
  } catch { return null; }
}

let refusedKey = false;

function keyIsSafe() {
  if (refusedKey) return false;
  const role = jwtRole(CLOUD.anonKey);
  if (role && role !== 'anon') {
    refusedKey = true;
    // Loud, and not translated: this is for whoever deployed the site,
    // not for the person trying to look at a map.
    console.error(
      `[BRAW] Refusing to start: the key in cloud-config.js is a "${role}" key, not the anon key. ` +
      'A service_role key in the browser gives every visitor full access to every account. ' +
      'Replace it with the anon key from Project settings → API, and rotate the leaked one.'
    );
    return false;
  }
  return true;
}

// ------------------------------------------------------------------
// Session
// ------------------------------------------------------------------

let session = null;
let loaded = false;

function loadSession() {
  if (loaded) return session;
  loaded = true;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)) || null; }
  catch { session = null; }
  return session;
}

function storeSession(next) {
  session = next;
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* private mode; the session simply will not outlive the tab */ }
  listeners.forEach(fn => { try { fn(next); } catch { /* one bad listener must not break the rest */ } });
}

/** Shape a GoTrue token response into what we keep. */
function toSession(body) {
  if (!body || !body.access_token) return null;
  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: Date.now() + (Number(body.expires_in) || 3600) * 1000,
    user: {
      id: body.user?.id,
      email: body.user?.email,
      displayName: body.user?.user_metadata?.display_name || '',
    },
  };
}

const listeners = new Set();
export function onSessionChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/**
 * Follow what other tabs do.
 *
 * The session is cached in memory, which is right for speed but wrong
 * across tabs: GoTrue rotates refresh tokens, so if a second tab
 * refreshes, this tab's copy is spent. Using it would fail, and a
 * failed refresh is treated as a dead session — the user would be
 * signed out of one tab by having two open. The `storage` event fires
 * only in *other* documents, which is exactly the case that matters.
 */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key !== SESSION_KEY) return;
    try { session = e.newValue ? JSON.parse(e.newValue) : null; }
    catch { session = null; }
    loaded = true;
    listeners.forEach(fn => { try { fn(session); } catch { /* keep going */ } });
  });
}

export function currentSession() { return loadSession(); }
export function signedIn() { return Boolean(loadSession()?.accessToken); }

// ------------------------------------------------------------------
// Transport
// ------------------------------------------------------------------

/**
 * fetch with a deadline and a translated failure.
 *
 * The timeout is the point. Without it a request made as the signal
 * drops never settles, and any UI awaiting it waits for ever — which on
 * a phone in a glen is the normal case, not the edge case.
 */
async function request(path, { method = 'GET', headers = {}, body, raw = false, timeout = TIMEOUT_MS } = {}) {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) throw cloudError('offline');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let res;
  try {
    res = await fetch(`${CLOUD.url}${path}`, {
      method,
      headers: { apikey: CLOUD.anonKey, ...headers },
      body,
      signal: controller.signal,
    });
  } catch (err) {
    throw cloudError(err.name === 'AbortError' ? 'timeout' : 'network', err.message);
  } finally {
    clearTimeout(timer);
  }

  if (raw) {
    if (!res.ok) throw cloudError(mapError(res.status), `${res.status}`);
    return res;
  }

  const text = await res.text();
  let json = null;
  if (text) { try { json = JSON.parse(text); } catch { /* not every endpoint answers JSON */ } }

  if (!res.ok) {
    const err = cloudError(mapError(res.status, json), json?.msg || json?.message || text.slice(0, 200));
    err.status = res.status;
    throw err;
  }
  return json;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

// ------------------------------------------------------------------
// Token refresh
//
// Held as a single in-flight promise. Several requests waking at once
// after the app has been backgrounded would otherwise each try to
// refresh, and GoTrue rotates refresh tokens — the second attempt would
// present one that had just been spent and sign the user out.
// ------------------------------------------------------------------

let refreshing = null;

async function refresh() {
  const current = loadSession();
  if (!current?.refreshToken) throw cloudError('signedOut');
  if (refreshing) return refreshing;

  refreshing = (async () => {
    try {
      const body = await request('/auth/v1/token?grant_type=refresh_token', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ refresh_token: current.refreshToken }),
      });
      const next = toSession(body);
      if (!next) throw cloudError('signedOut');
      storeSession(next);
      return next;
    } catch (err) {
      // A refused refresh token is final — the session is gone and no
      // amount of retrying brings it back. A network failure is not:
      // keep the session so it can be used again when signal returns.
      if (err.cloudCode === 'badLogin' || err.cloudCode === 'denied' || err.status === 400) storeSession(null);
      throw err;
    } finally {
      refreshing = null;
    }
  })();

  return refreshing;
}

/** A live access token, refreshed if it is close to expiring. */
async function token() {
  let current = loadSession();
  if (!current?.accessToken) throw cloudError('signedOut');
  if (Date.now() > current.expiresAt - REFRESH_MARGIN_MS) current = await refresh();
  return current.accessToken;
}

async function authed(path, opts = {}) {
  const bearer = await token();
  return request(path, { ...opts, headers: { Authorization: `Bearer ${bearer}`, ...opts.headers } });
}

// ------------------------------------------------------------------
// Accounts
// ------------------------------------------------------------------

export const auth = {
  ready: () => Boolean(CLOUD.url && CLOUD.anonKey) && keyIsSafe(),

  async signUp(email, password, displayName) {
    const body = await request('/auth/v1/signup', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, password, data: { display_name: displayName } }),
    });
    const next = toSession(body);
    if (next) storeSession(next);
    // No session back means the project asks for email confirmation, so
    // the account exists but cannot be used until the link is clicked.
    return { session: next, needsConfirmation: !next };
  },

  async signIn(email, password) {
    const body = await request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email, password }),
    });
    const next = toSession(body);
    if (!next) throw cloudError('failed');
    storeSession(next);
    return next;
  },

  async signOut() {
    // Best effort. If the network is down the local session still goes:
    // a sign-out that visibly fails to sign you out is worse than a
    // refresh token left to expire on its own.
    try {
      await authed('/auth/v1/logout', { method: 'POST', headers: jsonHeaders });
    } catch { /* deliberately ignored */ }
    storeSession(null);
  },

  async sendReset(email) {
    await request('/auth/v1/recover', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ email }),
    });
  },

  /** Confirm the session is still real, server-side. */
  async me() {
    const body = await authed('/auth/v1/user');
    return { id: body.id, email: body.email, displayName: body.user_metadata?.display_name || '' };
  },
};

// ------------------------------------------------------------------
// Tables and functions
// ------------------------------------------------------------------

export const db = {
  async select(table, query = '') {
    return authed(`/rest/v1/${table}?${query}`, { headers: { Accept: 'application/json' } });
  },

  async insert(table, rows, { upsert = false } = {}) {
    return authed(`/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        ...jsonHeaders,
        Prefer: `return=representation${upsert ? ',resolution=merge-duplicates' : ''}`,
      },
      body: JSON.stringify(rows),
    });
  },

  async update(table, query, patch) {
    return authed(`/rest/v1/${table}?${query}`, {
      method: 'PATCH',
      headers: { ...jsonHeaders, Prefer: 'return=representation' },
      body: JSON.stringify(patch),
    });
  },

  async remove(table, query) {
    return authed(`/rest/v1/${table}?${query}`, { method: 'DELETE' });
  },

  async rpc(fn, args = {}) {
    return authed(`/rest/v1/rpc/${fn}`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(args),
    });
  },

  /** The price list, readable without an account. */
  async products() {
    return request('/rest/v1/products?select=*&active=eq.true&order=price_pence.asc', {
      headers: { Authorization: `Bearer ${CLOUD.anonKey}`, Accept: 'application/json' },
    });
  },
};

// ------------------------------------------------------------------
// Storage
// ------------------------------------------------------------------

export const storage = {
  /**
   * Put one object. Uploads get a longer deadline than API calls — a
   * print-resolution photograph over a rural connection is slow but not
   * broken, and cutting it off at fifteen seconds would fail uploads
   * that were going to succeed.
   */
  async upload(path, blob, { contentType = 'image/jpeg', upsert = true } = {}) {
    const bearer = await token();
    await request(`/storage/v1/object/${CLOUD.bucket}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearer}`,
        'Content-Type': contentType,
        'x-upsert': String(upsert),
      },
      body: blob,
      raw: true,
      timeout: 120000,
    });
    return path;
  },

  /** A time-limited URL for a private object. One hour by default. */
  async signedUrl(path, expiresIn = 3600) {
    const body = await authed(`/storage/v1/object/sign/${CLOUD.bucket}/${path}`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ expiresIn }),
    });
    // GoTrue returns it relative to /storage/v1.
    return `${CLOUD.url}/storage/v1${body.signedURL || body.signedUrl}`;
  },

  async remove(path) {
    await authed(`/storage/v1/object/${CLOUD.bucket}/${path}`, { method: 'DELETE' });
  },
};
