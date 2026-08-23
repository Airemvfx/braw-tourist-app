// ============================================================
// BRAW — where the backend lives.
//
// Ships blank on purpose. With no URL and no key the app runs exactly as
// it always has: accounts in this browser, photographs in this browser,
// nothing leaving the device. Filling these in switches on real accounts
// and the optional photo upload; nothing else about the app changes.
//
// ---- Which key goes here ----
//
// The *anon* key, from Project settings → API. It is meant to be public
// and is safe in a file anyone can read: it grants nothing on its own,
// because every table is behind row-level security (see
// supabase/schema.sql). Publishing it is the intended design.
//
// The *service_role* key is the opposite. It bypasses row-level security
// entirely and would hand every visitor every other user's data. It must
// never appear in this repository. supabase.js inspects the key it is
// given and refuses to start if it sees a service_role token, because
// that mistake is quiet, common, and unrecoverable once the key is in
// git history.
// ============================================================

const BUILT_IN = {
  // e.g. 'https://abcdefghijklm.supabase.co'
  url: '',
  // The public anon key. See the note above.
  anonKey: '',

  // Private bucket created by schema.sql.
  bucket: 'journey-photos',

  // The shop that actually takes the money and posts the parcel. Until
  // this is set, the Store shows its catalogue and builds an order, but
  // says plainly that checkout is not connected yet rather than
  // pretending to sell anything.
  storeUrl: '',

  // Off by default. Turning it on lets a signed-in user push their
  // profile so a new phone can pick up where the old one left off.
  syncProfile: true,
};

/**
 * Overrides, in the order they win.
 *
 * `window.BRAW_CLOUD` is for deployments that would rather not commit
 * their project URL — an inline <script> in index.html sets it before
 * the modules load. The tests use it too, to point at a stub server.
 *
 * The localStorage override is a development convenience and is honoured
 * only on localhost. Anywhere else it is ignored: an override that
 * survives in a real user's browser would be a way to redirect a signed
 * in session at somebody else's server, and there is no good reason to
 * leave that lying around in production.
 */
function overrides() {
  const out = {};
  if (typeof window !== 'undefined' && window.BRAW_CLOUD) Object.assign(out, window.BRAW_CLOUD);

  const local = typeof location !== 'undefined'
    && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (local) {
    try {
      const raw = localStorage.getItem('braw_cloud_override');
      if (raw) Object.assign(out, JSON.parse(raw));
    } catch { /* malformed override is simply ignored */ }
  }
  return out;
}

export const CLOUD = { ...BUILT_IN, ...overrides() };

/** True once a project URL and key are present. Everything gates on this. */
export const cloudConfigured = () => Boolean(CLOUD.url && CLOUD.anonKey);

/** True once there is a real shop to hand a finished order over to. */
export const storeConfigured = () => Boolean(CLOUD.storeUrl);
