// ============================================================
// BRAW — app shell: auth, navigation, views, event wiring.
// GPS tracking + geofencing integrated via GeoTracker.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, LEVELS, XP_EVENTS, ACHIEVEMENTS, RIVALS, EXAMPLE_PROMPTS } from './data.js';
import { store } from './store.js';
import { awardXP, evaluateAchievements, userStats, toastInfo, toastXP, burstConfetti, setQuiet } from './gamification.js';
import { generateTrip, tripProgress, tripStopIds } from './planner.js';
import { renderMap } from './scotland-map.js';
import { GeoTracker } from './geotracking.js';

let user      = null;
let draftTrip = null;
let openTripId = null;

// Singleton GPS tracker — persists across view switches so tracking
// doesn't reset when the user navigates away from the trip detail.
const tracker = new GeoTracker({
  onUpdate:     pos => onLocationUpdate(pos),
  onEnterFence: (poi, dist) => onGeofenceEnter(poi, dist),
  onError:      err => onGpsError(err),
});

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

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
// Auth
// ============================================================
function wireAuth() {
  $$('.auth-tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.auth-tab').forEach(t => t.classList.toggle('active', t === tab));
    const mode = tab.dataset.mode;
    $('#auth-submit').textContent = mode === 'login' ? 'Sign in' : 'Create account';
    $('#auth-form').dataset.mode = mode;
    $('#auth-error').textContent = '';
    const head = document.querySelector('.auth-card-head h2');
    if (head) head.textContent = mode === 'login' ? 'Welcome back' : 'Create an account';
  }));

  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const name = $('#auth-name').value;
    const pass = $('#auth-pass').value;
    const mode = $('#auth-form').dataset.mode;
    $('#auth-error').textContent = '';
    try {
      if (mode === 'login') {
        user = await store.login(name, pass);
        toastInfo(`Welcome back, ${user.name}.`, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      } else {
        user = await store.register(name, pass);
        awardXP(user, XP_EVENTS.JOIN, 'Joined BRAW', '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
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
      awardXP(user, XP_EVENTS.JOIN, 'Joined BRAW', '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
      seedDemoProgress();
      setQuiet(false);
    }
    enterApp();
    const lvl = LEVELS.fromXP(user.xp);
    setTimeout(() => toastInfo(`Demo account loaded — LVL ${lvl.level} ${LEVELS.titleFor(lvl.level)}.`, '🎲'), 400);
  });
}

function seedDemoProgress() {
  const trip = generateTrip('5 days of highland castles and whisky distilleries from Inverness');
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
// Header
// ============================================================
function renderHeader() {
  if (!user) return;
  const { level, into, need } = LEVELS.fromXP(user.xp);
  $('#hdr-avatar').textContent = user.name[0].toUpperCase();
  $('#hdr-name').textContent   = user.name;
  $('#hdr-level').textContent  = `LVL ${level}`;
  $('#hdr-title').textContent  = LEVELS.titleFor(level);
  $('#hdr-xp-fill').style.width = `${Math.round((into / need) * 100)}%`;
  $('#hdr-xp-label').textContent = `${into} / ${need} XP`;
}

// ============================================================
// Navigation
// ============================================================
const VIEWS = ['plan', 'trips', 'trip', 'badges', 'leaderboard', 'profile'];

function switchView(name) {
  VIEWS.forEach(v => $(`#view-${v}`).hidden = v !== name);
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const renderers = {
    plan: renderPlan, trips: renderTrips, trip: renderTripDetail,
    badges: renderBadges, leaderboard: renderLeaderboard, profile: renderProfile,
  };
  renderers[name]?.();
  renderHeader();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function wireNav() {
  $$('.nav-btn').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  $('#logout-btn').addEventListener('click', () => {
    tracker.stop();
    store.logout();
    user = null; draftTrip = null; openTripId = null;
    showAuth();
  });
}

// ============================================================
// View: Plan
// ============================================================
function renderPlan() {
  const host = $('#example-chips');
  host.innerHTML = EXAMPLE_PROMPTS.map(p =>
    `<button class="chip" data-prompt="${esc(p)}">${esc(p)}</button>`
  ).join('');
  host.querySelectorAll('.chip').forEach(c =>
    c.addEventListener('click', () => { $('#plan-input').value = c.dataset.prompt; $('#plan-input').focus(); })
  );
  if (!draftTrip) { $('#plan-result').hidden = true; $('#plan-thinking').hidden = true; }
  else renderDraft();
}

const THINKING_STEPS = [
  ['📖', 'Reading your interests…'],
  [`🔍`, `Searching ${POIS.length} Scottish locations…`],
  ['🧮', 'Scoring and matching stops…'],
  ['🧭', 'Planning the optimal route…'],
  ['✅', 'Itinerary ready.'],
];

async function runPlanner() {
  const text = $('#plan-input').value.trim();
  if (text.length < 6) { toastInfo('Add a little more detail about what you\'re looking for.', '✍️'); return; }

  $('#plan-result').hidden = true;
  const think = $('#plan-thinking');
  think.hidden = false; think.innerHTML = '';

  for (const [icon, label] of THINKING_STEPS) {
    const row = document.createElement('div');
    row.className = 'think-step';
    row.innerHTML = `<span>${icon}</span> ${label}`;
    think.appendChild(row);
    await new Promise(r => setTimeout(r, 10));
    requestAnimationFrame(() => row.classList.add('on'));
    await new Promise(r => setTimeout(r, 360 + Math.random() * 180));
  }

  draftTrip = generateTrip(text);
  think.hidden = true;
  renderDraft();
}

function interestPills(keys) {
  if (!keys.length) return `<span class="pill">Best of Scotland</span>`;
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
          <span class="kicker">Your itinerary</span>
          <h2 class="trip-title">${esc(t.title)}</h2>
          <div class="pill-row">
            ${interestPills(t.interests)}
            <span class="pill pill-neutral">≈${t.distanceMi} mi driving</span>
            <span class="pill pill-neutral">${t.paceLabel} pace</span>
            <span class="pill pill-sage">+${t.xpOnOffer + XP_EVENTS.CREATE_TRIP} XP on offer</span>
          </div>
        </div>
        <div class="sheet-actions">
          <button class="btn btn-ghost" id="reshuffle-btn">Reshuffle</button>
          <button class="btn btn-primary" id="save-trip-btn">Save &amp; start quest →</button>
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
// View: Trip list
// ============================================================
function renderTrips() {
  const host = $('#trips-list');
  if (!user.trips.length) {
    host.innerHTML = `
      <div class="empty-state card">
        <div class="empty-icon">🗺️</div>
        <h3>No quests yet</h3>
        <p>Describe what you're looking for and we'll build a personalised itinerary across Scotland.</p>
        <button class="btn btn-primary" id="empty-plan-btn">Create my first quest →</button>
      </div>`;
    $('#empty-plan-btn').addEventListener('click', () => switchView('plan'));
    return;
  }

  host.innerHTML = user.trips.map(t => {
    const pr  = tripProgress(t);
    const done = !!t.completedAt;
    return `
    <button class="trip-card card ${done ? 'is-complete' : ''}" data-trip="${t.id}">
      <div class="tc-top">
        <span class="tc-icon">${done ? '🏁' : '🛤️'}</span>
        <div class="tc-names">
          <span class="tc-title">${esc(t.title)}</span>
          <span class="tc-sub">${t.days.length} days · ${pr.total} stops · ≈${t.distanceMi} mi · from ${esc(t.start.name)}</span>
        </div>
        ${done
          ? '<span class="tc-badge">COMPLETED</span>'
          : `<span class="tc-pct">${pr.pct}%</span>`}
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
      const poi     = POI_BY_ID[id];
      const visited = !!trip.visited[id];
      return `
      <div class="stop ${visited ? 'is-visited' : ''}" data-poi="${id}">
        <div class="stop-order">${visited ? '✓' : order}</div>
        <div class="stop-body">
          <div class="stop-name">${poi.icon} ${esc(poi.name)}</div>
          <div class="stop-meta">${esc(poi.region)} · ${poi.time} · <span class="stop-xp">+${poi.xp} XP</span></div>
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
      <header class="day-head">
        <span class="day-num">Day ${d.day}</span>
        <span class="day-regions">${esc(regions.join(' → '))}</span>
      </header>
      ${stopsHTML}
    </section>`;
  }).join('');
}

function renderTripDetail() {
  const trip = user.trips.find(t => t.id === openTripId) || user.trips[0];
  const host = $('#trip-detail');
  if (!trip) { host.innerHTML = '<p class="muted" style="padding:2rem">No quest selected.</p>'; return; }
  openTripId = trip.id;

  const pr    = tripProgress(trip);
  let order   = 0;
  const stops = tripStopIds(trip).map(id => ({ poi: POI_BY_ID[id], visited: !!trip.visited[id], order: ++order }));
  const next  = stops.find(s => !s.visited);

  // GPS tracking state
  const isTracking  = tracker.isTracking;
  const hasPos      = !!tracker.position;
  const posStr      = hasPos
    ? `${tracker.position.lat.toFixed(4)}, ${tracker.position.lon.toFixed(4)} (±${Math.round(tracker.position.accuracy)}m)`
    : 'No fix yet';

  const unvisitedPois = stops.filter(s => !s.visited).map(s => s.poi);

  host.innerHTML = `
    <button class="back-link" id="back-to-trips">← All quests</button>
    <div class="trip-sheet card ${trip.completedAt ? 'is-complete' : ''}">
      <div class="sheet-head">
        <div>
          <span class="kicker">${trip.completedAt ? 'Completed quest' : 'Active quest'}</span>
          <h2 class="trip-title">${esc(trip.title)}</h2>
          <div class="pill-row">
            ${interestPills(trip.interests)}
            <span class="pill pill-neutral">≈${trip.distanceMi} mi</span>
            <span class="pill pill-neutral">from ${esc(trip.start.name)}</span>
          </div>
          <p class="trip-prompt">"${esc(trip.prompt)}"</p>
        </div>
        <div class="ring-wrap" title="${pr.done}/${pr.total} visited">
          <svg viewBox="0 0 90 90" class="ring">
            <circle cx="45" cy="45" r="38" class="ring-bg"/>
            <circle cx="45" cy="45" r="38" class="ring-fg" stroke-dasharray="${(pr.pct / 100 * 238.8).toFixed(1)} 238.8"/>
          </svg>
          <div class="ring-label"><b>${pr.pct}%</b><span>${pr.done}/${pr.total}</span></div>
        </div>
      </div>

      ${trip.completedAt
        ? `<div class="complete-banner">🏁 Quest complete — every stop conquered. Scotland salutes you.</div>`
        : next
          ? `<div class="next-up">
              <span class="nu-kicker">Next stop</span>
              <span class="nu-name">${next.poi.icon} ${esc(next.poi.name)}</span>
              <span class="nu-meta">${esc(next.poi.region)} · stop ${next.order} of ${pr.total} · +${next.poi.xp} XP</span>
             </div>`
          : ''}

      <!-- GPS Tracking panel -->
      <div class="gps-panel">
        <div class="gps-status">
          <div class="gps-dot ${isTracking ? 'active' : ''}"></div>
          <div>
            <div class="gps-label">${isTracking ? 'Live GPS active' : 'GPS tracking'}</div>
            <div class="gps-sub">${isTracking ? posStr : 'Enable to detect when you arrive at each location'}</div>
          </div>
        </div>
        <div class="gps-actions">
          ${isTracking
            ? `<button class="btn btn-ghost btn-sm" id="gps-stop-btn">Stop tracking</button>`
            : `<button class="btn btn-primary btn-sm" id="gps-start-btn">Enable GPS</button>`}
          <button class="btn btn-ghost btn-sm" id="gps-sim-btn" title="Simulate arriving at the next unvisited stop — useful for testing">
            Simulate arrival
          </button>
        </div>
      </div>

      <div class="trip-layout">
        <div class="map-panel" id="trip-map">${renderMap(stops, trip.start, tracker.position)}</div>
        <div class="days-panel">${dayListHTML(trip, true)}</div>
      </div>
    </div>`;

  $('#back-to-trips').addEventListener('click', () => switchView('trips'));

  // Visit toggle
  host.querySelectorAll('[data-visit]').forEach(btn =>
    btn.addEventListener('click', e => { e.stopPropagation(); toggleVisited(trip, btn.dataset.visit); })
  );

  // GPS start / stop
  const startBtn = $('#gps-start-btn');
  const stopBtn  = $('#gps-stop-btn');
  const simBtn   = $('#gps-sim-btn');

  if (startBtn) startBtn.addEventListener('click', () => startTracking(trip));
  if (stopBtn)  stopBtn.addEventListener('click',  () => { tracker.stop(); renderTripDetail(); renderHeader(); });
  if (simBtn)   simBtn.addEventListener('click',   () => simulateArrival(trip));

  // Arm fences for unvisited stops
  if (isTracking) {
    tracker.setFences(unvisitedPois);
    // Re-arm any that were already triggered but then unmarked
    for (const s of stops) {
      if (s.visited) tracker.armFence(s.poi.id);
    }
  }

  wireMarkerHover(host);
}

// ---- GPS callbacks ----

function startTracking(trip) {
  const unvisited = tripStopIds(trip)
    .filter(id => !trip.visited[id])
    .map(id => POI_BY_ID[id]);
  tracker.setFences(unvisited, 500);

  const ok = tracker.start();
  if (!ok) {
    toastInfo('Geolocation is not available in this browser.', '⚠️');
    return;
  }

  // Request browser notification permission (nice-to-have).
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  toastInfo('GPS tracking started. Move to within 500m of a stop to log it automatically.', '📍');
  renderTripDetail();
}

function onLocationUpdate(pos) {
  // Re-render only the map panel — avoids full view re-render on every fix.
  const mapPanel = $('#trip-map');
  if (!mapPanel) return;

  const trip = user?.trips.find(t => t.id === openTripId);
  if (!trip) return;

  let order = 0;
  const stops = tripStopIds(trip).map(id => ({ poi: POI_BY_ID[id], visited: !!trip.visited[id], order: ++order }));
  mapPanel.innerHTML = renderMap(stops, trip.start, pos);

  // Update status text
  const sub = $('.gps-sub');
  if (sub) sub.textContent = `${pos.lat.toFixed(4)}, ${pos.lon.toFixed(4)} (±${Math.round(pos.accuracy)}m)`;

  wireMarkerHover(mapPanel);
}

function onGeofenceEnter(poi, distM) {
  const trip = user?.trips.find(t => t.id === openTripId);
  if (!trip || trip.visited[poi.id]) return;

  // Show in-app geofence prompt
  const prompt = $('#geo-prompt');
  $('#geo-icon').textContent       = poi.icon;
  $('#geo-poi-name').textContent   = poi.name;
  $('#geo-meta').textContent       = `${poi.region} · ${distM}m away · +${poi.xp} XP`;
  prompt.classList.add('show');

  // Wire buttons
  const confirm  = $('#geo-confirm');
  const dismiss  = $('#geo-dismiss');
  let handled    = false;

  const handle = (doVisit) => {
    if (handled) return; handled = true;
    prompt.classList.remove('show');
    if (doVisit) toggleVisited(trip, poi.id);
    confirm.replaceWith(confirm.cloneNode(true));
    dismiss.replaceWith(dismiss.cloneNode(true));
  };

  $('#geo-confirm').addEventListener('click', () => handle(true),  { once: true });
  $('#geo-dismiss').addEventListener('click', () => handle(false), { once: true });

  // Auto-dismiss after 30s
  setTimeout(() => handle(false), 30_000);

  // Browser notification (bonus layer)
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`You've arrived: ${poi.name}`, {
      body: `${poi.region} · +${poi.xp} XP. Open BRAW to mark it visited.`,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">📍</text></svg>',
    });
  }
}

function simulateArrival(trip) {
  const unvisited = tripStopIds(trip).filter(id => !trip.visited[id]);
  if (!unvisited.length) { toastInfo('All stops already visited!', '🏁'); return; }
  const targetId = unvisited[0];
  const poi = POI_BY_ID[targetId];

  // Ensure fences are set so the geofence fires on simulate
  const unvisitedPois = unvisited.map(id => POI_BY_ID[id]);
  tracker.setFences(unvisitedPois, 500);

  toastInfo(`Simulating arrival at ${poi.name}…`, '🛰️');
  tracker.simulate(poi, 120);
}

function onGpsError(err) {
  const messages = {
    1: 'Location access denied. Enable it in your browser settings.',
    2: 'Location unavailable. Check your connection.',
    3: 'Location request timed out.',
  };
  toastInfo(messages[err.code] || err.message, '⚠️');
  renderTripDetail();
}

// ---- visit toggle ----
function toggleVisited(trip, poiId) {
  const poi = POI_BY_ID[poiId];
  if (trip.visited[poiId]) {
    delete trip.visited[poiId];
    if (trip.completedAt) trip.completedAt = null;
    awardXP(user, -poi.xp, `Unmarked ${poi.name}`, '↩️');
    tracker.resetFence(poiId);
  } else {
    trip.visited[poiId] = Date.now();
    awardXP(user, poi.xp, `Visited ${poi.name}`, poi.icon);
    tracker.armFence(poiId);

    const pr = tripProgress(trip);
    if (pr.done === pr.total && !trip.completedAt) {
      trip.completedAt = Date.now();
      awardXP(user, XP_EVENTS.COMPLETE_TRIP, `Quest completed: ${trip.title}`, '🏁');
      burstConfetti(55);
    }
    evaluateAchievements(user);
  }
  store.save();
  renderTripDetail();
  renderHeader();
}

function wireMarkerHover(scope) {
  scope.querySelectorAll('.map-marker').forEach(m =>
    m.addEventListener('click', () => {
      const stop = scope.querySelector(`.stop[data-poi="${m.dataset.poi}"]`);
      if (stop) {
        stop.scrollIntoView({ behavior: 'smooth', block: 'center' });
        stop.classList.add('flash');
        setTimeout(() => stop.classList.remove('flash'), 1600);
      }
    })
  );
}

// ============================================================
// View: Achievements
// ============================================================
function renderBadges() {
  const owned = new Map(user.achievements.map(a => [a.id, a.at]));
  $('#badges-count-label').textContent = `${owned.size} of ${ACHIEVEMENTS.length} unlocked`;
  $('#badges-progress-fill').style.width = `${Math.round((owned.size / ACHIEVEMENTS.length) * 100)}%`;

  $('#badges-grid').innerHTML = ACHIEVEMENTS.map(def => {
    const at = owned.get(def.id);
    return `
    <div class="badge card ${at ? 'unlocked' : 'locked'}">
      <div class="badge-shield">${at ? def.icon : '🔒'}</div>
      <div class="badge-name">${def.name}</div>
      <div class="badge-desc">${def.desc}</div>
      <div class="badge-xp">${at
        ? `Unlocked ${new Date(at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}`
        : `Reward: +${def.xp} XP`}</div>
    </div>`;
  }).join('');
}

// ============================================================
// View: Leaderboard
// ============================================================
function renderLeaderboard() {
  const s   = userStats(user);
  const you = { name: user.name, xp: user.xp, visited: s.visitedCount, trips: s.tripsCompleted, you: true, colour: '#c98a40' };
  const rows = [...RIVALS, you].sort((a, b) => b.xp - a.xp);

  $('#leaderboard-table').innerHTML = `
    <div class="lb-row lb-head">
      <span>#</span><span>Explorer</span><span>Level</span><span>Locations</span><span>Quests done</span><span>XP</span>
    </div>` +
    rows.map((r, i) => {
      const lvl    = LEVELS.fromXP(r.xp).level;
      const medal  = ['🥇', '🥈', '🥉'][i] || `${i + 1}`;
      return `
      <div class="lb-row ${r.you ? 'lb-you' : ''}">
        <span class="lb-rank">${medal}</span>
        <span class="lb-name">
          <i class="lb-avatar" style="background:${r.colour}">${r.name[0].toUpperCase()}</i>
          ${esc(r.name)}${r.you ? ' <b>· You</b>' : ''}
        </span>
        <span>LVL ${lvl} <small>${LEVELS.titleFor(lvl)}</small></span>
        <span>${r.visited}</span>
        <span>${r.trips}</span>
        <span class="lb-xp">${r.xp.toLocaleString()}</span>
      </div>`;
    }).join('');

  const rank  = rows.findIndex(r => r.you) + 1;
  const ahead = rank > 1 ? rows[rank - 2].xp - user.xp + 1 : 0;
  $('#leaderboard-note').textContent = rank === 1
    ? 'You lead the leaderboard. Keep exploring.'
    : `You're ranked #${rank} of ${rows.length}. ${ahead.toLocaleString()} XP to overtake ${rows[rank - 2].name}.`;
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
        <div class="ph-rank">LVL ${level} · ${LEVELS.titleFor(level)}</div>
        <div class="progress md" style="max-width:300px">
          <div class="progress-fill" style="width:${Math.round((into / need) * 100)}%"></div>
        </div>
        <div class="ph-xp">${into.toLocaleString()} / ${need.toLocaleString()} XP to level ${level + 1} · ${user.xp.toLocaleString()} XP total</div>
      </div>
      <button class="btn btn-ghost" id="profile-logout">Sign out</button>
    </div>

    <div class="stat-grid">
      ${[
        ['📍', s.visitedCount,     'Locations visited'],
        ['🗺️', s.tripsCreated,    'Quests created'],
        ['🏁', s.tripsCompleted,   'Quests completed'],
        ['🏰', s.castles,          'Castles visited'],
        ['🥃', s.distilleries,     'Distilleries'],
        ['🌍', s.regions,          'Regions explored'],
        ['🏔️', s.peaks,            'Peaks bagged'],
        ['🏅', user.achievements.length, 'Achievements'],
      ].map(([icon, n, label]) => `
        <div class="stat card">
          <span class="stat-icon">${icon}</span>
          <span class="stat-n">${n}</span>
          <span class="stat-label">${label}</span>
        </div>`).join('')}
    </div>

    <div class="card activity-card">
      <h3>Recent activity</h3>
      ${user.activity.length
        ? user.activity.slice(0, 10).map(a => `
          <div class="act-row">
            <span>${a.icon}</span>
            <span class="act-text">${esc(a.text)}</span>
            <span class="act-xp ${a.xp < 0 ? 'neg' : ''}">${a.xp >= 0 ? '+' : ''}${a.xp} XP</span>
            <span class="act-when">${timeAgo(a.at)}</span>
          </div>`).join('')
        : '<p class="muted" style="padding:0.5rem 0">No activity yet — start exploring!</p>'}
    </div>`;

  $('#profile-logout').addEventListener('click', () => $('#logout-btn').click());
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)     return 'just now';
  if (s < 3600)   return `${Math.floor(s / 60)}m ago`;
  if (s < 86400)  return `${Math.floor(s / 3600)}h ago`;
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
