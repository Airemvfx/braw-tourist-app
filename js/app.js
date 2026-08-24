// ============================================================
// BRAW — app shell: auth, navigation, views, event wiring.
// ============================================================

import { POIS, POI_BY_ID, INTERESTS, LEVELS, XP_EVENTS, ACHIEVEMENTS, RIVALS, REGIONS, START_CITIES, TRIP_CENTRES } from './data.js';
import {
  routeStats, optimiseOrder, equipmentFor, advisoriesFor,
  stampPreview, buildCustomTrip,
} from './builder.js';
import { store } from './store.js';
import { initTheme, setMode, getMode, onThemeChange } from './theme.js';
import { loadFonts } from './fonts.js';
import {
  GEO, onLocationChange, locationState, startTracking, stopTracking,
  watchStops, rearmStop, disarmStop, simulateAt, hasConsented, setConsent,
  metresTo, nearestOf,
} from './location.js';
import { awardXP, evaluateAchievements, evaluateStamps, regionProgress, userStats, toastInfo, burstConfetti, setQuiet, activityText } from './gamification.js';
import {
  generateTrip, tripProgress, tripStopIds, tripTitle, paceLabel, distKm,
  wildcardsFor, addStops, poisInScope,
} from './planner.js';
import { renderMap, mapKeyHTML, updateUserDot, project, unproject, MAP_SIZE } from './scotland-map.js';
import { openMapViewer, googleMapsUrl, googlePlaceUrl, renderedMapWidth } from './map-viewer.js';
import { leg as travelLeg, ferriesFor, ferryInfo } from './routing.js';
import {
  downloadTripGPX, downloadTripGeoJSON, downloadBackup,
  readBackup, backupSummary,
} from './exporter.js';
import { renderHero } from './hero-scene.js';
import { renderShowcase, startShowcase, stopShowcase } from './showcase.js';
import { loadPhotos, hasPhotos, mountBackdrop, mountCarousel, stopCarousel } from './photos-hero.js';
import { nextQuestion, gameXPFor, recordRun, answerName } from './minigame.js';
import { LORE, LORE_TYPES, loreForPoi, isUnlocked, loreProgress } from './lore.js';
import { seasonalNow, seasonalNext, monthName } from './seasons.js';
import {
  addPhoto, getPhoto, deletePhoto, allPhotos, photosForTrip, coverFor,
  photoCount as countPhotos, putPhotoRecord, reassign, printGrade, printDpi,
} from './photos.js';
import {
  storageHealth, requestPersistence, hasAskedForPersistence, exportPhotoFiles,
  formatBytes, shouldSuggestBackup, markBackupSuggested, DURABILITY,
} from './vault.js';
import {
  cloudAvailable, cloudSignedIn, cloudUser, account, pullProfile, pushProfile,
  schedulePush, flushPush, uploadPhoto, uploadAll, removeRemotePhoto,
  products as cloudProducts, placeOrder, myOrders, checkoutUrl, storeConfigured,
} from './cloud.js';
import {
  CATALOGUE, mergeRemote, productName, productBlurb, priceText,
  monthsFor, calendarSlots, printReport, orderItems,
} from './shop.js';
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

// Set when someone with local progress goes to make a real account, so
// that when they come back signed in their trips and photographs follow
// them up instead of appearing to have been thrown away.
let pendingLocalKey = null;

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
  onThemeChange(theme => { sync(); if (theme === 'light') findEgg('darkmode'); });
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

  // With a backend configured, an account is an email and a password —
  // that is what makes it reachable from a second device and what a
  // password reset needs. Without one, nothing has changed: a name and
  // a password kept in this browser, which is all the demo requires.
  const cloud = cloudAvailable();
  const emailField = $('#auth-email-field');
  const nameInput = $('#auth-name');

  emailField.hidden = !cloud;
  $('#auth-email').required = cloud;

  // On a cloud sign-in the name is not an identifier, so asking for it
  // would be asking for something we cannot check.
  const nameField = nameInput.closest('.field');
  const nameWanted = !cloud || mode === 'register';
  nameField.hidden = !nameWanted;
  nameInput.required = nameWanted;

  $('#auth-pass').autocomplete = mode === 'login' ? 'current-password' : 'new-password';
  $('#auth-forgot').hidden = !(cloud && mode === 'login');

  const note = $('#auth-carry');
  if (cloud && mode === 'register' && pendingLocalKey) {
    note.hidden = false;
    note.textContent = t('auth.willCarryOver');
  } else {
    note.hidden = true;
  }

  // The standing promise under the form — "nothing leaves this device" —
  // stops being true the moment there is an account server, and a
  // privacy claim that has quietly gone stale is worse than none.
  const standing = document.querySelector('p.auth-note[data-i18n]');
  if (standing) {
    standing.dataset.i18n = cloud ? 'auth.noteCloud' : 'auth.note';
    standing.textContent = t(standing.dataset.i18n);
  }
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
    const email = $('#auth-email').value;
    const mode = $('#auth-form').dataset.mode;
    const submit = $('#auth-submit');
    $('#auth-error').textContent = '';
    submit.disabled = true;
    try {
      if (cloudAvailable()) await cloudAuth(mode, email, pass, name);
      else await localAuth(mode, name, pass);
      enterApp();
    } catch (err) {
      $('#auth-error').textContent = err.i18nKey ? t(err.i18nKey) : err.message;
    } finally {
      submit.disabled = false;
    }
  });

  $('#auth-forgot').addEventListener('click', async () => {
    const email = $('#auth-email').value.trim();
    $('#auth-error').textContent = '';
    if (!email) { $('#auth-error').textContent = t('auth.err.needEmail'); return; }
    try {
      await account.sendReset(email);
      // Deliberately the same message whether or not the address is
      // registered. Saying "no such account" would turn this box into a
      // way of finding out who has one.
      toastInfo(t('auth.resetSent'), '✉️');
    } catch (err) {
      $('#auth-error').textContent = err.i18nKey ? t(err.i18nKey) : t('cloud.err.failed');
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

/**
 * Keep the server's copy of the profile roughly current.
 *
 * Every local save schedules a push, debounced hard — saves happen on
 * every visited stop and every XP award, and one request each would be
 * both wasteful and a fast route to a rate limit. Anything still
 * waiting is flushed when the tab goes away, which on a phone is the
 * normal way an app is closed: `pagehide` and a hidden `visibilitychange`
 * are the only events reliably delivered then, and `beforeunload` is
 * not one of them on iOS.
 */
function wireSync() {
  store.onSave(profile => { if (profile) schedulePush(profile); });

  const flush = () => { flushPush(); };
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
}

/** The original path: a name and a password, kept in this browser. */
async function localAuth(mode, name, pass) {
  if (mode === 'login') {
    user = await store.login(name, pass);
    toastInfo(t('act.welcomeBack', { name: user.name }), '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
  } else {
    user = await store.register(name, pass);
    awardXP(user, XP_EVENTS.JOIN, 'act.joined', null, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
  }
}

/**
 * A real account.
 *
 * Signing in pulls whatever the server holds. The local profile is
 * adopted from it only when there is nothing here worth keeping;
 * otherwise the two are put to the user, because this is exactly the
 * moment where a silent overwrite costs someone a season of walking.
 */
async function cloudAuth(mode, email, pass, name) {
  if (mode === 'register') {
    const { needsConfirmation } = await account.signUp(email, pass, name);
    if (needsConfirmation) {
      const err = new Error('confirm');
      err.i18nKey = 'auth.confirmSent';
      throw err;
    }
    const me = cloudUser();
    // Carry local progress up, if this person had any before signing up.
    if (pendingLocalKey && store.users[pendingLocalKey]) {
      user = store.promoteLocal(pendingLocalKey, me);
      await reassign(pendingLocalKey, user.id);
      pendingLocalKey = null;
      toastInfo(t('account.carriedOver'), '📦');
    } else {
      user = store.openCloudProfile(me);
      awardXP(user, XP_EVENTS.JOIN, 'act.joined', null, '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
    }
    store.save();
    await pushProfile(user).catch(() => { /* it will go up on the next save */ });
    return;
  }

  await account.signIn(email, pass);
  const me = cloudUser();
  user = store.openCloudProfile(me);

  let remote = null;
  try { remote = await pullProfile(); }
  catch { toastInfo(t('account.offlineSignIn'), '📴'); }

  if (remote?.data) {
    const localEmpty = !user.trips.length && !user.xp;
    if (localEmpty) {
      user = store.adoptRemote(remote.data);
    } else if ((remote.data.trips || []).length !== user.trips.length || (remote.data.xp || 0) !== user.xp) {
      await resolveConflict();
      return;
    }
  }
  store.save();
  toastInfo(t('act.welcomeBack', { name: user.name }), '🏴󠁧󠁢󠁳󠁣󠁴󠁿');
}

/** Give the demo account a head start so every screen has life in it. */
function seedDemoProgress() {
  const trip = generateTrip(t('planner.demoPrompt'));
  user.trips.unshift(trip);
  awardXP(user, XP_EVENTS.CREATE_TRIP, 'act.questCreated', { title: tripTitle(trip) }, '🗺️');
  // Leave at least one stop unvisited: the "next up" card, the geofences
  // and the arrival prompt all need somewhere still to go, and a short
  // themed trip can be shorter than the four we used to mark.
  const all = tripStopIds(trip);
  const ids = all.slice(0, Math.max(0, Math.min(4, all.length - 1)));
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

const VIEWS = ['plan', 'build', 'trips', 'trip', 'library', 'badges', 'play', 'leaderboard', 'store', 'safety', 'profile'];

function switchView(name) {
  currentView = name;
  for (const v of VIEWS) $(`#view-${v}`).hidden = v !== name;
  $$('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  const renderers = { plan: renderPlan, build: renderBuild, trips: renderTrips, trip: renderTripDetail, library: renderLibrary, safety: renderSafety, badges: renderBadges, play: renderGame, leaderboard: renderLeaderboard, store: renderStore, profile: renderProfile };
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
  wireMenu();
}

// ============================================================
// The phone menu
//
// A row of ten tabs across the top of a phone is a scrolling strip you
// have to reach up to, and the last few tabs are always off the edge.
// The same <nav> is moved to a panel above a button in the bottom-left
// corner instead — where the thumb already is — and every item is
// visible at once when it opens.
//
// The element is the header's own <nav>, relocated by CSS rather than
// duplicated in the markup. One list of tabs, one place the active
// state is set, nothing to keep in step.
// ============================================================

function menuOpen() { return document.body.classList.contains('menu-open'); }

function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  $('#menu-btn').setAttribute('aria-expanded', String(open));
  $('#menu-scrim').hidden = !open;
}

/**
 * Move the tabs out of the header on a phone, and back on a desktop.
 *
 * Not cosmetic. The header carries `backdrop-filter`, and a filtered
 * element becomes the containing block for `position: fixed`
 * descendants — so a panel pinned to the bottom of the screen was
 * pinned to the bottom of the 64px header instead, and sat off the top
 * of the page. Relocating the element is the fix; styling alone cannot
 * reach past an ancestor's containing block.
 *
 * The same <nav> travels either way, so the active tab and every
 * listener on it come along untouched.
 */
function placeNav(wide) {
  const nav = $('#hdr-nav');
  const header = $('.app-header');
  const btn = $('#menu-btn');
  if (!nav || !header || !btn) return;

  if (wide) {
    if (nav.parentElement !== header) header.insertBefore(nav, header.firstElementChild);
  } else if (nav.previousElementSibling !== btn) {
    btn.after(nav);
  }
}

function wireMenu() {
  const btn = $('#menu-btn');

  btn.addEventListener('click', () => setMenu(!menuOpen()));
  $('#menu-scrim').addEventListener('click', () => setMenu(false));

  // Choosing somewhere to go is the end of needing the menu.
  $$('.nav-btn').forEach(b => b.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOpen()) { setMenu(false); btn.focus(); }
  });

  // Widening past the breakpoint puts the tabs back in the header, where
  // "open" has no meaning — and would otherwise leave the scrim covering
  // a perfectly normal desktop page.
  const wide = window.matchMedia('(min-width: 641px)');
  const sync = () => {
    placeNav(wide.matches);
    if (wide.matches && menuOpen()) setMenu(false);
  };
  sync();
  wide.addEventListener ? wide.addEventListener('change', sync) : wide.addListener(sync);
}

// ============================================================
// View: Plan a new quest
// ============================================================

// ============================================================
// What is on right now, and how far the trip reaches
// ============================================================

// Held in memory rather than saved: it is a property of the trip being
// planned, not of the person.
let planScope = { kind: 'national' };

function renderSeasonStrip() {
  const host = $('#season-strip');
  if (!host) return;
  const now = seasonalNow();
  const soon = seasonalNext();

  host.innerHTML = `
    <div class="season-head">
      <h2 class="season-title">${esc(t('season.title'))}</h2>
      <p class="season-sub">${esc(t('season.sub', { month: monthName(locale()) }))}</p>
    </div>
    ${now.length ? `
      <ul class="season-list">
        ${now.map(sn => `
          <li class="season-card k-${sn.kind}">
            <span class="sn-icon" aria-hidden="true">${sn.icon}</span>
            <span class="sn-kind">${esc(t(`season.kind.${sn.kind}`))}</span>
            <b class="sn-title">${esc(loc(sn).t)}</b>
            <p class="sn-body">${esc(loc(sn).b)}</p>
            ${sn.pois.length ? `<button type="button" class="link-btn sn-go" data-season="${sn.id}">${esc(t('season.plan'))} →</button>` : ''}
          </li>`).join('')}
      </ul>` : `<p class="season-none">${esc(t('season.none'))}</p>`}
    ${soon.length ? `
      <p class="season-soon">${esc(t('season.soon'))}: ${soon.map(x => `${x.icon} ${esc(loc(x).t)}`).join(' · ')}</p>` : ''}`;

  host.querySelectorAll('[data-season]').forEach(b =>
    b.addEventListener('click', () => planSeason(b.dataset.season)));
}

const loc = entry => entry[getLang()] || entry.en;

/** Build a trip straight out of a seasonal entry's places. */
function planSeason(id) {
  const sn = seasonalNow().find(x => x.id === id) || seasonalNext().find(x => x.id === id);
  if (!sn || !sn.pois.length) return;
  const ids = sn.pois.filter(x => POI_BY_ID[x]);
  if (!ids.length) return;
  planScope = { kind: 'national' };
  renderScopePicker();
  $('#plan-input').value = t('season.prompt', { what: loc(sn).t.toLowerCase() });
  // Seed the builder rather than the planner: these are specific places,
  // not a theme, and the builder is what assembles a named list.
  build.ids = ids;
  build.days = 0;
  switchView('build');
  toastInfo(t('season.plan') + ' — ' + loc(sn).t, sn.icon);
}

function renderScopePicker() {
  const host = $('#scope-picker');
  if (!host) return;
  const kinds = ['national', 'region', 'city'];
  const inRange = poisInScope(planScope).length;

  host.innerHTML = `
    <span class="scope-label">${esc(t('scope.label'))}</span>
    <div class="scope-kinds" role="group" aria-label="${esc(t('scope.label'))}">
      ${kinds.map(k => `
        <button type="button" class="scope-btn ${planScope.kind === k ? 'active' : ''}" data-scope-kind="${k}">
          ${esc(t(`scope.${k}`))}
        </button>`).join('')}
    </div>
    ${planScope.kind !== 'national' ? `
      <select id="scope-place" class="bd-select" aria-label="${esc(t('scope.pick'))}">
        ${(planScope.kind === 'city' ? TRIP_CENTRES : REGIONS).map(o => {
          const id = planScope.kind === 'city' ? o.id : o.name;
          const label = planScope.kind === 'city' ? cityName(o.name) : regionName(o.name);
          return `<option value="${esc(id)}" ${planScope.id === id ? 'selected' : ''}>${esc(label)}</option>`;
        }).join('')}
      </select>
      <span class="scope-count ${inRange < 5 ? 'is-thin' : ''}">
        ${esc(inRange < 5 ? t('scope.tooFew', { n: inRange }) : t('scope.count', { n: inRange }))}
      </span>` : ''}`;

  $$('#scope-picker [data-scope-kind]').forEach(b => b.addEventListener('click', () => {
    const kind = b.dataset.scopeKind;
    planScope = kind === 'national' ? { kind }
      : kind === 'city' ? { kind, id: TRIP_CENTRES[0].id }
      : { kind, id: REGIONS[0].name };
    renderScopePicker();
  }));
  $('#scope-place')?.addEventListener('change', e => {
    planScope = { ...planScope, id: e.target.value };
    renderScopePicker();
  });
}

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
  renderSeasonStrip();
  renderScopePicker();
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
    draftTrip = generateTrip(text, planScope);
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

/**
 * A themed quest gets exactly what it asked for. Once in a while it also
 * gets asked, nicely, whether it would like a couple of things it did
 * not — because "only whisky" is a fine answer, and so is "well, maybe
 * Glencoe too". Chosen at generation time and stored on the draft, so
 * re-rendering cannot re-roll the offer or swap the suggestions.
 */
function wildcardHTML(trip) {
  if (!trip.offerWildcards) return '';
  trip.wildcards = trip.wildcards || wildcardsFor(trip).map(p => p.id);
  const picks = trip.wildcards.map(id => POI_BY_ID[id]).filter(Boolean);
  if (!picks.length) return '';

  const names = (trip.interests || []).filter(k => INTERESTS[k]).map(k => interestLabel(k));
  const theme = names.length > 1
    ? t('planner.themeJoin', { a: names[0], b: names[1] })
    : (names[0] || t('planner.themeDefault'));
  const one = picks.length === 1;

  return `
    <aside class="wildcard" id="wildcard">
      <div class="wc-kicker">✨ ${t('plan.wild.kicker')}</div>
      <p class="wc-body">${esc(t(one ? 'plan.wild.bodyOne' : 'plan.wild.body', { theme: theme.toLowerCase() }))}</p>
      <ul class="wc-list">
        ${picks.map(p => `
          <li>
            <span class="wc-icon">${p.icon}</span>
            <span class="wc-text">
              <b>${esc(poiName(p))}</b>
              <i>${esc(t('plan.wild.detour', {
                region: regionName(p.region), time: poiTime(p.time), xp: p.xp,
              }))}</i>
            </span>
          </li>`).join('')}
      </ul>
      <div class="wc-actions">
        <button class="btn btn-primary btn-sm" id="wc-yes">${t(one ? 'plan.wild.addOne' : 'plan.wild.add')}</button>
        <button class="btn btn-ghost btn-sm" id="wc-no">${t('plan.wild.no')}</button>
      </div>
    </aside>`;
}

function wireWildcards() {
  $('#wc-yes')?.addEventListener('click', () => {
    addStops(draftTrip, draftTrip.wildcards);
    draftTrip.wildcards = null;
    toastInfo(t('plan.wild.added'), '🎁');
    renderDraft();
  });
  $('#wc-no')?.addEventListener('click', () => {
    draftTrip.offerWildcards = false;
    draftTrip.wildcards = null;
    toastInfo(t('plan.wild.kept'), '🥃');
    renderDraft();
  });
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
            ${trip.interests.length ? `<span class="pill pill-sage">${t('plan.themeOnly', { n: stops.length })}</span>` : ''}
            ${trip.scope && trip.scope.kind !== 'national' ? `<span class="pill pill-neutral">${esc(t('scope.pill', {
              name: trip.scope.kind === 'city'
                ? cityName((TRIP_CENTRES.find(c => c.id === trip.scope.id) || {}).name || trip.scope.id)
                : regionName(trip.scope.id),
            }))}</span>` : ''}
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
      <div class="map-stage">${renderMap(stops, trip.start)}${mapToolsHTML('draft')}</div>
      ${mapKeyHTML()}
      ${wildcardHTML(trip)}
      <div class="stop-list">${stopListHTML(trip, false)}</div>
    </div>`;

  $('#reshuffle-btn').addEventListener('click', () => { draftTrip = generateTrip(trip.prompt, trip.scope); renderDraft(); });
  $('#save-trip-btn').addEventListener('click', saveDraft);
  wireWildcards();
  wireMapMarkers(box, trip, false);
  wireStopList(box, trip);
  wireMapTools(box, 'draft', {
    render: () => renderMap(stops, trip.start, locationState().position, { idSuffix: 'fs' }),
    stops, start: trip.start, title: tripTitle(trip),
  });
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
      <!-- Past twenty or so the dividers are thinner than the gaps
           and the bar reads as hatching, so it goes back to plain. -->
      <div class="tc-progress" style="--stops:${pr.total > 1 && pr.total <= 20 ? pr.total : 1}">
        <div class="tcp-fill" style="width:${pr.pct}%"></div>
      </div>
      <div class="tc-foot">
        <span>${t('trips.card.progress', { done: pr.done, total: pr.total })}</span>
        <!-- Looks like a button and is not one: the whole card is already
             the button, and nesting a second inside it is invalid and
             would swallow its own click. This is the affordance only. -->
        <span class="tc-open" aria-hidden="true">${t('trips.card.open')} <span class="tc-arrow">→</span></span>
      </div>
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
  const cands = bdCandidates();
  // The tools are re-emitted with the map because this whole element is
  // rewritten on every tap; anything appended alongside would be thrown
  // away by the next redraw.
  $('#bd-map').innerHTML = renderMap(stops, bdStart(), null, {
    idSuffix: 'bd', candidates: cands,
  }) + mapToolsHTML('build');
  $('#bd-key').innerHTML = mapKeyHTML();
  wireMapTools($('#bd-map'), 'build', {
    render: () => renderMap(stops, bdStart(), locationState().position, { idSuffix: 'fs', candidates: cands }),
    stops, start: bdStart(), title: t('nav.build'),
    onPicked: id => openBuilderPoi(id),
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
    const t2 = travelLeg(cursor, p);
    cursor = p;
    const boats = t2.ferries.map(f => `<span class="bd-ferry">⛴ ${esc(t('build.ferry'))}</span>`).join('');
    const leg = `<div class="bd-leg">↳ ${esc(bdDistance({ km: t2.km, mi: Math.round(t2.km * 0.621) }))} · ${esc(fmtDur(t2.minutes / 60))}${boats}</div>`;
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
  const params = {
    km: bdDistance(s), h: fmtH(s.hoursPerDay),
    list: ferriesFor(bdStart(), pois).map(f => f.name).join(', '),
  };

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
    ${loreForPanel(poi)}
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

// ============================================================
// The two buttons that sit on every map
//
// Kept as one helper so the trip map and the builder map cannot drift
// apart. Both are overlaid on the map rather than placed under it: the
// map is full-bleed and tall, and a control below the fold is a control
// nobody finds.
// ============================================================

function mapToolsHTML(id) {
  return `
    <div class="map-tools" data-tools="${id}">
      <button type="button" class="map-tool" data-map-full="${id}"
              aria-label="${esc(t('map.fullscreen'))}" title="${esc(t('map.fullscreen'))}">⛶</button>
      <a class="map-tool" data-map-google="${id}" target="_blank" rel="noopener" href="#"
         aria-label="${esc(t('map.google'))}" title="${esc(t('map.google'))}">🌍</a>
      <button type="button" class="map-tool map-gps" data-map-gps="${id}" aria-pressed="false"
              aria-label="${esc(t('map.gps'))}" title="${esc(t('map.gps'))}">
        <span class="mg-ring" aria-hidden="true"></span>
      </button>
    </div>`;
}

/**
 * Switch live location on or off from the map itself.
 *
 * The same state as the toggle under the trip map — this is a second
 * door to one switch, not a second switch. Anything else would let the
 * two disagree about whether the receiver is running, which on a phone
 * is a battery drain nobody asked for.
 */
function toggleGeoFromMap() {
  if (locationState().state === GEO.ON) {
    stopTracking();
    setConsent(false);
    return;
  }
  if (hasConsented()) beginTracking();
  else askForLocation();
}

/** Reflect the live-location state on every GPS button on the page. */
function syncGeoButtons() {
  const { state } = locationState();
  const on = state === GEO.ON;
  const busy = state === GEO.ASKING;
  const problem = state === GEO.DENIED || state === GEO.UNAVAILABLE || state === GEO.FAILED;

  $$('[data-map-gps]').forEach(btn => {
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.toggle('is-on', on);
    btn.classList.toggle('is-busy', busy);
    btn.classList.toggle('is-problem', problem);
    const key = on ? 'map.gpsOff' : problem ? `geo.${state === GEO.DENIED ? 'denied' : state === GEO.UNAVAILABLE ? 'unavailable' : 'failed'}` : 'map.gps';
    btn.title = t(key);
    btn.setAttribute('aria-label', t(key));
  });
}

/** Move the live dot on every map currently in the document. */
function refreshUserDots(pos) {
  const scopes = [$('#trip-detail'), $('#view-plan'), $('#bd-map'), $('.mapfs')].filter(Boolean);
  scopes.forEach(scope => updateUserDot(scope, pos));
}

/**
 * Where Google Maps should open for a map showing these places.
 *
 * Framed on what is actually drawn — the stops plus the start — rather
 * than on the whole of Scotland, so a trip round Aberdeenshire opens on
 * Aberdeenshire instead of on the North Sea. With nothing to frame it
 * falls back to the country.
 */
function googleUrlForStops(stops, start, widthPx) {
  const pts = [
    ...(start ? [[start.lon, start.lat]] : []),
    ...stops.map(s => [s.poi.lon, s.poi.lat]),
  ];
  if (!pts.length) {
    const [lon, lat] = unproject(MAP_SIZE.W / 2, MAP_SIZE.H / 2);
    return googleMapsUrl(lon, lat, MAP_SIZE.lonMax - MAP_SIZE.lonMin, widthPx);
  }
  if (pts.length === 1) return googlePlaceUrl(pts[0][1], pts[0][0]);

  const lons = pts.map(p => p[0]);
  const lats = pts.map(p => p[1]);
  const lonSpan = Math.max(...lons) - Math.min(...lons);
  const latSpan = Math.max(...lats) - Math.min(...lats);
  // A tall, narrow journey is framed by its height, so widen the span we
  // hand over rather than opening zoomed past both ends of it.
  const span = Math.max(lonSpan, latSpan * 0.6, 0.05) * 1.35;
  return googleMapsUrl(
    (Math.max(...lons) + Math.min(...lons)) / 2,
    (Math.max(...lats) + Math.min(...lats)) / 2,
    span, widthPx,
  );
}

/**
 * The patch of map a journey occupies, so full screen opens on the trip
 * rather than on the whole country. Null when there is nothing to frame,
 * which leaves the viewer showing all of Scotland.
 */
function focusBoxFor(stops, start) {
  const pts = [
    ...(start ? [project(start.lon, start.lat)] : []),
    ...stops.map(s => project(s.poi.lon, s.poi.lat)),
  ];
  if (pts.length < 2) return null;
  const xs = pts.map(p => p[0]);
  const ys = pts.map(p => p[1]);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

/**
 * @param scope   where the buttons live
 * @param id      matches mapToolsHTML(id)
 * @param render  () => SVG string for the fullscreen copy
 * @param stops   for framing the Google Maps view
 */
function wireMapTools(scope, id, { render, stops = [], start = null, title = '', onPicked = null }) {
  const full = scope.querySelector(`[data-map-full="${id}"]`);
  const gmap = scope.querySelector(`[data-map-google="${id}"]`);
  if (!full || !gmap) return;

  full.addEventListener('click', () => {
    openMapViewer({ html: render(), title, onPicked, focus: focusBoxFor(stops, start) });
  });

  const stage = scope.querySelector('.map-stage') || gmap.closest('.map-stage');
  gmap.href = googleUrlForStops(stops, start, stage ? renderedMapWidth(stage) : 800);

  const gps = scope.querySelector(`[data-map-gps="${id}"]`);
  if (gps) gps.addEventListener('click', toggleGeoFromMap);
  syncGeoButtons();
}

/**
 * Show a location above the map instead of scrolling the page to it.
 * Tapping pin after pin used to walk the user down the page and leave
 * them scrolling back up each time; the map now stays put.
 */
let nessieTimer = null;

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
  // Watch the water for a while and see what happens.
  clearTimeout(nessieTimer);
  if (poiId === 'urquhart-loch-ness') {
    nessieTimer = setTimeout(() => {
      if (!panel.hidden && panel.dataset.poi !== 'closed') findEgg('nessie');
    }, 15000);
  }
}

function closePoiPanel(scope = document) {
  const panel = scope.querySelector('.poi-panel');
  if (!panel) return;
  panel.hidden = true;
  panel.innerHTML = '';
  scope.querySelectorAll('.map-marker').forEach(m => m.classList.remove('is-active'));
}

const ferryName = id => ferryInfo(id)?.name || '';

// ============================================================
// Live location
//
// Opt-in, and the first tap explains itself before the browser's own
// permission prompt appears — a bare system dialog with no context is
// the fastest way to get told no.
// ============================================================

function renderGeoBar(trip) {
  const host = $('#geo-bar');
  if (!host) return;
  const { state, position } = locationState();
  const on = state === GEO.ON;
  const busy = state === GEO.ASKING;

  const problem = { [GEO.DENIED]: 'geo.denied', [GEO.UNAVAILABLE]: 'geo.unavailable', [GEO.FAILED]: 'geo.failed' }[state];
  const stops = tripStopIds(trip).map(id => POI_BY_ID[id]).filter(Boolean);
  const near = on ? nearestOf(stops) : null;

  host.innerHTML = `
    <button type="button" class="geo-toggle ${on ? 'is-on' : ''}" id="geo-toggle"
            aria-pressed="${on}" ${busy ? 'disabled' : ''}>
      <span class="geo-dot ${on ? 'is-live' : ''}" aria-hidden="true"></span>
      ${esc(busy ? t('geo.asking') : on ? t('geo.on') : t('geo.title'))}
    </button>
    ${on && position ? `
      <span class="geo-meta">
        ${esc(near ? t('geo.nearest', { name: poiName(near.poi), dist: formatMetres(near.metres) }) : '')}
        <i>${esc(t('geo.accuracy', { n: Math.round(position.accuracy || 0) }))}</i>
      </span>
      <button type="button" class="link-btn geo-sim" id="geo-sim">${t('geo.simulate')}</button>` : ''}
    ${problem ? `<span class="geo-problem">${esc(t(problem))}</span>` : ''}`;

  $('#geo-toggle').addEventListener('click', () => {
    if (locationState().state === GEO.ON) { stopTracking(); setConsent(false); return; }
    if (hasConsented()) beginTracking();
    else askForLocation();
  });
  $('#geo-sim')?.addEventListener('click', () => {
    const next = stops.find(p => !trip.visited[p.id]) || stops[0];
    if (next && simulateAt(next)) toastInfo(t('geo.simulated', { name: poiName(next) }), '🛰️');
  });

}

/**
 * One subscription for the life of the app.
 *
 * This used to re-subscribe from inside renderGeoBar, which is itself
 * called by the listener — and adding to a Set during its own forEach
 * means the new entry is visited in the same pass, which re-subscribes,
 * which... the tab locked up on the first position fix.
 */
function wireLocation() {
  onLocationChange(({ position: pos }) => {
    // Every map on the page, not just the trip's: the builder shows one,
    // and the full-screen viewer is a third that can be open over either.
    refreshUserDots(pos);
    syncGeoButtons();
    if (currentView !== 'trip') return;
    const trip = user?.trips.find(t2 => t2.id === openTripId);
    if (trip && $('#geo-bar')) renderGeoBar(trip);
  });
}

function formatMetres(m) {
  if (m == null) return '';
  return m < 1000 ? `${m} m` : formatDistance({ distanceKm: Math.round(m / 100) / 10, distanceMi: Math.round(m / 160.9) / 10 });
}

/** Explain before the browser asks. */
function askForLocation() {
  const wrap = document.createElement('div');
  wrap.className = 'geo-consent';
  wrap.innerHTML = `
    <div class="geo-consent-card" role="dialog" aria-modal="true" aria-labelledby="geo-consent-h">
      <h3 id="geo-consent-h">${t('geo.explainTitle')}</h3>
      <p>${esc(t('geo.explain'))}</p>
      <p class="geo-battery">${esc(t('geo.explainBattery'))}</p>
      <div class="geo-consent-actions">
        <button class="btn btn-primary btn-sm" id="geo-yes">${t('geo.allow')}</button>
        <button class="btn btn-ghost btn-sm" id="geo-no">${t('geo.notNow')}</button>
      </div>
    </div>`;
  document.body.appendChild(wrap);
  const close = () => wrap.remove();
  wrap.querySelector('#geo-no').addEventListener('click', close);
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  wrap.querySelector('#geo-yes').addEventListener('click', () => {
    close();
    setConsent(true);
    beginTracking();
  });
  wrap.querySelector('#geo-yes').focus();
}

function beginTracking() {
  startTracking({ onArrive: onGeoArrive });
  const trip = user.trips.find(t2 => t2.id === openTripId);
  if (trip) {
    const stops = tripStopIds(trip).map(id => POI_BY_ID[id]).filter(Boolean);
    watchStops(stops.filter(p => !trip.visited[p.id]));
    renderGeoBar(trip);
  }
}

/** Geofence hit: offer the check-in rather than doing it silently. */
function onGeoArrive(poi, metres) {
  const trip = user.trips.find(t2 => t2.id === openTripId);
  if (!trip || trip.visited[poi.id]) return;
  const prompt = $('#geo-prompt');
  $('#geo-icon').textContent = poi.icon;
  $('#geo-poi-name').textContent = poiName(poi);
  $('#geo-meta').textContent = t('geo.arrivedMeta', {
    region: regionName(poi.region), xp: poi.xp, dist: formatMetres(metres),
  });
  prompt.classList.add('show');

  const done = () => { prompt.classList.remove('show'); };
  $('#geo-confirm').onclick = () => {
    done();
    disarmStop(poi.id);
    const t2 = user.trips.find(x => x.id === openTripId);
    if (t2 && !t2.visited[poi.id]) toggleVisited(t2, poi.id);
  };
  $('#geo-dismiss').onclick = () => { done(); rearmStop(poi.id); };
  // never leave it hanging over the map
  setTimeout(() => { if (prompt.classList.contains('show')) done(); }, 20000);
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

    ${trip.ferries?.length ? `
      <div class="ferry-banner">${esc(t('trip.ferryBanner', {
        list: trip.ferries.map(id => ferryName(id)).filter(Boolean).join(', '),
      }))}</div>` : ''}

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

    <div class="map-stage">${renderMap(stops, trip.start)}${mapToolsHTML('trip')}</div>
    ${mapKeyHTML()}

    <div class="geo-bar" id="geo-bar"></div>

    <div class="trip-export">
      <button type="button" class="btn btn-ghost btn-sm" id="dl-gpx"
              title="${esc(t('data.gpxHint'))}">${t('data.gpx')}</button>
      <button type="button" class="btn btn-ghost btn-sm" id="dl-geojson"
              title="${esc(t('data.geojsonHint'))}">${t('data.geojson')}</button>
    </div>

    <div class="stop-list">${stopListHTML(trip, true)}</div>`;

  $('#back-to-trips').addEventListener('click', () => switchView('trips'));
  $('#dl-gpx').addEventListener('click', () => {
    downloadTripGPX(trip);
    toastInfo(t('data.exported', { name: 'GPX' }), '🧭');
  });
  $('#dl-geojson').addEventListener('click', () => {
    downloadTripGeoJSON(trip);
    toastInfo(t('data.exported', { name: 'GeoJSON' }), '🗺️');
  });
  wireMapMarkers(host);
  wireMapTools(host, 'trip', {
    // Re-rendered rather than cloned: a clone would carry duplicate
    // gradient and filter ids into the document, and every url(#...)
    // in both copies would then resolve to whichever parsed first.
    render: () => renderMap(stops, trip.start, locationState().position, { idSuffix: 'fs' }),
    stops, start: trip.start, title: tripTitle(trip),
    onPicked: id => openPoiPanel(id, host, trip, true),
  });
  wireStopList(host, trip);
  hydratePhotos(host);
  renderGeoBar(trip);
  watchStops(stops.filter(x => !x.visited).map(x => x.poi));
  updateUserDot(host, locationState().position);
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

// { poiId, tripId } awaiting a file from the shared picker. The journey
// is captured at the moment the button is pressed, because that is what
// files the photograph — two visits to the same glen are two pictures.
let photoTarget = null;

/** Paint any stored photos into the stops currently on screen. */
/**
 * Fill in whatever photographs belong to the stops now on screen.
 *
 * Asks per visible location rather than reading the whole store, so an
 * account with three hundred photographs does not decode all of them to
 * put four thumbnails on a page.
 */
async function hydratePhotos(scope, trip = null) {
  const tripId = (trip || user.trips.find(t2 => t2.id === openTripId))?.id || '';
  const slots = [...scope.querySelectorAll('[data-photo-slot]')]
    .filter(slot => !slot.querySelector('.stop-photo'));
  const wanted = [...new Set(slots.map(s => s.dataset.photoSlot))];

  for (const poiId of wanted) {
    const record = await coverFor(user.id, tripId, poiId);
    if (!record) continue;
    slots.filter(s => s.dataset.photoSlot === poiId).forEach(slot => attachThumb(slot, record));
  }
}

/**
 * A location can be on screen twice — expanded in the list and open in
 * the panel above the map — so the thumbnail is filled per slot rather
 * than once per location. The small rendition goes in the page; the
 * print-resolution one is only decoded if the viewer is opened.
 */
function attachThumb(slot, record) {
  const poi = POI_BY_ID[record.poiId];
  const label = t('photo.alt', { name: poiName(poi) });
  slot.innerHTML = '';
  const fig = document.createElement('button');
  fig.type = 'button';
  fig.className = 'stop-photo';
  fig.title = label;
  fig.innerHTML = `<img src="${record.thumb}" alt="${esc(label)}" loading="lazy">`;
  fig.addEventListener('click', e => { e.stopPropagation(); openPhoto(record); });
  slot.appendChild(fig);

  const host = slot.closest('.sl-body, .poi-panel');
  const btn = host && host.querySelector(`[data-photo="${record.poiId}"]`);
  if (btn) { btn.classList.add('has-photo'); btn.title = t('photo.replace'); }
}

function openPhoto(record) {
  const poi = POI_BY_ID[record.poiId];
  $('#photo-viewer-img').src = record.full || record.thumb;
  $('#photo-viewer-img').alt = t('photo.alt', { name: poiName(poi) });

  const uploaded = Boolean(record.remote);
  $('#photo-caption').innerHTML =
    `<span>${poi.icon} ${esc(poiName(poi))}${uploaded ? ` <span class="ph-cloud" title="${esc(t('photo.uploaded'))}">☁︎</span>` : ''}</span>` +
    `<span class="ph-tools">` +
    (cloudSignedIn() && !uploaded
      ? `<button type="button" class="btn btn-ghost btn-sm" id="photo-up">${t('photo.upload')}</button>` : '') +
    `<button type="button" class="btn btn-danger btn-sm" id="photo-del">${t('photo.remove')}</button></span>`;
  $('#photo-viewer').hidden = false;

  $('#photo-del').addEventListener('click', async () => {
    if (!confirm(t('photo.removeConfirm'))) return;
    await removeRemotePhoto(record);
    await deletePhoto(record.id);
    closePhoto();
    renderTripDetail();
  });

  const up = $('#photo-up');
  if (up) up.addEventListener('click', async () => {
    up.disabled = true;
    try {
      await uploadPhoto(record);
      toastInfo(t('photo.uploaded'), '☁️');
      closePhoto();
      renderTripDetail();
    } catch (err) {
      up.disabled = false;
      toastInfo(err.i18nKey ? t(err.i18nKey) : t('cloud.err.failed'), '⚠️');
    }
  });
}

function closePhoto() {
  $('#photo-viewer').hidden = true;
  $('#photo-viewer-img').src = '';
}

/**
 * Housekeeping after a photograph is taken.
 *
 * The first one is the moment to ask the browser to keep our storage
 * for good, because until there is something worth keeping the request
 * is both meaningless and, in Firefox, a permission prompt out of
 * nowhere. Chrome never prompts at all, so asking here costs nothing
 * and quietly upgrades most users.
 *
 * Then, rarely, a reminder to take a copy off the device — see
 * shouldSuggestBackup for how hard that is to trigger, and why.
 */
async function afterPhotoAdded() {
  if (!hasAskedForPersistence()) {
    try { await requestPersistence(); } catch { /* not fatal */ }
  }
  photoCount = await countPhotos(user.id);
  try {
    const health = await storageHealth(user.id);
    if (shouldSuggestBackup(health)) {
      markBackupSuggested();
      toastInfo(t('vault.nag', { n: health.unbackedUp }), '💾');
    }
  } catch { /* the panel will say the same thing next time it is opened */ }
}

function wirePhotos() {
  const input = $('#photo-input');

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-photo]');
    if (!btn) return;
    e.stopPropagation();
    photoTarget = {
      poiId: btn.dataset.photo,
      tripId: user.trips.find(t2 => t2.id === openTripId)?.id || '',
    };
    input.value = '';          // so re-picking the same file still fires change
    input.click();
  });

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file || !photoTarget) return;
    const { poiId, tripId } = photoTarget;
    photoTarget = null;
    try {
      const record = await addPhoto(user.id, { tripId, poiId }, file);
      document.querySelectorAll(`[data-photo-slot="${poiId}"]`)
        .forEach(slot => attachThumb(slot, record));
      toastInfo(t('photo.saved', { name: poiName(POI_BY_ID[poiId]) }), '📸');
      afterPhotoAdded();
    } catch (err) {
      // A full disk is the one failure worth naming: it is fixable, and
      // "could not save" would send someone hunting for the wrong thing.
      const quota = err?.name === 'QuotaExceededError' || /quota/i.test(err?.message || '');
      toastInfo(t(quota ? 'photo.failedSpace' : 'photo.failed'), '⚠️');
    }
  });

  $('#photo-close').addEventListener('click', closePhoto);
  $('#photo-viewer').addEventListener('click', e => { if (e.target.id === 'photo-viewer') closePhoto(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#photo-viewer').hidden) closePhoto();
  });
}


// ============================================================
// The Library
//
// Everything ships with the app, so it reads in a glen with no signal.
// Most entries open as you travel, which is the point: the reward for
// standing somewhere is being told why it matters.
// ============================================================

let libFilter = 'all';

/** The user, plus the derived level the unlock rules ask about. */
function loreUser() {
  return user ? { ...user, level: LEVELS.fromXP(user.xp).level } : null;
}

/** Award the hidden entries. Returns true if this one is new. */
function findEgg(key) {
  if (!user) return false;
  user.eggs = user.eggs || {};
  if (user.eggs[key]) return false;
  user.eggs[key] = Date.now();
  store.save();
  const entry = LORE.find(l => l.unlock && l.unlock.egg === key);
  if (entry) {
    toastInfo(t('library.found', { title: loreTitle(entry) }), LORE_TYPES.egg.icon);
    burstConfetti(30);
  }
  return true;
}

const loreTitle = e => (e[getLang()] || e.en).t;
const loreBody  = e => (e[getLang()] || e.en).b;

/** Mark an entry as read, so the library can show what is new. */
function markRead(id) {
  if (!user) return;
  user.lore = user.lore || {};
  if (!user.lore[id]) { user.lore[id] = Date.now(); store.save(); }
}

function lockHint(entry) {
  const u = entry.unlock || {};
  if (u.visit) return t('library.hint.visit', { name: poiName(POI_BY_ID[u.visit]) });
  if (u.region) return t('library.hint.region', { name: regionName(u.region) });
  if (u.level) return t('library.hint.level', { n: u.level });
  return t('library.hint.egg');
}

function renderLibrary() {
  const lu = loreUser();
  const prog = loreProgress(lu);
  $('#lib-count').textContent = t('library.count', { open: prog.open, total: prog.total });
  $('#lib-progress').style.width = `${prog.pct}%`;

  const types = ['all', ...Object.keys(LORE_TYPES)];
  $('#lib-filters').innerHTML = types.map(k => `
    <button type="button" class="chip ${libFilter === k ? 'active' : ''}" data-lib-filter="${k}">
      ${k === 'all' ? '' : LORE_TYPES[k].icon + ' '}${esc(t(k === 'all' ? 'library.filter.all' : `library.type.${k}`))}
    </button>`).join('');
  $$('#lib-filters [data-lib-filter]').forEach(b =>
    b.addEventListener('click', () => { libFilter = b.dataset.libFilter; renderLibrary(); }));

  const list = LORE.filter(l => libFilter === 'all' || l.type === libFilter);
  const host = $('#lib-list');
  if (!list.length) { host.innerHTML = `<p class="muted">${t('library.empty')}</p>`; return; }

  host.innerHTML = list.map(e => {
    const open = isUnlocked(e, lu);
    if (!open) {
      return `
        <article class="lore-card is-locked">
          <div class="lore-top"><span class="lore-icon">🔒</span>
            <span class="lore-kind">${esc(t('library.locked'))}</span></div>
          <p class="lore-hint">${esc(lockHint(e))}</p>
        </article>`;
    }
    const isNew = !(user.lore || {})[e.id];
    return `
      <article class="lore-card ${isNew ? 'is-new' : ''}" data-lore="${e.id}">
        <div class="lore-top">
          <span class="lore-icon">${LORE_TYPES[e.type].icon}</span>
          <span class="lore-kind">${esc(t(`library.type.${e.type}`))}</span>
          ${isNew ? `<span class="lore-new">${esc(t('library.newBadge'))}</span>` : ''}
        </div>
        <h3 class="lore-title">${esc(loreTitle(e))}</h3>
        <p class="lore-body">${esc(loreBody(e))}</p>
        ${e.type === 'legend' ? `<p class="lore-note">${esc(t('library.legendNote'))}</p>` : ''}
        ${e.poi ? `<button type="button" class="link-btn lore-goto" data-lore-poi="${e.poi}">${esc(poiName(POI_BY_ID[e.poi]))} →</button>` : ''}
      </article>`;
  }).join('');

  // reading an entry clears its "new" flag
  host.querySelectorAll('[data-lore]').forEach(card => {
    markRead(card.dataset.lore);
  });
  checkLibraryComplete();
}

/** The last hidden entry: open everything else and it appears. */
function checkLibraryComplete() {
  const lu = loreUser();
  if (!lu) return;
  const others = LORE.filter(l => !(l.unlock && l.unlock.egg === 'library'));
  if (others.every(l => isUnlocked(l, lu))) findEgg('library');
}

/** Lore shown inline on a location, when it is open. */
function loreForPanel(poi) {
  const lu = loreUser();
  const open = loreForPoi(poi.id).filter(l => isUnlocked(l, lu));
  if (!open.length) return '';
  const first = open[0];
  markRead(first.id);
  return `
    <div class="pd-lore">
      <span class="pd-lore-kicker">${LORE_TYPES[first.type].icon} ${esc(t('lore.did'))}</span>
      <b>${esc(loreTitle(first))}</b>
      <p>${esc(loreBody(first))}</p>
      ${open.length > 1 ? `<i>${esc(t('lore.more', { n: open.length - 1 }))}</i>` : ''}
    </div>`;
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
// Safety
//
// Emergency first, then the things that actually get people into
// trouble in Scotland, then what this app is not. Held in the app so it
// reads with no signal — which is exactly when it is needed.
//
// The wording is mirrored in SAFETY.md for review by someone qualified.
// Change one and change the other.
// ============================================================

const SAFETY_SECTIONS = [
  ['emergency', '🆘', true],
  ['sms', '📶', true],
  ['word', '🗒️', false],
  ['weather', '🌦️', false],
  ['light', '🔦', false],
  ['nav', '🧭', false],
  ['winter', '❄️', false],
  ['water', '🌊', false],
  ['ticks', '🕷️', false],
  ['stalking', '🦌', false],
  ['access', '🚶', false],
];

function renderSafety() {
  $('#safety-body').innerHTML = `
    ${SAFETY_SECTIONS.map(([key, icon, urgent]) => `
      <section class="card safety-card ${urgent ? 'is-urgent' : ''}">
        <h3><span aria-hidden="true">${icon}</span> ${esc(t(`safety.${key}.t`))}</h3>
        <p>${esc(t(`safety.${key}.b`))}</p>
      </section>`).join('')}

    <section class="card safety-card is-disclaimer">
      <h3><span aria-hidden="true">⚠️</span> ${esc(t('safety.disclaimer.t'))}</h3>
      <p>${esc(t('safety.disclaimer.b'))}</p>
    </section>`;
}

// ============================================================
// View: Store
//
// Everything sold here is made from photographs the user took, so the
// shop is really a photo picker with prices attached. Two things it is
// careful about:
//
//   * It never claims to have sold anything. Until a real shop is
//     connected the flow ends with a reference and a plain statement
//     that checkout is not live, because a fake "order placed" is a
//     promise the app cannot keep.
//   * It checks resolution before the order, not after the parcel.
//     A photograph that will print soft is marked as such, with the
//     actual dpi, so the choice is the user's and informed.
// ============================================================

let storeProducts = CATALOGUE;
let storeProduct = null;      // product being built, or null at the catalogue
let storeTripId = null;
let storeSlots = [];
let storeStartMonth = new Date().getMonth();
let storePicking = -1;        // which slot the picker is filling

function renderStore() {
  // Confirm prices against the server when there is one, but never wait
  // for it: the catalogue renders immediately from the built-in list.
  if (cloudAvailable()) {
    cloudProducts()
      .then(rows => {
        const merged = mergeRemote(rows);
        if (JSON.stringify(merged) !== JSON.stringify(storeProducts)) {
          storeProducts = merged;
          if (currentView === 'store') renderStore();
        }
      })
      .catch(() => { /* built-in prices stay on screen, flagged below */ });
  }

  $('#store-body').innerHTML = storeProduct ? builderHTML() : catalogueHTML();
  if (storeProduct) wireStoreBuilder(); else wireStoreCatalogue();
}

function catalogueHTML() {
  const unpriced = !cloudAvailable();
  return `
    ${storeConfigured() ? '' : `<div class="card store-notice">${esc(t('store.notLive'))}</div>`}
    <div class="store-grid">
      ${storeProducts.map(p => `
        <article class="card store-item">
          <div class="si-icon">${p.icon || '🎁'}</div>
          <h3>${esc(productName(p))}</h3>
          <p class="si-blurb">${esc(productBlurb(p))}</p>
          <div class="si-foot">
            <span class="si-price">${esc(priceText(p.pricePence, p.currency))}${unpriced ? '*' : ''}</span>
            <button class="btn btn-primary btn-sm" data-build="${p.id}">${t('store.make')}</button>
          </div>
          <p class="si-photos">${esc(t('store.needsPhotos', { n: p.photoCount }))}</p>
        </article>`).join('')}
    </div>
    ${unpriced ? `<p class="store-fineprint">${esc(t('store.priceUnconfirmed'))}</p>` : ''}
    <div id="store-orders"></div>`;
}

function wireStoreCatalogue() {
  $$('[data-build]').forEach(btn => btn.addEventListener('click', async () => {
    const product = storeProducts.find(p => p.id === btn.dataset.build);
    if (!product) return;
    storeProduct = product;
    storeTripId = user.trips[0]?.id || '';
    await loadStoreSlots();
    renderStore();
  }));

  if (cloudSignedIn()) {
    myOrders()
      .then(rows => {
        if (!rows?.length || currentView !== 'store' || storeProduct) return;
        $('#store-orders').innerHTML = `
          <section class="card orders-card">
            <h3>${t('store.yourOrders')}</h3>
            ${rows.map(o => `
              <div class="order-row">
                <span class="order-ref">${esc(o.ref)}</span>
                <span class="order-what">${esc(productName(storeProducts.find(p => p.id === o.product_id) || { name: o.kind }))}</span>
                <span class="order-status status-${esc(o.status)}">${esc(t(`store.status.${o.status}`))}</span>
                <span class="order-total">${esc(priceText(o.total_pence, o.currency))}</span>
              </div>`).join('')}
          </section>`;
      })
      .catch(() => { /* orders are a nicety; the shop works without them */ });
  }
}

/** Photographs from the chosen journey, laid into the product's slots. */
async function loadStoreSlots() {
  const photos = storeTripId
    ? await photosForTrip(user.id, storeTripId)
    : await allPhotos(user.id);
  storeSlots = calendarSlots(photos, storeProduct.photoCount);
}

function builderHTML() {
  const product = storeProduct;
  const isCalendar = product.kind === 'calendar';
  const months = isCalendar ? monthsFor(storeStartMonth, new Date().getFullYear()) : null;
  const report = printReport(storeSlots, product);

  const slotHTML = storeSlots.map((p, i) => {
    const label = isCalendar ? months[i].label : t('store.slot', { n: i + 1 });
    if (!p) {
      return `<button type="button" class="cal-slot empty" data-slot="${i}">
        <span class="cs-month">${esc(label)}</span>
        <span class="cs-add">＋</span>
      </button>`;
    }
    const grade = printGrade(p, product.printWidthMm);
    const dpi = printDpi(p, product.printWidthMm);
    const poi = POI_BY_ID[p.poiId];
    return `<button type="button" class="cal-slot grade-${grade}" data-slot="${i}">
      <img src="${p.thumb}" alt="">
      <span class="cs-month">${esc(label)}</span>
      <span class="cs-where">${poi ? esc(poiName(poi)) : ''}</span>
      ${grade === 'good' ? '' : `<span class="cs-grade">${esc(t(`shop.grade.${grade}`))}${dpi ? ` · ${dpi} dpi` : ''}</span>`}
    </button>`;
  }).join('');

  const trips = user.trips;

  return `
    <div class="card builder-bar">
      <button class="btn btn-ghost btn-sm" id="store-back">← ${t('store.backToShop')}</button>
      <h2>${esc(productName(product))}</h2>
      <span class="bb-price">${esc(priceText(product.pricePence, product.currency))}</span>
    </div>

    <div class="card builder-opts">
      <label class="field">
        <span>${t('store.fromTrip')}</span>
        <select id="store-trip">
          <option value="">${esc(t('store.allPhotos'))}</option>
          ${trips.map(tr => `<option value="${tr.id}" ${tr.id === storeTripId ? 'selected' : ''}>${esc(tripTitle(tr))}</option>`).join('')}
        </select>
      </label>
      ${product.kind === 'calendar' ? `
      <label class="field">
        <span>${t('store.startMonth')}</span>
        <select id="store-start">
          ${monthsFor(0, new Date().getFullYear()).map(m => `<option value="${m.month}" ${m.month === storeStartMonth ? 'selected' : ''}>${esc(m.label)}</option>`).join('')}
        </select>
      </label>` : ''}
    </div>

    <div class="cal-grid ${product.kind}">${slotHTML}</div>

    <section class="card builder-foot">
      <p class="bf-status">${esc(report.complete
        ? t('store.ready', { n: report.needed })
        : t('store.stillNeeded', { n: report.needed - report.filled }))}</p>
      ${report.poor ? `<p class="bf-warn">${esc(t('store.warnPoor', { n: report.poor }))}</p>` : ''}
      ${report.fair ? `<p class="bf-note">${esc(t('store.warnFair', { n: report.fair }))}</p>` : ''}
      <button class="btn btn-primary" id="store-order" ${report.complete ? '' : 'disabled'}>
        ${t('store.order')}
      </button>
      <p class="bf-fine">${esc(t(cloudSignedIn() ? 'store.orderNeedsUpload' : 'store.orderNeedsAccount'))}</p>
    </section>

    <div id="store-picker" class="picker" hidden></div>`;
}

function wireStoreBuilder() {
  $('#store-back').addEventListener('click', () => {
    storeProduct = null; storePicking = -1;
    renderStore();
  });

  $('#store-trip').addEventListener('change', async e => {
    storeTripId = e.target.value;
    await loadStoreSlots();
    renderStore();
  });

  const start = $('#store-start');
  if (start) start.addEventListener('change', e => {
    storeStartMonth = Number(e.target.value);
    renderStore();
  });

  $$('[data-slot]').forEach(btn => btn.addEventListener('click', () => openSlotPicker(Number(btn.dataset.slot))));

  $('#store-order').addEventListener('click', submitOrder);
}

/** Choose which photograph fills one slot. */
async function openSlotPicker(index) {
  storePicking = index;
  const photos = storeTripId ? await photosForTrip(user.id, storeTripId) : await allPhotos(user.id);
  const picker = $('#store-picker');

  if (!photos.length) {
    picker.hidden = false;
    picker.innerHTML = `<div class="picker-inner card">
      <p>${esc(t('store.noPhotos'))}</p>
      <button class="btn btn-ghost btn-sm" id="picker-close">${t('common.close')}</button>
    </div>`;
    $('#picker-close').addEventListener('click', () => { picker.hidden = true; });
    return;
  }

  picker.hidden = false;
  picker.innerHTML = `<div class="picker-inner card">
    <header class="picker-head">
      <h3>${t('store.choosePhoto')}</h3>
      <button class="btn btn-ghost btn-sm" id="picker-close">${t('common.close')}</button>
    </header>
    <div class="picker-grid">
      ${photos.map(p => {
        const poi = POI_BY_ID[p.poiId];
        const grade = printGrade(p, storeProduct.printWidthMm);
        return `<button type="button" class="pick grade-${grade}" data-pick="${p.id}">
          <img src="${p.thumb}" alt="">
          <span>${poi ? esc(poiName(poi)) : ''}</span>
          ${grade === 'poor' ? `<span class="pick-warn">${esc(t('shop.grade.poor'))}</span>` : ''}
        </button>`;
      }).join('')}
    </div>
    ${storeSlots[index] ? `<button class="btn btn-danger btn-sm" id="picker-clear">${t('store.clearSlot')}</button>` : ''}
  </div>`;

  const close = () => { picker.hidden = true; storePicking = -1; };
  $('#picker-close').addEventListener('click', close);
  const clear = $('#picker-clear');
  if (clear) clear.addEventListener('click', () => { storeSlots[index] = null; close(); renderStore(); });

  $$('[data-pick]').forEach(btn => btn.addEventListener('click', () => {
    storeSlots[index] = photos.find(p => p.id === btn.dataset.pick) || null;
    close();
    renderStore();
  }));
}

/**
 * Place the order.
 *
 * The photographs have to exist server-side first — create_order()
 * refuses items it cannot find against the account, which is what stops
 * an order referencing pictures nobody has. So the upload happens here,
 * with the button reporting progress, and only then is the order made.
 */
async function submitOrder() {
  const btn = $('#store-order');
  const chosen = storeSlots.filter(Boolean);
  if (!chosen.length) return;

  if (!cloudSignedIn()) {
    toastInfo(t('store.orderNeedsAccount'), 'ℹ️');
    return;
  }

  btn.disabled = true;
  const original = btn.textContent;
  try {
    const pending = [...new Map(chosen.filter(p => !p.remote).map(p => [p.id, p])).values()];
    let done = 0;
    for (const p of pending) {
      btn.textContent = t('store.uploading', { done: ++done, total: pending.length });
      const fresh = await getPhoto(p.id);
      await uploadPhoto(fresh || p);
    }

    btn.textContent = t('store.placing');
    const order = await placeOrder(storeProduct.id, orderItems(storeSlots));

    const url = checkoutUrl(order);
    if (url) {
      // A new tab, not a redirect: the app holds unsaved builder state
      // and navigating away from it would throw the work out.
      window.open(url, '_blank', 'noopener');
      toastInfo(t('store.handedOff', { ref: order.ref }), '🧾');
    } else {
      alert(t('store.savedNotLive', { ref: order.ref, total: priceText(order.total_pence, order.currency) }));
    }
    storeProduct = null;
    renderStore();
  } catch (err) {
    toastInfo(err.i18nKey ? t(err.i18nKey) : t('cloud.err.failed'), '⚠️');
  } finally {
    btn.disabled = false;
    btn.textContent = original;
  }
}

// ============================================================
// View: Profile
// ============================================================

let photoCount = 0;
let health = null;          // last storageHealth() result, for the vault card

function renderProfile() {
  const s = userStats(user);
  // Both of these read IndexedDB, so the card is drawn from what was
  // known last time and re-drawn if the answer has moved. Blocking the
  // whole profile on a disk read would show an empty screen first.
  countPhotos(user.id).then(n => {
    if (n !== photoCount) { photoCount = n; if (currentView === 'profile') renderProfile(); }
  });
  storageHealth(user.id).then(h => {
    const changed = !health || h.risk !== health.risk || h.bytes !== health.bytes
      || h.backedUp !== health.backedUp || h.durability !== health.durability;
    health = h;
    if (changed && currentView === 'profile') renderProfile();
  }).catch(() => { /* the card falls back to its unknown state */ });
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
        ['📖', loreProgress(loreUser()).open, 'profile.stat.lore'],
      ].map(([icon, n, key]) => `
        <div class="stat card"><span class="stat-icon">${icon}</span><span class="stat-n">${n}</span><span class="stat-label">${esc(t(key))}</span></div>`).join('')}
    </div>

    ${accountCardHTML()}
    ${vaultCardHTML()}

    <section class="card data-card">
      <h3>${t('data.title')}</h3>
      <p class="data-sub">${t('data.sub')}</p>
      <p class="data-warn">${esc(t(cloudSignedIn() ? 'data.warnCloud' : 'data.warn'))}</p>
      <div class="data-actions">
        <button class="btn btn-primary btn-sm" id="dl-backup">${t('data.backup')}</button>
        <button class="btn btn-ghost btn-sm" id="do-restore">${t('data.restore')}</button>
      </div>
      <input type="file" id="restore-input" accept="application/json,.json" hidden>
    </section>

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
  wireDataControls();
  wireVaultControls();
  wireAccountControls();
}

// ============================================================
// Where your photographs actually live
//
// The panel leads with the plain answer — are these pictures safe? —
// and only then explains. It deliberately does not go green just
// because the browser granted persistent storage: persistence stops
// automatic eviction, it does not survive somebody tapping "clear
// browsing data", and telling people their photographs are safe when
// one wrong tap would delete them would be a lie with a cost.
// ============================================================

function vaultCardHTML() {
  if (!health) return `<section class="card vault-card" id="vault-card"><h3>${t('vault.title')}</h3><p class="muted">${t('vault.checking')}</p></section>`;
  if (health.photos === 0) {
    return `<section class="card vault-card" id="vault-card">
      <h3>${t('vault.title')}</h3>
      <p class="muted">${t('vault.none')}</p>
    </section>`;
  }

  const pct = health.quotaKnown ? Math.min(100, Math.round(health.fullness * 100)) : 0;
  const rows = [];

  rows.push([
    health.durability === DURABILITY.PERSISTED ? '🔒' : '⚠️',
    t(`vault.durability.${health.durability}`),
  ]);
  if (health.quotaKnown) {
    rows.push(['💽', t('vault.usage', {
      used: formatBytes(health.usage, formatNumber),
      total: formatBytes(health.quota, formatNumber),
      pct,
    })]);
  }
  rows.push(['☁️', health.backedUp === health.photos
    ? t('vault.copiedAll', { n: health.photos })
    : t('vault.copiedSome', { n: health.backedUp, total: health.photos })]);
  if (health.ios && !health.installed) rows.push(['📱', t('vault.ios')]);

  return `<section class="card vault-card risk-${health.risk}" id="vault-card">
    <h3>${t('vault.title')}</h3>
    <p class="vault-verdict">${esc(t(`vault.risk.${health.risk}`))}</p>
    <div class="vault-rows">
      ${rows.map(([icon, text]) => `<div class="vault-row"><span>${icon}</span><span>${esc(text)}</span></div>`).join('')}
    </div>
    ${health.quotaKnown ? `<div class="progress slim"><div class="progress-fill" style="width:${pct}%"></div></div>` : ''}
    <div class="data-actions">
      <button class="btn btn-primary btn-sm" id="vault-export">${t('vault.saveFiles')}</button>
      ${health.durability !== DURABILITY.PERSISTED && navigator.storage?.persist
        ? `<button class="btn btn-ghost btn-sm" id="vault-persist">${t('vault.protect')}</button>` : ''}
      ${cloudSignedIn() && health.unbackedUp
        ? `<button class="btn btn-ghost btn-sm" id="vault-upload">${t('vault.uploadAll', { n: health.unbackedUp })}</button>` : ''}
    </div>
    <p class="vault-note">${esc(t('vault.note'))}</p>
  </section>`;
}

/** braw-01-edinburgh-castle.jpg — sorted by journey, readable in a folder. */
function photoFileName(record, index) {
  const poi = POI_BY_ID[record.poiId];
  const name = poi ? poiName(poi) : record.poiId;
  const clean = String(name).toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // drop accents, keep the letters
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '').slice(0, 40);
  return `braw-${String(index + 1).padStart(3, '0')}-${clean || 'photo'}.jpg`;
}

function wireVaultControls() {
  const exportBtn = $('#vault-export');
  if (exportBtn) exportBtn.addEventListener('click', async () => {
    exportBtn.disabled = true;
    const original = exportBtn.textContent;
    let i = 0;
    try {
      const res = await exportPhotoFiles(
        user.id,
        record => photoFileName(record, i++),
        (done, total) => { exportBtn.textContent = t('vault.saving', { done, total }); },
      );
      if (res.method === 'cancelled') toastInfo(t('vault.cancelled'), '↩️');
      else if (res.saved) toastInfo(t('vault.saved', { n: res.saved }), '💾');
    } catch {
      toastInfo(t('vault.saveFailed'), '⚠️');
    } finally {
      exportBtn.disabled = false;
      exportBtn.textContent = original;
      renderProfile();
    }
  });

  const persistBtn = $('#vault-persist');
  if (persistBtn) persistBtn.addEventListener('click', async () => {
    const result = await requestPersistence();
    health = await storageHealth(user.id);
    toastInfo(t(result === DURABILITY.PERSISTED ? 'vault.protected' : 'vault.protectRefused'),
      result === DURABILITY.PERSISTED ? '🔒' : 'ℹ️');
    renderProfile();
  });

  const uploadBtn = $('#vault-upload');
  if (uploadBtn) uploadBtn.addEventListener('click', async () => {
    uploadBtn.disabled = true;
    const original = uploadBtn.textContent;
    try {
      const res = await uploadAll(user.id, (done, total) => {
        uploadBtn.textContent = t('vault.uploading', { done, total });
      });
      toastInfo(t('vault.uploaded', { n: res.uploaded }), '☁️');
    } catch (err) {
      toastInfo(err.i18nKey ? t(err.i18nKey) : t('cloud.err.failed'), '⚠️');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = original;
      health = await storageHealth(user.id);
      renderProfile();
    }
  });
}

// ============================================================
// The account card
// ============================================================

function accountCardHTML() {
  if (!cloudAvailable()) {
    return `<section class="card account-card" id="account-card">
      <h3>${t('account.title')}</h3>
      <p class="muted">${esc(t('account.localOnly'))}</p>
    </section>`;
  }

  const me = cloudUser();
  if (!me) {
    return `<section class="card account-card" id="account-card">
      <h3>${t('account.title')}</h3>
      <p class="data-sub">${esc(t('account.signedOutBody'))}</p>
      <div class="data-actions">
        <button class="btn btn-primary btn-sm" id="account-link">${t('account.link')}</button>
      </div>
    </section>`;
  }

  return `<section class="card account-card" id="account-card">
    <h3>${t('account.title')}</h3>
    <p class="data-sub">${esc(t('account.signedInAs', { email: me.email || '' }))}</p>
    <div class="data-actions">
      <button class="btn btn-ghost btn-sm" id="account-sync">${t('account.syncNow')}</button>
      <button class="btn btn-ghost btn-sm" id="account-signout">${t('account.signOutCloud')}</button>
    </div>
  </section>`;
}

function wireAccountControls() {
  const link = $('#account-link');
  if (link) link.addEventListener('click', () => {
    // Signing out of the app entirely is the honest route to the cloud
    // sign-in form: it is the same screen, and pretending otherwise
    // would mean a second copy of it living in the profile view.
    pendingLocalKey = user.id;
    toastInfo(t('account.linkHint'), 'ℹ️');
    $('#logout-btn').click();
  });

  const sync = $('#account-sync');
  if (sync) sync.addEventListener('click', async () => {
    sync.disabled = true;
    try {
      const res = await pushProfile(user);
      if (res.ok) toastInfo(t('account.synced'), '☁️');
      else if (res.conflict) await resolveConflict();
      else toastInfo(t('cloud.err.failed'), '⚠️');
    } catch (err) {
      toastInfo(err.i18nKey ? t(err.i18nKey) : t('cloud.err.failed'), '⚠️');
    } finally { sync.disabled = false; }
  });

  const out = $('#account-signout');
  if (out) out.addEventListener('click', async () => {
    await flushPush();
    await account.signOut();
    $('#logout-btn').click();
  });
}

/**
 * Two devices have both moved on. Ask; do not merge.
 *
 * Merging two XP histories produces a profile neither phone ever had —
 * badges awarded for trips that are not there, counts that do not add
 * up. Whichever the user picks is at least a state that really existed.
 */
async function resolveConflict() {
  const remote = await pullProfile();
  if (!remote?.data) return;
  const mine = t('account.conflictMine', { trips: user.trips.length, xp: formatNumber(user.xp) });
  const theirs = t('account.conflictTheirs', {
    trips: (remote.data.trips || []).length, xp: formatNumber(remote.data.xp || 0),
  });
  const keepRemote = confirm(t('account.conflict', { mine, theirs }));
  if (keepRemote) {
    user = store.adoptRemote(remote.data);
    store.save();
    renderHeader();
    switchView('trips');
    toastInfo(t('account.tookRemote'), '☁️');
  } else {
    const res = await pushProfile(user);
    toastInfo(t(res.ok ? 'account.keptMine' : 'cloud.err.failed'), res.ok ? '📱' : '⚠️');
  }
}

// ============================================================
// Taking your data with you
// ============================================================

function wireDataControls() {
  $('#dl-backup').addEventListener('click', async () => {
    const data = await downloadBackup(user);
    const n = (data.photos || []).length;
    toastInfo(t('data.exported', { trips: user.trips.length, photos: n }), '💾');
    // Above the size cap the print-resolution copies are left out, and
    // saying so matters: the file looks complete either way, and the
    // difference only shows up when a calendar is ordered from it.
    if (data.truncated) toastInfo(t('data.truncated'), 'ℹ️');
  });

  const input = $('#restore-input');
  $('#do-restore').addEventListener('click', () => { input.value = ''; input.click(); });

  input.addEventListener('change', async () => {
    const file = input.files && input.files[0];
    if (!file) return;
    try {
      const data = readBackup(await file.text());
      const them = backupSummary(data);
      const mine = userStats(user);
      const ok = confirm(t('data.confirm', {
        name: them.name,
        trips: user.trips.length, xp: formatNumber(user.xp),
        theirTrips: them.trips, theirXp: formatNumber(them.xp),
        date: new Date(them.exportedAt).toLocaleDateString(locale()),
      }));
      if (!ok) return;

      user = store.restore(data.profile);
      let photos = 0;
      let dropped = 0;
      for (const p of data.photos || []) {
        try {
          await putPhotoRecord({
            ...p,
            owner: user.id,
            full: p.full || p.thumb,
            remote: null,            // the copy is local again; re-upload if wanted
          });
          photos++;
        } catch { dropped++; }       // out of room, most likely
      }
      store.save();
      if (dropped) toastInfo(t('data.photosDropped', { n: dropped }), '⚠️');
      toastInfo(t('data.restored', { trips: user.trips.length, photos }), '📥');
      renderHeader();
      switchView('trips');
    } catch (err) {
      const key = ['notJson', 'notBackup', 'tooNew'].includes(err.message) ? err.message : 'failed';
      toastInfo(t(`data.err.${key}`), '⚠️');
    }
  });
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
  // Seven taps on the wordmark. Somebody always tries.
  const mark = $('.wordmark');
  if (mark && !mark.dataset.eggWired) {
    mark.dataset.eggWired = '1';
    let taps = 0, timer = null;
    mark.addEventListener('click', () => {
      taps++;
      clearTimeout(timer);
      timer = setTimeout(() => { taps = 0; }, 1200);
      if (taps >= 7) { taps = 0; findEgg('wordmark'); }
    });
  }
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
  syncAuthSubmit();   // decides which fields the sign-in form shows
  wireSync();
  wireNav();
  wirePhotos();
  wireLocation();
  $('#plan-go').addEventListener('click', runPlanner);
  $('#plan-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runPlanner();
  });
  boot();
  // Webfonts last: they must never hold up the first screen.
  requestAnimationFrame(() => loadFonts());
});
