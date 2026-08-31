// ============================================================
// BRAW — check-in photographs.
//
// Photos live in IndexedDB, deliberately NOT in localStorage. The
// profile (trips, XP, achievements) shares localStorage's ~5MB budget,
// and a handful of photographs would exhaust it — every later
// store.save() would then throw QuotaExceededError and silently lose
// the user's progress. A separate store keeps that failure impossible.
//
// ---- Two renditions ----
//
// Each photograph is kept twice: a small `thumb` for lists and grids,
// and a `full` at print resolution.
//
// The full copy exists because these photographs are meant to end up on
// a wall calendar, and print resolution is arithmetic, not opinion. An
// A4 page is 297mm — 11.7 inches — across:
//
//   1024px (what v1 kept)  ≈  87 dpi   visibly soft
//   2400px                 ≈ 205 dpi   acceptable
//   3000px                 ≈ 257 dpi   a proper photographic print
//
// So 3000px it is, which is also very nearly the full height of a
// typical 12MP phone photograph, meaning almost nothing is thrown away.
// The cost is roughly 1MB per photograph instead of 50KB; the storage
// panel shows that total, and the alternative was discovering the
// problem when the first calendar came back from the printer.
//
// Anything the camera gave us smaller is kept at its own size and
// flagged in the calendar builder rather than upscaled into a blur.
//
// ---- One record per photograph ----
//
// v1 keyed photographs "<user>::<poi>", one per location for ever. Two
// trips to Glencoe meant the second photograph destroyed the first with
// no warning, and there was no way to ask "which photographs came from
// this journey?" — which is exactly the question a calendar asks. v2
// gives every photograph its own id and remembers the journey it
// belongs to. The upgrade below carries v1 photographs across.
//
// ---- Blobs, not data URLs (v3) ----
//
// v2 kept both renditions as base64 data URLs. That is about a third
// more bytes than the image needs, it cannot be cached by the browser,
// and it puts the whole photograph into the DOM as text. One of those
// in a page is fine; sixty in a profile grid is not, which is what the
// image-led redesign asks for.
//
// The conversion deliberately does NOT run inside the versionchange
// transaction, the way v1 → v2 did. That walk was safe because v1
// photographs were 1024px. Decoding a few hundred ~1.3MB base64 strings
// in one transaction is hundreds of megabytes of allocation churn on a
// phone, and losing that transaction means losing the store. So the
// upgrade claims the version and nothing else; upgradeStoredPhotos()
// converts afterwards, a few at a time, off the boot path. Every reader
// below accepts either shape, for ever — an interrupted conversion
// leaves a perfectly readable record.
// ============================================================

const DB_NAME = 'braw_photos_v1';
const DB_VERSION = 3;
const OLD_STORE = 'photos';
const STORE = 'shots';

const THUMB_EDGE = 480;
const THUMB_Q = 0.72;
const FULL_EDGE = 3000;
const FULL_Q = 0.82;

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined' || !indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = req.result;
      const tx = req.transaction;

      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: 'id' });
        s.createIndex('owner', 'owner');
        s.createIndex('ownerTrip', ['owner', 'tripId']);
        s.createIndex('ownerPoi', ['owner', 'poiId']);
      }

      // v1 → v2. Runs inside the versionchange transaction, so either
      // every photograph moves across or the upgrade rolls back and the
      // old store is left untouched. Deleting the old store only after
      // the copies are queued means a failure here cannot lose anything.
      if (e.oldVersion < 2 && db.objectStoreNames.contains(OLD_STORE)) {
        const from = tx.objectStore(OLD_STORE);
        const to = tx.objectStore(STORE);
        from.openCursor().onsuccess = ev => {
          const cur = ev.target.result;
          if (!cur) { db.deleteObjectStore(OLD_STORE); return; }
          const [owner, poiId] = String(cur.key).split('::');
          if (owner && poiId && cur.value?.dataUrl) {
            to.put({
              id: mintId(),
              // v1 keyed on the display name; the account key is the
              // lower-cased form of it, which is what v2 owns by.
              owner: owner.toLowerCase(),
              tripId: '',            // v1 did not know; shown as unfiled
              poiId,
              at: cur.value.at || Date.now(),
              thumb: cur.value.dataUrl,
              full: cur.value.dataUrl,
              w: 0, h: 0,
              bytes: approxBytes(cur.value.dataUrl),
              legacy: true,          // never large enough to print well
              remote: null,
            });
          }
          cur.continue();
        };
      }

      // v2 → v3 changes what a record holds, not the shape of the store,
      // so there is nothing to do here. Claiming the version is still
      // worth it: an older tab running v2 code then fails loudly with a
      // VersionError rather than quietly reading a record whose
      // renditions it cannot decode.
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('another tab is holding the photo store open'));
  });
  return dbPromise;
}

function run(mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error('aborted'));
    if (req) { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }
    else tx.oncomplete = () => resolve();
  }));
}

let seq = 0;
function mintId() {
  // Sortable by time, unique without coordination, and safe as both an
  // object key and a storage filename.
  seq = (seq + 1) % 4096;
  const rand = Math.random().toString(36).slice(2, 8);
  return `ph_${Date.now().toString(36)}_${seq.toString(36)}${rand}`;
}

const approxBytes = dataUrl => Math.round((String(dataUrl).length - 22) * 0.75);

// ------------------------------------------------------------------
// Decoding and resizing
// ------------------------------------------------------------------

/**
 * Decode a file to something drawable, with rotation already applied.
 *
 * Phone cameras record orientation in EXIF rather than rotating the
 * pixels, so a portrait photograph is stored as a landscape frame plus
 * "turn this 90°". createImageBitmap with imageOrientation:'from-image'
 * hands back pixels the right way up. The <img> fallback is for older
 * Safari, which honours EXIF when *rendering* an <img>, so drawing that
 * element to a canvas gets the same result.
 */
async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
      return { source: bmp, width: bmp.width, height: bmp.height, done: () => bmp.close?.() };
    } catch { /* fall through to the <img> path */ }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      done: () => URL.revokeObjectURL(url),
    });
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('could not decode image')); };
    img.src = url;
  });
}

/**
 * Draw at most `edge` px on the longest side. Never upscales.
 *
 * toBlob rather than toDataURL: the bytes are what we store now, and
 * base64 would only be encoded here to be decoded again on every read.
 * Re-encoding through a canvas is also what strips EXIF — GPS included —
 * which the privacy policy claims and tests/photos.js asserts.
 */
function render(source, srcW, srcH, edge, quality) {
  const scale = Math.min(1, edge / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, w, h);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => (blob ? resolve({ blob, w, h }) : reject(new Error('could not encode image'))),
      'image/jpeg', quality);
  });
}

/**
 * Turn a picked file into the pair of renditions we keep.
 * Rejects anything that is not a decodable image.
 */
export async function renditions(file) {
  if (!file || !String(file.type).startsWith('image/')) throw new Error('not an image');
  const { source, width, height, done } = await decode(file);
  try {
    const full = await render(source, width, height, FULL_EDGE, FULL_Q);
    const thumb = await render(source, width, height, THUMB_EDGE, THUMB_Q);
    return {
      thumbBlob: thumb.blob,
      fullBlob: full.blob,
      w: full.w,
      h: full.h,
      // A real byte count now, rather than an estimate from a base64
      // string length. The storage panel gets more honest for free.
      bytes: full.blob.size + thumb.blob.size,
    };
  } finally {
    done();
  }
}

// ------------------------------------------------------------------
// Reading a rendition, whichever shape the record is in
//
// Every record is either v3 (Blobs) or older (data URLs), and will be
// for as long as anyone has an account that has not finished converting.
// Nothing outside this file should have to know which.
// ------------------------------------------------------------------

/** A data URL turned back into bytes. */
export function dataUrlToBlob(dataUrl, type = 'image/jpeg') {
  const comma = String(dataUrl).indexOf(',');
  const meta = String(dataUrl).slice(0, comma);
  const body = String(dataUrl).slice(comma + 1);
  const mime = (meta.match(/data:([^;,]+)/) || [])[1] || type;
  const bin = atob(body);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** The bytes of one rendition, or null. Accepts v3 and older records. */
export function photoBlob(record, which = 'thumb') {
  if (!record) return null;
  const blob = record[`${which}Blob`];
  if (blob instanceof Blob) return blob;
  // A legacy v1 photograph has only the one rendition under both names.
  const url = record[which] || record.thumb;
  return url ? dataUrlToBlob(url) : null;
}

/**
 * A rendition as a data URL.
 *
 * Only the backup file needs this — it is JSON, and JSON cannot hold a
 * Blob. Everything on screen should use photoBlob and an object URL.
 */
export function photoDataUrl(record, which = 'thumb') {
  const existing = record && (record[which] || (which === 'full' ? record.thumb : null));
  if (typeof existing === 'string') return Promise.resolve(existing);
  const blob = photoBlob(record, which);
  if (!blob) return Promise.resolve('');
  return new Promise(resolve => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = () => resolve('');
    fr.readAsDataURL(blob);
  });
}

/** Has this record been converted to Blobs yet? */
export const isConverted = r => r && r.thumbBlob instanceof Blob;

const idle = () => new Promise(resolve => {
  if (typeof requestIdleCallback === 'function') requestIdleCallback(() => resolve(), { timeout: 500 });
  else setTimeout(resolve, 0);
});

/**
 * Convert stored photographs to Blobs, a few at a time, when idle.
 *
 * Called once after the first view has rendered, and never awaited. A
 * record that fails — a full disk, a truncated data URL — is left
 * exactly as it was and tried again next time, which is why every
 * reader above still accepts the old shape.
 */
export async function upgradeStoredPhotos(owner, { batch = 4 } = {}) {
  let rows = [];
  try { rows = await allPhotos(owner); } catch { return 0; }
  const stale = rows.filter(r => typeof r.thumb === 'string');
  let done = 0;
  for (let i = 0; i < stale.length; i += batch) {
    await idle();
    for (const r of stale.slice(i, i + batch)) {
      try {
        const next = { ...r };
        next.thumbBlob = dataUrlToBlob(r.thumb);
        next.fullBlob = dataUrlToBlob(r.full || r.thumb);
        next.bytes = next.thumbBlob.size + next.fullBlob.size;
        delete next.thumb;
        delete next.full;
        await run('readwrite', s => s.put(next));
        done++;
      } catch { /* left as it was; still readable, retried next boot */ }
    }
  }
  return done;
}

// ------------------------------------------------------------------
// Reading and writing
// ------------------------------------------------------------------

/** Store a photograph against a location, and the journey it was on. */
export async function addPhoto(owner, { tripId = '', poiId }, file) {
  const r = await renditions(file);
  const record = {
    id: mintId(), owner, tripId: tripId || '', poiId,
    at: Date.now(), remote: null, ...r,
  };
  await run('readwrite', s => s.put(record));
  return record;
}

/** Put a whole record back, e.g. when restoring a backup. */
export async function putPhotoRecord(record) {
  await run('readwrite', s => s.put(record));
  return record;
}

export async function getPhoto(id) {
  try { return (await run('readonly', s => s.get(id))) || null; }
  catch { return null; }
}

export async function deletePhoto(id) {
  try { await run('readwrite', s => s.delete(id)); } catch { /* nothing to remove */ }
}

/** Every photograph this account holds, newest first. */
export async function allPhotos(owner) {
  try {
    const rows = await run('readonly', s => s.index('owner').getAll(owner));
    return (rows || []).sort((a, b) => b.at - a.at);
  } catch { return []; }
}

/** Photographs taken on one journey, oldest first — calendar order. */
export async function photosForTrip(owner, tripId) {
  try {
    const rows = await run('readonly', s => s.index('ownerTrip').getAll([owner, tripId || '']));
    return (rows || []).sort((a, b) => a.at - b.at);
  } catch { return []; }
}

/** Photographs of one location, newest first. */
export async function photosForPoi(owner, poiId) {
  try {
    const rows = await run('readonly', s => s.index('ownerPoi').getAll([owner, poiId]));
    return (rows || []).sort((a, b) => b.at - a.at);
  } catch { return []; }
}

/**
 * The single photograph to show beside a stop. Prefers one taken on the
 * journey being looked at, so opening an old trip shows that trip's
 * photograph rather than whatever was taken there most recently.
 */
export async function coverFor(owner, tripId, poiId) {
  const shots = await photosForPoi(owner, poiId);
  if (!shots.length) return null;
  return shots.find(p => p.tripId === tripId) || shots[0];
}

/** poiIds this account has photographed, for counts and badges. */
export async function photographedPoiIds(owner) {
  const rows = await allPhotos(owner);
  return [...new Set(rows.map(r => r.poiId))];
}

export async function photoCount(owner) {
  return (await allPhotos(owner)).length;
}

/**
 * How much room this account's photographs take.
 *
 * Exact for converted records, which carry the real sum of both Blob
 * sizes; estimated from the base64 length for any not yet converted.
 */
export async function bytesUsed(owner) {
  const rows = await allPhotos(owner);
  return rows.reduce((n, r) => {
    if (r.bytes) return n + r.bytes;
    if (r.thumbBlob instanceof Blob) {
      return n + r.thumbBlob.size + (r.fullBlob instanceof Blob ? r.fullBlob.size : 0);
    }
    return n + approxBytes(r.full || r.thumb || '');
  }, 0);
}

/** Record that a copy now exists in the cloud. */
export async function markUploaded(id, path) {
  const rec = await getPhoto(id);
  if (!rec) return null;
  rec.remote = { path, at: Date.now() };
  await run('readwrite', s => s.put(rec));
  return rec;
}

export async function markNotUploaded(id) {
  const rec = await getPhoto(id);
  if (!rec) return null;
  rec.remote = null;
  await run('readwrite', s => s.put(rec));
  return rec;
}

/** Move photographs from one account key to another (local → cloud sign-up). */
export async function reassign(fromOwner, toOwner) {
  const rows = await allPhotos(fromOwner);
  for (const r of rows) {
    r.owner = toOwner;
    await run('readwrite', s => s.put(r));
  }
  return rows.length;
}

// ------------------------------------------------------------------
// Print quality
// ------------------------------------------------------------------

/**
 * Dots per inch this photograph would print at across `widthMm`.
 *
 * The calendar builder shows this so nobody discovers their photograph
 * was too small only once it is hanging on a wall.
 */
export function printDpi(record, widthMm) {
  const px = Math.max(record?.w || 0, record?.h || 0);
  if (!px || !widthMm) return 0;
  return Math.round(px / (widthMm / 25.4));
}

// 300 dpi is the trade standard and 200 is where a photographic print
// stops being noticeably soft to an ordinary viewer at arm's length.
// The thresholds sit at 200 and 150 rather than 300 and 200 because a
// wall calendar is looked at from across a kitchen, and marking every
// perfectly good photograph as substandard would train people to ignore
// the warning — which would then be there for nothing when a genuinely
// too-small picture came along.
export const PRINT_OK = 200;
export const PRINT_POOR = 150;

/** 'good' | 'fair' | 'poor' for a photograph at a given print width. */
export function printGrade(record, widthMm) {
  if (record?.legacy) return 'poor';
  const dpi = printDpi(record, widthMm);
  if (dpi >= PRINT_OK) return 'good';
  if (dpi >= PRINT_POOR) return 'fair';
  return 'poor';
}
