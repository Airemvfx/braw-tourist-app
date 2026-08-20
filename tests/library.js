// The library: bilingual content, unlock rules, and the hidden entries.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] });
  const errs = []; const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 20000 });

  // ---- the wordmark egg, before even signing in ----
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());

  await p.evaluate(() => document.querySelector('.nav-btn[data-view="library"]').click());
  await p.waitForTimeout(600);
  const first = await p.evaluate(() => ({
    count: document.getElementById('lib-count').textContent,
    filters: [...document.querySelectorAll('[data-lib-filter]')].map(x => x.textContent.trim()),
    open: document.querySelectorAll('.lore-card:not(.is-locked)').length,
    locked: document.querySelectorAll('.lore-card.is-locked').length,
    lockHints: [...document.querySelectorAll('.lore-hint')].slice(0, 3).map(x => x.textContent.trim()),
    legendsLabelled: document.querySelectorAll('.lore-note').length,
  }));
  console.log('LIBRARY:', JSON.stringify(first, null, 1));

  // ---- filters ----
  await p.evaluate(() => document.querySelector('[data-lib-filter="word"]').click());
  await p.waitForTimeout(300);
  console.log('\nfiltered to words:', await p.evaluate(() => ({
    shown: document.querySelectorAll('.lore-card').length,
    titles: [...document.querySelectorAll('.lore-title')].slice(0, 4).map(x => x.textContent.trim()),
  })).then(JSON.stringify));

  // ---- Polish ----
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="pl"]').click());
  await p.waitForTimeout(600);
  console.log('\nin Polish:', await p.evaluate(() => ({
    count: document.getElementById('lib-count').textContent,
    titles: [...document.querySelectorAll('.lore-title')].slice(0, 3).map(x => x.textContent.trim()),
    body: document.querySelector('.lore-body')?.textContent.slice(0, 80),
  })).then(JSON.stringify));
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="en"]').click());
  await p.waitForTimeout(500);

  // ---- an egg: switching to light mode ----
  await p.evaluate(() => document.querySelector('.app-foot [data-theme-mode="light"]').click());
  await p.waitForTimeout(900);
  console.log('\nlight-mode egg:', await p.evaluate(() => ({
    stored: !!JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')].eggs?.darkmode,
    toast: document.querySelector('.toast')?.textContent.trim() || '(none)',
  })).then(JSON.stringify));
  await p.evaluate(() => document.querySelector('.app-foot [data-theme-mode="dark"]').click());
  await p.waitForTimeout(400);

  // ---- lore appears on a location you have visited ----
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(400);
  await p.locator('.trip-card').first().click(); await p.waitForTimeout(900);
  const visited = await p.evaluate(() => {
    const row = document.querySelector('#trip-detail .sl-item.is-visited [data-toggle]');
    if (row) row.click();
    return !!row;
  });
  await p.waitForTimeout(700);
  console.log('\nlore on a visited stop:', await p.evaluate(() => {
    const l = document.querySelector('.pd-lore');
    return l ? { kicker: l.querySelector('.pd-lore-kicker').textContent.trim(),
                 title: l.querySelector('b').textContent.trim() } : '(none on this stop)';
  }).then(JSON.stringify));

  await p.evaluate(() => document.querySelector('.nav-btn[data-view="library"]').click());
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/library.png', fullPage: false });
  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
