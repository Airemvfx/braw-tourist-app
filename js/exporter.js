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
import { allPhotos, photoDataUrl } from './photos.js';

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

const BACKUP_VERSION = 2;

// Past this, a single JSON file stops being a sensible container: the
// string has to be built whole in memory before it can be written, and
// on a phone that is where the tab dies. Above the cap the backup keeps
// the small copies and the user is pointed at the photo-file export,
// which streams a folder instead.
const MAX_INLINE_PHOTO_BYTES = 250 * 1024 * 1024;

/**
 * `photos` may be:
 *   'full'   — everything, print-resolution included (the default)
 *   'thumbs' — small copies only, for a file you can email
 *   'none'   — profile only
 *
 * 'full' is the default because the whole point of this file is that a
 * cleared browser should cost nothing, and a restore that quietly
 * downgraded every photograph to a thumbnail would cost the calendar.
 */
export async function buildBackup(user, { photos = 'full' } = {}) {
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
      eggs: user.eggs,
      lore: user.lore,
    },
    photos: [],
    photoScope: photos,
  };

  if (photos === 'none') return data;

  const rows = await allPhotos(user.id);
  const totalFull = rows.reduce((n, p) => n + (p.bytes || 0), 0);
  const withFull = photos === 'full' && totalFull <= MAX_INLINE_PHOTO_BYTES;
  if (photos === 'full' && !withFull) data.photoScope = 'thumbs';
  data.truncated = photos === 'full' && !withFull;

  // The backup is JSON and JSON cannot hold a Blob, so this is the one
  // place that still wants data URLs — and the only reason
  // photoDataUrl() exists. BACKUP_VERSION deliberately does not change:
  // the file format is exactly what it was, whatever shape the store
  // happens to be in, so files already in the wild keep restoring.
  data.photos = await Promise.all(rows.map(async p => ({
    id: p.id,
    tripId: p.tripId,
    poiId: p.poiId,
    at: p.at,
    w: p.w, h: p.h, bytes: p.bytes,
    thumb: await photoDataUrl(p, 'thumb'),
    full: withFull ? await photoDataUrl(p, 'full') : null,
  })));
  return data;
}

export async function downloadBackup(user, opts) {
  const data = await buildBackup(user, opts);
  const day = new Date().toISOString().slice(0, 10);
  download(`braw-backup-${slug(user.name)}-${day}.json`, JSON.stringify(data));
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
  data.photos = normalisePhotos(data);
  return data;
}

/**
 * Version 1 wrote photographs as { poiId: dataUrl } — one per location,
 * no journey, no separate print copy. Those files are still out there
 * and must still restore, so they are lifted into the current shape
 * here. The single image becomes both renditions and is marked legacy,
 * which is what stops the calendar builder from offering a 1024px
 * picture for an A4 print.
 */
function normalisePhotos(data) {
  const raw = data.photos;
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  return Object.entries(raw).map(([poiId, dataUrl], i) => ({
    id: `ph_v1_${i}_${poiId}`.slice(0, 64),
    tripId: '',
    poiId,
    at: Date.now(),
    w: 0, h: 0, bytes: 0,
    thumb: dataUrl,
    full: dataUrl,
    legacy: true,
  }));
}

/** Counts for the confirmation prompt, so nobody overwrites blind. */
export function backupSummary(data) {
  const p = data.profile;
  const photos = Array.isArray(data.photos) ? data.photos : [];
  return {
    name: p.name,
    trips: p.trips.length,
    xp: p.xp || 0,
    achievements: (p.achievements || []).length,
    photos: photos.length,
    fullRes: photos.filter(x => x.full && !x.legacy).length,
    truncated: Boolean(data.truncated),
    exportedAt: data.exportedAt,
  };
}
