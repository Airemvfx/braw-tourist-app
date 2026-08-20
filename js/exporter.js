// ============================================================
// Getting your data out.
//
// Two different jobs, deliberately separate:
//
//   * GPX / GeoJSON — the route itself, to open in a sat-nav, Garmin,
//     OsmAnd, Komoot or Google Earth. This is the file you take with you.
//   * Backup — everything the app knows about you, as one JSON file you
//     can move to another device or keep. Progress lives in this browser
//     and nowhere else, so without this a cleared cache is a total loss.
//
// Photographs are held in IndexedDB and can run to megabytes, so the
// backup carries them only when asked for.
// ============================================================

import { POI_BY_ID } from './data.js';
import { poiName, poiBlurb, regionName, cityName } from './i18n.js';
import { tripStopIds, tripTitle } from './planner.js';
import { listPhotoIds, getPhoto } from './photos.js';

const xml = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** Trigger a download without leaving the page. */
export function download(filename, text, mime = 'application/json') {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick: Safari needs the object URL to outlive the click.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

/**
 * GPX 1.1: every stop as a waypoint, plus the journey as an ordered
 * route. Waypoints are what a handheld GPS shows; the route is what a
 * sat-nav follows. Both, because different devices want different things.
 */
export function tripToGPX(trip) {
  const stops = tripStopIds(trip).map(id => POI_BY_ID[id]).filter(Boolean);
  const when = new Date(trip.createdAt || Date.now()).toISOString();

  const wpts = stops.map((p, i) => `  <wpt lat="${p.lat}" lon="${p.lon}">
    <name>${xml(`${i + 1}. ${poiName(p)}`)}</name>
    <desc>${xml(`${regionName(p.region)} — ${poiBlurb(p)}`)}</desc>
    <sym>Flag, Blue</sym>
  </wpt>`).join('\n');

  const start = trip.start
    ? `  <wpt lat="${trip.start.lat}" lon="${trip.start.lon}">
    <name>${xml(cityName(trip.start.name))}</name>
    <sym>Flag, Green</sym>
  </wpt>\n`
    : '';

  const rtepts = [
    ...(trip.start ? [{ lat: trip.start.lat, lon: trip.start.lon, name: cityName(trip.start.name) }] : []),
    ...stops.map((p, i) => ({ lat: p.lat, lon: p.lon, name: `${i + 1}. ${poiName(p)}` })),
  ].map(p => `    <rtept lat="${p.lat}" lon="${p.lon}"><name>${xml(p.name)}</name></rtept>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="BRAW" xmlns="http://www.topografix.com/GPX/1/1"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${xml(tripTitle(trip))}</name>
    <desc>${xml(`${stops.length} stops · ${trip.distanceKm} km`)}</desc>
    <time>${when}</time>
  </metadata>
${start}${wpts}
  <rte>
    <name>${xml(tripTitle(trip))}</name>
${rtepts}
  </rte>
</gpx>`;
}

/** GeoJSON: the same journey for anything that reads map data. */
export function tripToGeoJSON(trip) {
  const stops = tripStopIds(trip).map(id => POI_BY_ID[id]).filter(Boolean);
  const line = [
    ...(trip.start ? [[trip.start.lon, trip.start.lat]] : []),
    ...stops.map(p => [p.lon, p.lat]),
  ];
  return JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: line },
        properties: { name: tripTitle(trip), distanceKm: trip.distanceKm, stops: stops.length },
      },
      ...stops.map((p, i) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
        properties: {
          order: i + 1, name: poiName(p), region: regionName(p.region),
          time: p.time, xp: p.xp, visited: !!trip.visited[p.id],
        },
      })),
    ],
  }, null, 2);
}

export function downloadTripGPX(trip) {
  download(`braw-${slug(tripTitle(trip))}.gpx`, tripToGPX(trip), 'application/gpx+xml');
}

export function downloadTripGeoJSON(trip) {
  download(`braw-${slug(tripTitle(trip))}.geojson`, tripToGeoJSON(trip), 'application/geo+json');
}

// ------------------------------------------------------------------
// Whole-profile backup
// ------------------------------------------------------------------

const BACKUP_VERSION = 1;

export async function buildBackup(user, { photos = true } = {}) {
  const data = {
    format: 'braw-backup',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      createdAt: user.createdAt,
      xp: user.xp,
      achievements: user.achievements,
      trips: user.trips,
      activity: user.activity,
      stamps: user.stamps,
      game: user.game,
    },
    photos: {},
  };
  if (photos) {
    for (const id of await listPhotoIds(user.name)) {
      const dataUrl = await getPhoto(user.name, id);
      if (dataUrl) data.photos[id] = dataUrl;
    }
  }
  return data;
}

export async function downloadBackup(user, opts) {
  const data = await buildBackup(user, opts);
  const day = new Date().toISOString().slice(0, 10);
  download(`braw-backup-${slug(user.name)}-${day}.json`, JSON.stringify(data, null, 2));
  return data;
}

/**
 * Validate a backup before anything is written. Restoring is destructive,
 * so a malformed file must fail loudly here rather than half-way through.
 */
export function readBackup(text) {
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error('notJson'); }
  if (!data || data.format !== 'braw-backup') throw new Error('notBackup');
  if (!(data.version <= BACKUP_VERSION)) throw new Error('tooNew');
  const p = data.profile;
  if (!p || typeof p.name !== 'string' || !Array.isArray(p.trips)) throw new Error('notBackup');
  return data;
}

/** Counts for the confirmation prompt, so nobody overwrites blind. */
export function backupSummary(data) {
  const p = data.profile;
  return {
    name: p.name,
    trips: p.trips.length,
    xp: p.xp || 0,
    achievements: (p.achievements || []).length,
    photos: Object.keys(data.photos || {}).length,
    exportedAt: data.exportedAt,
  };
}
