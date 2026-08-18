// ============================================================
// BRAW — landing hero artwork.
//
// A layered Highland glen rendered entirely as inline SVG: no image
// or video files, nothing fetched over the network, and crisp at any
// density. Follows the same pattern as scotland-map.js — the module
// returns markup and the caller decides where to put it.
//
// The scene is purely decorative. Every word on the landing panel is
// real translated DOM text layered above it, so nothing here needs to
// change when the language does.
//
// viewBox is 1440x1000 and the scene is centre-weighted: narrow
// viewports slice to the middle column, which carries the whole
// composition (moon, glen throat, castle islet, shoreline stones).
// ============================================================

/**
 * @param {string} suffix  Namespace for this instance's ids. Two copies of
 *   the scene on one page would otherwise share ids, and every gradient
 *   and clip reference would resolve to whichever copy parsed first.
 */
export function renderHero(suffix = '') {
  const svg = `<svg class="art" aria-hidden="true" focusable="false" viewBox="0 0 1440 1000" preserveAspectRatio="xMidYMid slice"
       xmlns="http://www.w3.org/2000/svg" role="img"
       aria-label="A layered low-poly illustration of a Scottish glen at night: seven ranks of mountain ridges receding into mist, a low moon rising behind the furthest ridge, a still loch, and a small castle on an island for scale.">

    <defs>
      <!-- sky: bg -> surface -> surface-2 -> surface-3 -->
      <linearGradient id="bh-skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#0e1520"/>
        <stop offset="58%"  stop-color="#14202e"/>
        <stop offset="80%"  stop-color="#192840"/>
        <stop offset="100%" stop-color="#1e2f4a"/>
      </linearGradient>

      <!-- warm horizon bloom, centred on the moon -->
      <radialGradient id="bh-glowG" cx="0.536" cy="0.50" r="0.52">
        <stop offset="0%"   stop-color="#d9b84a" stop-opacity="0.26"/>
        <stop offset="26%"  stop-color="#dba860" stop-opacity="0.17"/>
        <stop offset="55%"  stop-color="#c98a40" stop-opacity="0.085"/>
        <stop offset="100%" stop-color="#c98a40" stop-opacity="0"/>
      </radialGradient>

      <!-- cool northern wash, top-left -->
      <radialGradient id="bh-sageG" cx="0.22" cy="0.06" r="0.55">
        <stop offset="0%"   stop-color="#4f9e7a" stop-opacity="0.11"/>
        <stop offset="60%"  stop-color="#4f9e7a" stop-opacity="0.035"/>
        <stop offset="100%" stop-color="#4f9e7a" stop-opacity="0"/>
      </radialGradient>

      <radialGradient id="bh-moonG" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%"   stop-color="#e8e2d8" stop-opacity="0.30"/>
        <stop offset="32%"  stop-color="#dba860" stop-opacity="0.15"/>
        <stop offset="64%"  stop-color="#c98a40" stop-opacity="0.05"/>
        <stop offset="100%" stop-color="#c98a40" stop-opacity="0"/>
      </radialGradient>

      <!-- mist, cool and warm -->
      <radialGradient id="bh-mistCool" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%"   stop-color="#e8e2d8" stop-opacity="0.30"/>
        <stop offset="48%"  stop-color="#e8e2d8" stop-opacity="0.13"/>
        <stop offset="100%" stop-color="#e8e2d8" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="bh-mistWarm" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0%"   stop-color="#dba860" stop-opacity="0.26"/>
        <stop offset="48%"  stop-color="#dba860" stop-opacity="0.11"/>
        <stop offset="100%" stop-color="#dba860" stop-opacity="0"/>
      </radialGradient>

      <!-- aurora curtain -->
      <linearGradient id="bh-auroraG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#4f9e7a" stop-opacity="0"/>
        <stop offset="16%"  stop-color="#4f9e7a" stop-opacity="0.55"/>
        <stop offset="52%"  stop-color="#4f9e7a" stop-opacity="0.26"/>
        <stop offset="100%" stop-color="#4f9e7a" stop-opacity="0"/>
      </linearGradient>

      <!-- loch: luminous at the far shore, sinking toward the viewer -->
      <linearGradient id="bh-lochG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#1e2f4a"/>
        <stop offset="16%"  stop-color="#192840"/>
        <stop offset="50%"  stop-color="#14202e"/>
        <stop offset="100%" stop-color="#14202e"/>
      </linearGradient>
      <linearGradient id="bh-lochWarm" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#dba860" stop-opacity="0.18"/>
        <stop offset="45%"  stop-color="#c98a40" stop-opacity="0.06"/>
        <stop offset="100%" stop-color="#c98a40" stop-opacity="0"/>
      </linearGradient>
      <!-- The reflected mountain mass. Declared in the MIRRORED user space of
           the reflection group, so y=800 is the waterline and y=600 is the
           bottom of the frame. It stays off the luminous shoreline band, peaks
           mid-water, then dissolves. -->
      <linearGradient id="bh-reflG" gradientUnits="userSpaceOnUse" x1="0" y1="800" x2="0" y2="600">
        <stop offset="0%"   stop-color="#0e1520" stop-opacity="0.05"/>
        <stop offset="24%"  stop-color="#0e1520" stop-opacity="0.22"/>
        <stop offset="52%"  stop-color="#0e1520" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="#0e1520" stop-opacity="0.06"/>
      </linearGradient>
      <!-- grazing sheen on the near water, so the black shore reads against it -->
      <linearGradient id="bh-lochSheen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#192840" stop-opacity="0"/>
        <stop offset="55%"  stop-color="#1e2f4a" stop-opacity="0.45"/>
        <stop offset="100%" stop-color="#1e2f4a" stop-opacity="0.85"/>
      </linearGradient>

      <clipPath id="bh-lochClip"><rect x="-260" y="800" width="1960" height="200"/></clipPath>
      <clipPath id="bh-skyClip"><rect x="-260" y="-60" width="1960" height="860"/></clipPath>

      <!-- sky above ridge 1's crest (+6 units of slack for the parallax drift),
           so the moon disc is cut cleanly by the furthest ridge -->
      <clipPath id="bh-moonClip">
        <path d="M-260,526 L-60,504 L60,518 L150,484 L250,504 L338,446 L420,476
                 L520,464 L610,492 L700,472 L772,476 L840,458 L930,492 L1020,468
                 L1110,498 L1200,472 L1290,502 L1380,478 L1470,504 L1700,484
                 L1700,-60 L-260,-60 Z"/>
      </clipPath>

      <!-- weathered paper grain: rasterised once, never animated -->
      <filter id="bh-grainF" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" seed="17" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <pattern id="bh-grainP" width="180" height="180" patternUnits="userSpaceOnUse">
        <rect width="180" height="180" filter="url(#bh-grainF)"/>
      </pattern>

      <!-- reusable low-poly conifer, base at 0,0 -->
      <g id="bh-pine">
        <path d="M0,0 L-3.4,-1.6 L-2.2,-3.2 L-5.4,-8.2 L-3.2,-9 L-6.4,-14.6 L-3.9,-15.2
                 L-6.8,-20.4 L0,-28 L6.8,-20.4 L3.9,-15.2 L6.4,-14.6 L3.2,-9 L5.4,-8.2
                 L2.2,-3.2 L3.4,-1.6 Z"/>
      </g>

      <!-- the keep: tower, crenellated hall, low wing. Base at 0,0 -->
      <g id="bh-keep">
        <path d="M0,0 L0,-29 L3,-29 L3,-51 L7,-51 L7,-57 L11,-57 L11,-51 L16,-51 L16,-29
                 L22,-29 L22,-39 L26,-39 L26,-29 L39,-29 L39,-37 L43,-37 L43,-29 L47,-29
                 L47,-15 L61,-15 L61,-21 L65,-21 L65,0 Z"/>
      </g>
    </defs>

    <!-- ================= SKY ================= -->
    <rect x="-260" y="-60" width="1960" height="920" fill="url(#bh-skyG)"/>
    <rect x="-260" y="-60" width="1960" height="920" fill="url(#bh-sageG)"/>
    <rect x="-260" y="60"  width="1960" height="800" fill="url(#bh-glowG)"/>

    <!-- graticule: a nod to the app's map -->
    <g clip-path="url(#bh-skyClip)" stroke="#c98a40" stroke-opacity="0.055" stroke-width="1" fill="none">
      <path d="M180,-60 L180,800 M480,-60 L480,800 M780,-60 L780,800 M1080,-60 L1080,800 M1380,-60 L1380,800"/>
      <path d="M-260,150 L1700,150 M-260,320 L1700,320 M-260,490 L1700,490"/>
    </g>

    <!-- aurora curtains: kept off dead-centre so they never fight the headline -->
    <g class="aurora-a" opacity="0.16" clip-path="url(#bh-skyClip)">
      <path d="M118,40 L176,40 L152,384 L128,384 Z" fill="url(#bh-auroraG)"/>
      <path d="M196,26 L238,26 L214,352 L196,352 Z" fill="url(#bh-auroraG)"/>
      <path d="M268,52 L322,52 L292,396 L268,396 Z" fill="url(#bh-auroraG)"/>
      <path d="M356,34 L392,34 L370,340 L352,340 Z" fill="url(#bh-auroraG)"/>
      <path d="M492,58 L534,58 L514,368 L494,368 Z" fill="url(#bh-auroraG)"/>
      <path d="M556,44 L586,44 L572,330 L556,330 Z" fill="url(#bh-auroraG)"/>
    </g>
    <g class="aurora-b" opacity="0.13" clip-path="url(#bh-skyClip)">
      <path d="M878,54  L916,54  L900,352 L880,352 Z" fill="url(#bh-auroraG)"/>
      <path d="M934,38  L972,38  L958,330 L936,330 Z" fill="url(#bh-auroraG)"/>
      <path d="M1042,48 L1092,48 L1074,372 L1050,372 Z" fill="url(#bh-auroraG)"/>
      <path d="M1128,30 L1166,30 L1152,340 L1130,340 Z" fill="url(#bh-auroraG)"/>
      <path d="M1214,60 L1268,60 L1244,392 L1218,392 Z" fill="url(#bh-auroraG)"/>
      <path d="M1310,40 L1348,40 L1334,352 L1312,352 Z" fill="url(#bh-auroraG)"/>
    </g>

    <!-- stars -->
    <g fill="#e8e2d8" clip-path="url(#bh-skyClip)">
      <g class="stars-a" opacity="0.6">
        <circle cx="70"   cy="90"  r="1.3"/> <circle cx="185"  cy="52"  r="1.0"/>
        <circle cx="300"  cy="140" r="1.5"/> <circle cx="415"  cy="74"  r="1.1"/>
        <circle cx="528"  cy="122" r="1.2"/> <circle cx="650"  cy="60"  r="1.4"/>
        <circle cx="762"  cy="110" r="1.1"/> <circle cx="880"  cy="68"  r="1.5"/>
        <circle cx="995"  cy="135" r="1.2"/> <circle cx="1112" cy="84"  r="1.0"/>
        <circle cx="1240" cy="130" r="1.35"/><circle cx="1360" cy="66"  r="1.1"/>
        <circle cx="1470" cy="112" r="1.2"/>
      </g>
      <g class="stars-b" opacity="0.5">
        <circle cx="120"  cy="200" r="1.15"/><circle cx="240"  cy="255" r="0.95"/>
        <circle cx="365"  cy="190" r="1.4"/> <circle cx="490"  cy="240" r="1.5"/>
        <circle cx="610"  cy="180" r="1.0"/> <circle cx="730"  cy="232" r="1.2"/>
        <circle cx="855"  cy="196" r="1.05"/><circle cx="975"  cy="250" r="1.3"/>
        <circle cx="1090" cy="188" r="1.5"/> <circle cx="1215" cy="238" r="1.0"/>
        <circle cx="1330" cy="200" r="1.2"/> <circle cx="1440" cy="255" r="1.1"/>
      </g>
      <g class="stars-c" opacity="0.32">
        <circle cx="60"   cy="330" r="0.9"/> <circle cx="180"  cy="375" r="1.0"/>
        <circle cx="295"  cy="310" r="0.85"/><circle cx="410"  cy="360" r="1.05"/>
        <circle cx="530"  cy="320" r="0.9"/> <circle cx="645"  cy="370" r="0.8"/>
        <circle cx="760"  cy="315" r="1.0"/> <circle cx="875"  cy="358" r="0.85"/>
        <circle cx="990"  cy="325" r="0.95"/><circle cx="1105" cy="368" r="0.8"/>
        <circle cx="1225" cy="318" r="1.0"/> <circle cx="1345" cy="360" r="0.9"/>
        <circle cx="1455" cy="330" r="0.85"/>
      </g>
    </g>
    <!-- four brighter stars, hand-drawn glints -->
    <g class="glints" fill="none" stroke="#d9b84a" stroke-opacity="0.4" stroke-width="0.9"
       stroke-linecap="round" clip-path="url(#bh-skyClip)">
      <path d="M300,131  L300,149  M291,140  L309,140"/>
      <path d="M880,58   L880,78   M870,68   L890,68"/>
      <path d="M490,231  L490,249  M481,240  L499,240"/>
      <path d="M1090,178 L1090,198 M1080,188 L1100,188"/>
    </g>

    <!-- a skein of geese, high and slow -->
    <g class="skein" fill="none" stroke="#e8e2d8" stroke-opacity="0.5" stroke-width="1.5"
       stroke-linecap="round" stroke-linejoin="round" opacity="0.55">
      <path d="M300,352 l6,-4 l6,4"/>
      <path d="M322,344 l5.5,-3.6 l5.5,3.6"/>
      <path d="M344,357 l5,-3.4 l5,3.4"/>
      <path d="M364,347 l4.6,-3 l4.6,3"/>
      <path d="M386,361 l4.2,-2.8 l4.2,2.8"/>
    </g>

    <!-- ================= MOON ================= -->
    <g class="moon-halo">
      <circle cx="772" cy="478" r="182" fill="url(#bh-moonG)"/>
    </g>
    <g clip-path="url(#bh-moonClip)">
      <circle cx="772" cy="478" r="46" fill="#e8e2d8" opacity="0.92"/>
      <g fill="#8a9285" opacity="0.22">
        <path d="M754,452 L766,446 L774,454 L764,462 Z"/>
        <path d="M784,444 L794,440 L797,450 L785,454 Z"/>
        <path d="M758,468 L770,464 L772,473 L760,474 Z"/>
      </g>
      <circle cx="772" cy="478" r="46" fill="none" stroke="#dba860" stroke-opacity="0.3" stroke-width="1"/>
    </g>

    <!-- cartographic region labels, in the app's mono voice -->
    <text x="34" y="452" fill="#e8e2d8" fill-opacity="0.13"
          font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="13"
          letter-spacing="7" transform="rotate(-7 34 452)">NORTH WEST HIGHLANDS</text>
    <text x="1150" y="466" fill="#e8e2d8" fill-opacity="0.11"
          font-family="'IBM Plex Mono', ui-monospace, monospace" font-size="13"
          letter-spacing="7" transform="rotate(6 1150 466)">THE GREAT GLEN</text>

    <!-- ========== RIDGE 1 — furthest, hazy, half-dissolved in the sky ========== -->
    <g class="ridge-1">
      <path d="M-260,800 L-260,526 L-60,504 L60,518 L150,484 L250,504 L338,446 L420,476
               L520,464 L610,492 L700,472 L772,476 L840,458 L930,492 L1020,468 L1110,498
               L1200,472 L1290,502 L1380,478 L1470,504 L1700,484 L1700,800 Z"
            fill="#1e2f4a" opacity="0.5" transform="translate(0,-6)"/>
      <path d="M-260,520 L-60,498 L60,512 L150,478 L250,498 L338,440 L420,470 L520,458
               L610,486 L700,466 L772,470 L840,452 L930,486 L1020,462 L1110,492
               L1200,466 L1290,496 L1380,472 L1470,498 L1700,478"
            fill="none" stroke="#dba860" stroke-opacity="0.1" stroke-width="1"/>
    </g>

    <g class="mist-1" opacity="0.9">
      <ellipse cx="420"  cy="516" rx="470" ry="26" fill="url(#bh-mistWarm)"/>
      <ellipse cx="1080" cy="524" rx="420" ry="22" fill="url(#bh-mistCool)"/>
    </g>

    <!-- ========== RIDGE 2 — a Torridon plateau and a deep notch ========== -->
    <g class="ridge-2">
      <path d="M-260,820 L-260,552 L-70,530 L30,548 L120,506 L205,522 L300,480 L376,472
               L448,502 L540,532 L612,514 L700,542 L772,528 L836,550 L910,508 L988,530
               L1078,494 L1160,518 L1250,542 L1346,512 L1440,538 L1540,518 L1700,542 L1700,820 Z"
            fill="#1e2f4a" opacity="0.78"/>
      <path d="M-260,552 L-70,530 L30,548 L120,506 L205,522 L300,480 L376,472 L448,502
               L540,532 L612,514 L700,542 L772,528 L836,550 L910,508 L988,530 L1078,494
               L1160,518 L1250,542 L1346,512 L1440,538 L1540,518 L1700,542"
            fill="none" stroke="#dba860" stroke-opacity="0.14" stroke-width="1"/>
    </g>

    <g class="mist-2" opacity="0.9">
      <ellipse cx="760" cy="578" rx="560" ry="27" fill="url(#bh-mistWarm)"/>
      <ellipse cx="180" cy="566" rx="330" ry="20" fill="url(#bh-mistCool)"/>
    </g>

    <!-- ========== RIDGE 3 — the glen opens: a broad basin toward centre ========== -->
    <g class="ridge-3">
      <path d="M-260,860 L-260,606 L-80,568 L20,594 L110,548 L190,576 L275,542 L360,570
               L448,598 L530,616 L610,634 L690,642 L772,628 L850,602 L930,574 L1015,598
               L1100,556 L1186,586 L1276,552 L1370,584 L1470,560 L1700,590 L1700,860 Z"
            fill="#192840" opacity="0.95"/>
      <path d="M-260,606 L-80,568 L20,594 L110,548 L190,576 L275,542 L360,570 L448,598
               L530,616 L610,634 L690,642 L772,628 L850,602 L930,574 L1015,598 L1100,556
               L1186,586 L1276,552 L1370,584 L1470,560 L1700,590"
            fill="none" stroke="#dba860" stroke-opacity="0.17" stroke-width="1.1"/>
    </g>

    <g class="mist-3" opacity="0.85">
      <ellipse cx="700"  cy="656" rx="440" ry="24" fill="url(#bh-mistWarm)"/>
      <ellipse cx="1180" cy="632" rx="360" ry="19" fill="url(#bh-mistCool)"/>
    </g>

    <!-- ========== RIDGE 4 — flanking spurs closing the glen ========== -->
    <g class="ridge-4">
      <path d="M-260,900 L-260,666 L-90,630 L10,656 L100,614 L186,642 L270,670 L350,692
               L430,708 L520,702 L600,718 L680,726 L766,720 L846,702 L926,678 L1006,652
               L1086,622 L1166,650 L1250,616 L1340,646 L1440,622 L1700,652 L1700,900 Z"
            fill="#14202e"/>
      <path d="M-260,666 L-90,630 L10,656 L100,614 L186,642 L270,670 L350,692 L430,708
               L520,702 L600,718 L680,726 L766,720 L846,702 L926,678 L1006,652 L1086,622
               L1166,650 L1250,616 L1340,646 L1440,622 L1700,652"
            fill="none" stroke="#dba860" stroke-opacity="0.16" stroke-width="1.1"/>
    </g>

    <g class="mist-4" opacity="0.95">
      <ellipse cx="640"  cy="744" rx="520" ry="22" fill="url(#bh-mistCool)"/>
      <ellipse cx="1140" cy="726" rx="380" ry="17" fill="url(#bh-mistWarm)"/>
    </g>

    <!-- ========== RIDGE 5 — the near slopes, with stands of pine ========== -->
    <g class="ridge-5">
      <path d="M-260,930 L-260,732 L-80,704 L20,728 L120,752 L215,734 L300,758 L390,776
               L480,766 L570,780 L660,790 L750,784 L840,770 L930,750 L1015,728 L1100,706
               L1190,732 L1280,714 L1380,738 L1480,720 L1700,746 L1700,930 Z"
            fill="#0e1520" opacity="0.93"/>
      <path d="M-260,732 L-80,704 L20,728 L120,752 L215,734 L300,758 L390,776 L480,766
               L570,780 L660,790 L750,784 L840,770 L930,750 L1015,728 L1100,706 L1190,732
               L1280,714 L1380,738 L1480,720 L1700,746"
            fill="none" stroke="#dba860" stroke-opacity="0.13" stroke-width="1"/>
      <g fill="#0e1520" opacity="0.93">
        <use href="#bh-pine" transform="translate(258,748)  scale(0.62)"/>
        <use href="#bh-pine" transform="translate(277,752)  scale(0.5)"/>
        <use href="#bh-pine" transform="translate(1148,719) scale(0.58)"/>
        <use href="#bh-pine" transform="translate(1167,723) scale(0.46)"/>
        <use href="#bh-pine" transform="translate(1130,723) scale(0.44)"/>
      </g>
    </g>

    <!-- ========== RIDGE 6 — the far shore ========== -->
    <g class="ridge-6">
      <path d="M-260,860 L-260,790 L-70,776 L30,792 L130,780 L230,796 L330,786 L430,798
               L520,792 L610,800 L700,794 L790,800 L880,788 L970,796 L1060,782 L1150,794
               L1250,780 L1350,792 L1450,782 L1700,794 L1700,860 Z"
            fill="#0e1520"/>
      <path d="M-260,790 L-70,776 L30,792 L130,780 L230,796 L330,786 L430,798 L520,792
               L610,800 L700,794 L790,800 L880,788 L970,796 L1060,782 L1150,794 L1250,780
               L1350,792 L1450,782 L1700,794"
            fill="none" stroke="#e8e2d8" stroke-opacity="0.1" stroke-width="1"/>
    </g>

    <!-- ================= THE LOCH ================= -->
    <rect x="-260" y="800" width="1960" height="200" fill="url(#bh-lochG)"/>
    <rect x="-260" y="800" width="1960" height="135" fill="url(#bh-lochWarm)"/>

    <!-- mirrored ridges: dark masses under bright water, dissolving with depth -->
    <g clip-path="url(#bh-lochClip)">
      <g class="reflection">
        <g transform="translate(0,1600) scale(1,-1)">
          <path d="M-260,732 L-80,704 L20,728 L120,752 L215,734 L300,758 L390,776 L480,766
                   L570,780 L660,790 L750,784 L840,770 L930,750 L1015,728 L1100,706 L1190,732
                   L1280,714 L1380,738 L1480,720 L1700,746 L1700,560 L-260,560 Z"
                fill="url(#bh-reflG)"/>
          <path d="M-260,666 L-90,630 L10,656 L100,614 L186,642 L270,670 L350,692 L430,708
                   L520,702 L600,718 L680,726 L766,720 L846,702 L926,678 L1006,652 L1086,622
                   L1166,650 L1250,616 L1340,646 L1440,622 L1700,652 L1700,470 L-260,470 Z"
                fill="url(#bh-reflG)" opacity="0.55"/>
        </g>
      </g>
    </g>

    <!-- grazing sheen on the near water -->
    <rect x="-260" y="872" width="1960" height="128" fill="url(#bh-lochSheen)"/>

    <!-- the moon's glitter path -->
    <g class="glitter" clip-path="url(#bh-lochClip)" fill="#e8e2d8">
      <g opacity="0.5">
        <rect x="756" y="806" width="32"  height="1.6" rx="0.8" opacity="0.55"/>
        <rect x="748" y="816" width="48"  height="1.8" rx="0.9" opacity="0.5"/>
        <rect x="757" y="826" width="30"  height="1.5" rx="0.75" opacity="0.42"/>
        <rect x="738" y="838" width="66"  height="2"   rx="1"    opacity="0.48"/>
        <rect x="752" y="850" width="40"  height="1.6" rx="0.8" opacity="0.36"/>
        <rect x="726" y="864" width="88"  height="2.2" rx="1.1" opacity="0.4"/>
        <rect x="748" y="878" width="52"  height="1.8" rx="0.9" opacity="0.28"/>
        <rect x="712" y="894" width="112" height="2.4" rx="1.2" opacity="0.3"/>
        <rect x="744" y="910" width="58"  height="1.8" rx="0.9" opacity="0.2"/>
        <rect x="700" y="926" width="132" height="2.4" rx="1.2" opacity="0.18"/>
      </g>
    </g>

    <!-- ripple hairlines -->
    <g class="ripples" clip-path="url(#bh-lochClip)" stroke="#e8e2d8" stroke-opacity="0.07"
       stroke-width="1" stroke-linecap="round" fill="none">
      <path d="M-60,818 L280,818   M360,822 L620,822  M880,816 L1180,816 M1250,824 L1520,824"/>
      <path d="M-100,844 L240,844  M320,850 L560,850  M900,846 L1220,846 M1300,852 L1560,852"/>
      <path d="M-40,878 L300,878   M380,884 L580,884  M940,880 L1260,880 M1330,886 L1600,886"/>
      <path d="M-120,916 L220,916  M300,922 L520,922  M960,918 L1240,918 M1320,924 L1580,924"/>
    </g>

    <!-- ============ THE CASTLE ISLET — the figure that gives it scale ============
         Placed so its right flank overlaps the moon's glitter path: the keep is
         read as a black cut-out against moving silver.                          -->
    <g>
      <!-- reflection, mirrored about the islet's waterline y=846 -->
      <g clip-path="url(#bh-lochClip)" opacity="0.32">
        <g transform="translate(0,1692) scale(1,-1)">
          <path d="M688,848 L712,838 L736,831 L762,828 L786,832 L804,840 L816,848 Z" fill="#0e1520"/>
          <g fill="#0e1520">
            <use href="#bh-keep" transform="translate(728,840) scale(0.62)"/>
            <use href="#bh-pine" transform="translate(700,842) scale(0.42)"/>
            <use href="#bh-pine" transform="translate(802,844) scale(0.36)"/>
          </g>
        </g>
      </g>

      <!-- the island -->
      <path d="M688,848 L712,838 L736,831 L762,828 L786,832 L804,840 L816,848 Z" fill="#0e1520"/>
      <path d="M688,848 L712,838 L736,831 L762,828 L786,832 L804,840 L816,848"
            fill="none" stroke="#dba860" stroke-opacity="0.2" stroke-width="0.9"/>
      <g fill="#0e1520">
        <use href="#bh-keep" transform="translate(728,840) scale(0.62)"/>
        <use href="#bh-pine" transform="translate(700,842) scale(0.42)"/>
        <use href="#bh-pine" transform="translate(802,844) scale(0.36)"/>
      </g>
      <!-- rim light down the keep's moonward edge -->
      <path d="M728,840 L728,822 M730,822 L730,808.5 M732.3,808.5 L732.3,805"
            fill="none" stroke="#dba860" stroke-opacity="0.36" stroke-width="0.9"/>
      <!-- the one lit window in the tower, and a fainter one in the hall -->
      <rect class="ember" x="732" y="814" width="2.2" height="3.2" fill="#d9b84a" opacity="0.9"/>
      <g opacity="0.55">
        <rect class="ember" x="747" y="828" width="2" height="2.8" fill="#c98a40"/>
      </g>
    </g>

    <!-- low mist crawling over the water, in front of the islet's feet -->
    <g class="mist-5" opacity="0.85">
      <ellipse cx="620"  cy="800" rx="520" ry="14" fill="url(#bh-mistCool)"/>
      <ellipse cx="1160" cy="796" rx="360" ry="12" fill="url(#bh-mistWarm)"/>
      <ellipse cx="700"  cy="858" rx="430" ry="16" fill="url(#bh-mistCool)"/>
    </g>

    <!-- ============ FOREGROUND — the near shore, the darkest value ============ -->
    <g class="ridge-7">
      <path d="M-260,1010 L-260,978 L-60,962 L40,974 L150,958 L260,970 L370,952 L470,966
               L570,950 L660,964 L750,948 L840,960 L930,944 L1030,958 L1130,942 L1230,956
               L1330,940 L1440,954 L1700,938 L1700,1010 Z"
            fill="#0e1520"/>
      <path d="M-260,978 L-60,962 L40,974 L150,958 L260,970 L370,952 L470,966 L570,950
               L660,964 L750,948 L840,960 L930,944 L1030,958 L1130,942 L1230,956 L1330,940
               L1440,954 L1700,938"
            fill="none" stroke="#dba860" stroke-opacity="0.2" stroke-width="1.1"/>

      <!-- framing pines: the big pair sit off-frame on mobile,
           the smaller pairs live inside the safe column -->
      <g fill="#0e1520">
        <use href="#bh-pine" transform="translate(58,974)   scale(5.2)"/>
        <use href="#bh-pine" transform="translate(128,980)  scale(3.6)"/>
        <use href="#bh-pine" transform="translate(1372,946) scale(4.7)"/>
        <use href="#bh-pine" transform="translate(1308,952) scale(3.2)"/>
        <use href="#bh-pine" transform="translate(505,960)  scale(2.3)"/>
        <use href="#bh-pine" transform="translate(536,964)  scale(1.5)"/>
        <use href="#bh-pine" transform="translate(936,948)  scale(2.0)"/>
        <use href="#bh-pine" transform="translate(913,952)  scale(1.3)"/>
      </g>

      <!-- three standing stones on the near shore -->
      <g fill="#0e1520">
        <path d="M812,960 L814,932 L820,929 L825,933 L823,960 Z"/>
        <path d="M840,955 L843,918 L851,914 L858,919 L855,955 Z"/>
        <path d="M876,958 L878,936 L884,933 L888,937 L886,958 Z"/>
      </g>
      <g fill="none" stroke="#dba860" stroke-opacity="0.22" stroke-width="0.9">
        <path d="M814,932 L820,929"/>
        <path d="M843,918 L851,914"/>
        <path d="M878,936 L884,933"/>
      </g>

      <!-- reeds along the waterline -->
      <g stroke="#0e1520" stroke-width="1.6" stroke-linecap="round" fill="none">
        <path d="M300,968  L296,946  M306,969  L308,944  M313,967  L319,949"/>
        <path d="M612,962  L608,940  M619,961  L621,938  M626,963  L633,944"/>
        <path d="M700,957  L696,936  M707,956  L709,934  M714,958  L721,940"/>
        <path d="M1050,956 L1046,934 M1057,955 L1059,932 M1064,957 L1071,938"/>
      </g>
      <g stroke="#4f9e7a" stroke-opacity="0.15" stroke-width="1" stroke-linecap="round" fill="none">
        <path d="M614,960 L610,940 M621,959 L623,938"/>
        <path d="M702,955 L698,936 M709,954 L711,934"/>
      </g>
    </g>

    <!-- weathered paper grain, drawn once, never animated -->
    <rect x="-260" y="-60" width="1960" height="1120" fill="url(#bh-grainP)"
          opacity="0.055" style="mix-blend-mode:overlay"/>
  </svg>`;
  return suffix ? svg.replace(/bh-/g, `bh-${suffix}-`) : svg;
}
