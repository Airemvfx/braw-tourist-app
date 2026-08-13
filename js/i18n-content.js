// ============================================================
// BRAW — Polish (pl) content translations for the Scotland dataset.
// Keys mirror the English source in js/data.js exactly.
//
// SYNTAX NOTE: only straight ASCII quotes (' and ") are used as
// string delimiters. Strings containing an apostrophe are wrapped
// in double quotes. Never use U+2018/U+2019 as delimiters.
// ============================================================

// ---- 1. POI translations, keyed by POI id from data.js (87 entries) ----
export const PL_POIS = {
  // ---- Edynburg i Lothians ----
  'edinburgh-castle': {
    name: 'Zamek w Edynburgu',
    blurb: 'Klejnoty koronne, armatni wystrzał o pierwszej i twierdza na wygasłym wulkanie, groźnie spoglądająca na stolicę.',
  },
  'arthurs-seat': {
    name: "Arthur's Seat",
    blurb: 'Wygasły wulkan w samym środku Edynburga. Wejdź na szczyt po najlepszy darmowy widok w mieście.',
  },
  'royal-mile': {
    name: 'Królewska Mila (Royal Mile)',
    blurb: 'Zaułki, spacery z duchami, dudziarze i puby — średniowieczny kręgosłup Starego Miasta.',
  },
  'calton-hill': {
    name: 'Wzgórze Calton',
    blurb: 'Pomniki, zachody słońca i ta pocztówkowa panorama Princes Street.',
  },
  'rosslyn-chapel': {
    name: 'Kaplica Rosslyn',
    blurb: 'Płaskorzeźby rodem z „Kodu da Vinci” i 600 lat tajemnic w jednej niewiarygodnie zdobnej kaplicy.',
  },
  'forth-bridge': {
    name: 'Most Forth, South Queensferry',
    blurb: 'Wielka czerwona ikona epoki wiktoriańskiej — cud z listy UNESCO, 53,000 ton stali.',
  },

  // ---- Glasgow i Clyde ----
  'kelvingrove': {
    name: 'Galeria Sztuki Kelvingrove',
    blurb: 'Spitfire, Dalí i codzienny recital organowy — najokazalsze darmowe wyjście w Glasgow.',
  },
  'glasgow-necropolis': {
    name: 'Nekropolia w Glasgow',
    blurb: 'Wiktoriańskie miasto umarłych na wzgórzu — gotyckie, klimatyczne, niezapomniane.',
  },
  'ashton-lane': {
    name: 'Ashton Lane i West End',
    blurb: 'Bruk w świetle lampek, knajpki z curry i muzyka na żywo — Glasgow od najbardziej przyjaznej strony.',
  },

  // ---- Stirling i dolina Forth ----
  'stirling-castle': {
    name: 'Zamek Stirling',
    blurb: 'Tu wygrywano i przegrywano wojny o Szkocję. Można się spierać, że lepszy niż ten w Edynburgu.',
  },
  'wallace-monument': {
    name: "Pomnik Wallace'a",
    blurb: '246 stopni do prawdziwego miecza Braveheart i potężny widok na nadrzeczne równiny.',
  },
  'the-kelpies': {
    name: 'The Kelpies',
    blurb: '30-metrowe stalowe łby koni — mityczne wodne duchy strzegące kanału.',
  },

  // ---- Loch Lomond i Trossachs ----
  'loch-lomond': {
    name: 'Loch Lomond i Conic Hill',
    blurb: 'Słynne „bonnie banks” we własnej osobie. Wejdź na Conic Hill, a wyspy rozsypią się jak kamienie w brodzie.',
  },
  'loch-katrine': {
    name: 'Loch Katrine',
    blurb: 'Rejsy zabytkowym parowcem przez krajobraz, który wymyślił szkocką turystykę.',
  },

  // ---- Argyll i wyspy ----
  'inveraray-castle': {
    name: 'Zamek Inveraray',
    blurb: 'Baśniowe wieżyczki nad Loch Fyne — siedziba klanu Campbell i plan zdjęciowy „Downton Abbey”.',
  },
  'kilchurn-castle': {
    name: 'Zamek Kilchurn',
    blurb: 'Najbardziej fotogeniczna ruina w Szkocji, dumająca nad brzegiem Loch Awe.',
  },
  'oban-distillery': {
    name: 'Destylarnia Oban i nabrzeże',
    blurb: 'Kieliszek whisky z nutą morskiego powietrza, a potem najlepsza buda z owocami morza w całej Szkocji.',
  },
  'tobermory': {
    name: 'Tobermory, wyspa Mull',
    blurb: 'Port pomalowany we wszystkie kolory tęczy. Orły nad głową, przegrzebki na kei.',
  },
  'fingals-cave': {
    name: 'Jaskinia Fingala, Staffa',
    blurb: 'Katedra z sześciokątnych bazaltowych kolumn, która zainspirowała Mendelssohna. Maskonury w cenie (w sezonie).',
  },

  // ---- Ayrshire i Arran ----
  'culzean-castle': {
    name: 'Zamek Culzean',
    blurb: 'Georgiańskie arcydzieło na klifie — z własną plażą, parkiem z jeleniami i apartamentem Eisenhowera.',
  },
  'goatfell-arran': {
    name: 'Goatfell, wyspa Arran',
    blurb: '„Szkocja w miniaturze” — zdobądź granitowy szczyt wyspy między jednym a drugim promem.',
  },

  // ---- Highlands (zachód) ----
  'glencoe': {
    name: 'Glencoe',
    blurb: 'Najwspanialsza i najsmutniejsza dolina w Szkocji. Nie bez powodu kręcono tu „Skyfall”.',
  },
  'ben-nevis': {
    name: 'Ben Nevis',
    blurb: 'Dach Wielkiej Brytanii, 1,345m. Największy powód do przechwałek na całej mapie.',
  },
  'glenfinnan-viaduct': {
    name: 'Wiadukt Glenfinnan',
    blurb: "Popatrz, jak parowóz Jacobite przejeżdża mostem z Harry'ego Pottera nad Loch Shiel.",
  },
  'steall-falls': {
    name: 'Wodospad Steall, Glen Nevis',
    blurb: 'Spacer wąwozem przez linowy mostek do drugiego najwyższego wodospadu w Szkocji.',
  },
  'eilean-donan': {
    name: 'Zamek Eilean Donan',
    blurb: 'Trzy jeziora spotykają się przy najczęściej fotografowanym zamku Szkocji. Terytorium „Nieśmiertelnego”.',
  },

  // ---- Wyspa Skye ----
  'old-man-storr': {
    name: 'Old Man of Storr',
    blurb: 'Poszarpana skalna iglica jak z innej planety. Klasyczna pielgrzymka po Skye.',
  },
  'quiraing': {
    name: 'Quiraing',
    blurb: 'Osuwiskowy labirynt klifów i ukrytych płaskowyżów. Fotografowie tracą tu całe dnie.',
  },
  'fairy-pools': {
    name: 'Fairy Pools',
    blurb: 'Krystalicznie błękitne kaskady pod Black Cuillin. Morsy mile widziane (woda lodowata).',
  },
  'dunvegan-castle': {
    name: 'Zamek Dunvegan',
    blurb: 'Siedziba klanu MacLeod od 800 lat — i tajemnicza Wróżkowa Chorągiew.',
  },
  'neist-point': {
    name: 'Latarnia Neist Point',
    blurb: 'Najdalej wysunięty na zachód spacer po klifach Skye. Po tutejszym zachodzie słońca żaden inny nie smakuje.',
  },
  'talisker': {
    name: 'Destylarnia Talisker',
    blurb: 'Pieprzne, dymne whisky pędzone nad samym morzem od 1830 roku.',
  },
  'portree': {
    name: 'Port w Portree',
    blurb: 'Pastelowe domki, ryba z frytkami na molo i brama do całej wyspy Skye.',
  },

  // ---- Loch Ness i Inverness ----
  'urquhart-loch-ness': {
    name: 'Loch Ness i zamek Urquhart',
    blurb: 'Przeszukuj wzrokiem toń z ruin zamku. 230m ciemności — ona gdzieś tam jest.',
  },
  'culloden': {
    name: 'Pole bitwy pod Culloden',
    blurb: 'Wrzosowisko, na którym w 1746 roku umarł sen jakobitów. Cicho druzgocące. Święta ziemia fanów „Outlandera”.',
  },
  'clava-cairns': {
    name: 'Kurhany Clava',
    blurb: '4,000-letnie kamienne kręgi — Craigh na Dun z krwi i kości.',
  },
  'inverness-old-town': {
    name: 'Stare Miasto w Inverness',
    blurb: "Stolica Highlands — spacery nad rzeką, księgarnia Leakey's i porządne puby.",
  },

  // ---- Cairngorms ----
  'cairngorms-aviemore': {
    name: 'Cairngorms i Rothiemurchus',
    blurb: 'Prastara kaledońska puszcza sosnowa, rybołowy, wiewiórki rude i arktyczny płaskowyż Wielkiej Brytanii.',
  },
  'loch-morlich': {
    name: 'Loch Morlich',
    blurb: 'Piaszczysta plaża z górami w tle — najbardziej zaskakujące kąpielisko w Szkocji.',
  },
  'highland-wildlife-park': {
    name: 'Highland Wildlife Park',
    blurb: 'Niedźwiedzie polarne, żbiki i żubry w cieniu gór.',
  },
  'balmoral': {
    name: 'Zamek Balmoral',
    blurb: 'Górska kryjówka rodziny królewskiej nad Dee.',
  },

  // ---- Speyside i Moray ----
  'glenfiddich': {
    name: 'Destylarnia Glenfiddich, Dufftown',
    blurb: 'Dolina jeleni — najlepiej sprzedająca się single malt na świecie, prosto ze źródła.',
  },
  'speyside-cooperage': {
    name: 'Bednarnia Speyside Cooperage',
    blurb: 'Zobacz, jak bednarze opalają i zbijają 100,000 beczek rocznie. Serce krainy whisky.',
  },
  'bow-fiddle-rock': {
    name: 'Bow Fiddle Rock, Portknockie',
    blurb: 'Skalna brama w kształcie smyczka, oblegana przez gniazdujące ptaki morskie.',
  },

  // ---- Aberdeenshire i Angus ----
  'dunnottar': {
    name: 'Zamek Dunnottar',
    blurb: 'Ruiny twierdzy na skale oblanej morzem. Najbardziej dramatyczne położenie zamku w Wielkiej Brytanii.',
  },
  'glamis-castle': {
    name: 'Zamek Glamis',
    blurb: 'Zamek Makbeta, dom dzieciństwa Królowej Matki — i zamurowany, sekretny pokój.',
  },

  // ---- Perthshire ----
  'hermitage-dunkeld': {
    name: 'The Hermitage, Dunkeld',
    blurb: 'Olbrzymie jodły Douglasa i georgiański pawilon nad huczącą kaskadą, przez którą przeskakują łososie.',
  },
  'queens-view': {
    name: "Queen's View nad Loch Tummel",
    blurb: 'Widok, który królowa Wiktoria uznała za swój — Schiehallion unoszący się nad jeziorem.',
  },
  'schiehallion': {
    name: 'Schiehallion',
    blurb: '„Wróżkowe wzgórze Kaledończyków” — góra, na której w 1774 roku zważono Ziemię.',
  },
  'pitlochry-edradour': {
    name: 'Pitlochry i Edradour',
    blurb: 'Wiktoriańskie uzdrowisko, a nad nim najmniejsza i najsłodsza destylarnia w Szkocji.',
  },

  // ---- Fife i Dundee ----
  'st-andrews': {
    name: 'St Andrews',
    blurb: 'Ojczyzna golfa, ruiny katedry i plaża z „Rydwanów ognia”.',
  },
  'east-neuk': {
    name: 'Wioski rybackie East Neuk',
    blurb: 'Crail, Anstruther, Pittenweem — więcierze na homary, kamienne nabrzeża i nagradzane smażalnie.',
  },
  'va-dundee': {
    name: 'V&A Dundee',
    blurb: 'Muzeum designu Kengo Kumy w kształcie dziobu statku nad rzeką Tay, obok polarnika Scotta — Discovery.',
  },

  // ---- North Coast 500 ----
  'bealach-na-ba': {
    name: 'Bealach na Bà i Applecross',
    blurb: 'Najdziksza droga Wielkiej Brytanii — alpejskie serpentyny prowadzące do pubu na końcu świata.',
  },
  'corrieshalloch': {
    name: 'Wąwóz Corrieshalloch',
    blurb: 'Półtorakilometrowa skalna szczelina i chybotliwy wiktoriański most wiszący nad wodospadem.',
  },
  'achmelvich': {
    name: 'Plaża Achmelvich',
    blurb: 'Karaibsko biały piasek i turkusowa woda. Tak, to naprawdę Szkocja.',
  },
  'smoo-cave': {
    name: 'Jaskinia Smoo, Durness',
    blurb: 'Ogromna morska jaskinia z wodospadem walącym przez strop. Rejs łodzią prosto w ciemność.',
  },
  'dunrobin': {
    name: 'Zamek Dunrobin',
    blurb: 'Francuski zamek zagubiony na wybrzeżu Sutherland, z codziennymi pokazami sokolniczymi na trawniku.',
  },

  // ---- Scottish Borders i południe ----
  'melrose-abbey': {
    name: 'Opactwo Melrose',
    blurb: "Różowe ruiny kryjące pochowane serce Roberta Bruce'a. Znajdź rzygacz w kształcie świni z dudami.",
  },
  'grey-mares-tail': {
    name: "Grey Mare's Tail",
    blurb: '60-metrowy biały pióropusz w górach Moffat, w towarzystwie dzikich kóz i sokołów wędrownych.',
  },
  'caerlaverock': {
    name: 'Zamek Caerlaverock',
    blurb: 'Jedyny trójkątny zamek w Szkocji, z fosą i całą resztą, tuż przy słonych bagnach pełnych gęsi.',
  },
  'galloway-dark-sky': {
    name: 'Park Ciemnego Nieba Galloway',
    blurb: 'Pierwszy Park Ciemnego Nieba w Wielkiej Brytanii — 7,000 gwiazd i Droga Mleczna w pogodną noc.',
  },

  // ---- Kajaki i sporty wodne ----
  'river-spey-kayak': {
    name: 'Spływ kajakowy rzeką Spey',
    blurb: 'Jedna z najlepszych rzek do spływów w Szkocji — 80 mil bystrzy klasy I–III przez krainę whisky.',
  },
  'loch-insh': {
    name: 'Centrum sportów wodnych Loch Insh',
    blurb: 'Kajaki, windsurfing i kanadyjki do wynajęcia na zjawiskowym jeziorze w Cairngorms.',
  },
  'loch-tay-kayak': {
    name: 'Kajaki morskie na Loch Tay',
    blurb: 'Przepłyń wzdłuż najdłuższego jeziora Perthshire, z Ben Lawers górującym nad horyzontem.',
  },
  'river-tummel': {
    name: 'Bystrza rzeki Tummel',
    blurb: 'Bystrza klasy III w spektakularnym, zalesionym wąwozie — spływ z listy marzeń.',
  },
  'portavadie-kayak': {
    name: 'Kajaki morskie Portavadie, Argyll',
    blurb: 'Kajakiem morskim przez Kyles of Bute — osłonięte cieśniny obrośnięte lasem i pełne fok.',
  },
  'findhorn-gorge': {
    name: 'Wąwóz rzeki Findhorn',
    blurb: 'Najbardziej dramatyczny wąwóz rzeczny w Szkocji — dostępny wyłącznie z kajaka. Niesamowite piaskowcowe ściany.',
  },

  // ---- Dzikie kąpiele ----
  'plodda-falls': {
    name: 'Wodospad Plodda i sadzawka',
    blurb: 'Efektowny wodospad 46m spadający do nefrytowej sadzawki ukrytej w wiktoriańskim lesie jodłowym. Dzika kąpiel u podnóża.',
  },
  'loch-an-eilein': {
    name: 'Dzikie kąpiele w Loch an Eilein',
    blurb: 'Dopłyń wpław do ruin zamku na wysepce pośrodku lustrzanego jeziora w otoczeniu szkockich sosen.',
  },
  'clova-pools': {
    name: 'Naturalne baseny w Glen Clova',
    blurb: 'Ciąg krystalicznych sadzawek i naturalnych zjeżdżalni na rzece South Esk w dolinach Angus.',
  },

  // ---- Wspinaczka ----
  'dumbarton-rock': {
    name: 'Wspinaczka na Dumbarton Rock',
    blurb: 'Wulkaniczny czop z drogami do Font 9a — jeden z najtrudniejszych sektorów sportowych na świecie.',
  },
  'ben-an': {
    name: "Ben A'an, Trossachs",
    blurb: 'Zwarty, efektowny szczyt z odcinkami łatwej wspinaczki i zapierającą dech panoramą Trossachs.',
  },
  'creag-dubh': {
    name: 'Creag Dubh, Newtonmore',
    blurb: 'Łupkowe płyty i ściany od Severe do E6 — obowiązkowy adres wspinaczki sportowej w Highlands.',
  },
  'shelterstone': {
    name: 'Shelter Stone Crag, Cairngorms',
    blurb: 'Odludna granitowa architektura w sercu płaskowyżu Cairngorm. Najpoważniejsze wspinanie w Szkocji.',
  },

  // ---- Kolarstwo górskie ----
  'glentress': {
    name: 'Las Glentress, Peebles (7Stanes)',
    blurb: 'Najczęściej odwiedzane centrum tras rowerowych w Szkocji — 65km szlaków od zielonych po czarne.',
  },
  'laggan-wolftrax': {
    name: 'Laggan Wolftrax',
    blurb: 'Górskie trasy przez las nad Loch Laggan — czarne zjazdy z panoramą szczytów.',
  },
  'fort-william-dh': {
    name: 'Trasa downhillowa Fort William',
    blurb: 'Trasa Pucharu Świata UCI na Aonach Mor. Zjedź tam, gdzie ścigają się zawodowcy, po najgroźniejszym torze DH w kraju.',
  },
  'ae-forest': {
    name: 'Las Ae (7Stanes)',
    blurb: 'Dzikie, odludne singletracki przez lasy Dumfries — od niebieskich po czarne.',
  },

  // ---- Surfing i coasteering ----
  'thurso-east': {
    name: 'Fala Thurso East',
    blurb: 'Światowej klasy fala rafowa z potężnymi tubami. Najdalej na północ wysunięty porządny surfing w Wielkiej Brytanii.',
  },
  'machrihanish': {
    name: 'Surfing w zatoce Machrihanish',
    blurb: 'Rozległa plaża zwrócona ku Atlantykowi, ze stabilną falą i praktycznie bez tłumów.',
  },
  'coldingham-bay': {
    name: 'Coldingham Bay: surfing i nurkowanie',
    blurb: 'Osłonięta zatoczka na wybrzeżu Berwickshire — dobra fala dla początkujących i czysta woda do snorkelingu.',
  },

  // ---- Golf ----
  'royal-dornoch': {
    name: 'Royal Dornoch Golf Club',
    blurb: 'Niezmiennie w pierwszej piątce pól świata — wiekowy links na wybrzeżu Sutherland.',
  },
  'carnoustie': {
    name: 'Carnoustie Championship Course',
    blurb: 'Gospodarz British Open zwany „Car-nasty” — bez przesady najtrudniejszy links mistrzowski na Ziemi.',
  },
  'gleneagles': {
    name: 'Gleneagles',
    blurb: "Trzy światowej klasy pola w górach Perthshire — King's, Queen's i PGA Centenary.",
  },

  // ---- Sporty zimowe ----
  'cairngorm-ski': {
    name: 'Ośrodek narciarski CairnGorm Mountain',
    blurb: 'Największy ośrodek narciarski w Szkocji, 33 trasy sięgające 1245m. Najpewniejszy śnieg w Wielkiej Brytanii.',
  },
  'glencoe-ski': {
    name: 'Ośrodek narciarski Glencoe Mountain',
    blurb: 'Najstarszy szkocki ośrodek narciarski w najbardziej dramatycznej scenerii — Glencoe zimą to obowiązek.',
  },
};

// ---- 2. Region names (17 distinct regions) ----
export const PL_REGIONS = {
  'Edinburgh & Lothians': 'Edynburg i Lothians',
  'Glasgow & Clyde': 'Glasgow i Clyde',
  'Stirling & Forth Valley': 'Stirling i dolina Forth',
  'Loch Lomond & Trossachs': 'Loch Lomond i Trossachs',
  'Argyll & the Isles': 'Argyll i wyspy',
  'Ayrshire & Arran': 'Ayrshire i Arran',
  'Highlands': 'Highlands',
  'Isle of Skye': 'Wyspa Skye',
  'Loch Ness & Inverness': 'Loch Ness i Inverness',
  'Cairngorms': 'Cairngorms',
  'Speyside & Moray': 'Speyside i Moray',
  'Aberdeenshire & Angus': 'Aberdeenshire i Angus',
  'Perthshire': 'Perthshire',
  'Fife & Dundee': 'Fife i Dundee',
  'North Coast 500': 'North Coast 500',
  'Scottish Borders': 'Scottish Borders',
  'Dumfries & Galloway': 'Dumfries i Galloway',
};

// ---- 3. Duration strings ----
export const PL_TIMES = {
  '2–3 hrs': '2–3 godz.',
  '2 hrs': '2 godz.',
  '1 hr': '1 godz.',
  '1.5 hrs': '1,5 godz.',
  '2.5 hrs': '2,5 godz.',
  '3 hrs': '3 godz.',
  '4 hrs': '4 godz.',
  '5 hrs': '5 godz.',
  '45 min': '45 min',
  'half day': 'pół dnia',
  'full day': 'cały dzień',
  'evening': 'wieczór',
};

// ---- 4. Start city names ----
export const PL_CITIES = {
  'Edinburgh': 'Edynburg',
  'Glasgow': 'Glasgow',
  'Stirling': 'Stirling',
  'Inverness': 'Inverness',
  'Aberdeen': 'Aberdeen',
  'Dundee': 'Dundee',
  'Oban': 'Oban',
  'Fort William': 'Fort William',
  'Portree': 'Portree',
};
