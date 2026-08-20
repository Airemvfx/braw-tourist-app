// ============================================================
// Travel between two places.
//
// Reads the baked matrix in road-graph.js, which was searched over the
// real land mask and real elevation rather than measured straight
// through hills and open water. Falls back to the old straight-line
// estimate only for a pair the matrix does not know — nothing in the
// shipped dataset, but the app should not break if one is added before
// the matrix is rebuilt.
//
// Honest about its limits: it is a cost surface, not a road network.
// See tools/build_routes.py for how it is built and how far off it is.
// ============================================================

import { NODES, MINUTES, KM, FERRY_PAIRS, FERRIES } from './road-graph.js';

// Local copy rather than importing from planner.js: planner imports this
// module, and a cycle between them only works by accident of hoisting.
const KM_PER_DEG = 111;
function straightKm(a, b) {
  const dLat = (a.lat - b.lat) * KM_PER_DEG;
  const dLon = (a.lon - b.lon) * KM_PER_DEG * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(dLat, dLon);
}

const N = NODES.length;
const INDEX = new Map(NODES.map((n, i) => [n, i]));

/** Matrix key for a place: a POI object, a start city, or an id string. */
export function nodeKey(place) {
  if (!place) return null;
  if (typeof place === 'string') return place;
  if (place.id) return `poi:${place.id}`;
  if (place.name) return `city:${place.name.toLowerCase()}`;
  return null;
}

function pairIndex(i, j) {
  const [a, b] = i < j ? [i, j] : [j, i];
  return a * N - (a * (a + 1)) / 2 + (b - a - 1);
}

/**
 * @returns {{km:number, minutes:number, ferries:string[], estimated:boolean}}
 *   `estimated` marks the straight-line fallback, so the UI can say so.
 */
export function leg(from, to) {
  const i = INDEX.get(nodeKey(from));
  const j = INDEX.get(nodeKey(to));

  if (i === undefined || j === undefined || i === j) {
    if (i === j && i !== undefined) return { km: 0, minutes: 0, ferries: [], estimated: false };
    // Unknown pair: the old heuristic, flagged as the guess it is.
    const km = Math.round(straightKm(from, to) * 1.3);
    return { km, minutes: Math.round((km / 60) * 60), ferries: [], estimated: true };
  }

  const k = pairIndex(i, j);
  const [a, b] = i < j ? [i, j] : [j, i];
  const tag = FERRY_PAIRS[`${a},${b}`];
  return {
    km: KM[k],
    minutes: MINUTES[k],
    ferries: tag ? tag.split(',').filter(Boolean) : [],
    estimated: false,
  };
}

/** Totals for a whole route, start city first. */
export function routeTotals(start, pois) {
  let km = 0, minutes = 0, estimated = false;
  const ferries = new Set();
  let cursor = start;
  for (const p of pois) {
    const l = leg(cursor, p);
    km += l.km;
    minutes += l.minutes;
    estimated = estimated || l.estimated;
    l.ferries.forEach(f => ferries.add(f));
    cursor = p;
  }
  return { km, minutes, ferries: [...ferries], estimated };
}

/** Details of a crossing, for the itinerary and the advisories. */
export function ferryInfo(id) { return FERRIES[id] || null; }

/** Every crossing a route uses, as objects rather than ids. */
export function ferriesFor(start, pois) {
  return routeTotals(start, pois).ferries.map(id => ({ id, ...FERRIES[id] })).filter(f => f.name);
}

/**
 * Order stops by quickest travel rather than by crow-flies distance, so
 * a route with an island on it visits it in one go instead of hopping
 * back and forth across the water.
 */
export function orderByTravel(start, pois) {
  const remaining = [...pois];
  const route = [];
  let cursor = start;
  while (remaining.length) {
    let best = 0, bestMin = Infinity;
    remaining.forEach((p, idx) => {
      const m = leg(cursor, p).minutes;
      if (m < bestMin) { bestMin = m; best = idx; }
    });
    cursor = remaining.splice(best, 1)[0];
    route.push(cursor);
  }
  return route;
}
