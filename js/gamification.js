// ============================================================
// Gamification engine: XP, levels, achievements, toasts, confetti.
// ============================================================

import { ACHIEVEMENTS, LEVELS, POI_BY_ID, REGIONS, XP_EVENTS } from './data.js';
import { store } from './store.js';
import { t, levelTitle, achievementName, achievementDesc, poiName, regionName } from './i18n.js';

// Quiet mode suppresses toasts/overlays (used when seeding demo data).
let quiet = false;
export function setQuiet(v) { quiet = v; }

// ---- derived stats (single source of truth = trips/visited state) ----

export function userStats(user) {
  const visitedIds = new Set();
  let tripsCompleted = 0;
  for (const trip of user.trips) {
    if (trip.completedAt) tripsCompleted++;
    for (const id of Object.keys(trip.visited)) visitedIds.add(id);
  }
  const visited = [...visitedIds].map(id => POI_BY_ID[id]).filter(Boolean);
  const has = (poi, tag) => poi.tags.includes(tag);
  const level = LEVELS.fromXP(user.xp).level;
  return {
    visitedIds: [...visitedIds],
    visitedCount: visited.length,
    castles: visited.filter(p => has(p, 'castle')).length,
    distilleries: visited.filter(p => has(p, 'whisky')).length,
    lochs: visited.filter(p => has(p, 'loch')).length,
    peaks: visited.filter(p => has(p, 'mountain') && has(p, 'hiking')).length,
    islands: visited.filter(p => has(p, 'island')).length,
    regions: new Set(visited.map(p => p.region)).size,
    tripsCreated: user.trips.length,
    tripsCompleted,
    level,
  };
}

// ---- passport ----

/**
 * Per-region completion. Turns 87 loose checkboxes into 17 finishable
 * goals, which is the point: a region you are 4/6 through is a reason to
 * go back, where a flat list of 87 never feels close to anything.
 */
export function regionProgress(user) {
  const visited = new Set(userStats(user).visitedIds);
  return REGIONS.map(r => {
    const done = r.poiIds.filter(id => visited.has(id)).length;
    return {
      name: r.name, icon: r.icon, poiIds: r.poiIds,
      done, total: r.poiIds.length,
      pct: Math.round((done / r.poiIds.length) * 100),
      complete: done === r.poiIds.length,
      stampedAt: user.stamps?.[r.name] || null,
    };
  });
}

/** Stamp any region finished since the last check, once each. */
export function evaluateStamps(user) {
  user.stamps ||= {};
  const earned = [];
  for (const r of regionProgress(user)) {
    if (r.complete && !user.stamps[r.name]) {
      user.stamps[r.name] = Date.now();
      earned.push(r);
      awardXP(user, XP_EVENTS.REGION_STAMP, 'passport.earned', { region: r.name }, r.icon);
    }
  }
  if (earned.length) store.save();
  return earned;
}

// ---- XP / levels ----

function logActivity(user, icon, key, params, xp) {
  user.activity.unshift({ at: Date.now(), icon, key, params, xp });
  user.activity = user.activity.slice(0, 30);
}

/**
 * Render an activity entry in the active language. Entries store a
 * translation key plus stable identifiers (poiId / achId) rather than
 * finished prose, so the feed follows a language switch. Entries saved
 * by older builds keep their literal `text`.
 */
export function activityText(entry) {
  if (!entry.key) return entry.text || '';
  const params = { ...entry.params };
  if (params.achId) params.name = achievementName(params.achId);
  if (params.poiId && POI_BY_ID[params.poiId]) params.name = poiName(POI_BY_ID[params.poiId]);
  if (params.region) params.region = regionName(params.region);
  return t(entry.key, params);
}

/** Award XP, show toasts, detect level-ups. Returns events for the UI. */
export function awardXP(user, amount, key, params, icon = '✨') {
  const before = LEVELS.fromXP(user.xp).level;
  user.xp = Math.max(0, user.xp + amount);
  const after = LEVELS.fromXP(user.xp).level;
  if (amount !== 0) logActivity(user, icon, key, params, amount);
  if (amount > 0 && !quiet) toastXP(amount, activityText({ key, params }), icon);
  if (after > before && !quiet) celebrateLevelUp(after);
  store.save();
  return { leveledUp: after > before, level: after };
}

/** Re-check all achievements; unlock new ones (with their XP rewards). */
export function evaluateAchievements(user) {
  const unlockedNow = [];
  // Loop until stable: an achievement's XP can itself trigger 'local-legend'.
  for (let pass = 0; pass < 3; pass++) {
    const stats = userStats(user);
    const owned = new Set(user.achievements.map(a => a.id));
    let any = false;
    for (const def of ACHIEVEMENTS) {
      if (!owned.has(def.id) && def.check(stats)) {
        user.achievements.push({ id: def.id, at: Date.now() });
        unlockedNow.push(def);
        logActivity(user, def.icon, 'badges.logged', { achId: def.id }, def.xp);
        user.xp += def.xp;
        any = true;
      }
    }
    if (!any) break;
  }
  if (unlockedNow.length) {
    const before = LEVELS.fromXP(user.xp - unlockedNow.reduce((s, d) => s + d.xp, 0)).level;
    const after = LEVELS.fromXP(user.xp).level;
    if (!quiet) {
      unlockedNow.forEach((def, i) => setTimeout(() => toastAchievement(def), 350 + i * 900));
      if (after > before) celebrateLevelUp(after);
    }
    store.save();
  }
  return unlockedNow;
}

// ---- toasts ----

function toastHost() {
  let host = document.getElementById('toast-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast-host';
    document.body.appendChild(host);
  }
  return host;
}

function pushToast(el, life = 3400) {
  const host = toastHost();
  host.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 450);
  }, life);
}

export function toastXP(amount, label, icon = '✨') {
  const el = document.createElement('div');
  el.className = 'toast toast-xp';
  el.innerHTML = `<span class="t-icon">${icon}</span><span class="t-text">${label}</span><span class="t-amount">+${amount} ${t('unit.xp')}</span>`;
  pushToast(el, 2800);
}

export function toastAchievement(def) {
  const el = document.createElement('div');
  el.className = 'toast toast-achievement';
  el.innerHTML = `
    <div class="t-shield">${def.icon}</div>
    <div class="t-body">
      <div class="t-kicker">${t('badges.toastKicker')}</div>
      <div class="t-name">${achievementName(def.id)}</div>
      <div class="t-desc">${achievementDesc(def.id)} <b>+${def.xp} ${t('unit.xp')}</b></div>
    </div>`;
  pushToast(el, 4600);
  burstConfetti(26);
}

export function toastInfo(text, icon = '🧭') {
  const el = document.createElement('div');
  el.className = 'toast toast-xp';
  el.innerHTML = `<span class="t-icon">${icon}</span><span class="t-text">${text}</span>`;
  pushToast(el, 2600);
}

// ---- level-up overlay + confetti ----

export function celebrateLevelUp(level) {
  const overlay = document.createElement('div');
  overlay.className = 'levelup-overlay';
  overlay.innerHTML = `
    <div class="levelup-card">
      <div class="lu-rays"></div>
      <div class="lu-kicker">${t('level.up')}</div>
      <div class="lu-level">${level}</div>
      <div class="lu-title">${levelTitle(level)}</div>
      <button class="btn btn-primary lu-close">${t('level.onwards')}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('show'));
  burstConfetti(80);
  const close = () => { overlay.classList.remove('show'); setTimeout(() => overlay.remove(), 400); };
  overlay.querySelector('.lu-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  setTimeout(close, 6000);
}

const CONFETTI_COLOURS = ['#3ee08f', '#b69cff', '#e8b84b', '#6fb3e0', '#e0876f', '#ede6d6'];

export function burstConfetti(count = 40) {
  for (let i = 0; i < count; i++) {
    const c = document.createElement('i');
    c.className = 'confetti';
    const size = 5 + Math.random() * 7;
    c.style.cssText = `
      left:${8 + Math.random() * 84}vw;
      width:${size}px;height:${size * (Math.random() > 0.5 ? 1 : 2.2)}px;
      background:${CONFETTI_COLOURS[i % CONFETTI_COLOURS.length]};
      animation-duration:${1.6 + Math.random() * 1.6}s;
      animation-delay:${Math.random() * 0.5}s;
      --drift:${(Math.random() * 2 - 1) * 160}px;
      --spin:${Math.random() * 720 - 360}deg;`;
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 3800);
  }
}
