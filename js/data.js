// ============================================================
// BRAW — Scotland dataset: locations, achievements, levels,
// leaderboard seed players, example prompts.
// Prototype scope: Scotland only (UK). Expandable later.
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
  { id: ‘galloway-dark-sky’, name: ‘Galloway Dark Sky Park’, region: ‘Dumfries & Galloway’, lat: 55.079, lon: -4.448, tags: [‘stargazing’, ‘nature’, ‘forest’, ‘wildlife’], xp: 40, pop: 5, icon: ‘🌌’, time: ‘evening’, blurb: "The UK’s first Dark Sky Park — 7,000 stars and the Milky Way on a clear night." },

  // ---- Kayaking & Water Sports ----
  { id: ‘river-spey-kayak’, name: ‘River Spey Kayak Run’, region: ‘Speyside & Moray’, lat: 57.328, lon: -3.578, tags: [‘kayaking’, ‘watersports’, ‘nature’, ‘river’], xp: 45, pop: 7, icon: ‘🛶’, time: ‘half day’, blurb: ‘One of Scotland\’s finest touring rivers — 80 miles of Grade I–III rapids through whisky country.’ },
  { id: ‘loch-insh’, name: ‘Loch Insh Watersports Centre’, region: ‘Cairngorms’, lat: 57.098, lon: -3.988, tags: [‘kayaking’, ‘watersports’, ‘loch’, ‘family’], xp: 35, pop: 7, icon: ‘🚣’, time: ‘3 hrs’, blurb: ‘Kayaking, windsurfing and open-canoe hire on a stunning Cairngorms loch.’ },
  { id: ‘loch-tay-kayak’, name: ‘Loch Tay Sea Kayaking’, region: ‘Perthshire’, lat: 56.518, lon: -4.118, tags: [‘kayaking’, ‘watersports’, ‘loch’, ‘scenic’], xp: 40, pop: 6, icon: ‘🌊’, time: ‘half day’, blurb: ‘Paddle the length of Perthshire\’s longest loch with Ben Lawers dominating the skyline.’ },
  { id: ‘river-tummel’, name: ‘River Tummel White Water’, region: ‘Perthshire’, lat: 56.703, lon: -3.758, tags: [‘kayaking’, ‘watersports’, ‘river’, ‘nature’], xp: 40, pop: 5, icon: ‘💧’, time: ‘3 hrs’, blurb: ‘Grade III rapids through a spectacular wooded gorge — a bucket-list paddle.’ },
  { id: ‘portavadie-kayak’, name: ‘Portavadie Sea Kayaking, Argyll’, region: ‘Argyll & the Isles’, lat: 55.877, lon: -5.315, tags: [‘kayaking’, ‘watersports’, ‘coast’, ‘island’, ‘sea’], xp: 45, pop: 6, icon: ‘🧭’, time: ‘half day’, blurb: ‘Sea-kayak through the Kyles of Bute — sheltered channels fringed with forests and seals.’ },
  { id: ‘findhorn-gorge’, name: ‘River Findhorn Gorge’, region: ‘Highlands’, lat: 57.528, lon: -3.942, tags: [‘kayaking’, ‘watersports’, ‘river’, ‘nature’, ‘scenic’], xp: 50, pop: 5, icon: ‘🏔️’, time: ‘4 hrs’, blurb: ‘Scotland\’s most dramatic river gorge — inaccessible except by kayak. Extraordinary sandstone walls.’ },

  // ---- Wild Swimming ----
  { id: ‘plodda-falls’, name: ‘Plodda Falls & Pool’, region: ‘Highlands’, lat: 57.29, lon: -4.818, tags: [‘wildswim’, ‘waterfall’, ‘nature’, ‘forest’], xp: 35, pop: 5, icon: ‘🏊’, time: ‘2 hrs’, blurb: ‘A dramatic 46m falls into a jade pool hidden in Victorian Douglas fir forest. Wild swim at the base.’ },
  { id: ‘loch-an-eilein’, name: ‘Loch an Eilein Wild Swim’, region: ‘Cairngorms’, lat: 57.14, lon: -3.838, tags: [‘wildswim’, ‘loch’, ‘nature’, ‘forest’], xp: 30, pop: 6, icon: ‘🏰’, time: ‘2 hrs’, blurb: ‘Swim to a ruined island castle in a mirror-clear Cairngorms loch surrounded by Scots pines.’ },
  { id: ‘clova-pools’, name: ‘Glen Clova Swimming Holes’, region: ‘Aberdeenshire & Angus’, lat: 56.85, lon: -3.058, tags: [‘wildswim’, ‘nature’, ‘river’, ‘scenic’], xp: 35, pop: 5, icon: ‘💦’, time: ‘2 hrs’, blurb: ‘A series of crystal pools and natural slides on the South Esk river in Angus Glens.’ },

  // ---- Rock Climbing ----
  { id: ‘dumbarton-rock’, name: ‘Dumbarton Rock Climbing’, region: ‘Glasgow & Clyde’, lat: 55.942, lon: -4.559, tags: [‘climbing’, ‘sport’, ‘nature’], xp: 40, pop: 6, icon: ‘🧗’, time: ‘3 hrs’, blurb: ‘A volcanic plug with routes up to Font 9a — one of the most challenging sport crags in the world.’ },
  { id: ‘ben-an’, name: ‘Ben A\’an, Trossachs’, region: ‘Loch Lomond & Trossachs’, lat: 56.248, lon: -4.415, tags: [‘climbing’, ‘hiking’, ‘nature’, ‘views’], xp: 35, pop: 7, icon: ‘⛰️’, time: ‘3 hrs’, blurb: ‘A compact, dramatic summit with scrambling sections and a jaw-dropping Trossachs panorama.’ },
  { id: ‘creag-dubh’, name: ‘Creag Dubh, Newtonmore’, region: ‘Cairngorms’, lat: 57.053, lon: -4.127, tags: [‘climbing’, ‘sport’, ‘nature’], xp: 35, pop: 5, icon: ‘🪨’, time: ‘4 hrs’, blurb: ‘Schist slabs and walls from Severe to E6 — the essential Highland sport climbing venue.’ },
  { id: ‘shelterstone’, name: ‘Shelter Stone Crag, Cairngorms’, region: ‘Cairngorms’, lat: 57.068, lon: -3.665, tags: [‘climbing’, ‘mountain’, ‘nature’, ‘hiking’], xp: 55, pop: 4, icon: ‘🗻’, time: ‘full day’, blurb: ‘Remote granite architecture in the heart of the Cairngorm Plateau. Scotland\’s most serious mountaineering.’ },

  // ---- Mountain Biking ----
  { id: ‘glentress’, name: ‘Glentress Forest, Peebles (7Stanes)’, region: ‘Scottish Borders’, lat: 55.616, lon: -3.161, tags: [‘cycling’, ‘biking’, ‘forest’, ‘sport’], xp: 40, pop: 8, icon: ‘🚵’, time: ‘half day’, blurb: ‘Scotland\’s most visited mountain bike trail centre — 65km of trails from green to black.’ },
  { id: ‘laggan-wolftrax’, name: ‘Laggan Wolftrax’, region: ‘Highlands’, lat: 56.999, lon: -4.412, tags: [‘cycling’, ‘biking’, ‘forest’, ‘sport’], xp: 40, pop: 6, icon: ‘🐺’, time: ‘half day’, blurb: ‘Highland trails through Loch Laggan forest — black runs with mountain panoramas.’ },
  { id: ‘fort-william-dh’, name: ‘Fort William Downhill Course’, region: ‘Highlands’, lat: 56.814, lon: -5.108, tags: [‘cycling’, ‘biking’, ‘mountain’, ‘sport’], xp: 50, pop: 7, icon: ‘🏁’, time: ‘4 hrs’, blurb: ‘The UCI World Cup course on Aonach Mor. Ride where the pros race on the UK\’s most fearsome DH track.’ },
  { id: ‘ae-forest’, name: ‘Ae Forest (7Stanes)’, region: ‘Dumfries & Galloway’, lat: 55.21, lon: -3.695, tags: [‘cycling’, ‘biking’, ‘forest’, ‘sport’], xp: 35, pop: 5, icon: ‘🌲’, time: ‘3 hrs’, blurb: ‘Wild and remote singletrack through Dumfries forest — graded from blue to black.’ },

  // ---- Surfing & Coasteering ----
  { id: ‘thurso-east’, name: ‘Thurso East Surf Break’, region: ‘North Coast 500’, lat: 58.594, lon: -3.513, tags: [‘surfing’, ‘coast’, ‘sport’], xp: 50, pop: 6, icon: ‘🏄’, time: ‘3 hrs’, blurb: ‘A world-class reef break delivering powerful barrels. The northernmost quality surf in mainland Britain.’ },
  { id: ‘machrihanish’, name: ‘Machrihanish Bay Surfing’, region: ‘Argyll & the Isles’, lat: 55.433, lon: -5.72, tags: [‘surfing’, ‘coast’, ‘beach’, ‘sport’], xp: 40, pop: 5, icon: ‘🌊’, time: ‘3 hrs’, blurb: ‘A sweeping Atlantic-facing beach with consistent swells and almost no crowds.’ },
  { id: ‘coldingham-bay’, name: ‘Coldingham Bay Surf & Dive’, region: ‘Scottish Borders’, lat: 55.896, lon: -2.143, tags: [‘surfing’, ‘coast’, ‘sport’, ‘wildswim’], xp: 35, pop: 5, icon: ‘🤿’, time: ‘3 hrs’, blurb: ‘A sheltered cove on the Berwickshire coast — good beginner surf and clear waters for snorkelling.’ },

  // ---- Golf ----
  { id: ‘royal-dornoch’, name: ‘Royal Dornoch Golf Club’, region: ‘North Coast 500’, lat: 57.876, lon: -4.023, tags: [‘golf’, ‘coast’, ‘sport’], xp: 45, pop: 7, icon: ‘⛳’, time: ‘5 hrs’, blurb: ‘Consistently ranked a top-5 course in the world — an ancient links on the Sutherland coast.’ },
  { id: ‘carnoustie’, name: ‘Carnoustie Championship Course’, region: ‘Fife & Dundee’, lat: 56.501, lon: -2.705, tags: [‘golf’, ‘coast’, ‘sport’], xp: 45, pop: 7, icon: ‘🏌️’, time: ‘5 hrs’, blurb: ‘The "Car-nasty" Open venue — arguably the toughest championship links on Earth.’ },
  { id: ‘gleneagles’, name: ‘Gleneagles’, region: ‘Perthshire’, lat: 56.274, lon: -3.775, tags: [‘golf’, ‘sport’, ‘luxury’], xp: 40, pop: 7, icon: ‘🎩’, time: ‘5 hrs’, blurb: ‘Three world-class courses in the Perthshire hills — the King\’s, Queen\’s and PGA Centenary.’ },

  // ---- Winter Sports ----
  { id: ‘cairngorm-ski’, name: ‘CairnGorm Mountain Ski Resort’, region: ‘Cairngorms’, lat: 57.118, lon: -3.665, tags: [‘skiing’, ‘snowboard’, ‘mountain’, ‘sport’], xp: 45, pop: 7, icon: ‘⛷️’, time: ‘full day’, blurb: ‘Scotland\’s largest ski resort with 33 runs up to 1245m. Britain\’s most reliable snow.’ },
  { id: ‘glencoe-ski’, name: ‘Glencoe Mountain Resort’, region: ‘Highlands’, lat: 56.652, lon: -4.862, tags: [‘skiing’, ‘snowboard’, ‘mountain’, ‘sport’, ‘scenic’], xp: 40, pop: 6, icon: ‘🏔️’, time: ‘full day’, blurb: ‘Scotland\’s oldest ski resort in the most dramatic mountain setting — Glencoe in winter is unmissable.’ },
];

// Starting points the parser can recognise.
export const START_CITIES = {
  edinburgh: { name: 'Edinburgh', lat: 55.9533, lon: -3.1883 },
  glasgow: { name: 'Glasgow', lat: 55.8642, lon: -4.2518 },
  stirling: { name: 'Stirling', lat: 56.1165, lon: -3.9369 },
  inverness: { name: 'Inverness', lat: 57.4778, lon: -4.2247 },
  aberdeen: { name: 'Aberdeen', lat: 57.1497, lon: -2.0943 },
  dundee: { name: 'Dundee', lat: 56.462, lon: -2.9707 },
  oban: { name: 'Oban', lat: 56.4152, lon: -5.472 },
  'fort william': { name: 'Fort William', lat: 56.8198, lon: -5.1052 },
  portree: { name: 'Portree', lat: 57.4125, lon: -6.1944 },
};

// Interest dictionary: what the "AI" listens for in the prompt.
export const INTERESTS = {
  castles:  { label: 'Castles',     icon: '🏰', tags: ['castle'], words: ['castle', 'castles', 'fortress', 'fort', 'palace', 'palaces', 'ruin', 'ruins'] },
  history:  { label: 'History',     icon: '📜', tags: ['history', 'ancient', 'royal'], words: ['history', 'historic', 'historical', 'heritage', 'battlefield', 'battle', 'medieval', 'ancient', 'abbey', 'monument', 'jacobite', 'clan', 'clans', 'viking', 'stones', 'standing stones'] },
  whisky:   { label: 'Whisky',      icon: '🥃', tags: ['whisky'], words: ['whisky', 'whiskey', 'distillery', 'distilleries', 'dram', 'drams', 'scotch', 'speyside', 'malt', 'malts'] },
  hiking:   { label: 'Hiking',      icon: '🥾', tags: ['hiking', 'mountain'], words: ['hike', 'hikes', 'hiking', 'walk', 'walks', 'walking', 'trek', 'trekking', 'munro', 'munros', 'mountain', 'mountains', 'climb', 'climbing', 'summit', 'summits', 'trail', 'trails', 'ramble'] },
  nature:   { label: 'Nature',      icon: '🌿', tags: ['nature', 'waterfall', 'forest', 'scenic'], words: ['nature', 'outdoors', 'scenery', 'scenic', 'landscape', 'landscapes', 'waterfall', 'waterfalls', 'forest', 'forests', 'glen', 'glens', 'gorge', 'wilderness', 'wild'] },
  lochs:    { label: 'Lochs',       icon: '🌊', tags: ['loch'], words: ['loch', 'lochs', 'lake', 'lakes'] },
  islands:  { label: 'Islands',     icon: '⛴️', tags: ['island'], words: ['island', 'islands', 'isle', 'isles', 'skye', 'mull', 'arran', 'staffa', 'hebrides', 'ferry', 'ferries'] },
  city:     { label: 'City & Culture', icon: '🏙️', tags: ['city', 'culture', 'art'], words: ['city', 'cities', 'urban', 'museum', 'museums', 'gallery', 'galleries', 'art', 'shopping', 'nightlife', 'culture', 'cultural', 'architecture', 'music'] },
  food:     { label: 'Food & Drink', icon: '🦞', tags: ['food', 'village'], words: ['food', 'foodie', 'eat', 'eating', 'restaurant', 'restaurants', 'seafood', 'haggis', 'culinary', 'pub', 'pubs', 'chips', 'gastro', 'cuisine'] },
  coast:    { label: 'Coast & Beaches', icon: '🏖️', tags: ['coast', 'beach', 'lighthouse'], words: ['coast', 'coastal', 'beach', 'beaches', 'sea', 'seaside', 'cliff', 'cliffs', 'lighthouse', 'lighthouses', 'shore', 'sunset', 'sunsets'] },
  wildlife: { label: 'Wildlife',    icon: '🦌', tags: ['wildlife', 'stargazing'], words: ['wildlife', 'animal', 'animals', 'bird', 'birds', 'birdwatching', 'puffin', 'puffins', 'deer', 'seal', 'seals', 'dolphin', 'dolphins', 'eagle', 'eagles', 'stargazing', 'stars', 'dark sky'] },
  mystery:  { label: 'Myths & Films', icon: '🔮', tags: ['mystery', 'folklore', 'film'], words: ['mystery', 'mysteries', 'myth', 'myths', 'legend', 'legends', 'legendary', 'folklore', 'ghost', 'ghosts', 'haunted', 'nessie', 'monster', 'fairy', 'fairies', 'outlander', 'harry potter', 'potter', 'braveheart', 'film', 'films', 'movie', 'movies'] },
  family:   { label: 'Family',      icon: '🧸', tags: ['family'], words: ['family', 'kid', 'kids', 'children', 'child', 'toddler', 'toddlers'] },
  driving:  { label: 'Scenic Drives', icon: '🛞', tags: ['drive', 'scenic', 'views'], words: ['drive', 'drives', 'driving', 'road trip', 'roads', 'nc500', 'north coast 500', 'viewpoint', 'viewpoints', 'photography', 'photo', 'photos', 'instagram'] },
  kayaking: { label: 'Kayaking & Water', icon: '🛶', tags: ['kayaking', 'watersports', 'river', 'sea'], words: ['kayak', 'kayaking', 'kayaks', 'canoe', 'canoeing', 'paddle', 'paddling', 'white water', 'whitewater', 'raft', 'rafting', 'river', 'rivers', 'watersport', 'watersports', 'water sport', 'water sports', 'rowing'] },
  wildswim: { label: 'Wild Swimming', icon: '🏊', tags: ['wildswim', 'waterfall', 'loch', 'river'], words: ['wild swim', 'wild swimming', 'wildswim', 'swim', 'swimming', 'dip', 'dipping', 'plunge', 'open water', 'cold water', 'natural pool', 'swimming hole'] },
  cycling:  { label: 'Cycling & MTB', icon: '🚵', tags: ['cycling', 'biking', 'sport'], words: ['bike', 'biking', 'cycle', 'cycling', 'mountain bike', 'mountain biking', 'mtb', 'downhill', 'trail', 'trails', 'gravel', 'road cycling', 'velodrome'] },
  climbing: { label: 'Climbing', icon: '🧗', tags: ['climbing', 'sport', 'mountain'], words: ['climb', 'climbing', 'rock climb', 'rock climbing', 'bouldering', 'boulder', 'crag', 'crags', 'scramble', 'scrambling', 'via ferrata', 'sport climbing', 'trad', 'trad climbing'] },
  surfing:  { label: 'Surfing & Coast', icon: '🏄', tags: ['surfing', 'coast', 'sport'], words: ['surf', 'surfing', 'surfer', 'waves', 'swell', 'coasteer', 'coasteering', 'snorkel', 'snorkelling', 'dive', 'diving', 'sea swim'] },
  golf:     { label: 'Golf', icon: '⛳', tags: ['golf', 'sport'], words: ['golf', 'golfer', 'golfing', 'links', 'fairway', 'tee', 'course', 'round of golf'] },
  skiing:   { label: 'Skiing & Snow', icon: '⛷️', tags: ['skiing', 'snowboard', 'sport', 'mountain'], words: ['ski', 'skiing', 'snowboard', 'snowboarding', 'snow', 'winter sport', 'winter sports', 'piste', 'slopes', 'slope'] },
};

// Region bias: phrases that pull the plan toward certain regions.
export const REGION_HINTS = [
  { words: ['west coast', 'western'], regions: ['Argyll & the Isles', 'Isle of Skye', 'Highlands'] },
  { words: ['north coast', 'nc500', 'north coast 500', 'far north'], regions: ['North Coast 500'] },
  { words: ['skye'], regions: ['Isle of Skye'] },
  { words: ['speyside'], regions: ['Speyside & Moray'] },
  { words: ['cairngorm', 'cairngorms'], regions: ['Cairngorms'] },
  { words: ['borders', 'south', 'galloway'], regions: ['Scottish Borders', 'Dumfries & Galloway'] },
  { words: ['fife'], regions: ['Fife & Dundee'] },
  { words: ['highland', 'highlands'], regions: ['Highlands', 'Loch Ness & Inverness', 'North Coast 500', 'Cairngorms'] },
];

export const LEVELS = {
  // XP needed to go from level n to n+1.
  needFor(level) { return 100 + level * 50; },
  titles: [
    'Wanderer', 'Stroller', 'Rambler', 'Explorer', 'Pathfinder',
    'Trailblazer', 'Munro Bagger', 'Highlander', 'Clan Chieftain',
    'Laird o’ the Roads', 'Legend of Alba',
  ],
  titleFor(level) { return this.titles[Math.min(level - 1, this.titles.length - 1)]; },
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
};

export const ACHIEVEMENTS = [
  { id: 'first-quest',      name: 'The First Step',     icon: '🗺️', xp: 50,  desc: 'Create your first roadtrip quest.',            check: s => s.tripsCreated >= 1 },
  { id: 'quest-collector',  name: 'Serial Planner',     icon: '📋', xp: 75,  desc: 'Create 3 roadtrip quests.',                    check: s => s.tripsCreated >= 3 },
  { id: 'boots-on',         name: 'Boots on the Ground',icon: '🥾', xp: 25,  desc: 'Mark your first location as visited.',          check: s => s.visitedCount >= 1 },
  { id: 'wee-wanderer',     name: 'Wee Wanderer',       icon: '🌿', xp: 50,  desc: 'Visit 5 locations.',                            check: s => s.visitedCount >= 5 },
  { id: 'seasoned-rambler', name: 'Seasoned Rambler',   icon: '🎒', xp: 100, desc: 'Visit 15 locations.',                           check: s => s.visitedCount >= 15 },
  { id: 'true-highlander',  name: 'True Highlander',    icon: '⛰️', xp: 200, desc: 'Visit 30 locations.',                           check: s => s.visitedCount >= 30 },
  { id: 'storm-the-castle', name: 'Storm the Castle',   icon: '🏰', xp: 40,  desc: 'Visit your first castle.',                      check: s => s.castles >= 1 },
  { id: 'keeper-of-keeps',  name: 'Keeper of Keeps',    icon: '👑', xp: 100, desc: 'Visit 5 castles.',                              check: s => s.castles >= 5 },
  { id: 'first-dram',       name: 'The First Dram',     icon: '🥃', xp: 40,  desc: 'Visit a whisky distillery.',                    check: s => s.distilleries >= 1 },
  { id: 'whisky-sage',      name: 'Whisky Sage',        icon: '🛢️', xp: 100, desc: 'Visit 3 whisky locations.',                     check: s => s.distilleries >= 3 },
  { id: 'loch-collector',   name: 'Loch Collector',     icon: '🌊', xp: 75,  desc: 'Visit 3 lochs.',                                check: s => s.lochs >= 3 },
  { id: 'peak-bagger',      name: 'Peak Bagger',        icon: '🏔️', xp: 75,  desc: 'Summit a mountain hike.',                       check: s => s.peaks >= 1 },
  { id: 'island-hopper',    name: 'Island Hopper',      icon: '⛴️', xp: 60,  desc: 'Visit an island location.',                     check: s => s.islands >= 1 },
  { id: 'nessie-hunter',    name: 'Nessie Hunter',      icon: '🦕', xp: 60,  desc: 'Pay your respects at Loch Ness.',               check: s => s.visitedIds.includes('urquhart-loch-ness') },
  { id: 'full-circle',      name: 'Full Circle',        icon: '🏁', xp: 150, desc: 'Complete every stop on a roadtrip.',            check: s => s.tripsCompleted >= 1 },
  { id: 'compass-rose',     name: 'Compass Rose',       icon: '🧭', xp: 100, desc: 'Explore 5 different regions of Scotland.',      check: s => s.regions >= 5 },
  { id: 'local-legend',     name: 'Local Legend',       icon: '⭐', xp: 100, desc: 'Reach level 5.',                                check: s => s.level >= 5 },
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

export const EXAMPLE_PROMPTS = [
  'I\'m really into kayaking — show me the best Scottish rivers and sea routes',
  '5 days of highland castles and whisky distilleries from Inverness',
  'Weekend mountain biking and wild swimming in the Cairngorms',
  'I love rock climbing — 3 days of crags and scrambles',
  'Family road trip: wildlife, beaches and castles on the west coast',
  'Surfing, seafood and sunsets on the north coast',
];

export const POI_BY_ID = Object.fromEntries(POIS.map(p => [p.id, p]));
