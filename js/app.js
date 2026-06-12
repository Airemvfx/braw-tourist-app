// ============================================================
// BRAW — app shell: auth, navigation, views, event wiring.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, LEVELS, XP_EVENTS, ACHIEVEMENTS, RIVALS, EXAMPLE_PROMPTS } from './data.js';
import { store } from './store.js';
import { awardXP, evaluateAchievements, userStats, toastInfo, burstConfetti, setQuiet } from './gamification.js';
import { generateTrip, tripProgress, tripStopIds } from './planner.js';
import { renderMap } from './scotland-map.js';

let user = null;          // current logged-in profile
let draftTrip = null;     // generated but not yet saved
let openTripId = null;    // trip shown in detail view

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
// Auth screen
// ============================================================

function wireAuth() {
  $$('.auth-tab').forEach(tab =>
    tab.addEventListener('click', () => {
      $$('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
      const mode = tab.dataset.mode;
      $('#auth-submit').textContent = mode === 'login' ? 'Sign in →' : 'Create account →';
      $('#auth-form').dataset.mode = mode;
      $('#auth-error').textContent = '';
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
        toastInfo(`Welcome back, ${user.name}!`, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      } else {
        user = await store.register(name, pass);
        awardXP(user, XP_EVENTS.JOIN, 'Joined the expedition', '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      }
      enterApp();
    } catch (err) {
      $('#auth-error').textContent = err.message;
    }
  });

  $('#demo-btn').addEventListener('click', async () => {
    const demoName = 'WeeExplorer';
    try { user = await store.login(demoName, 'demo1234'); }
    catch {
      user = await store.register(demoName, 'demo1234');
      setQuiet(true);
      awardXP(user, XP_EVENTS.JOIN, 'Joined the expedition', '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      seedDemoProgress();
      setQuiet(false);
    }
    enterApp();
    const lvl = LEVELS.fromXP(user.xp);
    toastInfo(`Welcome, ${user.name} — LVL ${lvl.level} ${LEVELS.titleFor(lvl.level)} with a quest underway!`, '🎲');
  });
}

/** Give the demo account a head start so every screen has life in it. */
function seedDemoProgress() {
  const trip = generateTrip('5 days of castles, whisky and misty lochs starting from Edinburgh');
  user.trips.unshift(trip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, `Quest created: ${trip.title}`, '🗺️');
  const ids = tripStopIds(trip).slice(0, 4);
  for (const id of ids) {
    trip.visited[id] = Date.now();
    awardXP(user, POI_BY_ID[id].xp, `Visited ${POI_BY_ID[id].name}`, POI_BY_ID[id].icon);
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
  $('#hdr-level').textContent = `LVL ${level}`;
  $('#hdr-title').textContent = LEVELS.titleFor(level);
  $('#hdr-xp-fill').style.width = `${Math.round((into / need) * 100)}%`;
  $('#hdr-xp-label').textContent = `${into} / ${need} XP`;
}

// ============================================================
// Navigation
// ============================================================

const VIEWS = ['plan', 'trips', 'trip', 'badges', 'leaderboard', 'profile'];

function switchView(name) {
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
  host.innerHTML = EXAMPLE_PROMPTS.map(p => `<button class="chip" data-prompt="${esc(p)}">${esc(p)}</button>`).join('');
  host.querySelectorAll('.chip').forEach(c =>
    c.addEventListener('click', () => { $('#plan-input').value = c.dataset.prompt; $('#plan-input').focus(); })
  );
  if (!draftTrip) { $('#plan-result').hidden = true; $('#plan-thinking').hidden = true; }
  else renderDraft();
}

const THINKING_STEPS = [
  ['📖', 'Reading your wishes…'],
  ['🔍', `Scouting ${POIS.length} Scottish locations…`],
  ['🧮', 'Matching interests and scoring stops…'],
  ['🧭', 'Charting the bonniest route…'],
  ['✨', 'Polishing your quest…'],
];

async function runPlanner() {
  const text = $('#plan-input').value.trim();
  if (text.length < 8) { toastInfo('Tell me a wee bit more about your dream trip!', '✍️'); return; }

  $('#plan-result').hidden = true;
  const think = $('#plan-thinking');
  think.hidden = false;
  think.innerHTML = '';
  for (const [icon, label] of THINKING_STEPS) {
    const row = document.createElement('div');
    row.className = 'think-step';
    row.innerHTML = `<span>${icon}</span> ${label}`;
    think.appendChild(row);
    requestAnimationFrame(() => row.classList.add('on'));
    await new Promise(r => setTimeout(r, 380 + Math.random() * 220));
  }
  draftTrip = generateTrip(text);
  think.hidden = true;
  renderDraft();
}

function interestPills(keys) {
  if (!keys.length) return `<span class="pill">✨ Best of Scotland</span>`;
  return keys.map(k => `<span class="pill">${INTERESTS[k].icon} ${INTERESTS[k].label}</span>`).join('');
}

function renderDraft() {
  const t = draftTrip;
  const box = $('#plan-result');
  box.hidden = false;
  const stops = tripStopIds(t).map((id, i) => ({ poi: POI_BY_ID[id], visited: false, order: i + 1 }));

  box.innerHTML = `
    <div class="trip-sheet card">
      <div class="sheet-head">
        <div>
          <div class="kicker">YOUR QUEST AWAITS</div>
          <h2 class="trip-title">${esc(t.title)}</h2>
          <div class="pill-row">${interestPills(t.interests)}
            <span class="pill pill-dim">🚗 ≈${t.distanceMi} mi</span>
            <span class="pill pill-dim">⚡ ${t.paceLabel} pace</span>
            <span class="pill pill-gold">✦ ${t.xpOnOffer + XP_EVENTS.CREATE_TRIP} XP on offer</span>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="btn btn-ghost" id="reshuffle-btn">🎲 Reshuffle</button>
          <button class="btn btn-primary" id="save-trip-btn">Begin this Quest ⚔️</button>
        </div>
      </div>
      <div class="trip-layout">
        <div class="map-panel">${renderMap(stops, t.start)}</div>
        <div class="days-panel">${dayListHTML(t, false)}</div>
      </div>
    </div>`;

  $('#reshuffle-btn').addEventListener('click', () => { draftTrip = generateTrip(t.prompt); renderDraft(); });
  $('#save-trip-btn').addEventListener('click', saveDraft);
  wireMarkerHover(box);
}

function saveDraft() {
  user.trips.unshift(draftTrip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, `Quest created: ${draftTrip.title}`, '🗺️');
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
        <h3>Nae quests yet!</h3>
        <p>Describe your dream Scottish adventure and let the planner chart your course.</p>
        <button class="btn btn-primary" id="empty-plan-btn">Plan my first quest →</button>
      </div>`;
    $('#empty-plan-btn').addEventListener('click', () => switchView('plan'));
    return;
  }

  host.innerHTML = user.trips.map(t => {
    const pr = tripProgress(t);
    const done = !!t.completedAt;
    return `
    <button class="trip-card card ${done ? 'is-complete' : ''}" data-trip="${t.id}">
      <div class="tc-top">
        <span class="tc-icon">${done ? '🏁' : '🛤️'}</span>
        <div class="tc-names">
          <span class="tc-title">${esc(t.title)}</span>
          <span class="tc-sub">${t.days.length} days · ${pr.total} stops · ≈${t.distanceMi} mi · from ${esc(t.start.name)}</span>
        </div>
        ${done ? '<span class="tc-badge">COMPLETED</span>' : `<span class="tc-pct">${pr.pct}%</span>`}
      </div>
      <div class="progress"><div class="progress-fill" style="width:${pr.pct}%"></div></div>
      <div class="tc-foot">${pr.done} of ${pr.total} locations visited</div>
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
          <div class="stop-name">${poi.icon} ${esc(poi.name)}</div>
          <div class="stop-meta">${esc(poi.region)} · ${poi.time} · <span class="stop-xp">✦ ${poi.xp} XP</span></div>
          <div class="stop-blurb">${esc(poi.blurb)}</div>
        </div>
        ${interactive ? `
        <button class="visit-btn ${visited ? 'undo' : ''}" data-visit="${id}">
          ${visited ? 'Visited ✓' : 'Mark visited'}
        </button>` : ''}
      </div>`;
    }).join('');
    const regions = [...new Set(d.stops.map(id => POI_BY_ID[id].region))];
    return `
    <section class="day-block">
      <header class="day-head"><span class="day-num">DAY ${d.day}</span><span class="day-regions">${esc(regions.join(' → '))}</span></header>
      ${stopsHTML}
    </section>`;
  }).join('');
}

function renderTripDetail() {
  const trip = user.trips.find(t => t.id === openTripId) || user.trips[0];
  const host = $('#trip-detail');
  if (!trip) { host.innerHTML = '<p class="muted">No quest selected.</p>'; return; }
  openTripId = trip.id;

  const pr = tripProgress(trip);
  let order = 0;
  const stops = tripStopIds(trip).map(id => ({ poi: POI_BY_ID[id], visited: !!trip.visited[id], order: ++order }));
  const next = stops.find(s => !s.visited);

  host.innerHTML = `
    <button class="back-link" id="back-to-trips">← All quests</button>
    <div class="trip-sheet card ${trip.completedAt ? 'is-complete' : ''}">
      <div class="sheet-head">
        <div>
          <div class="kicker">${trip.completedAt ? '🏁 QUEST COMPLETE' : 'ACTIVE QUEST'}</div>
          <h2 class="trip-title">${esc(trip.title)}</h2>
          <div class="pill-row">${interestPills(trip.interests)}
            <span class="pill pill-dim">🚗 ≈${trip.distanceMi} mi</span>
            <span class="pill pill-dim">📍 from ${esc(trip.start.name)}</span>
          </div>
          <p class="trip-prompt">“${esc(trip.prompt)}”</p>
        </div>
        <div class="ring-wrap" title="${pr.done}/${pr.total} visited">
          <svg viewBox="0 0 90 90" class="ring">
            <circle cx="45" cy="45" r="38" class="ring-bg"/>
            <circle cx="45" cy="45" r="38" class="ring-fg" stroke-dasharray="${(pr.pct / 100) * 238.8} 238.8"/>
          </svg>
          <div class="ring-label"><b>${pr.pct}%</b><span>${pr.done}/${pr.total}</span></div>
        </div>
      </div>

      ${trip.completedAt ? `
        <div class="complete-banner">🎉 Every stop conquered! +${XP_EVENTS.COMPLETE_TRIP} XP claimed. Scotland salutes you.</div>
      ` : next ? `
        <div class="next-up">
          <span class="nu-kicker">NEXT UP</span>
          <span class="nu-name">${next.poi.icon} ${esc(next.poi.name)}</span>
          <span class="nu-meta">${esc(next.poi.region)} · stop ${next.order} of ${pr.total} · ✦ ${next.poi.xp} XP</span>
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
    awardXP(user, -poi.xp, `Unmarked ${poi.name}`, '↩️');
    toastInfo(`${poi.name} unmarked (−${poi.xp} XP)`, '↩️');
  } else {
    trip.visited[poiId] = Date.now();
    awardXP(user, poi.xp, `Visited ${poi.name}`, poi.icon);
    const pr = tripProgress(trip);
    if (pr.done === pr.total && !trip.completedAt) {
      trip.completedAt = Date.now();
      awardXP(user, XP_EVENTS.COMPLETE_TRIP, `Quest completed: ${trip.title}`, '🏁');
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
  $('#badges-count').textContent = `${owned.size} / ${ACHIEVEMENTS.length} unlocked`;
  $('#badges-grid').innerHTML = ACHIEVEMENTS.map(def => {
    const at = owned.get(def.id);
    return `
    <div class="badge card ${at ? 'unlocked' : 'locked'}">
      <div class="badge-shield">${at ? def.icon : '🔒'}</div>
      <div class="badge-name">${def.name}</div>
      <div class="badge-desc">${def.desc}</div>
      <div class="badge-xp">${at ? `Unlocked ${new Date(at).toLocaleDateString()}` : `Reward: +${def.xp} XP`}</div>
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
      <span>#</span><span>Explorer</span><span>Level</span><span>Locations</span><span>Quests done</span><span>XP</span>
    </div>` +
    rows.map((r, i) => {
      const lvl = LEVELS.fromXP(r.xp).level;
      const medal = ['🥇', '🥈', '🥉'][i] || `${i + 1}`;
      return `
      <div class="lb-row ${r.you ? 'lb-you' : ''}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-name"><i class="lb-avatar" style="background:${r.colour}">${r.name[0].toUpperCase()}</i>${esc(r.name)}${r.you ? ' <b>· YOU</b>' : ''}</span>
        <span>LVL ${lvl} <small>${LEVELS.titleFor(lvl)}</small></span>
        <span>${r.visited}</span>
        <span>${r.trips}</span>
        <span class="lb-xp">${r.xp.toLocaleString()} ✦</span>
      </div>`;
    }).join('');

  const rank = rows.findIndex(r => r.you) + 1;
  const ahead = rank > 1 ? rows[rank - 2].xp - user.xp + 1 : 0;
  $('#leaderboard-note').textContent = rank === 1
    ? 'You sit at the top o’ the mountain. Defend it!'
    : `You're #${rank} of ${rows.length}. ${ahead.toLocaleString()} XP to overtake ${rows[rank - 2].name}.`;
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
        <div class="ph-title">LVL ${level} · ${LEVELS.titleFor(level)}</div>
        <div class="progress big"><div class="progress-fill" style="width:${Math.round((into / need) * 100)}%"></div></div>
        <div class="ph-xp">${into} / ${need} XP to level ${level + 1} · ${user.xp.toLocaleString()} XP total</div>
      </div>
      <button class="btn btn-ghost" id="profile-logout">Sign out</button>
    </div>

    <div class="stat-grid">
      ${[
        ['📍', s.visitedCount, 'locations visited'],
        ['🗺️', s.tripsCreated, 'quests created'],
        ['🏁', s.tripsCompleted, 'quests completed'],
        ['🏰', s.castles, 'castles stormed'],
        ['🥃', s.distilleries, 'drams earned'],
        ['🌍', s.regions, 'regions explored'],
        ['🏔️', s.peaks, 'peaks bagged'],
        ['🏅', user.achievements.length, 'achievements'],
      ].map(([icon, n, label]) => `
        <div class="stat card"><span class="stat-icon">${icon}</span><span class="stat-n">${n}</span><span class="stat-label">${label}</span></div>`).join('')}
    </div>

    <div class="card activity-card">
      <h3>Recent activity</h3>
      ${user.activity.length ? user.activity.slice(0, 8).map(a => `
        <div class="act-row">
          <span class="act-icon">${a.icon}</span>
          <span class="act-text">${esc(a.text)}</span>
          <span class="act-xp ${a.xp < 0 ? 'neg' : ''}">${a.xp >= 0 ? '+' : ''}${a.xp} XP</span>
          <span class="act-when">${timeAgo(a.at)}</span>
        </div>`).join('') : '<p class="muted">Nothing yet — go make some memories!</p>'}
    </div>`;

  $('#profile-logout').addEventListener('click', () => $('#logout-btn').click());
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

// ============================================================
// Wire up
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  wireAuth();
  wireNav();
  $('#plan-go').addEventListener('click', runPlanner);
  $('#plan-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runPlanner();
  });
  boot();
});
