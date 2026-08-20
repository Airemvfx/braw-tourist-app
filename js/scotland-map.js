// ============================================================
// SVG map of Scotland (no external map libraries).
//
// The terrain is real: coastline, land cover, elevation and rivers
// baked into paths by tools/build_terrain.py and imported from
// map-terrain.js. Markers are projected from real lat/lon at runtime
// with the same projection the terrain was baked in, so the two line up.
//
// The terrain lives in ONE hidden sprite that every map instance
// references with <use>. Three maps can be alive at once (showcase,
// trip, builder) and the builder redraws its map on every tap — with
// the paths inlined that would mean re-parsing ~170KB of geometry each
// time. CSS custom properties do reach into <use> shadow content, so
// the sprite still re-themes with the rest of the app.
// ============================================================

import { t, poiName, regionName, cityName } from './i18n.js';
import { TERRAIN } from './map-terrain.js';

const BOUNDS = { lonMin: -7.4, lonMax: -1.4, latMin: 54.5, latMax: 58.85 };
const W = 560;
const H = 730;

export function project(lon, lat) {
  const x = ((lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin)) * W;
  const y = ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * H;
  return [x, y];
}

export const TERRAIN_ID = 'braw-terrain';

/**
 * Put the terrain sprite in the document once. Colours are presentation
 * attributes pointing at custom properties rather than classes, because
 * document CSS selectors do not match inside a <use> shadow tree — but
 * inherited custom properties do reach it.
 */
export function mountTerrain() {
  if (document.getElementById(TERRAIN_ID)) return;
  const layer = (d, attrs) => d ? `<path d="${d}" ${attrs}/>` : '';
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
  host.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>
      <g id="${TERRAIN_ID}">
        ${layer(TERRAIN.land, 'fill="var(--mt-neighbour)" stroke="var(--mt-neighbour-line)" stroke-width="0.7"')}
        ${layer(TERRAIN.scotland, 'fill="var(--mt-land)" stroke="var(--mt-coast)" stroke-width="1.1" stroke-linejoin="round"')}
        ${layer(TERRAIN.relief.e200, 'fill="var(--mt-e200)"')}
        ${layer(TERRAIN.relief.e450, 'fill="var(--mt-e450)"')}
        ${layer(TERRAIN.relief.e750, 'fill="var(--mt-e750)"')}
        ${layer(TERRAIN.cover.forest, 'fill="var(--mt-forest)"')}
        ${layer(TERRAIN.cover.farm, 'fill="var(--mt-farm)"')}
        ${layer(TERRAIN.cover.built, 'fill="var(--mt-built)"')}
        ${layer(TERRAIN.cover.water, 'fill="var(--mt-water)"')}
        ${layer(TERRAIN.rivers, 'fill="none" stroke="var(--mt-river)" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round"')}
        ${layer(TERRAIN.relief.e200, 'fill="none" stroke="var(--mt-contour)" stroke-width="0.45"')}
        ${layer(TERRAIN.relief.e450, 'fill="none" stroke="var(--mt-contour)" stroke-width="0.45"')}
        ${layer(TERRAIN.relief.e750, 'fill="none" stroke="var(--mt-contour-hi)" stroke-width="0.5"')}
      </g>
    </defs></svg>`;
  document.body.appendChild(host);
}

// ---------------------------------------------------------------
// Route geometry
//
// A ruled line between two pins says "data". A road says "journey".
// The route is smoothed through its stops with a Catmull-Rom spline,
// then displaced by fractal value noise sampled at the point's own
// position on the map — so the wander is a property of the ground it
// crosses, not of the route. Two consequences worth having: the same
// route always draws the same line, and adding a stop only changes the
// stretch near it instead of reshuffling the whole thing.
// ---------------------------------------------------------------

// Tuned by rendering the same route across a range and comparing:
// less wander reads as a slightly-bent ruler, more starts to look like
// noise rather than a road, and a tighter noise scale gets jittery.
const NOISE_SCALE = 0.014;   // map px -> noise space; ~70px per lobe
const WANDER = 0.20;         // displacement as a fraction of leg length
const WANDER_MAX = 24;       // ...but never more than this, in map px
const SAMPLES = 16;          // samples per leg

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function vnoise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy), b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1), d = hash2(ix + 1, iy + 1);
  return a * (1 - ux) * (1 - uy) + b * ux * (1 - uy)
       + c * (1 - ux) * uy + d * ux * uy;
}

/** Four octaves of value noise, centred on zero. */
function fbm2(x, y) {
  let v = 0, amp = 0.5, fr = 1;
  for (let o = 0; o < 4; o++) {
    v += (vnoise2(x * fr, y * fr) - 0.5) * amp;
    fr *= 2.03; amp *= 0.5;
  }
  return v * 2.2;
}

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  const c = (a, b, cc, d) =>
    0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2
           + (-a + 3 * b - 3 * cc + d) * t3);
  return [c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])];
}

/**
 * Build the route's `d`. Displacement tapers to zero at every stop, so
 * however much the line wanders in between it still meets each pin
 * exactly where the pin is.
 */
export function routePath(pts) {
  if (pts.length < 2) return '';
  // Phantom end points so the spline has a tangent at the real ends.
  const p = [pts[0], ...pts, pts[pts.length - 1]];
  const out = [];

  for (let i = 1; i < p.length - 2; i++) {
    const legLen = Math.hypot(p[i + 1][0] - p[i][0], p[i + 1][1] - p[i][1]);
    const amp = Math.min(WANDER_MAX, legLen * WANDER);
    const last = i === p.length - 3;

    for (let s = 0; s <= SAMPLES; s++) {
      if (s === SAMPLES && !last) break;         // next leg re-emits this point
      const t = s / SAMPLES;
      const [x, y] = catmull(p[i - 1], p[i], p[i + 1], p[i + 2], t);
      // tangent by a short finite difference, for the perpendicular
      const e = 0.012;
      const [ax, ay] = catmull(p[i - 1], p[i], p[i + 1], p[i + 2], Math.max(0, t - e));
      const [bx, by] = catmull(p[i - 1], p[i], p[i + 1], p[i + 2], Math.min(1, t + e));
      const tx = bx - ax, ty = by - ay;
      const tl = Math.hypot(tx, ty) || 1;
      const taper = Math.pow(Math.sin(Math.PI * t), 0.7);
      const d = fbm2(x * NOISE_SCALE, y * NOISE_SCALE) * amp * taper;
      out.push([x - (ty / tl) * d, y + (tx / tl) * d]);
    }
  }
  return out.map((q, i) => `${i === 0 ? 'M' : 'L'}${q[0].toFixed(1)},${q[1].toFixed(1)}`).join('');
}

/**
 * Move the live location dot without redrawing the map.
 *
 * A GPS fix can arrive every second or two. Re-rendering the whole SVG
 * for each one would throw away the terrain sprite reference, the marker
 * handlers and the route animation just to move one circle, so the dot
 * is patched in place instead.
 */
export function updateUserDot(scope, userPos) {
  const svg = scope && scope.querySelector('svg.scotmap');
  if (!svg) return;
  let g = svg.querySelector('.user-location');

  if (!userPos || !userPos.lat) { if (g) g.remove(); return; }

  const lat = Math.max(BOUNDS.latMin, Math.min(BOUNDS.latMax, userPos.lat));
  const lon = Math.max(BOUNDS.lonMin, Math.min(BOUNDS.lonMax, userPos.lon));
  const [x, y] = project(lon, lat);
  const pxPerM = (W / (BOUNDS.lonMax - BOUNDS.lonMin)) / 111_000;
  const accR = Math.min(40, Math.max(6, (userPos.accuracy || 50) * pxPerM));

  if (!g) {
    g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'user-location');
    g.innerHTML = `<circle class="ul-accuracy"/><circle class="ul-pulse" r="9"/>` +
                  `<circle class="ul-dot" r="5.5"/><title></title>`;
    svg.appendChild(g);           // last child: on top of the route and pins
  }
  g.setAttribute('transform', `translate(${x.toFixed(1)},${y.toFixed(1)})`);
  g.querySelector('.ul-accuracy').setAttribute('r', accR.toFixed(1));
  g.querySelector('title').textContent =
    t('map.yourLocation', { n: Math.round(userPos.accuracy || 0) });

  // Off the edge of Scotland the dot would otherwise sit on the frame
  // pretending to be a position. Say so instead.
  const inBounds = userPos.lat >= BOUNDS.latMin && userPos.lat <= BOUNDS.latMax &&
                   userPos.lon >= BOUNDS.lonMin && userPos.lon <= BOUNDS.lonMax;
  g.classList.toggle('is-offmap', !inBounds);
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Key for the terrain colours. Without it the new greens and ochres are
 * decoration; with it they are information. Swatches are the same custom
 * properties the map itself paints with, so the two can never drift.
 */
export function mapKeyHTML() {
  const keys = [
    ['--mt-land', 'map.key.moor'],
    ['--mt-forest', 'map.key.forest'],
    ['--mt-farm', 'map.key.farm'],
    ['--mt-e750', 'map.key.high'],
    ['--mt-water', 'map.key.water'],
    ['--mt-built', 'map.key.town'],
  ];
  return `
    <ul class="map-key" aria-label="${esc(t('map.key.aria'))}">
      ${keys.map(([token, key]) => `
        <li><i style="background:var(${token})"></i>${esc(t(key))}</li>`).join('')}
    </ul>`;
}

/**
 * Render the map as an SVG string.
 * @param stops  [{ poi, visited, order }] in route order
 * @param start  {name, lat, lon} | null
 * @param userPos {lat, lon, accuracy} | null  — live GPS dot
 */
export function renderMap(stops = [], start = null, userPos = null, opts = {}) {
  // Namespace the defs so two maps can sit in one document — the hero
  // showcase and the trip map would otherwise share ids, and every
  // url(#...) would resolve to whichever parsed first.
  const ns = opts.idSuffix ? `${opts.idSuffix}-` : '';
  mountTerrain();          // idempotent; every caller is safe without ordering

  // Route line through start + stops.
  const routePts = [];
  if (start) routePts.push(project(start.lon, start.lat));
  for (const s of stops) routePts.push(project(s.poi.lon, s.poi.lat));
  const routeD = routePath(routePts);

  const markers = stops
    .map(s => {
      const [x, y] = project(s.poi.lon, s.poi.lat);
      const visited = s.visited;
      return `
      <g class="map-marker ${visited ? 'is-visited' : ''}" data-poi="${s.poi.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(poiName(s.poi))}">
        <circle class="marker-halo" r="13"></circle>
        <circle class="marker-dot" r="9.5"></circle>
        ${visited
          ? `<path class="marker-check" d="M-4,0.5 L-1.2,3.4 L4.4,-3" fill="none" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path>`
          : `<text class="marker-num" y="3.6" text-anchor="middle">${s.order}</text>`}
        <title>${esc(`${s.order}. ${poiName(s.poi)} — ${regionName(s.poi.region)}${visited ? t('map.markerVisited') : ''}`)}</title>
      </g>`;
    })
    .join('');

  // Selectable-but-unselected locations, for the journey builder. Drawn
  // small and dim beneath the route so a filtered map reads as "what is
  // still on offer" without competing with the stops already chosen.
  const candidates = (opts.candidates || [])
    .map(poi => {
      const [x, y] = project(poi.lon, poi.lat);
      return `
      <g class="map-cand" data-cand="${poi.id}" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" tabindex="0" role="button" aria-label="${esc(poiName(poi))}">
        <circle class="cand-hit" r="14"></circle>
        <circle class="cand-dot" r="4.5"></circle>
        <title>${esc(`${poiName(poi)} — ${regionName(poi.region)}`)}</title>
      </g>`;
    })
    .join('');

  const startMarker = start
    ? (() => {
        const [x, y] = project(start.lon, start.lat);
        return `
        <g class="map-start" transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
          <circle r="5.5" class="start-dot"></circle>
          <circle r="11" class="start-ring"></circle>
          <text y="-15" text-anchor="middle" class="start-label">${esc(cityName(start.name).toUpperCase())} · ${t('map.start')}</text>
          <title>${esc(t('map.startTitle', { name: cityName(start.name) }))}</title>
        </g>`;
      })()
    : '';

  // Live user location dot
  const userDot = userPos && userPos.lat
    ? (() => {
        // Clamp to map bounds before projecting
        const clampedLat = Math.max(BOUNDS.latMin, Math.min(BOUNDS.latMax, userPos.lat));
        const clampedLon = Math.max(BOUNDS.lonMin, Math.min(BOUNDS.lonMax, userPos.lon));
        const [ux, uy] = project(clampedLon, clampedLat);
        // accuracy circle radius in SVG units (~pixels per km)
        const pxPerM = (W / (BOUNDS.lonMax - BOUNDS.lonMin)) / 111_000;
        const accR = Math.min(40, Math.max(6, (userPos.accuracy || 50) * pxPerM));
        return `
        <g class="user-location" transform="translate(${ux.toFixed(1)},${uy.toFixed(1)})">
          <circle class="ul-accuracy" r="${accR.toFixed(1)}"/>
          <circle class="ul-pulse" r="9"/>
          <circle class="ul-dot" r="5.5"/>
          <title>${esc(t('map.yourLocation', { n: Math.round(userPos.accuracy || 0) }))}</title>
        </g>`;
      })()
    : '';

  return `
  <svg class="scotmap" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(t('map.aria'))}">
    <defs>
      <radialGradient id="${ns}seaGlow" cx="30%" cy="20%" r="90%">
        <stop offset="0%" stop-color="rgba(62,224,143,0.07)"/>
        <stop offset="55%" stop-color="rgba(96,76,160,0.05)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
      <linearGradient id="${ns}landFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1d2f25"/>
        <stop offset="100%" stop-color="#16241d"/>
      </linearGradient>
      <filter id="${ns}markerGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#${ns}seaGlow)"/>
    <g class="map-graticule">
      ${[...Array(7)].map((_, i) => `<line x1="${(i + 1) * (W / 8)}" y1="0" x2="${(i + 1) * (W / 8)}" y2="${H}"/>`).join('')}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${(i + 1) * (H / 10)}" x2="${W}" y2="${(i + 1) * (H / 10)}"/>`).join('')}
    </g>

    <text class="sea-label" x="60" y="200" transform="rotate(-12 60 200)">${t('map.atlantic')}</text>
    <text class="sea-label" x="${W - 150}" y="330" transform="rotate(8 ${W - 150} 330)">${t('map.northSea')}</text>

    <use href="#${TERRAIN_ID}"/>

    <g class="map-compass" transform="translate(${W - 52},58)">
      <circle r="26" class="compass-ring"/>
      <path d="M0,-20 L5,6 L0,1 L-5,6 Z" class="compass-needle"/>
      <text y="-32" text-anchor="middle" class="compass-n">N</text>
    </g>

    <g class="map-cands">${candidates}</g>

    ${routePts.length > 1 ? `
      <path class="map-route" d="${routeD}" fill="none"/>
      <path class="map-route-trim" d="${routeD}" fill="none" pathLength="100"/>` : ''}
    ${startMarker}
    <g filter="url(#${ns}markerGlow)">${markers}</g>
  </svg>`;
}
