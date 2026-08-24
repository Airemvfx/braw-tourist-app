// Live location: consent gate, permission handling, live dot, geofence.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

async function openTrip(ctx) {
  const p = await ctx.newPage();
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 20000 });
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(400);
  await p.locator('.trip-card').first().click(); await p.waitForTimeout(900);
  return p;
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] });
  const errs = [];

  // ---- 1. nothing happens without consent ----
  const granted = await b.newContext({ permissions: ['geolocation'],
    geolocation: { latitude: 57.4125, longitude: -6.1944, accuracy: 20 } });
  let p = await openTrip(granted);
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));

  console.log('default state:', await p.evaluate(() => ({
    toggle: document.getElementById('geo-toggle')?.textContent.trim(),
    pressed: document.getElementById('geo-toggle')?.getAttribute('aria-pressed'),
    dotOnMap: !!document.querySelector('#trip-detail .user-location'),
    consentStored: localStorage.getItem('braw_geo_v1'),
  })).then(JSON.stringify));

  // ---- 2. tapping explains before the browser asks ----
  await p.locator('#geo-toggle').click();
  await p.waitForTimeout(300);
  console.log('\nconsent dialog:', await p.evaluate(() => {
    const c = document.querySelector('.geo-consent-card');
    return c ? { heading: c.querySelector('h3').textContent.trim(),
                 mentionsDevice: /never sent|only|device/i.test(c.textContent),
                 buttons: [...c.querySelectorAll('button')].map(x => x.textContent.trim()) } : null;
  }).then(JSON.stringify));

  // declining leaves it off
  await p.locator('#geo-no').click(); await p.waitForTimeout(300);
  console.log('after declining:', await p.evaluate(() => ({
    dialog: !!document.querySelector('.geo-consent'),
    pressed: document.getElementById('geo-toggle').getAttribute('aria-pressed'),
    consentStored: localStorage.getItem('braw_geo_v1'),
  })).then(JSON.stringify));

  // ---- 3. accepting starts it and the dot appears ----
  await p.locator('#geo-toggle').click(); await p.waitForTimeout(200);
  await p.locator('#geo-yes').click();
  await p.waitForTimeout(2500);
  console.log('\nafter allowing:', await p.evaluate(() => ({
    pressed: document.getElementById('geo-toggle').getAttribute('aria-pressed'),
    label: document.getElementById('geo-toggle').textContent.trim(),
    dotOnMap: !!document.querySelector('#trip-detail .user-location'),
    dotAt: document.querySelector('#trip-detail .user-location')?.getAttribute('transform'),
    nearest: document.querySelector('.geo-meta')?.textContent.replace(/\s+/g, ' ').trim(),
    consentStored: localStorage.getItem('braw_geo_v1'),
  })).then(JSON.stringify));
  await p.locator('#trip-detail .map-stage').screenshot({ path: '/tmp/geo-live.png' });

  // ---- 4. the dot follows a moving device ----
  await granted.setGeolocation({ latitude: 57.5066, longitude: -6.183, accuracy: 15 });
  await p.waitForTimeout(2200);
  console.log('after moving to the Storr:', await p.evaluate(() =>
    document.querySelector('#trip-detail .user-location')?.getAttribute('transform')));

  // ---- 5. arriving at a stop offers the check-in ----
  const stop = await p.evaluate(() => {
    const el = document.querySelector('#geo-sim'); if (el) el.click();
    return true;
  });
  await p.waitForTimeout(1500);
  console.log('\narrival prompt:', await p.evaluate(() => {
    const g = document.getElementById('geo-prompt');
    return { showing: g.classList.contains('show'),
             name: document.getElementById('geo-poi-name').textContent.trim(),
             meta: document.getElementById('geo-meta').textContent.trim() };
  }).then(JSON.stringify));

  const before = await p.evaluate(() => document.querySelectorAll('#trip-detail .map-marker.is-visited').length);
  await p.locator('#geo-confirm').click();
  await p.waitForTimeout(1200);
  const after = await p.evaluate(() => document.querySelectorAll('#trip-detail .map-marker.is-visited').length);
  console.log('checked in via GPS: visited pins', before, '->', after);

  // ---- 6. turning it off releases the watch ----
  await p.evaluate(() => document.getElementById('geo-toggle').click());
  await p.waitForTimeout(600);
  console.log('\nafter switching off:', await p.evaluate(() => ({
    pressed: document.getElementById('geo-toggle').getAttribute('aria-pressed'),
    dotOnMap: !!document.querySelector('#trip-detail .user-location'),
    consentStored: localStorage.getItem('braw_geo_v1'),
  })).then(JSON.stringify));
  await p.close();

  // ---- 7. a refused permission says something useful ----
  const denied = await b.newContext({ permissions: [] });
  p = await openTrip(denied);
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await p.locator('#geo-toggle').click(); await p.waitForTimeout(200);
  await p.locator('#geo-yes').click(); await p.waitForTimeout(2500);
  console.log('\nwith permission refused:', await p.evaluate(() => ({
    problem: document.querySelector('.geo-problem')?.textContent.trim(),
    pressed: document.getElementById('geo-toggle').getAttribute('aria-pressed'),
    consentStored: localStorage.getItem('braw_geo_v1'),
  })).then(JSON.stringify));

  // ================================================================
  // The paths a mocked happy path never reaches.
  //
  // All three of these were live bugs, and none of them could be seen
  // from a test that granted permission and stood in Scotland.
  // ================================================================
  let failures = 0;
  const ok = (cond, what) => {
    console.log(`  ${cond ? '\u2713' : '\u2717'} ${what}`);
    if (!cond) failures++;
  };

  console.log('\n-- refused permission must not hang for ever --');
  //
  // watchPosition calls neither callback when a browser refuses without
  // asking — not even after its own timeout. Measured: still waiting at
  // 35s with a 30s timeout set. The app has its own deadline now.
  //
  // Note the context: no `permissions` key at all. An explicit
  // `permissions: []` makes Chromium deny outright, which always worked
  // — the silence only happens when the browser neither grants nor
  // refuses, which is what a dismissed prompt or a switched-off system
  // location service does on a phone.
  {
    const ctx = await b.newContext({});
    const q = await openTrip(ctx);
    await q.locator('[data-map-gps="trip"]').click(); await q.waitForTimeout(250);
    await q.locator('#geo-yes').click();

    await q.waitForTimeout(3000);
    const early = await q.evaluate(async () => (await import('/js/location.js')).locationState().state);
    ok(early === 'asking', `it is still looking after 3s (${early})`);

    await q.waitForTimeout(18000);
    const late = await q.evaluate(async () => {
      const { locationState } = await import('/js/location.js');
      return {
        state: locationState().state,
        problem: document.querySelector('.geo-problem')?.textContent.trim() || '',
        btn: document.querySelector('[data-map-gps="trip"]')?.className || '',
      };
    });
    ok(late.state === 'failed', `it gives up rather than pulsing for ever (${late.state})`);
    ok(late.problem.length > 20, `and says what to do about it ("${late.problem.slice(0, 60)}...")`);
    ok(/is-problem/.test(late.btn), 'the button shows the trouble');
    ok(!/is-busy/.test(late.btn), 'and stops looking busy');
    await q.close();
  }

  console.log('\n-- somewhere that is not Scotland --');
  //
  // The dot used to be clamped to the map's edge, which from Warsaw put
  // a faint mark in the bottom-right corner: indistinguishable from the
  // feature being broken, which is how it was reported.
  {
    const ctx = await b.newContext({ permissions: ['geolocation'],
      geolocation: { latitude: 52.2297, longitude: 21.0122, accuracy: 25 } });
    const q = await openTrip(ctx);
    await q.locator('[data-map-gps="trip"]').click(); await q.waitForTimeout(250);
    await q.locator('#geo-yes').click(); await q.waitForTimeout(2500);

    const r = await q.evaluate(async () => {
      const { locationState } = await import('/js/location.js');
      return {
        state: locationState().state,
        dot: !!document.querySelector('#trip-detail .user-location'),
        problem: document.querySelector('.geo-problem')?.textContent.trim() || '',
      };
    });
    ok(r.state === 'on', 'the fix still arrives');
    ok(!r.dot, 'but no dot is planted in the corner of the map');
    ok(/\d/.test(r.problem) && r.problem.length > 30,
      `it explains, with the distance ("${r.problem.slice(0, 70)}...")`);
    await q.close();
  }

  console.log('\n-- finding you is marked, not silent --');
  {
    const ctx = await b.newContext({ permissions: ['geolocation'],
      geolocation: { latitude: 56.8198, longitude: -5.1052, accuracy: 18 } });
    const q = await openTrip(ctx);
    const box = () => q.evaluate(() => document.querySelector('#trip-detail svg.scotmap')?.getAttribute('viewBox'));
    const rest = await box();

    await q.locator('[data-map-gps="trip"]').click(); await q.waitForTimeout(250);
    await q.locator('#geo-yes').click();

    const frames = [];
    for (let i = 0; i < 12; i++) { await q.waitForTimeout(200); frames.push(await box()); }
    const moved = frames.filter(v => v && v !== rest);
    ok(moved.length >= 3, `the map pushes in on the position (${moved.length} frames moved)`);

    await q.waitForTimeout(1600);
    ok(await box() === rest, 'and comes all the way back to the whole route');
    ok(await q.evaluate(() => !!document.querySelector('#trip-detail .user-location')),
      'leaving the dot where you are');
    ok(await q.evaluate(() => !!document.querySelector('#trip-detail .ul-lock')),
      'with a ring to have closed on it');
    await q.close();
  }

  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
  if (errs.length) failures++;
  console.log(failures ? `\n${failures} failed` : '\ngeo: all good');
  process.exit(failures ? 1 : 0);
})();
