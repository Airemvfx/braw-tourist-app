// ============================================================
// The "AI" trip planner (prototype heuristic engine):
//  1. parse free-text wishes → interests, duration, pace, start, region bias
//  2. score every POI against the request
//  3. pick stops, order them with nearest-neighbour routing
//  4. chunk into days
// Swappable later for a real LLM + routing API.
// ============================================================

import { POIS, INTERESTS, START_CITIES, REGION_HINTS } from './data.js';

const KM_PER_DEG = 111;

function distKm(a, b) {
  const dLat = (a.lat - b.lat) * KM_PER_DEG;
  const dLon = (a.lon - b.lon) * KM_PER_DEG * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.hypot(dLat, dLon);
}

export function parsePrompt(text) {
  const t = ` ${text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')} `;

  // interests
  const interests = [];
  for (const [key, def] of Object.entries(INTERESTS)) {
    if (def.words.some(w => t.includes(` ${w} `) || t.includes(` ${w}s `))) interests.push(key);
  }

  // duration
  let days = 5;
  const m = t.match(/(\d+)\s*(?:day|days|night|nights)/);
  if (m) days = parseInt(m[1], 10);
  else if (/fortnight/.test(t)) days = 10;
  else if (/\bweek\b/.test(t)) days = 7;
  else if (/weekend/.test(t)) days = 2;
  days = Math.max(2, Math.min(10, days));

  // pace → stops per day
  let pace = 3, paceLabel = 'Steady';
  if (/relax|slow|chill|easy|gentle|leisurely|laid back/.test(t)) { pace = 2; paceLabel = 'Relaxed'; }
  if (/packed|busy|ambitious|everything|intense|as much as/.test(t)) { pace = 4; paceLabel = 'Ambitious'; }

  // start city
  let start = START_CITIES.edinburgh;
  for (const [key, city] of Object.entries(START_CITIES)) {
    if (t.includes(` ${key} `)) { start = city; break; }
  }

  // region bias
  const regionBias = new Set();
  for (const hint of REGION_HINTS) {
    if (hint.words.some(w => t.includes(w))) hint.regions.forEach(r => regionBias.add(r));
  }

  return { text, interests, days, pace, paceLabel, start, regionBias: [...regionBias] };
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

function tripTitle(req) {
  const names = req.interests.slice(0, 2).map(i => INTERESTS[i].label);
  const theme = names.length === 2 ? `${names[0]} & ${names[1]}`
    : names.length === 1 ? names[0]
    : 'Best of Scotland';
  return `${req.days}-Day ${theme} Quest`;
}

export function generateTrip(promptText) {
  const req = parsePrompt(promptText);
  const stopCount = Math.min(req.days * req.pace, POIS.length);

  const ranked = POIS
    .map(p => ({ p, score: scorePoi(p, req) }))
    .sort((a, b) => b.score - a.score);

  // diversity guard: max 40% of stops from one single region
  const cap = Math.max(2, Math.ceil(stopCount * 0.4));
  const perRegion = {};
  const chosen = [];
  for (const { p } of ranked) {
    if (chosen.length >= stopCount) break;
    perRegion[p.region] = perRegion[p.region] || 0;
    if (perRegion[p.region] >= cap) continue;
    perRegion[p.region]++;
    chosen.push(p);
  }

  const route = nearestNeighbourRoute(req.start, chosen);

  // chunk route into days
  const perDay = Math.ceil(route.length / req.days);
  const days = [];
  for (let d = 0; d < req.days; d++) {
    const stops = route.slice(d * perDay, (d + 1) * perDay).map(p => p.id);
    if (stops.length) days.push({ day: d + 1, stops });
  }

  // total driving estimate (~1.3 road windiness factor)
  let km = 0, cursor = req.start;
  for (const p of route) { km += distKm(cursor, p); cursor = p; }
  km = Math.round(km * 1.3);

  return {
    id: 'trip_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: tripTitle(req),
    prompt: promptText,
    interests: req.interests,
    paceLabel: req.paceLabel,
    start: req.start,
    days,
    distanceKm: km,
    distanceMi: Math.round(km * 0.621),
    xpOnOffer: route.reduce((s, p) => s + p.xp, 0),
    createdAt: Date.now(),
    visited: {},        // { poiId: timestamp }
    completedAt: null,
  };
}

export function tripStopIds(trip) {
  return trip.days.flatMap(d => d.stops);
}

export function tripProgress(trip) {
  const all = tripStopIds(trip);
  const done = all.filter(id => trip.visited[id]).length;
  return { done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0 };
}
