// ============================================================
// The photo store: filing, migration and print grading.
//
// The migration test is the important one. Photographs are the only
// thing in this app that cannot be regenerated — a lost trip can be
// planned again, a lost photograph cannot — so the v1 → v2 upgrade
// running inside a versionchange transaction, and losing nothing, is
// worth holding to a test rather than trusting.
// ============================================================
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const BASE = 'http://localhost:8099/';
let failures = 0;
const ok = (cond, what) => {
  console.log(`  ${cond ? '✓' : '✗'} ${what}`);
  if (!cond) failures++;
};

/** A real JPEG of a given size, made in the page and handed back as a File. */
const MAKE_FILE = `
  (w, h) => new Promise(resolve => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    // Something with actual detail, so JPEG cannot compress it to nothing.
    for (let i = 0; i < 400; i++) {
      x.fillStyle = 'hsl(' + (i * 7 % 360) + ',60%,' + (30 + i % 50) + '%)';
      x.fillRect((i * 37) % w, (i * 53) % h, w / 12, h / 12);
    }
    c.toBlob(b => resolve(new File([b], 'shot.jpg', { type: 'image/jpeg' })), 'image/jpeg', 0.9);
  })`;

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--ignore-certificate-errors'],
  });
  const page = await (await browser.newContext()).newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));

  // ---------------------------------------------------------------
  console.log('\n-- a version 1 store is carried across, not dropped --');
  // ---------------------------------------------------------------
  await page.goto(BASE);
  await page.evaluate(async () => {
    localStorage.clear();
    await new Promise(res => { const r = indexedDB.deleteDatabase('braw_photos_v1'); r.onsuccess = r.onerror = res; });
    // Build the old schema exactly as v1 left it.
    await new Promise((res, rej) => {
      const req = indexedDB.open('braw_photos_v1', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('photos');
      req.onsuccess = () => {
        const db = req.result;
        const tx = db.transaction('photos', 'readwrite');
        const s = tx.objectStore('photos');
        // A 1x1 gif is enough: the migration copies bytes, it does not decode.
        const url = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAD8AKp//2Q==';
        s.put({ dataUrl: url, at: 1700000000000 }, 'weeexplorer::edinburgh-castle');
        s.put({ dataUrl: url, at: 1700000001000 }, 'weeexplorer::stirling-castle');
        s.put({ dataUrl: url, at: 1700000002000 }, 'someoneelse::glencoe');
        tx.oncomplete = () => { db.close(); res(); };
        tx.onerror = () => rej(tx.error);
      };
      req.onerror = () => rej(req.error);
    });
  });

  const migrated = await page.evaluate(async () => {
    const m = await import('/js/photos.js');
    const mine = await m.allPhotos('weeexplorer');
    const theirs = await m.allPhotos('someoneelse');
    const stores = await new Promise(res => {
      const r = indexedDB.open('braw_photos_v1');
      r.onsuccess = () => { const names = [...r.result.objectStoreNames]; r.result.close(); res(names); };
    });
    return {
      mine: mine.length, theirs: theirs.length, stores, sample: mine[0],
      times: mine.map(p => p.at).sort(),
      pois: mine.map(p => p.poiId).sort(),
    };
  });

  ok(migrated.mine === 2, `both of this account's v1 photographs survived (${migrated.mine})`);
  ok(migrated.theirs === 1, 'another account\'s photograph stayed with that account');
  ok(!migrated.stores.includes('photos'), 'the old object store was removed once copied');
  ok(migrated.stores.includes('shots'), 'the new object store exists');
  ok(migrated.sample && migrated.sample.legacy === true,
    'migrated photographs are marked legacy, so they are not offered for print');
  ok(String(migrated.times) === String([1700000000000, 1700000001000]),
    'original timestamps were kept');
  ok(String(migrated.pois) === 'edinburgh-castle,stirling-castle',
    'the location was recovered from the old composite key');

  // ---------------------------------------------------------------
  console.log('\n-- the same place on two journeys is two photographs --');
  // ---------------------------------------------------------------
  const twice = await page.evaluate(async makeFileSrc => {
    const m = await import('/js/photos.js');
    const make = eval(makeFileSrc);
    const f1 = await make(800, 600);
    const f2 = await make(800, 600);
    await m.addPhoto('u1', { tripId: 'trip-a', poiId: 'glencoe' }, f1);
    await m.addPhoto('u1', { tripId: 'trip-b', poiId: 'glencoe' }, f2);
    return {
      all: (await m.photosForPoi('u1', 'glencoe')).length,
      onA: (await m.photosForTrip('u1', 'trip-a')).length,
      onB: (await m.photosForTrip('u1', 'trip-b')).length,
      coverA: (await m.coverFor('u1', 'trip-a', 'glencoe'))?.tripId,
      coverB: (await m.coverFor('u1', 'trip-b', 'glencoe'))?.tripId,
    };
  }, MAKE_FILE);

  ok(twice.all === 2, 'the second visit did not overwrite the first');
  ok(twice.onA === 1 && twice.onB === 1, 'each journey holds its own');
  ok(twice.coverA === 'trip-a' && twice.coverB === 'trip-b',
    'opening a journey shows that journey\'s photograph');

  // ---------------------------------------------------------------
  console.log('\n-- renditions and print grading --');
  // ---------------------------------------------------------------
  const grades = await page.evaluate(async makeFileSrc => {
    const m = await import('/js/photos.js');
    const make = eval(makeFileSrc);
    const big = await m.addPhoto('u2', { poiId: 'ben-nevis' }, await make(4032, 3024));
    const small = await m.addPhoto('u2', { poiId: 'iona' }, await make(640, 480));
    const A4 = 297, MAGNET = 70;
    return {
      bigW: big.w, bigH: big.h,
      thumbSmaller: big.thumb.length < big.full.length,
      smallNotUpscaled: small.w,
      bigOnA4: m.printGrade(big, A4), bigDpi: m.printDpi(big, A4),
      smallOnA4: m.printGrade(small, A4),
      smallOnMagnet: m.printGrade(small, MAGNET),
      legacyOnA4: m.printGrade({ w: 1024, h: 768, legacy: true }, A4),
    };
  }, MAKE_FILE);

  ok(grades.bigW === 3000, `a 4032px photograph is stored at 3000px (got ${grades.bigW})`);
  ok(grades.thumbSmaller, 'the thumbnail is smaller than the print copy');
  ok(grades.smallNotUpscaled === 640, 'a small photograph is not upscaled');
  ok(grades.bigOnA4 === 'good', `3000px prints well at A4 (${grades.bigDpi} dpi)`);
  ok(grades.smallOnA4 === 'poor', '640px is refused for an A4 calendar');
  ok(grades.smallOnMagnet === 'good', '...but is fine on a 70mm magnet');
  ok(grades.legacyOnA4 === 'poor', 'a legacy v1 photograph is never offered for print');

  // ---------------------------------------------------------------
  console.log('\n-- the storage panel tells the truth --');
  // ---------------------------------------------------------------
  const health = await page.evaluate(async () => {
    const v = await import('/js/vault.js');
    const empty = await v.storageHealth('nobody');
    const used = await v.storageHealth('u2');
    return {
      emptyRisk: empty.risk, emptyPhotos: empty.photos,
      usedPhotos: used.photos, usedBytes: used.bytes,
      unbacked: used.unbackedUp, risk: used.risk,
      quotaKnown: used.quotaKnown,
      bytesFmt: v.formatBytes(used.bytes),
    };
  });

  ok(health.emptyRisk === 'empty' && health.emptyPhotos === 0, 'an account with no photographs says so');
  ok(health.usedPhotos === 2, 'it counts only this account\'s photographs');
  ok(health.usedBytes > 100000, `it reports a real byte total (${health.bytesFmt})`);
  ok(health.unbacked === 2, 'nothing is counted as backed up until it is');
  ok(['medium', 'high'].includes(health.risk),
    `local-only photographs are reported as at risk, not as safe (${health.risk})`);

  // ---------------------------------------------------------------
  console.log('\n-- exported filenames are sane --');
  // ---------------------------------------------------------------
  const names = await page.evaluate(async () => {
    const v = await import('/js/vault.js');
    const blob = v.dataUrlToBlob('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2Q==');
    return { type: blob.type, size: blob.size };
  });
  ok(names.type === 'image/jpeg' && names.size > 0, 'a stored photograph converts back to real bytes');

  // ---------------------------------------------------------------
  console.log('\n-- camera metadata does not survive --');
  //
  // The privacy policy states that saving a photograph drops its EXIF,
  // GPS coordinates included. That is a consequence of re-encoding
  // through a canvas rather than something the code does deliberately,
  // which is exactly why it deserves a test: an innocent change to how
  // images are stored could quietly turn a published promise into a
  // false one.
  // ---------------------------------------------------------------
  const exif = await page.evaluate(async () => {
    const photos = await import('/js/photos.js');
    const v = await import('/js/vault.js');

    // A JPEG carrying a real APP1/Exif segment with a GPS IFD pointer.
    // Built by hand so the test does not depend on a fixture file.
    const plain = await new Promise(res => {
      const c = document.createElement('canvas');
      c.width = 60; c.height = 40;
      const x = c.getContext('2d');
      x.fillStyle = '#48f'; x.fillRect(0, 0, 60, 40);
      x.fillStyle = '#f80'; x.fillRect(10, 10, 25, 20);
      c.toBlob(res, 'image/jpeg', 0.9);
    });
    const bytes = new Uint8Array(await plain.arrayBuffer());

    // Splice an APP1 segment in straight after SOI.
    const marker = new TextEncoder().encode('Exif\0\0MM\0*GPSLatitude 56.8N');
    const segLen = marker.length + 2;
    const app1 = new Uint8Array(4 + marker.length);
    app1[0] = 0xff; app1[1] = 0xe1;
    app1[2] = (segLen >> 8) & 0xff; app1[3] = segLen & 0xff;
    app1.set(marker, 4);

    const withExif = new Uint8Array(bytes.length + app1.length);
    withExif.set(bytes.subarray(0, 2), 0);
    withExif.set(app1, 2);
    withExif.set(bytes.subarray(2), 2 + app1.length);

    const file = new File([withExif], 'gps.jpg', { type: 'image/jpeg' });
    const hasExif = buf => {
      const s = new TextDecoder('latin1').decode(new Uint8Array(buf));
      return { exif: s.includes('Exif'), gps: s.includes('GPSLatitude') };
    };

    const source = hasExif(withExif);
    const rec = await photos.addPhoto('u3', { poiId: 'iona' }, file);
    const stored = hasExif(await v.dataUrlToBlob(rec.full).arrayBuffer());
    return { source, stored, decoded: rec.w > 0 };
  });

  ok(exif.source.exif && exif.source.gps, 'the test image really did carry EXIF and a GPS tag');
  ok(exif.decoded, 'and it still decoded normally');
  ok(!exif.stored.exif, 'the stored photograph has no EXIF segment');
  ok(!exif.stored.gps, 'and no GPS tag — the privacy policy is telling the truth');

  ok(errors.length === 0, `no page errors (${errors.join(' | ') || 'none'})`);

  await browser.close();
  console.log(failures ? `\n${failures} failed` : '\nphotos: all good');
  process.exit(failures ? 1 : 0);
})();
