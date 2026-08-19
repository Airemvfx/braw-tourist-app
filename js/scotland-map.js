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
