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

  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
