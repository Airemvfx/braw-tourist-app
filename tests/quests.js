// ============================================================
// The quest list: opening one, and deleting one on purpose.
//
// Deletion is the only irreversible thing in the app, so what is
// checked here is mostly that it is *hard enough*: the wrong code will
// not do it, an empty box will not do it, and the dialog says what is
// lost before it happens rather than after.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

const tripCount = p => p.evaluate(() => {
  const u = JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')];
  return u.trips.length;
});

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));

  await p.goto('http://localhost:8099/');
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
  await p.locator('#demo-btn').click();
  await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(600);

  // ---------------------------------------------------------------
  console.log('\n-- the list --');
  // ---------------------------------------------------------------
  const list = await p.evaluate(() => {
    const card = document.querySelector('.trip-card');
    const bar = card.querySelector('.tc-progress');
    return {
      cards: document.querySelectorAll('.trip-card').length,
      tag: card.tagName,
      hasOpen: Boolean(card.querySelector('[data-open]')),
      hasDelete: Boolean(card.querySelector('[data-del]')),
      nestedButtons: card.matches('button') && card.querySelectorAll('button').length > 0,
      barHeight: bar.getBoundingClientRect().height,
      segments: getComputedStyle(bar).getPropertyValue('--stops').trim(),
      cta: document.getElementById('trips-cta')?.textContent.trim(),
      ctaHasIcon: Boolean(document.querySelector('#trips-cta svg')),
    };
  });
  ok(list.cards >= 1, `there is a quest to work with (${list.cards})`);
  ok(list.tag === 'ARTICLE' && !list.nestedButtons,
    'the card is not itself a button, so it can hold real ones');
  ok(list.hasOpen && list.hasDelete, 'it offers Open and Delete');
  ok(list.barHeight >= 10, `the progress bar has real height (${Math.round(list.barHeight)}px)`);
  ok(Number(list.segments) > 1, `and one segment per stop (${list.segments})`);
  ok(/journey|wyprawę/i.test(list.cta || ''), `the add button says what it does ("${list.cta}")`);
  ok(list.ctaHasIcon, 'and carries a plus');

  // Clicking the body of the card opens it, not just the button.
  await p.locator('.trip-card').first().click({ position: { x: 60, y: 20 } });
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !document.getElementById('view-trip').hidden),
    'clicking the card body opens the quest');
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(500);

  await p.locator('[data-open]').first().click();
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !document.getElementById('view-trip').hidden),
    'so does the Open button');
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(500);

  // ---------------------------------------------------------------
  console.log('\n-- deleting takes some doing --');
  // ---------------------------------------------------------------
  const before = await tripCount(p);

  await p.locator('[data-del]').first().click();
  await p.waitForTimeout(400);

  const dialog = await p.evaluate(() => {
    const card = document.querySelector('.del-card');
    if (!card) return null;
    return {
      code: card.querySelector('.del-code')?.textContent.trim(),
      losses: [...card.querySelectorAll('.del-losses li')].map(li => li.textContent.trim()),
      confirmDisabled: card.querySelector('#del-go')?.disabled,
      inputEmpty: card.querySelector('#del-input')?.value === '',
      focused: document.activeElement?.id,
    };
  });
  ok(dialog !== null, 'the delete button opens a confirmation');
  ok(/^[BCDFGHJKMNPRSTVWXZ]{4}$/.test(dialog.code || ''),
    `with a four-letter code, no vowels and no lookalikes (${dialog.code})`);
  ok(dialog.confirmDisabled === true, 'and the confirm refused until it is typed');
  ok(dialog.focused === 'del-input', 'the cursor is already in the box');
  ok(dialog.losses.some(l => /XP/i.test(l) && /offer|czeka/i.test(l)),
    `it says what XP is forfeited (${dialog.losses[0]})`);
  ok(dialog.losses.some(l => /already earned|Zdobyte/i.test(l)),
    'and that earned XP is kept');

  // A wrong code does nothing.
  await p.fill('#del-input', 'ZZZZ');
  await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.getElementById('del-go').disabled),
    'a wrong code leaves it refused');
  await p.locator('#del-go').click({ force: true });
  await p.waitForTimeout(400);
  ok(await tripCount(p) === before, 'and nothing is deleted by pressing it anyway');

  // The right one, lower-cased, still works — nobody should have to
  // find the shift key to delete something.
  await p.fill('#del-input', dialog.code.toLowerCase());
  await p.waitForTimeout(250);
  const ready = await p.evaluate(() => ({
    disabled: document.getElementById('del-go').disabled,
    value: document.getElementById('del-input').value,
  }));
  ok(ready.value === dialog.code, 'typing it in lower case is corrected as you go');
  ok(!ready.disabled, 'and the confirm opens up');

  await p.locator('#del-go').click();
  await p.waitForTimeout(700);

  const after = await p.evaluate(async () => {
    const u = JSON.parse(localStorage.getItem('braw_users_v1'))[localStorage.getItem('braw_session_v1')];
    return {
      trips: u.trips.length,
      xp: u.xp,
      cards: document.querySelectorAll('.trip-card').length,
      toast: document.querySelector('.toast')?.textContent.trim() || '',
      empty: Boolean(document.querySelector('.empty-state')),
    };
  });
  ok(after.trips === before - 1, `the quest is gone (${before} → ${after.trips})`);
  ok(after.cards === after.trips, 'and the list agrees');
  ok(after.xp > 0, `XP already earned was not clawed back (${after.xp})`);
  ok(/Deleted|Usunięto/i.test(after.toast), `it says so (${after.toast})`);
  ok(after.trips === 0 ? after.empty : true, 'an emptied list falls back to its empty state');

  // ---------------------------------------------------------------
  console.log('\n-- cancelling --');
  // ---------------------------------------------------------------
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="plan"]').click());
  await p.waitForTimeout(300);
  await p.evaluate(() => {
    // Put a quest back so there is something to cancel deleting.
    document.querySelector('.nav-btn[data-view="plan"]').click();
  });
  await p.fill('#plan-input', 'two days of castles near Stirling');
  await p.locator('#plan-go').click();
  await p.waitForTimeout(3000);
  await p.locator('#save-trip-btn').click();
  await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(600);

  const n = await tripCount(p);
  await p.locator('[data-del]').first().click();
  await p.waitForTimeout(300);
  await p.locator('#del-no').click();
  await p.waitForTimeout(300);
  ok(await tripCount(p) === n, 'backing out of the dialog keeps the quest');
  ok(await p.evaluate(() => !document.querySelector('.del-card')), 'and closes it');

  await p.locator('[data-del]').first().click();
  await p.waitForTimeout(300);
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('.del-card')), 'Escape closes it too');
  ok(await tripCount(p) === n, 'still there afterwards');

  ok(errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`);

  await b.close();
  console.log(failures ? `\n${failures} failed` : '\nquests: all good');
  process.exit(failures ? 1 : 0);
})();
