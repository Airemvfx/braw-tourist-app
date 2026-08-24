// ============================================================
// Live location — off unless you turn it on.
//
// The engine in geotracking.js has existed since early on and nothing
// ever called it, while the landing page advertised "Live GPS". This is
// the part that was missing: consent, persistence, permission handling,
// and honest error states.
//
// Three rules this module keeps:
//
//   1. It never starts on its own. Location begins only after an
//      explicit tap, and the first tap explains what it does first.
//   2. Nothing is transmitted. Positions stay in memory, are used to
//      move a dot and to notice arrivals, and are never written to
//      storage or sent anywhere. There is nowhere to send them to.
//   3. Turning it off means off — the watch is released, so the device
//      stops powering the receiver.
// ============================================================

import { GeoTracker, distM } from './geotracking.js';

const PREF_KEY = 'braw_geo_v1';

/** Reasons tracking is not running, so the UI can say something useful. */
export const GEO = {
  OFF: 'off',
  ASKING: 'asking',
  ON: 'on',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
  FAILED: 'failed',
};

let tracker = null;
let state = GEO.OFF;
let position = null;
let lastError = null;
const listeners = new Set();

/**
 * Our own deadline on the first fix.
 *
 * The Geolocation spec has a `timeout` option and it is not enough:
 * when a browser refuses the request without asking — a blocked site,
 * a dismissed prompt, a locked-down profile — watchPosition calls
 * neither callback, ever. Measured: still waiting after 35 seconds with
 * a 30-second timeout set. So the app waited on a promise that was
 * never going to be kept, showing a button that pulsed for ever and
 * said nothing.
 *
 * Long enough for a cold GPS lock on a phone, short enough that nobody
 * decides it is broken first.
 */
const FIRST_FIX_MS = 18_000;
let fixDeadline = null;

function clearDeadline() {
  if (fixDeadline) { clearTimeout(fixDeadline); fixDeadline = null; }
}

function emit(extra = {}) {
  listeners.forEach(fn => fn({ state, position, error: lastError, ...extra }));
}

export function onLocationChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function locationState() { return { state, position, error: lastError }; }
export function isTracking() { return state === GEO.ON; }

/** Has the user agreed to location before? Only ever set by an explicit tap. */
export function hasConsented() {
  try { return localStorage.getItem(PREF_KEY) === 'yes'; }
  catch { return false; }
}

export function setConsent(yes) {
  try { localStorage.setItem(PREF_KEY, yes ? 'yes' : 'no'); }
  catch { /* private mode: consent simply will not persist */ }
}

export function forgetConsent() {
  try { localStorage.removeItem(PREF_KEY); } catch { /* ignore */ }
}

/**
 * @param {object} hooks
 * @param {(poi, metres) => void} hooks.onArrive fires once per fence
 */
export function startTracking({ onArrive = () => {} } = {}) {
  if (!('geolocation' in navigator)) {
    state = GEO.UNAVAILABLE;
    emit();
    return false;
  }
  if (tracker && state === GEO.ON) return true;

  tracker = tracker || new GeoTracker({
    onUpdate: pos => {
      clearDeadline();
      const first = !position;
      position = pos;
      if (state !== GEO.ON) state = GEO.ON;
      lastError = null;
      emit({ firstFix: first });
    },
    onEnterFence: (poi, metres) => onArrive(poi, metres),
    onError: err => {
      clearDeadline();
      // 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
      if (err && err.code === 1) { state = GEO.DENIED; setConsent(false); }
      else if (err && err.code === 2) state = GEO.UNAVAILABLE;
      else state = GEO.FAILED;
      lastError = err;
      emit();
    },
  });

  state = GEO.ASKING;
  emit();
  const ok = tracker.start();
  if (!ok) { state = GEO.UNAVAILABLE; emit(); }

  clearDeadline();
  fixDeadline = setTimeout(() => {
    fixDeadline = null;
    if (state !== GEO.ASKING) return;    // a fix or a real error got there first
    if (tracker) tracker.stop();         // nothing is coming; stop asking the receiver
    state = GEO.FAILED;
    lastError = { code: 3, message: 'no first fix' };
    emit();
  }, FIRST_FIX_MS);

  return ok;
}

export function stopTracking() {
  clearDeadline();
  if (tracker) tracker.stop();
  position = null;
  state = GEO.OFF;
  lastError = null;
  emit();
}

/** Point the geofences at the stops of whichever quest is open. */
export function watchStops(pois, radiusM = 500) {
  if (!tracker) return;
  tracker.setFences(pois, radiusM);
}

export function rearmStop(poiId) { tracker?.resetFence(poiId); }
export function disarmStop(poiId) { tracker?.armFence(poiId); }

/**
 * Pretend to be beside a location. Scotland is a long way from most
 * people testing this, and a feature that can only be exercised in the
 * Highlands is a feature that never gets exercised.
 */
export function simulateAt(poi) {
  if (!tracker) return false;
  tracker.simulate(poi, 120);
  return true;
}

/** Metres to a location from the last fix, or null if we have none. */
export function metresTo(poi) {
  if (!position) return null;
  return Math.round(distM(position.lat, position.lon, poi.lat, poi.lon));
}

/** The nearest stop to the current position, for the "you are here" line. */
export function nearestOf(pois) {
  if (!position || !pois.length) return null;
  let best = null, bd = Infinity;
  for (const p of pois) {
    const d = distM(position.lat, position.lon, p.lat, p.lon);
    if (d < bd) { bd = d; best = p; }
  }
  return { poi: best, metres: Math.round(bd) };
}
