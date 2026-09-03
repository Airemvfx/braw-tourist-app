// The Google map, against a fake SDK.
//
// Nothing here reaches Google. The fixture is injected before the app
// boots and js/gmaps.js hands back whatever window.google already is,
// so every Google path runs with no key, no network and no bill. The
// assertions are about the CALL BUDGET rather than the wire, because
// the budget is the thing that costs money: one Map for the session
// however many maps somebody opens, and none of it on a Scottish trip
// unless the switch is on.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const FAKE = fs.readFileSync(path.join(__dirname, 'fixtures/fake-google.js'), 'utf8');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };

async function boot(page, { key = '', consent = false } = {}) {
  await page.addInitScript(FAKE);
  await page.addInitScript(([k, c]) => {
    if (k) window.BRAW_GOOGLE = { key: k, mapId: 'fake-map-id' };
    try {
      if (c) localStorage.setItem('braw_google_consent_v1', 'yes');
      else localStorage.removeItem('braw_google_consent_v1');
    } catch { /* ignore */ }
  }, [key, consent]);
  await page.goto('http://localhost:8099/');
  await page.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
  await page.locator('#demo-btn').click();
  await page.waitForTimeout(4200);
  await page.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
}

const openTrip = async page => {
  await page.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await page.waitForTimeout(500);
  await page.locator('[data-open]').first().click();
  await page.waitForTimeout(1800);
};

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // A guard for every context: any request to Google is a failed run.
  const billed = [];
  const watch = page => page.on('request', r => {
    const u = r.url();
    if (/googleapis\.com|maps\.gstatic\.com/.test(u) && !/fonts\./.test(u)) billed.push(u);
  });

  // ---------------------------------------------------------------
  console.log('-- with no key, nothing changes --');
  // ---------------------------------------------------------------
  let ctx = await browser.newContext();
  let page = await ctx.newPage();
  const errsA = [];
  page.on('pageerror', e => errsA.push(e.message));
  watch(page);
  await boot(page, { key: '', consent: false });
  await openTrip(page);

  const noKey = await page.evaluate(() => ({
    mode: document.querySelector('[data-map-frame]')?.dataset.mode,
    svg: Boolean(document.querySelector('.map-frame > svg')),
    maps: window.__gcalls.maps,
  }));
  ok(noKey.mode === 'svg', `the hand-drawn map is still what you get (${noKey.mode})`);
  ok(noKey.svg, 'and it is really an SVG on screen');
  ok(noKey.maps === 0, `no Google map was made (${noKey.maps})`);
  ok(errsA.length === 0, `no page errors (${errsA[0] || 'none'})`);
  await ctx.close();

  // ---------------------------------------------------------------
  console.log('\n-- a key without consent is still not permission --');
  // ---------------------------------------------------------------
  ctx = await browser.newContext();
  page = await ctx.newPage();
  watch(page);
  await boot(page, { key: 'fake-key', consent: false });
  await openTrip(page);
  const unconsented = await page.evaluate(() => ({
    mode: document.querySelector('[data-map-frame]')?.dataset.mode,
    maps: window.__gcalls.maps,
  }));
  ok(unconsented.mode === 'svg', `still the SVG (${unconsented.mode})`);
  ok(unconsented.maps === 0, 'and still no Google map — both halves are required');
  await ctx.close();

  // ---------------------------------------------------------------
  console.log('\n-- key and consent: Google draws it --');
  // ---------------------------------------------------------------
  ctx = await browser.newContext();
  page = await ctx.newPage();
  const errsB = [];
  page.on('pageerror', e => errsB.push(e.message));
  watch(page);
  await boot(page, { key: 'fake-key', consent: true });
  await openTrip(page);

  const on = await page.evaluate(() => ({
    mode: document.querySelector('[data-map-frame]')?.dataset.mode,
    mounted: Boolean(document.querySelector('[data-fake-map]')),
    slotShown: document.querySelector('.map-slot')?.hidden === false,
    fallbackHidden: document.querySelector('.map-fallback')?.hidden === true,
    calls: { ...window.__gcalls },
  }));
  ok(on.mode === 'google', `the frame reports Google (${on.mode})`);
  ok(on.mounted, 'a map was mounted into the slot');
  ok(on.slotShown && on.fallbackHidden, 'the slot is shown and the itinerary put away');
  ok(on.calls.maps === 1, `exactly one Map was created (${on.calls.maps})`);
  ok(on.calls.advanced > 1, `our own pins were used (${on.calls.advanced})`);
  ok(on.calls.polylines === 1, `and one route line (${on.calls.polylines})`);
  ok(on.calls.fitBounds === 1, 'the view was fitted to the journey');

  // The budget assertion that matters: visiting more map views must not
  // make more maps.
  await page.evaluate(() => document.querySelector('.nav-btn[data-view="plan"]').click());
  await page.waitForTimeout(400);
  await openTrip(page);
  const again = await page.evaluate(() => window.__gcalls.maps);
  ok(again === 1, `revisiting a map view still made only one Map (${again})`);
  ok(errsB.length === 0, `no page errors (${errsB[0] || 'none'})`);
  await ctx.close();

  // ---------------------------------------------------------------
  console.log('\n-- when Google cannot be reached --');
  // ---------------------------------------------------------------
  ctx = await browser.newContext();
  page = await ctx.newPage();
  // No fixture this time, and the script request is blocked: the real
  // failure a user on a bad connection sees.
  await page.route('**/maps/api/js*', r => r.abort());
  await page.addInitScript(([k]) => {
    window.BRAW_GOOGLE = { key: k };
    try { localStorage.setItem('braw_google_consent_v1', 'yes'); } catch { /* ignore */ }
  }, ['fake-key']);
  await page.goto('http://localhost:8099/');
  await page.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
  await page.locator('#demo-btn').click();
  await page.waitForTimeout(4200);
  await page.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await openTrip(page);
  await page.waitForTimeout(1200);

  const down = await page.evaluate(() => ({
    mode: document.querySelector('[data-map-frame]')?.dataset.mode,
    stops: document.querySelectorAll('.mf-stop').length,
    note: document.querySelector('.mf-note')?.textContent || '',
    visible: document.querySelector('.map-fallback')?.hidden !== true,
  }));
  ok(down.mode === 'list', `it falls back to the itinerary (${down.mode})`);
  ok(down.visible && down.stops > 1, `which lists the stops (${down.stops})`);
  ok(/connection/i.test(down.note), `and says why, once (${down.note.slice(0, 40)})`);
  await ctx.close();

  console.log('\n-- the bill --');
  ok(billed.length === 0, `nothing reached Google (${billed.length ? billed[0] : 'none'})`);

  await browser.close();
  console.log(fails ? `\ngmap: ${fails} FAILED` : '\ngmap: all good');
  process.exit(fails ? 1 : 0);
})();
