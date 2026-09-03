// A stand-in for the Google Maps JavaScript API.
//
// The suites must never make a billable call, and CI must never hold a
// key. js/gmaps.js opens with `if (window.google?.maps) return` — that
// one line is the whole seam, so injecting this before the app boots is
// enough to exercise every Google path without a network request.
//
// It implements only the surface js/gmap-render.js actually touches,
// and it records every call, because what is worth asserting is the
// call budget: one Map for the session, however many maps were looked
// at, and no Places request on a Scottish trip.
window.__gcalls = { maps: 0, markers: 0, advanced: 0, polylines: 0, fitBounds: 0, panTo: 0 };

class FakeLatLngBounds {
  constructor() { this.points = []; }
  extend(p) { this.points.push(p); return this; }
}

class FakeMarker {
  constructor(opts = {}) {
    window.__gcalls.markers++;
    Object.assign(this, opts);
    this._listeners = {};
  }
  setMap(m) { this.map = m; }
  setPosition(p) { this.position = p; }
  addListener(ev, fn) { (this._listeners[ev] ||= []).push(fn); return { remove() {} }; }
}

class FakeAdvancedMarker extends FakeMarker {
  constructor(opts = {}) { super(opts); window.__gcalls.advanced++; }
}

class FakePolyline extends FakeMarker {
  constructor(opts = {}) { super(opts); window.__gcalls.polylines++; window.__gcalls.markers--; }
}

class FakeMap {
  constructor(el, opts = {}) {
    window.__gcalls.maps++;
    this._el = el;
    this._opts = opts;
    el.setAttribute('data-fake-map', '1');
  }
  getDiv() { return this._el; }
  fitBounds() { window.__gcalls.fitBounds++; }
  setCenter(c) { this._centre = c; }
  setZoom(z) { this._zoom = z; }
  panTo(p) { window.__gcalls.panTo++; this._centre = p; }
}

window.google = {
  maps: {
    Map: FakeMap,
    Marker: FakeMarker,
    Polyline: FakePolyline,
    LatLngBounds: FakeLatLngBounds,
    SymbolPath: { CIRCLE: 'circle' },
    marker: { AdvancedMarkerElement: FakeAdvancedMarker },
  },
};
