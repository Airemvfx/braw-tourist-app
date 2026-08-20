const { chromium } = require('/opt/node22/lib/node_modules/playwright');

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const errs = [];
  const p = await (await b.newContext()).newPage();
  p.on('pageerror', e => errs.push('PAGEERR: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await p.setViewportSize({ width: 390, height: 844 });
  await p.goto('http://localhost:8099/');
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });

  await p.locator('#demo-btn').click();
  await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());

  // into the builder
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="build"]').click());
  await p.waitForTimeout(600);

  const initial = await p.evaluate(() => {
    const s = document.getElementById('view-build');
    return {
      visible: !s.hidden,
      candidates: s.querySelectorAll('.map-cand').length,
      markers: s.querySelectorAll('.map-marker').length,
      tiles: [...s.querySelectorAll('.bd-tile')].map(t => t.querySelector('.bdt-val').textContent.trim()),
      tabs: [...s.querySelectorAll('.bd-tab')].map(t => t.textContent.trim()),
      routeEmpty: !!s.querySelector('#bd-pane-route .bd-empty'),
      brief: s.querySelector('#bd-brief').innerHTML.trim().length,
      saveDisabled: s.querySelector('#bd-save').disabled,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log('INITIAL:', JSON.stringify(initial, null, 1));
  await p.screenshot({ path: '/tmp/bd-1-empty.png', fullPage: true });

  // --- filters ---
  await p.evaluate(() => document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(300);
  const allCount = await p.evaluate(() => document.getElementById('bd-count').textContent);
  await p.evaluate(() => document.querySelector('[data-bd-filter="whisky"]').click());
  await p.waitForTimeout(300);
  const whisky = await p.evaluate(() => ({
    count: document.getElementById('bd-count').textContent,
    onMap: document.querySelectorAll('#view-build .map-cand').length,
    listed: document.querySelectorAll('#bd-list .bd-arow').length,
    groups: [...document.querySelectorAll('.bd-ghead')].map(h => h.textContent.trim()),
  }));
  console.log('\nFILTER whisky:', JSON.stringify(whisky));

  await p.evaluate(() => document.querySelector('[data-bd-filter="castles"]').click());
  await p.waitForTimeout(250);
  console.log('FILTER whisky+castles:', await p.evaluate(() => ({
    count: document.getElementById('bd-count').textContent,
    onMap: document.querySelectorAll('#view-build .map-cand').length,
  })).then(JSON.stringify));

  // search on top of the filters
  await p.locator('#bd-q').fill('glen');
  await p.waitForTimeout(350);
  console.log('SEARCH "glen" + filters:', await p.evaluate(() => ({
    count: document.getElementById('bd-count').textContent,
    onMap: document.querySelectorAll('#view-build .map-cand').length,
    focusKept: document.activeElement.id,
  })).then(JSON.stringify));
  await p.screenshot({ path: '/tmp/bd-2-filters.png', fullPage: true });

  // clear back to everything
  await p.locator('#bd-q').fill('');
  await p.evaluate(() => document.querySelector('[data-bd-filter=""]').click());
  await p.waitForTimeout(300);
  console.log('CLEARED:', await p.evaluate(() => document.getElementById('bd-count').textContent), '| was', allCount);

  // --- add stops from the list ---
  for (const id of ['edinburgh-castle', 'glenfiddich', 'old-man-storr', 'glencoe']) {
    await p.evaluate(x => document.querySelector(`[data-bd-add="${x}"]`).click(), id);
    await p.waitForTimeout(220);
  }
  const after = await p.evaluate(() => {
    const s = document.getElementById('view-build');
    return {
      tiles: [...s.querySelectorAll('.bd-tile')].map(t => t.querySelector('.bdt-val').textContent.trim()),
      breakdown: s.querySelector('.bd-breakdown')?.textContent.trim().replace(/\s+/g, ' '),
      markers: s.querySelectorAll('.map-marker').length,
      candidates: s.querySelectorAll('.map-cand').length,
      routeTab: s.querySelector('.bd-tab[data-bd-tab="route"]').textContent.trim(),
      kit: [...s.querySelectorAll('.bd-kit li b')].map(x => x.textContent.trim()),
      advisories: [...s.querySelectorAll('.bd-adv b')].map(x => x.textContent.trim()),
      stamps: [...s.querySelectorAll('.bd-stampcard li p')].map(x => x.textContent.trim()),
      saveDisabled: s.querySelector('#bd-save').disabled,
    };
  });
  console.log('\nAFTER 4 STOPS:', JSON.stringify(after, null, 1));

  // --- route pane: order, legs, reorder ---
  await p.evaluate(() => document.querySelector('.bd-tab[data-bd-tab="route"]').click());
  await p.waitForTimeout(300);
  const routeAuto = await p.evaluate(() => ({
    order: [...document.querySelectorAll('#bd-pane-route .bd-rowname b')].map(x => x.textContent.trim()),
    legs: [...document.querySelectorAll('.bd-leg')].map(x => x.textContent.trim()),
    moveButtons: document.querySelectorAll('[data-bd-move]').length,
  }));
  console.log('\nROUTE (auto):', JSON.stringify(routeAuto, null, 1));
  await p.screenshot({ path: '/tmp/bd-3-route.png', fullPage: true });

  // manual ordering
  await p.evaluate(() => document.querySelector('[data-bd-order="manual"]').click());
  await p.waitForTimeout(300);
  const beforeMove = await p.evaluate(() =>
    [...document.querySelectorAll('#bd-pane-route .bd-rowname b')].map(x => x.textContent.trim()));
  await p.evaluate(() => {
    const rows = [...document.querySelectorAll('#bd-pane-route .bd-row')];
    rows[rows.length - 1].querySelector('[data-bd-move$="|-1"]').click();
  });
  await p.waitForTimeout(300);
  const afterMove = await p.evaluate(() => ({
    order: [...document.querySelectorAll('#bd-pane-route .bd-rowname b')].map(x => x.textContent.trim()),
    dist: document.querySelectorAll('.bdt-val')[1].textContent.trim(),
  }));
  console.log('\nMANUAL move last-up: before', JSON.stringify(beforeMove));
  console.log('                      after', JSON.stringify(afterMove));

  // --- start city changes the route ---
  await p.evaluate(() => document.querySelector('[data-bd-order="auto"]').click());
  await p.waitForTimeout(200);
  const fromEd = await p.evaluate(() => ({
    order: [...document.querySelectorAll('#bd-pane-route .bd-rowname b')].map(x => x.textContent.trim()),
    dist: document.querySelectorAll('.bdt-val')[1].textContent.trim(),
  }));
  await p.selectOption('#bd-start', 'portree');
  await p.waitForTimeout(400);
  const fromPortree = await p.evaluate(() => ({
    order: [...document.querySelectorAll('#bd-pane-route .bd-rowname b')].map(x => x.textContent.trim()),
    dist: document.querySelectorAll('.bdt-val')[1].textContent.trim(),
    startLabel: document.querySelector('#view-build .start-label')?.textContent,
  }));
  console.log('\nSTART Edinburgh:', JSON.stringify(fromEd));
  console.log('START Portree  :', JSON.stringify(fromPortree));
  await p.selectOption('#bd-start', 'edinburgh');
  await p.waitForTimeout(300);

  // --- days stepper ---
  const days0 = await p.evaluate(() => document.querySelector('.bd-stepper b').textContent);
  await p.evaluate(() => document.querySelector('[data-bd-days="1"]').click());
  await p.waitForTimeout(250);
  const days1 = await p.evaluate(() => ({
    days: document.querySelector('.bd-stepper b').textContent,
    breakdown: document.querySelector('.bd-breakdown').textContent.trim().replace(/\s+/g, ' '),
  }));
  console.log('\nDAYS:', days0, '→', JSON.stringify(days1));

  // --- map interaction: tap a candidate, add from the panel ---
  await p.evaluate(() => document.querySelector('#view-build .map-cand')
    .dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await p.waitForTimeout(300);
  const panel = await p.evaluate(() => {
    const el = document.getElementById('bd-panel');
    return {
      open: !el.hidden,
      name: el.querySelector('.poi-name')?.textContent.trim(),
      action: el.querySelector('[data-bd-toggle]')?.textContent.trim(),
      activeOnMap: document.querySelectorAll('#view-build .is-active').length,
    };
  });
  console.log('\nCANDIDATE PANEL:', JSON.stringify(panel));
  await p.evaluate(() => document.querySelector('[data-bd-toggle]').click());
  await p.waitForTimeout(350);
  const afterPanelAdd = await p.evaluate(() => ({
    action: document.querySelector('[data-bd-toggle]')?.textContent.trim(),
    stops: document.querySelector('.bdt-val').textContent.trim(),
    markers: document.querySelectorAll('#view-build .map-marker').length,
  }));
  console.log('AFTER PANEL ADD:', JSON.stringify(afterPanelAdd));
  await p.screenshot({ path: '/tmp/bd-4-panel.png', fullPage: true });

  // --- passport stamp preview: clear, then take a whole small region ---
  await p.evaluate(() => document.getElementById('bd-clear').click());
  await p.waitForTimeout(300);
  await p.evaluate(() => document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(250);
  for (const id of ['culzean-castle', 'goatfell-arran']) {
    await p.evaluate(x => document.querySelector(`[data-bd-add="${x}"]`).click(), id);
    await p.waitForTimeout(250);
  }
  console.log('\nSTAMP PREVIEW:', await p.evaluate(() => ({
    stamps: [...document.querySelectorAll('.bd-stampcard li p')].map(x => x.textContent.trim()),
    legs: [...document.querySelectorAll('.bd-leg')].map(x => x.textContent.trim()),
    time: document.querySelectorAll('.bdt-val')[2].textContent.trim(),
  })).then(JSON.stringify));

  // --- Polish ---
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="pl"]').click());
  await p.waitForTimeout(600);
  const pl = await p.evaluate(() => {
    const s = document.getElementById('view-build');
    return {
      view: document.querySelector('.nav-btn.active')?.textContent.trim(),
      title: s.querySelector('.view-title')?.textContent.trim(),
      tabs: [...s.querySelectorAll('.bd-tab')].map(t => t.textContent.trim()),
      dist: [...s.querySelectorAll('.bdt-val')].map(x => x.textContent.trim()),
      labels: [...s.querySelectorAll('.bdt-label')].map(x => x.textContent.trim()),
      firstStop: s.querySelector('.bd-rowname b')?.textContent.trim(),
      kit: [...s.querySelectorAll('.bd-kit b')].slice(0, 3).map(x => x.textContent.trim()),
      adv: [...s.querySelectorAll('.bd-adv b')].slice(0, 3).map(x => x.textContent.trim()),
      untranslated: s.innerHTML.match(/\b(Recommended kit|Before you set off|Add stops|shortest first)\b/i),
    };
  });
  console.log('\nPOLISH:', JSON.stringify(pl, null, 1));
  await p.screenshot({ path: '/tmp/bd-5-polish.png', fullPage: true });
  await p.evaluate(() => document.querySelector('.lang-btn[data-lang="en"]').click());
  await p.waitForTimeout(500);

  // --- save the journey ---
  const savedInfo = await p.evaluate(() => {
    document.getElementById('bd-save').click();
    return null;
  });
  await p.waitForTimeout(900);
  const saved = await p.evaluate(() => {
    const t = document.getElementById('trip-detail');
    return {
      view: [...document.querySelectorAll('main > section')].find(s => !s.hidden)?.id,
      title: t.querySelector('.trip-title')?.textContent.trim(),
      pills: [...t.querySelectorAll('.pill')].map(x => x.textContent.trim()),
      days: [...t.querySelectorAll('.day-head .day-num')].map(x => x.textContent.trim()),
      stops: t.querySelectorAll('.sl-item').length,
      markers: t.querySelectorAll('.map-marker').length,
      candidates: t.querySelectorAll('.map-cand').length,
    };
  });
  console.log('\nSAVED TRIP:', JSON.stringify(saved, null, 1));
  await p.screenshot({ path: '/tmp/bd-6-saved.png', fullPage: true });

  // builder reset + trip visible in the list
  await p.evaluate(() => document.querySelector('.nav-btn[data-view="trips"]').click());
  await p.waitForTimeout(400);
  console.log('QUEST LIST:', await p.evaluate(() =>
    [...document.querySelectorAll('.tc-title')].map(x => x.textContent.trim())).then(JSON.stringify));

  await p.evaluate(() => document.querySelector('.nav-btn[data-view="build"]').click());
  await p.waitForTimeout(400);
  console.log('BUILDER AFTER SAVE:', await p.evaluate(() => ({
    stops: document.querySelector('.bdt-val').textContent.trim(),
    empty: !!document.querySelector('#bd-pane-route .bd-empty'),
    saveDisabled: document.getElementById('bd-save').disabled,
  })).then(JSON.stringify));

  // --- desktop layout + light theme ---
  await p.setViewportSize({ width: 1280, height: 900 });
  await p.waitForTimeout(400);
  await p.evaluate(() => {
    ['edinburgh-castle', 'stirling-castle', 'glencoe', 'fairy-pools', 'talisker'].forEach(id => {
      document.querySelector('.bd-tab[data-bd-tab="add"]').click();
    });
  });
  await p.evaluate(() => document.querySelector('.bd-tab[data-bd-tab="add"]').click());
  await p.waitForTimeout(300);
  for (const id of ['edinburgh-castle', 'stirling-castle', 'glencoe', 'fairy-pools', 'talisker']) {
    await p.evaluate(x => document.querySelector(`[data-bd-add="${x}"]`)?.click(), id);
    await p.waitForTimeout(150);
  }
  await p.waitForTimeout(400);
  const desktop = await p.evaluate(() => {
    const s = document.getElementById('view-build');
    const map = s.querySelector('.map-stage').getBoundingClientRect();
    const side = s.querySelector('.bd-side').getBoundingClientRect();
    return {
      sideBySide: Math.round(map.right) <= Math.round(side.left) + 2,
      mapTop: Math.round(map.top), sideTop: Math.round(side.top),
      mapH: Math.round(map.height),
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    };
  });
  console.log('\nDESKTOP LAYOUT:', JSON.stringify(desktop));
  await p.screenshot({ path: '/tmp/bd-7-desktop.png', fullPage: true });

  await p.evaluate(() => document.querySelector('.app-foot [data-theme-mode="light"]').click());
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/bd-8-light.png', fullPage: true });
  console.log('LIGHT THEME:', await p.evaluate(() => document.documentElement.dataset.theme));

  console.log('\nERRORS:', errs.length ? errs : 'none');
  await b.close();
})();
