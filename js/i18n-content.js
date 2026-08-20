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

  // ---- city and regional stops ----
  'aberdeen-beach': { name: 'Plaża i promenada w Aberdeen', blurb: 'Trzy kilometry piasku zaczynające się tuż za miastem, delfiny w zatoce i Morze Północne robiące swoje.' },
  'footdee': { name: 'Footdee (Fittie)', blurb: 'Zaplanowana wioska rybacka z 1809 roku u wylotu portu, gdzie chaty zwrócone są do wewnątrz na dziedzińce, a każda szopa ozdobiona jest inaczej.' },
  'old-aberdeen': { name: 'Stare Aberdeen i King’s College', blurb: 'Brukowane uliczki i wieża kaplicy zwieńczona koroną z 1495 roku, gdy uniwersytet założono bullą papieską. Wydaje się zupełnie innym miastem niż granitowe Aberdeen.' },
  'st-machars': { name: 'Katedra św. Machara', blurb: 'Ufortyfikowana granitowa katedra z bliźniaczymi iglicami i heraldycznym stropem z 48 tarczami. Podobno w murach pochowano jedną z ćwiartek ciała Williama Wallace’a.' },
  'aberdeen-maritime': { name: 'Muzeum Morskie w Aberdeen', blurb: 'Klipry, latarnie morskie i trzypiętrowy model platformy wiertniczej, w domu kupieckim z 1593 roku przy starej ulicy portowej. Wstęp wolny.' },
  'duthie-park': { name: 'Duthie Park i Ogrody Zimowe', blurb: 'Jeden z największych krytych ogrodów w Europie, darmowy i ogrzewany, co w aberdeeńskim lutym nie jest drobiazgiem. Kaktusy, karpie koi i gadające papugi.' },
  'marischal-college': { name: 'Marischal College', blurb: 'Drugi co do wielkości budynek granitowy na świecie — klif szarych iglic i sterczyn, który srebrzeje, gdy wreszcie wyjdzie słońce.' },
  'aberdeen-art-gallery': { name: 'Galeria Sztuki w Aberdeen', blurb: 'Otwarta ponownie w 2019 roku po przebudowie, która dodała galerię na dachu. Mocna kolekcja szkockich kolorystów, wstęp wolny.' },
  'torry-battery': { name: 'Bateria Torry i obserwacja delfinów', blurb: 'Wiktoriańska bateria dział nad wylotem portu i jedno z najlepszych miejsc w Europie, by oglądać butlonosy z suchego lądu. Najlepiej przy przypływie.' },
  'balmedie-beach': { name: 'Plaża i wydmy Balmedie', blurb: 'Dwadzieścia kilometrów wydm na północ od miasta, dość wysokich, by schować się przed wiatrem, i dość pustych, by zgubić wszystkich innych.' },
  'stonehaven-harbour': { name: 'Port w Stonehaven', blurb: 'Schludny kamienny port, nad nim odkryty basen w stylu art déco, a przy nim smażalnia, która twierdzi, że wynalazła batona Mars w głębokim tłuszczu.' },
  'crathes-castle': { name: 'Zamek i ogrody Crathes', blurb: 'XVI-wieczna wieża mieszkalna z malowanymi stropami i osiem ogrodowych wnętrz otoczonych murem, z 300-letnimi żywopłotami cisowymi. Ma też Zieloną Damę.' },
  'craigievar-castle': { name: 'Zamek Craigievar', blurb: 'Różowa baśniowa wieża ukończona w 1626 roku i od tego czasu niemal nietknięta, z wieżyczkami, które podobno podsunęły Waltowi Disneyowi pewien zamek.' },
  'fyvie-castle': { name: 'Zamek Fyvie', blurb: 'Pięć wież, pięć rodów i więcej opowieści o duchach na metr kwadratowy niż gdziekolwiek na północnym wschodzie — zielona dama, tajemny pokój i klątwa z trzema płaczącymi kamieniami.' },
  'bennachie': { name: 'Bennachie', blurb: 'Wzgórze, na które wchodzi każdy mieszkaniec północnego wschodu. Tylko 528 metrów, ale stoi samotnie, więc ze szczytu widać całe Aberdeenshire naraz.' },
  'bullers-of-buchan': { name: 'Bullers of Buchan', blurb: 'Zapadnięta jaskinia morska tworząca okrągłą przepaść, do której wlewa się morze, obsadzona wczesnym latem maskonurami i mewami trójpalczastymi. Ścieżka biegnie samą krawędzią.' },
  'slains-castle': { name: 'Nowy Zamek Slains', blurb: 'Bezdachowa ruina na klifie, gdzie Bram Stoker spędzał wakacje podczas pisania i która, jak się uważa, dała Drakuli jego zamek. Bez ogrodzenia i naprawdę niebezpieczna przy wietrze.' },
  'dunnottar-woods': { name: 'Aden Country Park', blurb: '93 hektary lasu i jeziora dawnego majątku, z muzeum rolnictwa w starym półkolistym zabudowaniu gospodarczym. Dobre na mokre popołudnie z dziećmi.' },
  'iona-abbey': { name: 'Opactwo na Ionie', blurb: 'Tu w 563 roku wylądował Kolumba z Irlandii i tędy chrześcijaństwo weszło do Szkocji. Być może powstała tu Księga z Kells. W ziemi obok pochowani są królowie Szkocji, Irlandii i Norwegii.' },
  'kilmartin-glen': { name: 'Dolina Kilmartin', blurb: 'Ponad 350 prehistorycznych zabytków w promieniu dziesięciu kilometrów — kopce w linii, kamienne kręgi i ryty naskalne — oraz Dunadd, gród, gdzie koronowano królów Dál Riaty.' },
  'inveraray-jail': { name: 'Więzienie w Inveraray', blurb: 'Georgiański sąd i więzienie obsadzone aktorami w kostiumach; siadasz na ławie oskarżonych, dostajesz wyrok i dowiadujesz się, co dalej działo się w 1820 roku.' },
  'crinan-canal': { name: 'Kanał Crinan', blurb: 'Czternaście kilometrów kanału zbudowanego w 1801 roku, by oszczędzić łodziom długiej drogi wokół Mull of Kintyre. Piętnaście śluz, ścieżka holownicza do jazdy rowerem i bar z owocami morza przy ujściu.' },
  'burns-cottage': { name: 'Chata Burnsa w Alloway', blurb: 'Kryta strzechą dwuizbowa chata, w której w 1759 roku urodził się Robert Burns, a kawałek dalej cmentarz, gdzie kazał tańczyć wiedźmom z Tam o’ Shantera.' },
  'brodick-castle': { name: 'Zamek Brodick, Arran', blurb: 'Czerwony piaskowiec nad zatoką Brodick, z leśnym ogrodem rododendronów kwitnących w mikroklimacie Prądu Zatokowego i wiewiórkami rudymi na terenie posiadłości.' },
  'ruthven-barracks': { name: 'Koszary Ruthven', blurb: 'Rządowe koszary z 1719 roku na zielonym wzniesieniu, gdzie jakobici zebrali się po Culloden i otrzymali rozkaz rozejścia się. Sami je spalili i wrócili do domów.' },
  'loch-garten': { name: 'Centrum Rybołowów Loch Garten', blurb: 'Tu w 1954 roku rybołowy wróciły do gniazdowania w Wielkiej Brytanii, po dekadach nieobecności. Kamery na gnieździe od kwietnia do sierpnia, w starym lesie kaledońskim.' },
  'linn-of-dee': { name: 'Linn of Dee', blurb: 'Rzeka Dee ściśnięta w wąskim skalnym wąwozie, w który patrzysz prosto z mostu, na końcu drogi, gdzie zaczynają się szlaki w wysokie Cairngorms.' },
  'corgarff-castle': { name: 'Zamek Corgarff', blurb: 'Biała wieża wewnątrz gwiaździstego muru obronnego, samotna na wrzosowisku na szczycie drogi zamykanej przy śniegu. Jej historia jest ponura nawet jak na góralskie standardy.' },
  'threave-castle': { name: 'Zamek Threave', blurb: 'Ponura wyspiarska wieża Czarnych Douglasów, do której dostajesz się, dzwoniąc po przewoźnika. Latem gnieżdżą się w pobliżu rybołowy.' },
  'sweetheart-abbey': { name: 'Opactwo Sweetheart', blurb: 'Ruiny z czerwonego piaskowca założone w 1273 roku przez lady Devorgillę, która przez dwadzieścia dwa lata nosiła ze sobą zabalsamowane serce męża i została pochowana, trzymając je.' },
  'national-museum': { name: 'Muzeum Narodowe Szkocji', blurb: 'Owca Dolly, figura szachowa z Lewis i szkielet wieloryba pod wiktoriańskim szklanym dachem. Wstęp wolny, ogrom, a z tarasu na dachu jeden z najlepszych widoków w mieście.' },
  'scottish-national-gallery': { name: 'Szkocka Galeria Narodowa', blurb: 'Tycjan, Vermeer i łyżwiarz Raeburna, za darmo, przy samej Princes Street między Starym a Nowym Miastem.' },
  'holyrood-palace': { name: 'Pałac Holyroodhouse', blurb: 'Oficjalna rezydencja króla w Szkocji, u stóp Royal Mile. Mieszkała tu Maria Stuart, a jej sekretarza zamordowano w pokoju, który Ci pokażą.' },
  'dean-village': { name: 'Dean Village', blurb: 'Dawna osada młynarska nad Water of Leith, pięć minut od Princes Street i jakieś czterysta lat od niej.' },
  'water-of-leith': { name: 'Szlak nad Water of Leith', blurb: 'Dwadzieścia kilometrów zalesionej ścieżki nad rzeką przez całe miasto, a po drodze figury Antony’ego Gormleya stojące w wodzie.' },
  'leith-shore': { name: 'The Shore, Leith', blurb: 'Stary port Edynburga, dziś najlepsze jedzenie w mieście — gwiazdki Michelin i smażalnie ryb na tym samym brukowanym nabrzeżu.' },
  'portobello-beach': { name: 'Plaża Portobello', blurb: 'Trzy kilometry piasku z wiktoriańską promenadą, dwadzieścia minut autobusem od zamku. Pływacy wchodzą tu przez cały rok, co mówi o nich swoje.' },
  'greyfriars': { name: 'Cmentarz Greyfriars', blurb: 'Wierny terier, więzienie kowenantczyków i nazwiska na płytach, które pewna autorka pożyczyła swoim czarodziejom.' },
  'royal-botanic-edinburgh': { name: 'Królewski Ogród Botaniczny w Edynburgu', blurb: 'Dwadzieścia osiem hektarów i wiktoriańska palmiarnia, założone w 1670 roku jako ogród zielarski. Wstęp wolny, a widok na panoramę z górnego trawnika to ten z pocztówek.' },
  'scott-monument': { name: 'Pomnik Scotta', blurb: '287 stopni na największy pomnik pisarza na świecie, a schody zwężają się przez całą drogę.' },
  'edinburgh-zoo': { name: 'Zoo w Edynburgu', blurb: 'Zbudowane na zboczu, więc idziesz cały czas pod górę. Parada pingwinów odbywa się od lat 50. i jest dokładnie tak dobra, jak brzmi.' },
  'grassmarket': { name: 'Grassmarket', blurb: 'Puby pod skałą zamkową, na placu, gdzie kiedyś wieszano ludzi. Jedna gospoda nosi imię kobiety, która to przeżyła.' },
  'rrs-discovery': { name: 'RRS Discovery', blurb: 'Antarktyczny statek Scotta, zbudowany w Dundee w 1901 roku i wrócił tam, gdzie powstał. Można zejść pod pokład do kabin i mesy.' },
  'dundee-law': { name: 'Dundee Law', blurb: 'Wygasły wulkan w środku miasta. Ze szczytu widać oba mosty na Tay, wybrzeże Fife, a w pogodny dzień Cairngorms.' },
  'broughty-ferry': { name: 'Broughty Ferry i zamek', blurb: 'XV-wieczna wieża stojąca w wodzie u ujścia rzeki, obok piaszczysta plaża, a kawałek dalej najlepsze lody w Tayside.' },
  'verdant-works': { name: 'Verdant Works', blurb: 'Odrestaurowana przędzalnia juty opowiadająca o handlu, który zbudował Dundee — i o kobietach, które w nim pracowały i przewyższały mężczyzn liczbą trzy do jednego.' },
  'camperdown-park': { name: 'Camperdown Country Park', blurb: '160 hektarów parku z małym centrum dzikiej przyrody — niedźwiedzie brunatne, rysie i żbiki szkockie — oraz jedna z największych kolekcji drzew w Szkocji.' },
  'falkland-palace': { name: 'Pałac Falkland', blurb: 'Renesansowy pałac myśliwski Stuartów w zabytkowej wsi, z najstarszym wciąż używanym kortem do jeu de paume na świecie, zbudowanym w 1541 roku.' },
  'culross': { name: 'Culross', blurb: 'Kompletne XVII-wieczne miasteczko w ochrze i schodkowych szczytach, tak nienaruszone, że Outlander użył go jako wioski, niewiele zmieniając.' },
  'dunfermline-abbey': { name: 'Opactwo i pałac w Dunfermline', blurb: 'Pod amboną pochowano Roberta Bruce’a — bez serca, które trafiło do Melrose. Królewska nekropolia Szkocji po Dunkeld, a przed Ioną.' },
  'aberdour-castle': { name: 'Zamek Aberdour i Silver Sands', blurb: 'Jeden z najstarszych zachowanych zamków w Szkocji, z tarasowym ogrodem i ulowym gołębnikiem, a pięć minut w dół zbocza dobra piaszczysta plaża.' },
  'riverside-museum': { name: 'Riverside Museum', blurb: 'Zygzakowata hala Zahy Hadid pełna tramwajów, lokomotyw i odtworzonej ulicy z 1900 roku, a przy nabrzeżu cumuje żaglowiec. Wstęp wolny.' },
  'glasgow-science-centre': { name: 'Centrum Nauki w Glasgow', blurb: 'Trzy piętra rzeczy do naciskania nad Clyde, plus planetarium i 127-metrowa wieża, która obraca się do wiatru.' },
  'glasgow-cathedral': { name: 'Katedra w Glasgow', blurb: 'Jedyna średniowieczna katedra na szkockim lądzie stałym, która przetrwała reformację w całości, wzniesiona nad grobem założyciela miasta.' },
  'burrell-collection': { name: 'Kolekcja Burrella, Pollok Park', blurb: 'Osiem tysięcy obiektów jednego magnata żeglugowego — Degas, dynastia Ming, średniowieczne witraże — w szklanym budynku w parku, a za oknem szkockie bydło.' },
  'glasgow-botanic': { name: 'Ogród Botaniczny w Glasgow', blurb: 'Kibble Palace, wygięta żelazna palmiarnia z 1873 roku, pełna paproci drzewiastych i marmurowych posągów. Wstęp wolny i ciepło w lutym.' },
  'peoples-palace': { name: 'People’s Palace i Glasgow Green', blurb: 'Muzeum zwyczajnego życia Glasgow w najstarszym parku miasta, z doklejonym z tyłu zimowym ogrodem pod szkłem.' },
  'mackintosh-willow': { name: 'Mackintosh at the Willow', blurb: 'Charles Rennie Mackintosh zaprojektował tu w 1903 roku wszystko, aż po sztućce i sukienki kelnerek. Odrestaurowane i znów podaje herbatę.' },
  'finnieston-clyde': { name: 'Finnieston i Clyde Arc', blurb: 'Dawna dzielnica stoczniowa zamieniona w gastronomiczną ulicę Glasgow, pod dźwigiem Finnieston, który kiedyś ładował lokomotywy na statki.' },
  'the-barras': { name: 'The Barras i Barrowland', blurb: 'Weekendowy targ od lat 20. XX wieku, a nad nim Barrowland Ballroom — sprężysty parkiet, o którym zespoły mówią, że to najlepsza sala w Wielkiej Brytanii.' },
  'plockton': { name: 'Plockton', blurb: 'Zatoka tak osłonięta i łagodna, że nad brzegiem rosną palmy, a przy nich rząd białych chat i łodzie na cumach. Nieprawdopodobne i całkiem prawdziwe.' },
  'torridon': { name: 'Torridon', blurb: 'Piaskowcowe góry trzykrotnie starsze od skał większości Alp, wznoszące się niemal prosto z morskiej zatoki. Liathach i Beinn Eighe to jedne z najpiękniejszych szczytów Wielkiej Brytanii.' },
  'inverewe-garden': { name: 'Ogród Inverewe', blurb: 'Subtropikalny ogród na tej samej szerokości geograficznej co Syberia, możliwy dzięki Prądowi Zatokowemu i pasowi ochronnemu posadzonemu w 1862 roku na gołej skale.' },
  'glen-affric': { name: 'Glen Affric', blurb: 'Często nazywana najpiękniejszą doliną Szkocji — jeden z największych ocalałych fragmentów pradawnego kaledońskiego lasu sosnowego, odbity w łańcuchu jezior.' },
  'ardnamurchan-point': { name: 'Przylądek Ardnamurchan', blurb: 'Najbardziej wysunięty na zachód punkt brytyjskiego lądu stałego, z latarnią w stylu egipskim, a w pogodny wieczór z widokiem na cały łańcuch Hebrydów Wewnętrznych.' },
  'sligachan': { name: 'Sligachan, Skye', blurb: 'Stary most z Czarnymi Cuillin w tle — najczęściej fotografowany widok na Skye. Zanurz twarz w rzece, by uzyskać wieczną urodę, jeśli wierzyć legendzie.' },
  'elgol': { name: 'Elgol', blurb: 'Slip na końcu długiej jednopasmowej drogi, naprzeciw pełnego amfiteatru Cuillin po drugiej stronie Loch Scavaig. Stąd pływają łodzie do Loch Coruisk.' },
  'kilt-rock': { name: 'Kilt Rock i wodospad Mealt', blurb: 'Bazaltowy klif pofałdowany jak kilt, a obok wodospad spadający 60 metrów prosto do morza. Pięć minut od parkingu.' },
  'coral-beach': { name: 'Koralowa plaża, Claigan', blurb: 'Nie koral, lecz zmielone glony maerl, wybielone, które w rzadki pogodny dzień barwią wodę nieprawdopodobnym turkusem. Półtora kilometra łatwego marszu od drogi.' },
  'loch-lomond-shores': { name: 'Balloch i Loch Lomond Shores', blurb: 'Południowa brama jeziora: rejsy, wypożyczalnia desek SUP, akwarium i plaża, czterdzieści minut pociągiem z Glasgow.' },
  'the-cobbler': { name: 'The Cobbler (Ben Arthur)', blurb: 'Najbardziej charakterystyczna sylwetka w południowych Highlands. Aby naprawdę go zdobyć, trzeba przejść przez ucho szczytowej skały i obejść ekspozycję na wierzchołkowy blok.' },
  'bracklinn-falls': { name: 'Callander i wodospady Bracklinn', blurb: 'Wąwóz i kładka nad rwącymi wodospadami, dwadzieścia minut spacerem od miasteczka pełnego herbaciarni. Pierwotny most porwała powódź w 2004 roku.' },
  'inchmahome': { name: 'Przeorat Inchmahome', blurb: 'Wyspiarski przeorat na Lake of Menteith, dostępny promem, gdzie w 1547 roku ukryto czteroletnią Marię Stuart, zanim wysłano ją do Francji.' },
  'inverness-castle': { name: 'Punkt widokowy przy zamku w Inverness', blurb: 'Czerwony piaskowiec nad rzeką Ness, a z tarasu jednym obrotem głowy ogarniasz całe miasto, rzekę i góry za nią.' },
  'ness-islands': { name: 'Wyspy Ness', blurb: 'Zalesione wyspy rzeczne połączone wiktoriańskimi kładkami wiszącymi, dziesięć minut od centrum Inverness i zupełnie ciche.' },
  'fort-george': { name: 'Fort George', blurb: 'Najpotężniejsza fortyfikacja artyleryjska w Wielkiej Brytanii, zbudowana po Culloden, by to się nie powtórzyło — i nigdy nie zaatakowana. Pod wałami przepływają delfiny.' },
  'cawdor-castle': { name: 'Zamek Cawdor', blurb: 'Wciąż zamieszkany i wciąż ma ostrokrzew rosnący w sklepionej piwnicy, wokół którego rodzina zbudowała wieżę w 1454 roku. Szekspir dał ten tytuł Makbetowi; zamek powstał później.' },
  'chanonry-point': { name: 'Chanonry Point', blurb: 'Najlepsze miejsce w Wielkiej Brytanii, by zobaczyć butlonosy z brzegu — polują na łososie w cieśninie przy przypływie, czasem kilka metrów od Ciebie.' },
  'beauly-priory': { name: 'Przeorat Beauly', blurb: 'Bezdachowy XIII-wieczny przeorat przy wiejskim rynku, a przed nim wiąz należący do najstarszych w Europie. Nazwę miejscu miała nadać Maria Stuart.' },
  'sandwood-bay': { name: 'Zatoka Sandwood', blurb: 'Półtora kilometra różowego piasku z ostańcem skalnym na końcu, siedem kilometrów pieszo od najbliższej drogi. Nie ma innej drogi, i o to chodzi.' },
  'handa-island': { name: 'Wyspa Handa', blurb: 'Rezerwat ptaków morskich, do którego dopływa się łodzią z Tarbet: nurzyki, alki i wydrzyki wielkie w dziesiątkach tysięcy na 100-metrowych klifach, od kwietnia do sierpnia.' },
  'scone-palace': { name: 'Pałac Scone', blurb: 'Miejsce koronacji szkockich królów przez stulecia, na Moot Hill, gdzie stał Kamień Przeznaczenia. Pawie na trawniku i labirynt z żywopłotu.' },
  'kinnoull-hill': { name: 'Wzgórze Kinnoull', blurb: 'Wieża-kaprys na krawędzi klifu nad rzeką Tay, zbudowana tak, by przypominała Ren. Pół godziny podejścia z Perth, a widok obejmuje całą dolinę.' },
  'blair-castle': { name: 'Zamek Blair', blurb: 'Bielona siedziba książąt Atholl, których właściciel utrzymuje jedyną legalną prywatną armię w Europie. Trzydzieści pokoi, jelenie w parku i ogród otoczony murem.' },
  'killiecrankie': { name: 'Przełęcz Killiecrankie', blurb: 'Zalesiony wąwóz, gdzie szarża jakobitów rozbiła armię rządową w 1689 roku i gdzie uciekający żołnierz miał przeskoczyć rzekę na odległość pięciu i pół metra.' },
  'loch-leven-castle': { name: 'Zamek Loch Leven', blurb: 'Wyspiarskie więzienie, do którego dopływa się łódką; w 1567 roku trzymano tu Marię Stuart, zmuszono do abdykacji, a ona uciekła z pomocą chłopca i skradzionego klucza.' },
  'abbotsford': { name: 'Abbotsford, dom Waltera Scotta', blurb: 'Dom, który Walter Scott zbudował za pieniądze z powieści, wypchany zbrojami, strzelbą Roba Roya i 9000 książek, nad zakolem rzeki Tweed.' },
  'jedburgh-abbey': { name: 'Opactwo Jedburgh', blurb: 'Najlepiej zachowane z czterech opactw pogranicza, z wciąż stojącą rozetą, palone wielokrotnie przez trzy stulecia za to, że leżało blisko Anglii.' },
  'scotts-view': { name: 'Scott’s View i Dryburgh', blurb: 'Ulubiony widok Waltera Scotta na wzgórza Eildon; konie ciągnące jego karawan miały się tu zatrzymać z przyzwyczajenia. Jego grób jest w opactwie poniżej.' },
  'traquair-house': { name: 'Traquair House', blurb: 'Najdłużej nieprzerwanie zamieszkany dom w Szkocji, ponad 900 lat. Główną bramę zamknięto w 1745 roku i nie otworzy się, póki na tronie nie zasiądzie Stuart. Warzy własne piwo.' },
  'culbin-forest': { name: 'Las i piaski Culbin', blurb: 'Las posadzony na pustyni — wydmy, które w sztormie 1694 roku zasypały cały majątek, ustabilizowano sosnami. Kilometry płaskich ścieżek i pusty brzeg.' },
  'glenlivet': { name: 'Destylarnia The Glenlivet', blurb: 'Pierwsza legalna destylarnia w parafii, w 1824 roku, gdy wszyscy sąsiedzi działali nielegalnie, a jej założyciel przez dekadę nosił przy sobie pistolety.' },
  'bannockburn': { name: 'Bannockburn', blurb: 'Tu Bruce pokonał znacznie liczniejszą armię angielską w ciągu dwóch dni w czerwcu 1314 roku. Centrum dla zwiedzających wprowadza Cię w bitwę w 3D; samo pole to cicha trawa.' },
  'doune-castle': { name: 'Zamek Doune', blurb: 'Wyjątkowo dobrze zachowany XIV-wieczny zamek z dziedzińcem i najczęściej filmowany w Szkocji — Monty Python, Outlander i Winterfell naraz. Audioprzewodnik czyta Terry Jones.' },
  'dunblane-cathedral': { name: 'Katedra w Dunblane', blurb: 'XIII-wieczna katedra z normańską wieżą, odrestaurowana w latach 90. XIX wieku, w małym miasteczku katedralnym pełnym herbaciarni i z dobrą księgarnią.' },
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
