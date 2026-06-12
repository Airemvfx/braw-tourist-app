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
- Scores a curated dataset of **60 real Scottish locations** ([js/data.js](js/data.js)) against the request,
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
- Register / sign-in with explorer name + password (SHA-256 hashed, localStorage-backed —
  a stand-in for a real API; data shapes are backend-ready).
- Session persistence, sign-out, **demo account** button with pre-seeded progress.
- Per-user storage of XP, achievements, all roadtrips and their visited state, activity log.

### 5. Profile & statistics
- Profile hero with level, rank title and XP-to-next-level bar.
- 8 stat tiles: locations visited, quests created/completed, castles stormed, drams earned,
  regions explored, peaks bagged, achievements.
- Recent-activity feed with XP deltas.

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
