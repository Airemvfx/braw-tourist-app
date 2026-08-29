// ============================================================
// BRAW — loading images at scale.
//
// The app grew up text-led: two <img> tags, one hand-rolled carousel,
// and photographs kept in IndexedDB as base64 data URLs. None of that
// survives contact with a grid of pictures, for three separate reasons.
//
//   1. loading="lazy" defers images in normal flow, but it has no
//      opinion about stacked or transformed ones — the carousel had to
//      hand-roll its own deferral for exactly this reason — and it
//      offers no hook for a fade-in or a fallback when a file is gone.
//
//   2. A phone painting a card 340px wide should not download a 1600px
//      photograph to do it. That needs srcset, which needs renditions,
//      which needs somewhere to say how they are named.
//
//   3. A data URL cannot be cached by the browser, inflates the bytes
//      by about a third, and puts the entire image into the DOM as
//      text. One of those is fine. Forty in a grid is not.
//
// Object URLs solve (3) but leak if nobody revokes them. The app
// re-renders a whole view by replacing its innerHTML, which means the
// natural unit of cleanup is the view, not the image — so URLs are
// minted into a named scope and the scope is released just before the
// view that owns it is rebuilt.
// ============================================================

import { html } from './dom.js';

/**
 * Where destination photographs are served from.
 *
 * They live in the repository today, which is the cheapest thing that
 * works and keeps the app one static folder. If the library outgrows
 * that — git keeps every revision of every file for ever, and gh-pages
 * holds a second copy — this constant is the only thing that has to
 * change to move them to a bucket or a CDN.
 */
export const IMAGE_BASE = '';

/** Rendition widths built by tools/fetch_commons.py. Keep in step with it. */
export const WIDTHS = [400, 800, 1600];

/** Longest edge we ever ship for a destination photograph. */
export const MAX_EDGE = 1600;

// ---------------------------------------------------------------- URLs

/** Absolute-ish URL for a library image path. */
export function imageUrl(path) {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  return IMAGE_BASE + path;
}

/**
 * A srcset for a library image.
 *
 * The convention is a `-400`/`-800`/`-1600` suffix before the
 * extension, which is what the fetch tool writes. An image that has no
 * renditions — the owner's own photographs, say — passes through as a
 * plain src and simply does not get a srcset.
 */
export function srcsetFor(path, widths = WIDTHS) {
  if (!path || /^(data:|blob:)/.test(path)) return '';
  const dot = path.lastIndexOf('.');
  if (dot < 0) return '';
  const stem = path.slice(0, dot), ext = path.slice(dot);
  return widths.map(w => `${imageUrl(`${stem}-${w}${ext}`)} ${w}w`).join(', ');
}

// ------------------------------------------------------- object URLs

const scopes = new Map();   // scope name -> Set of object URLs

/**
 * Mint an object URL that will be revoked when its scope is released.
 * Anything that is already a string (a data URL from an older record,
 * say) is handed straight back, so callers do not have to care which
 * form a photograph happens to be stored in.
 */
export function scopedUrl(scope, blobOrUrl) {
  if (!blobOrUrl) return '';
  if (typeof blobOrUrl === 'string') return blobOrUrl;
  const url = URL.createObjectURL(blobOrUrl);
  if (!scopes.has(scope)) scopes.set(scope, new Set());
  scopes.get(scope).add(url);
  return url;
}

/**
 * Revoke every URL minted into a scope. Call this immediately before
 * rebuilding the view that owns it — after the innerHTML is replaced
 * the old <img> elements are gone, so nothing is left pointing at them.
 */
export function releaseScope(scope) {
  const set = scopes.get(scope);
  if (!set) return 0;
  for (const url of set) URL.revokeObjectURL(url);
  const n = set.size;
  scopes.delete(scope);
  return n;
}

/** Every scope. Used on sign-out, where the whole app is torn down. */
export function releaseAll() {
  let n = 0;
  for (const scope of [...scopes.keys()]) n += releaseScope(scope);
  return n;
}

/** How many URLs a scope is holding. Exposed for the tests. */
export const scopeSize = scope => scopes.get(scope)?.size || 0;

// ---------------------------------------------------------- lazy load

let observer = null;

function ensureObserver() {
  if (observer || typeof IntersectionObserver === 'undefined') return observer;
  observer = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      observer.unobserve(e.target);
      hydrate(e.target);
    }
  }, {
    // Start the download before the image is on screen, so a scroll
    // meets a picture rather than a gap that fills in afterwards.
    rootMargin: '300px 0px',
    threshold: 0,
  });
  return observer;
}

/**
 * Give one image its real source.
 *
 * `is-loaded` and `is-failed` are the hooks the stylesheet uses: the
 * first fades the picture in, the second leaves the placeholder in
 * place. A missing file has to look deliberate — a broken-image icon
 * in a grid of photographs reads as a bug even when the cause is that
 * nobody has taken that picture yet.
 */
export function hydrate(img) {
  if (!img || img.dataset.mediaState) return;
  img.dataset.mediaState = 'loading';
  const { src, srcset, sizes } = img.dataset;
  img.addEventListener('load', () => {
    img.dataset.mediaState = 'loaded';
    img.classList.add('is-loaded');
  }, { once: true });
  img.addEventListener('error', () => markFailed(img), { once: true });
  if (sizes) img.sizes = sizes;
  if (srcset) img.srcset = srcset;
  if (src) img.src = src;
}

/**
 * Watch every not-yet-loaded image inside a freshly rendered subtree.
 *
 * Called after each innerHTML replacement, in the same place the view
 * re-attaches its listeners. Where there is no IntersectionObserver
 * every image simply loads at once, which is what the app did before.
 */
export function mountLazy(root = document) {
  const imgs = root.querySelectorAll('img[data-src], img[data-srcset]');
  const io = ensureObserver();
  for (const img of imgs) {
    if (img.dataset.mediaState) continue;
    if (io) io.observe(img); else hydrate(img);
  }
  // Eager images are already fetching, so there is nothing to defer —
  // but they can still 404, and a broken-image icon in a grid of
  // photographs reads as a bug. Give them the same failure handling.
  for (const img of root.querySelectorAll('img.media-img:not([data-src])')) {
    if (img.dataset.mediaState) continue;
    img.dataset.mediaState = 'eager';
    if (img.complete && img.naturalWidth === 0) markFailed(img);
    else img.addEventListener('error', () => markFailed(img), { once: true });
  }
  return imgs.length;
}

function markFailed(img) {
  img.dataset.mediaState = 'failed';
  img.classList.add('is-failed');
  img.classList.remove('is-loaded');
  img.removeAttribute('src');
  img.removeAttribute('srcset');
  img.closest('.media')?.classList.add('is-empty');
}

/**
 * One picture, ready for a `.media` box.
 *
 * The box, its aspect ratio and its scrim belong to the stylesheet; this
 * is only the <img>. Escaping goes through dom.js rather than a second
 * copy here — the first version of this function had its own, and it
 * quietly disagreed about `>`, which is exactly how two escapers drift
 * until one of them is wrong somewhere that matters.
 *
 * `alt` is a required argument rather than an option. An image-led app
 * that ships undescribed photographs is unusable with a screen reader,
 * and a mandatory argument is the cheapest way to keep noticing that.
 *
 * `eager` is for pictures that are on screen at first paint — a hero, or
 * the cover of a card just opened. Deferring those costs a visible flash
 * and buys nothing.
 */
export function imgHTML(path, alt, { sizes = '', eager = false, cls = '', widths = null } = {}) {
  const url = imageUrl(path);
  // No srcset unless the caller says which renditions actually exist.
  // Assuming them is worse than not having them: the browser would pick
  // a width, fetch a file nobody built, and show the failed placeholder
  // for a picture that is sitting right there.
  const set = widths && widths.length ? srcsetFor(path, widths) : '';
  const klass = ('media-img ' + cls).trim();
  const text = alt ?? '';
  // An eager image is painted as soon as the browser has it, so it is
  // marked loaded in the markup. Without this it sits at opacity 0 for
  // ever: the fade-in waits for a load event that hydrate() would have
  // attached, and hydrate() only ever runs for lazy images. That failure
  // is invisible in the DOM — right src, right size, right classes — and
  // shows up only as a card that renders as an empty box.
  const eagerClass = (klass + ' is-loaded').trim();
  return eager
    ? html`<img class="${eagerClass}" alt="${text}" decoding="async"${
        sizes ? html` sizes="${sizes}"` : ''} src="${url}"${
        set ? html` srcset="${set}"` : ''}>`
    : html`<img class="${klass}" alt="${text}" decoding="async"${
        sizes ? html` data-sizes="${sizes}"` : ''} data-src="${url}"${
        set ? html` data-srcset="${set}"` : ''}>`;
}
