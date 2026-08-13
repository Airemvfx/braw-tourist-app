// ============================================================
// BRAW — app shell: auth, navigation, views, event wiring.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, LEVELS, XP_EVENTS, ACHIEVEMENTS, RIVALS } from './data.js';
import { store } from './store.js';
import { awardXP, evaluateAchievements, userStats, toastInfo, burstConfetti, setQuiet, activityText } from './gamification.js';
import { generateTrip, tripProgress, tripStopIds, tripTitle, paceLabel } from './planner.js';
import { renderMap } from './scotland-map.js';
import {
  t, getLang, setLang, onLangChange, applyStatic, LANGS,
  poiName, poiBlurb, regionName, poiTime, cityName,
  interestLabel, levelTitle, achievementName, achievementDesc,
  examplePrompts, formatDistance, formatNumber, locale,
} from './i18n.js';

let user = null;          // current logged-in profile
let draftTrip = null;     // generated but not yet saved
let openTripId = null;    // trip shown in detail view
let currentView = 'plan'; // view to restore after a language switch

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// ============================================================
// Boot
// ============================================================

function boot() {
  user = store.currentUser();
  if (user) enterApp(); else showAuth();
}

function showAuth() {
  $('#auth-screen').hidden = false;
  $('#app-screen').hidden = true;
}

function enterApp() {
  $('#auth-screen').hidden = true;
  $('#app-screen').hidden = false;
  renderHeader();
  switchView(user.trips.length ? 'trips' : 'plan');
}

// ============================================================
// Language
// ============================================================

function wireLanguage() {
  $$('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );
  syncLangButtons();

  onLangChange(() => {
    syncLangButtons();
    syncAuthSubmit();
    if (user) { renderHeader(); switchView(currentView); }
  });
}

function syncLangButtons() {
  const active = getLang();
  $$('.lang-btn').forEach(b => {
    const on = b.dataset.lang === active;
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
    b.title = LANGS[b.dataset.lang].label;
  });
}

/** Keep the submit button's key in step with the active auth tab. */
function syncAuthSubmit() {
  const mode = $('#auth-form').dataset.mode;
  const btn = $('#auth-submit');
  btn.dataset.i18n = mode === 'login' ? 'auth.submit.loginArrow' : 'auth.submit.registerArrow';
  btn.textContent = t(btn.dataset.i18n);
}

// ============================================================
// Auth screen
// ============================================================

function wireAuth() {
  $$('.auth-tab').forEach(tab =>
    tab.addEventListener('click', () => {
      $$('.auth-tab').forEach(t2 => t2.classList.toggle('active', t2 === tab));
      $('#auth-form').dataset.mode = tab.dataset.mode;
      $('#auth-error').textContent = '';
      syncAuthSubmit();
    })
  );

  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#auth-name').value;
    const pass = $('#auth-pass').value;
    const mode = $('#auth-form').dataset.mode;
    $('#auth-error').textContent = '';
    try {
      if (mode === 'login') {
        user = await store.login(name, pass);
        toastInfo(t('act.welcomeBack', { name: user.name }), '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      } else {
        user = await store.register(name, pass);
        awardXP(user, XP_EVENTS.JOIN, 'act.joined', null, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      }
      enterApp();
    } catch (err) {
      $('#auth-error').textContent = err.i18nKey ? t(err.i18nKey) : err.message;
    }
  });

  $('#demo-btn').addEventListener('click', async () => {
    const demoName = 'WeeExplorer';
    try { user = await store.login(demoName, 'demo1234'); }
    catch {
      user = await store.register(demoName, 'demo1234');
      setQuiet(true);
      awardXP(user, XP_EVENTS.JOIN, 'act.joined', null, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      seedDemoProgress();
      setQuiet(false);
    }
    enterApp();
    const lvl = LEVELS.fromXP(user.xp);
    toastInfo(t('act.welcomeDemo', {
      name: user.name, level: lvl.level, title: levelTitle(lvl.level),
    }), '🎲');
  });
}

/** Give the demo account a head start so every screen has life in it. */
function seedDemoProgress() {
  const trip = generateTrip(t('planner.demoPrompt'));
  user.trips.unshift(trip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, 'act.questCreated', { title: tripTitle(trip) }, '🗺️');
  const ids = tripStopIds(trip).slice(0, 4);
  for (const id of ids) {
    trip.visited[id] = Date.now();
    awardXP(user, POI_BY_ID[id].xp, 'act.visited', { poiId: id }, POI_BY_ID[id].icon);
  }
  evaluateAchievements(user);
  store.save();
}

// ============================================================
// Header (level chip + XP bar)
// ============================================================

function renderHeader() {
  const { level, into, need } = LEVELS.fromXP(user.xp);
  $('#hdr-avatar').textContent = user.name[0].toUpperCase();
  $('#hdr-name').textContent = user.name;
  $('#hdr-level').textContent = t('hdr.level', { level });
  $('#hdr-title').textContent = levelTitle(level);
  $('#hdr-xp-fill').style.width = `${Math.round((into / need) * 100)}%`;
  $('#hdr-xp-label').textContent = t('hdr.xp', { into, need });
}

// ============================================================
// Navigation
// ============================================================

const VIEWS = ['plan', 'trips', 'trip', 'badges', 'leaderboard', 'profile'];

function switchView(name) {
  currentView = name;
  for (const v of VIEWS) $(`#view-${v}`).hidden = v !== name;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const renderers = { plan: renderPlan, trips: renderTrips, trip: renderTripDetail, badges: renderBadges, leaderboard: renderLeaderboard, profile: renderProfile };
  renderers[name]?.();
  renderHeader();
  window.scrollTo({ top: 0 });
}

function wireNav() {
  $$('.nav-btn').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  $('#logout-btn').addEventListener('click', () => {
    store.logout();
    user = null; draftTrip = null; openTripId = null;
    showAuth();
  });
}

// ============================================================
// View: Plan a new quest
// ============================================================

function renderPlan() {
  const host = $('#example-chips');
  host.innerHTML = examplePrompts()
    .map(p => `<button class="chip" data-prompt="${esc(p)}">${esc(p)}</button>`).join('');
  host.querySelectorAll('.chip').forEach(c =>
    c.addEventListener('click', () => { $('#plan-input').value = c.dataset.prompt; $('#plan-input').focus(); })
  );
  if (!draftTrip) { $('#plan-result').hidden = true; $('#plan-thinking').hidden = true; }
  else renderDraft();
}

const THINKING_STEPS = [
  ['📖', 'plan.think.read'],
  ['🔍', 'plan.think.scout'],
  ['🧮', 'plan.think.match'],
  ['🧭', 'plan.think.route'],
  ['✨', 'plan.think.polish'],
];

async function runPlanner() {
  const text = $('#plan-input').value.trim();
  if (text.length < 8) { toastInfo(t('plan.tooShort'), '✍️'); return; }

  $('#plan-result').hidden = true;
  const think = $('#plan-thinking');
  think.hidden = false;
  think.innerHTML = '';
  for (const [icon, key] of THINKING_STEPS) {
    const row = document.createElement('div');
    row.className = 'think-step';
    row.innerHTML = `<span>${icon}</span> ${esc(t(key, { count: POIS.length }))}`;
    think.appendChild(row);
    requestAnimationFrame(() => row.classList.add('on'));
    await new Promise(r => setTimeout(r, 380 + Math.random() * 220));
  }
  draftTrip = generateTrip(text);
  think.hidden = true;
  renderDraft();
}

// Icons stay in the dataset; labels come from the locale.
function interestPills(keys) {
  if (!keys.length) return `<span class="pill">${t('trip.bestOf')}</span>`;
  return keys
    .filter(k => INTERESTS[k])
    .map(k => `<span class="pill">${INTERESTS[k].icon} ${esc(interestLabel(k))}</span>`)
    .join('');
}

function renderDraft() {
  const trip = draftTrip;
  const box = $('#plan-result');
  box.hidden = false;
  const stops = tripStopIds(trip).map((id, i) => ({ poi: POI_BY_ID[id], visited: false, order: i + 1 }));

  box.innerHTML = `
    <div class="trip-sheet card">
      <div class="sheet-head">
        <div>
          <div class="kicker">${t('trip.kicker.draft')}</div>
          <h2 class="trip-title">${esc(tripTitle(trip))}</h2>
          <div class="pill-row">${interestPills(trip.interests)}
            <span class="pill pill-dim">${t('trip.distance', { dist: formatDistance(trip) })}</span>
            <span class="pill pill-dim">${t('trip.pace', { pace: paceLabel(trip) })}</span>
            <span class="pill pill-gold">${t('trip.xpOffer', { xp: trip.xpOnOffer + XP_EVENTS.CREATE_TRIP })}</span>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="btn btn-ghost" id="reshuffle-btn">${t('trip.reshuffle')}</button>
          <button class="btn btn-primary" id="save-trip-btn">${t('trip.begin')}</button>
        </div>
      </div>
      <div class="trip-layout">
        <div class="map-panel">${renderMap(stops, trip.start)}</div>
        <div class="days-panel">${dayListHTML(trip, false)}</div>
      </div>
    </div>`;

  $('#reshuffle-btn').addEventListener('click', () => { draftTrip = generateTrip(trip.prompt); renderDraft(); });
  $('#save-trip-btn').addEventListener('click', saveDraft);
  wireMarkerHover(box);
}

function saveDraft() {
  user.trips.unshift(draftTrip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, 'act.questCreated', { title: tripTitle(draftTrip) }, '🗺️');
  evaluateAchievements(user);
  openTripId = draftTrip.id;
  draftTrip = null;
  $('#plan-input').value = '';
  switchView('trip');
}

// ============================================================
// View: My quests (trip list)
// ============================================================

function renderTrips() {
  const host = $('#trips-list');
  if (!user.trips.length) {
    host.innerHTML = `
      <div class="empty-state card">
        <div class="empty-icon">🗺️</div>
        <h3>${t('trips.empty.title')}</h3>
        <p>${t('trips.empty.body')}</p>
        <button class="btn btn-primary" id="empty-plan-btn">${t('trips.empty.cta')}</button>
      </div>`;
    $('#empty-plan-btn').addEventListener('click', () => switchView('plan'));
    return;
  }

  host.innerHTML = user.trips.map(trip => {
    const pr = tripProgress(trip);
    const done = !!trip.completedAt;
    return `
    <button class="trip-card card ${done ? 'is-complete' : ''}" data-trip="${trip.id}">
      <div class="tc-top">
        <span class="tc-icon">${done ? '🏁' : '🛤️'}</span>
        <div class="tc-names">
          <span class="tc-title">${esc(tripTitle(trip))}</span>
          <span class="tc-sub">${esc(t('trips.card.meta', {
            days: trip.days.length, stops: pr.total,
            dist: formatDistance(trip), start: cityName(trip.start.name),
          }))}</span>
        </div>
        ${done ? `<span class="tc-badge">${t('trips.card.completed')}</span>` : `<span class="tc-pct">${pr.pct}%</span>`}
      </div>
      <div class="progress"><div class="progress-fill" style="width:${pr.pct}%"></div></div>
      <div class="tc-foot">${t('trips.card.progress', { done: pr.done, total: pr.total })}</div>
    </button>`;
  }).join('');

  host.querySelectorAll('.trip-card').forEach(c =>
    c.addEventListener('click', () => { openTripId = c.dataset.trip; switchView('trip'); })
  );
}

// ============================================================
// View: Trip detail
// ============================================================

function dayListHTML(trip, interactive) {
  let order = 0;
  return trip.days.map(d => {
    const stopsHTML = d.stops.map(id => {
      order++;
      const poi = POI_BY_ID[id];
      const visited = !!trip.visited[id];
      return `
      <div class="stop ${visited ? 'is-visited' : ''}" data-poi="${id}">
        <div class="stop-order">${visited ? '✓' : order}</div>
        <div class="stop-body">
          <div class="stop-name">${poi.icon} ${esc(poiName(poi))}</div>
          <div class="stop-meta">${esc(regionName(poi.region))} · ${esc(poiTime(poi.time))} · <span class="stop-xp">✦ ${poi.xp} ${t('unit.xp')}</span></div>
          <div class="stop-blurb">${esc(poiBlurb(poi))}</div>
        </div>
        ${interactive ? `
        <button class="visit-btn ${visited ? 'undo' : ''}" data-visit="${id}">
          ${visited ? t('trip.visited') : t('trip.markVisited')}
        </button>` : ''}
      </div>`;
    }).join('');
    const regions = [...new Set(d.stops.map(id => regionName(POI_BY_ID[id].region)))];
    return `
    <section class="day-block">
      <header class="day-head"><span class="day-num">${t('trip.day', { n: d.day })}</span><span class="day-regions">${esc(regions.join(' → '))}</span></header>
      ${stopsHTML}
    </section>`;
  }).join('');
}

function renderTripDetail() {
  const trip = user.trips.find(t2 => t2.id === openTripId) || user.trips[0];
  const host = $('#trip-detail');
  if (!trip) { host.innerHTML = `<p class="muted">${t('trip.none')}</p>`; return; }
  openTripId = trip.id;

  const pr = tripProgress(trip);
  let order = 0;
  const stops = tripStopIds(trip).map(id => ({ poi: POI_BY_ID[id], visited: !!trip.visited[id], order: ++order }));
  const next = stops.find(s => !s.visited);

  host.innerHTML = `
    <button class="back-link" id="back-to-trips">${t('trip.back')}</button>
    <div class="trip-sheet card ${trip.completedAt ? 'is-complete' : ''}">
      <div class="sheet-head">
        <div>
          <div class="kicker">${trip.completedAt ? t('trip.kicker.complete') : t('trip.kicker.active')}</div>
          <h2 class="trip-title">${esc(tripTitle(trip))}</h2>
          <div class="pill-row">${interestPills(trip.interests)}
            <span class="pill pill-dim">${t('trip.distance', { dist: formatDistance(trip) })}</span>
            <span class="pill pill-dim">${esc(t('trip.from', { start: cityName(trip.start.name) }))}</span>
          </div>
          <p class="trip-prompt">“${esc(trip.prompt)}”</p>
        </div>
        <div class="ring-wrap" title="${esc(t('trip.visitedRatio', { done: pr.done, total: pr.total }))}">
          <svg viewBox="0 0 90 90" class="ring">
            <circle cx="45" cy="45" r="38" class="ring-bg"/>
            <circle cx="45" cy="45" r="38" class="ring-fg" stroke-dasharray="${(pr.pct / 100) * 238.8} 238.8"/>
          </svg>
          <div class="ring-label"><b>${pr.pct}%</b><span>${pr.done}/${pr.total}</span></div>
        </div>
      </div>

      ${trip.completedAt ? `
        <div class="complete-banner">${t('trip.completeBanner', { xp: XP_EVENTS.COMPLETE_TRIP })}</div>
      ` : next ? `
        <div class="next-up">
          <span class="nu-kicker">${t('trip.nextUp')}</span>
          <span class="nu-name">${next.poi.icon} ${esc(poiName(next.poi))}</span>
          <span class="nu-meta">${esc(t('trip.stopOf', {
            region: regionName(next.poi.region), n: next.order, total: pr.total, xp: next.poi.xp,
          }))}</span>
        </div>` : ''}

      <div class="trip-layout">
        <div class="map-panel">${renderMap(stops, trip.start)}</div>
        <div class="days-panel">${dayListHTML(trip, true)}</div>
      </div>
    </div>`;

  $('#back-to-trips').addEventListener('click', () => switchView('trips'));
  host.querySelectorAll('[data-visit]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); toggleVisited(trip, btn.dataset.visit); })
  );
  wireMarkerHover(host);
}

function toggleVisited(trip, poiId) {
  const poi = POI_BY_ID[poiId];
  if (trip.visited[poiId]) {
    delete trip.visited[poiId];
    if (trip.completedAt) trip.completedAt = null;
    awardXP(user, -poi.xp, 'act.unmarked', { poiId }, '↩️');
    toastInfo(t('act.unmarkedToast', { name: poiName(poi), xp: poi.xp }), '↩️');
  } else {
    trip.visited[poiId] = Date.now();
    awardXP(user, poi.xp, 'act.visited', { poiId }, poi.icon);
    const pr = tripProgress(trip);
    if (pr.done === pr.total && !trip.completedAt) {
      trip.completedAt = Date.now();
      awardXP(user, XP_EVENTS.COMPLETE_TRIP, 'act.questCompleted', { title: tripTitle(trip) }, '🏁');
      burstConfetti(60);
    }
    evaluateAchievements(user);
  }
  store.save();
  renderTripDetail();
  renderHeader();
}

function wireMarkerHover(scope) {
  scope.querySelectorAll('.map-marker').forEach(m => {
    m.addEventListener('click', () => {
      const stop = scope.querySelector(`.stop[data-poi="${m.dataset.poi}"]`);
      if (stop) {
        stop.scrollIntoView({ behavior: 'smooth', block: 'center' });
        stop.classList.add('flash');
        setTimeout(() => stop.classList.remove('flash'), 1600);
      }
    });
  });
}

// ============================================================
// View: Achievements
// ============================================================

function renderBadges() {
  const owned = new Map(user.achievements.map(a => [a.id, a.at]));
  $('#badges-count-label').textContent = t('badges.count', { owned: owned.size, total: ACHIEVEMENTS.length });
  $('#badges-progress-fill').style.width = `${Math.round((owned.size / ACHIEVEMENTS.length) * 100)}%`;
  $('#badges-grid').innerHTML = ACHIEVEMENTS.map(def => {
    const at = owned.get(def.id);
    return `
    <div class="badge card ${at ? 'unlocked' : 'locked'}">
      <div class="badge-shield">${at ? def.icon : '🔒'}</div>
      <div class="badge-name">${esc(achievementName(def.id))}</div>
      <div class="badge-desc">${esc(achievementDesc(def.id))}</div>
      <div class="badge-xp">${at
        ? t('badges.unlockedOn', { date: new Date(at).toLocaleDateString(locale()) })
        : t('badges.reward', { xp: def.xp })}</div>
    </div>`;
  }).join('');
}

// ============================================================
// View: Leaderboard
// ============================================================

function renderLeaderboard() {
  const stats = userStats(user);
  const you = { name: user.name, xp: user.xp, visited: stats.visitedCount, trips: stats.tripsCompleted, you: true, colour: '#3ee08f' };
  const rows = [...RIVALS, you].sort((a, b) => b.xp - a.xp);

  $('#leaderboard-table').innerHTML = `
    <div class="lb-row lb-head">
      <span>${t('lb.col.rank')}</span><span>${t('lb.col.explorer')}</span><span>${t('lb.col.level')}</span><span>${t('lb.col.locations')}</span><span>${t('lb.col.quests')}</span><span>${t('lb.col.xp')}</span>
    </div>` +
    rows.map((r, i) => {
      const lvl = LEVELS.fromXP(r.xp).level;
      const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}`;
      return `
      <div class="lb-row ${r.you ? 'lb-you' : ''}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-name"><i class="lb-avatar" style="background:${r.colour}">${r.name[0].toUpperCase()}</i>${esc(r.name)}${r.you ? ` <b>${t('lb.you')}</b>` : ''}</span>
        <span>${t('hdr.level', { level: lvl })} <small>${esc(levelTitle(lvl))}</small></span>
        <span>${r.visited}</span>
        <span>${r.trips}</span>
        <span class="lb-xp">${formatNumber(r.xp)} ✦</span>
      </div>`;
    }).join('');

  const rank = rows.findIndex(r => r.you) + 1;
  $('#leaderboard-note').textContent = rank === 1
    ? t('lb.note.first')
    : t('lb.note.rank', {
        rank, total: rows.length,
        xp: formatNumber(rows[rank - 2].xp - user.xp + 1),
        name: rows[rank - 2].name,
      });
}

// ============================================================
// View: Profile
// ============================================================

function renderProfile() {
  const s = userStats(user);
  const { level, into, need } = LEVELS.fromXP(user.xp);

  $('#profile-card').innerHTML = `
    <div class="profile-hero card">
      <div class="ph-avatar">${user.name[0].toUpperCase()}</div>
      <div class="ph-id">
        <h2>${esc(user.name)}</h2>
        <div class="ph-title">${t('profile.levelTitle', { level, title: esc(levelTitle(level)) })}</div>
        <div class="progress big"><div class="progress-fill" style="width:${Math.round((into / need) * 100)}%"></div></div>
        <div class="ph-xp">${t('profile.xpToNext', { into, need, next: level + 1, total: formatNumber(user.xp) })}</div>
      </div>
      <button class="btn btn-ghost" id="profile-logout">${t('nav.signOut')}</button>
    </div>

    <div class="stat-grid">
      ${[
        ['📍', s.visitedCount, 'profile.stat.visited'],
        ['🗺️', s.tripsCreated, 'profile.stat.created'],
        ['🏁', s.tripsCompleted, 'profile.stat.completed'],
        ['🏰', s.castles, 'profile.stat.castles'],
        ['🥃', s.distilleries, 'profile.stat.drams'],
        ['🌍', s.regions, 'profile.stat.regions'],
        ['🏔️', s.peaks, 'profile.stat.peaks'],
        ['🏅', user.achievements.length, 'profile.stat.badges'],
      ].map(([icon, n, key]) => `
        <div class="stat card"><span class="stat-icon">${icon}</span><span class="stat-n">${n}</span><span class="stat-label">${esc(t(key))}</span></div>`).join('')}
    </div>

    <div class="card activity-card">
      <h3>${t('profile.activity')}</h3>
      ${user.activity.length ? user.activity.slice(0, 8).map(a => `
        <div class="act-row">
          <span class="act-icon">${a.icon}</span>
          <span class="act-text">${esc(activityText(a))}</span>
          <span class="act-xp ${a.xp < 0 ? 'neg' : ''}">${a.xp >= 0 ? '+' : ''}${a.xp} ${t('unit.xp')}</span>
          <span class="act-when">${timeAgo(a.at)}</span>
        </div>`).join('') : `<p class="muted">${t('profile.activityEmpty')}</p>`}
    </div>`;

  $('#profile-logout').addEventListener('click', () => $('#logout-btn').click());
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return t('time.now');
  if (s < 3600) return t('time.min', { n: Math.floor(s / 60) });
  if (s < 86400) return t('time.hour', { n: Math.floor(s / 3600) });
  return t('time.day', { n: Math.floor(s / 86400) });
}

// ============================================================
// Wire up
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = getLang();
  applyStatic();
  wireLanguage();
  wireAuth();
  wireNav();
  $('#plan-go').addEventListener('click', runPlanner);
  $('#plan-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runPlanner();
  });
  boot();
});
