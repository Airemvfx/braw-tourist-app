// ============================================================
// BRAW — light / dark theme.
//
// The palette lives entirely in CSS custom properties, so switching is
// one attribute on <html>; nothing needs re-rendering. Three settings:
// explicit light, explicit dark, or follow the device.
// ============================================================

const KEY = 'braw_theme_v1';
const MODES = ['dark', 'light', 'auto'];

const media = window.matchMedia('(prefers-color-scheme: light)');
const listeners = new Set();

let mode = (() => {
  const saved = localStorage.getItem(KEY);
  return MODES.includes(saved) ? saved : 'dark';
})();

/** The theme actually painted, after resolving "auto". */
export function resolved() {
  return mode === 'auto' ? (media.matches ? 'light' : 'dark') : mode;
}

export function getMode() { return mode; }

function paint() {
  const theme = resolved();
  document.documentElement.dataset.theme = theme;
  // Keep the browser chrome (address bar, task switcher) in step.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'light' ? '#f2eee5' : '#0e1520';
  listeners.forEach(fn => fn(theme, mode));
}

export function setMode(next) {
  if (!MODES.includes(next)) return;
  mode = next;
  localStorage.setItem(KEY, next);
  paint();
}

export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function initTheme() {
  paint();
  // Only meaningful in "auto", but harmless to always listen.
  media.addEventListener('change', () => { if (mode === 'auto') paint(); });
}
