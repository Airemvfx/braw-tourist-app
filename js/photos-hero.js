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

const MANIFEST = 'images/manifest.json';
const SLIDE_MS = 5200;

let photos = [];
let timer = null;
let slide = 0;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Load the manifest. Resolves to [] on any failure — a missing file is
 * the normal state before photos are added, not an error worth surfacing.
 */
export async function loadPhotos() {
  try {
    const res = await fetch(MANIFEST, { cache: 'no-cache' });
    if (!res.ok) return (photos = []);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.images;
    photos = (list || []).filter(p => p && p.src);
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
          ${p.caption ? `<figcaption>${p.caption.replace(/</g, '&lt;')}</figcaption>` : ''}
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
