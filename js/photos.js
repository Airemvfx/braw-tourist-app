// ============================================================
// BRAW — check-in photos.
//
// Photos live in IndexedDB, deliberately NOT in localStorage. The
// profile (trips, XP, achievements) shares localStorage's ~5MB budget,
// and a handful of full-size photos would exhaust it — every later
// store.save() would then throw QuotaExceededError and silently lose
// the user's progress. A separate store keeps that failure impossible.
//
// Images are downscaled and re-encoded before storage, so a 4MB phone
// snap lands at roughly 40-70KB.
// ============================================================

const DB_NAME = 'braw_photos_v1';
const STORE = 'photos';
const MAX_EDGE = 1024;   // px on the longest side
const QUALITY = 0.72;    // JPEG quality

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) { reject(new Error('IndexedDB unavailable')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

/** Key photos per user so two accounts on one device stay separate. */
const key = (userName, poiId) => `${userName}::${poiId}`;

/**
 * Downscale and re-encode a File to a compact JPEG data URL.
 * Rejects anything that is not a decodable image.
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) { reject(new Error('not an image')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      try { resolve(canvas.toDataURL('image/jpeg', QUALITY)); }
      catch (err) { reject(err); }
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('could not decode image')); };
    img.src = url;
  });
}

export async function savePhoto(userName, poiId, dataUrl) {
  await tx('readwrite', s => s.put({ dataUrl, at: Date.now() }, key(userName, poiId)));
}

export async function getPhoto(userName, poiId) {
  try { return (await tx('readonly', s => s.get(key(userName, poiId))))?.dataUrl || null; }
  catch { return null; }
}

export async function deletePhoto(userName, poiId) {
  try { await tx('readwrite', s => s.delete(key(userName, poiId))); } catch { /* nothing to remove */ }
}

/** poiIds this user has photographed, for counts and thumbnails. */
export async function listPhotoIds(userName) {
  try {
    const keys = await tx('readonly', s => s.getAllKeys());
    const prefix = `${userName}::`;
    return keys.filter(k => typeof k === 'string' && k.startsWith(prefix)).map(k => k.slice(prefix.length));
  } catch { return []; }
}
