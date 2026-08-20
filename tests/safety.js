// Safety screen: present, complete, bilingual, emergency info first.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'] });
  const errs = []; const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 20000 });
  await p.locator('#demo-btn').click(); await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="safety"]').click());
  await p.waitForTimeout(600);

  const info = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.safety-card')];
    return {
      cards: cards.length,
      first: cards[0]?.querySelector('h3')?.textContent.trim(),
      firstIsUrgent: cards[0]?.classList.contains('is-urgent'),
      mentions999: /\b999\b/.test(document.body.textContent),
      mentions112: /\b112\b/.test(document.body.textContent),
      mountainRescue: /Mountain Rescue/i.test(document.body.textContent),
      hasDisclaimer: !!document.querySelector('.safety-card.is-disclaimer'),
      disclaimerSaysNotNav: /not a navigation system/i.test(document.body.textContent),
      empty: cards.filter(c => !c.querySelector('p')?.textContent.trim()).length,
    };
  });
  console.log('SAFETY (en):', JSON.stringify(info, null, 1));

  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="pl"]').click());
  await p.waitForTimeout(600);
  const pl = await p.evaluate(() => {
    const cards = [...document.querySelectorAll('.safety-card')];
    return {
      cards: cards.length,
      first: cards[0]?.querySelector('h3')?.textContent.trim(),
      untranslated: cards.filter(c => /In an emergency|Leave word|Before you go/.test(c.textContent)).length,
      mentions999: /\b999\b/.test(document.body.textContent),
    };
  });
  console.log('\nSAFETY (pl):', JSON.stringify(pl, null, 1));
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="en"]').click());
  await p.waitForTimeout(400);
  await p.screenshot({ path: '/tmp/safety.png', fullPage: false });
  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
