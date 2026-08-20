// ============================================================
// BRAW — internationalisation engine.
//
// Flat dot-separated keys, {placeholder} interpolation, and a
// pub/sub so views can re-render when the language changes.
// English is the fallback for any key a locale is missing.
//
// Dataset content (POI names, blurbs, regions) lives in
// i18n-content.js and is reached through the helpers at the
// bottom of this file.
// ============================================================

import { PL_POIS, PL_REGIONS, PL_TIMES, PL_CITIES } from './i18n-content.js';

export const LANGS = {
  en: { label: 'English', short: 'EN' },
  pl: { label: 'Polski', short: 'PL' },
};

const LANG_KEY = 'braw_lang_v1';
const DEFAULT_LANG = 'en';

// ============================================================
// UI strings
// ============================================================

const EN = {
  // ---- document ----
  'a11y.skip': 'Skip to content',
  'foot.privacy': 'Privacy',
  'foot.safety': 'Safety',
  'doc.title': 'BRAW — Scottish Roadtrip Quests',

  // Experience-point unit, used wherever a bare number is suffixed.
  'unit.xp': 'XP',

  // ---- auth: brand panel ----
  'auth.eyebrow': 'Scotland · Est. Adventure',
  'auth.tagline': 'Your personal Scottish expedition, <strong>charted stop by stop</strong>.',

  // Landing features: a short label plus one clause. Scannable tiles,
  // not paragraphs — the artwork carries the atmosphere instead.
  'auth.feat.route.t': 'Plan by sentence',
  'auth.feat.route.b': 'One line becomes a full route',
  'auth.feat.gps.t': 'Live GPS',
  'auth.feat.gps.b': 'It knows when you arrive',
  'auth.feat.xp.t': 'XP & badges',
  'auth.feat.xp.b': 'Level up as you explore',
  'auth.feat.leaderboard.t': 'Leaderboard',
  'auth.feat.leaderboard.b': 'Climb past other explorers',

  // ---- landing showcase ----
  'showcase.kicker': 'A live preview',
  'showcase.cap1': 'Plan your roadtrip',
  'showcase.cap2': 'Gain levels',
  'showcase.cap3': 'Play games',
  'showcase.cap4': 'Earn badges',
  'showcase.aria': 'Animated preview of a Scottish roadtrip on the BRAW map',

  // ---- appearance ----
  'theme.label': 'Appearance',
  'theme.dark': 'Dark',
  'theme.light': 'Light',
  'theme.auto': 'System',

  'auth.stat.places': 'locations',
  'auth.stat.interests': 'interests',
  'auth.stat.badges': 'achievements',
  'auth.foot': 'Prototype · Scotland only · GPS &amp; geofencing included · No data leaves your device',

  // ---- auth: form ----
  'auth.welcome': 'Welcome back',
  'auth.welcomeSub': 'Sign in to continue your Scottish adventure.',
  'auth.tab.login': 'Sign in',
  'auth.tab.register': 'Create account',
  'auth.field.name': 'Explorer name',
  'auth.field.namePlaceholder': 'e.g. BonnieVoyager',
  'auth.field.pass': 'Password',
  'auth.submit.login': 'Sign in',
  'auth.submit.register': 'Create account',
  'auth.submit.loginArrow': 'Sign in →',
  'auth.submit.registerArrow': 'Create account →',
  'auth.or': 'or',
  'auth.demo': 'Try the demo account',
  'auth.note': 'Accounts are stored locally in your browser. No data leaves this device.',

  // ---- auth: errors (store.js) ----
  'auth.err.nameFormat': 'Name must be 3–24 letters, numbers or _ . -',
  'auth.err.passShort': 'Password needs at least 4 characters.',
  'auth.err.taken': 'That explorer name is already taken.',
  'auth.err.noUser': 'No explorer found with that name.',
  'auth.err.wrongPass': 'Wrong password, try again.',

  // ---- header / nav ----
  'nav.scope': 'SCOTLAND',
  'nav.plan': 'New Quest',
  'nav.trips': 'My Quests',
  'nav.badges': 'Achievements',
  'nav.leaderboard': 'Leaderboard',
  'nav.profile': 'Profile',
  'nav.signOut': 'Sign out',
  'nav.language': 'Language',
  'nav.home': 'Back to home',
  'hdr.level': 'LVL {level}',
  'hdr.xp': '{into} / {need} XP',

  // ---- plan view ----
  'plan.title': 'Where shall we <em>explore</em>?',
  'plan.sub': "Tell us your interests — a single sentence is enough. We'll build a personalised Scottish itinerary with real GPS tracking.",
  'plan.placeholder': "e.g. I'm really into kayaking and wild swimming… or 5 days of highland castles from Inverness…",
  'plan.hint': '⌘ / Ctrl + Enter to generate',
  'plan.go': 'Generate itinerary →',
  'plan.generating': 'Charting your route…',
  'plan.examples': 'Try an example',
  'plan.tooShort': 'Tell me a wee bit about your dream trip first!',
  'plan.think.read': 'Reading your wishes…',
  'plan.think.scout': 'Scouting {count} Scottish locations…',
  'plan.think.match': 'Matching interests and scoring stops…',
  'plan.think.route': 'Charting the bonniest route…',
  'plan.think.polish': 'Polishing your quest…',

  // ---- trip sheet ----
  // ---- the occasional nudge outside a themed request ----
  'plan.wild.kicker': 'A wee suggestion',
  'plan.wild.body': 'All {theme}, start to finish — no argument here. But you would drive right past these two, and it seems a shame.',
  'plan.wild.bodyOne': 'All {theme}, start to finish — no argument here. But you would drive right past this one, and it seems a shame.',
  'plan.wild.add': 'Go on then, add them',
  'plan.wild.addOne': 'Go on then, add it',
  'plan.wild.no': 'No, keep it pure',
  'plan.wild.detour': '{region} · {time} · ✦ {xp} XP',
  'plan.wild.added': 'Added to your route. Good instincts.',
  'plan.wild.kept': 'Purist. Respect.',
  'plan.themeOnly': '{n} stops, all on theme',
  'trip.kicker.draft': 'YOUR QUEST AWAITS',
  'trip.kicker.active': 'ACTIVE QUEST',
  'trip.kicker.complete': '🏁 QUEST COMPLETE',
  'trip.bestOf': '✨ Best of Scotland',
  'trip.distance': '🚗 ≈{dist}',
  'trip.pace': '⚡ {pace} pace',
  'trip.xpOffer': '✦ {xp} XP on offer',
  'trip.reshuffle': '🎲 Reshuffle',
  'trip.begin': 'Begin this Quest ⚔️',
  'trip.from': '📍 from {start}',
  'trip.back': '← All quests',
  'trip.none': 'No quest selected.',
  'trip.visitedRatio': '{done}/{total} visited',
  'trip.completeBanner': '🎉 Every stop conquered! +{xp} XP claimed. Scotland salutes you.',
  'trip.ferryBanner': '⛴ This quest needs a crossing: {list}. Book ahead.',
  'trip.nextUp': 'NEXT UP',
  'trip.stopOf': '{region} · stop {n} of {total} · ✦ {xp} XP',
  'trip.day': 'DAY {n}',
  'trip.markVisited': 'Mark visited',
  'trip.visited': 'Visited ✓',
  'trip.stopMeta': '{region} · {time} · ',

  // ---- trips list ----
  'trips.title': 'My <em>Quests</em>',
  'trips.sub': 'Your saved itineraries. Open one to track your progress and enable live GPS.',
  'trips.empty.title': 'Nae quests yet!',
  'trips.empty.body': 'Describe your dream Scottish adventure and let the planner chart your course.',
  'trips.empty.cta': 'Plan my first quest →',
  'trips.card.meta': '{days} days · {stops} stops · ≈{dist} · from {start}',
  'trips.card.completed': 'COMPLETED',
  'trips.card.progress': '{done} of {total} locations visited',
  'trips.cta.title': 'Want to add more journeys?',
  'trips.cta.body': 'Describe another trip and we will chart it for you',
  'trips.cta.action': 'Plan a new quest →',

  // ---- achievements ----
  'badges.title': 'Achievements',
  'badges.count': '{owned} / {total} unlocked',
  'badges.unlockedOn': 'Unlocked {date}',
  'badges.reward': 'Reward: +{xp} XP',
  'badges.toastKicker': 'Achievement unlocked',
  'badges.logged': 'Achievement unlocked: {name}',

  // ---- passport ----
  'passport.title': 'Regional Passport',
  'passport.sub': 'Visit every location in a region to earn its stamp.',
  'passport.count': '{owned} of {total} regions stamped',
  'passport.stamped': 'Stamped {date}',
  'passport.progress': '{done}/{total} visited',
  'passport.earned': 'Region stamped: {region}',
  'passport.toast': 'Passport stamped — {region}!',

  // ---- mini-game ----
  'nav.play': 'Play',
  'game.title': 'Guess the <em>Glen</em>',
  'game.sub': 'We describe a place in Scotland. Name it. One wrong answer ends the run.',
  'game.start': 'Start a run →',
  'game.again': 'Play again →',
  'game.question': 'Question {n}',
  'game.score': 'Score',
  'game.best': 'Best',
  'game.hint': 'Need a hint?',
  'game.hintShown': 'Somewhere in {region}',
  'game.correct': 'Correct!',
  'game.wrong': 'Not quite — it was {name}',
  'game.runOver': 'Run over',
  'game.runScore': 'You named {score} correctly',
  'game.newBest': 'New personal best!',
  'game.capped': 'Daily XP for the quiz is maxed — play on for the score',
  'game.quit': 'Finish run',

  // ---- leaderboard ----
  'lb.title': 'Leaderboard',
  'lb.col.rank': '#',
  'lb.col.explorer': 'Explorer',
  'lb.col.level': 'Level',
  'lb.col.locations': 'Locations',
  'lb.col.quests': 'Quests done',
  'lb.col.xp': 'XP',
  'lb.you': '· YOU',
  'lb.note.first': 'You sit at the top o’ the mountain. Defend it!',
  'lb.note.rank': "You're #{rank} of {total}. {xp} XP to overtake {name}.",

  // ---- profile ----
  'profile.levelTitle': 'LVL {level} · {title}',
  'profile.xpToNext': '{into} / {need} XP to level {next} · {total} XP total',
  'profile.stat.visited': 'locations visited',
  'profile.stat.created': 'quests created',
  'profile.stat.completed': 'quests completed',
  'profile.stat.castles': 'castles stormed',
  'profile.stat.drams': 'drams earned',
  'profile.stat.regions': 'regions explored',
  'profile.stat.peaks': 'peaks bagged',
  'profile.stat.badges': 'achievements',
  'profile.stat.stamps': 'region stamps',
  'profile.stat.photos': 'photos taken',

  // ---- check-in photos ----
  'photo.add': 'Add photo',
  'photo.replace': 'Replace photo',
  'photo.remove': 'Remove photo',
  'photo.alt': 'Your photo of {name}',
  'photo.saved': 'Photo saved for {name}',
  'photo.failed': 'That image could not be read',
  'photo.close': 'Close',
  // ---- taking your data with you ----
  // ---- the library ----
  'nav.library': 'Library',
  'library.title': 'The <em>Library</em>',
  'library.sub': 'Facts, legends, history and language — all of it stored in the app, so it works with no signal at all. Most of it opens as you travel.',
  'library.count': '{open} of {total} entries open',
  'library.filter.all': 'Everything',
  'library.type.fact': 'Facts',
  'library.type.history': 'History',
  'library.type.legend': 'Legends',
  'library.type.word': 'Words',
  'library.type.egg': 'Hidden',
  'library.locked': 'Not open yet',
  'library.hint.visit': 'Opens when you check in at {name}',
  'library.hint.region': 'Opens when you stamp {name}',
  'library.hint.level': 'Opens at level {n}',
  'library.hint.egg': 'Somewhere out there',
  'library.empty': 'Nothing here yet.',
  'library.newBadge': 'New',
  'library.found': 'Library: {title}',
  'library.legendNote': 'Told as a story, not as a fact.',
  'lore.did': 'From the library',
  'lore.more': '{n} more in the library',
  'profile.stat.lore': 'library',
  // ---- safety ----
  // Standard UK hill and water guidance. Reviewed content lives in
  // SAFETY.md; anything changed here must be changed there too.
  'safety.nav': 'Safety',
  'safety.title': 'Before you go',
  'safety.sub': 'Kept in the app so it reads with no signal. Two minutes now is worth a great deal later.',
  'safety.emergency.t': 'In an emergency',
  'safety.emergency.b': 'Dial 999, or 112 which works on any network including one you have no contract with. For mountain rescue ask for Police, then Mountain Rescue. For an incident at sea or on the coast ask for the Coastguard.',
  'safety.sms.t': 'If you cannot get a call out',
  'safety.sms.b': 'Emergency SMS works on a weaker signal than a voice call, but you must register first — text the word register to 999 while you still have signal, and do it before you travel.',
  'safety.word.t': 'Leave word',
  'safety.word.b': 'Tell somebody where you are going and when you expect to be back, and tell them when you return. Nobody looks for you if nobody knows you are missing.',
  'safety.weather.t': 'The tops make their own weather',
  'safety.weather.b': 'Check a mountain-specific forecast the night before and again in the morning — MWIS or the Met Office mountain forecast. Wind on a summit can be double the valley figure and the temperature several degrees lower.',
  'safety.light.t': 'Scottish daylight',
  'safety.light.b': 'In late December the sun sets before four in the afternoon, earlier in the north. Work out your turnaround time before you set off, and carry a head torch from October to March whatever the plan.',
  'safety.nav.t': 'Do not navigate by phone alone',
  'safety.nav.b': 'Cold flattens a battery fast and there is no signal across most of the Highlands. Carry a paper map and compass and know how to use them. On the Cuillin of Skye the rock itself deflects a compass needle.',
  'safety.winter.t': 'Winter is a different mountain',
  'safety.winter.b': 'From roughly November to April the Scottish hills need an ice axe, crampons and the skill to use them. Check the avalanche forecast from the Scottish Avalanche Information Service before going high.',
  'safety.water.t': 'Cold water and tides',
  'safety.water.b': 'Scottish water rarely gets above 14°C and cold water shock is immediate. Enter slowly, never alone, and get warm layers on straight away. On the coast check the tide before you commit to a route.',
  'safety.ticks.t': 'Ticks',
  'safety.ticks.b': 'Common in bracken and long grass from spring to autumn and they can carry Lyme disease. Cover your legs, check yourself the same evening, and remove any tick with a proper tool, pulling straight out. See a doctor if a spreading rash or flu-like illness follows.',
  'safety.stalking.t': 'Deer stalking',
  'safety.stalking.b': 'Stalking runs roughly July to October for stags and October to February for hinds. Your right of access remains, but check Heading for the Scottish Hills or the estate for where shooting is taking place and take the route they suggest.',
  'safety.access.t': 'Access comes with responsibilities',
  'safety.access.b': 'Scotland gives a right of responsible access to most land. Leave gates as you find them, keep dogs under control near stock, take all litter home, and camp small, out of sight and briefly.',
  'safety.disclaimer.t': 'What this app is not',
  'safety.disclaimer.b': 'BRAW suggests places and estimates journeys. It is not a navigation system, not a mountain guide, and its distances and times are estimates that can be wrong. Conditions, opening times, ferry timetables and road closures change without notice. You are responsible for your own judgement, your party and your safety. Do not set out on hill, water or winter ground beyond your experience.',
  'data.title': 'Your data',
  'data.sub': 'Everything lives in this browser and nowhere else. Keep a copy.',
  'data.gpx': 'Route as GPX',
  'data.gpxHint': 'Opens in a sat-nav, Garmin, OsmAnd or Komoot',
  'data.geojson': 'Route as GeoJSON',
  'data.geojsonHint': 'For Google Earth, QGIS and other map tools',
  'data.backup': 'Download a backup',
  'data.backupHint': 'Every quest, badge and photo in one file',
  'data.restore': 'Restore from a backup',
  'data.restoreHint': 'Replaces everything on this device',
  'data.exported': 'Downloaded {name}',
  'data.warn': 'Clearing your browser data erases your progress. There is no account to recover it from — the backup file is the only copy.',
  'data.confirm': 'Restore {name}? This device currently has {trips} quests and {xp} XP, and that will be replaced by {theirTrips} quests and {theirXp} XP from {date}.',
  'data.restored': 'Restored {trips} quests and {photos} photos.',
  'data.err.notJson': 'That file is not readable JSON.',
  'data.err.notBackup': 'That is not a BRAW backup file.',
  'data.err.tooNew': 'That backup came from a newer version of BRAW.',
  'data.err.failed': 'The restore failed and nothing was changed.',
  'profile.activity': 'Recent activity',
  'profile.activityEmpty': 'Nothing yet — go make some memories!',

  // ---- activity log / toasts ----
  'act.joined': 'Joined the expedition',
  'act.welcomeBack': 'Welcome back, {name}!',
  'act.welcomeDemo': 'Welcome, {name} — LVL {level} {title} with a quest underway!',
  'act.questCreated': 'Quest created: {title}',
  'act.questCompleted': 'Quest completed: {title}',
  'act.visited': 'Visited {name}',
  'act.unmarked': 'Unmarked {name}',
  'act.unmarkedToast': '{name} unmarked (−{xp} XP)',

  // ---- level up ----
  'level.up': 'LEVEL UP',
  'level.onwards': 'Onwards! →',

  // ---- geofence prompt ----
  // ---- live location ----
  'geo.title': 'Follow my location',
  'geo.explainTitle': 'Turn on live location?',
  'geo.explain': 'BRAW will show where you are on the map and notice when you reach a stop, so you can check in without typing. Your position is used on this device only — it is never sent anywhere, and never stored. Turn it off any time.',
  'geo.explainBattery': 'Keeping a GPS fix uses battery. Switch it off when you are not driving.',
  'geo.allow': 'Turn it on',
  'geo.notNow': 'Not now',
  'geo.on': 'Location on',
  'geo.off': 'Location off',
  'geo.asking': 'Waiting for a fix…',
  'geo.denied': 'Location is blocked for this site. Allow it in your browser settings to use this.',
  'geo.unavailable': 'No location fix available here.',
  'geo.failed': 'Could not get a location fix. Try again in the open.',
  'geo.accuracy': 'accurate to about {n} m',
  'geo.arrivedMeta': '{region} · ✦ {xp} XP · {dist} away',
  'geo.nearest': '{name} · {dist} away',
  'geo.offmap': 'You are outside Scotland, so the dot sits at the edge of the map.',
  'geo.simulate': 'Simulate arrival',
  'geo.simulated': 'Pretending you are at {name}',
  'geo.stopWatching': 'Stop',
  'geo.arrived': "You've arrived",
  'geo.placeholder': 'Location name',
  'geo.confirm': 'Mark visited',
  'geo.dismiss': 'Not yet',
  'geo.unsupported': 'Geolocation is not supported by this browser.',

  // ---- map ----
  'map.aria': 'Map of Scotland with roadtrip stops',
  'map.start': 'START',
  'map.startTitle': 'Start: {name}',
  'map.yourLocation': 'Your location (±{n}m)',
  'map.markerVisited': ' ✓ visited',
  'map.atlantic': 'A T L A N T I C',
  'map.northSea': 'N O R T H&#160;&#160;S E A',

  // ---- time ago ----
  'time.now': 'just now',
  'time.min': '{n}m ago',
  'time.hour': '{n}h ago',
  'time.day': '{n}d ago',

  // ---- footer ----
  'foot.app': 'BRAW · Scotland, UK · GPS &amp; geofencing · mair lands coming soon · progress stored locally',

  // ---- planner: pace + titles ----
  'pace.relaxed': 'Relaxed',
  'pace.steady': 'Steady',
  'pace.ambitious': 'Ambitious',
  'planner.themeDefault': 'Best of Scotland',
  'planner.tripTitle': '{days}-Day {theme} Quest',
  'planner.customTitle': 'My {days}-Day {theme} Journey',
  'planner.themeJoin': '{a} & {b}',
  'planner.demoPrompt': '5 days of castles, whisky and misty lochs starting from Edinburgh',

  // Attribution is not optional: ESA WorldCover is CC BY 4.0.
  'foot.data': 'Terrain: ESA WorldCover 2021 (CC BY 4.0) · elevation from SRTM · coastline from Natural Earth',

  // ---- map key ----
  'map.key.moor': 'Moor & grazing',
  'map.key.forest': 'Forest',
  'map.key.farm': 'Farmland',
  'map.key.water': 'Loch',
  'map.key.town': 'Town',
  'map.key.high': 'High ground',
  'map.key.aria': 'What the colours on the map mean',

  // ---- journey builder ----
  'nav.build': 'Build',
  'build.title': 'Craft your own <em>journey</em>',
  'build.sub': 'Every location in Scotland, yours to arrange. Filter the map, add the stops you want, and watch the distance, timing and kit list follow.',
  'build.startLabel': 'Starting from',
  'build.orderLabel': 'Route order',
  'build.order.auto': 'Shortest first',
  'build.order.manual': 'My order',
  'build.daysLabel': 'Days',
  'build.daysRec': 'suggested: {n}',
  'build.mapHint': 'Tap a small dot to see a location · tap a numbered pin to open a stop',

  'build.stat.stops': 'stops',
  'build.stat.distance': 'distance',
  'build.stat.time': 'total time',
  'build.stat.xp': 'XP on offer',
  'build.hours': '{h} h',
  'build.ferry': 'ferry',
  'build.mins': '{n} min',
  'build.perDay': '≈{h} h a day over {days} days · {drive} h driving, {stops} h at the stops',
  'build.overPacked': 'That is a long day — add a day or drop a stop.',

  'build.tab.route': 'Route',
  'build.tab.add': 'Add stops',
  'build.search': 'Search locations…',
  'build.filters': 'Filter by interest',
  'build.filter.all': 'Everything',
  'build.showing': '{shown} of {total} locations',
  'build.add': 'Add',
  'build.added': 'On route',
  'build.remove': 'Remove from journey',
  'build.addAction': 'Add to journey',
  'build.moveUp': 'Move earlier',
  'build.moveDown': 'Move later',
  'build.noMatch': 'Nothing matches those filters.',
  'build.clearFilters': 'Clear filters',
  'build.routeEmpty': 'Your journey is empty. Pick a few stops and the route draws itself.',
  'build.routeEmptyCta': 'Browse locations →',

  'build.kit': 'Recommended kit',
  'build.kitSub': 'Earned by the stops you chose',
  'build.advisories': 'Before you set off',
  'build.stamps': 'Passport stamps within reach',
  'build.stampsBody': 'Finish this journey and {region} is fully explored.',

  'build.save': 'Save this journey ⚔️',
  'build.clear': 'Start over',
  'build.needStops': 'Add at least two stops before saving.',

  // ---- builder: kit list ----
  'kit.waterproof.name': 'Waterproof jacket',
  'kit.waterproof.why': 'It is Scotland. It will rain, probably sideways.',
  'kit.layers.name': 'Warm layers',
  'kit.layers.why': 'Four seasons in an afternoon, every month of the year.',
  'kit.boots.name': 'Walking boots',
  'kit.boots.why': 'Your route has hill ground on it.',
  'kit.navigation.name': 'Map & compass',
  'kit.navigation.why': 'Phone signal disappears the moment you need it.',
  'kit.headtorch.name': 'Head torch',
  'kit.headtorch.why': 'Short winter days and long descents.',
  'kit.midge.name': 'Midge repellent',
  'kit.midge.why': 'Still evenings by water, May to September.',
  'kit.wetsuit.name': 'Wetsuit',
  'kit.wetsuit.why': 'The water rarely gets past 14°C.',
  'kit.drybag.name': 'Dry bag',
  'kit.drybag.why': 'Keeps a phone and a spare fleece genuinely dry.',
  'kit.buoyancy.name': 'Buoyancy aid',
  'kit.buoyancy.why': 'Non-negotiable on open water.',
  'kit.helmet.name': 'Helmet',
  'kit.helmet.why': 'Required on the trail centres and the crags.',
  'kit.harness.name': 'Harness & rope',
  'kit.harness.why': 'Your route includes roped climbing.',
  'kit.skis.name': 'Skis or board',
  'kit.skis.why': 'Hire is available on the hill, but book ahead.',
  'kit.clubs.name': 'Golf clubs',
  'kit.clubs.why': 'Championship links do not lend gear on the day.',
  'kit.binoculars.name': 'Binoculars',
  'kit.binoculars.why': 'Eagles and ospreys are further away than they look.',
  'kit.camera.name': 'Camera & spare battery',
  'kit.camera.why': 'Cold drains a battery fast, and the light is worth it.',
  'kit.swimkit.name': 'Towel & swim kit',
  'kit.swimkit.why': 'Changing rooms are a rumour out here.',
  'kit.cash.name': 'Some cash',
  'kit.cash.why': 'Island cafés and honesty boxes still prefer it.',

  // ---- builder: advisories ----
  'adv.ferry.name': 'Book the ferry',
  'adv.ferry.body': 'This route crosses water: {list}. Crossings sell out in summer — book the car space weeks ahead, and note the last sailing back.',
  'adv.singletrack.name': 'Single-track roads',
  'adv.singletrack.body': 'Passing places are for passing and overtaking, not parking. Expect journeys to take longer than the map suggests.',
  'adv.munro.name': 'Check the mountain forecast',
  'adv.munro.body': 'High ground makes its own weather. Check MWIS the night before and leave word of your route.',
  'adv.snow.name': 'Winter conditions',
  'adv.snow.body': 'Snow gates close without warning. Check the resort report and carry a shovel if the forecast is turning.',
  'adv.tides.name': 'Mind the tides',
  'adv.tides.body': 'Swell and tide decide whether the sea is playable. Check the tide table before you commit to a coastal plan.',
  'adv.coldwater.name': 'Cold water shock',
  'adv.coldwater.body': 'Enter slowly, never alone, and get warm layers on the moment you are out.',
  'adv.darkness.name': 'Go after dark',
  'adv.darkness.body': 'Your stargazing stop only works on a clear, moonless night — leave the evening free and check the forecast.',
  'adv.booking.name': 'Book your slots',
  'adv.booking.body': 'Distillery tours and the big castles sell timed tickets. Turning up in August rarely works.',
  'adv.driver.name': 'Nominate a driver',
  'adv.driver.body': "Scotland's drink-drive limit is far lower than England's. Most distilleries hand drivers a take-away dram instead.",
  'adv.longHaul.name': 'That is a lot of road',
  'adv.longHaul.body': 'Over {km} of driving. Fuel stops get scarce in the north-west — fill up whenever you pass a pump.',
  'adv.packedDay.name': 'Ambitious days',
  'adv.packedDay.body': 'This works out at roughly {h} hours a day. Consider adding a day, or trimming a stop or two.',

  // ---- interests ----
  'interest.castles': 'Castles',
  'interest.history': 'History',
  'interest.whisky': 'Whisky',
  'interest.hiking': 'Hiking',
  'interest.nature': 'Nature',
  'interest.lochs': 'Lochs',
  'interest.islands': 'Islands',
  'interest.city': 'City & Culture',
  'interest.food': 'Food & Drink',
  'interest.coast': 'Coast & Beaches',
  'interest.wildlife': 'Wildlife',
  'interest.mystery': 'Myths & Films',
  'interest.family': 'Family',
  'interest.driving': 'Scenic Drives',
  'interest.kayaking': 'Kayaking & Water',
  'interest.wildswim': 'Wild Swimming',
  'interest.cycling': 'Cycling & MTB',
  'interest.climbing': 'Climbing',
  'interest.surfing': 'Surfing & Coast',
  'interest.golf': 'Golf',
  'interest.skiing': 'Skiing & Snow',

  // ---- level titles ----
  'level.1': 'Wanderer',
  'level.2': 'Stroller',
  'level.3': 'Rambler',
  'level.4': 'Explorer',
  'level.5': 'Pathfinder',
  'level.6': 'Trailblazer',
  'level.7': 'Munro Bagger',
  'level.8': 'Highlander',
  'level.9': 'Clan Chieftain',
  'level.10': 'Laird o’ the Roads',
  'level.11': 'Legend of Alba',

  // ---- achievement names + descriptions ----
  'ach.first-quest.name': 'The First Step',
  'ach.first-quest.desc': 'Create your first roadtrip quest.',
  'ach.quest-collector.name': 'Serial Planner',
  'ach.quest-collector.desc': 'Create 3 roadtrip quests.',
  'ach.boots-on.name': 'Boots on the Ground',
  'ach.boots-on.desc': 'Mark your first location as visited.',
  'ach.wee-wanderer.name': 'Wee Wanderer',
  'ach.wee-wanderer.desc': 'Visit 5 locations.',
  'ach.seasoned-rambler.name': 'Seasoned Rambler',
  'ach.seasoned-rambler.desc': 'Visit 15 locations.',
  'ach.true-highlander.name': 'True Highlander',
  'ach.true-highlander.desc': 'Visit 30 locations.',
  'ach.storm-the-castle.name': 'Storm the Castle',
  'ach.storm-the-castle.desc': 'Visit your first castle.',
  'ach.keeper-of-keeps.name': 'Keeper of Keeps',
  'ach.keeper-of-keeps.desc': 'Visit 5 castles.',
  'ach.first-dram.name': 'The First Dram',
  'ach.first-dram.desc': 'Visit a whisky distillery.',
  'ach.whisky-sage.name': 'Whisky Sage',
  'ach.whisky-sage.desc': 'Visit 3 whisky locations.',
  'ach.loch-collector.name': 'Loch Collector',
  'ach.loch-collector.desc': 'Visit 3 lochs.',
  'ach.peak-bagger.name': 'Peak Bagger',
  'ach.peak-bagger.desc': 'Summit a mountain hike.',
  'ach.island-hopper.name': 'Island Hopper',
  'ach.island-hopper.desc': 'Visit an island location.',
  'ach.nessie-hunter.name': 'Nessie Hunter',
  'ach.nessie-hunter.desc': 'Pay your respects at Loch Ness.',
  'ach.full-circle.name': 'Full Circle',
  'ach.full-circle.desc': 'Complete every stop on a roadtrip.',
  'ach.compass-rose.name': 'Compass Rose',
  'ach.compass-rose.desc': 'Explore 5 different regions of Scotland.',
  'ach.local-legend.name': 'Local Legend',
  'ach.local-legend.desc': 'Reach level 5.',

  // ---- example prompts ----
  'prompt.1': "I'm really into kayaking — show me the best Scottish rivers and sea routes",
  'prompt.2': '5 days of highland castles and whisky distilleries from Inverness',
  'prompt.3': 'Weekend mountain biking and wild swimming in the Cairngorms',
  'prompt.4': 'I love rock climbing — 3 days of crags and scrambles',
  'prompt.5': 'Family road trip: wildlife, beaches and castles on the west coast',
  'prompt.6': 'Surfing, seafood and sunsets on the north coast',
};

const PL = {
  // ---- document ----
  'a11y.skip': 'Przejdź do treści',
  'foot.privacy': 'Prywatność',
  'foot.safety': 'Bezpieczeństwo',
  'doc.title': 'BRAW — Szkockie wyprawy samochodowe',

  'unit.xp': 'PD',

  // ---- auth: brand panel ----
  'auth.eyebrow': 'Szkocja · Przygoda od zawsze',
  'auth.tagline': 'Twoja osobista szkocka wyprawa, <strong>zaplanowana przystanek po przystanku</strong>.',

  'auth.feat.route.t': 'Plan w jednym zdaniu',
  'auth.feat.route.b': 'Jedno zdanie to gotowa trasa',
  'auth.feat.gps.t': 'GPS na żywo',
  'auth.feat.gps.b': 'Wie, kiedy docierasz na miejsce',
  'auth.feat.xp.t': 'PD i odznaki',
  'auth.feat.xp.b': 'Zdobywaj poziomy, zwiedzając',
  'auth.feat.leaderboard.t': 'Ranking',
  'auth.feat.leaderboard.b': 'Wyprzedzaj innych odkrywców',

  // ---- landing showcase ----
  'showcase.kicker': 'Podgląd na żywo',
  'showcase.cap1': 'Zaplanuj swoją podróż',
  'showcase.cap2': 'Zdobywaj poziomy',
  'showcase.cap3': 'Graj w gry',
  'showcase.cap4': 'Zbieraj odznaki',
  'showcase.aria': 'Animowany podgląd szkockiej wyprawy na mapie BRAW',

  // ---- appearance ----
  'theme.label': 'Wygląd',
  'theme.dark': 'Ciemny',
  'theme.light': 'Jasny',
  'theme.auto': 'Systemowy',

  'auth.stat.places': 'miejsc',
  'auth.stat.interests': 'zainteresowań',
  'auth.stat.badges': 'osiągnięć',
  'auth.foot': 'Prototyp · Tylko Szkocja · GPS i geofencing w zestawie · Żadne dane nie opuszczają Twojego urządzenia',

  // ---- auth: form ----
  'auth.welcome': 'Witaj ponownie',
  'auth.welcomeSub': 'Zaloguj się, aby kontynuować szkocką przygodę.',
  'auth.tab.login': 'Zaloguj się',
  'auth.tab.register': 'Załóż konto',
  'auth.field.name': 'Nazwa odkrywcy',
  'auth.field.namePlaceholder': 'np. BonnieVoyager',
  'auth.field.pass': 'Hasło',
  'auth.submit.login': 'Zaloguj się',
  'auth.submit.register': 'Załóż konto',
  'auth.submit.loginArrow': 'Zaloguj się →',
  'auth.submit.registerArrow': 'Załóż konto →',
  'auth.or': 'lub',
  'auth.demo': 'Wypróbuj konto demo',
  'auth.note': 'Konta są przechowywane lokalnie w Twojej przeglądarce. Żadne dane nie opuszczają tego urządzenia.',

  // ---- auth: errors ----
  'auth.err.nameFormat': 'Nazwa musi mieć 3–24 znaki: litery, cyfry lub _ . -',
  'auth.err.passShort': 'Hasło musi mieć co najmniej 4 znaki.',
  'auth.err.taken': 'Ta nazwa odkrywcy jest już zajęta.',
  'auth.err.noUser': 'Nie znaleziono odkrywcy o tej nazwie.',
  'auth.err.wrongPass': 'Błędne hasło, spróbuj ponownie.',

  // ---- header / nav ----
  'nav.scope': 'SZKOCJA',
  'nav.plan': 'Nowa wyprawa',
  'nav.trips': 'Moje wyprawy',
  'nav.badges': 'Osiągnięcia',
  'nav.leaderboard': 'Ranking',
  'nav.profile': 'Profil',
  'nav.signOut': 'Wyloguj się',
  'nav.language': 'Język',
  'nav.home': 'Powrót do strony głównej',
  'hdr.level': 'POZ. {level}',
  'hdr.xp': '{into} / {need} PD',

  // ---- plan view ----
  'plan.title': 'Dokąd <em>ruszamy</em>?',
  'plan.sub': 'Opowiedz nam o swoich zainteresowaniach — wystarczy jedno zdanie. Ułożymy spersonalizowany plan podróży po Szkocji ze śledzeniem GPS.',
  'plan.placeholder': 'np. Kręcą mnie kajaki i morsowanie… albo 5 dni górskich zamków z Inverness…',
  'plan.hint': '⌘ / Ctrl + Enter, aby wygenerować',
  'plan.go': 'Wygeneruj plan →',
  'plan.generating': 'Wytyczam trasę…',
  'plan.examples': 'Wypróbuj przykład',
  'plan.tooShort': 'Napisz najpierw kilka słów o wymarzonej podróży!',
  'plan.think.read': 'Czytam Twoje życzenia…',
  'plan.think.scout': 'Przeszukuję {count} szkockich miejsc…',
  'plan.think.match': 'Dopasowuję zainteresowania i oceniam przystanki…',
  'plan.think.route': 'Wytyczam najpiękniejszą trasę…',
  'plan.think.polish': 'Dopracowuję Twoją wyprawę…',

  // ---- trip sheet ----
  // ---- sporadyczna podpowiedź poza tematem ----
  'plan.wild.kicker': 'Mała podpowiedź',
  'plan.wild.body': 'Od początku do końca {theme} — nic dodać. Ale przejedziesz tuż obok tych dwóch miejsc, więc trochę szkoda.',
  'plan.wild.bodyOne': 'Od początku do końca {theme} — nic dodać. Ale przejedziesz tuż obok tego miejsca, więc trochę szkoda.',
  'plan.wild.add': 'No dobrze, dodaj je',
  'plan.wild.addOne': 'No dobrze, dodaj je',
  'plan.wild.no': 'Nie, zostawmy czysty motyw',
  'plan.wild.detour': '{region} · {time} · ✦ {xp} PD',
  'plan.wild.added': 'Dodane do trasy. Dobry instynkt.',
  'plan.wild.kept': 'Purysta. Szacunek.',
  'plan.themeOnly': '{n} przystanków, wszystkie w temacie',
  'trip.kicker.draft': 'TWOJA WYPRAWA CZEKA',
  'trip.kicker.active': 'AKTYWNA WYPRAWA',
  'trip.kicker.complete': '🏁 WYPRAWA UKOŃCZONA',
  'trip.bestOf': '✨ To co najlepsze w Szkocji',
  'trip.distance': '🚗 ok. {dist}',
  'trip.pace': '⚡ Tempo: {pace}',
  'trip.xpOffer': '✦ {xp} PD do zdobycia',
  'trip.reshuffle': '🎲 Przetasuj',
  'trip.begin': 'Rozpocznij wyprawę ⚔️',
  'trip.from': '📍 start: {start}',
  'trip.back': '← Wszystkie wyprawy',
  'trip.none': 'Nie wybrano wyprawy.',
  'trip.visitedRatio': '{done}/{total} odwiedzonych',
  'trip.completeBanner': '🎉 Wszystkie przystanki zdobyte! +{xp} PD odebrane. Szkocja Ci salutuje.',
  'trip.ferryBanner': '⛴ Ta wyprawa wymaga przeprawy: {list}. Zarezerwuj z wyprzedzeniem.',
  'trip.nextUp': 'NASTĘPNY CEL',
  'trip.stopOf': '{region} · przystanek {n} z {total} · ✦ {xp} PD',
  'trip.day': 'DZIEŃ {n}',
  'trip.markVisited': 'Oznacz jako odwiedzone',
  'trip.visited': 'Odwiedzone ✓',
  'trip.stopMeta': '{region} · {time} · ',

  // ---- trips list ----
  'trips.title': 'Moje <em>wyprawy</em>',
  'trips.sub': 'Twoje zapisane plany podróży. Otwórz jeden, aby śledzić postępy i włączyć GPS na żywo.',
  'trips.empty.title': 'Brak wypraw!',
  'trips.empty.body': 'Opisz swoją wymarzoną szkocką przygodę, a planer wytyczy Ci trasę.',
  'trips.empty.cta': 'Zaplanuj pierwszą wyprawę →',
  'trips.card.meta': 'dni: {days} · przystanków: {stops} · ok. {dist} · start: {start}',
  'trips.card.completed': 'UKOŃCZONA',
  'trips.card.progress': 'Odwiedzono {done} z {total} miejsc',
  'trips.cta.title': 'Chcesz dodać kolejne wyprawy?',
  'trips.cta.body': 'Opisz następną podróż, a wytyczymy Ci trasę',
  'trips.cta.action': 'Zaplanuj nową wyprawę →',

  // ---- achievements ----
  'badges.title': 'Osiągnięcia',
  'badges.count': 'Odblokowano {owned} z {total}',
  'badges.unlockedOn': 'Odblokowano {date}',
  'badges.reward': 'Nagroda: +{xp} PD',
  'badges.toastKicker': 'Osiągnięcie odblokowane',
  'badges.logged': 'Osiągnięcie odblokowane: {name}',

  // ---- passport ----
  'passport.title': 'Paszport regionów',
  'passport.sub': 'Odwiedź wszystkie miejsca w regionie, aby zdobyć jego pieczątkę.',
  'passport.count': 'Zdobyte pieczątki: {owned} z {total}',
  'passport.stamped': 'Podbito {date}',
  'passport.progress': 'odwiedzono {done}/{total}',
  'passport.earned': 'Pieczątka regionu: {region}',
  'passport.toast': 'Pieczątka w paszporcie — {region}!',

  // ---- mini-game ----
  'nav.play': 'Gra',
  'game.title': 'Zgadnij <em>miejsce</em>',
  'game.sub': 'Opisujemy miejsce w Szkocji. Nazwij je. Jedna pomyłka kończy rundę.',
  'game.start': 'Rozpocznij rundę →',
  'game.again': 'Zagraj ponownie →',
  'game.question': 'Pytanie {n}',
  'game.score': 'Wynik',
  'game.best': 'Rekord',
  'game.hint': 'Potrzebujesz podpowiedzi?',
  'game.hintShown': 'Gdzieś w regionie {region}',
  'game.correct': 'Dobrze!',
  'game.wrong': 'Niestety — to było {name}',
  'game.runOver': 'Koniec rundy',
  'game.runScore': 'Poprawnie nazwanych miejsc: {score}',
  'game.newBest': 'Nowy rekord!',
  'game.capped': 'Dzienny limit PD za grę wyczerpany — graj dalej dla wyniku',
  'game.quit': 'Zakończ rundę',

  // ---- leaderboard ----
  'lb.title': 'Ranking',
  'lb.col.rank': '#',
  'lb.col.explorer': 'Odkrywca',
  'lb.col.level': 'Poziom',
  'lb.col.locations': 'Miejsca',
  'lb.col.quests': 'Ukończone wyprawy',
  'lb.col.xp': 'PD',
  'lb.you': '· TY',
  'lb.note.first': 'Siedzisz na samym szczycie. Broń go!',
  'lb.note.rank': 'Jesteś na miejscu {rank} z {total}. Do wyprzedzenia {name} brakuje Ci {xp} PD.',

  // ---- profile ----
  'profile.levelTitle': 'POZ. {level} · {title}',
  'profile.xpToNext': '{into} / {need} PD do poziomu {next} · łącznie {total} PD',
  'profile.stat.visited': 'odwiedzonych miejsc',
  'profile.stat.created': 'utworzonych wypraw',
  'profile.stat.completed': 'ukończonych wypraw',
  'profile.stat.castles': 'zdobytych zamków',
  'profile.stat.drams': 'skosztowanych whisky',
  'profile.stat.regions': 'poznanych regionów',
  'profile.stat.peaks': 'zdobytych szczytów',
  'profile.stat.badges': 'osiągnięć',
  'profile.stat.stamps': 'pieczątek regionów',
  'profile.stat.photos': 'zrobionych zdjęć',

  // ---- check-in photos ----
  'photo.add': 'Dodaj zdjęcie',
  'photo.replace': 'Zmień zdjęcie',
  'photo.remove': 'Usuń zdjęcie',
  'photo.alt': 'Twoje zdjęcie: {name}',
  'photo.saved': 'Zapisano zdjęcie: {name}',
  'photo.failed': 'Nie udało się odczytać tego obrazu',
  'photo.close': 'Zamknij',
  // ---- zabierz swoje dane ----
  // ---- biblioteka ----
  'nav.library': 'Biblioteka',
  'library.title': '<em>Biblioteka</em>',
  'library.sub': 'Fakty, legendy, historia i język — wszystko zapisane w aplikacji, więc działa całkiem bez zasięgu. Większość otwiera się w miarę podróży.',
  'library.count': '{open} z {total} wpisów otwartych',
  'library.filter.all': 'Wszystko',
  'library.type.fact': 'Fakty',
  'library.type.history': 'Historia',
  'library.type.legend': 'Legendy',
  'library.type.word': 'Słowa',
  'library.type.egg': 'Ukryte',
  'library.locked': 'Jeszcze zamknięte',
  'library.hint.visit': 'Otworzy się po zameldowaniu w: {name}',
  'library.hint.region': 'Otworzy się po zdobyciu pieczątki: {name}',
  'library.hint.level': 'Otworzy się na poziomie {n}',
  'library.hint.egg': 'Gdzieś tam',
  'library.empty': 'Jeszcze tu pusto.',
  'library.newBadge': 'Nowe',
  'library.found': 'Biblioteka: {title}',
  'library.legendNote': 'Opowiadane jako historia, nie jako fakt.',
  'lore.did': 'Z biblioteki',
  'lore.more': 'Jeszcze {n} w bibliotece',
  'profile.stat.lore': 'biblioteka',
  // ---- bezpieczeństwo ----
  'safety.nav': 'Bezpieczeństwo',
  'safety.title': 'Zanim wyruszysz',
  'safety.sub': 'Zapisane w aplikacji, więc czyta się bez zasięgu. Dwie minuty teraz są warte bardzo wiele później.',
  'safety.emergency.t': 'W nagłym wypadku',
  'safety.emergency.b': 'Dzwoń pod 999 albo 112, które działa w każdej sieci, także takiej, z którą nie masz umowy. Po ratownictwo górskie poproś o Police, a potem Mountain Rescue. Przy zdarzeniu na morzu lub wybrzeżu poproś o Coastguard.',
  'safety.sms.t': 'Jeśli nie możesz wykonać połączenia',
  'safety.sms.b': 'SMS alarmowy działa przy słabszym sygnale niż rozmowa, ale trzeba się wcześniej zarejestrować — wyślij słowo register pod 999, póki masz zasięg, i zrób to przed wyjazdem.',
  'safety.word.t': 'Zostaw informację',
  'safety.word.b': 'Powiedz komuś, dokąd idziesz i kiedy wracasz, a po powrocie daj znać. Nikt nie będzie Cię szukał, jeśli nikt nie wie, że zaginąłeś.',
  'safety.weather.t': 'Szczyty tworzą własną pogodę',
  'safety.weather.b': 'Sprawdź prognozę górską wieczorem wcześniej i rano jeszcze raz — MWIS albo prognoza górska Met Office. Wiatr na szczycie bywa dwa razy silniejszy niż w dolinie, a temperatura o kilka stopni niższa.',
  'safety.light.t': 'Szkockie światło dnia',
  'safety.light.b': 'Pod koniec grudnia słońce zachodzi przed czwartą po południu, a na północy wcześniej. Wyznacz godzinę zawracania przed wyjściem i od października do marca zawsze miej czołówkę.',
  'safety.nav.t': 'Nie nawiguj samym telefonem',
  'safety.nav.b': 'Zimno błyskawicznie rozładowuje baterię, a na większości Highlands nie ma zasięgu. Miej papierową mapę i kompas oraz umiejętność ich użycia. Na Cuillin na Skye sama skała odchyla igłę kompasu.',
  'safety.winter.t': 'Zimą to inna góra',
  'safety.winter.b': 'Mniej więcej od listopada do kwietnia szkockie góry wymagają czekana, raków i umiejętności ich użycia. Przed wyjściem wysoko sprawdź prognozę lawinową Scottish Avalanche Information Service.',
  'safety.water.t': 'Zimna woda i pływy',
  'safety.water.b': 'Szkocka woda rzadko przekracza 14°C, a szok zimnowodny jest natychmiastowy. Wchodź powoli, nigdy sam, i od razu ubierz ciepłe warstwy. Na wybrzeżu sprawdź pływy, zanim zdecydujesz się na trasę.',
  'safety.ticks.t': 'Kleszcze',
  'safety.ticks.b': 'Częste w paprociach i wysokiej trawie od wiosny do jesieni, mogą przenosić boreliozę. Zakrywaj nogi, sprawdź się tego samego wieczoru i usuwaj kleszcza właściwym narzędziem, ciągnąc prosto. Przy rozszerzającej się rumieni lub objawach grypowych idź do lekarza.',
  'safety.stalking.t': 'Polowania na jelenie',
  'safety.stalking.b': 'Sezon trwa mniej więcej od lipca do października na byki i od października do lutego na łanie. Prawo dostępu pozostaje, ale sprawdź Heading for the Scottish Hills lub majątek, gdzie odbywa się polowanie, i wybierz sugerowaną trasę.',
  'safety.access.t': 'Dostęp wiąże się z obowiązkami',
  'safety.access.b': 'Szkocja daje prawo odpowiedzialnego dostępu do większości terenów. Zostawiaj bramy tak, jak zastałeś, panuj nad psem przy stadach, zabieraj wszystkie śmieci i biwakuj małym obozem, poza widokiem i krótko.',
  'safety.disclaimer.t': 'Czym ta aplikacja nie jest',
  'safety.disclaimer.b': 'BRAW proponuje miejsca i szacuje trasy. Nie jest systemem nawigacji ani przewodnikiem górskim, a jej odległości i czasy to szacunki, które mogą być błędne. Warunki, godziny otwarcia, rozkłady promów i zamknięcia dróg zmieniają się bez uprzedzenia. Odpowiadasz za własny osąd, swoją grupę i swoje bezpieczeństwo. Nie wychodź w góry, na wodę ani w warunki zimowe ponad swoje doświadczenie.',
  'data.title': 'Twoje dane',
  'data.sub': 'Wszystko jest w tej przeglądarce i nigdzie indziej. Zachowaj kopię.',
  'data.gpx': 'Trasa jako GPX',
  'data.gpxHint': 'Otworzy się w nawigacji, Garminie, OsmAnd lub Komoot',
  'data.geojson': 'Trasa jako GeoJSON',
  'data.geojsonHint': 'Do Google Earth, QGIS i innych narzędzi map',
  'data.backup': 'Pobierz kopię zapasową',
  'data.backupHint': 'Wszystkie wyprawy, odznaki i zdjęcia w jednym pliku',
  'data.restore': 'Przywróć z kopii',
  'data.restoreHint': 'Zastąpi wszystko na tym urządzeniu',
  'data.exported': 'Pobrano {name}',
  'data.warn': 'Wyczyszczenie danych przeglądarki skasuje Twoje postępy. Nie ma konta, z którego można je odzyskać — plik kopii to jedyny egzemplarz.',
  'data.confirm': 'Przywrócić {name}? To urządzenie ma teraz {trips} wypraw i {xp} PD, co zostanie zastąpione przez {theirTrips} wypraw i {theirXp} PD z {date}.',
  'data.restored': 'Przywrócono {trips} wypraw i {photos} zdjęć.',
  'data.err.notJson': 'Tego pliku nie da się odczytać jako JSON.',
  'data.err.notBackup': 'To nie jest plik kopii zapasowej BRAW.',
  'data.err.tooNew': 'Ta kopia pochodzi z nowszej wersji BRAW.',
  'data.err.failed': 'Przywracanie nie powiodło się, nic nie zostało zmienione.',
  'profile.activity': 'Ostatnia aktywność',
  'profile.activityEmpty': 'Jeszcze nic tu nie ma — czas na wspomnienia!',

  // ---- activity log / toasts ----
  'act.joined': 'Dołączono do wyprawy',
  'act.welcomeBack': 'Witaj ponownie, {name}!',
  'act.welcomeDemo': 'Witaj, {name} — POZ. {level} {title}, wyprawa w toku!',
  'act.questCreated': 'Utworzono wyprawę: {title}',
  'act.questCompleted': 'Ukończono wyprawę: {title}',
  'act.visited': 'Odwiedzono: {name}',
  'act.unmarked': 'Cofnięto odwiedziny: {name}',
  'act.unmarkedToast': '{name} — cofnięto odwiedziny (−{xp} PD)',

  // ---- level up ----
  'level.up': 'NOWY POZIOM',
  'level.onwards': 'Naprzód! →',

  // ---- geofence prompt ----
  // ---- lokalizacja na żywo ----
  'geo.title': 'Śledź moją lokalizację',
  'geo.explainTitle': 'Włączyć lokalizację na żywo?',
  'geo.explain': 'BRAW pokaże Twoje położenie na mapie i zauważy, gdy dotrzesz do przystanku, więc zameldujesz się bez pisania. Pozycja jest używana tylko na tym urządzeniu — nigdy nie jest nigdzie wysyłana ani zapisywana. Możesz wyłączyć w każdej chwili.',
  'geo.explainBattery': 'Utrzymywanie sygnału GPS zużywa baterię. Wyłącz, gdy nie jedziesz.',
  'geo.allow': 'Włącz',
  'geo.notNow': 'Nie teraz',
  'geo.on': 'Lokalizacja włączona',
  'geo.off': 'Lokalizacja wyłączona',
  'geo.asking': 'Czekam na sygnał…',
  'geo.denied': 'Lokalizacja jest zablokowana dla tej strony. Zezwól w ustawieniach przeglądarki.',
  'geo.unavailable': 'Brak dostępnego sygnału lokalizacji.',
  'geo.failed': 'Nie udało się ustalić pozycji. Spróbuj na otwartej przestrzeni.',
  'geo.accuracy': 'dokładność około {n} m',
  'geo.arrivedMeta': '{region} · ✦ {xp} PD · {dist} stąd',
  'geo.nearest': '{name} · {dist} stąd',
  'geo.offmap': 'Jesteś poza Szkocją, więc kropka jest na krawędzi mapy.',
  'geo.simulate': 'Symuluj przybycie',
  'geo.simulated': 'Udajemy, że jesteś w: {name}',
  'geo.stopWatching': 'Zatrzymaj',
  'geo.arrived': 'Dotarłeś na miejsce',
  'geo.placeholder': 'Nazwa miejsca',
  'geo.confirm': 'Oznacz jako odwiedzone',
  'geo.dismiss': 'Jeszcze nie',
  'geo.unsupported': 'Ta przeglądarka nie obsługuje geolokalizacji.',

  // ---- map ----
  'map.aria': 'Mapa Szkocji z przystankami wyprawy',
  'map.start': 'START',
  'map.startTitle': 'Start: {name}',
  'map.yourLocation': 'Twoja lokalizacja (±{n} m)',
  'map.markerVisited': ' ✓ odwiedzone',
  'map.atlantic': 'A T L A N T Y K',
  'map.northSea': 'M O R Z E&#160;&#160;P Ó Ł N O C N E',

  // ---- time ago ----
  'time.now': 'przed chwilą',
  'time.min': '{n} min temu',
  'time.hour': '{n} godz. temu',
  'time.day': '{n} dni temu',

  // ---- footer ----
  'foot.app': 'BRAW · Szkocja, Wielka Brytania · GPS i geofencing · kolejne krainy wkrótce · postępy zapisywane lokalnie',

  // ---- planner: pace + titles ----
  'pace.relaxed': 'spokojne',
  'pace.steady': 'umiarkowane',
  'pace.ambitious': 'ambitne',
  'planner.themeDefault': 'To co najlepsze w Szkocji',
  'planner.tripTitle': 'Wyprawa na {days} dni: {theme}',
  'planner.themeJoin': '{a} i {b}',
  'planner.customTitle': 'Moja wyprawa na {days} dni: {theme}',
  'planner.demoPrompt': '5 dni zamków, whisky i mglistych jezior ze startem w Edynburgu',

  'foot.data': 'Teren: ESA WorldCover 2021 (CC BY 4.0) · wysokości ze SRTM · linia brzegowa z Natural Earth',

  // ---- legenda mapy ----
  'map.key.moor': 'Wrzosowiska i pastwiska',
  'map.key.forest': 'Las',
  'map.key.farm': 'Pola uprawne',
  'map.key.water': 'Jezioro',
  'map.key.town': 'Miasto',
  'map.key.high': 'Tereny wysokie',
  'map.key.aria': 'Co oznaczają kolory na mapie',

  // ---- kreator wyprawy ----
  'nav.build': 'Kreator',
  'build.title': 'Zaprojektuj <em>własną</em> wyprawę',
  'build.sub': 'Wszystkie miejsca w Szkocji do Twojej dyspozycji. Filtruj mapę, dodawaj przystanki, a dystans, czas i lista sprzętu policzą się same.',
  'build.startLabel': 'Start z',
  'build.orderLabel': 'Kolejność trasy',
  'build.order.auto': 'Najkrótsza trasa',
  'build.order.manual': 'Moja kolejność',
  'build.daysLabel': 'Dni',
  'build.daysRec': 'sugerowane: {n}',
  'build.mapHint': 'Dotknij małej kropki, aby zobaczyć miejsce · dotknij numerowanej pinezki, aby otworzyć przystanek',

  'build.stat.stops': 'przystanków',
  'build.stat.distance': 'dystans',
  'build.stat.time': 'łączny czas',
  'build.stat.xp': 'PD do zdobycia',
  'build.hours': '{h} godz.',
  'build.ferry': 'prom',
  'build.mins': '{n} min',
  'build.perDay': '≈{h} godz. dziennie przez {days} dni · {drive} godz. jazdy, {stops} godz. na przystankach',
  'build.overPacked': 'To bardzo długi dzień — dodaj dzień albo usuń przystanek.',

  'build.tab.route': 'Trasa',
  'build.tab.add': 'Dodaj przystanki',
  'build.search': 'Szukaj miejsc…',
  'build.filters': 'Filtruj po zainteresowaniach',
  'build.filter.all': 'Wszystko',
  'build.showing': '{shown} z {total} miejsc',
  'build.add': 'Dodaj',
  'build.added': 'Na trasie',
  'build.remove': 'Usuń z wyprawy',
  'build.addAction': 'Dodaj do wyprawy',
  'build.moveUp': 'Przesuń wcześniej',
  'build.moveDown': 'Przesuń później',
  'build.noMatch': 'Nic nie pasuje do tych filtrów.',
  'build.clearFilters': 'Wyczyść filtry',
  'build.routeEmpty': 'Twoja wyprawa jest pusta. Wybierz kilka przystanków, a trasa narysuje się sama.',
  'build.routeEmptyCta': 'Przeglądaj miejsca →',

  'build.kit': 'Zalecany sprzęt',
  'build.kitSub': 'Wynika z wybranych przez Ciebie przystanków',
  'build.advisories': 'Zanim wyruszysz',
  'build.stamps': 'Pieczątki w zasięgu ręki',
  'build.stampsBody': 'Ukończ tę wyprawę, a region {region} będzie zwiedzony w całości.',

  'build.save': 'Zapisz tę wyprawę ⚔️',
  'build.clear': 'Zacznij od nowa',
  'build.needStops': 'Dodaj co najmniej dwa przystanki przed zapisaniem.',

  // ---- kreator: sprzęt ----
  'kit.waterproof.name': 'Kurtka przeciwdeszczowa',
  'kit.waterproof.why': 'To Szkocja. Będzie padać, pewnie poziomo.',
  'kit.layers.name': 'Ciepłe warstwy',
  'kit.layers.why': 'Cztery pory roku w jedno popołudnie, przez cały rok.',
  'kit.boots.name': 'Buty trekkingowe',
  'kit.boots.why': 'Na Twojej trasie są górskie odcinki.',
  'kit.navigation.name': 'Mapa i kompas',
  'kit.navigation.why': 'Zasięg znika dokładnie wtedy, gdy jest potrzebny.',
  'kit.headtorch.name': 'Czołówka',
  'kit.headtorch.why': 'Krótkie zimowe dni i długie zejścia.',
  'kit.midge.name': 'Środek na meszki',
  'kit.midge.why': 'Bezwietrzne wieczory nad wodą, od maja do września.',
  'kit.wetsuit.name': 'Pianka',
  'kit.wetsuit.why': 'Woda rzadko przekracza 14°C.',
  'kit.drybag.name': 'Worek wodoszczelny',
  'kit.drybag.why': 'Telefon i zapasowy polar naprawdę zostaną suche.',
  'kit.buoyancy.name': 'Kamizelka asekuracyjna',
  'kit.buoyancy.why': 'Na otwartej wodzie bez dyskusji.',
  'kit.helmet.name': 'Kask',
  'kit.helmet.why': 'Wymagany na trasach rowerowych i skałkach.',
  'kit.harness.name': 'Uprząż i lina',
  'kit.harness.why': 'Trasa obejmuje wspinaczkę z asekuracją.',
  'kit.skis.name': 'Narty lub deska',
  'kit.skis.why': 'Wypożyczalnia jest na stoku, ale rezerwuj wcześniej.',
  'kit.clubs.name': 'Kije golfowe',
  'kit.clubs.why': 'Mistrzowskie pola nie pożyczają sprzętu z dnia na dzień.',
  'kit.binoculars.name': 'Lornetka',
  'kit.binoculars.why': 'Orły i rybołowy są dalej, niż się wydaje.',
  'kit.camera.name': 'Aparat i zapasowa bateria',
  'kit.camera.why': 'Zimno szybko zjada baterię, a światło jest tego warte.',
  'kit.swimkit.name': 'Ręcznik i strój',
  'kit.swimkit.why': 'Przebieralnie to tutaj legenda.',
  'kit.cash.name': 'Trochę gotówki',
  'kit.cash.why': 'Wyspiarskie kawiarnie i skrzynki zaufania wciąż ją wolą.',

  // ---- kreator: ostrzeżenia ----
  'adv.ferry.name': 'Zarezerwuj prom',
  'adv.ferry.body': 'Ta trasa przecina wodę: {list}. Rejsy wyprzedają się latem — miejsce dla auta rezerwuj z wyprzedzeniem i sprawdź ostatni powrót.',
  'adv.singletrack.name': 'Drogi jednopasmowe',
  'adv.singletrack.body': 'Mijanki służą do mijania i wyprzedzania, nie do parkowania. Przejazdy potrwają dłużej, niż sugeruje mapa.',
  'adv.munro.name': 'Sprawdź prognozę górską',
  'adv.munro.body': 'Góry tworzą własną pogodę. Sprawdź MWIS wieczorem wcześniej i zostaw komuś informację o trasie.',
  'adv.snow.name': 'Warunki zimowe',
  'adv.snow.body': 'Bramy śniegowe zamykają się bez ostrzeżenia. Sprawdź raport ośrodka i weź łopatę, jeśli prognoza się psuje.',
  'adv.tides.name': 'Uważaj na pływy',
  'adv.tides.body': 'Fala i pływ decydują, czy morze nadaje się do pływania. Sprawdź tabelę pływów przed planem nadmorskim.',
  'adv.coldwater.name': 'Szok zimnowodny',
  'adv.coldwater.body': 'Wchodź powoli, nigdy sam, i od razu po wyjściu ubierz ciepłe warstwy.',
  'adv.darkness.name': 'Wybierz się po zmroku',
  'adv.darkness.body': 'Obserwacja gwiazd uda się tylko w bezchmurną, bezksiężycową noc — zostaw wolny wieczór i sprawdź prognozę.',
  'adv.booking.name': 'Zarezerwuj wejściówki',
  'adv.booking.body': 'Wycieczki po destylarniach i duże zamki sprzedają bilety na godzinę. W sierpniu bez rezerwacji się nie uda.',
  'adv.driver.name': 'Wyznacz kierowcę',
  'adv.driver.body': 'Szkocki limit alkoholu za kierownicą jest znacznie niższy niż angielski. Większość destylarni daje kierowcom dram na wynos.',
  'adv.longHaul.name': 'To sporo drogi',
  'adv.longHaul.body': 'Ponad {km} jazdy. Na północnym zachodzie stacje są rzadkie — tankuj przy każdej mijanej.',
  'adv.packedDay.name': 'Ambitne dni',
  'adv.packedDay.body': 'Wychodzi około {h} godz. dziennie. Rozważ dodanie dnia albo usunięcie przystanku lub dwóch.',

  // ---- interests ----
  'interest.castles': 'Zamki',
  'interest.history': 'Historia',
  'interest.whisky': 'Whisky',
  'interest.hiking': 'Wędrówki',
  'interest.nature': 'Przyroda',
  'interest.lochs': 'Jeziora',
  'interest.islands': 'Wyspy',
  'interest.city': 'Miasta i kultura',
  'interest.food': 'Jedzenie i napoje',
  'interest.coast': 'Wybrzeże i plaże',
  'interest.wildlife': 'Dzika przyroda',
  'interest.mystery': 'Mity i filmy',
  'interest.family': 'Rodzinne',
  'interest.driving': 'Widokowe trasy',
  'interest.kayaking': 'Kajaki i woda',
  'interest.wildswim': 'Dzikie pływanie',
  'interest.cycling': 'Rower i MTB',
  'interest.climbing': 'Wspinaczka',
  'interest.surfing': 'Surfing i wybrzeże',
  'interest.golf': 'Golf',
  'interest.skiing': 'Narty i śnieg',

  // ---- level titles ----
  'level.1': 'Wędrowiec',
  'level.2': 'Spacerowicz',
  'level.3': 'Piechur',
  'level.4': 'Odkrywca',
  'level.5': 'Zwiadowca',
  'level.6': 'Pionier',
  'level.7': 'Zdobywca szczytów',
  'level.8': 'Góral',
  'level.9': 'Wódz klanu',
  'level.10': 'Pan Traktów',
  'level.11': 'Legenda Alby',

  // ---- achievement names + descriptions ----
  'ach.first-quest.name': 'Pierwszy krok',
  'ach.first-quest.desc': 'Utwórz swoją pierwszą wyprawę.',
  'ach.quest-collector.name': 'Seryjny planista',
  'ach.quest-collector.desc': 'Utwórz 3 wyprawy.',
  'ach.boots-on.name': 'Buty na ziemi',
  'ach.boots-on.desc': 'Oznacz pierwsze miejsce jako odwiedzone.',
  'ach.wee-wanderer.name': 'Mały wędrowiec',
  'ach.wee-wanderer.desc': 'Odwiedź 5 miejsc.',
  'ach.seasoned-rambler.name': 'Doświadczony piechur',
  'ach.seasoned-rambler.desc': 'Odwiedź 15 miejsc.',
  'ach.true-highlander.name': 'Prawdziwy góral',
  'ach.true-highlander.desc': 'Odwiedź 30 miejsc.',
  'ach.storm-the-castle.name': 'Szturm na zamek',
  'ach.storm-the-castle.desc': 'Odwiedź swój pierwszy zamek.',
  'ach.keeper-of-keeps.name': 'Strażnik warowni',
  'ach.keeper-of-keeps.desc': 'Odwiedź 5 zamków.',
  'ach.first-dram.name': 'Pierwsza whisky',
  'ach.first-dram.desc': 'Odwiedź destylarnię whisky.',
  'ach.whisky-sage.name': 'Mędrzec whisky',
  'ach.whisky-sage.desc': 'Odwiedź 3 miejsca związane z whisky.',
  'ach.loch-collector.name': 'Kolekcjoner jezior',
  'ach.loch-collector.desc': 'Odwiedź 3 jeziora.',
  'ach.peak-bagger.name': 'Zdobywca szczytów',
  'ach.peak-bagger.desc': 'Zdobądź górski szczyt.',
  'ach.island-hopper.name': 'Wyspiarz',
  'ach.island-hopper.desc': 'Odwiedź miejsce na wyspie.',
  'ach.nessie-hunter.name': 'Łowca Nessie',
  'ach.nessie-hunter.desc': 'Złóż wyrazy szacunku nad Loch Ness.',
  'ach.full-circle.name': 'Pełne koło',
  'ach.full-circle.desc': 'Ukończ wszystkie przystanki wyprawy.',
  'ach.compass-rose.name': 'Róża wiatrów',
  'ach.compass-rose.desc': 'Poznaj 5 różnych regionów Szkocji.',
  'ach.local-legend.name': 'Lokalna legenda',
  'ach.local-legend.desc': 'Osiągnij 5. poziom.',

  // ---- example prompts ----
  'prompt.1': 'Kręcą mnie kajaki — pokaż najlepsze szkockie rzeki i trasy morskie',
  'prompt.2': '5 dni górskich zamków i destylarni whisky ze startem w Inverness',
  'prompt.3': 'Weekend na rowerze górskim i dzikie pływanie w Cairngorms',
  'prompt.4': 'Uwielbiam wspinaczkę — 3 dni skałek i grani',
  'prompt.5': 'Rodzinna wyprawa: dzika przyroda, plaże i zamki na zachodnim wybrzeżu',
  'prompt.6': 'Surfing, owoce morza i zachody słońca na północnym wybrzeżu',
};

const STRINGS = { en: EN, pl: PL };

// ============================================================
// Core
// ============================================================

let lang = (() => {
  const saved = localStorage.getItem(LANG_KEY);
  if (saved && STRINGS[saved]) return saved;
  const nav = (navigator.language || '').slice(0, 2).toLowerCase();
  return STRINGS[nav] ? nav : DEFAULT_LANG;
})();

const listeners = new Set();

export function getLang() { return lang; }

export function setLang(next) {
  if (!STRINGS[next] || next === lang) return;
  lang = next;
  localStorage.setItem(LANG_KEY, next);
  document.documentElement.lang = next;
  applyStatic();
  listeners.forEach(fn => fn(next));
}

/** Subscribe to language changes. Returns an unsubscribe function. */
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Translate `key`, interpolating {placeholders} from `params`. */
export function t(key, params) {
  const raw = STRINGS[lang][key] ?? EN[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (m, k) => (params[k] !== undefined ? params[k] : m));
}

/**
 * Apply translations to static markup. Elements opt in with:
 *   data-i18n              → textContent
 *   data-i18n-html         → innerHTML (for strings containing markup)
 *   data-i18n-placeholder  → placeholder attribute
 *   data-i18n-title        → title attribute
 *   data-i18n-aria         → aria-label attribute
 */
export function applyStatic(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  root.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  root.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.dataset.i18nAria));
  });
  if (root === document) document.title = t('doc.title');
}

// ============================================================
// Dataset content helpers
// ============================================================

const CONTENT = { pl: { pois: PL_POIS, regions: PL_REGIONS, times: PL_TIMES, cities: PL_CITIES } };

function overlay(bucket, key) {
  return CONTENT[lang]?.[bucket]?.[key];
}

export function poiName(poi) { return overlay('pois', poi.id)?.name || poi.name; }
export function poiBlurb(poi) { return overlay('pois', poi.id)?.blurb || poi.blurb; }
export function regionName(region) { return overlay('regions', region) || region; }
export function poiTime(time) { return overlay('times', time) || time; }
export function cityName(name) { return overlay('cities', name) || name; }

export function interestLabel(key) { return t(`interest.${key}`); }
export function levelTitle(level) { return t(`level.${Math.min(level, 11)}`); }
export function achievementName(id) { return t(`ach.${id}.name`); }
export function achievementDesc(id) { return t(`ach.${id}.desc`); }

/** Example prompts, localised so the planner receives text it can parse. */
export function examplePrompts() {
  return [1, 2, 3, 4, 5, 6].map(n => t(`prompt.${n}`));
}

/** Metric for Polish, imperial for English — matching local convention. */
export function formatDistance(trip) {
  return lang === 'pl' ? `${trip.distanceKm} km` : `${trip.distanceMi} mi`;
}

/** Locale tag for Intl / toLocaleDateString. */
export function locale() { return lang === 'pl' ? 'pl-PL' : 'en-GB'; }

export function formatNumber(n) { return n.toLocaleString(locale()); }
