// ============================================================
// Webfonts, attached after the app has painted.
//
// These three families used to arrive two ways at once: an @import at the
// top of style.css and a <link> in the head. The @import is fully
// render-blocking, so on a network that cannot reach Google nothing in
// the stylesheet applied until the request gave up — 12.7 s of blank
// screen, measured. Marking the <link> media="print" did not help either;
// Chromium still holds module scripts for a pending stylesheet.
//
// So the request is made from here, after first paint, where a slow or
// blocked response costs nothing but a late swap to the real faces.
//
// This is a speed fix, not a privacy fix: the request still discloses the
// visitor's IP to a third party. Self-hosting the three families is the
// outstanding job.
// ============================================================

const HREF = 'https://fonts.googleapis.com/css2' +
  '?family=Cormorant+Garant:ital,wght@0,400;0,600;0,700;1,400;1,600' +
  '&family=Outfit:wght@300;400;500;600;700' +
  '&family=IBM+Plex+Mono:wght@400;500;600&display=swap';

export function loadFonts() {
  if (document.getElementById('braw-fonts')) return;
  const link = document.createElement('link');
  link.id = 'braw-fonts';
  link.rel = 'stylesheet';
  link.href = HREF;
  document.head.appendChild(link);
}
