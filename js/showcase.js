// ============================================================
// BRAW — landing showcase.
//
// A looping preview of the real product: the same Scotland map the app
// uses, drawn by the same renderMap() from scotland-map.js, with a
// curated Highland route and captions cycling through what the app does.
//
// Deliberately NOT a rendered video. renderMap is already loaded for the
// trip view, so reusing it costs no extra bytes, stays sharp at any
// density, follows the language switch, and needs no autoplay
// permission — all of which a baked video would give up.
// ============================================================

import { START_CITIES } from './data.js';
import { getPlace } from './places.js';
import { renderMap } from './scotland-map.js';
import { t } from './i18n.js';

// A recognisable sweep of Scotland: capital, central belt, the west
// coast, Skye, the Great Glen and back through the Cairngorms.
const ROUTE = [
  'edinburgh-castle',
  'stirling-castle',
  'loch-lomond',
  'glencoe',
  'eilean-donan',
  'old-man-storr',
  'urquhart-loch-ness',
  'cairngorms-aviemore',
];

const CAPTION_KEYS = ['showcase.cap1', 'showcase.cap2', 'showcase.cap3', 'showcase.cap4'];
const CAPTION_MS = 2600;

let timer = null;
let index = 0;

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Markup for the preview. Pins are "visited" up to `progress` so the
 *  route reads as a trip in flight rather than an empty plan. */
export function renderShowcase(progress = 5) {
  const stops = ROUTE
    .map((id, i) => ({ poi: getPlace(id), visited: i < progress, order: i + 1 }))
    .filter(s => s.poi);
  return renderMap(stops, START_CITIES.edinburgh, null, { idSuffix: 'sc' });
}

function paint(el) {
  el.textContent = t(CAPTION_KEYS[index]);
  el.classList.remove('is-in');
  // force a reflow so the transition restarts on every caption
  void el.offsetWidth;
  el.classList.add('is-in');
}

/**
 * Start the caption loop. Cheap to call repeatedly — it clears any
 * previous timer first, which matters because the language switch
 * re-renders the auth screen.
 */
export function startShowcase(captionEl) {
  stopShowcase();
  if (!captionEl) return;
  index = 0;
  paint(captionEl);
  if (reduceMotion()) return;    // show one caption, never cycle

  timer = setInterval(() => {
    // Nothing to animate while the tab is in the background, and phones
    // throttle it anyway; skipping keeps the loop in step on return.
    if (document.hidden) return;
    index = (index + 1) % CAPTION_KEYS.length;
    paint(captionEl);
  }, CAPTION_MS);
}

export function stopShowcase() {
  if (timer) { clearInterval(timer); timer = null; }
}
