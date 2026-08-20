// ============================================================
// BRAW — Scotland dataset: locations, achievements, levels,
// leaderboard seed players.
// Prototype scope: Scotland only (UK). Expandable later.
//
// Structure only — ids, coordinates, icons, tags, scores and the
// keywords the planner matches on. All display text (level titles,
// interest labels, achievement names/descriptions, example prompts,
// and the Polish POI names/blurbs) lives in i18n.js / i18n-content.js
// so there is a single source of truth per language.
// ============================================================

export const POIS = [
  // ---- Edinburgh & Lothians ----
  { id: 'edinburgh-castle', name: 'Edinburgh Castle', region: 'Edinburgh & Lothians', lat: 55.9486, lon: -3.1999, tags: ['castle', 'history', 'city', 'royal'], xp: 50, pop: 10, icon: '🏰', time: '2–3 hrs', blurb: 'Crown jewels, the One O’Clock Gun and a volcano-top fortress glowering over the capital.' },
  { id: 'arthurs-seat', name: 'Arthur’s Seat', region: 'Edinburgh & Lothians', lat: 55.9441, lon: -3.1618, tags: ['hiking', 'nature', 'views', 'city'], xp: 35, pop: 9, icon: '🌋', time: '2 hrs', blurb: 'An extinct volcano in the middle of Edinburgh. Climb it for the best free view in the city.' },
  { id: 'royal-mile', name: 'The Royal Mile', region: 'Edinburgh & Lothians', lat: 55.9496, lon: -3.19, tags: ['city', 'culture', 'food', 'history'], xp: 25, pop: 9, icon: '🎻', time: '2 hrs', blurb: 'Closes, ghost tours, pipers and pubs — the medieval spine of the Old Town.' },
  { id: 'calton-hill', name: 'Calton Hill', region: 'Edinburgh & Lothians', lat: 55.9554, lon: -3.1822, tags: ['views', 'city', 'scenic'], xp: 25, pop: 7, icon: '🏛️', time: '1 hr', blurb: 'Monuments, sunsets and that postcard skyline shot of Princes Street.' },
  { id: 'rosslyn-chapel', name: 'Rosslyn Chapel', region: 'Edinburgh & Lothians', lat: 55.8554, lon: -3.1602, tags: ['history', 'mystery', 'ancient'], xp: 35, pop: 7, icon: '⛪', time: '1.5 hrs', blurb: 'Da Vinci Code carvings and 600 years of secrets in one impossibly ornate chapel.' },
  { id: 'forth-bridge', name: 'Forth Bridge, South Queensferry', region: 'Edinburgh & Lothians', lat: 56.0009, lon: -3.3886, tags: ['engineering', 'views', 'coast', 'scenic'], xp: 30, pop: 7, icon: '🌉', time: '1 hr', blurb: 'The big red Victorian icon — a UNESCO marvel of 53,000 tonnes of steel.' },

  // ---- Glasgow & Clyde ----
  { id: 'kelvingrove', name: 'Kelvingrove Art Gallery', region: 'Glasgow & Clyde', lat: 55.8686, lon: -4.2906, tags: ['city', 'culture', 'art', 'family'], xp: 30, pop: 8, icon: '🖼️', time: '2 hrs', blurb: 'Spitfires, Dalí and a daily organ recital — Glasgow’s grandest free day out.' },
  { id: 'glasgow-necropolis', name: 'Glasgow Necropolis', region: 'Glasgow & Clyde', lat: 55.8628, lon: -4.2317, tags: ['history', 'city', 'mystery', 'views'], xp: 25, pop: 6, icon: '🪦', time: '1.5 hrs', blurb: 'A Victorian city of the dead on a hill — gothic, atmospheric, unforgettable.' },
  { id: 'ashton-lane', name: 'Ashton Lane & West End', region: 'Glasgow & Clyde', lat: 55.8755, lon: -4.2934, tags: ['city', 'food', 'culture'], xp: 25, pop: 7, icon: '🍻', time: 'evening', blurb: 'Fairy-lit cobbles, curry houses and live music — Glasgow at its friendliest.' },

  // ---- Stirling & Forth Valley ----
  { id: 'stirling-castle', name: 'Stirling Castle', region: 'Stirling & Forth Valley', lat: 56.1238, lon: -3.947, tags: ['castle', 'history', 'royal'], xp: 45, pop: 9, icon: '🛡️', time: '2.5 hrs', blurb: 'Where Scotland’s wars were won and lost. Arguably a better castle than Edinburgh’s.' },
  { id: 'wallace-monument', name: 'The Wallace Monument', region: 'Stirling & Forth Valley', lat: 56.1389, lon: -3.922, tags: ['history', 'views', 'film'], xp: 35, pop: 7, icon: '🗡️', time: '1.5 hrs', blurb: '246 steps to Braveheart’s actual sword and a mighty view over the carselands.' },
  { id: 'the-kelpies', name: 'The Kelpies', region: 'Stirling & Forth Valley', lat: 56.0119, lon: -3.757, tags: ['art', 'family', 'folklore', 'engineering'], xp: 30, pop: 7, icon: '🐴', time: '1 hr', blurb: '30-metre steel horse heads — mythical water spirits guarding the canal.' },

  // ---- Loch Lomond & Trossachs ----
  { id: 'loch-lomond', name: 'Loch Lomond & Conic Hill', region: 'Loch Lomond & Trossachs', lat: 56.084, lon: -4.538, tags: ['loch', 'nature', 'hiking', 'scenic'], xp: 40, pop: 9, icon: '🛶', time: 'half day', blurb: 'The bonnie banks themselves. Climb Conic Hill for islands scattered like stepping stones.' },
  { id: 'loch-katrine', name: 'Loch Katrine', region: 'Loch Lomond & Trossachs', lat: 56.2497, lon: -4.4827, tags: ['loch', 'nature', 'scenic', 'family'], xp: 35, pop: 6, icon: '🚢', time: 'half day', blurb: 'Steamship cruises through the landscape that invented Scottish tourism.' },

  // ---- Argyll & the Isles ----
  { id: 'inveraray-castle', name: 'Inveraray Castle', region: 'Argyll & the Isles', lat: 56.2376, lon: -5.0739, tags: ['castle', 'history', 'film'], xp: 35, pop: 6, icon: '🏯', time: '2 hrs', blurb: 'Fairytale turrets on Loch Fyne — seat of Clan Campbell and a Downton Abbey set.' },
  { id: 'kilchurn-castle', name: 'Kilchurn Castle', region: 'Argyll & the Isles', lat: 56.4036, lon: -5.029, tags: ['castle', 'loch', 'scenic', 'history'], xp: 40, pop: 6, icon: '🏚️', time: '1 hr', blurb: 'The most photogenic ruin in Scotland, brooding on the shore of Loch Awe.' },
  { id: 'oban-distillery', name: 'Oban Distillery & Seafront', region: 'Argyll & the Isles', lat: 56.4152, lon: -5.472, tags: ['whisky', 'food', 'coast', 'city'], xp: 35, pop: 7, icon: '🥃', time: '2 hrs', blurb: 'A dram with sea air, then the best seafood shack in Scotland on the pier.' },
  { id: 'tobermory', name: 'Tobermory, Isle of Mull', region: 'Argyll & the Isles', lat: 56.6228, lon: -6.0723, tags: ['island', 'food', 'coast', 'wildlife', 'village'], xp: 40, pop: 7, icon: '🌈', time: 'half day', blurb: 'The rainbow-painted harbour. Eagles overhead, scallops on the quay.' },
  { id: 'fingals-cave', name: 'Fingal’s Cave, Staffa', region: 'Argyll & the Isles', lat: 56.4318, lon: -6.3417, tags: ['island', 'nature', 'wildlife', 'mystery'], xp: 50, pop: 6, icon: '🌊', time: 'half day', blurb: 'A cathedral of hexagonal basalt that inspired Mendelssohn. Puffins included (in season).' },

  // ---- Ayrshire & Arran ----
  { id: 'culzean-castle', name: 'Culzean Castle', region: 'Ayrshire & Arran', lat: 55.3545, lon: -4.79, tags: ['castle', 'coast', 'history', 'family'], xp: 40, pop: 7, icon: '🏖️', time: '3 hrs', blurb: 'A clifftop Georgian masterpiece with its own beach, deer park and Eisenhower suite.' },
  { id: 'goatfell-arran', name: 'Goatfell, Isle of Arran', region: 'Ayrshire & Arran', lat: 55.6258, lon: -5.1918, tags: ['island', 'hiking', 'mountain', 'views'], xp: 45, pop: 6, icon: '🐐', time: '5 hrs', blurb: '“Scotland in miniature” — bag the island’s granite summit between two ferries.' },

  // ---- Highlands (West) ----
  { id: 'glencoe', name: 'Glencoe', region: 'Highlands', lat: 56.6657, lon: -5.1018, tags: ['nature', 'hiking', 'scenic', 'history', 'mountain', 'film'], xp: 55, pop: 10, icon: '⛰️', time: 'half day', blurb: 'The grandest, saddest glen in Scotland. Skyfall was filmed here for a reason.' },
  { id: 'ben-nevis', name: 'Ben Nevis', region: 'Highlands', lat: 56.7969, lon: -5.0036, tags: ['hiking', 'mountain', 'nature'], xp: 60, pop: 8, icon: '🏔️', time: 'full day', blurb: 'The roof of Britain, 1,345m. Earn the biggest bragging rights on the map.' },
  { id: 'glenfinnan-viaduct', name: 'Glenfinnan Viaduct', region: 'Highlands', lat: 56.8762, lon: -5.431, tags: ['film', 'scenic', 'history', 'engineering', 'family'], xp: 50, pop: 9, icon: '🚂', time: '2 hrs', blurb: 'Watch the Jacobite steam train cross the Harry Potter bridge above Loch Shiel.' },
  { id: 'steall-falls', name: 'Steall Falls, Glen Nevis', region: 'Highlands', lat: 56.7702, lon: -4.985, tags: ['waterfall', 'hiking', 'nature'], xp: 40, pop: 6, icon: '💦', time: '2.5 hrs', blurb: 'A wire-bridge gorge walk to Scotland’s second-highest waterfall.' },
  { id: 'eilean-donan', name: 'Eilean Donan Castle', region: 'Highlands', lat: 57.274, lon: -5.5164, tags: ['castle', 'loch', 'scenic', 'film', 'history'], xp: 50, pop: 9, icon: '🏝️', time: '1.5 hrs', blurb: 'Three lochs meet at the most photographed castle in Scotland. Highlander territory.' },

  // ---- Isle of Skye ----
  { id: 'old-man-storr', name: 'Old Man of Storr', region: 'Isle of Skye', lat: 57.5066, lon: -6.183, tags: ['hiking', 'island', 'scenic', 'nature', 'folklore'], xp: 55, pop: 9, icon: '🗿', time: '3 hrs', blurb: 'A jagged rock pinnacle from another planet. The classic Skye pilgrimage.' },
  { id: 'quiraing', name: 'The Quiraing', region: 'Isle of Skye', lat: 57.6437, lon: -6.2645, tags: ['hiking', 'island', 'scenic', 'nature'], xp: 50, pop: 8, icon: '🌄', time: '3 hrs', blurb: 'A landslip labyrinth of cliffs and hidden plateaus. Photographers lose whole days here.' },
  { id: 'fairy-pools', name: 'The Fairy Pools', region: 'Isle of Skye', lat: 57.25, lon: -6.2582, tags: ['nature', 'waterfall', 'island', 'folklore', 'family'], xp: 45, pop: 8, icon: '🧚', time: '2.5 hrs', blurb: 'Crystal-blue cascades under the Black Cuillin. Wild swimmers welcome (it’s baltic).' },
  { id: 'dunvegan-castle', name: 'Dunvegan Castle', region: 'Isle of Skye', lat: 57.4486, lon: -6.5897, tags: ['castle', 'island', 'history', 'folklore'], xp: 40, pop: 6, icon: '🧵', time: '2 hrs', blurb: 'Home of Clan MacLeod for 800 years — and the mysterious Fairy Flag.' },
  { id: 'neist-point', name: 'Neist Point Lighthouse', region: 'Isle of Skye', lat: 57.4233, lon: -6.7878, tags: ['lighthouse', 'coast', 'scenic', 'island', 'views'], xp: 40, pop: 7, icon: '🗼', time: '2 hrs', blurb: 'Skye’s westernmost cliff walk. Sunsets here ruin all other sunsets.' },
  { id: 'talisker', name: 'Talisker Distillery', region: 'Isle of Skye', lat: 57.3027, lon: -6.3565, tags: ['whisky', 'island', 'coast'], xp: 40, pop: 7, icon: '🌶️', time: '1.5 hrs', blurb: 'Peppery, smoky drams made by the sea since 1830.' },
  { id: 'portree', name: 'Portree Harbour', region: 'Isle of Skye', lat: 57.4125, lon: -6.1944, tags: ['village', 'food', 'island', 'coast'], xp: 25, pop: 6, icon: '⚓', time: '1.5 hrs', blurb: 'Pastel houses, fish and chips on the pier, and the gateway to everything Skye.' },

  // ---- Loch Ness & Inverness ----
  { id: 'urquhart-loch-ness', name: 'Loch Ness & Urquhart Castle', region: 'Loch Ness & Inverness', lat: 57.324, lon: -4.442, tags: ['loch', 'castle', 'mystery', 'folklore', 'history', 'family'], xp: 50, pop: 10, icon: '🦕', time: '2.5 hrs', blurb: 'Scan the deep water from a ruined castle. 230m of darkness — she’s down there somewhere.' },
  { id: 'culloden', name: 'Culloden Battlefield', region: 'Loch Ness & Inverness', lat: 57.477, lon: -4.0963, tags: ['history', 'film'], xp: 40, pop: 8, icon: '⚔️', time: '2 hrs', blurb: 'The moor where the Jacobite dream died in 1746. Quietly devastating. Outlander sacred ground.' },
  { id: 'clava-cairns', name: 'Clava Cairns', region: 'Loch Ness & Inverness', lat: 57.4734, lon: -4.074, tags: ['ancient', 'mystery', 'history', 'folklore'], xp: 35, pop: 6, icon: '🪨', time: '1 hr', blurb: '4,000-year-old standing stones — the real-life Craigh na Dun.' },
  { id: 'inverness-old-town', name: 'Inverness Old Town', region: 'Loch Ness & Inverness', lat: 57.4778, lon: -4.2247, tags: ['city', 'food', 'culture'], xp: 20, pop: 6, icon: '🏘️', time: '2 hrs', blurb: 'Capital of the Highlands — riverside walks, Leakey’s bookshop and proper pubs.' },

  // ---- Cairngorms ----
  { id: 'cairngorms-aviemore', name: 'Cairngorms & Rothiemurchus', region: 'Cairngorms', lat: 57.1958, lon: -3.8265, tags: ['nature', 'wildlife', 'hiking', 'forest', 'family'], xp: 40, pop: 8, icon: '🌲', time: 'half day', blurb: 'Ancient Caledonian pine forest, ospreys, red squirrels and Britain’s arctic plateau.' },
  { id: 'loch-morlich', name: 'Loch Morlich', region: 'Cairngorms', lat: 57.1665, lon: -3.725, tags: ['loch', 'beach', 'family', 'nature'], xp: 30, pop: 6, icon: '🏝️', time: '2 hrs', blurb: 'A sandy beach with a mountain backdrop — Scotland’s most surprising swim spot.' },
  { id: 'highland-wildlife-park', name: 'Highland Wildlife Park', region: 'Cairngorms', lat: 57.113, lon: -3.987, tags: ['wildlife', 'family'], xp: 35, pop: 6, icon: '🐯', time: '3 hrs', blurb: 'Polar bears, wildcats and bison in the shadow of the hills.' },
  { id: 'balmoral', name: 'Balmoral Castle', region: 'Cairngorms', lat: 57.0397, lon: -3.2291, tags: ['castle', 'royal', 'history', 'forest'], xp: 40, pop: 7, icon: '👑', time: '2.5 hrs', blurb: 'The royals’ Highland hideaway on Royal Deeside.' },

  // ---- Speyside & Moray ----
  { id: 'glenfiddich', name: 'Glenfiddich Distillery, Dufftown', region: 'Speyside & Moray', lat: 57.4548, lon: -3.128, tags: ['whisky'], xp: 45, pop: 8, icon: '🦌', time: '2 hrs', blurb: 'The valley of the deer — the world’s best-selling single malt, straight from the source.' },
  { id: 'speyside-cooperage', name: 'Speyside Cooperage', region: 'Speyside & Moray', lat: 57.4654, lon: -3.1816, tags: ['whisky', 'culture'], xp: 30, pop: 5, icon: '🛢️', time: '1.5 hrs', blurb: 'Watch coopers fire and hammer 100,000 casks a year. The heartbeat of whisky country.' },
  { id: 'bow-fiddle-rock', name: 'Bow Fiddle Rock, Portknockie', region: 'Speyside & Moray', lat: 57.703, lon: -2.927, tags: ['coast', 'scenic', 'nature', 'views'], xp: 30, pop: 5, icon: '🎻', time: '1 hr', blurb: 'A sea arch shaped like a fiddle bow, busy with nesting seabirds.' },

  // ---- Aberdeenshire & Angus ----
  { id: 'dunnottar', name: 'Dunnottar Castle', region: 'Aberdeenshire & Angus', lat: 56.9461, lon: -2.1971, tags: ['castle', 'coast', 'scenic', 'history', 'views'], xp: 50, pop: 8, icon: '🌅', time: '2 hrs', blurb: 'A ruined fortress on a sea-girt rock. The most dramatic castle setting in Britain.' },
  { id: 'glamis-castle', name: 'Glamis Castle', region: 'Aberdeenshire & Angus', lat: 56.6206, lon: -3.0031, tags: ['castle', 'royal', 'mystery', 'history'], xp: 35, pop: 6, icon: '👻', time: '2.5 hrs', blurb: 'Macbeth’s castle, the Queen Mother’s childhood home — and a sealed secret room.' },

  // ---- Perthshire ----
  { id: 'hermitage-dunkeld', name: 'The Hermitage, Dunkeld', region: 'Perthshire', lat: 56.561, lon: -3.591, tags: ['forest', 'waterfall', 'nature', 'family'], xp: 35, pop: 7, icon: '🍄', time: '1.5 hrs', blurb: 'Giant Douglas firs and a Georgian folly perched over a roaring salmon-leap waterfall.' },
  { id: 'queens-view', name: 'Queen’s View, Loch Tummel', region: 'Perthshire', lat: 56.717, lon: -3.852, tags: ['views', 'loch', 'scenic'], xp: 30, pop: 6, icon: '🔭', time: '45 min', blurb: 'The view Queen Victoria claimed as her own — Schiehallion floating above the loch.' },
  { id: 'schiehallion', name: 'Schiehallion', region: 'Perthshire', lat: 56.667, lon: -4.1, tags: ['hiking', 'mountain', 'folklore'], xp: 45, pop: 5, icon: '📐', time: '5 hrs', blurb: 'The “fairy hill of the Caledonians” — the mountain used to weigh the Earth in 1774.' },
  { id: 'pitlochry-edradour', name: 'Pitlochry & Edradour', region: 'Perthshire', lat: 56.7027, lon: -3.733, tags: ['whisky', 'village', 'food', 'forest'], xp: 30, pop: 6, icon: '🍂', time: 'half day', blurb: 'Victorian spa town with Scotland’s cutest (and smallest) distillery up the hill.' },

  // ---- Fife & Dundee ----
  { id: 'st-andrews', name: 'St Andrews', region: 'Fife & Dundee', lat: 56.3398, lon: -2.7967, tags: ['history', 'golf', 'coast', 'city', 'ancient'], xp: 40, pop: 8, icon: '⛳', time: 'half day', blurb: 'The home of golf, a ruined cathedral, and the beach from Chariots of Fire.' },
  { id: 'east-neuk', name: 'East Neuk fishing villages', region: 'Fife & Dundee', lat: 56.223, lon: -2.702, tags: ['food', 'coast', 'village', 'scenic'], xp: 30, pop: 6, icon: '🦞', time: 'half day', blurb: 'Crail, Anstruther, Pittenweem — lobster creels, harbour walls and award-winning chippies.' },
  { id: 'va-dundee', name: 'V&A Dundee', region: 'Fife & Dundee', lat: 56.4565, lon: -2.967, tags: ['culture', 'art', 'city', 'engineering'], xp: 30, pop: 6, icon: '🛳️', time: '2 hrs', blurb: 'Kengo Kuma’s ship-prow design museum on the Tay, beside Scott’s Antarctic ship Discovery.' },

  // ---- North Coast 500 ----
  { id: 'bealach-na-ba', name: 'Bealach na Bà & Applecross', region: 'North Coast 500', lat: 57.415, lon: -5.708, tags: ['drive', 'scenic', 'mountain', 'views', 'food'], xp: 45, pop: 7, icon: '🛞', time: 'half day', blurb: 'Britain’s wildest road — alpine hairpins to a pub at the edge of the world.' },
  { id: 'corrieshalloch', name: 'Corrieshalloch Gorge', region: 'North Coast 500', lat: 57.755, lon: -5.021, tags: ['nature', 'waterfall', 'views'], xp: 35, pop: 5, icon: '🌉', time: '1 hr', blurb: 'A mile-long slot canyon with a wobbling Victorian suspension bridge over the falls.' },
  { id: 'achmelvich', name: 'Achmelvich Beach', region: 'North Coast 500', lat: 58.167, lon: -5.305, tags: ['beach', 'coast', 'scenic'], xp: 40, pop: 6, icon: '🏄', time: '2 hrs', blurb: 'Caribbean-white sand and turquoise water. Yes, this is really Scotland.' },
  { id: 'smoo-cave', name: 'Smoo Cave, Durness', region: 'North Coast 500', lat: 58.563, lon: -4.719, tags: ['nature', 'coast', 'mystery', 'family'], xp: 45, pop: 6, icon: '🕳️', time: '1.5 hrs', blurb: 'A vast sea cave with a waterfall thundering through its roof. Boat trip into the dark.' },
  { id: 'dunrobin', name: 'Dunrobin Castle', region: 'North Coast 500', lat: 57.9817, lon: -3.9457, tags: ['castle', 'history', 'coast', 'family'], xp: 40, pop: 6, icon: '🦅', time: '2 hrs', blurb: 'A French château lost on the Sutherland coast, with daily falconry on the lawn.' },

  // ---- Borders & the South ----
  { id: 'melrose-abbey', name: 'Melrose Abbey', region: 'Scottish Borders', lat: 55.599, lon: -2.718, tags: ['history', 'ancient', 'mystery'], xp: 35, pop: 5, icon: '🕍', time: '1.5 hrs', blurb: 'Rose-pink ruins holding the buried heart of Robert the Bruce. Find the bagpiping pig gargoyle.' },
  { id: 'grey-mares-tail', name: "Grey Mare’s Tail", region: 'Dumfries & Galloway', lat: 55.425, lon: -3.292, tags: ['waterfall', 'hiking', 'nature'], xp: 30, pop: 5, icon: '🐎', time: '2 hrs', blurb: 'A 60m white plume in the Moffat hills, with wild goats and peregrines for company.' },
  { id: 'caerlaverock', name: 'Caerlaverock Castle', region: 'Dumfries & Galloway', lat: 54.9755, lon: -3.525, tags: ['castle', 'history', 'wildlife'], xp: 35, pop: 5, icon: '🔺', time: '1.5 hrs', blurb: "Scotland’s only triangular castle, moat and all, beside goose-filled salt marshes." },
  { id: 'galloway-dark-sky', name: 'Galloway Dark Sky Park', region: 'Dumfries & Galloway', lat: 55.079, lon: -4.448, tags: ['stargazing', 'nature', 'forest', 'wildlife'], xp: 40, pop: 5, icon: '🌌', time: 'evening', blurb: "The UK's first Dark Sky Park — 7,000 stars and the Milky Way on a clear night." },

  // ---- Kayaking & Water Sports ----
  { id: 'river-spey-kayak', name: 'River Spey Kayak Run', region: 'Speyside & Moray', lat: 57.328, lon: -3.578, tags: ['kayaking', 'watersports', 'nature', 'river'], xp: 45, pop: 7, icon: '🛶', time: 'half day', blurb: 'One of Scotland\'s finest touring rivers — 80 miles of Grade I–III rapids through whisky country.' },
  { id: 'loch-insh', name: 'Loch Insh Watersports Centre', region: 'Cairngorms', lat: 57.098, lon: -3.988, tags: ['kayaking', 'watersports', 'loch', 'family'], xp: 35, pop: 7, icon: '🚣', time: '3 hrs', blurb: 'Kayaking, windsurfing and open-canoe hire on a stunning Cairngorms loch.' },
  { id: 'loch-tay-kayak', name: 'Loch Tay Sea Kayaking', region: 'Perthshire', lat: 56.518, lon: -4.118, tags: ['kayaking', 'watersports', 'loch', 'scenic'], xp: 40, pop: 6, icon: '🌊', time: 'half day', blurb: 'Paddle the length of Perthshire\'s longest loch with Ben Lawers dominating the skyline.' },
  { id: 'river-tummel', name: 'River Tummel White Water', region: 'Perthshire', lat: 56.703, lon: -3.758, tags: ['kayaking', 'watersports', 'river', 'nature'], xp: 40, pop: 5, icon: '💧', time: '3 hrs', blurb: 'Grade III rapids through a spectacular wooded gorge — a bucket-list paddle.' },
  { id: 'portavadie-kayak', name: 'Portavadie Sea Kayaking, Argyll', region: 'Argyll & the Isles', lat: 55.877, lon: -5.315, tags: ['kayaking', 'watersports', 'coast', 'island', 'sea'], xp: 45, pop: 6, icon: '🧭', time: 'half day', blurb: 'Sea-kayak through the Kyles of Bute — sheltered channels fringed with forests and seals.' },
  { id: 'findhorn-gorge', name: 'River Findhorn Gorge', region: 'Highlands', lat: 57.528, lon: -3.942, tags: ['kayaking', 'watersports', 'river', 'nature', 'scenic'], xp: 50, pop: 5, icon: '🏔️', time: '4 hrs', blurb: 'Scotland\'s most dramatic river gorge — inaccessible except by kayak. Extraordinary sandstone walls.' },

  // ---- Wild Swimming ----
  { id: 'plodda-falls', name: 'Plodda Falls & Pool', region: 'Highlands', lat: 57.29, lon: -4.818, tags: ['wildswim', 'waterfall', 'nature', 'forest'], xp: 35, pop: 5, icon: '🏊', time: '2 hrs', blurb: 'A dramatic 46m falls into a jade pool hidden in Victorian Douglas fir forest. Wild swim at the base.' },
  { id: 'loch-an-eilein', name: 'Loch an Eilein Wild Swim', region: 'Cairngorms', lat: 57.14, lon: -3.838, tags: ['wildswim', 'loch', 'nature', 'forest'], xp: 30, pop: 6, icon: '🏰', time: '2 hrs', blurb: 'Swim to a ruined island castle in a mirror-clear Cairngorms loch surrounded by Scots pines.' },
  { id: 'clova-pools', name: 'Glen Clova Swimming Holes', region: 'Aberdeenshire & Angus', lat: 56.85, lon: -3.058, tags: ['wildswim', 'nature', 'river', 'scenic'], xp: 35, pop: 5, icon: '💦', time: '2 hrs', blurb: 'A series of crystal pools and natural slides on the South Esk river in Angus Glens.' },

  // ---- Rock Climbing ----
  { id: 'dumbarton-rock', name: 'Dumbarton Rock Climbing', region: 'Glasgow & Clyde', lat: 55.942, lon: -4.559, tags: ['climbing', 'sport', 'nature'], xp: 40, pop: 6, icon: '🧗', time: '3 hrs', blurb: 'A volcanic plug with routes up to Font 9a — one of the most challenging sport crags in the world.' },
  { id: 'ben-an', name: 'Ben A\'an, Trossachs', region: 'Loch Lomond & Trossachs', lat: 56.248, lon: -4.415, tags: ['climbing', 'hiking', 'nature', 'views'], xp: 35, pop: 7, icon: '⛰️', time: '3 hrs', blurb: 'A compact, dramatic summit with scrambling sections and a jaw-dropping Trossachs panorama.' },
  { id: 'creag-dubh', name: 'Creag Dubh, Newtonmore', region: 'Cairngorms', lat: 57.053, lon: -4.127, tags: ['climbing', 'sport', 'nature'], xp: 35, pop: 5, icon: '🪨', time: '4 hrs', blurb: 'Schist slabs and walls from Severe to E6 — the essential Highland sport climbing venue.' },
  { id: 'shelterstone', name: 'Shelter Stone Crag, Cairngorms', region: 'Cairngorms', lat: 57.068, lon: -3.665, tags: ['climbing', 'mountain', 'nature', 'hiking'], xp: 55, pop: 4, icon: '🗻', time: 'full day', blurb: 'Remote granite architecture in the heart of the Cairngorm Plateau. Scotland\'s most serious mountaineering.' },

  // ---- Mountain Biking ----
  { id: 'glentress', name: 'Glentress Forest, Peebles (7Stanes)', region: 'Scottish Borders', lat: 55.616, lon: -3.161, tags: ['cycling', 'biking', 'forest', 'sport'], xp: 40, pop: 8, icon: '🚵', time: 'half day', blurb: 'Scotland\'s most visited mountain bike trail centre — 65km of trails from green to black.' },
  { id: 'laggan-wolftrax', name: 'Laggan Wolftrax', region: 'Highlands', lat: 56.999, lon: -4.412, tags: ['cycling', 'biking', 'forest', 'sport'], xp: 40, pop: 6, icon: '🐺', time: 'half day', blurb: 'Highland trails through Loch Laggan forest — black runs with mountain panoramas.' },
  { id: 'fort-william-dh', name: 'Fort William Downhill Course', region: 'Highlands', lat: 56.814, lon: -5.108, tags: ['cycling', 'biking', 'mountain', 'sport'], xp: 50, pop: 7, icon: '🏁', time: '4 hrs', blurb: 'The UCI World Cup course on Aonach Mor. Ride where the pros race on the UK\'s most fearsome DH track.' },
  { id: 'ae-forest', name: 'Ae Forest (7Stanes)', region: 'Dumfries & Galloway', lat: 55.21, lon: -3.695, tags: ['cycling', 'biking', 'forest', 'sport'], xp: 35, pop: 5, icon: '🌲', time: '3 hrs', blurb: 'Wild and remote singletrack through Dumfries forest — graded from blue to black.' },

  // ---- Surfing & Coasteering ----
  { id: 'thurso-east', name: 'Thurso East Surf Break', region: 'North Coast 500', lat: 58.594, lon: -3.513, tags: ['surfing', 'coast', 'sport'], xp: 50, pop: 6, icon: '🏄', time: '3 hrs', blurb: 'A world-class reef break delivering powerful barrels. The northernmost quality surf in mainland Britain.' },
  { id: 'machrihanish', name: 'Machrihanish Bay Surfing', region: 'Argyll & the Isles', lat: 55.433, lon: -5.72, tags: ['surfing', 'coast', 'beach', 'sport'], xp: 40, pop: 5, icon: '🌊', time: '3 hrs', blurb: 'A sweeping Atlantic-facing beach with consistent swells and almost no crowds.' },
  { id: 'coldingham-bay', name: 'Coldingham Bay Surf & Dive', region: 'Scottish Borders', lat: 55.896, lon: -2.143, tags: ['surfing', 'coast', 'sport', 'wildswim'], xp: 35, pop: 5, icon: '🤿', time: '3 hrs', blurb: 'A sheltered cove on the Berwickshire coast — good beginner surf and clear waters for snorkelling.' },

  // ---- Golf ----
  { id: 'royal-dornoch', name: 'Royal Dornoch Golf Club', region: 'North Coast 500', lat: 57.876, lon: -4.023, tags: ['golf', 'coast', 'sport'], xp: 45, pop: 7, icon: '⛳', time: '5 hrs', blurb: 'Consistently ranked a top-5 course in the world — an ancient links on the Sutherland coast.' },
  { id: 'carnoustie', name: 'Carnoustie Championship Course', region: 'Fife & Dundee', lat: 56.501, lon: -2.705, tags: ['golf', 'coast', 'sport'], xp: 45, pop: 7, icon: '🏌️', time: '5 hrs', blurb: 'The "Car-nasty" Open venue — arguably the toughest championship links on Earth.' },
  { id: 'gleneagles', name: 'Gleneagles', region: 'Perthshire', lat: 56.274, lon: -3.775, tags: ['golf', 'sport', 'luxury'], xp: 40, pop: 7, icon: '🎩', time: '5 hrs', blurb: 'Three world-class courses in the Perthshire hills — the King\'s, Queen\'s and PGA Centenary.' },

  // ---- Winter Sports ----
  { id: 'cairngorm-ski', name: 'CairnGorm Mountain Ski Resort', region: 'Cairngorms', lat: 57.118, lon: -3.665, tags: ['skiing', 'snowboard', 'mountain', 'sport'], xp: 45, pop: 7, icon: '⛷️', time: 'full day', blurb: 'Scotland\'s largest ski resort with 33 runs up to 1245m. Britain\'s most reliable snow.' },
  { id: 'glencoe-ski', name: 'Glencoe Mountain Resort', region: 'Highlands', lat: 56.652, lon: -4.862, tags: ['skiing', 'snowboard', 'mountain', 'sport', 'scenic'], xp: 40, pop: 6, icon: '🏔️', time: 'full day', blurb: 'Scotland\'s oldest ski resort in the most dramatic mountain setting — Glencoe in winter is unmissable.' },

  // ============================================================
  // City and regional stops, added so short trips have somewhere to go.
  // Every coordinate checked against the land mask and its own city.
  // ============================================================

  // ---- Aberdeenshire & Angus ----
  { id: 'aberdeen-beach', name: 'Aberdeen Beach & Esplanade', region: 'Aberdeenshire & Angus', lat: 57.152, lon: -2.08, tags: ['beach', 'coast', 'city', 'family', 'wildlife'], xp: 20, pop: 6, icon: '🌊', time: '1.5 hrs', blurb: 'Two miles of sand running straight off the end of the city, with dolphins in the bay and the North Sea doing what it does.' },
  { id: 'footdee', name: 'Footdee (Fittie)', region: 'Aberdeenshire & Angus', lat: 57.144, lon: -2.07, tags: ['village', 'coast', 'history', 'city', 'scenic'], xp: 25, pop: 5, icon: '⚓', time: '1 hr', blurb: 'A planned fishing village of 1809 at the harbour mouth, where the cottages face inward onto squares and every shed is decorated differently.' },
  { id: 'old-aberdeen', name: 'Old Aberdeen & King’s College', region: 'Aberdeenshire & Angus', lat: 57.165, lon: -2.101, tags: ['history', 'ancient', 'city', 'culture'], xp: 30, pop: 6, icon: '🎓', time: '2 hrs', blurb: 'Cobbled streets and a crown-topped chapel tower from 1495, when the university was founded by papal bull. It feels like a different town from the granite city.' },
  { id: 'st-machars', name: 'St Machar’s Cathedral', region: 'Aberdeenshire & Angus', lat: 57.169, lon: -2.103, tags: ['history', 'ancient', 'city', 'mystery'], xp: 25, pop: 5, icon: '⛪', time: '1 hr', blurb: 'A fortified granite cathedral with twin spires and a heraldic ceiling of 48 shields. One of William Wallace’s quarters is said to be buried in the walls.' },
  { id: 'aberdeen-maritime', name: 'Aberdeen Maritime Museum', region: 'Aberdeenshire & Angus', lat: 57.147, lon: -2.094, tags: ['culture', 'history', 'city', 'engineering', 'family'], xp: 25, pop: 6, icon: '🛳️', time: '1.5 hrs', blurb: 'Clippers, lighthouses and a three-storey model of an oil platform, in a merchant’s house of 1593 on the old harbour street. Free.' },
  { id: 'duthie-park', name: 'Duthie Park & Winter Gardens', region: 'Aberdeenshire & Angus', lat: 57.13, lon: -2.101, tags: ['nature', 'family', 'city'], xp: 20, pop: 5, icon: '🌺', time: '1.5 hrs', blurb: 'One of Europe’s largest indoor gardens, free and heated, which in an Aberdeen February is not a small thing. Cacti, koi and a talking parrot house.' },
  { id: 'marischal-college', name: 'Marischal College', region: 'Aberdeenshire & Angus', lat: 57.149, lon: -2.098, tags: ['city', 'history', 'engineering', 'views'], xp: 20, pop: 6, icon: '🏛️', time: '45 min', blurb: 'The second-largest granite building in the world, a cliff of grey spikes and pinnacles that turns silver when the sun finally comes out.' },
  { id: 'aberdeen-art-gallery', name: 'Aberdeen Art Gallery', region: 'Aberdeenshire & Angus', lat: 57.149, lon: -2.103, tags: ['art', 'culture', 'city', 'family'], xp: 25, pop: 6, icon: '🎨', time: '1.5 hrs', blurb: 'Reopened in 2019 after a rebuild that added a rooftop gallery. Strong on the Scottish Colourists, and free.' },
  { id: 'torry-battery', name: 'Torry Battery & Dolphin Watch', region: 'Aberdeenshire & Angus', lat: 57.142, lon: -2.064, tags: ['wildlife', 'coast', 'history', 'views'], xp: 30, pop: 6, icon: '🐬', time: '1.5 hrs', blurb: 'A Victorian gun battery above the harbour mouth, and one of the best places in Europe to watch bottlenose dolphins from dry land. Best on a rising tide.' },
  { id: 'balmedie-beach', name: 'Balmedie Beach & Dunes', region: 'Aberdeenshire & Angus', lat: 57.26, lon: -1.99, tags: ['beach', 'coast', 'nature', 'family', 'scenic'], xp: 25, pop: 5, icon: '🏜️', time: '2 hrs', blurb: 'Fourteen miles of dune system north of the city, high enough to lose the wind in and empty enough to lose everyone else.' },
  { id: 'stonehaven-harbour', name: 'Stonehaven Harbour', region: 'Aberdeenshire & Angus', lat: 56.964, lon: -2.21, tags: ['village', 'coast', 'food', 'scenic', 'family'], xp: 25, pop: 6, icon: '🦞', time: '2 hrs', blurb: 'A tidy stone harbour with the open-air Art Deco lido above it, and the chip shop that claims to have invented the deep-fried Mars bar.' },
  { id: 'crathes-castle', name: 'Crathes Castle & Gardens', region: 'Aberdeenshire & Angus', lat: 57.064, lon: -2.438, tags: ['castle', 'history', 'nature', 'family', 'mystery'], xp: 35, pop: 6, icon: '🌷', time: '2.5 hrs', blurb: 'A 16th-century tower house with painted ceilings and eight walled garden rooms with 300-year-old yew hedges. It has a Green Lady too.' },
  { id: 'craigievar-castle', name: 'Craigievar Castle', region: 'Aberdeenshire & Angus', lat: 57.085, lon: -2.66, tags: ['castle', 'history', 'scenic', 'royal'], xp: 35, pop: 6, icon: '🏰', time: '1.5 hrs', blurb: 'A pink fairytale tower finished in 1626 and barely altered since, with turrets that are said to have suggested a certain castle to Walt Disney.' },
  { id: 'fyvie-castle', name: 'Fyvie Castle', region: 'Aberdeenshire & Angus', lat: 57.44, lon: -2.395, tags: ['castle', 'history', 'mystery', 'folklore'], xp: 35, pop: 5, icon: '👻', time: '2 hrs', blurb: 'Five towers, five families, and more ghost stories per square metre than anywhere else in the north-east — a green lady, a secret room and a curse involving three weeping stones.' },
  { id: 'bennachie', name: 'Bennachie', region: 'Aberdeenshire & Angus', lat: 57.256, lon: -2.522, tags: ['hiking', 'mountain', 'views', 'forest', 'nature'], xp: 35, pop: 6, icon: '⛰️', time: '3 hrs', blurb: 'The hill every north-easterner grows up climbing. Only 528 metres, but it stands alone, so the top gives you the whole of Aberdeenshire at once.' },
  { id: 'bullers-of-buchan', name: 'Bullers of Buchan', region: 'Aberdeenshire & Angus', lat: 57.429, lon: -1.818, tags: ['coast', 'nature', 'wildlife', 'scenic', 'views'], xp: 30, pop: 5, icon: '🪶', time: '1.5 hrs', blurb: 'A collapsed sea cave forming a circular chasm the sea pours into, ringed by nesting puffins and kittiwakes in early summer. The path runs right along the edge.' },
  { id: 'slains-castle', name: 'New Slains Castle', region: 'Aberdeenshire & Angus', lat: 57.413, lon: -1.836, tags: ['castle', 'coast', 'mystery', 'history', 'scenic'], xp: 35, pop: 5, icon: '🦇', time: '1.5 hrs', blurb: 'A roofless clifftop ruin where Bram Stoker holidayed while writing, and which is generally held to have furnished Dracula with his castle. Unfenced and genuinely dangerous in wind.' },
  { id: 'dunnottar-woods', name: 'Aden Country Park', region: 'Aberdeenshire & Angus', lat: 57.567, lon: -2.074, tags: ['forest', 'nature', 'family', 'history'], xp: 20, pop: 4, icon: '🌲', time: '2 hrs', blurb: '230 acres of estate woodland and lake with a farming museum in the old semicircular steading. Good for a wet afternoon with children.' },

  // ---- Argyll & the Isles ----
  { id: 'iona-abbey', name: 'Iona Abbey', region: 'Argyll & the Isles', lat: 56.335, lon: -6.393, tags: ['island', 'history', 'ancient', 'mystery', 'coast'], xp: 45, pop: 6, icon: '☘️', time: 'half day', blurb: 'Where Columba landed from Ireland in 563 and Christianity entered Scotland. The Book of Kells may have been made here. Kings of Scotland, Ireland and Norway are buried in the ground outside.' },
  { id: 'kilmartin-glen', name: 'Kilmartin Glen', region: 'Argyll & the Isles', lat: 56.133, lon: -5.489, tags: ['ancient', 'history', 'mystery', 'nature'], xp: 40, pop: 5, icon: '🪨', time: 'half day', blurb: 'Over 350 prehistoric monuments within six miles — cairns in a line, standing stones and rock carvings — plus Dunadd, the hill fort where the kings of Dál Riata were crowned.' },
  { id: 'inveraray-jail', name: 'Inveraray Jail', region: 'Argyll & the Isles', lat: 56.236, lon: -5.074, tags: ['history', 'family', 'culture', 'village'], xp: 25, pop: 5, icon: '⛓️', time: '1.5 hrs', blurb: 'A Georgian courthouse and prison worked by actors in costume, where you sit in the dock, get sentenced, and find out what happened next in 1820.' },
  { id: 'crinan-canal', name: 'Crinan Canal', region: 'Argyll & the Isles', lat: 56.09, lon: -5.55, tags: ['engineering', 'coast', 'cycling', 'scenic', 'village'], xp: 25, pop: 5, icon: '⛵', time: '2.5 hrs', blurb: 'Nine miles of canal built in 1801 to save boats the long haul round the Mull of Kintyre. Fifteen locks, a towpath you can cycle, and a seafood bar at the sea end.' },

  // ---- Ayrshire & Arran ----
  { id: 'burns-cottage', name: 'Burns Cottage, Alloway', region: 'Ayrshire & Arran', lat: 55.434, lon: -4.642, tags: ['history', 'culture', 'village', 'folklore'], xp: 25, pop: 6, icon: '🖋️', time: '2 hrs', blurb: 'The thatched two-room cottage Robert Burns was born in, in 1759, and the kirkyard down the lane where he set Tam o’ Shanter’s witches dancing.' },
  { id: 'brodick-castle', name: 'Brodick Castle, Arran', region: 'Ayrshire & Arran', lat: 55.598, lon: -5.147, tags: ['castle', 'island', 'nature', 'history', 'family'], xp: 35, pop: 6, icon: '🏰', time: '2.5 hrs', blurb: 'Red sandstone above Brodick Bay with a woodland garden of rhododendrons that flower in a Gulf Stream microclimate, and red squirrels in the grounds.' },

  // ---- Cairngorms ----
  { id: 'ruthven-barracks', name: 'Ruthven Barracks', region: 'Cairngorms', lat: 57.062, lon: -4.035, tags: ['history', 'ancient', 'scenic', 'views'], xp: 25, pop: 5, icon: '🏚️', time: '45 min', blurb: 'Government barracks of 1719 on a green mound, where the Jacobites gathered after Culloden and received the order to disperse. They burned it themselves and went home.' },
  { id: 'loch-garten', name: 'Loch Garten Osprey Centre', region: 'Cairngorms', lat: 57.25, lon: -3.69, tags: ['wildlife', 'forest', 'loch', 'family', 'nature'], xp: 35, pop: 6, icon: '🦅', time: '2 hrs', blurb: 'Where ospreys returned to breed in Britain in 1954 after being extinct here for decades. Live nest cameras from April to August, in old Caledonian pine forest.' },
  { id: 'linn-of-dee', name: 'Linn of Dee', region: 'Cairngorms', lat: 56.99, lon: -3.54, tags: ['river', 'nature', 'forest', 'scenic', 'hiking'], xp: 25, pop: 5, icon: '🌊', time: '1.5 hrs', blurb: 'The Dee squeezed through a narrow rock gorge you can look straight down into from a bridge, at the road end where the walks into the high Cairngorms begin.' },
  { id: 'corgarff-castle', name: 'Corgarff Castle', region: 'Cairngorms', lat: 57.165, lon: -3.235, tags: ['castle', 'history', 'scenic', 'skiing'], xp: 25, pop: 4, icon: '⭐', time: '1 hr', blurb: 'A white tower inside a star-shaped defensive wall, alone on the moor at the top of a road that closes in snow. Its history is grim even by Highland standards.' },

  // ---- Dumfries & Galloway ----
  { id: 'threave-castle', name: 'Threave Castle', region: 'Dumfries & Galloway', lat: 54.937, lon: -3.935, tags: ['castle', 'history', 'river', 'wildlife', 'mystery'], xp: 30, pop: 5, icon: '🚣', time: '2 hrs', blurb: 'A grim island tower of the Black Douglases, reached by ringing a bell for the boatman. Ospreys nest nearby in summer.' },
  { id: 'sweetheart-abbey', name: 'Sweetheart Abbey', region: 'Dumfries & Galloway', lat: 54.982, lon: -3.622, tags: ['history', 'ancient', 'village', 'mystery'], xp: 25, pop: 4, icon: '❤️', time: '1 hr', blurb: 'Red sandstone ruins founded in 1273 by Lady Devorgilla, who carried her husband’s embalmed heart with her for twenty-two years and was buried holding it.' },

  // ---- Edinburgh & Lothians ----
  { id: 'national-museum', name: 'National Museum of Scotland', region: 'Edinburgh & Lothians', lat: 55.9469, lon: -3.1896, tags: ['city', 'culture', 'history', 'family', 'art'], xp: 30, pop: 9, icon: '🦕', time: '3 hrs', blurb: 'Dolly the sheep, a Lewis chessman and a whale skeleton under a Victorian glass roof. Free, enormous, and the roof terrace has one of the best views in town.' },
  { id: 'scottish-national-gallery', name: 'Scottish National Gallery', region: 'Edinburgh & Lothians', lat: 55.9507, lon: -3.1959, tags: ['city', 'art', 'culture'], xp: 25, pop: 7, icon: '🖼️', time: '1.5 hrs', blurb: 'Titian, Vermeer and Raeburn’s skating minister, free, right on Princes Street between the Old Town and the New.' },
  { id: 'holyrood-palace', name: 'Palace of Holyroodhouse', region: 'Edinburgh & Lothians', lat: 55.9527, lon: -3.1722, tags: ['castle', 'royal', 'history', 'city'], xp: 35, pop: 8, icon: '👑', time: '2 hrs', blurb: 'The King’s official residence in Scotland, at the foot of the Royal Mile. Mary, Queen of Scots lived here, and her secretary was murdered in the room they will show you.' },
  { id: 'dean-village', name: 'Dean Village', region: 'Edinburgh & Lothians', lat: 55.952, lon: -3.218, tags: ['city', 'scenic', 'village', 'history'], xp: 20, pop: 7, icon: '🏘️', time: '1 hr', blurb: 'A former milling hamlet on the Water of Leith, five minutes from Princes Street and about four hundred years away from it.' },
  { id: 'water-of-leith', name: 'Water of Leith Walkway', region: 'Edinburgh & Lothians', lat: 55.956, lon: -3.226, tags: ['city', 'nature', 'river', 'hiking'], xp: 20, pop: 6, icon: '🌳', time: '2 hrs', blurb: 'Twelve miles of wooded riverside path threading the whole city, with Antony Gormley figures standing in the water along the way.' },
  { id: 'leith-shore', name: 'The Shore, Leith', region: 'Edinburgh & Lothians', lat: 55.9757, lon: -3.17, tags: ['city', 'food', 'coast', 'culture'], xp: 25, pop: 7, icon: '🦪', time: 'evening', blurb: 'Edinburgh’s old port, now the best eating in the city — Michelin stars and chip shops on the same cobbled quay.' },
  { id: 'portobello-beach', name: 'Portobello Beach', region: 'Edinburgh & Lothians', lat: 55.954, lon: -3.113, tags: ['beach', 'coast', 'family', 'city', 'wildswim'], xp: 20, pop: 6, icon: '🏖️', time: '2 hrs', blurb: 'Two miles of sand with a Victorian promenade, twenty minutes from the castle by bus. Swimmers go in all year, which tells you something about them.' },
  { id: 'greyfriars', name: 'Greyfriars Kirkyard', region: 'Edinburgh & Lothians', lat: 55.947, lon: -3.1913, tags: ['history', 'mystery', 'city', 'folklore'], xp: 25, pop: 7, icon: '🐕', time: '1 hr', blurb: 'A loyal terrier, a covenanters’ prison, and surnames on the stones that a certain author borrowed for her wizards.' },
  { id: 'royal-botanic-edinburgh', name: 'Royal Botanic Garden Edinburgh', region: 'Edinburgh & Lothians', lat: 55.965, lon: -3.21, tags: ['nature', 'family', 'city', 'forest'], xp: 25, pop: 7, icon: '🌿', time: '2 hrs', blurb: 'Seventy acres and a Victorian glasshouse, founded in 1670 as a physic garden. Free to walk, and the view of the skyline from the top lawn is the one on the postcards.' },
  { id: 'scott-monument', name: 'The Scott Monument', region: 'Edinburgh & Lothians', lat: 55.952, lon: -3.193, tags: ['city', 'history', 'views', 'engineering'], xp: 20, pop: 7, icon: '🗼', time: '45 min', blurb: '287 steps up the largest monument to a writer anywhere in the world, and the staircase narrows the whole way.' },
  { id: 'edinburgh-zoo', name: 'Edinburgh Zoo', region: 'Edinburgh & Lothians', lat: 55.942, lon: -3.268, tags: ['family', 'wildlife', 'city'], xp: 25, pop: 7, icon: '🐧', time: '3 hrs', blurb: 'Built on a hillside, so you climb as you go. The penguin parade has been running since the 1950s and is exactly as good as it sounds.' },
  { id: 'grassmarket', name: 'The Grassmarket', region: 'Edinburgh & Lothians', lat: 55.9475, lon: -3.1955, tags: ['city', 'food', 'history', 'culture'], xp: 20, pop: 7, icon: '🍺', time: 'evening', blurb: 'Pubs under the castle rock, on the square where they used to hang people. One inn is named after a woman who survived it.' },

  // ---- Fife & Dundee ----
  { id: 'rrs-discovery', name: 'RRS Discovery', region: 'Fife & Dundee', lat: 56.457, lon: -2.969, tags: ['history', 'engineering', 'family', 'city', 'coast'], xp: 30, pop: 7, icon: '⛵', time: '2 hrs', blurb: 'Scott’s Antarctic ship, built in Dundee in 1901 and back where she started. You can go below into the cabins and the wardroom.' },
  { id: 'dundee-law', name: 'Dundee Law', region: 'Fife & Dundee', lat: 56.468, lon: -2.984, tags: ['views', 'city', 'hiking', 'history'], xp: 20, pop: 6, icon: '🌄', time: '1 hr', blurb: 'An extinct volcano in the middle of the city. From the top you get both Tay bridges, the Fife coast and, on a clear day, the Cairngorms.' },
  { id: 'broughty-ferry', name: 'Broughty Ferry & Castle', region: 'Fife & Dundee', lat: 56.467, lon: -2.869, tags: ['castle', 'beach', 'coast', 'village', 'food'], xp: 25, pop: 6, icon: '🏖️', time: '2 hrs', blurb: 'A 15th-century tower standing in the water at the river mouth, a sandy beach beside it, and the best ice cream in Tayside up the road.' },
  { id: 'verdant-works', name: 'Verdant Works', region: 'Fife & Dundee', lat: 56.462, lon: -2.982, tags: ['history', 'culture', 'city', 'engineering'], xp: 25, pop: 5, icon: '🧵', time: '2 hrs', blurb: 'A restored jute mill telling the story of the trade that built Dundee — and of the women who worked it, who outnumbered the men three to one.' },
  { id: 'camperdown-park', name: 'Camperdown Country Park', region: 'Fife & Dundee', lat: 56.488, lon: -3.04, tags: ['family', 'wildlife', 'nature', 'forest', 'city'], xp: 20, pop: 5, icon: '🐻', time: '2.5 hrs', blurb: '400 acres of parkland with a small wildlife centre — brown bears, lynx and Scottish wildcats — and one of the largest tree collections in Scotland.' },
  { id: 'falkland-palace', name: 'Falkland Palace', region: 'Fife & Dundee', lat: 56.253, lon: -3.206, tags: ['castle', 'royal', 'history', 'village', 'sport'], xp: 30, pop: 5, icon: '🎾', time: '2 hrs', blurb: 'A Renaissance hunting palace of the Stuarts in a conservation village, with the oldest real tennis court still in use anywhere in the world, built in 1541.' },
  { id: 'culross', name: 'Culross', region: 'Fife & Dundee', lat: 56.056, lon: -3.63, tags: ['village', 'history', 'film', 'scenic', 'coast'], xp: 30, pop: 6, icon: '🏘️', time: '2 hrs', blurb: 'A complete 17th-century burgh in ochre and crow-stepped gables, so intact that Outlander used it as a village without changing much.' },
  { id: 'dunfermline-abbey', name: 'Dunfermline Abbey & Palace', region: 'Fife & Dundee', lat: 56.071, lon: -3.463, tags: ['history', 'ancient', 'royal', 'city'], xp: 30, pop: 5, icon: '🕍', time: '1.5 hrs', blurb: 'Robert the Bruce is buried under the pulpit — without his heart, which went to Melrose. Scotland’s royal burial place before Iona and after Dunkeld.' },
  { id: 'aberdour-castle', name: 'Aberdour Castle & Silver Sands', region: 'Fife & Dundee', lat: 56.055, lon: -3.3, tags: ['castle', 'beach', 'history', 'family', 'coast'], xp: 25, pop: 5, icon: '🏖️', time: '2 hrs', blurb: 'One of the oldest standing castles in Scotland with a terraced garden and a beehive doocot, and a good sandy beach five minutes down the hill.' },

  // ---- Glasgow & Clyde ----
  { id: 'riverside-museum', name: 'Riverside Museum', region: 'Glasgow & Clyde', lat: 55.8656, lon: -4.306, tags: ['city', 'culture', 'family', 'engineering'], xp: 30, pop: 8, icon: '🚋', time: '2.5 hrs', blurb: 'Zaha Hadid’s zigzag shed full of trams, locomotives and a recreated 1900s street, with a tall ship moored outside. Free.' },
  { id: 'glasgow-science-centre', name: 'Glasgow Science Centre', region: 'Glasgow & Clyde', lat: 55.859, lon: -4.294, tags: ['family', 'city', 'engineering', 'culture'], xp: 25, pop: 7, icon: '🔬', time: '3 hrs', blurb: 'Three floors of things to press beside the Clyde, plus a planetarium and a 127-metre tower that turns to face the wind.' },
  { id: 'glasgow-cathedral', name: 'Glasgow Cathedral', region: 'Glasgow & Clyde', lat: 55.8628, lon: -4.235, tags: ['history', 'ancient', 'city', 'mystery'], xp: 30, pop: 7, icon: '⛪', time: '1.5 hrs', blurb: 'The only medieval cathedral on the Scottish mainland to survive the Reformation complete, built over the tomb of the city’s founder.' },
  { id: 'burrell-collection', name: 'The Burrell Collection, Pollok Park', region: 'Glasgow & Clyde', lat: 55.828, lon: -4.31, tags: ['art', 'culture', 'nature', 'city', 'family'], xp: 30, pop: 7, icon: '🏺', time: '3 hrs', blurb: 'One shipping magnate’s eight thousand objects — Degas, Ming, medieval glass — in a glass building in a country park with Highland cattle outside.' },
  { id: 'glasgow-botanic', name: 'Glasgow Botanic Gardens', region: 'Glasgow & Clyde', lat: 55.879, lon: -4.29, tags: ['nature', 'city', 'family'], xp: 20, pop: 6, icon: '🌴', time: '1.5 hrs', blurb: 'The Kibble Palace, a curved iron glasshouse of 1873, full of tree ferns and marble statues. Free, and warm in February.' },
  { id: 'peoples-palace', name: 'People’s Palace & Glasgow Green', region: 'Glasgow & Clyde', lat: 55.851, lon: -4.238, tags: ['city', 'history', 'culture', 'family'], xp: 20, pop: 6, icon: '🏛️', time: '1.5 hrs', blurb: 'A museum of ordinary Glasgow life on the city’s oldest park, with a winter garden glasshouse stuck on the back.' },
  { id: 'mackintosh-willow', name: 'Mackintosh at the Willow', region: 'Glasgow & Clyde', lat: 55.863, lon: -4.256, tags: ['art', 'culture', 'food', 'city'], xp: 25, pop: 6, icon: '🫖', time: '1.5 hrs', blurb: 'Charles Rennie Mackintosh designed everything here in 1903, down to the cutlery and the waitresses’ dresses. Restored and serving tea again.' },
  { id: 'finnieston-clyde', name: 'Finnieston & the Clyde Arc', region: 'Glasgow & Clyde', lat: 55.858, lon: -4.283, tags: ['city', 'food', 'culture', 'engineering'], xp: 20, pop: 7, icon: '🍽️', time: 'evening', blurb: 'The old shipyard district turned into Glasgow’s eating strip, under the Finnieston Crane that once lifted locomotives onto ships.' },
  { id: 'the-barras', name: 'The Barras & Barrowland', region: 'Glasgow & Clyde', lat: 55.855, lon: -4.236, tags: ['city', 'culture', 'food', 'history'], xp: 20, pop: 6, icon: '🎪', time: '2 hrs', blurb: 'A weekend market since the 1920s, and above it the Barrowland Ballroom — a sprung dance floor that bands will tell you is the best room in Britain.' },

  // ---- Highlands ----
  { id: 'plockton', name: 'Plockton', region: 'Highlands', lat: 57.335, lon: -5.656, tags: ['village', 'coast', 'scenic', 'food', 'film'], xp: 30, pop: 6, icon: '🌴', time: '2 hrs', blurb: 'A sheltered bay so mild that palm trees grow on the seafront, with a row of white cottages and boats on moorings. Improbable, and entirely real.' },
  { id: 'torridon', name: 'Torridon', region: 'Highlands', lat: 57.546, lon: -5.501, tags: ['mountain', 'hiking', 'scenic', 'nature', 'views'], xp: 50, pop: 7, icon: '🏔️', time: 'full day', blurb: 'Sandstone mountains three times older than the rock of most of the Alps, rising almost straight out of the sea loch. Liathach and Beinn Eighe are among the finest hills in Britain.' },
  { id: 'inverewe-garden', name: 'Inverewe Garden', region: 'Highlands', lat: 57.775, lon: -5.598, tags: ['nature', 'coast', 'family', 'scenic'], xp: 30, pop: 5, icon: '🌸', time: '2.5 hrs', blurb: 'A subtropical garden at the same latitude as Siberia, made possible by the Gulf Stream and a shelter belt planted in 1862 on what was bare rock.' },
  { id: 'glen-affric', name: 'Glen Affric', region: 'Highlands', lat: 57.274, lon: -4.954, tags: ['forest', 'nature', 'scenic', 'hiking', 'loch'], xp: 40, pop: 6, icon: '🌲', time: 'half day', blurb: 'Often called the most beautiful glen in Scotland — one of the largest surviving fragments of the ancient Caledonian pine forest, reflected in a chain of lochs.' },
  { id: 'ardnamurchan-point', name: 'Ardnamurchan Point', region: 'Highlands', lat: 56.727, lon: -6.227, tags: ['lighthouse', 'coast', 'scenic', 'views', 'drive'], xp: 40, pop: 5, icon: '🗼', time: 'half day', blurb: 'The most westerly point of the British mainland, with an Egyptian-styled lighthouse and, on a clear evening, the whole chain of the Inner Hebrides laid out.' },

  // ---- Isle of Skye ----
  { id: 'sligachan', name: 'Sligachan, Skye', region: 'Isle of Skye', lat: 57.29, lon: -6.171, tags: ['mountain', 'island', 'scenic', 'folklore', 'hiking'], xp: 35, pop: 7, icon: '🌁', time: '1.5 hrs', blurb: 'The old bridge with the Black Cuillin behind it — the most photographed view on Skye. Dip your face in the river for eternal beauty, if the legend is to be believed.' },
  { id: 'elgol', name: 'Elgol', region: 'Isle of Skye', lat: 57.145, lon: -6.112, tags: ['island', 'coast', 'scenic', 'views', 'village'], xp: 35, pop: 6, icon: '⛵', time: 'half day', blurb: 'A slipway at the end of a long single-track road, facing the full amphitheatre of the Cuillin across Loch Scavaig. Boats run from here to Loch Coruisk.' },
  { id: 'kilt-rock', name: 'Kilt Rock & Mealt Falls', region: 'Isle of Skye', lat: 57.612, lon: -6.173, tags: ['waterfall', 'coast', 'island', 'scenic', 'views'], xp: 30, pop: 7, icon: '💧', time: '45 min', blurb: 'A basalt cliff pleated like a kilt, with a waterfall dropping 60 metres straight into the sea beside it. Five minutes from the car park.' },
  { id: 'coral-beach', name: 'Coral Beach, Claigan', region: 'Isle of Skye', lat: 57.49, lon: -6.61, tags: ['beach', 'island', 'coast', 'scenic', 'wildswim'], xp: 30, pop: 5, icon: '🐚', time: '2 hrs', blurb: 'Not coral but crushed maerl seaweed, bleached white, which turns the water an improbable turquoise on the rare bright day. A mile’s easy walk from the road.' },

  // ---- Loch Lomond & Trossachs ----
  { id: 'loch-lomond-shores', name: 'Balloch & Loch Lomond Shores', region: 'Loch Lomond & Trossachs', lat: 56.0, lon: -4.58, tags: ['loch', 'family', 'watersports', 'food', 'village'], xp: 20, pop: 6, icon: '🚤', time: '2 hrs', blurb: 'The southern gateway to the loch: boat trips, paddleboard hire, an aquarium and a beach, forty minutes from Glasgow by train.' },
  { id: 'the-cobbler', name: 'The Cobbler (Ben Arthur)', region: 'Loch Lomond & Trossachs', lat: 56.2, lon: -4.76, tags: ['hiking', 'mountain', 'climbing', 'views', 'scenic'], xp: 45, pop: 7, icon: '🪨', time: '5 hrs', blurb: 'The most distinctive skyline in the southern Highlands. To have truly climbed it you must thread the eye of the summit rock and step round onto the exposed top block.' },
  { id: 'bracklinn-falls', name: 'Callander & Bracklinn Falls', region: 'Loch Lomond & Trossachs', lat: 56.25, lon: -4.2, tags: ['waterfall', 'forest', 'hiking', 'family', 'village'], xp: 25, pop: 5, icon: '🌉', time: '2 hrs', blurb: 'A gorge and a footbridge above tumbling falls, twenty minutes’ walk from a town full of tearooms. The original bridge was carried away by a flood in 2004.' },
  { id: 'inchmahome', name: 'Inchmahome Priory', region: 'Loch Lomond & Trossachs', lat: 56.175, lon: -4.3, tags: ['island', 'history', 'ancient', 'loch', 'mystery'], xp: 30, pop: 5, icon: '🛶', time: '2 hrs', blurb: 'An island priory on the Lake of Menteith, reached by ferry, where the four-year-old Mary, Queen of Scots was hidden in 1547 before being shipped to France.' },

  // ---- Loch Ness & Inverness ----
  { id: 'inverness-castle', name: 'Inverness Castle Viewpoint', region: 'Loch Ness & Inverness', lat: 57.477, lon: -4.225, tags: ['castle', 'city', 'views', 'history'], xp: 20, pop: 6, icon: '🏰', time: '45 min', blurb: 'Red sandstone above the River Ness, and the terrace gives you the whole town, the river and the hills beyond it in one turn of the head.' },
  { id: 'ness-islands', name: 'Ness Islands', region: 'Loch Ness & Inverness', lat: 57.468, lon: -4.234, tags: ['nature', 'city', 'river', 'family', 'forest'], xp: 20, pop: 5, icon: '🌉', time: '1 hr', blurb: 'Wooded river islands joined by Victorian suspension footbridges, ten minutes’ walk from the middle of Inverness and completely quiet.' },
  { id: 'fort-george', name: 'Fort George', region: 'Loch Ness & Inverness', lat: 57.583, lon: -4.07, tags: ['history', 'engineering', 'coast', 'wildlife'], xp: 35, pop: 6, icon: '🛡️', time: '2.5 hrs', blurb: 'The mightiest artillery fortification in Britain, built after Culloden to make sure it never happened again, and never attacked. Dolphins pass the ramparts.' },
  { id: 'cawdor-castle', name: 'Cawdor Castle', region: 'Loch Ness & Inverness', lat: 57.524, lon: -3.929, tags: ['castle', 'history', 'nature', 'mystery', 'film'], xp: 35, pop: 6, icon: '🌳', time: '2.5 hrs', blurb: 'Still lived in, still has a holly tree growing in the vaulted basement that the family built the tower around in 1454. Shakespeare gave the title to Macbeth; the castle came later.' },
  { id: 'chanonry-point', name: 'Chanonry Point', region: 'Loch Ness & Inverness', lat: 57.575, lon: -4.095, tags: ['wildlife', 'coast', 'lighthouse', 'scenic', 'views'], xp: 40, pop: 7, icon: '🐬', time: '2 hrs', blurb: 'The single best place in Britain to see bottlenose dolphins from the shore — they hunt salmon in the narrows on a rising tide, sometimes a few metres out.' },
  { id: 'beauly-priory', name: 'Beauly Priory', region: 'Loch Ness & Inverness', lat: 57.478, lon: -4.47, tags: ['history', 'ancient', 'village', 'mystery'], xp: 20, pop: 4, icon: '🕍', time: '1 hr', blurb: 'A roofless 13th-century priory in a village square, with an elm outside that is among the oldest in Europe. Mary, Queen of Scots is supposed to have named the place.' },

  // ---- North Coast 500 ----
  { id: 'sandwood-bay', name: 'Sandwood Bay', region: 'North Coast 500', lat: 58.535, lon: -5.05, tags: ['beach', 'coast', 'hiking', 'nature', 'scenic'], xp: 50, pop: 5, icon: '🥾', time: 'half day', blurb: 'A mile of pink sand with a sea stack at one end, four and a half miles from the nearest road on foot. There is no other way to reach it, which is the point.' },
  { id: 'handa-island', name: 'Handa Island', region: 'North Coast 500', lat: 58.38, lon: -5.18, tags: ['island', 'wildlife', 'coast', 'hiking', 'nature'], xp: 45, pop: 5, icon: '🐦', time: 'half day', blurb: 'A seabird reserve reached by a small boat from Tarbet: guillemots, razorbills and great skuas in tens of thousands on 100-metre cliffs, from April to August.' },

  // ---- Perthshire ----
  { id: 'scone-palace', name: 'Scone Palace', region: 'Perthshire', lat: 56.416, lon: -3.437, tags: ['castle', 'royal', 'history', 'ancient', 'nature'], xp: 35, pop: 6, icon: '👑', time: '2.5 hrs', blurb: 'The crowning place of Scottish kings for centuries, on the Moot Hill where the Stone of Destiny sat. Peacocks on the lawn and a hedge maze.' },
  { id: 'kinnoull-hill', name: 'Kinnoull Hill', region: 'Perthshire', lat: 56.393, lon: -3.4, tags: ['views', 'hiking', 'forest', 'scenic', 'nature'], xp: 25, pop: 5, icon: '🗼', time: '1.5 hrs', blurb: 'A folly tower on a cliff edge above the Tay, built to look like the Rhine. Half an hour up from Perth and the view runs the whole valley.' },
  { id: 'blair-castle', name: 'Blair Castle', region: 'Perthshire', lat: 56.766, lon: -3.848, tags: ['castle', 'history', 'royal', 'family', 'nature'], xp: 35, pop: 6, icon: '🏰', time: '2.5 hrs', blurb: 'White-harled seat of the Atholl dukes, whose owner keeps the only legal private army in Europe. Thirty rooms, red deer in the park and a walled garden.' },
  { id: 'killiecrankie', name: 'Pass of Killiecrankie', region: 'Perthshire', lat: 56.737, lon: -3.778, tags: ['history', 'forest', 'nature', 'scenic', 'river'], xp: 25, pop: 5, icon: '🍁', time: '1.5 hrs', blurb: 'A wooded gorge where a Jacobite charge broke a government army in 1689, and where a fleeing soldier is said to have jumped eighteen feet across the river.' },
  { id: 'loch-leven-castle', name: 'Loch Leven Castle', region: 'Perthshire', lat: 56.2, lon: -3.39, tags: ['castle', 'loch', 'history', 'mystery', 'wildlife'], xp: 30, pop: 5, icon: '🚣', time: '2 hrs', blurb: 'An island prison reached by small boat, where Mary, Queen of Scots was held in 1567, forced to abdicate, and from which she escaped with the help of a boy and a stolen key.' },

  // ---- Scottish Borders ----
  { id: 'abbotsford', name: 'Abbotsford, Home of Walter Scott', region: 'Scottish Borders', lat: 55.599, lon: -2.783, tags: ['history', 'culture', 'art', 'river', 'nature'], xp: 30, pop: 5, icon: '📚', time: '2 hrs', blurb: 'The house Walter Scott built with the money from his novels, stuffed with armour, Rob Roy’s gun and 9,000 books, above a bend in the Tweed.' },
  { id: 'jedburgh-abbey', name: 'Jedburgh Abbey', region: 'Scottish Borders', lat: 55.478, lon: -2.554, tags: ['history', 'ancient', 'mystery'], xp: 25, pop: 5, icon: '🕍', time: '1.5 hrs', blurb: 'The most complete of the four Border abbeys, its rose window still standing, burned repeatedly over three centuries for the crime of being near England.' },
  { id: 'scotts-view', name: 'Scott’s View & Dryburgh', region: 'Scottish Borders', lat: 55.6, lon: -2.66, tags: ['views', 'scenic', 'history', 'ancient', 'river'], xp: 25, pop: 5, icon: '🔭', time: '1.5 hrs', blurb: 'Walter Scott’s favourite view over the Eildon Hills, and the horses pulling his hearse are said to have stopped here out of habit. His grave is in the abbey below.' },
  { id: 'traquair-house', name: 'Traquair House', region: 'Scottish Borders', lat: 55.622, lon: -3.048, tags: ['castle', 'history', 'mystery', 'food', 'royal'], xp: 30, pop: 5, icon: '🍺', time: '2 hrs', blurb: 'The oldest continuously inhabited house in Scotland, over 900 years. Its main gates were closed in 1745 and will not reopen until a Stuart is on the throne. It brews its own ale.' },

  // ---- Speyside & Moray ----
  { id: 'culbin-forest', name: 'Culbin Forest & Sands', region: 'Speyside & Moray', lat: 57.62, lon: -3.68, tags: ['forest', 'beach', 'nature', 'cycling', 'wildlife'], xp: 25, pop: 4, icon: '🌲', time: '2.5 hrs', blurb: 'A forest planted onto a desert — the sand dunes that buried an entire estate in a storm in 1694 were stabilised with pines. Miles of flat trails and an empty shore.' },
  { id: 'glenlivet', name: 'The Glenlivet Distillery', region: 'Speyside & Moray', lat: 57.361, lon: -3.279, tags: ['whisky', 'history', 'scenic'], xp: 40, pop: 7, icon: '🥃', time: '2 hrs', blurb: 'The first licensed distillery in the parish, in 1824, when its neighbours were all illegal and its founder carried pistols for a decade afterwards.' },

  // ---- Stirling & Forth Valley ----
  { id: 'bannockburn', name: 'Bannockburn', region: 'Stirling & Forth Valley', lat: 56.093, lon: -3.92, tags: ['history', 'film', 'family'], xp: 30, pop: 6, icon: '⚔️', time: '1.5 hrs', blurb: 'Where Bruce beat a far larger English army over two days in June 1314. The visitor centre puts you inside the battle in 3D; the field itself is quiet grass.' },
  { id: 'doune-castle', name: 'Doune Castle', region: 'Stirling & Forth Valley', lat: 56.187, lon: -4.051, tags: ['castle', 'history', 'film', 'mystery'], xp: 35, pop: 7, icon: '🥥', time: '1.5 hrs', blurb: 'A remarkably complete 14th-century courtyard castle, and the most filmed in Scotland — Monty Python, Outlander and Winterfell all at once. The audio guide is by Terry Jones.' },
  { id: 'dunblane-cathedral', name: 'Dunblane Cathedral', region: 'Stirling & Forth Valley', lat: 56.19, lon: -3.967, tags: ['history', 'ancient', 'village', 'culture'], xp: 20, pop: 4, icon: '⛪', time: '1 hr', blurb: 'A 13th-century cathedral with a Norman tower, restored in the 1890s, in a small cathedral town of tearooms and a good bookshop.' },
];

// Starting points the parser can recognise. `aliases` cover Polish
// exonyms and their inflected forms ("ze startem w Edynburgu").
export const START_CITIES = {
  edinburgh: { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, aliases: ['edynburg', 'edynburga', 'edynburgu', 'edynburgiem'] },
  glasgow: { name: 'Glasgow', lat: 55.8642, lon: -4.2518, aliases: ['glasgow'] },
  stirling: { name: 'Stirling', lat: 56.1165, lon: -3.9369, aliases: ['stirling', 'stirlingu'] },
  inverness: { name: 'Inverness', lat: 57.4778, lon: -4.2247, aliases: ['inverness'] },
  aberdeen: { name: 'Aberdeen', lat: 57.1497, lon: -2.0943, aliases: ['aberdeen', 'aberdeenu'] },
  dundee: { name: 'Dundee', lat: 56.462, lon: -2.9707, aliases: ['dundee'] },
  oban: { name: 'Oban', lat: 56.4152, lon: -5.472, aliases: ['oban', 'obanu'] },
  'fort william': { name: 'Fort William', lat: 56.8198, lon: -5.1052, aliases: ['fort william'] },
  portree: { name: 'Portree', lat: 57.4125, lon: -6.1944, aliases: ['portree'] },
};

// Places a trip can be centred on, for short breaks. The radius is what
// counts as "around" that town on a one or two day trip — far enough to
// reach a castle up the coast, not so far you spend the day driving.
// Aliases carry Polish exonyms and inflected forms, same as START_CITIES.
export const TRIP_CENTRES = [
  { id: 'edinburgh', name: 'Edinburgh', lat: 55.9533, lon: -3.1883, km: 30,
    aliases: ['edynburg', 'edynburga', 'edynburgu', 'edynburgiem'] },
  { id: 'glasgow',   name: 'Glasgow',   lat: 55.8642, lon: -4.2518, km: 35, aliases: [] },
  { id: 'aberdeen',  name: 'Aberdeen',  lat: 57.1497, lon: -2.0943, km: 45, aliases: ['aberdeenu'] },
  { id: 'inverness', name: 'Inverness', lat: 57.4778, lon: -4.2247, km: 45, aliases: [] },
  { id: 'dundee',    name: 'Dundee',    lat: 56.4620, lon: -2.9707, km: 35, aliases: [] },
  { id: 'stirling',  name: 'Stirling',  lat: 56.1165, lon: -3.9369, km: 35, aliases: ['stirlingu'] },
  { id: 'perth',     name: 'Perth',     lat: 56.3960, lon: -3.4370, km: 40, aliases: [] },
  { id: 'oban',      name: 'Oban',      lat: 56.4152, lon: -5.4720, km: 45, aliases: ['obanu'] },
  { id: 'fort-william', name: 'Fort William', lat: 56.8198, lon: -5.1052, km: 45, aliases: [] },
  { id: 'portree',   name: 'Portree',   lat: 57.4125, lon: -6.1944, km: 40, aliases: [] },
];

// Interest dictionary: what the "AI" listens for in the prompt.
//
// `core` are the tags that DEFINE the interest, and decide whether a
// location is a match at all. `tags` are broader and only nudge the
// ranking. The two are separate because the broad sets overlap badly:
// skiing, golf, climbing and cycling all carry 'sport', so filtering on
// `tags` would answer "skiing" with a links course.
// `words` are matched after diacritic-stripping normalisation (see
// planner.js), so Polish terms are listed here without accents where
// a user might reasonably type them either way.
export const INTERESTS = {
  castles:  { icon: '🏰', core: ['castle'], tags: ['castle'], words: ['castle', 'castles', 'fortress', 'fort', 'palace', 'palaces', 'ruin', 'ruins', 'zamek', 'zamki', 'zamkow', 'zamkach', 'twierdza', 'twierdze', 'palac', 'palace', 'ruiny', 'forteca', 'warownia'] },
  history:  { icon: '📜', core: ['history', 'ancient', 'royal'], tags: ['history', 'ancient', 'royal'], words: ['history', 'historic', 'historical', 'heritage', 'battlefield', 'battle', 'medieval', 'ancient', 'abbey', 'monument', 'jacobite', 'clan', 'clans', 'viking', 'stones', 'standing stones', 'historia', 'historie', 'historyczne', 'historyczny', 'dziedzictwo', 'pole bitwy', 'bitwa', 'bitwy', 'sredniowiecze', 'sredniowieczne', 'starozytne', 'opactwo', 'pomnik', 'jakobici', 'klan', 'klany', 'wikingowie', 'kamienie'] },
  whisky:   { icon: '🥃', core: ['whisky'], tags: ['whisky'], words: ['whisky', 'whiskey', 'distillery', 'distilleries', 'dram', 'drams', 'scotch', 'speyside', 'malt', 'malts', 'destylarnia', 'destylarnie', 'destylarni', 'gorzelnia', 'gorzelnie', 'slod', 'trunek', 'trunki'] },
  hiking:   { icon: '🥾', core: ['hiking', 'mountain'], tags: ['hiking', 'mountain'], words: ['hike', 'hikes', 'hiking', 'walk', 'walks', 'walking', 'trek', 'trekking', 'munro', 'munros', 'mountain', 'mountains', 'summit', 'summits', 'trail', 'trails', 'ramble', 'wedrowka', 'wedrowki', 'wedrowek', 'piesze', 'piechota', 'szlak', 'szlaki', 'gory', 'gorskie', 'gorski', 'szczyt', 'szczyty', 'spacer', 'spacery', 'chodzenie'] },
  nature:   { icon: '🌿', core: ['nature', 'waterfall', 'forest'], tags: ['nature', 'waterfall', 'forest', 'scenic'], words: ['nature', 'outdoors', 'scenery', 'scenic', 'landscape', 'landscapes', 'waterfall', 'waterfalls', 'forest', 'forests', 'glen', 'glens', 'gorge', 'wilderness', 'wild', 'przyroda', 'natura', 'krajobraz', 'krajobrazy', 'widoki', 'wodospad', 'wodospady', 'las', 'lasy', 'dolina', 'doliny', 'wawoz', 'dzicz', 'dzika'] },
  lochs:    { icon: '🌊', core: ['loch'], tags: ['loch'], words: ['loch', 'lochs', 'lake', 'lakes', 'jezioro', 'jeziora', 'jezior', 'jeziorko'] },
  islands:  { icon: '⛴️', core: ['island'], tags: ['island'], words: ['island', 'islands', 'isle', 'isles', 'skye', 'mull', 'arran', 'staffa', 'hebrides', 'ferry', 'ferries', 'wyspa', 'wyspy', 'wysp', 'hebrydy', 'prom', 'promy'] },
  city:     { icon: '🏙️', core: ['city', 'culture', 'art'], tags: ['city', 'culture', 'art'], words: ['city', 'cities', 'urban', 'museum', 'museums', 'gallery', 'galleries', 'art', 'shopping', 'nightlife', 'culture', 'cultural', 'architecture', 'music', 'miasto', 'miasta', 'miejskie', 'muzeum', 'muzea', 'galeria', 'galerie', 'sztuka', 'zakupy', 'nocne zycie', 'kultura', 'kulturalne', 'architektura', 'muzyka'] },
  food:     { icon: '🦞', core: ['food'], tags: ['food', 'village'], words: ['food', 'foodie', 'eat', 'eating', 'restaurant', 'restaurants', 'seafood', 'haggis', 'culinary', 'pub', 'pubs', 'chips', 'gastro', 'cuisine', 'jedzenie', 'kuchnia', 'restauracja', 'restauracje', 'owoce morza', 'puby', 'kulinarne', 'smaki', 'lokalne jedzenie'] },
  coast:    { icon: '🏖️', core: ['coast', 'beach', 'lighthouse'], tags: ['coast', 'beach', 'lighthouse'], words: ['coast', 'coastal', 'beach', 'beaches', 'sea', 'seaside', 'cliff', 'cliffs', 'lighthouse', 'lighthouses', 'shore', 'sunset', 'sunsets', 'wybrzeze', 'plaza', 'plaze', 'plazy', 'morze', 'nadmorskie', 'klif', 'klify', 'latarnia', 'latarnie', 'brzeg', 'zachod slonca', 'zachody slonca'] },
  wildlife: { icon: '🦌', core: ['wildlife', 'stargazing'], tags: ['wildlife', 'stargazing'], words: ['wildlife', 'animal', 'animals', 'bird', 'birds', 'birdwatching', 'puffin', 'puffins', 'deer', 'seal', 'seals', 'dolphin', 'dolphins', 'eagle', 'eagles', 'stargazing', 'stars', 'dark sky', 'dzika przyroda', 'zwierzeta', 'ptaki', 'maskonur', 'maskonury', 'jelenie', 'foki', 'delfiny', 'orly', 'gwiazdy', 'obserwacja gwiazd', 'ciemne niebo'] },
  mystery:  { icon: '🔮', core: ['mystery', 'folklore', 'film'], tags: ['mystery', 'folklore', 'film'], words: ['mystery', 'mysteries', 'myth', 'myths', 'legend', 'legends', 'legendary', 'folklore', 'ghost', 'ghosts', 'haunted', 'nessie', 'monster', 'fairy', 'fairies', 'outlander', 'harry potter', 'potter', 'braveheart', 'film', 'films', 'movie', 'movies', 'tajemnica', 'tajemnice', 'mit', 'mity', 'legenda', 'legendy', 'folklor', 'duch', 'duchy', 'nawiedzone', 'potwor', 'wrozki', 'filmy', 'filmowe'] },
  family:   { icon: '🧸', core: ['family'], tags: ['family'], words: ['family', 'kid', 'kids', 'children', 'child', 'toddler', 'toddlers', 'rodzina', 'rodzinne', 'rodzinna', 'dzieci', 'dziecko', 'maluchy'] },
  driving:  { icon: '🛞', core: ['drive', 'scenic', 'views'], tags: ['drive', 'scenic', 'views'], words: ['drive', 'drives', 'driving', 'road trip', 'roads', 'nc500', 'north coast 500', 'viewpoint', 'viewpoints', 'photography', 'photo', 'photos', 'instagram', 'przejazdzka', 'jazda', 'samochodem', 'trasa', 'trasy', 'punkt widokowy', 'punkty widokowe', 'fotografia', 'zdjecia'] },
  kayaking: { icon: '🛶', core: ['kayaking', 'watersports'], tags: ['kayaking', 'watersports', 'river', 'sea'], words: ['kayak', 'kayaking', 'kayaks', 'canoe', 'canoeing', 'paddle', 'paddling', 'white water', 'whitewater', 'raft', 'rafting', 'river', 'rivers', 'watersport', 'watersports', 'water sport', 'water sports', 'rowing', 'kajak', 'kajaki', 'kajakiem', 'kajakarstwo', 'kanu', 'wioslowanie', 'rzeka', 'rzeki', 'sporty wodne', 'splyw', 'splywy'] },
  wildswim: { icon: '🏊', core: ['wildswim'], tags: ['wildswim', 'waterfall', 'loch', 'river'], words: ['wild swim', 'wild swimming', 'wildswim', 'swim', 'swimming', 'dip', 'dipping', 'plunge', 'open water', 'cold water', 'natural pool', 'swimming hole', 'dzikie plywanie', 'plywanie', 'morsowanie', 'kapiel', 'kapiele', 'zimna woda', 'naturalny basen'] },
  cycling:  { icon: '🚵', core: ['cycling', 'biking'], tags: ['cycling', 'biking', 'sport'], words: ['bike', 'biking', 'cycle', 'cycling', 'mountain bike', 'mountain biking', 'mtb', 'downhill', 'trail', 'trails', 'gravel', 'road cycling', 'velodrome', 'rower', 'rowery', 'rowerem', 'rowerowe', 'kolarstwo', 'rower gorski', 'zjazd', 'sciezki'] },
  climbing: { icon: '🧗', core: ['climbing'], tags: ['climbing', 'sport', 'mountain'], words: ['climb', 'climbing', 'rock climb', 'rock climbing', 'bouldering', 'boulder', 'crag', 'crags', 'scramble', 'scrambling', 'via ferrata', 'sport climbing', 'trad', 'trad climbing', 'wspinaczka', 'wspinaczke', 'wspinanie', 'skalki', 'skala', 'skaly', 'gran', 'granie'] },
  surfing:  { icon: '🏄', core: ['surfing'], tags: ['surfing', 'coast', 'sport'], words: ['surf', 'surfing', 'surfer', 'waves', 'swell', 'coasteer', 'coasteering', 'snorkel', 'snorkelling', 'dive', 'diving', 'sea swim', 'fale', 'nurkowanie', 'snorkeling', 'deska'] },
  golf:     { icon: '⛳', core: ['golf'], tags: ['golf', 'sport'], words: ['golf', 'golfer', 'golfing', 'links', 'fairway', 'tee', 'course', 'round of golf', 'golfa', 'golfie', 'pole golfowe', 'pola golfowe'] },
  skiing:   { icon: '⛷️', core: ['skiing', 'snowboard'], tags: ['skiing', 'snowboard', 'sport', 'mountain'], words: ['ski', 'skiing', 'snowboard', 'snowboarding', 'snow', 'winter sport', 'winter sports', 'piste', 'slopes', 'slope', 'narty', 'narciarstwo', 'nartach', 'snieg', 'sporty zimowe', 'stok', 'stoki'] },
};

// Region bias: phrases that pull the plan toward certain regions.
export const REGION_HINTS = [
  { words: ['west coast', 'western', 'zachodnie wybrzeze', 'zachodnim wybrzezu', 'zachod'], regions: ['Argyll & the Isles', 'Isle of Skye', 'Highlands'] },
  { words: ['north coast', 'nc500', 'north coast 500', 'far north', 'polnocne wybrzeze', 'polnocnym wybrzezu', 'daleka polnoc'], regions: ['North Coast 500'] },
  { words: ['skye'], regions: ['Isle of Skye'] },
  { words: ['speyside'], regions: ['Speyside & Moray'] },
  { words: ['cairngorm', 'cairngorms'], regions: ['Cairngorms'] },
  { words: ['borders', 'south', 'galloway', 'pogranicze', 'poludnie', 'poludniu'], regions: ['Scottish Borders', 'Dumfries & Galloway'] },
  { words: ['fife'], regions: ['Fife & Dundee'] },
  { words: ['highland', 'highlands', 'gory szkockie', 'wyzyny'], regions: ['Highlands', 'Loch Ness & Inverness', 'North Coast 500', 'Cairngorms'] },
];

export const LEVELS = {
  // XP needed to go from level n to n+1.
  needFor(level) { return 100 + level * 50; },
  // Returns { level, into, need } for a total XP amount.
  fromXP(xp) {
    let level = 1; let rest = xp;
    while (rest >= this.needFor(level) && level < 99) { rest -= this.needFor(level); level++; }
    return { level, into: rest, need: this.needFor(level) };
  },
};

export const XP_EVENTS = {
  CREATE_TRIP: 100,
  COMPLETE_TRIP: 250,
  JOIN: 50,
  REGION_STAMP: 120,   // every location in one region visited
  GAME_CORRECT: 2,     // per correct answer in Guess the Glen
  GAME_DAILY_CAP: 30,  // ceiling on game XP per day, so it cannot be farmed
};

// A stamp per region for the passport. Names are the display strings;
// the icon is the only thing stored here, labels come from i18n.
export const REGION_ICONS = {
  'Edinburgh & Lothians':    '🏛️',
  'Glasgow & Clyde':         '🎨',
  'Stirling & Forth Valley': '🛡️',
  'Loch Lomond & Trossachs': '🛶',
  'Argyll & the Isles':      '⛴️',
  'Ayrshire & Arran':        '🏖️',
  'Highlands':               '⛰️',
  'Isle of Skye':            '🗿',
  'Loch Ness & Inverness':   '🦕',
  'Cairngorms':              '🌲',
  'Speyside & Moray':        '🥃',
  'Aberdeenshire & Angus':   '🌅',
  'Perthshire':              '🍂',
  'Fife & Dundee':           '⛳',
  'North Coast 500':         '🛞',
  'Scottish Borders':        '🕍',
  'Dumfries & Galloway':     '🌌',
};

/** Every region in POI order, with its POI ids. */
export const REGIONS = [...new Set(POIS.map(p => p.region))].map(name => ({
  name,
  icon: REGION_ICONS[name] || '📍',
  poiIds: POIS.filter(p => p.region === name).map(p => p.id),
}));

// ------------------------------------------------------------
// Journey builder: kit and advisories.
//
// Structure only, as everywhere else in this file — the packing-list
// labels and the reason lines live in i18n.js under `kit.*` / `adv.*`.
// `tags` are matched against the POI tags of the stops actually chosen,
// so the list is earned by the route rather than guessed at.
// ------------------------------------------------------------
export const EQUIPMENT = [
  // Scotland-in-any-season staples: no route escapes these two.
  { id: 'waterproof', icon: '🧥', always: true },
  { id: 'layers',     icon: '🧣', always: true },

  { id: 'boots',      icon: '🥾', tags: ['hiking', 'mountain', 'climbing'] },
  { id: 'navigation', icon: '🧭', tags: ['hiking', 'mountain', 'climbing'] },
  { id: 'headtorch',  icon: '🔦', tags: ['mountain', 'stargazing', 'skiing'] },
  { id: 'midge',      icon: '🦟', tags: ['nature', 'forest', 'loch', 'waterfall', 'wildswim'] },
  { id: 'wetsuit',    icon: '🩱', tags: ['wildswim', 'surfing'] },
  { id: 'drybag',     icon: '🎒', tags: ['kayaking', 'watersports', 'wildswim', 'river'] },
  { id: 'buoyancy',   icon: '🦺', tags: ['kayaking', 'watersports', 'sea'] },
  { id: 'helmet',     icon: '⛑️', tags: ['cycling', 'biking', 'climbing'] },
  { id: 'harness',    icon: '🧗', tags: ['climbing'] },
  { id: 'skis',       icon: '🎿', tags: ['skiing', 'snowboard'] },
  { id: 'clubs',      icon: '⛳', tags: ['golf'] },
  { id: 'binoculars', icon: '🔭', tags: ['wildlife', 'stargazing'] },
  { id: 'camera',     icon: '📷', tags: ['scenic', 'views', 'film', 'lighthouse'] },
  { id: 'swimkit',    icon: '🏊', tags: ['beach', 'wildswim'] },
  { id: 'cash',       icon: '💷', tags: ['island', 'village'] },
];

// `when` receives { tags, regions, stats } — Sets of the tags and regions
// present in the journey, plus the computed route figures.
export const ADVISORIES = [
  { id: 'ferry',       icon: '⛴️', when: c => c.tags.has('island') },
  { id: 'singletrack', icon: '🚧', when: c => c.regions.has('North Coast 500') || c.regions.has('Isle of Skye') || c.tags.has('drive') },
  { id: 'munro',       icon: '🏔️', when: c => c.tags.has('mountain') },
  { id: 'snow',        icon: '❄️', when: c => c.tags.has('skiing') },
  { id: 'tides',       icon: '🌊', when: c => c.tags.has('surfing') || c.tags.has('sea') },
  { id: 'coldwater',   icon: '🥶', when: c => c.tags.has('wildswim') },
  { id: 'darkness',    icon: '🌌', when: c => c.tags.has('stargazing') },
  { id: 'booking',     icon: '🎟️', when: c => c.tags.has('whisky') || c.tags.has('castle') },
  { id: 'driver',      icon: '🚱', when: c => c.tags.has('whisky') },
  { id: 'longHaul',    icon: '🚗', when: c => c.stats.km >= 800 },
  { id: 'packedDay',   icon: '⏳', when: c => c.stats.hoursPerDay > 10 },
];

export const ACHIEVEMENTS = [
  { id: 'first-quest',      icon: '🗺️', xp: 50,  check: s => s.tripsCreated >= 1 },
  { id: 'quest-collector',  icon: '📋', xp: 75,  check: s => s.tripsCreated >= 3 },
  { id: 'boots-on',         icon: '🥾', xp: 25,  check: s => s.visitedCount >= 1 },
  { id: 'wee-wanderer',     icon: '🌿', xp: 50,  check: s => s.visitedCount >= 5 },
  { id: 'seasoned-rambler', icon: '🎒', xp: 100, check: s => s.visitedCount >= 15 },
  { id: 'true-highlander',  icon: '⛰️', xp: 200, check: s => s.visitedCount >= 30 },
  { id: 'storm-the-castle', icon: '🏰', xp: 40,  check: s => s.castles >= 1 },
  { id: 'keeper-of-keeps',  icon: '👑', xp: 100, check: s => s.castles >= 5 },
  { id: 'first-dram',       icon: '🥃', xp: 40,  check: s => s.distilleries >= 1 },
  { id: 'whisky-sage',      icon: '🛢️', xp: 100, check: s => s.distilleries >= 3 },
  { id: 'loch-collector',   icon: '🌊', xp: 75,  check: s => s.lochs >= 3 },
  { id: 'peak-bagger',      icon: '🏔️', xp: 75,  check: s => s.peaks >= 1 },
  { id: 'island-hopper',    icon: '⛴️', xp: 60,  check: s => s.islands >= 1 },
  { id: 'nessie-hunter',    icon: '🦕', xp: 60,  check: s => s.visitedIds.includes('urquhart-loch-ness') },
  { id: 'full-circle',      icon: '🏁', xp: 150, check: s => s.tripsCompleted >= 1 },
  { id: 'compass-rose',     icon: '🧭', xp: 100, check: s => s.regions >= 5 },
  { id: 'local-legend',     icon: '⭐', xp: 100, check: s => s.level >= 5 },
];

// Seed players for the leaderboard (prototype: static rivals).
export const RIVALS = [
  { name: 'MunroBagger87',   xp: 4520, visited: 38, trips: 6, colour: '#e8743b' },
  { name: 'NessieBeliever',  xp: 3890, visited: 31, trips: 5, colour: '#52b8a4' },
  { name: 'TartanTrekker',   xp: 3215, visited: 27, trips: 4, colour: '#b69cff' },
  { name: 'DramGoodTime',    xp: 2780, visited: 22, trips: 4, colour: '#e8b84b' },
  { name: 'HaggisHikerKate', xp: 2310, visited: 19, trips: 3, colour: '#6fb3e0' },
  { name: 'ThistleDoNicely', xp: 1820, visited: 15, trips: 3, colour: '#d488b0' },
  { name: 'KiltedCallum',    xp: 1245, visited: 11, trips: 2, colour: '#9ecf6a' },
  { name: 'BonnieVoyager',   xp: 760,  visited: 7,  trips: 1, colour: '#e0876f' },
  { name: 'FirstTimer_Tom',  xp: 230,  visited: 2,  trips: 1, colour: '#8a93a6' },
];

export const POI_BY_ID = Object.fromEntries(POIS.map(p => [p.id, p]));
