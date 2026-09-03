// ============================================================
// BRAW — drawing a journey on Google's map.
//
// ---- One map, moved ----
//
// There is exactly one google.maps.Map for the life of the page, and it
// is moved between containers with appendChild rather than rebuilt.
// This is a cost decision before it is a performance one: three maps can
// be alive at once in this app today — the landing showcase, the trip
// sheet and the builder — and each new Map is a billable load. One
// instance means one load per session however many maps somebody looks
// at.
//
// It constrains the interface: two maps cannot be on screen at the same
// time. That is worth designing around rather than discovering on a bill.
//
// ---- Our pins, their tiles ----
//
// The markers keep BRAW's own look — numbered, amber, gold once visited,
// exactly as the hand-drawn map draws them — because the pins are the
// part somebody recognises. Google supplies the ground underneath and
// nothing else.
// ============================================================

import { GOOGLE } from './google-config.js';
import { loadMaps, mapsReady } from './gmaps.js';
import { poiName } from './i18n.js';

let map = null;          // the single instance
let overlays = [];       // markers and lines belonging to the current view
let userMarker = null;
let onPick = null;       // callback for a tapped stop

const AMBER = '#c98a40';
const GOLD = '#d9b84a';
const INK = '#0e1520';

/** Is a map instance alive? Exposed for the tests. */
export const mapAlive = () => Boolean(map);

/** How many maps have ever been made. The suites assert this stays 1. */
export let mapsCreated = 0;

function pinElement(label, visited) {
  const el = document.createElement('div');
  el.className = `gm-pin${visited ? ' is-visited' : ''}`;
  el.textContent = String(label);
  return el;
}

function clearOverlays() {
  for (const o of overlays) {
    // Markers and polylines both answer to one of these.
    if (typeof o.setMap === 'function') o.setMap(null);
    else if ('map' in o) o.map = null;
  }
  overlays = [];
}

/**
 * Make the map, once.
 *
 * `mapId` is optional. With one, AdvancedMarkerElement is available and
 * the pins can be real DOM. Without one Google refuses advanced markers,
 * so this falls back to the classic Marker with an SVG symbol — the same
 * colours, slightly less control.
 */
async function ensureMap() {
  if (map) return map;
  const maps = mapsReady() ? window.google.maps : await loadMaps();
  const host = document.createElement('div');
  host.className = 'gm-canvas';
  map = new maps.Map(host, {
    center: { lat: 56.8, lng: -4.2 },   // Scotland, until something says otherwise
    zoom: 6,
    mapId: GOOGLE.mapId || undefined,
    disableDefaultUI: true,
    zoomControl: true,
    gestureHandling: 'greedy',
    clickableIcons: false,              // Google's own POIs are not ours to sell
  });
  mapsCreated++;
  return map;
}

const advancedAvailable = maps =>
  Boolean(GOOGLE.mapId && maps.marker && maps.marker.AdvancedMarkerElement);

function addStopMarker(maps, m, { position, label, visited, title, poiId }) {
  let marker;
  if (advancedAvailable(maps)) {
    marker = new maps.marker.AdvancedMarkerElement({
      map: m, position, title, content: pinElement(label, visited),
    });
    marker.addListener('click', () => onPick && onPick(poiId));
  } else {
    marker = new maps.Marker({
      map: m, position, title,
      label: { text: String(label), color: INK, fontWeight: '700', fontSize: '12px' },
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 13,
        fillColor: visited ? GOLD : AMBER,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
    marker.addListener('click', () => onPick && onPick(poiId));
  }
  overlays.push(marker);
  return marker;
}

/**
 * Put the map into `container` and draw this journey on it.
 *
 * Rejects if the script is not available, which is the caller's cue to
 * fall back — there is one degraded path in this app and this is how a
 * caller finds it.
 */
export async function showMap(container, { stops = [], start = null, userPos = null, onStop = null } = {}) {
  const m = await ensureMap();
  const maps = window.google.maps;
  onPick = onStop;

  // Move the single canvas here. The previous holder simply loses it,
  // which is what makes "one map" workable.
  const canvas = m.getDiv();
  if (canvas.parentElement !== container) container.appendChild(canvas);

  clearOverlays();

  const bounds = new maps.LatLngBounds();
  const path = [];

  if (start && Number.isFinite(start.lat) && Number.isFinite(start.lon)) {
    const position = { lat: start.lat, lng: start.lon };
    path.push(position);
    bounds.extend(position);
    overlays.push(new maps.Marker({
      map: m, position, title: start.name || '',
      icon: {
        path: maps.SymbolPath.CIRCLE, scale: 7,
        fillColor: '#4f9e7a', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2,
      },
      zIndex: 1,
    }));
  }

  let n = 0;
  for (const s of stops) {
    const poi = s.poi || s;
    if (!poi || !Number.isFinite(poi.lat) || !Number.isFinite(poi.lon)) continue;
    const position = { lat: poi.lat, lng: poi.lon };
    path.push(position);
    bounds.extend(position);
    addStopMarker(maps, m, {
      position,
      label: s.order != null ? s.order : ++n,
      visited: Boolean(s.visited),
      title: poiName(poi),
      poiId: poi.id,
    });
  }

  if (path.length > 1) {
    overlays.push(new maps.Polyline({
      map: m, path,
      strokeColor: AMBER, strokeOpacity: 0.9, strokeWeight: 3,
    }));
  }

  if (userPos) setUserDot(userPos);

  // A single point would fit to maximum zoom, which is disorienting.
  if (path.length > 1) m.fitBounds(bounds, 48);
  else if (path.length === 1) { m.setCenter(path[0]); m.setZoom(11); }

  return m;
}

/** The live-location dot. Kept apart from the route so a fix does not redraw it. */
export function setUserDot(pos) {
  if (!map || !pos || !window.google) return;
  const maps = window.google.maps;
  const position = { lat: pos.lat, lng: pos.lon ?? pos.lng };
  if (!Number.isFinite(position.lat) || !Number.isFinite(position.lng)) return;
  if (userMarker) { userMarker.setPosition(position); return; }
  userMarker = new maps.Marker({
    map, position, zIndex: 999, title: 'You',
    icon: {
      path: maps.SymbolPath.CIRCLE, scale: 8,
      fillColor: '#4aa3ff', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 3,
    },
  });
}

export function clearUserDot() {
  if (userMarker) { userMarker.setMap(null); userMarker = null; }
}

/** Move the view to a point — used when a location fix lands. */
export function focusOn(lat, lon, zoom = 12) {
  if (!map) return;
  map.panTo({ lat, lng: lon });
  map.setZoom(zoom);
}

/** Let go of everything for this view. The map instance itself survives. */
export function releaseMap() {
  clearOverlays();
  clearUserDot();
  onPick = null;
}
