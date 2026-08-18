// ============================================================
// BRAW — "Guess the Glen".
//
// A short quiz built entirely from the existing POI dataset: you are
// shown a location's description with its name masked out, and pick the
// place it describes. The point is that it teaches the map — every
// question is somewhere you could actually go and plan a quest to.
//
// This module owns question generation and scoring only; app.js draws it.
// ============================================================

import { POIS, POI_BY_ID, XP_EVENTS } from './data.js';
import { poiName, poiBlurb, regionName } from './i18n.js';

const OPTIONS = 4;

function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Hide the answer inside its own clue. Blurbs sometimes name the place
 * ("Skye's westernmost cliff walk"), which would give it away, so every
 * significant word of the name is masked — in the active language, since
 * that is the text being shown.
 */
function maskName(text, poi) {
  const words = [poiName(poi), poi.name]
    .join(' ')
    .split(/[\s,'’-]+/)
    .filter(w => w.length > 3);
  let out = text;
  for (const w of new Set(words)) {
    out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '———');
  }
  return out;
}

/**
 * One question. Decoys prefer places sharing a tag with the answer, so a
 * castle question offers other castles — you have to know the specific
 * place rather than spot the only castle in the list.
 */
export function nextQuestion(recentIds = []) {
  const pool = POIS.filter(p => !recentIds.includes(p.id));
  const answer = (pool.length ? pool : POIS)[Math.floor(Math.random() * (pool.length || POIS.length))];

  const sameTag = shuffle(POIS.filter(p =>
    p.id !== answer.id && p.tags.some(tag => answer.tags.includes(tag))));
  const others = shuffle(POIS.filter(p => p.id !== answer.id && !sameTag.includes(p)));
  const decoys = [...sameTag, ...others].slice(0, OPTIONS - 1);

  return {
    answerId: answer.id,
    clue: maskName(poiBlurb(answer), answer),
    region: regionName(answer.region),   // revealed only as a hint
    options: shuffle([answer, ...decoys]).map(p => ({ id: p.id, name: poiName(p) })),
  };
}

/** Today as YYYY-MM-DD in local time, for the daily XP ceiling. */
function today() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * XP for one correct answer, capped per day.
 *
 * The quiz is endlessly repeatable, so uncapped rewards would let anyone
 * out-grind the leaderboard without leaving the sofa — which would make
 * the ranking meaningless next to actually visiting places.
 * Returns the XP to award (may be 0 once the cap is reached).
 */
export function gameXPFor(user) {
  user.game ||= { best: 0, plays: 0, xpDate: null, xpToday: 0 };
  const day = today();
  if (user.game.xpDate !== day) { user.game.xpDate = day; user.game.xpToday = 0; }
  const remaining = XP_EVENTS.GAME_DAILY_CAP - user.game.xpToday;
  if (remaining <= 0) return 0;
  const award = Math.min(XP_EVENTS.GAME_CORRECT, remaining);
  user.game.xpToday += award;
  return award;
}

export function recordRun(user, score) {
  user.game ||= { best: 0, plays: 0, xpDate: null, xpToday: 0 };
  user.game.plays = (user.game.plays || 0) + 1;
  const isBest = score > (user.game.best || 0);
  if (isBest) user.game.best = score;
  return isBest;
}

export const answerName = id => poiName(POI_BY_ID[id]);
