// Scoped trips, place names on the map, and the seasonal strip.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] });
  const errs = []; const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/CONNECTION_RESET/.test(m.text())) errs.push('CONSOLE: ' + m.text()); });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 20000 });

  console.log('dataset on the landing page:', await p.evaluate(() => ({
    places: document.getElementById('stat-places')?.textContent,
    interests: document.getElementById('stat-interests')?.textContent,
  })).then(JSON.stringify));

  // place names on the showcase map
  console.log('place names on the map:', await p.evaluate(() => ({
    total: document.querySelectorAll('#sc-map .map-place').length,
    tier1: document.querySelectorAll('#sc-map .map-place.t1').length,
    sample: [...document.querySelectorAll('#sc-map .map-place.t1 text')].slice(0,5).map(x => x.textContent),
  })).then(JSON.stringify));

  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="plan"]').click());
  await p.waitForTimeout(700);

  const season = await p.evaluate(() => ({
    heading: document.querySelector('.season-title')?.textContent.trim(),
    sub: document.querySelector('.season-sub')?.textContent.trim(),
    cards: [...document.querySelectorAll('.season-card .sn-title')].map(x => x.textContent.trim()),
    soon: document.querySelector('.season-soon')?.textContent.trim().slice(0, 90),
  }));
  console.log('\nSEASONAL:', JSON.stringify(season, null, 1));

  const scope = await p.evaluate(() => ({
    label: document.querySelector('.scope-label')?.textContent.trim(),
    kinds: [...document.querySelectorAll('[data-scope-kind]')].map(x => x.textContent.trim()),
    active: document.querySelector('.scope-btn.active')?.textContent.trim(),
  }));
  console.log('\nSCOPE PICKER:', JSON.stringify(scope));

  // pick a city and plan
  await p.evaluate(() => document.querySelector('[data-scope-kind="city"]').click());
  await p.waitForTimeout(300);
  await p.selectOption('#scope-place', 'aberdeen');
  await p.waitForTimeout(300);
  console.log('after choosing Aberdeen:', await p.evaluate(() => ({
    inRange: document.querySelector('.scope-count')?.textContent.trim(),
  })).then(JSON.stringify));

  await p.fill('#plan-input', '2 days of castles');
  await p.evaluate(() => document.getElementById('plan-go').click());
  await p.waitForTimeout(3400);
  console.log('\nSCOPED TRIP:', await p.evaluate(() => ({
    title: document.querySelector('#plan-result .trip-title')?.textContent.trim(),
    pills: [...document.querySelectorAll('#plan-result .pill')].map(x => x.textContent.trim()),
    stops: [...document.querySelectorAll('#plan-result .sl-name')].map(x => x.textContent.trim()),
  })).then(x => JSON.stringify(x, null, 1)));

  // Polish
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="pl"]').click());
  await p.waitForTimeout(700);
  console.log('\nPOLISH:', await p.evaluate(() => ({
    season: document.querySelector('.season-title')?.textContent.trim(),
    firstCard: document.querySelector('.season-card .sn-title')?.textContent.trim(),
    scope: document.querySelector('.scope-label')?.textContent.trim(),
    kinds: [...document.querySelectorAll('[data-scope-kind]')].map(x => x.textContent.trim()),
  })).then(JSON.stringify));
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="en"]').click());
  await p.waitForTimeout(500);

  await p.screenshot({ path: '/tmp/scope-plan.png', fullPage: false });
  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
