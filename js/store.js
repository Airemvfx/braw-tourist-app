// ============================================================
// Accounts + persistence (prototype backend on localStorage).
// In production this becomes an API; shapes are kept API-friendly.
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

function freshProfile(name) {
  return {
    name,
    createdAt: Date.now(),
    xp: 0,
    achievements: [],   // [{ id, at }]
    trips: [],          // trip objects, see planner.js
    activity: [],       // [{ at, icon, key, params, xp }]
    stamps: {},         // { regionName: timestamp } — passport
    game: { best: 0, plays: 0, xpDate: null, xpToday: 0 },
  };
}

/**
 * Fill in fields added after a profile was first written. Profiles live in
 * the user's browser indefinitely, so every read has to tolerate a shape
 * from an older build rather than assuming the current one.
 */
function normalise(user) {
  if (!user) return user;
  user.stamps ||= {};
  user.game ||= { best: 0, plays: 0, xpDate: null, xpToday: 0 };
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
    return key ? normalise(this.users[key]) || null : null;
  },

  async register(name, password) {
    const key = name.trim().toLowerCase();
    if (!/^[a-z0-9_ .-]{3,24}$/i.test(name.trim())) throw authError('auth.err.nameFormat');
    if (password.length < 4) throw authError('auth.err.passShort');
    if (this.users[key]) throw authError('auth.err.taken');
    const user = freshProfile(name.trim());
    user.passHash = await hashPassword(password);
    this.users[key] = user;
    persistUsers(this.users);
    localStorage.setItem(SESSION_KEY, key);
    return normalise(user);
  },

  async login(name, password) {
    const key = name.trim().toLowerCase();
    const user = this.users[key];
    if (!user) throw authError('auth.err.noUser');
    if (user.passHash !== await hashPassword(password)) throw authError('auth.err.wrongPass');
    localStorage.setItem(SESSION_KEY, key);
    return normalise(user);
  },

  logout() { localStorage.removeItem(SESSION_KEY); },

  save() { persistUsers(this.users); },

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
      ...existing, ...profile, name: existing.name, passHash,
    });
    persistUsers(this.users);
    return this.users[key];
  },
};
