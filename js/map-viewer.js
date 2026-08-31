// ============================================================
// BRAW — the map, full screen, with pan and zoom.
//
// The map elsewhere in the app is a picture: the right size to glance
// at, too small to study. This is the same map given the whole screen
// and the ability to move around it, which is what you want when six
// stops are stacked on top of each other in the Central Belt.
//
// ---- How the zoom works ----
//
// By rewriting the SVG's viewBox, not by CSS-scaling the element. Two
// reasons that matters:
//
//   * The map stays vector-sharp at any magnification. A CSS transform
//     on a rasterised layer would not.
//   * It lets markers be handled separately from terrain. Everything
//     carrying data-mx/data-my is given a counter-scale, so pins and
//     place names keep their size on screen while the land grows
//     underneath them.
//
// That second point is the whole reason for zooming. Scale the map
// uniformly and two pins that overlap at rest still overlap at 8×,
// because they grow along with the gap between them. Counter-scaling
// is what actually pulls a crowded region apart.
// ============================================================

import { project, unproject, onMap, MAP_SIZE } from './scotland-map.js';
import { t, poiName, poiBlurb, regionName, poiTime } from './i18n.js';
import { getPlace } from './places.js';

const { W, H } = MAP_SIZE;

// The lower bound is not a constant: "as far out as it goes" means
// the whole map on screen, which depends on the shape of the window.
// See fitZoom(). The upper bound is absolute.
const MAX_ZOOM = 14;
// Below this, a pointer that moved is still a tap. Fingers are never
// quite still, and without a little slack every tap on a pin would be
// swallowed as a one-pixel drag.
const DRAG_SLOP = 7;

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

let host = null;      // the overlay element, while open
let svg = null;
let vb = null;        // { x, y, w, h }
let onClose = null;

// ------------------------------------------------------------------
// Geometry
//
// The viewBox is shaped to the screen, not to the map. Left at the
// map's own 560×730, a phone showing the whole country wastes about
// four tenths of its display on empty sea above and below, because a
// portrait map letterboxed into a much taller portrait screen fits by
// width and leaves the rest. Matching the screen's proportions means
// every pixel is map.
//
// Zoom 1 is therefore not "the whole map" — that depends on the shape
// of the window — so `fitZoom()` works it out and the readout is shown
// relative to it. Otherwise a desktop would open reading 51%.
// ------------------------------------------------------------------

const zoomOf = () => W / vb.w;

function stageAspect() {
  const r = host.querySelector('.mv-stage').getBoundingClientRect();
  return (r.width && r.height) ? r.width / r.height : W / H;
}

/** The largest zoom at which the whole map is still visible. */
function fitZoom() {
  const a = stageAspect();
  return Math.min(1, W / (a * H));
}

/** Centre the view on a point at a given zoom, shaped to the screen. */
function setView(cx, cy, z) {
  const a = stageAspect();
  const zz = Math.max(fitZoom(), Math.min(MAX_ZOOM, z));
  const w = W / zz;
  const h = w / a;
  vb = { x: cx - w / 2, y: cy - h / 2, w, h };
}

/** Keep the middle of the view somewhere on the map. */
function clampPan() {
  vb.x = Math.max(-vb.w / 2, Math.min(W - vb.w / 2, vb.x));
  vb.y = Math.max(-vb.h / 2, Math.min(H - vb.h / 2, vb.y));
}

/**
 * Frame a box of map coordinates, with room to breathe around it.
 * Used to open on the journey rather than on the whole country — a two
 * day trip round Aberdeenshire should not open over the North Sea.
 */
function fitBox(box, pad = 0.16) {
  const a = stageAspect();
  const w = Math.max(box.w, 1) * (1 + pad * 2);
  const h = Math.max(box.h, 1) * (1 + pad * 2);
  const z = Math.min(W / w, W / (a * h));
  setView(box.x + box.w / 2, box.y + box.h / 2, z);
}

function apply() {
  clampPan();
  svg.setAttribute('viewBox', `${vb.x.toFixed(2)} ${vb.y.toFixed(2)} ${vb.w.toFixed(2)} ${vb.h.toFixed(2)}`);

  const z = zoomOf();
  // Recorded on the element so anything patching the map later — the
  // live GPS dot, which redraws on every fix — can rebuild a transform
  // with the counter-scale still applied.
  svg.dataset.zoom = z.toFixed(4);
  const inv = (1 / z).toFixed(4);
  for (const g of svg.querySelectorAll('[data-mx]')) {
    g.setAttribute('transform', `translate(${g.dataset.mx},${g.dataset.my}) scale(${inv})`);
  }

  // Shown against "the whole map", which is what a reader means by 100%.
  const fit = fitZoom();
  const label = host.querySelector('.mv-zoom');
  if (label) label.textContent = `${Math.round((z / fit) * 100)}%`;
  host.querySelector('.mv-in').disabled = z >= MAX_ZOOM - 0.001;
  host.querySelector('.mv-out').disabled = z <= fit + 0.001;

  // Kept current on every view change rather than patched on click, so
  // that copying the link, middle-clicking it, or opening it in a new
  // tab all get where you are now — not where you were when it opened.
  const gmaps = host.querySelector('.mv-gmaps');
  if (gmaps) gmaps.href = currentGoogleUrl();
}

/**
 * How wide the map actually draws, in screen pixels.
 *
 * Not the same as the container: preserveAspectRatio letterboxes a
 * 560×730 portrait map inside a landscape window, so most of a wide
 * stage is empty. Measuring the container instead would put Google
 * Maps roughly one zoom level too close.
 */
export function renderedMapWidth(el, boxW = W, boxH = H) {
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return 800;
  return boxW * Math.min(r.width / boxW, r.height / boxH);
}

/** A client point in the map's own coordinates. */
function toMap(clientX, clientY) {
  const m = svg.getScreenCTM();
  if (!m) return { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 };
  const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
  return { x: p.x, y: p.y };
}

/**
 * Zoom by `factor`, holding the point under the cursor still.
 *
 * Without the focal point a pinch drifts away from whatever you were
 * looking at, which on a map is the difference between examining a
 * place and chasing it around the screen.
 */
function zoomBy(factor, clientX, clientY) {
  const z = zoomOf();
  const next = Math.max(fitZoom(), Math.min(MAX_ZOOM, z * factor));
  if (Math.abs(next - z) < 0.0001) return;

  const focus = (clientX === undefined)
    ? { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2 }
    : toMap(clientX, clientY);

  const w = W / next;
  const h = w / stageAspect();
  vb.x = focus.x - ((focus.x - vb.x) * w) / vb.w;
  vb.y = focus.y - ((focus.y - vb.y) * h) / vb.h;
  vb.w = w; vb.h = h;
  apply();
}

/** Back to the whole map. */
function reset() {
  setView(W / 2, H / 2, fitZoom());
  apply();
}

/**
 * Glide the view to a point instead of jumping to it.
 *
 * A cut leaves you asking where you have been put; watching the map
 * travel there answers it on the way. Eased in and out, and short —
 * this is a transition, not a scenic flight.
 */
let flight = null;

function flyTo(cx, cy, zoom, ms = 900) {
  if (!host) return;
  if (flight) cancelAnimationFrame(flight);

  const from = { x: vb.x + vb.w / 2, y: vb.y + vb.h / 2, z: zoomOf() };
  const to = { x: cx, y: cy, z: Math.max(fitZoom(), Math.min(MAX_ZOOM, zoom)) };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setView(to.x, to.y, to.z);
    apply();
    return;
  }

  const start = performance.now();
  const step = now => {
    const p = Math.min(1, (now - start) / ms);
    const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    // Zoom is interpolated geometrically: doubling is one step whether
    // it happens at 2x or at 12x, so the movement feels even throughout.
    const z = from.z * Math.pow(to.z / from.z, e);
    setView(from.x + (to.x - from.x) * e, from.y + (to.y - from.y) * e, z);
    apply();
    flight = p < 1 ? requestAnimationFrame(step) : null;
  };
  flight = requestAnimationFrame(step);
}

/** Centre the open viewer on a real position, if it has one on the map. */
export function focusViewerOn(lat, lon, zoom = 6) {
  if (!host || !onMap(lat, lon)) return false;
  const [x, y] = project(lon, lat);
  flyTo(x, y, zoom);
  return true;
}

// ------------------------------------------------------------------
// Google Maps
// ------------------------------------------------------------------

/**
 * Where we are, expressed the way Google Maps expects.
 *
 * Its zoom is defined against a 256px world tile, so the level that
 * shows the same span of longitude across the same number of screen
 * pixels is log2(px * 360 / (256 * degrees)). Our own map is a
 * stylised drawing rather than a projection Google shares, so this
 * lands in the right place at roughly the right scale rather than
 * matching pixel for pixel — which is what "or close enough" means
 * here, and why the button says "open", not "mirror".
 */
export function googleMapsUrl(centreLon, centreLat, lonSpan, viewportPx) {
  const z = Math.log2((viewportPx * 360) / (256 * Math.max(lonSpan, 1e-6)));
  const clamped = Math.max(3, Math.min(19, z));
  return `https://www.google.com/maps/@${centreLat.toFixed(5)},${centreLon.toFixed(5)},${clamped.toFixed(2)}z`;
}

/**
 * A single place, dropped as a pin rather than a bare position.
 *
 * Searched by coordinates rather than by name: our names are the ones
 * the app uses, and Google's are its own. "Loch Leven Castle" finds
 * several. The coordinates find exactly the one meant.
 */
export function googlePlaceUrl(lat, lon) {
  const q = encodeURIComponent(`${lat.toFixed(5)},${lon.toFixed(5)}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

/** The URL for whatever the viewer is currently showing. */
function currentGoogleUrl() {
  const [lon, lat] = unproject(vb.x + vb.w / 2, vb.y + vb.h / 2);
  const [lonA] = unproject(vb.x, 0);
  const [lonB] = unproject(vb.x + vb.w, 0);
  const stage = host.querySelector('.mv-stage');
  return googleMapsUrl(lon, lat, Math.abs(lonB - lonA), renderedMapWidth(stage, vb.w, vb.h));
}

// ------------------------------------------------------------------
// The info card
// ------------------------------------------------------------------

function showInfo(poiId) {
  const poi = getPlace(poiId);
  const card = host.querySelector('.mv-info');
  if (!poi) { card.hidden = true; return; }

  svg.querySelectorAll('.is-active').forEach(n => n.classList.remove('is-active'));
  svg.querySelectorAll(`[data-poi="${poiId}"], [data-cand="${poiId}"]`)
    .forEach(n => n.classList.add('is-active'));

  card.hidden = false;
  card.innerHTML = `
    <button type="button" class="mv-info-close" aria-label="${esc(t('common.close'))}">✕</button>
    <h3>${poi.icon} ${esc(poiName(poi))}</h3>
    <div class="mv-info-meta">${esc(regionName(poi.region))} · ${esc(poiTime(poi.time))} · ✦ ${poi.xp} ${t('unit.xp')}</div>
    <p>${esc(poiBlurb(poi))}</p>
    <a class="btn btn-ghost btn-sm" target="_blank" rel="noopener"
       href="${googlePlaceUrl(poi.lat, poi.lon)}">${t('map.openHere')}</a>`;

  card.querySelector('.mv-info-close').addEventListener('click', () => {
    card.hidden = true;
    svg.querySelectorAll('.is-active').forEach(n => n.classList.remove('is-active'));
  });
}

// ------------------------------------------------------------------
// Open / close
// ------------------------------------------------------------------

/**
 * @param html      an SVG string from renderMap()
 * @param title     what is being looked at
 * @param focus     optional {x,y,w,h} in map coordinates to open on
 * @param onPicked  optional, called with a poiId when one is tapped
 */
export function openMapViewer({ html, title = '', focus = null, onPicked = null } = {}) {
  closeMapViewer();

  host = document.createElement('div');
  host.className = 'mapfs';
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-label', t('map.fullscreen'));
  host.innerHTML = `
    <div class="mv-stage"></div>
    <header class="mv-top">
      <span class="mv-title">${esc(title)}</span>
      <button type="button" class="mv-close icon-btn" aria-label="${esc(t('common.close'))}">✕</button>
    </header>
    <div class="mv-tools">
      <button type="button" class="mv-btn mv-in" aria-label="${esc(t('map.zoomIn'))}" title="${esc(t('map.zoomIn'))}">＋</button>
      <span class="mv-zoom" aria-live="off">100%</span>
      <button type="button" class="mv-btn mv-out" aria-label="${esc(t('map.zoomOut'))}" title="${esc(t('map.zoomOut'))}">−</button>
      <button type="button" class="mv-btn mv-reset" aria-label="${esc(t('map.zoomReset'))}" title="${esc(t('map.zoomReset'))}">⤾</button>
      <a class="mv-btn mv-gmaps" target="_blank" rel="noopener" href="#"
         aria-label="${esc(t('map.google'))}" title="${esc(t('map.google'))}">🌍</a>
    </div>
    <p class="mv-hint">${esc(t('map.fullscreenHint'))}</p>
    <div class="mv-info" hidden></div>`;

  host.querySelector('.mv-stage').innerHTML = html;
  document.body.appendChild(host);
  document.body.classList.add('mapfs-open');

  svg = host.querySelector('svg.scotmap');
  // The viewBox is already shaped to the stage, so this changes nothing
  // while the two agree. It matters in the instant between a window
  // resize and the reframe below: `slice` fills the stage by cropping,
  // where the default would letterbox and flash empty bars.
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');

  if (focus) fitBox(focus); else setView(W / 2, H / 2, fitZoom());
  apply();

  wire(onPicked);
  host.querySelector('.mv-close').focus();
  return host;
}

export function closeMapViewer() {
  if (!host) return;
  if (flight) { cancelAnimationFrame(flight); flight = null; }
  host.remove();
  document.body.classList.remove('mapfs-open');
  host = null; svg = null; vb = null;
  if (onClose) { const fn = onClose; onClose = null; fn(); }
}

export const mapViewerOpen = () => Boolean(host);

// ------------------------------------------------------------------
// Input
// ------------------------------------------------------------------

function wire(onPicked) {
  const stage = host.querySelector('.mv-stage');

  host.querySelector('.mv-close').addEventListener('click', () => closeMapViewer());
  host.querySelector('.mv-in').addEventListener('click', () => zoomBy(1.6));
  host.querySelector('.mv-out').addEventListener('click', () => zoomBy(1 / 1.6));
  host.querySelector('.mv-reset').addEventListener('click', reset);

  document.addEventListener('keydown', onKey);

  // Turning a phone sideways changes the shape the viewBox has to match.
  // Keep where you were looking and how close you were; only reshape.
  const onResize = () => {
    if (!host) return;
    setView(vb.x + vb.w / 2, vb.y + vb.h / 2, zoomOf());
    apply();
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  onClose = () => {
    document.removeEventListener('keydown', onKey);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('orientationchange', onResize);
  };

  // ---- pointers: one drags, two pinch ----
  const active = new Map();
  let moved = 0;
  let last = null;      // single-pointer drag anchor
  let pinch = null;     // { dist, cx, cy }
  let captured = null;  // pointerId, once a real drag has started

  /**
   * Capture is taken only once the pointer is actually dragging, never
   * on pointerdown.
   *
   * With capture held, the browser dispatches the following `click` at
   * the capturing element rather than at what was under the finger — so
   * capturing eagerly meant every tap on a pin arrived as a tap on the
   * empty stage, and nothing ever opened. Waiting until a drag begins
   * keeps taps addressed to the pin, and still stops a drag from
   * escaping when the finger crosses the toolbar.
   */
  const takeCapture = id => {
    if (captured !== null) return;
    try { stage.setPointerCapture(id); captured = id; } catch { /* pointer already gone */ }
  };

  stage.addEventListener('pointerdown', e => {
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (active.size === 1) { last = { x: e.clientX, y: e.clientY }; pinch = null; }
    else if (active.size === 2) { last = null; pinch = pinchState(active); takeCapture(e.pointerId); }
  });

  stage.addEventListener('pointermove', e => {
    if (!active.has(e.pointerId)) return;
    active.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (active.size >= 2 && pinch) {
      const next = pinchState(active);
      if (next.dist > 0 && pinch.dist > 0) {
        zoomBy(next.dist / pinch.dist, next.cx, next.cy);
        // Let the fingers drag the map as well as scale it.
        panByClient(next.cx - pinch.cx, next.cy - pinch.cy, stage);
      }
      pinch = next;
      moved = DRAG_SLOP + 1;
      return;
    }

    if (!last) return;
    const dx = e.clientX - last.x;
    const dy = e.clientY - last.y;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > DRAG_SLOP) takeCapture(e.pointerId);
    panByClient(dx, dy, stage);
    last = { x: e.clientX, y: e.clientY };
  });

  const release = e => {
    active.delete(e.pointerId);
    if (captured === e.pointerId) {
      try { stage.releasePointerCapture(e.pointerId); } catch { /* already released */ }
      captured = null;
    }
    if (active.size < 2) pinch = null;
    if (active.size === 1) {
      const [only] = [...active.values()];
      last = { x: only.x, y: only.y };
    }
    if (active.size === 0) last = null;
  };
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);

  // A drag that ends on a pin must not read as tapping it.
  stage.addEventListener('click', e => {
    if (moved > DRAG_SLOP) return;
    const hit = e.target.closest('[data-poi], [data-cand]');
    if (!hit) return;
    const id = hit.dataset.poi || hit.dataset.cand;
    showInfo(id);
    onPicked?.(id);
  });

  stage.addEventListener('dblclick', e => {
    e.preventDefault();
    zoomBy(1.9, e.clientX, e.clientY);
  });

  stage.addEventListener('wheel', e => {
    e.preventDefault();
    // Trackpads report small deltas continuously and mice report one
    // large notch, so the exponent keeps both feeling the same speed.
    zoomBy(Math.exp(-e.deltaY * 0.0016), e.clientX, e.clientY);
  }, { passive: false });
}

function pinchState(active) {
  const [a, b] = [...active.values()];
  return {
    dist: Math.hypot(b.x - a.x, b.y - a.y),
    cx: (a.x + b.x) / 2,
    cy: (a.y + b.y) / 2,
  };
}

/**
 * Move by a screen delta.
 *
 * The scale is read from the element's own transform rather than worked
 * out from the rectangles: that is what the browser is actually using,
 * so the map cannot slide faster or slower than the finger holding it.
 */
function panByClient(dxClient, dyClient, stage) {
  const m = svg.getScreenCTM();
  const scale = (m && m.a) || (stage.getBoundingClientRect().width / vb.w) || 1;
  vb.x -= dxClient / scale;
  vb.y -= dyClient / scale;
  apply();
}

function onKey(e) {
  if (!host) return;
  if (e.key === 'Escape') { closeMapViewer(); return; }
  if (e.key === '+' || e.key === '=') { zoomBy(1.6); return; }
  if (e.key === '-' || e.key === '_') { zoomBy(1 / 1.6); return; }
  if (e.key === '0') { reset(); return; }

  const step = vb.w * 0.18;
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
  const m = moves[e.key];
  if (m) { e.preventDefault(); vb.x += m[0]; vb.y += m[1]; apply(); }
}
