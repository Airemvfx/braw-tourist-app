// Image loading. The behaviours here are the ones that only show up at
// scale — an off-screen photograph that downloaded anyway, an object URL
// that was never revoked — so they are invisible in a hand-check of one
// card and obvious in a grid of sixty.
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };

// A 1x1 GIF, so nothing here depends on a file existing on disk.
const PIXEL = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

(async () => {
  const b = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const p = await (await b.newContext()).newPage();
  const errors = [];
  p.on('pageerror', e => errors.push(e.message));

  // Which files the page actually asks the network for. This is the only
  // honest way to test lazy loading: the class names and attributes can
  // all look right while every image downloads immediately.
  const asked = [];
  await p.route('**/lazy-probe-*.png', route => {
    asked.push(route.request().url().split('/').pop());
    route.fulfill({ status: 404, body: '' });
  });

  await p.goto('http://localhost:8099/');
  await p.setViewportSize({ width: 390, height: 600 });

  const r = await p.evaluate(async () => {
    const m = await import('/js/media.js');
    const out = {};

    out.srcset = m.srcsetFor('images/locations/glencoe.webp');
    out.srcsetOfBlob = m.srcsetFor('blob:whatever');
    out.srcsetNoExt = m.srcsetFor('noextension');
    out.urlRelative = m.imageUrl('images/x.webp');
    out.urlAbsolute = m.imageUrl('https://example.com/y.jpg');
    out.urlEmpty = m.imageUrl('');

    // alt is escaped, and the src is withheld until hydration
    out.markup = String(m.imgHTML('images/a.webp', 'a "quoted" <alt>', {}));
    out.eagerMarkup = String(m.imgHTML('images/a.webp', 'x', { eager: true }));

    // ---- object URL scopes ----
    const blob = new Blob(['x'], { type: 'image/jpeg' });
    const u1 = m.scopedUrl('trips', blob);
    const u2 = m.scopedUrl('trips', blob);
    out.mintedBlobUrls = u1.startsWith('blob:') && u2.startsWith('blob:') && u1 !== u2;
    out.scopeHolds = m.scopeSize('trips');
    out.passThroughString = m.scopedUrl('trips', 'data:image/gif;base64,AAA');
    out.released = m.releaseScope('trips');
    out.scopeEmptied = m.scopeSize('trips');
    // A released URL must actually be dead.
    out.revoked = await fetch(u1).then(() => false).catch(() => true);
    return out;
  });

  console.log('-- urls --');
  ok(r.srcset === 'images/locations/glencoe-400.webp 400w, images/locations/glencoe-800.webp 800w, '
    + 'images/locations/glencoe-1600.webp 1600w', 'srcset names the three renditions');
  ok(r.srcsetOfBlob === '', 'a blob: URL gets no srcset');
  ok(r.srcsetNoExt === '', 'a path with no extension gets no srcset');
  ok(r.urlRelative === 'images/x.webp', 'a repo path is left alone');
  ok(r.urlAbsolute === 'https://example.com/y.jpg', 'an absolute URL passes through');
  ok(r.urlEmpty === '', 'nothing in, nothing out');

  console.log('\n-- markup --');
  ok(r.markup.includes('alt="a &quot;quoted&quot; &lt;alt&gt;"'), 'alt text is escaped');
  ok(r.markup.includes('data-src=') && !/\ssrc=/.test(r.markup), 'a lazy image withholds src');
  ok(r.eagerMarkup.includes(' src=') && !r.eagerMarkup.includes('data-src'),
    'an eager image gets src straight away');

  console.log('\n-- object URLs --');
  ok(r.mintedBlobUrls === true, 'each call mints its own URL');
  ok(r.scopeHolds === 2, `the scope holds them (${r.scopeHolds})`);
  ok(r.passThroughString.startsWith('data:'), 'an existing string URL is handed back untouched');
  // Two, not three: the string that was handed back untouched was never
  // an object URL, so there is nothing to revoke and nothing to count.
  ok(r.released === 2, `releasing returns how many went (${r.released})`);
  ok(r.scopeEmptied === 0, 'and the scope is emptied');
  ok(r.revoked === true, 'a released URL is genuinely revoked');

  // ---- lazy loading, measured at the network ----
  await p.evaluate(pixel => {
    const box = document.createElement('div');
    box.id = 'lazybox';
    box.style.cssText = 'position:absolute;left:0;top:0;width:300px';
    box.innerHTML = `
      <img id="near" data-src="/lazy-probe-near.png" alt="">
      <div style="height:4000px"></div>
      <img id="far" data-src="/lazy-probe-far.png" alt="">`;
    document.body.appendChild(box);
  }, PIXEL);
  await p.evaluate(async () => {
    const m = await import('/js/media.js');
    window.__mounted = m.mountLazy(document.getElementById('lazybox'));
  });
  await p.waitForTimeout(700);
  const mounted = await p.evaluate(() => window.__mounted);

  console.log('\n-- lazy loading --');
  ok(mounted === 2, `both images are observed (${mounted})`);
  ok(asked.includes('lazy-probe-near.png'), 'the one on screen is fetched');
  ok(!asked.includes('lazy-probe-far.png'),
    `the one 4000px down is not (${asked.join(',') || 'nothing else asked for'})`);

  await p.evaluate(() => window.scrollTo(0, 4200));
  await p.waitForTimeout(700);
  ok(asked.includes('lazy-probe-far.png'), 'until it is scrolled towards');

  // ---- a missing file must look intended ----
  await p.waitForTimeout(300);
  const failed = await p.evaluate(() =>
    ['near', 'far'].map(id => {
      const el = document.getElementById(id);
      return { failed: el.classList.contains('is-failed'), src: el.getAttribute('src') };
    }));
  console.log('\n-- degradation --');
  ok(failed.every(f => f.failed), 'a 404 marks the image failed rather than broken');
  ok(failed.every(f => f.src === null), 'and clears its src, so no broken-image icon is drawn');

  // The bug this pins: an eager image had no load listener (hydrate only
  // ever runs for lazy ones), so it never gained .is-loaded and sat at
  // opacity 0 for ever. Everything about it looked right in the DOM —
  // correct src, correct size, correct classes bar one — and the card
  // simply rendered as an empty box.
  const eager = await p.evaluate(async () => {
    const m = await import('/js/media.js');
    const box = document.createElement('div');
    box.className = 'media';
    box.innerHTML = String(m.imgHTML('/lazy-probe-eager.png', 'x', { eager: true }));
    document.body.appendChild(box);
    const img = box.querySelector('img');
    const before = getComputedStyle(img).opacity;
    m.mountLazy(box);
    return { markedLoaded: img.classList.contains('is-loaded'), opacity: before };
  });
  console.log('\n-- eager images --');
  ok(eager.markedLoaded === true, 'an eager image is marked loaded in the markup');
  ok(eager.opacity === '1', `and is actually visible (opacity ${eager.opacity})`);

  await p.waitForTimeout(500);
  const eagerFailed = await p.evaluate(() => {
    const img = document.querySelector('img[alt="x"]');
    return { failed: img.classList.contains('is-failed'),
             boxEmpty: img.closest('.media')?.classList.contains('is-empty') };
  });
  ok(eagerFailed.failed === true, 'and a 404 on an eager image still degrades');
  ok(eagerFailed.boxEmpty === true, 'putting the box back to its placeholder');

  console.log('\n-- page --');
  ok(errors.length === 0, `no page errors (${errors.length ? errors[0] : 'none'})`);

  await b.close();
  console.log(fails ? `\nmedia: ${fails} FAILED` : '\nmedia: all good');
  process.exit(fails ? 1 : 0);
})();
