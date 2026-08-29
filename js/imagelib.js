// ============================================================
// BRAW — the destination picture library.
//
// One photograph per location, so the app has something to look at
// before anyone has taken a picture of their own. Separate from
// js/photos.js (the user's own photographs, in IndexedDB) and from
// js/photos-hero.js (the owner's, on the landing page): different
// provenance, different licence, different lifetime.
//
// These come from Wikimedia Commons, which is the only source that is
// at once place-accurate, permanently storable and usable in a paid
// product. The catch is that the licence varies file by file and most
// of them require credit, so a credit record is part of the schema
// rather than an afterthought — and renderCredit is not optional
// decoration. Shipping one of these pictures without its attribution
// is a licence breach, not an untidy corner.
//
// A location with no entry is the normal state, not an error: the
// library fills in over time and the interface has to look deliberate
// at every point along the way.
// ============================================================

import { imgHTML } from './media.js';
import { html, raw } from './dom.js';
import { getLang } from './i18n.js';

const MANIFEST = 'images/locations.json';

let library = null;      // id -> entry, once loaded
let loading = null;      // in-flight promise, so N cards cause one fetch

/**
 * Load the manifest once.
 *
 * Resolves to an empty library on any failure. A missing or malformed
 * manifest is the state the repository is in before the pictures are
 * gathered, and it must cost nothing but plainer cards.
 */
export function loadLibrary() {
  if (library) return Promise.resolve(library);
  if (loading) return loading;
  loading = fetch(MANIFEST, { cache: 'no-cache' })
    .then(r => (r.ok ? r.json() : null))
    .then(data => {
      const imgs = (data && data.images) || {};
      library = {};
      for (const [id, e] of Object.entries(imgs)) {
        // An entry without a file or without a complete credit is
        // dropped rather than shown. See the header.
        if (e && e.file && e.credit && e.credit.author && e.credit.licence) library[id] = e;
      }
      return library;
    })
    .catch(() => (library = {}));
  return loading;
}

export const isLoaded = () => library !== null;
export const librarySize = () => (library ? Object.keys(library).length : 0);

/**
 * Alt text in the reader's language.
 *
 * Kept in the manifest rather than js/i18n.js on purpose: 182 locations
 * in two languages is 364 strings, which would grow that file by half
 * and bury the ~630 interface keys the parity test exists to police.
 * The {en, pl} shape is the one images/manifest.json already uses for
 * captions, so this is the established convention, not a new one.
 *
 * Falls back to English, then to the location name, then to '' — an
 * empty alt on a decorative-by-accident image is better than a filename
 * read aloud.
 */
export function altOf(entry) {
  const a = entry && entry.alt;
  if (!a) return '';
  return typeof a === 'string' ? a : (a[getLang()] || a.en || '');
}

/** The entry for a location, or null. Safe before the manifest loads. */
export function imageFor(poiId) {
  return (library && library[poiId]) || null;
}

/** The first location in a list that actually has a picture. */
export function firstImage(poiIds = []) {
  for (const id of poiIds) {
    const e = imageFor(id);
    if (e) return { id, entry: e };
  }
  return null;
}

/**
 * The credit line a licence requires: who made it, and under what.
 *
 * Deliberately terse — it has to sit on a photograph without becoming
 * the photograph — but it names the author and the licence, and links
 * to both the file and the licence deed where those are known, which
 * is what CC BY and CC BY-SA actually ask for.
 */
export function creditHTML(entry) {
  if (!entry || !entry.credit) return html``;
  const c = entry.credit;
  const who = c.source
    ? html`<a href="${c.source}" target="_blank" rel="noopener noreferrer">${c.author}</a>`
    : html`${c.author}`;
  const lic = c.licenceUrl
    ? html`<a href="${c.licenceUrl}" target="_blank" rel="noopener noreferrer">${c.licence}</a>`
    : html`${c.licence}`;
  return html`<div class="media-credit">${who} · ${lic}</div>`;
}

/**
 * A complete media box for a location.
 *
 * Returns '' when there is no picture, so a caller can fall back to
 * whatever it showed before rather than rendering an empty frame.
 */
export function coverHTML(poiId, { ratio = '', sizes = '', eager = false, caption = '' } = {}) {
  const e = imageFor(poiId);
  if (!e) return html``;
  return html`<div class="media ${ratio}">${
    imgHTML(e.file, altOf(e), { sizes, eager, widths: e.widths })}${
    caption ? html`<div class="media-scrim"></div>${raw(String(caption))}` : ''}${
    creditHTML(e)}</div>`;
}
