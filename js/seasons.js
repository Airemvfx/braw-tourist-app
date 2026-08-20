// ============================================================
// What Scotland is doing right now.
//
// Scotland changes more by month than almost anywhere marketed to
// visitors, and none of that was in the app. This is the layer that
// makes it worth opening in February: puffins arrive and leave, the
// heather turns and goes over, the rut starts, the snow gates open.
//
// Every window is a rough guide, not a guarantee — nature does not read
// calendars, and the app says so rather than promising a sighting.
//
// `months` are 1–12 inclusive and may wrap the year end (e.g. Oct–Mar).
// `pois` and `tags` link an entry to places, so "show me this" can build
// a trip out of it.
// ============================================================

export const SEASONS = [
  { id: 'puffins', icon: '🐧', kind: 'wildlife', months: [4, 5, 6, 7],
    pois: ['fingals-cave', 'bullers-of-buchan', 'handa-island', 'bow-fiddle-rock'],
    tags: ['wildlife', 'island'],
    en: { t: 'Puffins are ashore',
          b: 'They come in to breed from about April and most have gone back out to sea by early August. Bullers of Buchan and Handa are the easiest colonies to reach; Staffa needs a boat.' },
    pl: { t: 'Maskonury są na lądzie',
          b: 'Przypływają na lęgi mniej więcej od kwietnia, a do początku sierpnia większość wraca w morze. Bullers of Buchan i Handa to najłatwiej dostępne kolonie; na Staffę trzeba popłynąć.' } },

  { id: 'ospreys', icon: '🦅', kind: 'wildlife', months: [4, 5, 6, 7, 8],
    pois: ['loch-garten', 'cairngorms-aviemore'],
    tags: ['wildlife'],
    en: { t: 'Ospreys are nesting',
          b: 'Back from West Africa in late March, fishing all summer, gone again by early September. Loch Garten has live nest cameras through the season.' },
    pl: { t: 'Rybołowy gniazdują',
          b: 'Wracają z Afryki Zachodniej pod koniec marca, łowią całe lato i znikają na początku września. W Loch Garten przez cały sezon działają kamery przy gnieździe.' } },

  { id: 'bluebells', icon: '💙', kind: 'nature', months: [5],
    pois: ['hermitage-dunkeld', 'glen-affric', 'culbin-forest', 'crathes-castle'],
    tags: ['forest', 'nature'],
    en: { t: 'Bluebells in the woods',
          b: 'Two or three weeks in May, and the ancient woodland floors go blue. Stay on the paths — the leaves take years to recover from being trodden.' },
    pl: { t: 'Dzwonki w lasach',
          b: 'Dwa, trzy tygodnie w maju i dna starych lasów robią się niebieskie. Trzymaj się ścieżek — liście potrzebują lat, by dojść do siebie po zdeptaniu.' } },

  { id: 'longdays', icon: '🌅', kind: 'sky', months: [6, 7],
    pois: ['neist-point', 'achmelvich', 'sandwood-bay', 'calton-hill'],
    tags: ['coast', 'views', 'scenic'],
    en: { t: 'The light barely goes',
          b: 'Around midsummer the far north gets about four hours of proper darkness, and the north-west coast holds a usable dusk until nearly midnight. Sunsets last for an hour.' },
    pl: { t: 'Światło prawie nie gaśnie',
          b: 'Około przesilenia letniego daleka północ ma około czterech godzin prawdziwej ciemności, a północno-zachodnie wybrzeże trzyma użyteczny zmierzch niemal do północy. Zachody słońca trwają godzinę.' } },

  { id: 'midges', icon: '🦟', kind: 'warning', months: [6, 7, 8],
    pois: [], tags: ['loch', 'forest', 'wildswim'],
    en: { t: 'Peak midge',
          b: 'Worst on still, damp evenings near water, west coast especially. They cannot fly in a breeze or bright sun, so a hilltop or an open beach is fine. Repellent, and cover your ankles.' },
    pl: { t: 'Szczyt sezonu meszek',
          b: 'Najgorzej w bezwietrzne, wilgotne wieczory nad wodą, zwłaszcza na zachodnim wybrzeżu. Nie latają przy wietrze ani ostrym słońcu, więc szczyt albo otwarta plaża są w porządku. Repelent i zakryte kostki.' } },

  { id: 'swimming', icon: '🏊', kind: 'sport', months: [7, 8, 9],
    pois: ['loch-morlich', 'coral-beach', 'clova-pools', 'loch-an-eilein', 'portobello-beach'],
    tags: ['wildswim', 'beach'],
    en: { t: 'The water is at its least awful',
          b: 'Scottish sea and loch temperatures peak in late August and early September, a month or two behind the air. That still means about 14°C, so it is warm the way a Scottish summer is warm.' },
    pl: { t: 'Woda jest najmniej okropna',
          b: 'Temperatura morza i jezior osiąga szczyt pod koniec sierpnia i na początku września, miesiąc lub dwa za powietrzem. To wciąż około 14°C, więc ciepło w takim sensie, w jakim ciepłe jest szkockie lato.' } },

  { id: 'heather', icon: '💜', kind: 'nature', months: [8],
    pois: ['bennachie', 'galloway-dark-sky', 'glencoe', 'quiraing'],
    tags: ['nature', 'hiking', 'scenic'],
    en: { t: 'The heather turns',
          b: 'For a few weeks in August the moors go properly purple, which is the version of Scotland on every shortbread tin. By late September it has gone brown again.' },
    pl: { t: 'Wrzos zakwita',
          b: 'Przez kilka tygodni w sierpniu wrzosowiska robią się naprawdę fioletowe — to ta Szkocja z każdej puszki po herbatnikach. Pod koniec września znów są brązowe.' } },

  { id: 'rut', icon: '🦌', kind: 'wildlife', months: [9, 10],
    pois: ['cairngorms-aviemore', 'glen-affric', 'torridon', 'balmoral', 'highland-wildlife-park'],
    tags: ['wildlife', 'mountain'],
    en: { t: 'The red deer rut',
          b: 'Late September into October the stags roar across the glens, and you hear it long before you see anything. Keep well back and keep dogs on a lead — they are large, and they are not in a reasonable frame of mind.' },
    pl: { t: 'Rykowisko jeleni',
          b: 'Od końca września w październik byki ryczą po dolinach, a słychać to na długo przed tym, zanim cokolwiek zobaczysz. Trzymaj dystans i psa na smyczy — są duże i nie w najrozsądniejszym nastroju.' } },

  { id: 'autumn', icon: '🍂', kind: 'nature', months: [10, 11],
    pois: ['hermitage-dunkeld', 'killiecrankie', 'pitlochry-edradour', 'queens-view', 'glen-affric'],
    tags: ['forest', 'scenic', 'waterfall'],
    en: { t: 'Big Tree Country turns',
          b: 'Perthshire has some of the tallest and oldest trees in Britain, and mid-October is when they are worth the drive on their own. The Hermitage and Killiecrankie are the classic two.' },
    pl: { t: 'Kraina Wielkich Drzew zmienia barwy',
          b: 'W Perthshire rosną jedne z najwyższych i najstarszych drzew w Wielkiej Brytanii, a w połowie października są warte podróży same w sobie. The Hermitage i Killiecrankie to klasyczna para.' } },

  { id: 'salmon', icon: '🐟', kind: 'wildlife', months: [10, 11],
    pois: ['hermitage-dunkeld', 'river-spey-kayak', 'linn-of-dee'],
    tags: ['river', 'waterfall', 'wildlife'],
    en: { t: 'Salmon are running',
          b: 'They come up the rivers to spawn through October and November and leap the falls to do it. The Hermitage at Dunkeld has a viewing platform built for exactly this.' },
    pl: { t: 'Wędrówka łososi',
          b: 'W październiku i listopadzie wchodzą w górę rzek na tarło i przeskakują wodospady. W The Hermitage w Dunkeld zbudowano platformę widokową dokładnie po to.' } },

  { id: 'seals', icon: '🦭', kind: 'wildlife', months: [10, 11, 12],
    pois: ['tobermory', 'handa-island', 'chanonry-point', 'balmedie-beach'],
    tags: ['wildlife', 'coast'],
    en: { t: 'Grey seal pups',
          b: 'Grey seals pup on Scottish coasts in the autumn, and the white-coated young stay ashore for about three weeks. Watch from a distance — a disturbed mother may abandon a pup.' },
    pl: { t: 'Młode foki szare',
          b: 'Foki szare rodzą jesienią na szkockich wybrzeżach, a białe młode zostają na lądzie około trzech tygodni. Obserwuj z dystansu — spłoszona matka potrafi porzucić młode.' } },

  { id: 'aurora', icon: '🌌', kind: 'sky', months: [10, 11, 12, 1, 2, 3],
    pois: ['galloway-dark-sky', 'neist-point', 'smoo-cave', 'thurso-east', 'ardnamurchan-point'],
    tags: ['stargazing', 'coast'],
    en: { t: 'Aurora season',
          b: 'The Mirrie Dancers need a dark sky, a clear night and a solar storm, and the further north the better your odds. Face north, get away from town lights, and check a space-weather forecast the same evening.' },
    pl: { t: 'Sezon na zorzę',
          b: 'Mirrie Dancers potrzebują ciemnego nieba, bezchmurnej nocy i burzy słonecznej, a im dalej na północ, tym większe szanse. Ustaw się na północ, uciekaj od świateł miasta i sprawdź prognozę pogody kosmicznej tego samego wieczoru.' } },

  { id: 'darksky', icon: '✨', kind: 'sky', months: [10, 11, 12, 1, 2],
    pois: ['galloway-dark-sky', 'loch-garten', 'corgarff-castle'],
    tags: ['stargazing'],
    en: { t: 'Proper darkness returns',
          b: 'Summer never really gets dark enough for stars in Scotland. From October the nights are long and black again, and Galloway is a Dark Sky Park with about 7,000 stars visible.' },
    pl: { t: 'Wraca prawdziwa ciemność',
          b: 'Latem w Szkocji nigdy nie robi się dość ciemno na gwiazdy. Od października noce znów są długie i czarne, a Galloway to Park Ciemnego Nieba z około 7000 widocznych gwiazd.' } },

  { id: 'storms', icon: '🌊', kind: 'weather', months: [11, 12, 1, 2],
    pois: ['neist-point', 'bullers-of-buchan', 'dunnottar', 'thurso-east', 'slains-castle'],
    tags: ['coast', 'surfing'],
    en: { t: 'Storm-watching weather',
          b: 'Atlantic depressions come in one after another and the west and north coasts take the full weight of them. Spectacular from a safe distance — and never from a clifftop or a harbour wall.' },
    pl: { t: 'Pogoda na oglądanie sztormów',
          b: 'Niże atlantyckie nadciągają jeden po drugim, a zachodnie i północne wybrzeże przyjmuje całe ich uderzenie. Widowiskowe z bezpiecznej odległości — i nigdy z krawędzi klifu ani z falochronu.' } },

  { id: 'snow', icon: '❄️', kind: 'sport', months: [1, 2, 3, 12],
    pois: ['cairngorm-ski', 'glencoe-ski', 'corgarff-castle', 'linn-of-dee'],
    tags: ['skiing', 'snowboard', 'mountain'],
    en: { t: 'Snow on the tops',
          b: 'The Scottish season is short, fickle and entirely worth it when it lands — usually best from late January into March. Check the resort report the morning you go, and mind the snow gates.' },
    pl: { t: 'Śnieg na szczytach',
          b: 'Szkocki sezon jest krótki, kapryśny i całkowicie tego wart, gdy się uda — zwykle najlepszy od końca stycznia do marca. Sprawdź raport ośrodka rano w dniu wyjazdu i uważaj na bramy śniegowe.' } },

  { id: 'dolphins', icon: '🐬', kind: 'wildlife', months: [5, 6, 7, 8, 9],
    pois: ['chanonry-point', 'torry-battery', 'fort-george'],
    tags: ['wildlife', 'coast'],
    en: { t: 'Dolphins in the firths',
          b: 'The Moray Firth bottlenose population is at its most visible through the summer, hunting salmon in the narrows. Chanonry Point on a rising tide is the best shore-watching in Britain.' },
    pl: { t: 'Delfiny w zatokach',
          b: 'Populacja butlonosów z Moray Firth jest najlepiej widoczna latem, gdy poluje na łososie w cieśninach. Chanonry Point przy przypływie to najlepsza obserwacja z brzegu w Wielkiej Brytanii.' } },
];

/** Entries whose window includes this month (1–12), wrapping the year. */
export function seasonalFor(month) {
  return SEASONS.filter(s => s.months.includes(month));
}

/** What is on right now. */
export function seasonalNow(date = new Date()) {
  return seasonalFor(date.getMonth() + 1);
}

/** What is about to start, for the "coming soon" line. */
export function seasonalNext(date = new Date()) {
  const m = date.getMonth() + 1;
  const next = (m % 12) + 1;
  const now = new Set(seasonalFor(m).map(s => s.id));
  return seasonalFor(next).filter(s => !now.has(s.id));
}

/** Month name in the active locale, for the heading. */
export function monthName(locale, date = new Date()) {
  return date.toLocaleDateString(locale, { month: 'long' });
}
