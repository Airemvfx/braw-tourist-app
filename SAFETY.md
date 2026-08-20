# Safety review pack

**Status: awaiting review by a qualified person. Not signed off.**

I can build the scaffolding and I can write down standard guidance. I
cannot be the qualified reviewer — that needs somebody holding a
Mountain Leader, Winter ML or Summer/Winter Mountaineering &
Climbing Instructor award, or equivalent, and ideally someone with
Scottish winter and west-coast sea experience.

This document exists so that review takes an hour instead of a week: it
collects **everything the app says that could affect somebody's safety**,
in one place, with a note on where each string lives.

Last compiled against commit `e28f0e7`.

---

## Why this matters more than it did

The app is moving towards being sold. Taking payment increases the
reliance a user can reasonably place on what it tells them, and shifts
the question from "is this a fun prototype" to "is this advice fit to
charge for". Two features sharpen it further:

* **Live GPS with automatic arrival detection** may encourage people to
  follow the app rather than the ground.
* **Kit lists and advisories derived from the route** are the app
  holding itself out as advising on preparation. That is a good feature
  and it raises the bar for correctness.

---

## What a reviewer needs to check

### 1. The safety screen (`safety.*` in `js/i18n.js`, shown at Safety)

Eleven cards plus a disclaimer. Please check each for accuracy,
completeness and emphasis:

| Card | Claim made | Reviewer note |
| --- | --- | --- |
| In an emergency | 999 or 112; ask for Police then Mountain Rescue; Coastguard for coast/sea | |
| If you cannot get a call out | Emergency SMS needs prior registration by texting `register` to 999 | |
| Leave word | Tell someone route and return time, and tell them you are back | |
| The tops make their own weather | Check MWIS / Met Office mountain forecast night before and morning | |
| Scottish daylight | Sunset before 16:00 in late December; head torch Oct–Mar | |
| Do not navigate by phone alone | Paper map and compass; Cuillin gabbro deflects a compass | |
| Winter is a different mountain | Nov–Apr: ice axe, crampons, the skill to use them; check SAIS | |
| Cold water and tides | Water rarely above 14°C; enter slowly, never alone; check tides | |
| Ticks | Spring–autumn; Lyme disease; remove with a tool, pull straight; see a doctor for spreading rash | |
| Deer stalking | Stags ~Jul–Oct, hinds ~Oct–Feb; access right remains; check Heading for the Scottish Hills | |
| Access | Land Reform (Scotland) Act 2003 responsibilities | |

**Specific questions for the reviewer:**

- Is anything here wrong, out of date, or dangerously incomplete?
- Is the emergency card the right *first* thing, and is the 999 →
  Police → Mountain Rescue phrasing what a caller should actually say?
- Should avalanche guidance be stronger, or dated differently?
- Is there a serious omission? River crossings and navigation in
  whiteout are both absent and may deserve a card.
- Is the tick removal instruction correct as written?

### 2. Route-derived advisories (`ADVISORIES` in `js/data.js`, text in `adv.*`)

These fire based on what is actually on a user's route:

| Trigger | What it says |
| --- | --- |
| Route crosses water | Names the actual crossings; book ahead; note the last sailing |
| NC500 / Skye / a driving stop | Single-track passing places are for passing, not parking |
| Any mountain stop | Check the mountain forecast; leave word of your route |
| Any skiing stop | Snow gates close without warning; check the resort report |
| Surfing or sea stop | Swell and tide decide; check the tide table |
| Any wild swimming stop | Cold water shock: enter slowly, never alone, warm layers after |
| Stargazing stop | Needs a clear moonless night |
| Whisky or castle stop | Book timed tickets |
| Whisky stop | Nominate a driver; Scotland's limit is lower than England's |
| Route over 800 km | Fuel is scarce in the north-west |
| More than 10 h a day | Consider adding a day |

**Questions:** are the triggers in the right places, and is any advisory
missing for a stop type that clearly warrants one? The dataset includes
Shelter Stone Crag, described in the app as "Scotland's most serious
mountaineering", and Ben Nevis in winter.

### 3. Kit lists (`EQUIPMENT` in `js/data.js`, text in `kit.*`)

Derived from the tags of the chosen stops. Waterproofs and warm layers
appear on every route. Boots, map and compass, head torch appear for
hill ground; buoyancy aid and dry bag for open water; helmet and harness
for climbing; wetsuit for swimming and surfing.

**Question:** for a route including a serious mountain objective, is a
tag-derived kit list adequate, or does it need an explicit "this list is
a prompt, not a packing list for this specific objective" caveat?

### 4. Travel estimates (`js/road-graph.js`, built by `tools/build_routes.py`)

Distances and times come from a terrain-constrained search, not a road
network. Median error is 11% on distance and 17% on time against known
journeys, with a known worst case around 50% short on legs between
Glencoe and Fort William, where the search finds a route that carries
the West Highland Way and no road.

**Question:** is the in-app disclaimer sufficient given this, or should
the trip screen carry a visible accuracy note rather than only the
safety screen?

### 5. Things the app does NOT currently say

Flagged as candidate omissions rather than decided:

- River crossing — how to judge one, and when to turn back.
- Navigation in poor visibility.
- Group management: pace of the slowest, turnaround discipline.
- What to do if somebody is injured and you cannot move them.
- Bothy etiquette beyond "leave it clean" (the library covers some).
- Ferry cancellation contingency — a plan B when a crossing is off.
- Mobile signal reality: most of the Highlands has none.

---

## The disclaimer as it currently reads

Shown at the foot of the safety screen, in both languages:

> BRAW suggests places and estimates journeys. It is not a navigation
> system, not a mountain guide, and its distances and times are
> estimates that can be wrong. Conditions, opening times, ferry
> timetables and road closures change without notice. You are
> responsible for your own judgement, your party and your safety. Do not
> set out on hill, water or winter ground beyond your experience.

**Questions for the reviewer and separately for a solicitor:** is this
adequate in substance, is it prominent enough, and should acceptance be
required once at first run rather than being available on a tab?

---

## Recommended before charging money

1. This review completed and signed by a named qualified person, with
   the date and their award recorded here.
2. Public liability insurance appropriate to publishing outdoor
   guidance, with the insurer told exactly what the app does.
3. A decision, taken with a solicitor, on whether the disclaimer must be
   accepted at first run.
4. A named owner for safety content, and a review cadence — guidance
   dates, and stalking seasons and access rules change.

---

## Sources the content is based on

Standard UK public guidance rather than anything proprietary:
Mountaineering Scotland and the British Mountaineering Council on hill
safety; Mountain Weather Information Service and the Met Office mountain
forecast; the Scottish Avalanche Information Service; the Scottish
Outdoor Access Code under the Land Reform (Scotland) Act 2003; Heading
for the Scottish Hills for stalking; NHS guidance on ticks and Lyme
disease; RNLI and the Coastguard on cold water and tides.

A reviewer should confirm each of these still says what the app says it
says.
