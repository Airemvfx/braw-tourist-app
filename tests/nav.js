// ============================================================
// Getting around, on a phone and on a desktop.
//
// On a phone the tabs live in a panel above a button in the bottom-left
// corner. The things that matter: every destination is reachable
// without scrolling, nothing is hidden under the button, the button
// toggles, and the panel is genuinely gone when closed rather than
// merely invisible — an off-screen row of buttons you can still tab
// into is worse than no menu at all.
//
// On a desktop the tabs are back in the header, and the button and its
// scrim are nowhere.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

const EXPECTED = 10;   // nav destinations

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const p = await (await b.newContext()).newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));

  const boot = async width => {
    await p.setViewportSize({ width, height: 844 });
    await p.goto('http://localhost:8099/');
    // A previous pass leaves a session behind, so the auth screen never
    // reappears and the wait below times out. Start each width clean.
    await p.evaluate(() => localStorage.clear());
    await p.reload();
    await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
    await p.locator('#demo-btn').click();
    await p.waitForTimeout(4200);
    await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  };

  for (const w of [320, 390]) {
    console.log(`\n-- ${w}px --`);
    await boot(w);

    const closed = await p.evaluate(() => {
      const nav = document.getElementById('hdr-nav');
      const cs = getComputedStyle(nav);
      const fab = document.getElementById('menu-btn');
      return {
        fabVisible: getComputedStyle(fab).display !== 'none',
        fabRect: fab.getBoundingClientRect().toJSON(),
        navVisibility: cs.visibility,
        expanded: fab.getAttribute('aria-expanded'),
        scrimHidden: document.getElementById('menu-scrim').hidden,
      };
    });
    ok(closed.fabVisible, 'the menu button is on screen');
    ok(closed.fabRect.left < 40 && closed.fabRect.bottom > 844 - 90,
      `and it is in the bottom-left corner (left ${Math.round(closed.fabRect.left)}, bottom ${Math.round(closed.fabRect.bottom)})`);
    ok(closed.navVisibility === 'hidden', 'the menu starts closed, and out of the tab order');
    ok(closed.expanded === 'false', 'aria-expanded says so');
    ok(closed.scrimHidden, 'and nothing is dimmed');

    await p.locator('#menu-btn').click();
    await p.waitForTimeout(450);

    const open = await p.evaluate(() => {
      const nav = document.getElementById('hdr-nav');
      const nr = nav.getBoundingClientRect();
      const fr = document.getElementById('menu-btn').getBoundingClientRect();
      const tabs = [...nav.querySelectorAll('.nav-btn')].map(el => {
        const r = el.getBoundingClientRect();
        return {
          t: el.textContent.trim(),
          onScreen: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth,
          // Nothing may sit under the button that covers it.
          clearOfFab: r.bottom <= fr.top + 1 || r.right <= fr.left + 1 || r.left >= fr.right - 1,
          tall: r.height,
        };
      });
      return {
        visibility: getComputedStyle(nav).visibility,
        expanded: document.getElementById('menu-btn').getAttribute('aria-expanded'),
        scrimHidden: document.getElementById('menu-scrim').hidden,
        rect: nr.toJSON(),
        scrollsInside: nav.scrollHeight <= nav.clientHeight + 1,
        tabs,
      };
    });

    ok(open.visibility === 'visible' && open.expanded === 'true', 'pressing it opens the menu');
    ok(!open.scrimHidden, 'and dims what is behind');
    ok(open.tabs.length === EXPECTED, `all ${EXPECTED} destinations are listed (${open.tabs.length})`);
    const off = open.tabs.filter(x => !x.onScreen).map(x => x.t);
    ok(off.length === 0, `every one is on screen at once (${off.join(', ') || 'none off'})`);
    ok(open.rect.left >= 0 && open.rect.right <= w + 1,
      `the panel stays inside the screen (${Math.round(open.rect.left)}..${Math.round(open.rect.right)} of ${w})`);
    const covered = open.tabs.filter(x => !x.clearOfFab).map(x => x.t);
    ok(covered.length === 0, `none is hidden under the button (${covered.join(', ') || 'none'})`);
    const small = open.tabs.filter(x => x.tall < 40).map(x => x.t);
    ok(small.length === 0, `every target is a comfortable size (${small.join(', ') || 'all >= 40px'})`);
    ok(open.scrollsInside, 'the whole menu fits without scrolling');

    // My Quests is the destination people want most often, so it should
    // be findable without reading the labels.
    const standout = await p.evaluate(() => {
      const rgb = el => getComputedStyle(el).backgroundColor;
      const trips = document.querySelector('#hdr-nav .nav-btn[data-view="trips"]');
      const others = [...document.querySelectorAll('#hdr-nav .nav-btn')]
        .filter(b => b.dataset.view !== 'trips');
      return {
        trips: rgb(trips),
        sharedByOthers: new Set(others.map(rgb)).size,
        othersSample: rgb(others[0]),
        text: getComputedStyle(trips).color,
      };
    });
    ok(standout.trips !== standout.othersSample,
      `My Quests is a different colour from the rest (${standout.trips} vs ${standout.othersSample})`);
    ok(/^rgba?\((2[0-5]\d|1[6-9]\d)[,\s]+(1[0-9]\d|\d\d)[,\s]+\d/.test(standout.trips),
      `and that colour is the amber fill (${standout.trips})`);

    // Choosing a destination goes there and puts the menu away.
    await p.locator('.nav-btn[data-view="store"]').click();
    await p.waitForTimeout(450);
    const after = await p.evaluate(() => ({
      view: [...document.querySelectorAll('main > section[id^="view-"]')].find(s => !s.hidden)?.id,
      visibility: getComputedStyle(document.getElementById('hdr-nav')).visibility,
      expanded: document.getElementById('menu-btn').getAttribute('aria-expanded'),
    }));
    ok(after.view === 'view-store', `it navigates (${after.view})`);
    ok(after.visibility === 'hidden' && after.expanded === 'false', 'and closes itself behind you');

    // Second press closes, as asked for.
    await p.locator('#menu-btn').click();
    await p.waitForTimeout(400);
    await p.locator('#menu-btn').click();
    await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('hdr-nav')).visibility) === 'hidden',
      'pressing the button again closes it');

    // Tapping away closes it too.
    await p.locator('#menu-btn').click();
    await p.waitForTimeout(400);
    await p.locator('#menu-scrim').click({ position: { x: 10, y: 10 } });
    await p.waitForTimeout(400);
    ok(await p.evaluate(() => getComputedStyle(document.getElementById('hdr-nav')).visibility) === 'hidden',
      'and so does tapping away from it');
  }

  // ---------------------------------------------------------------
  console.log('\n-- desktop keeps the header bar --');
  // ---------------------------------------------------------------
  await boot(1280);
  const desk = await p.evaluate(() => {
    const nav = document.getElementById('hdr-nav');
    return {
      inHeader: Boolean(nav.closest('.app-header')),
      visibility: getComputedStyle(nav).visibility,
      fab: getComputedStyle(document.getElementById('menu-btn')).display,
      top: nav.getBoundingClientRect().top,
      tabs: nav.querySelectorAll('.nav-btn').length,
    };
  });
  ok(desk.inHeader, 'the tabs are back inside the header');
  ok(desk.visibility === 'visible', 'and visible without opening anything');
  ok(desk.fab === 'none', 'the menu button is gone');
  ok(desk.top < 80, `the bar is at the top (${Math.round(desk.top)}px)`);
  ok(desk.tabs === EXPECTED, `with all ${EXPECTED} destinations`);

  ok(errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`);

  await b.close();
  console.log(failures ? `\n${failures} failed` : '\nnav: all good');
  process.exit(failures ? 1 : 0);
})();
