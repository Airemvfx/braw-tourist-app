// ============================================================
// The Store: catalogue, the calendar builder, and the honesty of both.
//
// The thing being protected here is that the shop never overstates
// itself — it does not claim to have sold anything while checkout is
// unconnected, and it does not let someone order a calendar out of
// photographs that will print badly without saying so first.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = 'http://localhost:8099/';
let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

const MAKE = `(w, h) => new Promise(resolve => {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  for (let i = 0; i < 200; i++) {
    x.fillStyle = 'hsl(' + (i * 11 % 360) + ',55%,45%)';
    x.fillRect((i * 41) % w, (i * 29) % h, w / 8, h / 8);
  }
  c.toBlob(b => resolve(new File([b], 's.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.85);
})`;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(BASE);
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise(r => { const d = indexedDB.deleteDatabase('braw_photos_v1'); d.onsuccess = d.onerror = r; });
  });
  await page.reload();
  await page.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
  await page.locator('#demo-btn').click();
  await page.waitForTimeout(3500);
  await page.evaluate(() => document.querySelector('.levelup-overlay')?.remove());

  // ---------------------------------------------------------------
  console.log('\n-- the catalogue --');
  // ---------------------------------------------------------------
  await page.locator('.nav-btn[data-view="store"]').click();
  await page.waitForTimeout(400);

  const cat = await page.evaluate(() => ({
    visible: !document.getElementById('view-store').hidden,
    items: [...document.querySelectorAll('.store-item h3')].map(h => h.textContent.trim()),
    prices: [...document.querySelectorAll('.si-price')].map(p => p.textContent.trim()),
    notice: document.querySelector('.store-notice')?.textContent.trim() || '',
    buttons: document.querySelectorAll('[data-build]').length,
  }));
  ok(cat.visible, 'the Store view opens');
  ok(cat.items.length === 4, `four products are listed (${cat.items.length})`);
  ok(cat.prices.every(p => /\d/.test(p)), `every product shows a price (${cat.prices.join(', ')})`);
  ok(/not taking payments|nie przyjmuje/i.test(cat.notice),
    'with no shop connected it says so, rather than implying it can sell');
  ok(cat.buttons === 4, 'each product can be built');

  // ---------------------------------------------------------------
  console.log('\n-- a calendar with no photographs --');
  // ---------------------------------------------------------------
  await page.locator('[data-build="calendar-a4"]').click();
  await page.waitForTimeout(400);

  const empty = await page.evaluate(() => ({
    slots: document.querySelectorAll('.cal-slot').length,
    emptySlots: document.querySelectorAll('.cal-slot.empty').length,
    orderDisabled: document.getElementById('store-order')?.disabled,
    status: document.querySelector('.bf-status')?.textContent.trim(),
    months: [...document.querySelectorAll('.cs-month')].map(m => m.textContent.trim()),
  }));
  ok(empty.slots === 12, `a calendar has twelve slots (${empty.slots})`);
  ok(empty.emptySlots === 12, 'all empty to begin with');
  ok(empty.orderDisabled === true, 'and the order button is refused until they are filled');
  ok(new Set(empty.months).size === 12, 'twelve different months are named');

  // ---------------------------------------------------------------
  console.log('\n-- filling it, including one photograph too small --');
  // ---------------------------------------------------------------
  const tripId = await page.evaluate(async ({ makeSrc }) => {
    const photos = await import('/js/photos.js');
    const make = eval(makeSrc);
    const user = JSON.parse(localStorage.getItem('braw_users_v1'))['weeexplorer'];
    const trip = user.trips[0];
    const stops = trip.days.flatMap(d => d.stops);
    // Eleven good ones and one that cannot print at A4.
    for (let i = 0; i < 11; i++) {
      await photos.addPhoto('weeexplorer', { tripId: trip.id, poiId: stops[i % stops.length] },
        await make(2400, 1800));
    }
    await photos.addPhoto('weeexplorer', { tripId: trip.id, poiId: stops[0] }, await make(500, 375));
    return trip.id;
  }, { makeSrc: MAKE });

  // Re-enter the builder so it picks the photographs up.
  await page.locator('#store-back').click();
  await page.waitForTimeout(200);
  await page.locator('[data-build="calendar-a4"]').click();
  await page.waitForTimeout(600);

  const filled = await page.evaluate(() => ({
    empty: document.querySelectorAll('.cal-slot.empty').length,
    poor: document.querySelectorAll('.cal-slot.grade-poor').length,
    warn: document.querySelector('.bf-warn')?.textContent.trim() || '',
    status: document.querySelector('.bf-status')?.textContent.trim() || '',
    orderDisabled: document.getElementById('store-order')?.disabled,
    fine: document.querySelector('.bf-fine')?.textContent.trim() || '',
  }));
  ok(filled.empty === 0, 'twelve photographs fill twelve months');
  ok(filled.poor === 1, `the one that would print badly is marked (${filled.poor})`);
  ok(/print soft|nieostro/i.test(filled.warn), `and it is said in words: "${filled.warn}"`);
  ok(filled.orderDisabled === false, 'a complete calendar can be ordered');
  ok(/account|konto/i.test(filled.fine),
    'and it explains an account is needed, since nothing can be printed without one');

  // ---------------------------------------------------------------
  console.log('\n-- ordering without an account does not pretend --');
  // ---------------------------------------------------------------
  await page.locator('#store-order').click();
  await page.waitForTimeout(500);
  const afterOrder = await page.evaluate(() => ({
    toast: document.querySelector('.toast')?.textContent.trim() || '',
    stillBuilding: Boolean(document.getElementById('store-order')),
  }));
  ok(/account|konto/i.test(afterOrder.toast),
    `it asks for an account instead of claiming success ("${afterOrder.toast}")`);
  ok(afterOrder.stillBuilding, 'and leaves the half-built calendar alone');

  // ---------------------------------------------------------------
  console.log('\n-- swapping a photograph --');
  // ---------------------------------------------------------------
  await page.locator('.cal-slot').first().click();
  await page.waitForTimeout(400);
  const picker = await page.evaluate(() => ({
    open: !document.getElementById('store-picker')?.hidden,
    choices: document.querySelectorAll('[data-pick]').length,
    flagged: document.querySelectorAll('.pick.grade-poor').length,
  }));
  ok(picker.open, 'tapping a month opens the picker');
  ok(picker.choices === 12, `it offers every photograph from the journey (${picker.choices})`);
  ok(picker.flagged === 1, 'and marks the one that is too small there too');

  await page.locator('[data-pick]').nth(3).click();
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.getElementById('store-picker')?.hidden !== false),
    'choosing one closes the picker');

  // ---------------------------------------------------------------
  console.log('\n-- in Polish --');
  // ---------------------------------------------------------------
  // Clicked through the DOM rather than by locator: the first match is
  // the auth screen's switch, which is hidden once you are signed in.
  await page.evaluate(() => document.querySelector('.lang-btn[data-lang="pl"]').click());
  await page.waitForTimeout(500);
  // Switching language keeps the half-built calendar open, which is the
  // right behaviour — it should not throw away the work — so check the
  // builder is translated, then go back for the catalogue.
  const plBuilder = await page.evaluate(() => ({
    back: document.getElementById('store-back')?.textContent.trim() || '',
    status: document.querySelector('.bf-status')?.textContent.trim() || '',
    months: [...document.querySelectorAll('.cs-month')].map(m => m.textContent.trim()).slice(0, 3),
  }));
  ok(/Wróć/.test(plBuilder.back), `the builder is translated ("${plBuilder.back}")`);
  ok(/wybran|Zostało/i.test(plBuilder.status), `and its status line ("${plBuilder.status}")`);
  ok(plBuilder.months.every(m => !/^(January|February|March|April|May|June|July|August|September|October|November|December)$/.test(m)),
    `months are named in Polish (${plBuilder.months.join(', ')})`);

  await page.locator('#store-back').click();
  await page.waitForTimeout(400);

  const pl = await page.evaluate(() => ({
    tab: document.querySelector('.nav-btn[data-view="store"]')?.textContent.trim(),
    title: document.querySelector('#view-store .view-title')?.textContent.trim(),
    items: [...document.querySelectorAll('.store-item h3')].map(h => h.textContent.trim()),
    notice: document.querySelector('.store-notice')?.textContent.trim() || '',
    untranslated: [...document.querySelectorAll('#view-store')].map(n => n.textContent)
      .join(' ').match(/\b(Make one|Store|Uses \d+ of your)\b/g) || [],
  }));
  ok(pl.tab === 'Sklep', `the tab is translated ("${pl.tab}")`);
  ok(pl.title === 'Sklep', 'so is the heading');
  ok(pl.items.some(i => /Kalendarz/.test(i)), `and the products (${pl.items[0]})`);
  ok(/nie przyjmuje/i.test(pl.notice), 'and the warning that checkout is not live');
  ok(pl.untranslated.length === 0,
    `nothing English left on the Polish screen (${pl.untranslated.join(', ') || 'none'})`);

  ok(errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`);

  await browser.close();
  console.log(failures ? `\n${failures} failed` : '\nshop: all good');
  process.exit(failures ? 1 : 0);
})();
