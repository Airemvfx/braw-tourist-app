// ============================================================
// BRAW — original Scottish hill photography.
//
// Drop-in system for the owner's own photos. It reads images/manifest.json
// and, when that file lists any images, adds two things:
//
//   1. a soft full-bleed backdrop behind the app, and
//   2. a cross-fading carousel on the landing page.
//
// When the manifest is missing or empty — which is the case until the
// photos are added — every function here is a no-op and the app looks
// exactly as it does now. Nothing 404s and nothing shifts.
//
// To add photos: put the files in images/ and list them in
// images/manifest.json. See that file for the expected shape.
// ============================================================

import { getLang } from './i18n.js';

const MANIFEST = 'images/manifest.json';
const SLIDE_MS = 5200;

let photos = [];
let timer = null;
let slide = 0;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resolve a caption that may be a plain string or {en, pl}. */
export function captionOf(photo) {
  const c = photo.caption;
  if (!c) return '';
  return typeof c === 'string' ? c : (c[getLang()] || c.en || '');
}

/** True once the browser can actually decode this URL. */
function loads(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * Load the manifest, keeping only entries whose file actually loads.
 *
 * The verification matters: the manifest can list photos before the files
 * are committed, or carry a typo, and a broken <img> on the landing page
 * is worse than no carousel at all. Resolves to [] on any failure — a
 * missing manifest is the normal state before photos are added, not an
 * error worth surfacing.
 */
export async function loadPhotos() {
  try {
    const res = await fetch(MANIFEST, { cache: 'no-cache' });
    if (!res.ok) return (photos = []);
    const data = await res.json();
    const list = (Array.isArray(data) ? data : data.images) || [];
    const candidates = list.filter(p => p && p.src);
    const ok = await Promise.all(candidates.map(p => loads(encodeURI(p.src))));
    photos = candidates.filter((_, i) => ok[i]);
  } catch {
    photos = [];
  }
  return photos;
}

export const hasPhotos = () => photos.length > 0;

/** Faint full-bleed backdrop. Does nothing when there are no photos. */
export function mountBackdrop(el) {
  if (!el || !photos.length) return;
  el.innerHTML = `<div class="ph-bg-img" style="background-image:url('${encodeURI(photos[0].src)}')"></div>`;
  el.hidden = false;
}

/** Cross-fading carousel for the landing page. */
export function mountCarousel(el) {
  if (!el || !photos.length) return;
  el.innerHTML = `
    <div class="ph-track">
      ${photos.map((p, i) => `
        <figure class="ph-slide ${i === 0 ? 'is-on' : ''}">
          <img src="${encodeURI(p.src)}" alt="${(p.alt || '').replace(/"/g, '&quot;')}"
               loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async">
          ${captionOf(p) ? `<figcaption>${captionOf(p).replace(/</g, '&lt;')}</figcaption>` : ''}
        </figure>`).join('')}
    </div>
    <div class="ph-dots" role="tablist">
      ${photos.map((_, i) => `<button type="button" class="ph-dot ${i === 0 ? 'is-on' : ''}" data-slide="${i}"
        aria-label="${i + 1} / ${photos.length}"></button>`).join('')}
    </div>`;
  el.hidden = false;

  el.querySelectorAll('[data-slide]').forEach(d =>
    d.addEventListener('click', () => { show(el, Number(d.dataset.slide)); restart(el); }));

  if (photos.length > 1 && !reduceMotion()) restart(el);
}

function show(el, i) {
  slide = (i + photos.length) % photos.length;
  el.querySelectorAll('.ph-slide').forEach((s, n) => s.classList.toggle('is-on', n === slide));
  el.querySelectorAll('.ph-dot').forEach((d, n) => d.classList.toggle('is-on', n === slide));
}

function restart(el) {
  stopCarousel();
  timer = setInterval(() => {
    if (document.hidden) return;   // no point animating an unseen tab
    show(el, slide + 1);
  }, SLIDE_MS);
}

export function stopCarousel() {
  if (timer) { clearInterval(timer); timer = null; }
}
