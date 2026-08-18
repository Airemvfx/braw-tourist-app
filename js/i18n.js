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
  'doc.title': 'BRAW — Scottish Roadtrip Quests',

  // Experience-point unit, used wherever a bare number is suffixed.
  'unit.xp': 'XP',

  // ---- auth: brand panel ----
  'auth.eyebrow': 'Scotland · Est. Adventure',
  'auth.tagline': 'Your personal Scottish expedition, <strong>intelligently charted</strong>.',

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
  'planner.themeJoin': '{a} & {b}',
  'planner.demoPrompt': '5 days of castles, whisky and misty lochs starting from Edinburgh',

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
  'doc.title': 'BRAW — Szkockie wyprawy samochodowe',

  'unit.xp': 'PD',

  // ---- auth: brand panel ----
  'auth.eyebrow': 'Szkocja · Przygoda od zawsze',
  'auth.tagline': 'Twoja osobista szkocka wyprawa, <strong>inteligentnie zaplanowana</strong>.',

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
  'planner.demoPrompt': '5 dni zamków, whisky i mglistych jezior ze startem w Edynburgu',

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
