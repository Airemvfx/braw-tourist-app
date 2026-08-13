// ============================================================
// Stylised SVG map of Scotland (no external map libraries).
// Coastline is a deliberately low-poly artistic rendition;
// markers are projected from real lat/lon coordinates.
// ============================================================

import { t, poiName, regionName, cityName } from './i18n.js';

const BOUNDS = { lonMin: -7.4, lonMax: -1.4, latMin: 54.5, latMax: 58.85 };
const W = 560;
const H = 730;

export function project(lon, lat) {
  const x = ((lon - BOUNDS.lonMin) / (BOUNDS.lonMax - BOUNDS.lonMin)) * W;
  const y = ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * H;
  return [x, y];
}

// Mainland coastline, clockwise from Berwick (lon, lat).
const MAINLAND = [
  [-2.03, 55.81], [-2.35, 55.62], [-2.85, 55.30], [-3.05, 54.99], // border to Gretna
  [-3.58, 54.99], [-3.95, 54.77], [-4.40, 54.69], [-4.86, 54.64], // Solway / Galloway
  [-5.00, 54.77], [-5.08, 55.00], [-4.88, 55.05], [-4.65, 55.32], // Rhins & Loch Ryan
  [-4.62, 55.45], [-4.85, 55.65], [-4.92, 55.93],                 // Ayrshire coast
  [-4.45, 55.93], [-4.88, 56.06],                                 // Firth of Clyde notch
  [-5.22, 55.85], [-5.35, 55.85], [-5.55, 55.30], [-5.78, 55.42], // Kintyre down & tip
  [-5.65, 55.95], [-5.45, 56.05], [-5.58, 56.28], [-5.42, 56.45], // Knapdale to Oban
  [-5.75, 56.55], [-6.22, 56.72],                                 // Ardnamurchan Point
  [-5.88, 56.90], [-5.86, 57.05], [-5.55, 57.12], [-5.70, 57.26], // Mallaig & lochs
  [-5.82, 57.36], [-5.68, 57.55], [-5.80, 57.65], [-5.62, 57.74], // Torridon / Gairloch
  [-5.55, 57.86], [-5.18, 57.90], [-5.36, 58.06], [-5.24, 58.26], // Ullapool / Assynt
  [-5.10, 58.45], [-5.00, 58.63],                                 // Cape Wrath
  [-4.70, 58.58], [-4.40, 58.55], [-3.85, 58.60], [-3.35, 58.63], // north coast
  [-3.05, 58.65], [-3.08, 58.40], [-3.40, 58.25], [-3.80, 58.05], // Duncansby to Helmsdale
  [-3.90, 57.95], [-4.08, 57.86], [-3.92, 57.76], [-4.25, 57.58], // firths wiggle
  [-4.00, 57.68], [-3.60, 57.66], [-3.30, 57.72], [-2.75, 57.70], // Moray coast
  [-2.10, 57.70], [-1.78, 57.50], [-1.95, 57.30], [-2.07, 57.15], // Fraserburgh to Aberdeen
  [-2.20, 56.95], [-2.45, 56.70], [-2.75, 56.55], [-2.95, 56.46], // down to Tay
  [-3.10, 56.42], [-2.80, 56.34], [-2.60, 56.28],                 // Fife Ness
  [-2.85, 56.20], [-3.20, 56.07], [-3.55, 56.05],                 // Forth north shore
  [-3.40, 55.99], [-3.10, 55.97], [-2.52, 56.00], [-2.15, 55.92], // Forth south shore
];

const ISLANDS = [
  // Skye
  [[-6.30, 57.70], [-6.65, 57.52], [-6.78, 57.43], [-6.45, 57.33], [-6.32, 57.16], [-5.95, 57.02], [-5.78, 57.25], [-6.10, 57.35], [-6.16, 57.55]],
  // Mull
  [[-6.35, 56.55], [-6.00, 56.64], [-5.76, 56.50], [-5.90, 56.34], [-6.30, 56.30]],
  // Arran
  [[-5.30, 55.72], [-5.14, 55.64], [-5.10, 55.45], [-5.30, 55.43], [-5.40, 55.58]],
  // Islay (decorative)
  [[-6.45, 55.88], [-6.10, 55.92], [-6.04, 55.64], [-6.40, 55.60]],
  // Jura (decorative)
  [[-6.00, 56.00], [-5.74, 55.84], [-5.90, 55.70], [-6.06, 55.88]],
];

function ringPath(points) {
  return points
    .map(([lon, lat], i) => {
      const [x, y] = project(lon, lat);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ') + ' Z';
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

/**
 * Render the map as an SVG string.
 * @param stops  [{ poi, visited, order }] in route order
 * @param start  {name, lat, lon} | null
 * @param userPos {lat, lon, accuracy} | null  — live GPS dot
 */
export function renderMap(stops = [], start = null, userPos = null, opts = {}) {
  const landRings = [ringPath(MAINLAND), ...ISLANDS.map(ringPath)];

  // Route line through start + stops.
  const routePts = [];
  if (start) routePts.push(project(start.lon, start.lat));
  for (const s of stops) routePts.push(project(s.poi.lon, s.poi.lat));
  const routeD = routePts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

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
      <radialGradient id="seaGlow" cx="30%" cy="20%" r="90%">
        <stop offset="0%" stop-color="rgba(62,224,143,0.07)"/>
        <stop offset="55%" stop-color="rgba(96,76,160,0.05)"/>
        <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
      </radialGradient>
      <linearGradient id="landFill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1d2f25"/>
        <stop offset="100%" stop-color="#16241d"/>
      </linearGradient>
      <filter id="markerGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="3.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#seaGlow)"/>
    <g class="map-graticule">
      ${[...Array(7)].map((_, i) => `<line x1="${(i + 1) * (W / 8)}" y1="0" x2="${(i + 1) * (W / 8)}" y2="${H}"/>`).join('')}
      ${[...Array(9)].map((_, i) => `<line x1="0" y1="${(i + 1) * (H / 10)}" x2="${W}" y2="${(i + 1) * (H / 10)}"/>`).join('')}
    </g>

    <text class="sea-label" x="60" y="200" transform="rotate(-12 60 200)">${t('map.atlantic')}</text>
    <text class="sea-label" x="${W - 150}" y="330" transform="rotate(8 ${W - 150} 330)">${t('map.northSea')}</text>

    <g class="map-land">
      ${landRings.map(d => `<path d="${d}"/>`).join('')}
    </g>

    <g class="map-compass" transform="translate(${W - 52},58)">
      <circle r="26" class="compass-ring"/>
      <path d="M0,-20 L5,6 L0,1 L-5,6 Z" class="compass-needle"/>
      <text y="-32" text-anchor="middle" class="compass-n">N</text>
    </g>

    ${routePts.length > 1 ? `<path class="map-route" d="${routeD}" fill="none"/>` : ''}
    ${startMarker}
    <g filter="url(#markerGlow)">${markers}</g>
  </svg>`;
}
