# BRAW — Scottish Roadtrip Quests (Prototype)

A gamified tourist roadtrip planner. Current scope: **Scotland, UK** (architecture is
region-agnostic — new datasets unlock the rest of the UK, then the world).

## How to run

Serve the folder with any static server and open `index.html`
(e.g. `npx serve .` or `python -m http.server`). No build step, no dependencies.

## Implemented features

### 1. Natural-language trip planning
- Free-text input ("5 days of castles, whisky and misty lochs starting from Edinburgh").
- A heuristic planner engine ([js/planner.js](js/planner.js)) parses:
  - **14 interest categories** (castles, whisky, hiking, lochs, islands, food, wildlife, myths/films, etc.),
  - **trip duration** ("5 days", "weekend", "a week", "fortnight"),
  - **pace** (relaxed / steady / ambitious → 2–4 stops per day),
  - **start city** (Edinburgh, Glasgow, Inverness, Oban…),
  - **region hints** ("west coast", "NC500", "Speyside"…).
- Scores a curated dataset of **182 real Scottish locations** ([js/data.js](js/data.js)) against the request,
  applies a region-diversity cap and a distance-reach penalty, then orders stops with
  **nearest-neighbour routing** from the start city and chunks them into days.
- Animated "AI thinking" sequence, example prompt chips, and a **🎲 Reshuffle** to regenerate.
- The engine is deliberately swappable for a real LLM + routing API later.

### 2. Roadtrip plan & progress tracking
- Quest sheet: title, interest pills, estimated driving distance, XP on offer, day-by-day stop list
  with descriptions, regions and visit times.
- **Custom hand-built SVG map of Scotland** ([js/scotland-map.js](js/scotland-map.js)) — stylised
  coastline + islands, markers projected from real lat/lon, animated route line, start-point beacon,
  compass rose. Zero external map dependencies; clicking a marker scrolls to its stop card.
- **Mark visited / unmark** per location; visited stops turn gold on map and list.
- "**Next up**" banner previews the next unvisited stop; progress ring + per-trip progress bars.
- Completing every stop finishes the quest (banner, bonus XP, confetti).

### 3. Gamification
- **XP for every interaction**: joining (+50), creating a quest (+100), each location visited
  (+25–60 by significance), completing a quest (+250). Unmarking refunds the XP.
- **Level system** with a rising XP curve and 11 Scottish rank titles
  (Wanderer → Explorer → Munro Bagger → Highlander → … → Legend of Alba).
- **17 achievements** with XP rewards (first quest, 5/15/30 locations, castles, drams,
  lochs, peaks, islands, regions, Nessie Hunter, Full Circle…), shown in a Hall of Achievements
  with locked/unlocked shield badges.
- Juice: XP toasts, achievement toasts, full-screen **level-up celebration**, confetti bursts,
  animated XP bar in the header.

### 4. Accounts & persistence
- **Local by default** — explorer name + password, kept in this browser. Session
  persistence, sign-out, **demo account** button with pre-seeded progress.
- **Optional real accounts** when a backend is configured ([BACKEND.md](BACKEND.md)):
  email + password, sign in on a second device, password reset, and profile sync.
  Existing local progress is carried up when someone signs up.
- Sync detects conflicts rather than merging them: `profiles.revision` is an optimistic
  counter, and a push from a device that missed an update is refused and put to the user.
  Merging two divergent XP histories would produce a profile neither device ever had.
- Zero-dependency Supabase client ([js/supabase.js](js/supabase.js)) written against the
  REST APIs — no CDN, no 120KB SDK — with token refresh, cross-tab session sharing, and a
  guard that refuses to start if given a `service_role` key instead of the anon key.
- Everything degrades: no backend, or no signal, and the app is exactly as it was.

### 4b. Photographs that survive
- Two renditions per photograph: a 480px thumbnail for the interface and a **3000px copy
  for print** (~257 dpi at A4). Re-encoding through a canvas also strips EXIF, GPS
  included — which is asserted in the tests, because the privacy policy claims it.
- Filed per **journey**, not just per location, so two visits to the same glen are two
  photographs and a calendar can be built from one trip.
- **[js/vault.js](js/vault.js)** asks the browser for persistent storage, reports quota and
  eviction risk honestly, and exports every photograph as ordinary `.jpg` files —
  into a chosen folder where the File System Access API exists.
- The storage panel does not call photographs safe merely because persistence was granted:
  a copy elsewhere is the only thing that survives "clear browsing data", and it says so.

### 4c. Store
- Calendar, prints, magnet and route poster, made from the user's own photographs.
- Calendar builder: pick a journey, twelve months, swap any month, start from any month.
- **Print resolution is checked before the order**, not after the parcel — each photograph
  is graded at that product's real print width and flagged with its actual dpi.
- Prices come from the server and orders are priced server-side by `create_order()`;
  clients cannot insert an order or write a total. Ownership of every referenced
  photograph is verified in the same function.
- Until a shop is connected, checkout says plainly that it is not live. It never claims
  to have sold anything.

### 4d. Reading the map
- **Full screen map** ([js/map-viewer.js](js/map-viewer.js)) with drag, wheel, pinch and
  double-tap zoom, keyboard control, and a tap on any pin for its details.
- Zooming rewrites the SVG's **viewBox**, so the map stays vector-sharp, and everything
  carrying `data-mx`/`data-my` is **counter-scaled**: pins and place names hold their size
  on screen while the land grows underneath. That is the whole point — scale a map
  uniformly and two pins that overlap at rest still overlap at 8×, because the gap between
  them grows too. Measured in the tests: a pin stays 55px while its neighbour moves from
  3px away to 21px.
- The view is **shaped to the screen** rather than to the map. Left at the map's own
  560×730 a phone wasted about four tenths of its display on empty sea; and it opens
  framed on the journey, so a two-day trip round Aberdeenshire no longer opens over the
  North Sea.
- **Live location** from a third button on the map toolbar. A coarse fix is asked for
  first and refined by the high-accuracy watch, so a dot appears in about a second
  instead of waiting on a GPS lock. When it lands, the map pushes in on the position and
  back out — full screen goes there and stays — with a ring closing on the dot.
- The app keeps **its own deadline** on the first fix. `watchPosition` calls neither
  callback when a browser refuses without asking, not even after its own timeout, so the
  button used to pulse for ever and say nothing.
- Outside Scotland it **says so, with the distance**, rather than clamping the dot to the
  corner of the map — which is what it used to do, and was indistinguishable from broken.
- **Open in Google Maps**, from the map or from any single location. The current centre
  and scale are converted to Google's zoom levels, and the link is kept current as you
  move so copying it or opening it in a new tab gets where you are now.

### 4e. Managing quests
- Cards show a segmented progress bar — one segment per stop — so the bar answers "how
  many places left?" and not only "what fraction?".
- A quest can be **deleted**, behind a typed four-letter code. A second "are you sure?"
  button gets tapped in the same rhythm as the first; typing something cannot happen by
  accident. The dialog states what is actually lost: the XP still on offer, and any
  location visited only on that quest. XP already earned is kept — clawing it back could
  drop somebody a level for tidying their list.

### 5. Profile & statistics
- Profile hero with level, rank title and XP-to-next-level bar.
- 8 stat tiles: locations visited, quests created/completed, castles stormed, drams earned,
  regions explored, peaks bagged, achievements.
- Recent-activity feed with XP deltas.
- The page **animates on arrival**: cards rise in sequence, the level bar fills from
  empty with a sweep of light across it, and every total counts up to itself. Once per
  visit, not on the background refreshes — and skipped entirely under reduced motion.
- **Phone navigation** is a hamburger in the bottom-left corner, where the thumb already
  is, opening the whole menu at once instead of a scrolling strip of tabs across the top.
  It is the header's own `<nav>`, relocated — one list of destinations, one active state.
  My Quests is filled amber so the most-used destination is found without reading, and
  Map carries the real terrain sprite as its backdrop.
- The header is down to the level readout — itself the way to the profile — and a
  labelled Sign out. The avatar and name were a third door to a page with two already.

### 6. Leaderboard
- Ranked table of 9 seeded rival explorers + the signed-in user (live position by XP),
  with levels, locations, completed quests and a "XP to overtake the next player" nudge.

## Architecture

```
index.html        app shell (auth screen + 6 views)
css/style.css     design system — highland-night theme, Fraunces/Karla/IBM Plex Mono
js/data.js        Scotland dataset: 60 POIs, interests, achievements, levels, rivals
js/planner.js     NL parsing → scoring → routing → day chunking
js/scotland-map.js custom SVG map renderer (projection from real coordinates)
js/store.js       accounts + persistence (localStorage "backend")
js/gamification.js XP, levels, achievements engine, toasts, confetti
js/app.js         views, navigation, event wiring
```

## Future expansion (out of prototype scope)
- Real LLM-backed prompt understanding and a road-routing API.
- Server backend (the `store` module is the seam) + real multiplayer leaderboards.
- Datasets for the rest of the UK, then worldwide; map tiles for arbitrary regions.
- Photos per location, offline mode, social sharing of completed quests.
