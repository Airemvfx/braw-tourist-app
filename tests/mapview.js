// ============================================================
// The fullscreen map: zooming, panning, tapping, and the hand-off to
// Google Maps.
//
// The claim worth holding to a test is that zooming actually helps.
// A map scaled uniformly magnifies the gap between two pins along with
// the pins themselves, so a crowded region stays exactly as crowded and
// the tap you could not make at rest you still cannot make at 8x. The
// pins must therefore hold their size while the ground grows.
//
// The Google Maps link is checked as arithmetic rather than as a
// string: the whole point is that it opens on the same place at
// roughly the same scale, and a URL that merely parses proves nothing.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

const parseGoogle = url => {
  const m = /\/maps\/@(-?[\d.]+),(-?[\d.]+),([\d.]+)z/.exec(url || '');
  return m ? { lat: +m[1], lon: +m[2], z: +m[3] } : null;
};

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 860 } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(String(e)));

  await p.goto('http://localhost:8099/');
  await p.evaluate(() => localStorage.clear());
  await p.reload();
  await p.waitForFunction(() => !document.getElementById('auth-screen').hidden, { timeout: 15000 });
  await p.locator('#demo-btn').click();
  await p.waitForTimeout(4200);
  await p.evaluate(() => document.querySelector('.levelup-overlay')?.remove());
  await p.locator('.nav-btn[data-view="trips"]').click();
  await p.waitForTimeout(400);
  await p.locator('.trip-card').first().click();
  await p.waitForTimeout(1200);

  // ---------------------------------------------------------------
  console.log('\n-- the buttons on the map --');
  // ---------------------------------------------------------------
  const tools = await p.evaluate(() => {
    const stage = document.querySelector('#trip-detail .map-stage');
    const full = stage?.querySelector('[data-map-full]');
    const g = stage?.querySelector('[data-map-google]');
    const sr = stage?.getBoundingClientRect();
    const fr = full?.getBoundingClientRect();
    return {
      hasFull: Boolean(full), hasGoogle: Boolean(g),
      href: g?.getAttribute('href'),
      target: g?.getAttribute('target'), rel: g?.getAttribute('rel'),
      insideMap: fr && sr ? fr.top >= sr.top && fr.right <= sr.right + 1 : false,
      size: fr ? Math.min(fr.width, fr.height) : 0,
    };
  });
  ok(tools.hasFull && tools.hasGoogle, 'both buttons are on the map');
  ok(tools.insideMap, 'and sit on it rather than below the fold');
  ok(tools.size >= 36, `they are big enough to hit (${Math.round(tools.size)}px)`);
  ok(tools.target === '_blank' && /noopener/.test(tools.rel || ''),
    'the Google link opens in a new tab, safely');

  const framed = parseGoogle(tools.href);
  ok(framed !== null, `the Google link is a position (${tools.href})`);
  // The demo journey runs Edinburgh -> Skye; its middle is the Highlands,
  // not the middle of the country, and certainly not the North Sea.
  ok(framed && framed.lat > 55.5 && framed.lat < 58.5 && framed.lon > -6.5 && framed.lon < -2,
    `framed on the journey, not the whole country (${framed?.lat}, ${framed?.lon})`);
  ok(framed && framed.z >= 5 && framed.z <= 11, `at a sensible zoom (${framed?.z})`);

  // ---------------------------------------------------------------
  console.log('\n-- opening it full screen --');
  // ---------------------------------------------------------------
  await p.locator('[data-map-full="trip"]').click();
  await p.waitForTimeout(600);

  const opened = await p.evaluate(() => {
    const host = document.querySelector('.mapfs');
    const svg = host?.querySelector('svg.scotmap');
    const stage = host?.querySelector('.mv-stage').getBoundingClientRect();
    const vb = (svg?.getAttribute('viewBox') || '').split(' ').map(Number);
    const marks = [...(svg?.querySelectorAll('.map-marker') || [])];
    return {
      open: Boolean(host),
      fills: host ? host.getBoundingClientRect().width >= innerWidth - 1 : false,
      viewBox: svg?.getAttribute('viewBox'),
      markers: marks.length,
      // Every stop on screen means it framed the journey, not the country.
      offScreen: marks.filter(m => {
        const r = m.getBoundingClientRect();
        return r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight;
      }).length,
      // A viewBox shaped like the stage is a screen with no wasted bars.
      vbAspect: vb[2] / vb[3],
      stageAspect: stage.width / stage.height,
      // Narrower than the whole country: it really is framed on the trip.
      spanFraction: vb[2] / 560,
      bodyLocked: getComputedStyle(document.body).overflow,
      zoomLabel: host?.querySelector('.mv-zoom')?.textContent,
      outDisabled: host?.querySelector('.mv-out')?.disabled,
    };
  });
  ok(opened.open && opened.fills, 'the map fills the screen');
  ok(opened.markers > 0, `with the journey's pins on it (${opened.markers})`);
  ok(opened.offScreen === 0, `and every stop in view (${opened.offScreen} off screen)`);
  ok(Math.abs(opened.vbAspect - opened.stageAspect) < 0.02,
    `the view is shaped to the screen, so nothing is wasted on bars (${opened.vbAspect.toFixed(3)} vs ${opened.stageAspect.toFixed(3)})`);
  ok(opened.bodyLocked === 'hidden', 'the page behind does not scroll');
  ok(!opened.outDisabled, 'it opens with room to zoom back out');

  // Reset means the whole country, and that is where 100% is.
  await p.locator('.mv-reset').click();
  await p.waitForTimeout(350);
  const whole = await p.evaluate(() => {
    const host = document.querySelector('.mapfs');
    const vb = host.querySelector('svg.scotmap').getAttribute('viewBox').split(' ').map(Number);
    return {
      label: host.querySelector('.mv-zoom').textContent,
      outDisabled: host.querySelector('.mv-out').disabled,
      coversMap: vb[0] <= 0.5 && vb[1] <= 0.5 && vb[0] + vb[2] >= 559.5 && vb[1] + vb[3] >= 729.5,
    };
  });
  ok(whole.coversMap, 'reset shows the whole of Scotland');
  ok(whole.label === '100%', `and that is what 100% means (${whole.label})`);
  ok(whole.outDisabled === true, 'with no zooming out past it');

  // ---------------------------------------------------------------
  console.log('\n-- zooming separates crowded pins --');
  // ---------------------------------------------------------------
  // The two pins that sit closest together, whichever journey the demo
  // account happened to generate. Naming particular locations would tie
  // this to a planner that deliberately varies its output.
  const pair = await p.evaluate(() => {
    const svg = document.querySelector('.mapfs svg.scotmap');
    const marks = [...svg.querySelectorAll('.map-marker')];
    let best = null;
    for (let i = 0; i < marks.length; i++) {
      for (let j = i + 1; j < marks.length; j++) {
        const d = Math.hypot(
          marks[i].dataset.mx - marks[j].dataset.mx,
          marks[i].dataset.my - marks[j].dataset.my);
        if (!best || d < best.d) best = { d, a: marks[i].dataset.poi, b: marks[j].dataset.poi };
      }
    }
    return best;
  });
  ok(pair !== null, `found the closest pair of pins: ${pair?.a} and ${pair?.b}`);

  const measure = () => p.evaluate(({ a, b }) => {
    const svg = document.querySelector('.mapfs svg.scotmap');
    const ra = svg.querySelector(`[data-poi="${a}"]`).getBoundingClientRect();
    const rb = svg.querySelector(`[data-poi="${b}"]`).getBoundingClientRect();
    return {
      gap: Math.hypot(ra.x - rb.x, ra.y - rb.y),
      size: ra.width,
      zoom: svg.dataset.zoom,
      label: document.querySelector('.mv-zoom')?.textContent,
      transform: svg.querySelector(`[data-poi="${a}"]`).getAttribute('transform'),
    };
  }, pair);

  const before = await measure();
  for (let i = 0; i < 4; i++) { await p.locator('.mv-in').click(); await p.waitForTimeout(150); }
  await p.waitForTimeout(300);
  const after = await measure();

  ok(Math.abs(after.size - before.size) < 2,
    `a pin is the same size at ${after.label} as at 100% (${before.size.toFixed(1)} -> ${after.size.toFixed(1)}px)`);
  ok(after.gap > before.gap * 5,
    `but two overlapping pins have pulled apart (${before.gap.toFixed(1)} -> ${after.gap.toFixed(1)}px)`);
  ok(/scale\(0\.\d+\)/.test(after.transform), `by counter-scaling (${after.transform})`);
  ok(parseInt(after.label, 10) > 500, `zoom really moved (${after.label})`);

  // ---------------------------------------------------------------
  console.log('\n-- the Google link follows the view --');
  // ---------------------------------------------------------------
  const zoomed = parseGoogle(await p.locator('.mv-gmaps').getAttribute('href'));
  ok(zoomed !== null, 'still a position');
  ok(zoomed && zoomed.z > (framed?.z || 0) + 1,
    `and a closer one now the map is zoomed in (${framed?.z} -> ${zoomed?.z})`);
  ok(zoomed && zoomed.lat > 54.5 && zoomed.lat < 59 && zoomed.lon > -7.5 && zoomed.lon < -1,
    'somewhere in Scotland');

  // ---------------------------------------------------------------
  console.log('\n-- panning --')
  // ---------------------------------------------------------------
  const panned = await p.evaluate(async () => {
    const svg = document.querySelector('.mapfs svg.scotmap');
    const stage = document.querySelector('.mv-stage');
    const startVb = svg.getAttribute('viewBox');
    const r = stage.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const send = (type, x, y, extra = {}) => stage.dispatchEvent(
      new PointerEvent(type, { clientX: x, clientY: y, bubbles: true, pointerId: 1, isPrimary: true, ...extra }));
    send('pointerdown', cx, cy);
    for (let i = 1; i <= 5; i++) send('pointermove', cx - i * 20, cy - i * 12);
    send('pointerup', cx - 100, cy - 60);
    await new Promise(r2 => requestAnimationFrame(r2));
    return { startVb, endVb: svg.getAttribute('viewBox') };
  });
  ok(panned.startVb !== panned.endVb, `dragging moves the map (${panned.startVb} -> ${panned.endVb})`);

  // ---------------------------------------------------------------
  console.log('\n-- tapping a pin --');
  // ---------------------------------------------------------------
  await p.locator('.mv-reset').click();
  await p.waitForTimeout(300);

  // The pin furthest from any other, so the tap cannot be swallowed by a
  // neighbour's halo before the zoom has pulled them apart.
  const lonely = await p.evaluate(() => {
    const svg = document.querySelector('.mapfs svg.scotmap');
    const marks = [...svg.querySelectorAll('.map-marker')];
    let best = null;
    for (const m of marks) {
      let near = Infinity;
      for (const o of marks) {
        if (o === m) continue;
        near = Math.min(near, Math.hypot(m.dataset.mx - o.dataset.mx, m.dataset.my - o.dataset.my));
      }
      if (!best || near > best.near) best = { near, id: m.dataset.poi };
    }
    return best;
  });

  const target = p.locator(`.mapfs [data-poi="${lonely.id}"]`);
  for (let i = 0; i < 2; i++) { await target.dblclick(); await p.waitForTimeout(220); }
  await target.click();
  await p.waitForTimeout(400);

  // What the dataset says about that place, to check the card against.
  const expected = await p.evaluate(async id => {
    const { POI_BY_ID } = await import('/js/data.js');
    const { poiName } = await import('/js/i18n.js');
    const poi = POI_BY_ID[id];
    return { name: poiName(poi), lat: poi.lat, lon: poi.lon };
  }, lonely.id);

  const info = await p.evaluate(() => {
    const card = document.querySelector('.mv-info');
    return {
      shown: card && !card.hidden,
      title: card?.querySelector('h3')?.textContent.trim(),
      hasBlurb: (card?.querySelector('p')?.textContent || '').length > 30,
      meta: card?.querySelector('.mv-info-meta')?.textContent.trim(),
      link: card?.querySelector('a')?.getAttribute('href'),
      highlighted: document.querySelectorAll('.mapfs .map-marker.is-active').length,
    };
  });
  ok(info.shown, 'tapping a pin opens its details');
  ok((info.title || '').includes(expected.name), `naming the place (${info.title})`);
  ok(info.hasBlurb, 'with something to read about it');
  ok(/XP/.test(info.meta || ''), `and its region, time and XP (${info.meta})`);
  ok(/google\.com\/maps\/search/.test(info.link || ''), 'plus a link to that exact spot');
  ok(info.highlighted === 1, 'and the pin is marked as chosen');

  // The link must point at the real place, not the map centre.
  const q = decodeURIComponent(/query=([^&]+)/.exec(info.link)?.[1] || '');
  const [plat, plon] = q.split(',').map(Number);
  ok(Math.abs(plat - expected.lat) < 0.001 && Math.abs(plon - expected.lon) < 0.001,
    `at ${expected.name}'s real coordinates (${q})`);

  // ---------------------------------------------------------------
  console.log('\n-- closing --');
  // ---------------------------------------------------------------
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  const closed = await p.evaluate(() => ({
    gone: !document.querySelector('.mapfs'),
    scrolls: getComputedStyle(document.body).overflow,
    stillOnTrip: !document.getElementById('view-trip').hidden,
  }));
  ok(closed.gone, 'Escape closes it');
  ok(closed.scrolls !== 'hidden', 'and gives the page back its scrolling');
  ok(closed.stillOnTrip, 'leaving you where you were');

  // ---------------------------------------------------------------
  console.log('\n-- and on the builder map --');
  // ---------------------------------------------------------------
  await p.locator('.nav-btn[data-view="build"]').click();
  await p.waitForTimeout(1200);
  const builder = await p.evaluate(() => ({
    full: Boolean(document.querySelector('#bd-map [data-map-full]')),
    google: Boolean(document.querySelector('#bd-map [data-map-google]')),
  }));
  ok(builder.full && builder.google, 'the builder map has them too');

  await p.locator('#bd-map [data-map-full]').click();
  await p.waitForTimeout(600);
  const bfs = await p.evaluate(() => ({
    open: Boolean(document.querySelector('.mapfs')),
    cands: document.querySelectorAll('.mapfs .map-cand').length,
  }));
  ok(bfs.open, 'and open full screen');
  ok(bfs.cands > 0, `carrying the selectable locations with them (${bfs.cands})`);

  ok(errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`);

  await b.close();
  console.log(failures ? `\n${failures} failed` : '\nmapview: all good');
  process.exit(failures ? 1 : 0);
})();
