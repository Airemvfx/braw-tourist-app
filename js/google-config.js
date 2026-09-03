// ============================================================
// BRAW — the Google Maps key, and the switch in front of it.
//
// Ships blank on purpose. With no key the app runs exactly as it always
// has: the hand-drawn Scotland map, no request to Google, nothing
// leaving the device. Filling the key in makes a worldwide map
// *available*; it does not turn it on. That is the consent switch's job,
// and it is off until somebody chooses otherwise.
//
// ---- Why this key is safe in a public file, and what actually guards it ----
//
// A browser key cannot be hidden. Google's design assumes it is public
// and puts the protection somewhere else, so the protection is entirely
// in the Cloud console and not in this repository:
//
//   1. An HTTP referrer restriction, on the *path*, not just the host.
//      A bare github.io restriction is nearly useless — that domain is
//      shared with every other repository the same account publishes.
//   2. An API restriction: the Maps JavaScript API and nothing else.
//   3. A hard daily quota cap per API. A budget alert is a smoke
//      detector; a quota cap is the fuse. Set it below the free
//      threshold so the worst case is "the map stopped working today"
//      rather than an invoice.
//
// Referrer restrictions are trivially spoofed by anything that is not a
// browser. They stop casual copy-paste theft. The quota cap is what
// stops a bill, so it is the one that actually matters.
//
// There is deliberately no build step that injects this at deploy time.
// This repository's defining constraint is not having one, and adding it
// to hide a value that is not a secret would be a poor trade.
// ============================================================

const BUILT_IN = {
  // From Google Cloud console → Credentials. Public by design; see above.
  key: '',

  // Optional. A Map ID enables cloud-based styling and is required by
  // AdvancedMarkerElement. Without one the map still draws, using the
  // default style and the older marker.
  mapId: '',
};

/**
 * Overrides, in the order they win.
 *
 * `window.BRAW_GOOGLE` is how a deployment supplies a key without
 * committing it, and how the tests inject a fake one. The localStorage
 * override is a development convenience honoured only on localhost —
 * anywhere else an override that survives in a real user's browser
 * would be a way to bill somebody else's project, so it is ignored.
 */
function overrides() {
  const out = {};
  if (typeof window !== 'undefined' && window.BRAW_GOOGLE) Object.assign(out, window.BRAW_GOOGLE);

  const local = typeof location !== 'undefined'
    && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (local) {
    try {
      const raw = localStorage.getItem('braw_google_override');
      if (raw) Object.assign(out, JSON.parse(raw));
    } catch { /* malformed override is simply ignored */ }
  }
  return out;
}

export const GOOGLE = { ...BUILT_IN, ...overrides() };

/** Is there a key at all? Nothing can reach Google without one. */
export const googleKeyPresent = () => Boolean(GOOGLE.key);

// ------------------------------------------------------------------
// Consent
//
// Separate from the key, and both are required. A key means the owner
// has made a worldwide map possible; consent means this person has
// agreed that their device may talk to Google about where they are
// looking. Until then the claim on the sign-in screen — that no data
// leaves this device — stays literally true, which is the only
// honest reason to have the switch rather than a paragraph.
// ------------------------------------------------------------------

const CONSENT_KEY = 'braw_google_consent_v1';

export function googleConsented() {
  try { return localStorage.getItem(CONSENT_KEY) === 'yes'; } catch { return false; }
}

export function setGoogleConsent(yes) {
  try {
    if (yes) localStorage.setItem(CONSENT_KEY, 'yes');
    else localStorage.removeItem(CONSENT_KEY);
  } catch { /* a browser refusing storage simply never consents */ }
  return googleConsented();
}

/** The one gate everything else asks. Both halves, every time. */
export const googleEnabled = () => googleKeyPresent() && googleConsented();
