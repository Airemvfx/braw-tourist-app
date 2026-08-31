// ============================================================
// BRAW — keeping photographs alive.
//
// Photographs are held on the device, which is the right default: they
// are the user's, they cost nothing to keep, and they work with no
// signal. It is also the risky default, because browser storage is not
// a filing cabinet. Three separate things can take it away:
//
//   1. Eviction. By default an origin's storage is "best effort" and
//      the browser may clear it when the disk gets tight. The user is
//      not asked and not told.
//   2. Housekeeping. "Clear browsing data" and most cleaner apps wipe
//      site storage along with the cache. To the person clicking it,
//      this looks like clearing junk, not deleting their holiday.
//   3. iOS. Script-writable storage on a site that has not been opened
//      for seven days can be cleared. Adding the site to the Home
//      Screen exempts it.
//
// So this module does four things, weakest to strongest:
//
//   * asks for persistent storage, which turns off (1) outright;
//   * measures what is stored and how close the quota is;
//   * nudges towards installing, which is what actually earns
//     persistence on iOS and helps the heuristics on Chrome;
//   * and, because none of the above survives a determined "clear all
//     data", makes getting a real copy off the device easy — every
//     photograph as an ordinary .jpg file, plus the optional upload.
//
// The honest position is that only the last one is a guarantee, and the
// UI says so rather than implying the photographs are safe because a
// browser API returned true.
// ============================================================

import { allPhotos, photoBlob } from './photos.js';

export const DURABILITY = {
  PERSISTED: 'persisted',   // the browser has promised not to evict
  BEST_EFFORT: 'besteffort',// stored, but evictable without warning
  DENIED: 'denied',         // asked and refused
  UNAVAILABLE: 'none',      // no Storage API at all
};

const ASKED_KEY = 'braw_persist_asked_v1';
const NAGGED_KEY = 'braw_backup_nagged_v1';

/** Has the browser already promised to keep our storage? */
export async function isPersisted() {
  if (!navigator.storage?.persisted) return false;
  try { return await navigator.storage.persisted(); }
  catch { return false; }
}

/**
 * Ask for persistent storage.
 *
 * Worth understanding what "asking" means, because it differs and the
 * difference decides where the UI should ask from:
 *
 *   Firefox shows a permission prompt, so this must be called from a
 *   real user gesture or it is refused out of hand.
 *   Chrome never prompts; it decides from engagement signals — whether
 *   the site is installed, bookmarked, or frequently used — so a first
 *   call often returns false and a later one succeeds.
 *   Safari grants it to installed sites.
 *
 * Because Chrome's answer changes over time, a refusal is not final and
 * is not cached as one. It is simply retried at a sensible moment.
 */
export async function requestPersistence() {
  if (!navigator.storage?.persist) return DURABILITY.UNAVAILABLE;
  try {
    if (await isPersisted()) return DURABILITY.PERSISTED;
    const granted = await navigator.storage.persist();
    try { localStorage.setItem(ASKED_KEY, String(Date.now())); } catch { /* fine */ }
    return granted ? DURABILITY.PERSISTED : DURABILITY.DENIED;
  } catch {
    return DURABILITY.UNAVAILABLE;
  }
}

export function hasAskedForPersistence() {
  try { return Boolean(localStorage.getItem(ASKED_KEY)); } catch { return false; }
}

/** Bytes used and available, as the browser reports them. */
export async function quota() {
  if (!navigator.storage?.estimate) return { usage: 0, quota: 0, known: false };
  try {
    const { usage = 0, quota: q = 0 } = await navigator.storage.estimate();
    return { usage, quota: q, known: q > 0 };
  } catch {
    return { usage: 0, quota: 0, known: false };
  }
}

/** Is this page running as an installed app rather than a browser tab? */
export function isInstalled() {
  try {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: window-controls-overlay)').matches
      || navigator.standalone === true;   // iOS Safari
  } catch { return false; }
}

/** Roughly, is this iOS? Only used to explain the seven-day rule. */
export function isIOS() {
  const ua = navigator.userAgent || '';
  return /iPad|iPhone|iPod/.test(ua)
    || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

/**
 * Everything the storage panel needs, in one call.
 *
 * `risk` is the summary the UI leads with. It deliberately does not go
 * green merely because persistence was granted: photographs that exist
 * in exactly one place are one wiped browser away from gone, whatever
 * the browser has promised, and the panel should keep saying so until
 * a copy exists somewhere else.
 */
export async function storageHealth(owner) {
  const [persisted, q, photos] = await Promise.all([isPersisted(), quota(), allPhotos(owner)]);

  const bytes = photos.reduce((n, p) => n + (p.bytes || 0), 0);
  const backedUp = photos.filter(p => p.remote).length;
  const installed = isInstalled();

  const durability = !navigator.storage?.persist
    ? DURABILITY.UNAVAILABLE
    : persisted ? DURABILITY.PERSISTED
      : hasAskedForPersistence() ? DURABILITY.DENIED : DURABILITY.BEST_EFFORT;

  // Fullness matters because eviction, when it comes, is driven by
  // pressure. Unknown quota is treated as fine rather than alarming.
  const fullness = q.known ? q.usage / q.quota : 0;

  let risk = 'ok';
  if (photos.length === 0) risk = 'empty';
  else if (backedUp === photos.length) risk = 'safe';
  else if (durability !== DURABILITY.PERSISTED || fullness > 0.9) risk = 'high';
  else risk = 'medium';

  return {
    photos: photos.length,
    bytes,
    backedUp,
    unbackedUp: photos.length - backedUp,
    durability,
    persisted,
    installed,
    ios: isIOS(),
    usage: q.usage,
    quota: q.quota,
    quotaKnown: q.known,
    fullness,
    risk,
  };
}

/**
 * Should we prompt this person to take a copy?
 *
 * Nagging is the fastest way to teach someone to dismiss warnings
 * without reading them, so this is deliberately hard to trigger: only
 * with photographs that exist nowhere else, only past a threshold worth
 * protecting, and at most once a fortnight.
 */
const NAG_INTERVAL_MS = 14 * 24 * 60 * 60 * 1000;
const NAG_MIN_PHOTOS = 5;

export function shouldSuggestBackup(health) {
  if (!health || health.unbackedUp < NAG_MIN_PHOTOS) return false;
  if (health.risk === 'safe' || health.risk === 'empty') return false;
  try {
    const last = Number(localStorage.getItem(NAGGED_KEY) || 0);
    return Date.now() - last > NAG_INTERVAL_MS;
  } catch { return false; }
}

export function markBackupSuggested() {
  try { localStorage.setItem(NAGGED_KEY, String(Date.now())); } catch { /* fine */ }
}

// ------------------------------------------------------------------
// Getting the photographs off the device
// ------------------------------------------------------------------

// dataUrlToBlob now lives in js/photos.js, beside the store whose shape
// it exists to convert — and where cloud.js was already reaching for it
// through this module, which was the wrong way round. Re-exported so
// nothing that imports it from here has to move.
export { dataUrlToBlob } from './photos.js';

/**
 * Save every photograph as an ordinary .jpg.
 *
 * A zip would be tidier, but building one needs a library this project
 * does not have, and a folder of plain JPEGs is the more useful result
 * anyway: it drops straight into a photo library, a print shop upload
 * or a backup drive with nothing to unpack.
 *
 * Browsers rate-limit rapid downloads, so they are spaced out, and the
 * File System Access API is used where it exists to write a whole
 * folder in one go instead of a hundred separate downloads.
 */
export async function exportPhotoFiles(owner, nameFor, onProgress) {
  const photos = await allPhotos(owner);
  if (!photos.length) return { saved: 0, total: 0, method: 'none' };

  if (window.showDirectoryPicker) {
    try {
      const dir = await window.showDirectoryPicker({ mode: 'readwrite', id: 'braw-photos' });
      let saved = 0;
      for (const p of photos) {
        const handle = await dir.getFileHandle(nameFor(p), { create: true });
        const writable = await handle.createWritable();
        await writable.write(photoBlob(p, 'full'));
        await writable.close();
        saved++;
        onProgress?.(saved, photos.length);
      }
      return { saved, total: photos.length, method: 'folder' };
    } catch (err) {
      // A cancelled folder picker means "not that way", not "not at
      // all" — fall through to plain downloads. Anything else is a real
      // failure worth surfacing.
      if (err?.name !== 'AbortError' && err?.name !== 'NotAllowedError') throw err;
      if (err?.name === 'AbortError') return { saved: 0, total: photos.length, method: 'cancelled' };
    }
  }

  let saved = 0;
  for (const p of photos) {
    const url = URL.createObjectURL(photoBlob(p, 'full'));
    const a = document.createElement('a');
    a.href = url;
    a.download = nameFor(p);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    saved++;
    onProgress?.(saved, photos.length);
    await new Promise(r => setTimeout(r, 250));
  }
  return { saved, total: photos.length, method: 'downloads' };
}

/** Human-readable byte count, in the active locale's number format. */
export function formatBytes(n, fmt = x => String(x)) {
  if (!n) return '0 MB';
  const mb = n / (1024 * 1024);
  if (mb < 0.1) return '<0.1 MB';
  if (mb < 1000) return `${fmt(Math.round(mb * 10) / 10)} MB`;
  return `${fmt(Math.round((mb / 1024) * 10) / 10)} GB`;
}
