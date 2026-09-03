// ============================================================
// BRAW — "a map of these stops", however it can be drawn.
//
// Three renderers sit behind this, chosen per call:
//
//   Google  — a key exists AND this person has consented. Worldwide.
//   The SVG — the hand-drawn Scotland map. What every visitor gets
//             today, and what they keep getting until both halves of
//             that gate are true.
//   A list  — the itinerary, numbered. Not an error page: it is what a
//             map is when there is no signal, no key, no consent, or a
//             stop that is nowhere near Scotland. It is also genuinely
//             useful, which is why it is the fallback rather than a
//             spinner or an apology.
//
// ---- Why the markup and the mounting are separate ----
//
// renderMap() returns an SVG string and app.js interpolates it straight
// into a template literal, at nineteen sites. Google needs a live DOM
// element and a function call. So this splits the two: mapFrameHTML()
// gives you something to interpolate, mountMap() fills it in afterwards.
// That is the same shape as hydratePhotos(scope) and wireMapMarkers(scope),
// which app.js already calls after every innerHTML replacement, so it
// reads as native rather than as a new idea.
// ============================================================

import {
  renderMap as renderSvgMap, mapKeyHTML, updateUserDot as updateSvgDot,
  mountTerrain, project, unproject, onMap, kmFromScotland, flourishTo, MAP_SIZE,
} from './scotland-map.js';
import {
  openMapViewer, googleMapsUrl, googlePlaceUrl, renderedMapWidth, focusViewerOn,
} from './map-viewer.js';
import { googleEnabled } from './google-config.js';
import { loadMaps, warmGoogle } from './gmaps.js';
import { isCurated } from './places.js';
import { poiName, t } from './i18n.js';

// The projection, the viewer and the key belong to the Scotland
// renderer and have no Google equivalent. They pass straight through so
// that app.js has one place to import map things from.
export {
  mapKeyHTML, mountTerrain, project, unproject, onMap, kmFromScotland,
  flourishTo, MAP_SIZE, openMapViewer, googleMapsUrl, googlePlaceUrl,
  renderedMapWidth, focusViewerOn, warmGoogle,
};

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Which renderer can draw this journey.
 *
 * The SVG map is bounded by Scotland, so it is only offered when every
 * stop is one of ours and actually falls inside the frame. A borrowed
 * place, or a curated one somehow off the map, drops to the list rather
 * than being clamped to the edge — which is what the map used to do, and
 * was indistinguishable from broken.
 */
export function chooseRenderer(stops = [], start = null) {
  if (googleEnabled()) return 'google';
  const points = [...stops.map(s => s.poi || s), start].filter(Boolean);
  const drawable = points.length > 0 && points.every(p =>
    p.id !== undefined ? isCurated(p.id) && onMap(p.lat, p.lon) : onMap(p.lat, p.lon));
  return drawable ? 'svg' : 'list';
}

/** The itinerary as a numbered list — the offline map. */
function itineraryHTML(stops = [], start = null) {
  const rows = stops.map((s, i) => {
    const poi = s.poi || s;
    const n = s.order != null ? s.order : i + 1;
    const visited = s.visited ? ' is-visited' : '';
    return `<li class="mf-stop${visited}"><span class="mf-n">${n}</span>`
      + `<span class="mf-name">${esc(poiName(poi))}</span></li>`;
  }).join('');
  return `<div class="map-fallback">
    ${start ? `<p class="mf-start">${esc(t('trip.from', { start: start.name || '' }))}</p>` : ''}
    <ol class="mf-list">${rows}</ol>
  </div>`;
}

/**
 * Markup for a map. Interpolate it; then call mountMap on the result.
 *
 * The SVG renderer is finished here — it is a string and always was.
 * The other two need a container, and get the itinerary inside it so
 * there is something useful on screen before, and possibly instead of,
 * a map.
 */
export function mapFrameHTML(id, { stops = [], start = null, userPos = null, opts = {} } = {}) {
  const mode = chooseRenderer(stops, start);
  const head = `<div class="map-frame" data-map-frame="${esc(id)}" data-mode="${mode}">`;
  if (mode === 'svg') return `${head}${renderSvgMap(stops, start, userPos, opts)}</div>`;
  return `${head}${itineraryHTML(stops, start)}<div class="map-slot" hidden></div></div>`;
}

/**
 * Fill a frame that needs filling.
 *
 * Safe to call for any mode and for markup that has no frame in it, so
 * callers do not have to know which renderer they got. Returns the mode
 * actually used, which may be worse than the one requested — that is
 * what happens when Google is unreachable, and it is not an error.
 */
export async function mountMap(scope, id, { stops = [], start = null, userPos = null, onStop = null } = {}) {
  const frame = scope && scope.querySelector(`[data-map-frame="${CSS.escape(String(id))}"]`);
  if (!frame) return 'none';
  const mode = frame.dataset.mode;
  if (mode !== 'google') return mode;

  const slot = frame.querySelector('.map-slot');
  const fallback = frame.querySelector('.map-fallback');
  try {
    await loadMaps();
    const gmap = await import('./gmap-render.js');
    slot.hidden = false;
    await gmap.showMap(slot, { stops, start, userPos, onStop });
    if (fallback) fallback.hidden = true;
    frame.dataset.mode = 'google';
    return 'google';
  } catch {
    // No key, no consent, no signal, or Google is down. One answer to
    // all four: show the itinerary and say why, once.
    if (slot) slot.hidden = true;
    if (fallback) fallback.hidden = false;
    frame.dataset.mode = 'list';
    if (!frame.querySelector('.mf-note')) {
      const note = document.createElement('p');
      note.className = 'mf-note';
      note.textContent = t('map.needsConnection');
      frame.appendChild(note);
    }
    return 'list';
  }
}

/** Move the live-location dot, whichever renderer is drawing. */
export function updateUserDot(scope, userPos) {
  const frame = scope && scope.querySelector('[data-map-frame]');
  if (frame && frame.dataset.mode === 'google') {
    import('./gmap-render.js').then(g => (userPos ? g.setUserDot(userPos) : g.clearUserDot()));
    return;
  }
  updateSvgDot(scope, userPos);
}

/** Bring a point into view. The SVG map's flourish, or a Google pan. */
export function focusMapOn(scope, lat, lon, opts = {}) {
  const frame = scope && scope.querySelector('[data-map-frame]');
  if (frame && frame.dataset.mode === 'google') {
    import('./gmap-render.js').then(g => g.focusOn(lat, lon, opts.zoom || 12));
    return;
  }
  flourishTo(scope, lat, lon, opts);
}
