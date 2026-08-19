// ============================================================
// The "AI" trip planner (prototype heuristic engine):
//  1. parse free-text wishes → interests, duration, pace, start, region bias
//  2. score every POI against the request
//  3. pick stops, order them with nearest-neighbour routing
//  4. chunk into days
// Swappable later for a real LLM + routing API.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, START_CITIES, REGION_HINTS } from './data.js';
import { t as translate } from './i18n.js';

const KM_PER_DEG = 111;

export function distKm(a, b) {
  const dLat = (a.lat - b.lat) * KM_PER_DEG;
  const dLon = (a.lon - b.lon) * KM_PER_DEG * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(dLat, dLon);
}

/**
 * Fold text to bare ASCII words so Polish input matches the keyword
 * lists whether or not the user typed the diacritics. NFD splits most
 * accents into combining marks we can drop; 'ł' has no decomposition
 * so it is mapped explicitly.
 */
function normalise(text) {
  return ` ${String(text)
    .toLowerCase()
    .replace(/ł/g, 'l')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

export function parsePrompt(text) {
  const t = normalise(text);
  const has = w => t.includes(` ${normalise(w).trim()} `);

  // interests
  const interests = [];
  for (const [key, def] of Object.entries(INTERESTS)) {
    if (def.words.some(w => has(w) || has(`${w}s`))) interests.push(key);
  }

  // duration — English and Polish day/night/week wording
  let days = 5;
  const m = t.match(/(\d+)\s*(?:days?|nights?|dni|dzien|dni|noc|nocy|noce|dob[ay]?)/);
  if (m) days = parseInt(m[1], 10);
  else if (/fortnight|dwa tygodnie/.test(t)) days = 10;
  else if (/\bweek\b|tydzien|tygodnia|tygodniowy/.test(t)) days = 7;
  else if (/weekend/.test(t)) days = 2;
  days = Math.max(2, Math.min(10, days));

  // pace → stops per day
  let pace = 3, paceKey = 'steady';
  if (/relax|slow|chill|easy|gentle|leisurely|laid back|spokojn|wolno|luzn|na luzie|relaks|powoli|leniw/.test(t)) { pace = 2; paceKey = 'relaxed'; }
  if (/packed|busy|ambitious|everything|intense|as much as|intensywn|ambitn|napiet|maksymaln|jak najwiecej/.test(t)) { pace = 4; paceKey = 'ambitious'; }

  // start city — key plus any localised aliases
  let start = START_CITIES.edinburgh;
  for (const [key, city] of Object.entries(START_CITIES)) {
    const names = [key, ...(city.aliases || [])];
    if (names.some(has)) { start = city; break; }
  }

  // region bias
  const regionBias = new Set();
  for (const hint of REGION_HINTS) {
    if (hint.words.some(w => t.includes(normalise(w).slice(1, -1)))) hint.regions.forEach(r => regionBias.add(r));
  }

  return { text, interests, days, pace, paceKey, start, regionBias: [...regionBias] };
}

function scorePoi(poi, req) {
  let score = poi.pop; // base popularity
  const wantedTags = new Set(req.interests.flatMap(i => INTERESTS[i].tags));
  for (const tag of poi.tags) if (wantedTags.has(tag)) score += 9;
  if (req.regionBias.includes(poi.region)) score += 7;
  // gentle pull toward the start so a 2-day Edinburgh trip doesn't route to Durness
  const reachKm = req.days * 130;
  const d = distKm(poi, req.start);
  if (d > reachKm) score -= (d - reachKm) / 18;
  score += Math.random() * 2.5; // jitter so "reshuffle" feels alive
  return score;
}

function nearestNeighbourRoute(start, pois) {
  const remaining = [...pois];
  const route = [];
  let cursor = start;
  while (remaining.length) {
    let bi = 0, bd = Infinity;
    remaining.forEach((p, i) => {
      const d = distKm(cursor, p);
      if (d < bd) { bd = d; bi = i; }
    });
    cursor = remaining.splice(bi, 1)[0];
    route.push(cursor);
  }
  return route;
}

/**
 * Build a trip's display title in the active language. Derived from the
 * stored interest keys rather than baked in at generation time, so a
 * saved quest re-titles itself when the user switches language.
 */
export function tripTitle(trip) {
  const keys = (trip.interests || []).filter(k => INTERESTS[k]).slice(0, 2);
  const names = keys.map(k => translate(`interest.${k}`));
  const theme = names.length === 2 ? translate('planner.themeJoin', { a: names[0], b: names[1] })
    : names.length === 1 ? names[0]
    : translate('planner.themeDefault');
  const days = trip.days?.length || trip.dayCount || 0;
  // Hand-built journeys say so, so they are distinguishable at a glance
  // in the quest list from the ones the planner charted.
  return translate(trip.custom ? 'planner.customTitle' : 'planner.tripTitle', { days, theme });
}

/** Localised pace label, tolerating trips saved before paceKey existed. */
export function paceLabel(trip) {
  const key = trip.paceKey || { Relaxed: 'relaxed', Ambitious: 'ambitious' }[trip.paceLabel] || 'steady';
  return translate(`pace.${key}`);
}

/**
 * Locations that actually answer the request.
 *
 * An interest the user names is a filter, not a hint. Ask for whisky and
 * you get distilleries — not a greatest-hits tour of Scotland with one
 * distillery in it, which is what ranking-with-a-bonus used to produce.
 * Matching is on each interest's `core` tags; the broad `tags` sets
 * overlap too much to filter on (see the note in data.js).
 */
export function matchingPois(interestKeys) {
  const keys = (interestKeys || []).filter(k => INTERESTS[k]);
  if (!keys.length) return POIS;                 // no theme asked for: the whole map
  const core = new Set(keys.flatMap(k => INTERESTS[k].core || INTERESTS[k].tags));
  return POIS.filter(p => p.tags.some(tag => core.has(tag)));
}

/**
 * Places worth a detour that are NOT what was asked for — the two the
 * app offers up, once in a while, as a gentle "there is more out here".
 * Ranked by how little they drag you off the route you already have.
 */
export function wildcardsFor(trip, count = 2) {
  const keys = (trip.interests || []).filter(k => INTERESTS[k]);
  if (!keys.length) return [];
  const core = new Set(keys.flatMap(k => INTERESTS[k].core || INTERESTS[k].tags));
  const onRoute = tripStopIds(trip).map(id => POI_BY_ID[id]).filter(Boolean);
  if (!onRoute.length) return [];

  const outsiders = POIS.filter(p =>
    !p.tags.some(tag => core.has(tag)) && !onRoute.some(s => s.id === p.id));

  return outsiders
    .map(p => {
      const detour = Math.min(...onRoute.map(s => distKm(p, s)));
      return { p, score: p.pop * 3 - detour / 6 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)                                  // shortlist, then vary
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map(x => x.p);
}

/** Days, distance and XP for a set of stops in route order. */
function summarise(trip, route, dayCount) {
  const perDay = Math.ceil(route.length / Math.max(1, dayCount));
  const days = [];
  for (let d = 0; d < dayCount; d++) {
    const stops = route.slice(d * perDay, (d + 1) * perDay).map(p => p.id);
    if (stops.length) days.push({ day: days.length + 1, stops });
  }
  let km = 0, cursor = trip.start;
  for (const p of route) { km += distKm(cursor, p); cursor = p; }
  km = Math.round(km * 1.3);                      // road windiness
  trip.days = days;
  trip.distanceKm = km;
  trip.distanceMi = Math.round(km * 0.621);
  trip.xpOnOffer = route.reduce((s, p) => s + p.xp, 0);
  return trip;
}

// How often a themed quest is offered a couple of stops from outside it.
// Occasionally — the point is a nudge, not a running commentary.
const WILDCARD_CHANCE = 0.35;

export function generateTrip(promptText) {
  const req = parsePrompt(promptText);
  const pool = matchingPois(req.interests);
  const themed = req.interests.length > 0;
  const stopCount = Math.min(req.days * req.pace, pool.length);

  const ranked = pool
    .map(p => ({ p, score: scorePoi(p, req) }))
    .sort((a, b) => b.score - a.score);

  // Spread across regions where there is room to. On a themed request the
  // pool can be smaller than the trip, so the cap runs as a preference:
  // a second pass fills any remaining slots rather than returning fewer
  // stops than the user actually asked for.
  const cap = Math.max(2, Math.ceil(stopCount * (themed ? 0.6 : 0.4)));
  const perRegion = {};
  const chosen = [];
  for (const pass of [1, 2]) {
    for (const { p } of ranked) {
      if (chosen.length >= stopCount) break;
      if (chosen.includes(p)) continue;
      if (pass === 1) {
        perRegion[p.region] = perRegion[p.region] || 0;
        if (perRegion[p.region] >= cap) continue;
        perRegion[p.region]++;
      }
      chosen.push(p);
    }
  }

  const route = nearestNeighbourRoute(req.start, chosen);
  const trip = {
    id: 'trip_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    prompt: promptText,
    interests: req.interests,
    paceKey: req.paceKey,
    start: req.start,
    createdAt: Date.now(),
    visited: {},
    completedAt: null,
    // Decided once, here, so re-rendering the draft cannot re-roll it.
    offerWildcards: themed && route.length >= 2 && Math.random() < WILDCARD_CHANCE,
  };
  return summarise(trip, route, req.days);
}

/**
 * Fold extra stops into an existing draft: re-route, re-chunk, re-cost.
 * Used when someone accepts the suggested detours.
 */
export function addStops(trip, poiIds) {
  const ids = [...tripStopIds(trip), ...poiIds];
  const pois = ids.map(id => POI_BY_ID[id]).filter(Boolean);
  const route = nearestNeighbourRoute(trip.start, pois);
  trip.offerWildcards = false;
  return summarise(trip, route, trip.days.length);
}

export function tripStopIds(trip) {
  return trip.days.flatMap(d => d.stops);
}

export function tripProgress(trip) {
  const all = tripStopIds(trip);
  const done = all.filter(id => trip.visited[id]).length;
  return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}
