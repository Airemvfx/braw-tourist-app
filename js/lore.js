// ============================================================
// The Library — Scotland's facts, legends, history and language.
//
// Ships with the app, so it works with no signal in a glen. That is the
// whole point: the moment you want to know why a place is called what it
// is called, you are usually standing in it, three miles from a bar of
// reception.
//
// Every entry carries both languages. Types are kept apart on purpose:
//   fact     — checkable, and phrased so it can be checked
//   history  — dated, with the date given
//   legend   — folklore, and always said to be folklore. Nessie is not
//              filed next to the height of Ben Nevis.
//   word     — Gaelic and Scots, because the map is written in them
//   egg      — hidden until you find it
//
// `unlock` decides when an entry appears:
//   null            always readable
//   { visit: id }   after checking in at that location
//   { region: name} after stamping that region
//   { level: n }    at that level
//   { egg: key }    only by doing the thing
// ============================================================

export const LORE_TYPES = {
  fact:    { icon: '💡' },
  history: { icon: '📜' },
  legend:  { icon: '🔮' },
  word:    { icon: '🗣️' },
  egg:     { icon: '🥚' },
};

export const LORE = [
  // ---------------------------------------------------------------
  // Facts
  // ---------------------------------------------------------------
  { id: 'nevis-observatory', type: 'fact', poi: 'ben-nevis', unlock: { visit: 'ben-nevis' },
    en: { t: 'There was a weather station on the summit',
          b: 'From 1883 to 1904 observers lived on top of Ben Nevis year-round, taking readings hourly in every weather. The ruins are still up there beside the summit cairn. The data they collected inspired Charles Wilson to invent the cloud chamber, which went on to win a Nobel Prize in physics.' },
    pl: { t: 'Na szczycie działała stacja meteorologiczna',
          b: 'W latach 1883–1904 obserwatorzy mieszkali na szczycie Ben Nevis przez cały rok, notując pomiary co godzinę przy każdej pogodzie. Ruiny wciąż stoją obok kopca szczytowego. Zebrane dane zainspirowały Charlesa Wilsona do wynalezienia komory mgłowej, nagrodzonej Noblem z fizyki.' } },

  { id: 'nessie-volume', type: 'fact', poi: 'urquhart-loch-ness', unlock: null,
    en: { t: 'Loch Ness holds more water than England and Wales combined',
          b: 'It is not the largest loch by surface area — Loch Lomond is — but it is deep and long, and holds more fresh water than every lake in England and Wales put together. The water is stained dark brown by peat, which is why visibility a few metres down is nearly nil.' },
    pl: { t: 'Loch Ness mieści więcej wody niż Anglia i Walia razem',
          b: 'Nie jest największe powierzchnią — to Loch Lomond — ale jest głębokie i długie, i mieści więcej słodkiej wody niż wszystkie jeziora Anglii i Walii razem. Woda jest ciemnobrązowa od torfu, dlatego widoczność kilka metrów w głąb jest niemal zerowa.' } },

  { id: 'cuillin-compass', type: 'fact', poi: 'fairy-pools', unlock: { region: 'Isle of Skye' },
    en: { t: 'The Cuillin will lie to your compass',
          b: 'The Black Cuillin are gabbro and basalt, rich enough in magnetic minerals to pull a compass needle off true by many degrees in places. Mountaineers on Skye are taught to navigate by the map and the ground rather than trust the needle. It is one of very few ranges in the world where this is standard advice.' },
    pl: { t: 'Cuillin okłamie Twój kompas',
          b: 'Czarne Cuillin zbudowane są z gabra i bazaltu, na tyle bogatych w minerały magnetyczne, że miejscami odchylają igłę o wiele stopni. Wspinaczy na Skye uczy się nawigować mapą i terenem, a nie ufać igle. To jedno z nielicznych pasm na świecie, gdzie taka rada jest standardem.' } },

  { id: 'staffa-columns', type: 'fact', poi: 'fingals-cave', unlock: { visit: 'fingals-cave' },
    en: { t: 'Fingal’s Cave and the Giant’s Causeway are the same lava flow',
          b: 'The hexagonal columns on Staffa formed about 60 million years ago as a thick basalt flow cooled and contracted, cracking into pillars. The same flow surfaces again across the sea in Northern Ireland as the Giant’s Causeway — which is exactly what the old legend of a giant’s road between them says.' },
    pl: { t: 'Grota Fingala i Grobla Olbrzyma to ten sam potok lawy',
          b: 'Sześciokątne kolumny na Staffie powstały około 60 milionów lat temu, gdy gruby potok bazaltu stygł i kurczył się, pękając w słupy. Ten sam potok wychodzi na powierzchnię po drugiej stronie morza w Irlandii Północnej jako Grobla Olbrzyma — dokładnie tak, jak mówi stara legenda o drodze olbrzyma.' } },

  { id: 'mendelssohn', type: 'fact', poi: 'fingals-cave', unlock: { visit: 'fingals-cave' },
    en: { t: 'A seasick composer wrote the tune here',
          b: 'Felix Mendelssohn visited Staffa in August 1829 and was violently seasick on the crossing. He still sent his sister the opening bars of what became The Hebrides overture that same day. The cave’s natural acoustics — it is around 70 metres deep with a vaulted roof — do the rest.' },
    pl: { t: 'Melodię napisał tu kompozytor z chorobą morską',
          b: 'Felix Mendelssohn odwiedził Staffę w sierpniu 1829 roku i okropnie chorował podczas rejsu. Mimo to jeszcze tego samego dnia wysłał siostrze pierwsze takty uwertury Hebrydy. Resztę robi naturalna akustyka groty — ma około 70 metrów głębokości i sklepiony strop.' } },

  { id: 'achmelvich-gneiss', type: 'fact', poi: 'achmelvich', unlock: { visit: 'achmelvich' },
    en: { t: 'You are standing on some of the oldest rock in Europe',
          b: 'The grey, banded Lewisian gneiss around Assynt is roughly three billion years old — more than half the age of the Earth. It was already ancient bedrock before anything with a backbone existed. The white sand of the beach is ground-up shell, which is why it is so pale against the dark rock.' },
    pl: { t: 'Stoisz na jednych z najstarszych skał Europy',
          b: 'Szary, pasiasty gnejs lewizyjski wokół Assynt ma około trzech miliardów lat — ponad połowę wieku Ziemi. Był już starożytnym podłożem, zanim pojawiło się cokolwiek z kręgosłupem. Biały piasek plaży to zmielone muszle, dlatego tak jasno odcina się od ciemnej skały.' } },

  { id: 'bealach-climb', type: 'fact', poi: 'bealach-na-ba', unlock: { visit: 'bealach-na-ba' },
    en: { t: 'The steepest sustained road climb in Britain',
          b: 'Bealach na Bà rises from sea level to 626 metres in about nine kilometres, with hairpins and gradients touching 20%. The name is Gaelic for the pass of the cattle: it was a drove road, walked by herds long before it was ever surfaced for cars.' },
    pl: { t: 'Najbardziej stromy ciągły podjazd w Wielkiej Brytanii',
          b: 'Bealach na Bà wznosi się od poziomu morza do 626 metrów na około dziewięciu kilometrach, z serpentynami i nachyleniem sięgającym 20%. Nazwa po gaelicku znaczy przełęcz bydła: to była droga poganiaczy, przemierzana przez stada na długo przed asfaltem.' } },

  { id: 'kelpies-scale', type: 'fact', poi: 'the-kelpies', unlock: null,
    en: { t: 'Thirty metres of horse, modelled on two real ones',
          b: 'Andy Scott’s sculptures were completed in 2013 and stand 30 metres tall in 300 tonnes of steel. They were modelled on two Clydesdales called Duke and Baron — a breed that hauled the barges along these very canals.' },
    pl: { t: 'Trzydzieści metrów konia, wzorowane na dwóch prawdziwych',
          b: 'Rzeźby Andy’ego Scotta ukończono w 2013 roku; mają 30 metrów wysokości i 300 ton stali. Wzorowano je na dwóch klidesdalach o imionach Duke i Baron — rasie, która ciągnęła barki właśnie tymi kanałami.' } },

  { id: 'dark-sky-first', type: 'fact', poi: 'galloway-dark-sky', unlock: { visit: 'galloway-dark-sky' },
    en: { t: 'Britain’s first Dark Sky Park',
          b: 'Galloway Forest was designated in 2009, the first in the UK. On a clear moonless night you can see around 7,000 stars with the naked eye and the Milky Way casts a faint shadow. Give your eyes a full twenty minutes to adapt and use a red torch — white light resets the process.' },
    pl: { t: 'Pierwszy w Wielkiej Brytanii Park Ciemnego Nieba',
          b: 'Las Galloway uzyskał status w 2009 roku, jako pierwszy w kraju. W bezchmurną, bezksiężycową noc gołym okiem widać około 7000 gwiazd, a Droga Mleczna rzuca słaby cień. Daj oczom pełne dwadzieścia minut na adaptację i użyj czerwonej latarki — białe światło resetuje proces.' } },

  { id: 'schiehallion-weighing', type: 'fact', poi: 'schiehallion', unlock: { visit: 'schiehallion' },
    en: { t: 'This mountain was used to weigh the Earth',
          b: 'In 1774 Nevil Maskelyne measured how much Schiehallion’s mass pulled a pendulum sideways, and from it estimated the density of the planet. To calculate the mountain’s volume his colleague Charles Hutton joined points of equal height on the survey — inventing the contour line, which is still on every map you own.' },
    pl: { t: 'Tą górą zważono Ziemię',
          b: 'W 1774 roku Nevil Maskelyne zmierzył, jak bardzo masa Schiehallion odchyla wahadło na bok, i na tej podstawie oszacował gęstość planety. Aby obliczyć objętość góry, jego współpracownik Charles Hutton połączył punkty o równej wysokości — wynajdując poziomicę, obecną do dziś na każdej mapie.' } },

  { id: 'glenfinnan-concrete', type: 'fact', poi: 'glenfinnan-viaduct', unlock: null,
    en: { t: 'The famous viaduct is made of concrete, not stone',
          b: 'Built between 1897 and 1901, its 21 arches were among the earliest large-scale uses of mass concrete in Britain — cheap, because there was no good building stone nearby. Robert McAlpine’s nickname, Concrete Bob, comes from projects like this one.' },
    pl: { t: 'Słynny wiadukt jest z betonu, nie z kamienia',
          b: 'Zbudowany w latach 1897–1901, jego 21 łuków było jednym z pierwszych zastosowań betonu na dużą skalę w Wielkiej Brytanii — tanio, bo w pobliżu nie było dobrego kamienia. Przydomek Roberta McAlpine’a, Betonowy Bob, wziął się z takich właśnie budów.' } },

  { id: 'corrieshalloch-gorge', type: 'fact', poi: 'corrieshalloch', unlock: { visit: 'corrieshalloch' },
    en: { t: 'A box canyon cut by meltwater',
          b: 'Corrieshalloch is around 60 metres deep and barely wider in places, carved in a geological instant by torrents draining the last ice sheet. The Victorian suspension bridge across it is deliberately limited to a handful of people at a time — it bounces.' },
    pl: { t: 'Kanion wycięty przez wody roztopowe',
          b: 'Corrieshalloch ma około 60 metrów głębokości i miejscami niewiele więcej szerokości, wyżłobiony w geologicznej chwili przez potoki z topniejącego lądolodu. Wiktoriański most wiszący celowo dopuszcza tylko kilka osób naraz — buja się.' } },

  { id: 'arthurs-seat-volcano', type: 'fact', poi: 'arthurs-seat', unlock: null,
    en: { t: 'An extinct volcano in the middle of a capital city',
          b: 'Arthur’s Seat last erupted around 340 million years ago, and the whole of central Edinburgh is built on its remains. The castle sits on the hard volcanic plug; the long slope of the Royal Mile behind it is the tail of debris a glacier could not scour away.' },
    pl: { t: 'Wygasły wulkan w środku stolicy',
          b: 'Arthur’s Seat wybuchł ostatnio około 340 milionów lat temu, a całe centrum Edynburga stoi na jego pozostałościach. Zamek wznosi się na twardym czopie wulkanicznym; długi stok Royal Mile za nim to ogon rumoszu, którego lodowiec nie zdołał zetrzeć.' } },

  { id: 'st-andrews-golf', type: 'fact', poi: 'st-andrews', unlock: { visit: 'st-andrews' },
    en: { t: 'Golf was banned here for getting in the way of archery',
          b: 'Golf has been played on the links at St Andrews since at least the 1400s. In 1457 James II banned it outright, because men were playing instead of practising archery, which the kingdom rather needed. The ban was lifted in 1502 — by a king who promptly bought himself a set of clubs.' },
    pl: { t: 'Golfa zakazano tu, bo przeszkadzał w łucznictwie',
          b: 'W golfa gra się na polach St Andrews co najmniej od XV wieku. W 1457 roku Jakub II zakazał go całkowicie, bo mężczyźni grali zamiast ćwiczyć łucznictwo, którego królestwo raczej potrzebowało. Zakaz zniesiono w 1502 roku — przez króla, który zaraz kupił sobie kije.' } },

  { id: 'midge-fact', type: 'fact', poi: null, unlock: null,
    en: { t: 'Only the female midge bites, and she cannot fly in wind',
          b: 'The Highland midge needs blood to develop her eggs; the male feeds on nectar and is harmless. She struggles above about 7 mph of wind and avoids bright sun, which is why a breezy hilltop is bearable and a still evening by water is not. The season runs roughly late May to September.' },
    pl: { t: 'Gryzie tylko samica meszki, i nie lata przy wietrze',
          b: 'Szkocka meszka potrzebuje krwi do rozwoju jaj; samiec żywi się nektarem i jest nieszkodliwy. Ma trudności powyżej około 11 km/h wiatru i unika ostrego słońca — dlatego wietrzny szczyt jest znośny, a bezwietrzny wieczór nad wodą nie. Sezon trwa mniej więcej od końca maja do września.' } },

  // ---------------------------------------------------------------
  // History
  // ---------------------------------------------------------------
  { id: 'culloden-1746', type: 'history', poi: 'culloden', unlock: { visit: 'culloden' },
    en: { t: '16 April 1746 — the last pitched battle on British soil',
          b: 'The Jacobite army was broken here in under an hour on open, boggy moor that suited the government guns and not the Highland charge. What followed mattered more than the battle: the carrying of arms, the pipes and the tartan were suppressed by law, and the clan system as a way of holding land was dismantled.' },
    pl: { t: '16 kwietnia 1746 — ostatnia regularna bitwa na ziemi brytyjskiej',
          b: 'Armia jakobicka została tu rozbita w niecałą godzinę na otwartym, bagnistym wrzosowisku, które sprzyjało rządowym działom, a nie góralskiej szarży. To, co nastąpiło potem, znaczyło więcej niż sama bitwa: noszenie broni, dud i tartanu zakazano prawem, a system klanowy jako sposób władania ziemią rozmontowano.' } },

  { id: 'glencoe-1692', type: 'history', poi: 'glencoe', unlock: { visit: 'glencoe' },
    en: { t: '13 February 1692 — the Massacre of Glencoe',
          b: 'Soldiers who had been quartered as guests among the MacDonalds for twelve days turned on their hosts at dawn. Around thirty were killed outright and more died in the snow. It is remembered less for the number than for the breach of hospitality, which Highland custom held close to sacred.' },
    pl: { t: '13 lutego 1692 — masakra w Glencoe',
          b: 'Żołnierze, którzy przez dwanaście dni kwaterowali jako goście u MacDonaldów, o świcie zwrócili się przeciw gospodarzom. Około trzydziestu zginęło od razu, więcej zmarło w śniegu. Pamięta się to nie tyle z powodu liczby ofiar, co złamania prawa gościnności, które góralski obyczaj uważał niemal za świętość.' } },

  { id: 'stirling-bridge', type: 'history', poi: 'wallace-monument', unlock: { visit: 'wallace-monument' },
    en: { t: '11 September 1297 — a bridge did most of the work',
          b: 'Wallace and Andrew de Moray let the English army cross the narrow wooden bridge at Stirling a few at a time, then attacked once too few were over to fight and too many to retreat. Moray died of his wounds within months, which is why the victory is remembered under one name instead of two.' },
    pl: { t: '11 września 1297 — most wykonał większość pracy',
          b: 'Wallace i Andrew de Moray pozwolili armii angielskiej przechodzić wąskim drewnianym mostem w Stirling po kilku naraz, a potem zaatakowali, gdy po drugiej stronie było zbyt mało, by walczyć, i zbyt wielu, by się wycofać. Moray zmarł z ran w ciągu kilku miesięcy — dlatego zwycięstwo pamięta się pod jednym nazwiskiem, nie dwoma.' } },

  { id: 'dunnottar-honours', type: 'history', poi: 'dunnottar', unlock: { visit: 'dunnottar' },
    en: { t: 'The crown jewels were smuggled out in a bundle of flax',
          b: 'In 1651 the Honours of Scotland — crown, sceptre and sword — were taken to Dunnottar to keep them from Cromwell’s army. After an eight-month siege they were smuggled out past the besiegers and buried under the floor of a nearby church, where they stayed until the Restoration.' },
    pl: { t: 'Klejnoty koronne wyniesiono w wiązce lnu',
          b: 'W 1651 roku Honory Szkocji — koronę, berło i miecz — przewieziono do Dunnottar, by ukryć je przed armią Cromwella. Po ośmiomiesięcznym oblężeniu wyniesiono je pod nosem oblegających i zakopano pod podłogą pobliskiego kościoła, gdzie przetrwały do restauracji monarchii.' } },

  { id: 'rosslyn-carvings', type: 'history', poi: 'rosslyn-chapel', unlock: { visit: 'rosslyn-chapel' },
    en: { t: 'Forty years of carving, and it was never finished',
          b: 'Building began in 1446 and stopped when its founder died; what stands is the choir of a much larger church that was never completed. Every surface is carved — over a hundred green men, and plants some claim are New World maize carved before Columbus sailed, which botanists mostly read as stylised wheat.' },
    pl: { t: 'Czterdzieści lat rzeźbienia i nigdy nie ukończono',
          b: 'Budowę zaczęto w 1446 roku i przerwano po śmierci fundatora; to, co stoi, to prezbiterium znacznie większego kościoła, którego nie dokończono. Każda powierzchnia jest rzeźbiona — ponad sto zielonych ludzi i rośliny, w których niektórzy widzą kukurydzę sprzed wyprawy Kolumba, a botanicy raczej stylizowaną pszenicę.' } },

  { id: 'clava-age', type: 'history', poi: 'clava-cairns', unlock: { visit: 'clava-cairns' },
    en: { t: 'Older than Stonehenge in its current form',
          b: 'The Clava cairns were built around 4,000 years ago in the Bronze Age. Two of them are passage graves aligned on the midwinter sunset, so that low light runs straight down the passage to the chamber on the shortest days of the year.' },
    pl: { t: 'Starsze niż Stonehenge w obecnej postaci',
          b: 'Kopce Clava zbudowano około 4000 lat temu, w epoce brązu. Dwa z nich to groby korytarzowe skierowane na zachód słońca w przesilenie zimowe — niskie światło wpada wtedy prosto korytarzem do komory w najkrótsze dni roku.' } },

  { id: 'clearances', type: 'history', poi: null, unlock: { level: 4 },
    en: { t: 'Why the glens are so empty',
          b: 'Between roughly 1750 and 1860 landlords cleared tenants from inland straths to make room for sheep, which paid better. Many were moved to poor coastal land or emigrated. The green rectangles of old field walls you see on hillsides with nobody living near them are usually the reason a glen that looks wild is really depopulated.' },
    pl: { t: 'Dlaczego doliny są tak puste',
          b: 'Mniej więcej między 1750 a 1860 rokiem właściciele ziemscy usuwali dzierżawców z dolin w głębi lądu, by zrobić miejsce owcom, które przynosiły większy dochód. Wielu przeniesiono na ubogie wybrzeża albo wyemigrowali. Zielone prostokąty dawnych murów polnych na zboczach, gdzie nikt nie mieszka, to zwykle powód, dla którego dolina wyglądająca dziko jest w istocie wyludniona.' } },

  { id: 'right-to-roam', type: 'history', poi: null, unlock: null,
    en: { t: 'You are allowed to be almost anywhere',
          b: 'The Land Reform (Scotland) Act 2003 gives a right of responsible access to most land and inland water, for walking, cycling, riding and wild camping. It comes with the Scottish Outdoor Access Code: leave gates as you find them, keep dogs off stock and lambing ground, take everything away with you, and camp small, out of sight and for no more than two or three nights.' },
    pl: { t: 'Wolno Ci być niemal wszędzie',
          b: 'Ustawa o reformie rolnej (Szkocja) z 2003 roku daje prawo odpowiedzialnego dostępu do większości gruntów i wód śródlądowych — pieszo, rowerem, konno i pod namiotem. Wiąże się z Kodeksem Dostępu: zostawiaj bramy tak, jak je zastałeś, trzymaj psy z dala od stad i owiec w okresie wykotu, zabieraj wszystko ze sobą i biwakuj małym obozem, poza widokiem, nie dłużej niż dwie–trzy noce.' } },

  // ---------------------------------------------------------------
  // Legends — said to be legends
  // ---------------------------------------------------------------
  { id: 'kelpie-legend', type: 'legend', poi: 'the-kelpies', unlock: null,
    en: { t: 'The each-uisge, and why you do not pat a strange horse',
          b: 'Folklore tells of a water horse that appears tame beside a loch and invites a rider onto its back. Its hide is said to turn adhesive, so the rider cannot get off, and it bolts for deep water. It is a story with a job: it kept children away from the edges of very cold, very deep lochs.' },
    pl: { t: 'Each-uisge, czyli dlaczego nie głaszcze się obcego konia',
          b: 'Folklor opowiada o wodnym koniu, który zjawia się łagodny nad jeziorem i zaprasza jeźdźca na grzbiet. Jego skóra ma stawać się lepka, tak że jeździec nie może zejść, a koń rzuca się w głębinę. To opowieść z zadaniem: trzymała dzieci z dala od brzegów bardzo zimnych i bardzo głębokich jezior.' } },

  { id: 'nessie-columba', type: 'legend', poi: 'urquhart-loch-ness', unlock: { visit: 'urquhart-loch-ness' },
    en: { t: 'The first sighting is from the year 565',
          b: 'Adomnán’s Life of St Columba, written around 700, has the saint turning back a water beast in the River Ness. The modern story begins in 1933, the year a new road along the loch gave everyone a clear view of the water for the first time — which historians think is the more relevant date.' },
    pl: { t: 'Pierwsza obserwacja pochodzi z roku 565',
          b: 'Żywot świętego Kolumby pióra Adomnána, spisany około roku 700, opisuje, jak święty zawrócił wodną bestię w rzece Ness. Współczesna historia zaczyna się w 1933 roku, gdy nowa droga wzdłuż jeziora po raz pierwszy dała wszystkim wyraźny widok na wodę — historycy uważają tę datę za istotniejszą.' } },

  { id: 'fairy-flag', type: 'legend', poi: 'dunvegan-castle', unlock: { visit: 'dunvegan-castle' },
    en: { t: 'The Fairy Flag has two wishes left',
          b: 'Clan MacLeod keeps a fragment of silk said to have been given by a fairy wife, which will save the clan three times when waved. Two uses are claimed. Textile analysis dates the silk to somewhere between the 4th and 7th centuries and places its origin in the Middle East — which does not settle the matter for the clan.' },
    pl: { t: 'Wróżkowej Fladze zostały dwa życzenia',
          b: 'Klan MacLeod przechowuje strzęp jedwabiu, rzekomo dar wróżki-żony, który powiewnięty ocali klan trzy razy. Dwa użycia są odnotowane. Analiza tkaniny datuje jedwab między IV a VII wiekiem i wskazuje Bliski Wschód jako miejsce pochodzenia — co dla klanu bynajmniej nie zamyka sprawy.' } },

  { id: 'grey-man', type: 'legend', poi: 'cairngorms-aviemore', unlock: { region: 'Cairngorms' },
    en: { t: 'Am Fear Liath Mòr, the Big Grey Man of Ben Macdui',
          b: 'Climbers on the Cairngorm plateau have reported footsteps behind them in mist, a presence, and a sudden unreasoning urge to flee. A likely explanation is the Brocken spectre — your own shadow thrown huge onto cloud — plus infrasound from wind over the corries, which is known to make people uneasy without knowing why.' },
    pl: { t: 'Am Fear Liath Mòr, Wielki Szary Człowiek z Ben Macdui',
          b: 'Wspinacze na płaskowyżu Cairngorm opisują kroki za plecami we mgle, czyjąś obecność i nagłą, bezrozumną chęć ucieczki. Prawdopodobne wyjaśnienie to widmo Brockenu — własny cień rzucony olbrzymio na chmurę — plus infradźwięki wiatru nad kotłami, o których wiadomo, że wywołują niepokój bez uchwytnej przyczyny.' } },

  { id: 'selkie', type: 'legend', poi: 'neist-point', unlock: null,
    en: { t: 'Selkies, and the stolen skin',
          b: 'In the tales of the northern isles and coasts, seals come ashore and shed their skins to walk as people. A man who hides a selkie’s skin can keep her as a wife; she finds it eventually, and goes back to the sea. Almost every version ends the same way, which tells you what the story is really about.' },
    pl: { t: 'Selkie i skradziona skóra',
          b: 'W opowieściach z północnych wysp i wybrzeży foki wychodzą na ląd i zrzucają skóry, by chodzić jako ludzie. Mężczyzna, który ukryje skórę selkie, może zatrzymać ją za żonę; ona w końcu ją znajduje i wraca do morza. Niemal każda wersja kończy się tak samo, co mówi, o czym ta opowieść naprawdę jest.' } },

  { id: 'brahan-seer', type: 'legend', poi: 'inverness-old-town', unlock: { region: 'Loch Ness & Inverness' },
    en: { t: 'The Brahan Seer and the stone with a hole in it',
          b: 'Coinneach Odhar is said to have seen the future through a holed stone, foretelling the Highland Clearances and ships passing behind Tomnahurich hill — which the Caledonian Canal later did. He is also said to have been burned in a barrel of tar for telling a countess exactly what her husband was doing in Paris.' },
    pl: { t: 'Jasnowidz z Brahan i kamień z dziurą',
          b: 'Coinneach Odhar miał widzieć przyszłość przez kamień z otworem, przepowiadając czystki góralskie i statki przepływające za wzgórzem Tomnahurich — co później uczynił Kanał Kaledoński. Miał też zostać spalony w beczce smoły za to, że powiedział hrabinie dokładnie, co jej mąż robi w Paryżu.' } },

  { id: 'stone-of-destiny', type: 'legend', poi: 'stirling-castle', unlock: { level: 5 },
    en: { t: 'The Stone of Destiny, and the students who took it back',
          b: 'Scottish kings were enthroned on a block of sandstone until Edward I removed it to Westminster in 1296. On Christmas Day 1950 four students stole it back, breaking it in the process, and it turned up months later at Arbroath Abbey. It returned to Scotland officially in 1996. Some insist the stone that went south was always a decoy.' },
    pl: { t: 'Kamień Przeznaczenia i studenci, którzy go odzyskali',
          b: 'Szkoccy królowie byli intronizowani na bloku piaskowca, dopóki Edward I nie zabrał go do Westminsteru w 1296 roku. W Boże Narodzenie 1950 roku czterech studentów wykradło go z powrotem, łamiąc przy tym, a kamień odnalazł się miesiące później w opactwie Arbroath. Oficjalnie wrócił do Szkocji w 1996 roku. Niektórzy twierdzą, że ten wywieziony zawsze był atrapą.' } },

  { id: 'glamis-secret', type: 'legend', poi: 'glamis-castle', unlock: { visit: 'glamis-castle' },
    en: { t: 'The sealed room at Glamis',
          b: 'The castle is said to hold a chamber whose location only the earl, his heir and the factor may know. One story has a card game with a stranger that never ended; another, a hidden member of the family. A Victorian party is supposed to have hung a towel from every window and found one window with no towel.' },
    pl: { t: 'Zamurowany pokój w Glamis',
          b: 'Zamek ma podobno kryć komnatę, której położenie znają tylko hrabia, jego dziedzic i zarządca. Jedna opowieść mówi o partii kart z nieznajomym, która nigdy się nie skończyła; inna o ukrytym członku rodziny. Wiktoriańskie towarzystwo miało wywiesić ręcznik z każdego okna i znaleźć jedno okno bez ręcznika.' } },

  { id: 'melrose-heart', type: 'legend', poi: 'melrose-abbey', unlock: { visit: 'melrose-abbey' },
    en: { t: 'A heart in a casket, and a pig playing the bagpipes',
          b: 'Robert the Bruce asked that his heart be carried on crusade; it got as far as Spain, came home, and a casket containing a heart was excavated at Melrose in 1921 and again in 1996. Look up on the south side for the abbey’s other famous resident: a carved pig playing the bagpipes.' },
    pl: { t: 'Serce w szkatule i świnia grająca na dudach',
          b: 'Robert Bruce prosił, by jego serce zabrano na krucjatę; dotarło do Hiszpanii, wróciło, a szkatułę z sercem odkopano w Melrose w 1921 i ponownie w 1996 roku. Spójrz w górę po południowej stronie na drugiego słynnego mieszkańca opactwa: rzeźbioną świnię grającą na dudach.' } },

  // ---------------------------------------------------------------
  // Words — the map is written in these
  // ---------------------------------------------------------------
  { id: 'word-ben', type: 'word', poi: null, unlock: null,
    en: { t: 'Ben — beinn', b: 'Mountain. Ben Nevis, Ben Macdui, Ben Lomond. If a name starts with Ben you are being told to look up.' },
    pl: { t: 'Ben — beinn', b: 'Góra. Ben Nevis, Ben Macdui, Ben Lomond. Jeśli nazwa zaczyna się od Ben, mówi Ci, żebyś spojrzał w górę.' } },

  { id: 'word-glen', type: 'word', poi: null, unlock: null,
    en: { t: 'Glen — gleann', b: 'A narrow valley, usually with a river in it. A strath is its broad, gentle cousin: Strathspey is the wide valley of the Spey.' },
    pl: { t: 'Glen — gleann', b: 'Wąska dolina, zwykle z rzeką. Strath to jej szeroki, łagodny kuzyn: Strathspey to szeroka dolina rzeki Spey.' } },

  { id: 'word-kyle', type: 'word', poi: null, unlock: null,
    en: { t: 'Kyle — caol', b: 'A narrow strait. Kyle of Lochalsh sits at the narrows where the Skye Bridge now crosses — the name told you where to cross centuries before the bridge existed.' },
    pl: { t: 'Kyle — caol', b: 'Wąska cieśnina. Kyle of Lochalsh leży w przewężeniu, gdzie dziś przechodzi most na Skye — nazwa wskazywała miejsce przeprawy wieki przed mostem.' } },

  { id: 'word-inver', type: 'word', poi: null, unlock: null,
    en: { t: 'Inver — inbhir, and Aber', b: 'A river mouth. Inverness is the mouth of the Ness. Aber means the same in Pictish and Welsh — Aberdeen, Aberystwyth — so the two prefixes roughly map where each language was once spoken.' },
    pl: { t: 'Inver — inbhir, oraz Aber', b: 'Ujście rzeki. Inverness to ujście rzeki Ness. Aber znaczy to samo po piktyjsku i walijsku — Aberdeen, Aberystwyth — więc oba przedrostki mniej więcej wyznaczają, gdzie mówiono którym językiem.' } },

  { id: 'word-dun', type: 'word', poi: null, unlock: null,
    en: { t: 'Dun — dùn', b: 'A fort or stronghold. Dunvegan, Dunnottar, Dundee, Dunkeld. If a place begins with Dun, somebody once thought it was worth defending.' },
    pl: { t: 'Dun — dùn', b: 'Twierdza, warownia. Dunvegan, Dunnottar, Dundee, Dunkeld. Jeśli nazwa zaczyna się od Dun, ktoś kiedyś uznał to miejsce za warte obrony.' } },

  { id: 'word-dreich', type: 'word', poi: null, unlock: null,
    en: { t: 'Dreich', b: 'Scots for the specific weather that is grey, wet, cold and settled in for the day. Not a storm — a storm at least has ambition. Voted the most evocative Scots word in a 2019 poll.' },
    pl: { t: 'Dreich', b: 'Po szkocku: ta konkretna pogoda, która jest szara, mokra, zimna i rozgościła się na cały dzień. Nie burza — burza ma przynajmniej ambicję. W plebiscycie z 2019 roku uznane za najbardziej obrazowe szkockie słowo.' } },

  { id: 'word-haar', type: 'word', poi: null, unlock: null,
    en: { t: 'Haar', b: 'The cold sea fog that rolls in off the North Sea and swallows the east coast on a summer afternoon, often while five miles inland stays sunny. Edinburgh gets it worst.' },
    pl: { t: 'Haar', b: 'Zimna mgła morska, która nadciąga z Morza Północnego i połyka wschodnie wybrzeże w letnie popołudnie, podczas gdy osiem kilometrów w głąb lądu wciąż świeci słońce. Edynburg dostaje jej najwięcej.' } },

  { id: 'word-smirr', type: 'word', poi: null, unlock: null,
    en: { t: 'Smirr', b: 'Rain so fine it hangs in the air rather than falling. You do not notice it starting and you are soaked through within the hour.' },
    pl: { t: 'Smirr', b: 'Deszcz tak drobny, że wisi w powietrzu, zamiast padać. Nie zauważysz, kiedy się zaczął, a w godzinę jesteś przemoczony.' } },

  { id: 'word-gloaming', type: 'word', poi: null, unlock: null,
    en: { t: 'The gloaming', b: 'Dusk — the long blue half-light between sunset and dark. In a Scottish June it can last two hours, and at the far north it barely finishes before the sky starts getting light again.' },
    pl: { t: 'The gloaming', b: 'Zmierzch — długie, niebieskie półświatło między zachodem a ciemnością. W szkockim czerwcu potrafi trwać dwie godziny, a na dalekiej północy ledwie się kończy, zanim niebo znów zaczyna jaśnieć.' } },

  { id: 'word-bothy', type: 'word', poi: null, unlock: { level: 3 },
    en: { t: 'Bothy', b: 'A simple shelter left unlocked in the hills for anyone to use, free, first come first served. No booking, no warden, usually no water. The Mountain Bothies Association maintains around a hundred of them. Leave it cleaner than you found it and carry your rubbish out.' },
    pl: { t: 'Bothy', b: 'Proste schronienie zostawione otwarte w górach do użytku każdego, za darmo, kto pierwszy ten lepszy. Bez rezerwacji, bez gospodarza, zwykle bez wody. Mountain Bothies Association utrzymuje ich około stu. Zostaw czyściej, niż zastałeś, i zabierz śmieci ze sobą.' } },

  { id: 'word-munro', type: 'word', poi: null, unlock: null,
    en: { t: 'Munro, Corbett, Graham', b: 'A Munro is a Scottish hill over 3,000 feet — there are 282, catalogued by Sir Hugh Munro in 1891. A Corbett is 2,500 to 3,000 feet with a decent drop on all sides, a Graham 2,000 to 2,500. Climbing all of one list is called compleating, spelled like that on purpose.' },
    pl: { t: 'Munro, Corbett, Graham', b: 'Munro to szkockie wzniesienie powyżej 3000 stóp — jest ich 282, skatalogowanych przez sir Hugh Munro w 1891 roku. Corbett ma 2500–3000 stóp i wyraźne obniżenie ze wszystkich stron, Graham 2000–2500. Zdobycie całej listy nazywa się compleating, celowo pisane przez „ea".' } },

  { id: 'word-ceilidh', type: 'word', poi: 'ashton-lane', unlock: null,
    en: { t: 'Ceilidh', b: 'Pronounced kay-lee. Originally just a visit or a gathering with music and stories; now usually a dance where somebody calls the steps before each one, on the reasonable assumption that nobody knows them.' },
    pl: { t: 'Ceilidh', b: 'Wymawiane kej-li. Pierwotnie po prostu odwiedziny albo spotkanie z muzyką i opowieściami; dziś zwykle potańcówka, na której ktoś zapowiada kroki przed każdym tańcem, słusznie zakładając, że nikt ich nie zna.' } },

  // ---------------------------------------------------------------
  // Easter eggs — you have to find these
  // ---------------------------------------------------------------
  { id: 'egg-braw', type: 'egg', poi: null, unlock: { egg: 'wordmark' },
    en: { t: 'Braw',
          b: 'Scots for fine, excellent, splendid. A braw day is a good one. A braw lad is a fine young man. It is also, as you have just worked out, the name of this app — and you found this by tapping the wordmark seven times, which is exactly the sort of thing we were hoping somebody would try.' },
    pl: { t: 'Braw',
          b: 'Po szkocku: świetny, znakomity, wspaniały. Braw day to dobry dzień. Braw lad to zacny młodzieniec. To także, jak właśnie odkryłeś, nazwa tej aplikacji — a znalazłeś to, stukając w logo siedem razy, czyli dokładnie tak, jak liczyliśmy, że ktoś spróbuje.' } },

  { id: 'egg-nessie', type: 'egg', poi: 'urquhart-loch-ness', unlock: { egg: 'nessie' },
    en: { t: 'You stared at the loch long enough',
          b: 'Nothing surfaced. That is the correct and historically usual outcome, shared with several thousand patient people a year and at least one sonar survey of the entire loch. A 2018 environmental DNA study found no reptile DNA in the water at all — though it did find a surprising amount of eel.' },
    pl: { t: 'Wpatrywałeś się w jezioro wystarczająco długo',
          b: 'Nic się nie wynurzyło. To wynik poprawny i historycznie typowy, dzielony z kilkoma tysiącami cierpliwych osób rocznie i co najmniej jednym sonarowym badaniem całego jeziora. Analiza DNA środowiskowego z 2018 roku nie znalazła w wodzie żadnego DNA gadów — za to zaskakująco dużo węgorza.' } },

  { id: 'egg-dreich', type: 'egg', poi: null, unlock: { egg: 'darkmode' },
    en: { t: 'You switched to light mode in Scotland',
          b: 'Bold. The national average is about 1,200 mm of rain a year and roughly 170 wet days, rising to well over 250 on the west coast. Fort William is the wettest town in Britain. Enjoy the optimism — the dark theme will be waiting.' },
    pl: { t: 'Włączyłeś jasny motyw w Szkocji',
          b: 'Odważnie. Średnia krajowa to około 1200 mm deszczu rocznie i mniej więcej 170 mokrych dni, a na zachodnim wybrzeżu grubo ponad 250. Fort William jest najbardziej mokrym miastem Wielkiej Brytanii. Korzystaj z optymizmu — ciemny motyw poczeka.' } },

  { id: 'egg-collector', type: 'egg', poi: null, unlock: { egg: 'library' },
    en: { t: 'You read the whole library',
          b: 'Every fact, every legend, every word. There is no badge for this that would be worth as much as the fact that you did it. Go outside — the good bit is the actual glen, and it is still there.' },
    pl: { t: 'Przeczytałeś całą bibliotekę',
          b: 'Każdy fakt, każdą legendę, każde słowo. Nie ma odznaki, która byłaby warta tyle, ile sam fakt, że to zrobiłeś. Wyjdź na zewnątrz — najlepsza część to prawdziwa dolina, i wciąż tam jest.' } },
];

export const LORE_BY_ID = Object.fromEntries(LORE.map(l => [l.id, l]));

/** Entries attached to a location. */
export function loreForPoi(poiId) {
  return LORE.filter(l => l.poi === poiId);
}

/** Is this entry readable yet, for this user? */
export function isUnlocked(entry, user) {
  const u = entry.unlock;
  if (!u) return true;
  if (!user) return false;
  if (u.egg) return !!(user.eggs || {})[u.egg];
  if (u.level) return (user.level || 1) >= u.level;
  if (u.region) return !!(user.stamps || {})[u.region];
  if (u.visit) return (user.trips || []).some(t => t.visited && t.visited[u.visit]);
  return false;
}

/** Counts for the library header and the profile stat. */
export function loreProgress(user) {
  const total = LORE.length;
  const open = LORE.filter(l => isUnlocked(l, user)).length;
  return { open, total, pct: total ? Math.round((open / total) * 100) : 0 };
}
