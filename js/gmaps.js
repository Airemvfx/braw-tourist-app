// ============================================================
// BRAW — loading Google's map script, late and carefully.
//
// This is deliberately NOT a <script> tag in index.html. The comment in
// index.html about the webfonts explains why, with a measured number:
// a render-blocking third-party request cost 12.7 s of blank screen on a
// network that could not reach Google. A map script in the head would be
// the same mistake with a price attached — every visitor who never opens
// a map would still bill a load.
//
// So it is fetched by the first view that actually wants a map, and
// everything about the app works before it arrives, or if it never does.
//
// ---- The test seam ----
//
// The first line hands back whatever `window.google.maps` already is.
// That is how the suites run: they inject a fake `window.google` with
// addInitScript, exactly as tests/cloud.js injects window.BRAW_CLOUD,
// and no request is ever made. CI must never make a billable call.
// ============================================================

import { GOOGLE, googleEnabled } from './google-config.js';
import { getLang } from './i18n.js';

const CALLBACK = '__brawMapsReady';
const TIMEOUT_MS = 8000;

let loading = null;

/** Has the script actually arrived? Callers use this to pick a renderer. */
export const mapsReady = () => Boolean(window.google && window.google.maps);

/**
 * Fetch the Maps JavaScript API, once.
 *
 * Rejects rather than throws for the three ordinary reasons — no key, no
 * consent, cannot reach Google — because every one of them has the same
 * answer: draw the map some other way. There is one degraded path in
 * this app, not three.
 */
export function loadMaps() {
  if (mapsReady()) return Promise.resolve(window.google.maps);
  if (!googleEnabled()) return Promise.reject(new Error('google-off'));
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;

    // A network that hangs is worse than one that fails: onerror never
    // fires, and without this the map would spin for ever the way live
    // location used to before it was given its own deadline.
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('timeout'));
    }, TIMEOUT_MS);

    function cleanup() {
      clearTimeout(timer);
      delete window[CALLBACK];
    }

    window[CALLBACK] = () => {
      cleanup();
      resolve(window.google.maps);
    };
    script.onerror = () => {
      cleanup();
      reject(new Error('unreachable'));
    };

    const params = new URLSearchParams({
      key: GOOGLE.key,
      v: 'weekly',
      loading: 'async',
      libraries: 'marker',
      language: getLang(),
      callback: CALLBACK,
    });
    script.src = `https://maps.googleapis.com/maps/api/js?${params}`;
    document.head.appendChild(script);
  });

  // A failure must not be remembered for ever — a later view, or a
  // recovered connection, deserves another go.
  loading.catch(() => { loading = null; });
  return loading;
}

/**
 * Open a connection to Google shortly before it is needed.
 *
 * Called from a nav click towards a map-bearing view, not from
 * index.html. A preconnect in the markup would reach out to Google for
 * every visitor who never sees a map — precisely the thing PRIVACY.md
 * already criticises about the webfonts.
 */
export function warmGoogle() {
  if (!googleEnabled() || mapsReady()) return;
  if (document.getElementById('braw-gmaps-preconnect')) return;
  for (const href of ['https://maps.googleapis.com', 'https://maps.gstatic.com']) {
    const link = document.createElement('link');
    link.id = 'braw-gmaps-preconnect';
    link.rel = 'preconnect';
    link.href = href;
    link.crossOrigin = '';
    document.head.appendChild(link);
  }
}
