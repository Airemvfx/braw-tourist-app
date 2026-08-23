// ============================================================
// BRAW — the shop.
//
// What is sold is made from the photographs someone took on a journey:
// a twelve-month calendar, a set of prints, a magnet, a route poster.
// So the shop is not a separate catalogue bolted on the side — it reads
// the same photo store the trip screens do, and its whole job is to get
// twelve good pictures into twelve months.
//
// ---- Where prices come from ----
//
// The list below is a fallback for display only. When a backend is
// configured the real list is fetched from it, and in either case the
// price actually charged is computed server-side by create_order();
// see supabase/schema.sql. Nothing here is trusted with money — a
// catalogue in a file anyone can edit obviously cannot be.
//
// ---- Print sizes ----
//
// Every product carries the width it prints at, in millimetres, which
// is what turns a pixel count into an honest answer about whether a
// photograph is good enough. That check happens before an order, not
// after it arrives in the post.
// ============================================================

import { getLang, t, locale } from './i18n.js';
import { printGrade, printDpi } from './photos.js';

export const CATALOGUE = [
  {
    id: 'calendar-a4', kind: 'calendar', photoCount: 12, pricePence: 2400,
    currency: 'GBP', printWidthMm: 297, icon: '🗓️',
    name: { en: 'A4 wall calendar', pl: 'Kalendarz ścienny A4' },
    blurb: {
      en: 'Twelve months, twelve of your photographs.',
      pl: 'Dwanaście miesięcy, dwanaście Twoich zdjęć.',
    },
  },
  {
    id: 'prints-six', kind: 'prints', photoCount: 6, pricePence: 900,
    currency: 'GBP', printWidthMm: 152, icon: '🖼️',
    name: { en: 'Six 6×4 prints', pl: 'Sześć odbitek 6×4' },
    blurb: {
      en: 'Your six best stops, on proper photo paper.',
      pl: 'Sześć najlepszych przystanków na prawdziwym papierze.',
    },
  },
  {
    id: 'magnet-one', kind: 'magnet', photoCount: 1, pricePence: 450,
    currency: 'GBP', printWidthMm: 70, icon: '🧲',
    name: { en: 'Fridge magnet', pl: 'Magnes na lodówkę' },
    blurb: { en: 'One photograph, 70×50mm.', pl: 'Jedno zdjęcie, 70×50 mm.' },
  },
  {
    id: 'poster-a3', kind: 'poster', photoCount: 1, pricePence: 1800,
    currency: 'GBP', printWidthMm: 420, icon: '🗺️',
    name: { en: 'A3 route poster', pl: 'Plakat trasy A3' },
    blurb: {
      en: 'Your route drawn as a map, with one photograph inset.',
      pl: 'Twoja trasa jako mapa, z jednym zdjęciem.',
    },
  },
];

export const productById = id => CATALOGUE.find(p => p.id === id) || null;

/** Pick the active language out of a {en, pl} field, however it arrived. */
function localised(field, fallback = '') {
  if (!field) return fallback;
  if (typeof field === 'string') return field;
  return field[getLang()] || field.en || fallback;
}

export const productName = p => localised(p?.name, p?.id || '');
export const productBlurb = p => localised(p?.blurb);

/**
 * Overlay the server's list on the built-in one.
 *
 * Kept as an overlay rather than a replacement so that a product the
 * client knows how to build — the calendar, with its month grid — does
 * not lose its behaviour just because the row came back with a
 * different shape. Anything the server offers that we have no builder
 * for is still listed, at the server's price.
 */
export function mergeRemote(rows) {
  if (!Array.isArray(rows) || !rows.length) return CATALOGUE;
  const merged = rows.map(row => {
    const local = productById(row.id);
    return {
      ...(local || {}),
      id: row.id,
      kind: row.kind,
      photoCount: row.photo_count ?? local?.photoCount ?? 1,
      pricePence: row.price_pence,
      currency: row.currency || 'GBP',
      name: row.name || local?.name,
      blurb: row.blurb || local?.blurb,
      icon: local?.icon || '🎁',
      printWidthMm: row.meta?.print_width_mm || local?.printWidthMm || 150,
      remote: true,
    };
  });
  // Keep anything built in that the server did not mention, so an
  // unconfigured or half-seeded project still shows a full shop.
  const seen = new Set(merged.map(p => p.id));
  return [...merged, ...CATALOGUE.filter(p => !seen.has(p.id))];
}

export function priceText(pence, currency = 'GBP') {
  const value = (pence || 0) / 100;
  try {
    return new Intl.NumberFormat(locale(), { style: 'currency', currency }).format(value);
  } catch {
    return `£${value.toFixed(2)}`;
  }
}

// ------------------------------------------------------------------
// Building a calendar
// ------------------------------------------------------------------

/**
 * Twelve month labels starting from `startMonth` (0-11), in the active
 * language, each tagged with the year it lands in — a calendar begun in
 * October runs into next year and the grid has to say so.
 */
export function monthsFor(startMonth, startYear) {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const m = (startMonth + i) % 12;
    const year = startYear + Math.floor((startMonth + i) / 12);
    const label = new Date(Date.UTC(year, m, 1))
      .toLocaleDateString(locale(), { month: 'long', timeZone: 'UTC' });
    out.push({ index: i, month: m, year, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }
  return out;
}

/**
 * A first pass at which photograph goes in which month.
 *
 * Spread evenly across whatever was taken, in the order it was taken,
 * so the calendar reads as the journey did. With fewer photographs than
 * slots the remaining months are left empty rather than repeating —
 * the builder should show the gaps, because a silently duplicated
 * photograph is the kind of thing noticed only once it is printed.
 */
export function calendarSlots(photos, count = 12) {
  const slots = Array.from({ length: count }, () => null);
  if (!photos.length) return slots;

  if (photos.length <= count) {
    photos.forEach((p, i) => { slots[i] = p; });
    return slots;
  }
  // More photographs than months: take an even spread across the trip.
  for (let i = 0; i < count; i++) {
    slots[i] = photos[Math.round((i * (photos.length - 1)) / (count - 1))];
  }
  return slots;
}

/**
 * How every chosen photograph will look at this product's print size.
 * `worst` is what the order button gates on.
 */
export function printReport(slots, product) {
  const filled = slots.filter(Boolean);
  const graded = filled.map(p => ({
    photo: p,
    grade: printGrade(p, product.printWidthMm),
    dpi: printDpi(p, product.printWidthMm),
  }));
  const poor = graded.filter(g => g.grade === 'poor').length;
  const fair = graded.filter(g => g.grade === 'fair').length;
  return {
    filled: filled.length,
    needed: product.photoCount,
    complete: filled.length === product.photoCount,
    poor, fair,
    graded,
    worst: poor ? 'poor' : fair ? 'fair' : 'good',
  };
}

/** The order payload create_order() expects. */
export function orderItems(slots) {
  return slots
    .map((p, i) => (p ? { photo_id: p.id, month: i + 1 } : null))
    .filter(Boolean);
}

/** A short line describing what a print grade means, for the UI. */
export function gradeLabel(grade) {
  return t(`shop.grade.${grade}`);
}
