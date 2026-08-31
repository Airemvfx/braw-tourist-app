// ============================================================
// BRAW — where a place comes from, and what that lets us do with it.
//
// There are two kinds of place in this app and they have different
// rights, which is the whole reason this file exists.
//
//   Curated  — the 182 in data.js. Written by hand: our names, our
//              blurbs, our XP. Ours permanently, free, offline, and
//              the only durable thing the product owns.
//
//   Google   — everywhere else. Borrowed. Google's terms let us keep
//              a place_id indefinitely and its coordinates for thirty
//              days, and nothing else — not the name, not the address.
//              So a Google place is good for planning and bad for
//              keeping, and the interface has to be honest about that.
//
// ---- Why this is synchronous ----
//
// The app reads POI_BY_ID[id] synchronously in the middle of building
// markup, in dozens of places. Google's API is asynchronous. Rather
// than make every render function async — which would mean every
// caller of every render function too — the resolution happens once,
// before a render, and this stays a plain lookup that never awaits.
//
// ---- The invariant ----
//
//   Google is the search box. Curated places are the collection.
//
// A Google-sourced place may appear in exactly two situations: in
// transient results somebody is choosing from, and as a stop in their
// own itinerary. It may never appear in a browsable, filterable list.
// That is not a style preference — a filterable screen of Google
// places with names, types and pins is a "listings or directory
// service", which Google's terms §3.2.3(d)(iii) forbid outright.
//
// The practical form of the rule: anything that BROWSES reads POIS
// from data.js directly, and anything that DISPLAYS a place somebody
// already chose reads getPlace(). Keeping those two importing
// different things is what makes the invariant checkable by a test
// rather than something a future edit has to remember.
// ============================================================

import { POIS, POI_BY_ID } from './data.js';

const GOOGLE_PREFIX = 'g:';

/** Which source an id belongs to, and the underlying key. */
export function parsePlaceId(id) {
  const s = String(id ?? '');
  return s.startsWith(GOOGLE_PREFIX)
    ? { source: 'g', key: s.slice(GOOGLE_PREFIX.length) }
    : { source: 'braw', key: s };
}

/**
 * Is this one of ours?
 *
 * A bare id is curated, so every trip already saved to somebody's disk
 * keeps working untouched. Only Google places carry a prefix.
 */
export const isCurated = id => !String(id ?? '').startsWith(GOOGLE_PREFIX);

/** An id for a Google place. */
export const googleId = placeId => GOOGLE_PREFIX + placeId;

// ------------------------------------------------------------------
// The render buffer
//
// Not a cache, and the distinction is legal rather than pedantic.
// This is a plain variable holding a response we are in the middle of
// drawing, for one page view, cleared when the page goes away. It is
// the same status as the local variable a fetch result sits in. What
// is forbidden is putting Google's names or addresses on a disk, and
// nothing here ever touches one — see js/store.js, which throws if a
// saved record carries a rented field.
// ------------------------------------------------------------------

const live = new Map();

if (typeof addEventListener === 'function') {
  addEventListener('pagehide', () => live.clear());
}

/** Hold a resolved Google place for the life of this page view. */
export function remember(id, place) {
  if (!isCurated(id) && place) live.set(id, place);
  return place;
}

export const forget = id => live.delete(id);
export const forgetAll = () => live.clear();
export const liveCount = () => live.size;

/**
 * The place behind an id, or null.
 *
 * Curated ids resolve from the dataset and always succeed. A Google id
 * resolves only if something has already fetched it in this page view;
 * otherwise this returns null and the caller shows the honest
 * "borrowed place, needs a connection" state rather than a blank row.
 *
 * The object is returned as it is stored, not copied — this sits in
 * render loops, and cloning fifteen stops on every re-render to add a
 * field nobody reads would be a real cost for no gain. Ask isCurated()
 * when the source matters.
 */
export function getPlace(id) {
  if (id == null) return null;
  return isCurated(id) ? (POI_BY_ID[id] || null) : (live.get(id) || null);
}

/** Every curated place. The browse surfaces use this, deliberately. */
export const curatedPlaces = () => POIS;
