// ============================================================
// BRAW — app shell: auth, navigation, views, event wiring.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, LEVELS, XP_EVENTS, ACHIEVEMENTS, RIVALS, REGIONS, START_CITIES } from './data.js';
import {
  routeStats, optimiseOrder, equipmentFor, advisoriesFor,
  stampPreview, buildCustomTrip,
} from './builder.js';
import { store } from './store.js';
import { initTheme, setMode, getMode, onThemeChange } from './theme.js';
import { awardXP, evaluateAchievements, evaluateStamps, regionProgress, userStats, toastInfo, burstConfetti, setQuiet, activityText } from './gamification.js';
import { generateTrip, tripProgress, tripStopIds, tripTitle, paceLabel, distKm } from './planner.js';
import { renderMap } from './scotland-map.js';
import { renderHero } from './hero-scene.js';
import { renderShowcase, startShowcase, stopShowcase } from './showcase.js';
import { loadPhotos, hasPhotos, mountBackdrop, mountCarousel, stopCarousel } from './photos-hero.js';
import { nextQuestion, gameXPFor, recordRun, answerName } from './minigame.js';
import { compressImage, savePhoto, getPhoto, deletePhoto, listPhotoIds } from './photos.js';
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
  startShowcase($('#sc-caption'));
}

function enterApp() {
  stopShowcase();                  // nothing to animate once past the door
  stopCarousel();
  $('#auth-screen').hidden = true;
  $('#app-screen').hidden = false;
  renderHeader();
  switchView(homeView());
}

/** Landing view: your quests if you have any, otherwise the planner. */
function homeView() {
  return user && user.trips.length ? 'trips' : 'plan';
}

// ============================================================
// Language
// ============================================================

function wireTheme() {
  $$('[data-theme-mode]').forEach(btn =>
    btn.addEventListener('click', () => setMode(btn.dataset.themeMode)));
  const sync = () => $$('[data-theme-mode]').forEach(b => {
    const on = b.dataset.themeMode === getMode();
    b.classList.toggle('active', on);
    b.setAttribute('aria-pressed', String(on));
  });
  onThemeChange(sync);
  sync();
}

function wireLanguage() {
  $$('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLang(btn.dataset.lang))
  );
  syncLangButtons();

  onLangChange(() => {
    syncLangButtons();
    syncAuthSubmit();
    if (user) { renderHeader(); switchView(currentView); }
    else renderLanding();          // redraw the preview in the new language
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
  evaluateStamps(user);
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

const VIEWS = ['plan', 'build', 'trips', 'trip', 'badges', 'play', 'leaderboard', 'profile'];

function switchView(name) {
  currentView = name;
  for (const v of VIEWS) $(`#view-${v}`).hidden = v !== name;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const renderers = { plan: renderPlan, build: renderBuild, trips: renderTrips, trip: renderTripDetail, badges: renderBadges, play: renderGame, leaderboard: renderLeaderboard, profile: renderProfile };
  renderers[name]?.();
  renderHeader();
  window.scrollTo({ top: 0 });
}

function wireNav() {
  $$('.nav-btn').forEach(b => b.addEventListener('click', () => switchView(b.dataset.view)));
  $$('.bd-tab').forEach(b => b.addEventListener('click', () => setBuildTab(b.dataset.bdTab)));
  $('#trips-cta').addEventListener('click', () => switchView('plan'));
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
  // Second copy of the landing glen, id-namespaced so its gradients and
  // clips cannot be captured by the one on the auth screen.
  const art = $('#plan-art');
  if (!art.firstChild) art.innerHTML = renderHero('plan');

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

/** Honour the OS reduced-motion setting for programmatic scrolling too. */
function scrollTo(el, block = 'center') {
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block });
}

async function runPlanner() {
  const btn = $('#plan-go');
  if (btn.dataset.busy === '1') return;          // ignore double-taps mid-run

  const text = $('#plan-input').value.trim();
  // A single interest word is a legitimate prompt — "whisky", "golf",
  // "skye" all resolve fine, with the planner's defaults filling the rest.
  // The old 8-character floor rejected them silently, which read as a
  // dead button. Only genuinely empty input is turned away now.
  if (text.length < 3) { toastInfo(t('plan.tooShort'), '✍️'); return; }

  // The planner takes a couple of seconds and its output renders further
  // down the page. On a phone the button looked inert and the work was
  // invisible below the fold, so say so on the button AND move the view
  // to the progress list.
  btn.dataset.busy = '1';
  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.textContent = t('plan.generating');

  $('#plan-result').hidden = true;
  const think = $('#plan-thinking');
  think.hidden = false;
  think.innerHTML = '';
  scrollTo(think);

  try {
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
    scrollTo($('#plan-result'), 'start');
  } finally {
    btn.dataset.busy = '0';
    btn.disabled = false;
    btn.classList.remove('is-loading');
    btn.textContent = t('plan.go');
  }
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
      <div class="poi-panel" hidden></div>
      <div class="map-stage">${renderMap(stops, trip.start)}</div>
      <div class="stop-list">${stopListHTML(trip, false)}</div>
    </div>`;

  $('#reshuffle-btn').addEventListener('click', () => { draftTrip = generateTrip(trip.prompt); renderDraft(); });
  $('#save-trip-btn').addEventListener('click', saveDraft);
  wireMapMarkers(box, trip, false);
  wireStopList(box, trip);
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
  const cta = $('#trips-cta');
  cta.hidden = !user.trips.length;
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
// View: Journey builder
//
// The planner writes a route from a sentence. This is the other door:
// every location in the dataset, filterable, orderable, and costed live
// as stops go on and come off. Everything it produces is an ordinary
// quest, so GPS tracking, XP and the passport all work unchanged.
// ============================================================

const build = {
  ids: [],              // selected locations, in route order
  startKey: 'edinburgh',
  auto: true,           // keep the order shortest-first
  days: 0,              // 0 → follow the recommendation
  filters: new Set(),   // interest keys
  query: '',
  tab: 'route',
};

const bdStart = () => START_CITIES[build.startKey];
const bdPois = () => build.ids.map(id => POI_BY_ID[id]).filter(Boolean);
const bdStats = () => routeStats(bdPois(), bdStart(), build.days);
const bdDays = s => build.days || s.daysNeeded;

/** One decimal below ten hours, whole numbers above — and localised. */
function fmtH(h) {
  const v = h < 10 ? Math.round(h * 10) / 10 : Math.round(h);
  return v.toLocaleString(locale());
}

/** A duration with its unit. Short hops read as minutes, not "0 h". */
function fmtDur(h) {
  return h < 1
    ? t('build.mins', { n: Math.max(5, Math.round(h * 60)) })
    : t('build.hours', { h: fmtH(h) });
}

const bdDistance = s => formatDistance({ distanceKm: s.km, distanceMi: s.mi });

/** SVG markers are not buttons, so give them the keyboard too. */
function onActivate(el, fn) {
  el.addEventListener('click', fn);
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); }
  });
}

/** In auto mode build.ids IS the optimised order — one source of truth. */
function bdReorder() {
  if (build.auto) build.ids = optimiseOrder(bdStart(), bdPois()).map(p => p.id);
}

/** Everything still on offer, after the filters and the search box. */
function bdCandidates() {
  const chosen = new Set(build.ids);
  const q = build.query.trim().toLowerCase();
  const wanted = new Set([...build.filters].flatMap(k => INTERESTS[k].tags));
  return POIS.filter(p => {
    if (chosen.has(p.id)) return false;
    if (wanted.size && !p.tags.some(tag => wanted.has(tag))) return false;
    if (!q) return true;
    // Search both languages, so either spelling of a place finds it.
    return `${poiName(p)} ${p.name} ${regionName(p.region)} ${p.region} ${poiBlurb(p)}`
      .toLowerCase().includes(q);
  });
}

function renderBuild() {
  bdReorder();
  renderBuildSummary();
  renderBuildMap();
  renderBuildControls();
  renderBuildTabs();
  renderBuildRoute();
  renderBuildAdd();
  renderBuildBrief();
  renderBuildActions();
}

/** Redraw everything except the add pane, whose input holds the caret. */
function refreshBuild() {
  bdReorder();
  renderBuildSummary();
  renderBuildMap();
  renderBuildControls();
  renderBuildTabs();
  renderBuildRoute();
  refreshAddList();
  renderBuildBrief();
  renderBuildActions();
}

function renderBuildSummary() {
  const s = bdStats();
  const tiles = [
    ['📍', s.stops, t('build.stat.stops')],
    ['🚗', s.stops ? bdDistance(s) : '—', t('build.stat.distance')],
    ['⏱️', s.stops ? fmtDur(s.totalHours) : '—', t('build.stat.time')],
    ['✦', s.stops ? formatNumber(s.xp + XP_EVENTS.CREATE_TRIP) : '—', t('build.stat.xp')],
  ];
  $('#bd-summary').innerHTML = `
    <div class="bd-tiles">
      ${tiles.map(([icon, val, label]) => `
        <div class="bd-tile">
          <span class="bdt-icon">${icon}</span>
          <b class="bdt-val">${esc(String(val))}</b>
          <span class="bdt-label">${esc(label)}</span>
        </div>`).join('')}
    </div>
    ${s.stops ? `
      <div class="bd-breakdown ${s.hoursPerDay > 10 ? 'is-warn' : ''}">
        ${esc(t('build.perDay', {
          h: fmtH(s.hoursPerDay), days: bdDays(s),
          drive: fmtH(s.driveHours), stops: fmtH(s.stopHours),
        }))}
      </div>` : ''}`;
}

function renderBuildMap() {
  const stops = bdPois().map((poi, i) => ({ poi, visited: false, order: i + 1 }));
  const scope = $('#view-build');
  $('#bd-map').innerHTML = renderMap(stops, bdStart(), null, {
    idSuffix: 'bd', candidates: bdCandidates(),
  });
  scope.querySelectorAll('.map-marker').forEach(m => onActivate(m, () => openBuilderPoi(m.dataset.poi)));
  scope.querySelectorAll('.map-cand').forEach(m => onActivate(m, () => openBuilderPoi(m.dataset.cand)));
  // keep the open location highlighted across redraws
  const open = $('#bd-panel').dataset.poi;
  if (open) scope.querySelectorAll(`[data-poi="${open}"].map-marker, [data-cand="${open}"]`)
    .forEach(m => m.classList.add('is-active'));
}

/** The tapped location, above the map, with the one action that matters. */
function openBuilderPoi(poiId) {
  const poi = POI_BY_ID[poiId];
  if (!poi) return;
  const on = build.ids.includes(poiId);
  const panel = $('#bd-panel');
  panel.dataset.poi = poiId;
  panel.innerHTML = `
    <button type="button" class="poi-close" id="bd-panel-close"
            aria-label="${esc(t('photo.close'))}" title="${esc(t('photo.close'))}">✕</button>
    <div class="poi-head">
      <span class="poi-icon">${poi.icon}</span>
      <span class="poi-name">${esc(poiName(poi))}</span>
    </div>
    <div class="pd-meta">${esc(regionName(poi.region))} · ${esc(poiTime(poi.time))} · <span class="stop-xp">✦ ${poi.xp} ${t('unit.xp')}</span></div>
    <p class="pd-blurb">${esc(poiBlurb(poi))}</p>
    <div class="pd-actions">
      <button class="btn ${on ? 'btn-ghost' : 'btn-primary'} btn-sm bd-toggle" data-bd-toggle="${poiId}">
        ${on ? t('build.remove') : t('build.addAction')}
      </button>
    </div>`;
  panel.hidden = false;
  $('#bd-panel-close').addEventListener('click', closeBuilderPoi);
  panel.querySelector('[data-bd-toggle]').addEventListener('click', () => toggleBuildStop(poiId));
  $('#view-build').querySelectorAll('.map-marker, .map-cand').forEach(m =>
    m.classList.toggle('is-active', m.dataset.poi === poiId || m.dataset.cand === poiId));
  panel.scrollIntoView({ block: 'nearest' });
}

function closeBuilderPoi() {
  const panel = $('#bd-panel');
  panel.hidden = true;
  panel.innerHTML = '';
  delete panel.dataset.poi;
  $('#view-build').querySelectorAll('.map-marker, .map-cand').forEach(m => m.classList.remove('is-active'));
}

/**
 * No toast here on purpose: building a route means a dozen taps in a
 * row, and a dozen stacked toasts sit right on top of the map. The
 * figures, the pin, the tab count and the row leaving the catalogue all
 * change immediately, which is feedback enough.
 */
function toggleBuildStop(poiId) {
  const at = build.ids.indexOf(poiId);
  if (at >= 0) build.ids.splice(at, 1);
  else build.ids.push(poiId);
  refreshBuild();
  if (!$('#bd-panel').hidden) openBuilderPoi(poiId);
}

function renderBuildControls() {
  const s = bdStats();
  $('#bd-controls').innerHTML = `
    <label class="bd-field">
      <span class="bd-flabel">${t('build.startLabel')}</span>
      <select id="bd-start" class="bd-select">
        ${Object.entries(START_CITIES).map(([key, city]) =>
          `<option value="${key}" ${key === build.startKey ? 'selected' : ''}>${esc(cityName(city.name))}</option>`).join('')}
      </select>
    </label>

    <div class="bd-field">
      <span class="bd-flabel">${t('build.orderLabel')}</span>
      <div class="bd-seg" role="group" aria-label="${esc(t('build.orderLabel'))}">
        <button type="button" class="bd-segb ${build.auto ? 'active' : ''}" data-bd-order="auto">${t('build.order.auto')}</button>
        <button type="button" class="bd-segb ${build.auto ? '' : 'active'}" data-bd-order="manual">${t('build.order.manual')}</button>
      </div>
    </div>

    <div class="bd-field">
      <span class="bd-flabel">${t('build.daysLabel')} <i>${esc(t('build.daysRec', { n: s.daysNeeded }))}</i></span>
      <div class="bd-stepper">
        <button type="button" data-bd-days="-1" aria-label="−">−</button>
        <b>${bdDays(s)}</b>
        <button type="button" data-bd-days="1" aria-label="+">+</button>
      </div>
    </div>`;

  $('#bd-start').addEventListener('change', e => {
    build.startKey = e.target.value;
    refreshBuild();
  });
  $$('#bd-controls [data-bd-order]').forEach(b => b.addEventListener('click', () => {
    // Switching to manual keeps whatever order is on screen, so the list
    // never rearranges itself under the user's finger.
    build.auto = b.dataset.bdOrder === 'auto';
    refreshBuild();
  }));
  $$('#bd-controls [data-bd-days]').forEach(b => b.addEventListener('click', () => {
    const stats = bdStats();
    const max = Math.max(1, Math.min(10, build.ids.length || 1));
    build.days = Math.max(1, Math.min(max, bdDays(stats) + Number(b.dataset.bdDays)));
    refreshBuild();
  }));
}

function renderBuildTabs() {
  const tabs = { route: `${t('build.tab.route')} (${build.ids.length})`, add: t('build.tab.add') };
  $$('.bd-tab').forEach(b => {
    const key = b.dataset.bdTab;
    b.textContent = tabs[key];
    const on = build.tab === key;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });
  $('#bd-pane-route').hidden = build.tab !== 'route';
  $('#bd-pane-add').hidden = build.tab !== 'add';
}

function setBuildTab(name) {
  build.tab = name;
  renderBuildTabs();
}

/** The route so far: order, legs between stops, and the way out of each. */
function renderBuildRoute() {
  const pois = bdPois();
  const host = $('#bd-pane-route');
  if (!pois.length) {
    host.innerHTML = `
      <div class="bd-empty">
        <p>${t('build.routeEmpty')}</p>
        <button class="btn btn-primary btn-sm" id="bd-goadd">${t('build.routeEmptyCta')}</button>
      </div>`;
    $('#bd-goadd').addEventListener('click', () => setBuildTab('add'));
    return;
  }

  let cursor = bdStart();
  host.innerHTML = pois.map((p, i) => {
    const km = Math.round(distKm(cursor, p) * 1.3);
    cursor = p;
    const leg = `<div class="bd-leg">↳ ${esc(bdDistance({ km, mi: Math.round(km * 0.621) }))} · ${esc(fmtDur(km / 60))}</div>`;
    return leg + `
      <div class="bd-row">
        <span class="sl-order">${i + 1}</span>
        <span class="sl-icon">${p.icon}</span>
        <button type="button" class="bd-rowname" data-bd-open="${p.id}">
          <b>${esc(poiName(p))}</b>
          <i>${esc(regionName(p.region))} · ${esc(poiTime(p.time))} · ✦ ${p.xp}</i>
        </button>
        <span class="bd-rowbtns">
          ${build.auto ? '' : `
            <button type="button" class="bd-icon" data-bd-move="${i}|-1" ${i === 0 ? 'disabled' : ''}
                    title="${esc(t('build.moveUp'))}" aria-label="${esc(t('build.moveUp'))}">↑</button>
            <button type="button" class="bd-icon" data-bd-move="${i}|1" ${i === pois.length - 1 ? 'disabled' : ''}
                    title="${esc(t('build.moveDown'))}" aria-label="${esc(t('build.moveDown'))}">↓</button>`}
          <button type="button" class="bd-icon bd-del" data-bd-remove="${p.id}"
                  title="${esc(t('build.remove'))}" aria-label="${esc(t('build.remove'))}">✕</button>
        </span>
      </div>`;
  }).join('');

  host.querySelectorAll('[data-bd-open]').forEach(b =>
    b.addEventListener('click', () => openBuilderPoi(b.dataset.bdOpen)));
  host.querySelectorAll('[data-bd-remove]').forEach(b =>
    b.addEventListener('click', () => toggleBuildStop(b.dataset.bdRemove)));
  host.querySelectorAll('[data-bd-move]').forEach(b =>
    b.addEventListener('click', () => {
      const [from, step] = b.dataset.bdMove.split('|').map(Number);
      const to = from + step;
      if (to < 0 || to >= build.ids.length) return;
      const [moved] = build.ids.splice(from, 1);
      build.ids.splice(to, 0, moved);
      refreshBuild();
    }));
}

/** The catalogue: search, interest filters, and every remaining location. */
function renderBuildAdd() {
  $('#bd-pane-add').innerHTML = `
    <input type="search" id="bd-q" class="bd-search" value="${esc(build.query)}"
           placeholder="${esc(t('build.search'))}" aria-label="${esc(t('build.search'))}">
    <div class="chips-label">${t('build.filters')}</div>
    <div class="chips-row bd-filters">
      <button type="button" class="chip ${build.filters.size ? '' : 'active'}" data-bd-filter="">${t('build.filter.all')}</button>
      ${Object.entries(INTERESTS).map(([key, def]) =>
        `<button type="button" class="chip ${build.filters.has(key) ? 'active' : ''}" data-bd-filter="${key}">${def.icon} ${esc(interestLabel(key))}</button>`).join('')}
    </div>
    <div class="bd-count" id="bd-count"></div>
    <div class="bd-list" id="bd-list"></div>`;

  // Typing must not cost the caret, so only the list below is redrawn.
  $('#bd-q').addEventListener('input', e => {
    build.query = e.target.value;
    refreshAddList();
    renderBuildMap();
  });
  $$('#bd-pane-add [data-bd-filter]').forEach(b => b.addEventListener('click', () => {
    const key = b.dataset.bdFilter;
    if (!key) build.filters.clear();
    else if (build.filters.has(key)) build.filters.delete(key);
    else build.filters.add(key);
    $$('#bd-pane-add [data-bd-filter]').forEach(other => other.classList.toggle(
      'active', other.dataset.bdFilter ? build.filters.has(other.dataset.bdFilter) : !build.filters.size));
    refreshAddList();
    renderBuildMap();
  }));

  refreshAddList();
}

function refreshAddList() {
  const host = $('#bd-list');
  if (!host) return;
  const list = bdCandidates();
  $('#bd-count').textContent = t('build.showing', { shown: list.length, total: POIS.length });

  if (!list.length) {
    host.innerHTML = `
      <div class="bd-empty">
        <p>${t('build.noMatch')}</p>
        <button class="btn btn-ghost btn-sm" id="bd-clearf">${t('build.clearFilters')}</button>
      </div>`;
    $('#bd-clearf').addEventListener('click', () => {
      build.filters.clear();
      build.query = '';
      renderBuildAdd();
      renderBuildMap();
    });
    return;
  }

  // Grouped by region, in dataset order, so the list reads like a tour.
  const groups = [];
  for (const poi of list) {
    const last = groups[groups.length - 1];
    if (last && last.region === poi.region) last.pois.push(poi);
    else groups.push({ region: poi.region, pois: [poi] });
  }

  host.innerHTML = groups.map(g => `
    <section class="bd-group">
      <header class="bd-ghead">${esc(regionName(g.region))}</header>
      ${g.pois.map(p => `
        <div class="bd-arow">
          <span class="sl-icon">${p.icon}</span>
          <button type="button" class="bd-rowname" data-bd-open="${p.id}">
            <b>${esc(poiName(p))}</b>
            <i>${esc(poiTime(p.time))} · ✦ ${p.xp} ${t('unit.xp')}</i>
          </button>
          <button type="button" class="bd-add" data-bd-add="${p.id}">+ ${t('build.add')}</button>
        </div>`).join('')}
    </section>`).join('');

  host.querySelectorAll('[data-bd-open]').forEach(b =>
    b.addEventListener('click', () => openBuilderPoi(b.dataset.bdOpen)));
  host.querySelectorAll('[data-bd-add]').forEach(b =>
    b.addEventListener('click', () => toggleBuildStop(b.dataset.bdAdd)));
}

/**
 * What the chosen stops imply: the kit they demand, the warnings they
 * earn, and any passport stamp the journey would put in reach.
 */
function renderBuildBrief() {
  const pois = bdPois();
  const host = $('#bd-brief');
  if (!pois.length) { host.innerHTML = ''; return; }

  const s = bdStats();
  const kit = equipmentFor(pois);
  const advisories = advisoriesFor(pois, s);
  const stamps = stampPreview(pois, user);
  const params = { km: bdDistance(s), h: fmtH(s.hoursPerDay) };

  host.innerHTML = `
    <section class="card bd-brief">
      <h3 class="bd-btitle">🎒 ${t('build.kit')}</h3>
      <p class="bd-bsub">${t('build.kitSub')}</p>
      <ul class="bd-kit">
        ${kit.map(k => `
          <li>
            <span class="bdk-icon">${k.icon}</span>
            <b>${esc(t(`kit.${k.id}.name`))}</b>
            <i>${esc(t(`kit.${k.id}.why`))}</i>
          </li>`).join('')}
      </ul>
    </section>

    ${advisories.length ? `
      <section class="card bd-brief">
        <h3 class="bd-btitle">⚠️ ${t('build.advisories')}</h3>
        <ul class="bd-adv">
          ${advisories.map(a => `
            <li>
              <span class="bdk-icon">${a.icon}</span>
              <div>
                <b>${esc(t(`adv.${a.id}.name`))}</b>
                <p>${esc(t(`adv.${a.id}.body`, params))}</p>
              </div>
            </li>`).join('')}
        </ul>
      </section>` : ''}

    ${stamps.length ? `
      <section class="card bd-brief bd-stampcard">
        <h3 class="bd-btitle">🛂 ${t('build.stamps')}</h3>
        <ul class="bd-adv">
          ${stamps.map(r => `
            <li>
              <span class="bdk-icon">${r.icon}</span>
              <div><p>${esc(t('build.stampsBody', { region: regionName(r.name) }))}</p></div>
            </li>`).join('')}
        </ul>
      </section>` : ''}`;
}

function renderBuildActions() {
  const n = build.ids.length;
  $('#bd-actions').innerHTML = `
    <button class="btn btn-primary" id="bd-save" ${n < 2 ? 'disabled' : ''}>${t('build.save')}</button>
    ${n ? `<button class="btn btn-ghost" id="bd-clear">${t('build.clear')}</button>` : ''}`;

  $('#bd-save').addEventListener('click', saveBuild);
  $('#bd-clear')?.addEventListener('click', () => {
    build.ids = [];
    build.days = 0;
    closeBuilderPoi();
    refreshBuild();
  });
}

function saveBuild() {
  if (build.ids.length < 2) { toastInfo(t('build.needStops'), '🧭'); return; }
  const trip = buildCustomTrip({
    ids: build.ids, start: bdStart(), days: bdDays(bdStats()),
  });
  user.trips.unshift(trip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, 'act.questCreated', { title: tripTitle(trip) }, '🗺️');
  evaluateAchievements(user);
  store.save();

  build.ids = [];
  build.days = 0;
  build.query = '';
  build.filters.clear();
  build.tab = 'route';
  closeBuilderPoi();

  openTripId = trip.id;
  switchView('trip');
}

// ============================================================
// View: Trip detail
// ============================================================

/**
 * The shared body of a location: the same markup backs both the panel
 * above the map and an expanded row in the list below it, so a stop
 * reads identically however you reached it.
 */
function poiBodyHTML(poi, trip, interactive) {
  const visited = !!trip.visited[poi.id];
  return `
    <div class="pd-meta">${esc(regionName(poi.region))} · ${esc(poiTime(poi.time))} · <span class="stop-xp">✦ ${poi.xp} ${t('unit.xp')}</span></div>
    <p class="pd-blurb">${esc(poiBlurb(poi))}</p>
    <div class="pd-photo" data-photo-slot="${poi.id}"></div>
    ${interactive ? `
    <div class="pd-actions">
      <button class="visit-btn ${visited ? 'undo' : ''}" data-visit="${poi.id}">
        ${visited ? t('trip.visited') : t('trip.markVisited')}
      </button>
      <button class="photo-btn" data-photo="${poi.id}"
              aria-label="${esc(t('photo.add'))}" title="${esc(t('photo.add'))}">📷</button>
    </div>` : ''}`;
}

/** Compact, tappable list of every stop, grouped by day. */
function stopListHTML(trip, interactive) {
  let order = 0;
  return trip.days.map(d => {
    const rows = d.stops.map(id => {
      order++;
      const poi = POI_BY_ID[id];
      const visited = !!trip.visited[id];
      return `
      <div class="sl-item ${visited ? 'is-visited' : ''}" data-poi="${id}">
        <button type="button" class="sl-row" data-toggle="${id}" aria-expanded="false">
          <span class="sl-order">${visited ? '✓' : order}</span>
          <span class="sl-icon">${poi.icon}</span>
          <span class="sl-name">${esc(poiName(poi))}</span>
          <span class="sl-caret" aria-hidden="true">⌄</span>
        </button>
        <div class="sl-body" hidden>${poiBodyHTML(poi, trip, interactive)}</div>
      </div>`;
    }).join('');
    const regions = [...new Set(d.stops.map(id => regionName(POI_BY_ID[id].region)))];
    return `
    <section class="day-block">
      <header class="day-head"><span class="day-num">${t('trip.day', { n: d.day })}</span><span class="day-regions">${esc(regions.join(' → '))}</span></header>
      ${rows}
    </section>`;
  }).join('');
}

/**
 * Show a location above the map instead of scrolling the page to it.
 * Tapping pin after pin used to walk the user down the page and leave
 * them scrolling back up each time; the map now stays put.
 */
function openPoiPanel(poiId, scope = document, trip = null, interactive = true) {
  trip = trip || user.trips.find(t2 => t2.id === openTripId);
  const poi = POI_BY_ID[poiId];
  const panel = scope.querySelector('.poi-panel');
  if (!trip || !poi || !panel) return;
  panel.innerHTML = `
    <button type="button" class="poi-close" id="poi-close"
            aria-label="${esc(t('photo.close'))}" title="${esc(t('photo.close'))}">✕</button>
    <div class="poi-head">
      <span class="poi-icon">${poi.icon}</span>
      <span class="poi-name">${esc(poiName(poi))}</span>
    </div>
    ${poiBodyHTML(poi, trip, interactive)}`;
  panel.hidden = false;
  panel.querySelector('.poi-close').addEventListener('click', () => closePoiPanel(scope));
  scope.querySelectorAll('.map-marker').forEach(m => m.classList.toggle('is-active', m.dataset.poi === poiId));
  panel.scrollIntoView({ block: 'nearest' });
  hydratePhotos(panel);
}

function closePoiPanel(scope = document) {
  const panel = scope.querySelector('.poi-panel');
  if (!panel) return;
  panel.hidden = true;
  panel.innerHTML = '';
  scope.querySelectorAll('.map-marker').forEach(m => m.classList.remove('is-active'));
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

    <header class="trip-head ${trip.completedAt ? 'is-complete' : ''}">
      <div class="th-text">
        <div class="kicker">${trip.completedAt ? t('trip.kicker.complete') : t('trip.kicker.active')}</div>
        <h2 class="trip-title">${esc(tripTitle(trip))}</h2>
        <div class="pill-row">${interestPills(trip.interests)}
          <span class="pill pill-dim">${t('trip.distance', { dist: formatDistance(trip) })}</span>
          <span class="pill pill-dim">${esc(t('trip.from', { start: cityName(trip.start.name) }))}</span>
        </div>
      </div>
      <div class="ring-wrap" title="${esc(t('trip.visitedRatio', { done: pr.done, total: pr.total }))}">
        <svg viewBox="0 0 90 90" class="ring">
          <circle cx="45" cy="45" r="38" class="ring-bg"/>
          <circle cx="45" cy="45" r="38" class="ring-fg" stroke-dasharray="${(pr.pct / 100) * 238.8} 238.8"/>
        </svg>
        <div class="ring-label"><b>${pr.pct}%</b><span>${pr.done}/${pr.total}</span></div>
      </div>
    </header>

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

    <!-- Selected pin, above the map so the map never scrolls away -->
    <div class="poi-panel" id="poi-panel" hidden></div>

    <div class="map-stage">${renderMap(stops, trip.start)}</div>

    <div class="stop-list">${stopListHTML(trip, true)}</div>`;

  $('#back-to-trips').addEventListener('click', () => switchView('trips'));
  wireMapMarkers(host);
  wireStopList(host, trip);
  hydratePhotos(host);
}

/** Tapping a pin opens the panel above the map rather than scrolling. */
function wireMapMarkers(scope, trip = null, interactive = true) {
  scope.querySelectorAll('.map-marker').forEach(m => {
    const open = () => openPoiPanel(m.dataset.poi, scope, trip, interactive);
    m.addEventListener('click', open);
    m.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
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
    for (const r of evaluateStamps(user)) {
      toastInfo(t('passport.toast', { region: regionName(r.name) }), r.icon);
      burstConfetti(40);
    }
  }
  store.save();
  renderTripDetail();
  renderHeader();
}

/** Rows in the list below the map expand in place. */
function wireStopList(scope, trip) {
  scope.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.sl-item');
      const body = item.querySelector('.sl-body');
      const open = body.hidden;
      // one open at a time keeps the list scannable
      scope.querySelectorAll('.sl-item').forEach(other => {
        if (other === item) return;
        other.classList.remove('is-open');
        other.querySelector('.sl-body').hidden = true;
        other.querySelector('[data-toggle]').setAttribute('aria-expanded', 'false');
      });
      body.hidden = !open;
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
      if (open) hydratePhotos(item);
    });
  });

  // visit buttons live in panels and rows that are rebuilt constantly,
  // so delegate rather than rebinding after every render
  if (!scope.dataset.visitWired) {
    scope.dataset.visitWired = '1';
    scope.addEventListener('click', e => {
      const btn = e.target.closest('[data-visit]');
      if (!btn || !scope.contains(btn)) return;
      e.stopPropagation();
      const t2 = user.trips.find(x => x.id === openTripId);
      if (t2) toggleVisited(t2, btn.dataset.visit);
    });
  }
}


// ============================================================
// Check-in photos
// ============================================================

let photoTarget = null;   // poiId awaiting a file from the shared picker

/** Paint any stored photos into the stops currently on screen. */
async function hydratePhotos(scope) {
  const ids = await listPhotoIds(user.name);
  for (const id of ids) {
    const slots = [...scope.querySelectorAll(`[data-photo-slot="${id}"]`)]
      .filter(slot => !slot.querySelector('.stop-photo'));
    if (!slots.length) continue;
    const dataUrl = await getPhoto(user.name, id);
    if (!dataUrl) continue;
    slots.forEach(slot => attachThumb(slot, id, dataUrl));
  }
}

/**
 * A location can be on screen twice — expanded in the list and open in
 * the panel above the map — so the thumbnail is filled per slot rather
 * than once per location.
 */
function attachThumb(slot, poiId, dataUrl) {
  const poi = POI_BY_ID[poiId];
  const label = t('photo.alt', { name: poiName(poi) });
  slot.innerHTML = '';
  const fig = document.createElement('button');
  fig.type = 'button';
  fig.className = 'stop-photo';
  fig.title = label;
  fig.innerHTML = `<img src="${dataUrl}" alt="${esc(label)}">`;
  fig.addEventListener('click', e => { e.stopPropagation(); openPhoto(poiId, dataUrl); });
  slot.appendChild(fig);

  const host = slot.closest('.sl-body, .poi-panel');
  const btn = host && host.querySelector(`[data-photo="${poiId}"]`);
  if (btn) { btn.classList.add('has-photo'); btn.title = t('photo.replace'); }
}

function openPhoto(poiId, dataUrl) {
  const poi = POI_BY_ID[poiId];
  $('#photo-viewer-img').src = dataUrl;
  $('#photo-viewer-img').alt = t('photo.alt', { name: poiName(poi) });
  $('#photo-caption').innerHTML =
    `<span>${poi.icon} ${esc(poiName(poi))}</span>` +
    `<button type="button" class="btn btn-danger btn-sm" id="photo-del">${t('photo.remove')}</button>`;
  $('#photo-viewer').hidden = false;
  $('#photo-del').addEventListener('click', async () => {
    await deletePhoto(user.name, poiId);
    closePhoto();
    renderTripDetail();
  });
}

function closePhoto() {
  $('#photo-viewer').hidden = true;
  $('#photo-viewer-img').src = '';
}

function wirePhotos() {
  const input = $('#photo-input');

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-photo]');
    if (!btn) return;
    e.stopPropagation();
    photoTarget = btn.dataset.photo;
    input.value = '';          // so re-picking the same file still fires change
    input.click();
  });

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file || !photoTarget) return;
    const poiId = photoTarget;
    photoTarget = null;
    try {
      const dataUrl = await compressImage(file);
      await savePhoto(user.name, poiId, dataUrl);
      document.querySelectorAll(`[data-photo-slot="${poiId}"]`)
        .forEach(slot => attachThumb(slot, poiId, dataUrl));
      toastInfo(t('photo.saved', { name: poiName(POI_BY_ID[poiId]) }), '📸');
    } catch {
      toastInfo(t('photo.failed'), '⚠️');
    }
  });

  $('#photo-close').addEventListener('click', closePhoto);
  $('#photo-viewer').addEventListener('click', e => { if (e.target.id === 'photo-viewer') closePhoto(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#photo-viewer').hidden) closePhoto();
  });
}

// ============================================================
// View: Achievements
// ============================================================

function renderPassport() {
  const regions = regionProgress(user);
  const stamped = regions.filter(r => r.complete).length;
  $('#passport-count-label').textContent = t('passport.count', { owned: stamped, total: regions.length });
  $('#passport-progress-fill').style.width = `${Math.round((stamped / regions.length) * 100)}%`;

  $('#passport-grid').innerHTML = regions.map(r => `
    <div class="stamp ${r.complete ? 'is-stamped' : ''}">
      <div class="stamp-mark">${r.icon}</div>
      <div class="stamp-name">${esc(regionName(r.name))}</div>
      <div class="progress"><div class="progress-fill" style="width:${r.pct}%"></div></div>
      <div class="stamp-meta">${r.complete
        ? t('passport.stamped', { date: new Date(r.stampedAt).toLocaleDateString(locale()) })
        : t('passport.progress', { done: r.done, total: r.total })}</div>
    </div>`).join('');
}

function renderBadges() {
  renderPassport();
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
// View: Guess the Glen
// ============================================================

let game = null;      // in-progress run: { score, asked, q, answered }
let lastRun = null;   // result of the run just finished, for the results card

function renderGame() {
  const host = $('#game-panel');
  const best = user.game?.best || 0;

  if (!game) {                                   // idle / results screen
    const last = lastRun;
    host.innerHTML = `
      <div class="game-card card">
        ${last ? `
          <div class="game-over">
            <div class="go-kicker">${t('game.runOver')}</div>
            <div class="go-score">${last.score}</div>
            <div class="go-sub">${esc(t('game.runScore', { score: last.score }))}</div>
            ${last.isBest ? `<div class="go-best">🏆 ${t('game.newBest')}</div>` : ''}
          </div>` : ''}
        <div class="game-stats">
          <span><b>${best}</b> ${t('game.best')}</span>
        </div>
        <button class="btn btn-primary btn-block" id="game-start">${last ? t('game.again') : t('game.start')}</button>
      </div>`;
    $('#game-start').addEventListener('click', startRun);
    return;
  }

  const q = game.q;
  host.innerHTML = `
    <div class="game-card card">
      <div class="game-top">
        <span class="game-q">${t('game.question', { n: game.score + 1 })}</span>
        <span class="game-sc"><b>${game.score}</b> ${t('game.score')} · <b>${best}</b> ${t('game.best')}</span>
      </div>
      <p class="game-clue">${esc(q.clue)}</p>
      <div class="game-hint" id="game-hint-wrap">
        <button type="button" class="link-btn" id="game-hint">${t('game.hint')}</button>
      </div>
      <div class="game-options" id="game-options">
        ${q.options.map(o => `<button class="game-opt" data-id="${o.id}">${esc(o.name)}</button>`).join('')}
      </div>
      <div class="game-feedback" id="game-feedback"></div>
      <button class="btn btn-ghost btn-block btn-sm" id="game-quit">${t('game.quit')}</button>
    </div>`;

  $('#game-hint').addEventListener('click', e => {
    e.target.replaceWith(Object.assign(document.createElement('span'), {
      className: 'game-hint-text', textContent: t('game.hintShown', { region: q.region }),
    }));
  });
  host.querySelectorAll('.game-opt').forEach(b =>
    b.addEventListener('click', () => answer(b.dataset.id)));
  $('#game-quit').addEventListener('click', endRun);
}

function startRun() {
  lastRun = null;
  game = { score: 0, asked: [], answered: false, q: nextQuestion([]) };
  renderGame();
}

function answer(id) {
  if (!game || game.answered) return;
  game.answered = true;
  const correct = id === game.q.answerId;

  $$('.game-opt').forEach(b => {
    b.disabled = true;
    if (b.dataset.id === game.q.answerId) b.classList.add('is-right');
    else if (b.dataset.id === id) b.classList.add('is-wrong');
  });

  const fb = $('#game-feedback');
  if (correct) {
    game.score++;
    game.asked.push(game.q.answerId);
    const xp = gameXPFor(user);
    if (xp) awardXP(user, xp, 'game.correct', null, '🎯');
    store.save();
    fb.className = 'game-feedback is-good';
    fb.textContent = xp ? `${t('game.correct')}  +${xp} ${t('unit.xp')}` : `${t('game.correct')}  ${t('game.capped')}`;
    renderHeader();
    setTimeout(() => {
      if (!game) return;
      game.q = nextQuestion(game.asked);
      game.answered = false;
      renderGame();
    }, 900);
  } else {
    fb.className = 'game-feedback is-bad';
    fb.textContent = t('game.wrong', { name: answerName(game.q.answerId) });
    setTimeout(endRun, 1500);
  }
}

function endRun() {
  if (!game) return;
  const score = game.score;
  const isBest = recordRun(user, score);
  store.save();
  if (isBest && score > 0) burstConfetti(50);
  game = null;
  lastRun = { score, isBest: isBest && score > 0 };
  renderGame();
  renderHeader();
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

let photoCount = 0;

function renderProfile() {
  const s = userStats(user);
  listPhotoIds(user.name).then(ids => {
    if (ids.length !== photoCount) { photoCount = ids.length; if (currentView === 'profile') renderProfile(); }
  });
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
        ['🛂', Object.keys(user.stamps || {}).length, 'profile.stat.stamps'],
        ['📸', photoCount, 'profile.stat.photos'],
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

/** Landing artwork + the proof figures beneath it, straight from the dataset. */
function renderLanding() {
  $('#hero-art').innerHTML = renderHero();
  $('#sc-map').innerHTML = renderShowcase();
  startShowcase($('#sc-caption'));
  // Photos are optional; these no-op until images/manifest.json lists some.
  loadPhotos().then(() => {
    if (!hasPhotos()) return;
    mountBackdrop($('#ph-backdrop'));
    mountCarousel($('#ph-carousel'));
    document.documentElement.classList.add('has-photos');
  });
  $('#stat-places').textContent = POIS.length;
  $('#stat-interests').textContent = Object.keys(INTERESTS).length;
  $('#stat-badges').textContent = ACHIEVEMENTS.length;
}

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.lang = getLang();
  initTheme();
  applyStatic();
  renderLanding();
  wireLanguage();
  wireTheme();
  wireAuth();
  wireNav();
  wirePhotos();
  $('#plan-go').addEventListener('click', runPlanner);
  $('#plan-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runPlanner();
  });
  boot();
});
