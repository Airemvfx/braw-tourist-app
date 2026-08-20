// ============================================================
// Journey builder — the maths behind the hand-made map editor.
//
// The planner writes a route from a sentence; this writes one from
// whatever the user picks, and answers the three questions that only
// become answerable once stops exist: how far, how long, what to pack.
//
// Pure functions only. Nothing here touches the DOM or the store, so
// the numbers on screen can be recomputed on every tap without cost.
// ============================================================

import { POI_BY_ID, INTERESTS, REGIONS, EQUIPMENT, ADVISORIES } from './data.js';
import { routeTotals, orderByTravel, leg } from './routing.js';

// Hours of daylight-ish touring anyone sensibly does before dinner.
const HOURS_PER_DAY = 8;

/**
 * Turn a dataset dwell time ('2–3 hrs', 'half day', '45 min') into hours.
 * Ranges average; the vaguer labels use the figures a visitor centre
 * would quote. Anything unrecognised falls back to two hours rather
 * than zero, so a typo can never silently shorten a journey.
 */
export function visitHours(poi) {
  const s = String(poi.time || '').toLowerCase();
  if (s.includes('half day')) return 4;
  if (s.includes('full day')) return 8;
  if (s.includes('evening')) return 3;
  const range = s.match(/(\d+(?:\.\d+)?)\s*[–—-]\s*(\d+(?:\.\d+)?)\s*h/);
  if (range) return (parseFloat(range[1]) + parseFloat(range[2])) / 2;
  const hrs = s.match(/(\d+(?:\.\d+)?)\s*h/);
  if (hrs) return parseFloat(hrs[1]);
  const min = s.match(/(\d+)\s*min/);
  if (min) return parseInt(min[1], 10) / 60;
  return 2;
}

/** Shortest-first by real travel time, ferries included. */
export function optimiseOrder(start, pois) {
  return orderByTravel(start, pois);
}

/**
 * Every figure the summary bar shows, for a route in the given order.
 * `days` is what the user has chosen; `daysNeeded` is what the hours
 * actually ask for, so the UI can flag an over-packed schedule.
 */
export function routeStats(pois, start, days = 0) {
  const totals = routeTotals(start, pois);
  const km = totals.km;
  // Real travel time, so a leg with a ferry on it costs what it costs.
  const driveHours = totals.minutes / 60;
  const stopHours = pois.reduce((s, p) => s + visitHours(p), 0);
  const totalHours = driveHours + stopHours;
  const daysNeeded = Math.max(1, Math.ceil(totalHours / HOURS_PER_DAY));
  const useDays = days || daysNeeded;

  return {
    stops: pois.length,
    km,
    mi: Math.round(km * 0.621),
    driveHours,
    stopHours,
    totalHours,
    daysNeeded,
    hoursPerDay: useDays ? totalHours / useDays : totalHours,
    xp: pois.reduce((s, p) => s + p.xp, 0),
    ferries: totals.ferries,
  };
}

/** Kit earned by the tags actually present in the journey. */
export function equipmentFor(pois) {
  const tags = new Set(pois.flatMap(p => p.tags));
  return EQUIPMENT.filter(e => e.always || e.tags.some(tag => tags.has(tag)));
}

/** Warnings and reminders the route has earned. */
export function advisoriesFor(pois, stats) {
  const ctx = {
    tags: new Set(pois.flatMap(p => p.tags)),
    regions: new Set(pois.map(p => p.region)),
    stats,
  };
  return ADVISORIES.filter(a => a.when(ctx));
}

/**
 * Which passport stamps this journey would put within reach — regions
 * where every remaining location is on the route. Counts what the user
 * has already visited elsewhere, so a nearly-finished region shows up
 * as soon as the last stop or two are added.
 */
export function stampPreview(pois, user) {
  const chosen = new Set(pois.map(p => p.id));
  const owned = user?.stamps || {};
  const visitedEverywhere = new Set(
    (user?.trips || []).flatMap(t => Object.keys(t.visited || {}))
  );
  return REGIONS
    .filter(r => !owned[r.name])
    .map(r => {
      const covered = r.poiIds.filter(id => chosen.has(id) || visitedEverywhere.has(id));
      const onRoute = r.poiIds.filter(id => chosen.has(id)).length;
      return { name: r.name, icon: r.icon, onRoute, covered: covered.length, total: r.poiIds.length };
    })
    .filter(r => r.onRoute > 0 && r.covered === r.total);
}

/**
 * Interest keys that best describe a hand-picked set of stops, so the
 * saved journey gets a title and pills like a generated one. Ranked by
 * how many stops each interest accounts for.
 */
export function deriveInterests(pois) {
  const tally = Object.entries(INTERESTS).map(([key, def]) => {
    const tags = new Set(def.tags);
    return { key, n: pois.filter(p => p.tags.some(tag => tags.has(tag))).length };
  });
  return tally
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 3)
    .map(x => x.key);
}

/** Split an ordered id list into the requested number of days. */
export function chunkDays(ids, days) {
  const n = Math.max(1, Math.min(days, ids.length));
  const perDay = Math.ceil(ids.length / n);
  const out = [];
  for (let d = 0; d < n; d++) {
    const stops = ids.slice(d * perDay, (d + 1) * perDay);
    if (stops.length) out.push({ day: out.length + 1, stops });
  }
  return out;
}

/**
 * Assemble a trip in exactly the shape planner.js produces, so a
 * hand-built journey is a first-class quest everywhere else in the app
 * — progress ring, GPS check-ins, XP, achievements and all.
 */
export function buildCustomTrip({ ids, start, days }) {
  const pois = ids.map(id => POI_BY_ID[id]).filter(Boolean);
  const stats = routeStats(pois, start, days);
  const dayBlocks = chunkDays(pois.map(p => p.id), days || stats.daysNeeded);
  const perDay = dayBlocks.length ? pois.length / dayBlocks.length : 0;

  return {
    id: 'trip_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    custom: true,
    prompt: '',
    interests: deriveInterests(pois),
    paceKey: perDay <= 2 ? 'relaxed' : perDay >= 4 ? 'ambitious' : 'steady',
    start,
    days: dayBlocks,
    distanceKm: stats.km,
    distanceMi: stats.mi,
    driveMinutes: Math.round(stats.driveHours * 60),
    ferries: stats.ferries,
    xpOnOffer: stats.xp,
    createdAt: Date.now(),
    visited: {},
    completedAt: null,
  };
}
