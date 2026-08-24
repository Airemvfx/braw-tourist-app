// ============================================================
// GeoTracker — live GPS location + geofencing engine.
//
// Uses browser Geolocation API (navigator.geolocation.watchPosition).
// Works on localhost and HTTPS. Background tracking is NOT supported
// in this prototype (requires Service Worker + HTTPS in production).
//
// Geofencing: when the user enters the radius of a POI on their
// active trip, onEnterFence() fires once. Fences re-arm when the
// user unmarkes a visited stop, or manually via resetFence().
// ============================================================

/** Haversine distance in metres between two lat/lon pairs. */
export function distM(lat1, lon1, lat2, lon2) {
  const R = 6_371_000;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export class GeoTracker {
  /**
   * @param {object} callbacks
   * @param {(pos: {lat,lon,accuracy,ts}) => void} callbacks.onUpdate  - fired each position fix
   * @param {(poi, distM: number) => void} callbacks.onEnterFence      - fired when inside a POI radius
   * @param {(err: GeolocationPositionError|Error) => void} callbacks.onError
   */
  constructor({ onUpdate = () => {}, onEnterFence = () => {}, onError = () => {} } = {}) {
    this.onUpdate     = onUpdate;
    this.onEnterFence = onEnterFence;
    this.onError      = onError;

    this._watchId  = null;
    this._fences   = [];   // [{ poi, triggered: bool }]
    this.position  = null; // last known position
    this.radiusM   = 500;  // default geofence radius
  }

  /** Replace the active fence set. Call this whenever trip stops change. */
  setFences(pois, radiusM = 500) {
    this.radiusM = radiusM;
    this._fences = pois.map(poi => ({ poi, triggered: false }));
  }

  /** Re-arm a single fence (e.g. when a visit is unmarked). */
  resetFence(poiId) {
    const f = this._fences.find(f => f.poi.id === poiId);
    if (f) f.triggered = false;
  }

  /** Mark a fence as permanently triggered (visited). */
  armFence(poiId) {
    const f = this._fences.find(f => f.poi.id === poiId);
    if (f) f.triggered = true;
  }

  get isTracking() { return this._watchId !== null; }

  /**
   * Request permission + start watching. Returns false if not available.
   *
   * Two requests, not one. A high-accuracy watch waits for a GPS lock,
   * which outdoors takes tens of seconds and indoors may never come —
   * so the first thing asked for is a coarse fix from wifi and cell
   * towers, which usually answers in about a second. That puts a dot on
   * the map almost immediately, and the watch then refines it.
   *
   * The coarse request's failure is deliberately ignored: the watch
   * reports the same problem, and two identical errors would show the
   * user two identical complaints.
   */
  start() {
    if (!navigator.geolocation) {
      this.onError(new Error('Geolocation is not supported by this browser.'));
      return false;
    }
    if (this._watchId !== null) return true; // already running

    navigator.geolocation.getCurrentPosition(
      pos => { if (this._watchId !== null) this._handlePos(pos); },
      () => {},
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 120_000 }
    );

    this._watchId = navigator.geolocation.watchPosition(
      pos  => this._handlePos(pos),
      err  => this.onError(err),
      { enableHighAccuracy: true, maximumAge: 8_000, timeout: 30_000 }
    );
    return true;
  }

  /** Stop watching. Clears the live dot on next render. */
  stop() {
    if (this._watchId !== null) {
      navigator.geolocation.clearWatch(this._watchId);
      this._watchId = null;
    }
    this.position = null;
    this._fences.forEach(f => f.triggered = false);
  }

  /** Get a one-shot position fix (for "jump to my location"). */
  getOnce() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error('No geolocation'));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10_000 });
    });
  }

  // ---- demo / testing ----

  /**
   * Simulate being near a POI (for demo without being in Scotland).
   * Places the user within offsetM metres of the given POI.
   */
  simulate(poi, offsetM = 180) {
    const brng = Math.random() * 2 * Math.PI;
    const d = offsetM / 111_000;
    const lat = poi.lat + d * Math.cos(brng);
    const lon = poi.lon + d * Math.sin(brng) / Math.cos(poi.lat * Math.PI / 180);
    this._handlePos({
      coords: { latitude: lat, longitude: lon, accuracy: 18 },
      timestamp: Date.now(),
    });
  }

  // ---- internal ----

  _handlePos(raw) {
    const { latitude: lat, longitude: lon, accuracy } = raw.coords;
    this.position = { lat, lon, accuracy, ts: raw.timestamp };
    this.onUpdate(this.position);

    for (const fence of this._fences) {
      if (fence.triggered) continue;
      const d = distM(lat, lon, fence.poi.lat, fence.poi.lon);
      if (d <= this.radiusM) {
        fence.triggered = true;
        this.onEnterFence(fence.poi, Math.round(d));
      }
    }
  }
}
