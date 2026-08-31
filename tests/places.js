// The place seam, and the invariant that keeps this app out of the
// "listings or directory service" that Google's terms §3.2.3(d)(iii)
// forbids.
//
// The rule is: Google is the search box, curated places are the
// collection. A Google-sourced place may appear in transient results
// somebody is choosing from, or as a stop in their own itinerary. Never
// in a browsable, filterable list — a screen of Google places with
// names, types and pins IS a directory.
//
// The practical, checkable form: anything that BROWSES reads POIS or
// POI_BY_ID from data.js directly, and anything that DISPLAYS a place
// somebody already chose reads getPlace(). Keeping those importing
// different things is what makes the rule a test rather than a memory.
//
// No browser and no server — this parses the source, like i18n-parity.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');

let fails = 0;
const ok = (cond, msg) => { console.log(`  ${cond ? '✓' : '✗'} ${msg}`); if (!cond) fails++; };

// Modules that decide WHICH places exist. They must never be able to
// see a Google place, so they read the dataset directly.
const BROWSE = ['js/planner.js', 'js/minigame.js', 'js/gamification.js'];

// Modules that draw a place the user already has. These go through the
// seam, so a Google stop resolves the same way a curated one does.
const DISPLAY = ['js/app.js', 'js/map-viewer.js', 'js/exporter.js',
                 'js/builder.js', 'js/showcase.js'];

(async () => {
  console.log('-- the invariant --');

  for (const f of BROWSE) {
    const src = read(f);
    ok(!/from '\.\/places\.js'/.test(src),
      `${f} does not import the seam, so it cannot see a Google place`);
  }

  for (const f of DISPLAY) {
    const src = read(f);
    ok(!/\bPOI_BY_ID\b/.test(src), `${f} no longer reaches past the seam`);
    ok(/getPlace/.test(src), `${f} resolves places through getPlace`);
  }

  // data.js and places.js are the two that legitimately hold both.
  const seam = read('js/places.js');
  ok(/POI_BY_ID/.test(seam), 'the seam itself reads the dataset, as it must');

  console.log('\n-- ids --');
  const places = await import('../js/places.js');
  const { getPlace, isCurated, parsePlaceId, googleId } = places;

  ok(isCurated('glencoe') === true, 'a bare id is one of ours');
  ok(isCurated('g:ChIJabc') === false, 'a g: prefix marks a borrowed one');
  ok(isCurated(null) === true, 'a missing id is treated as ours, not as Google');

  const gid = googleId('ChIJN1t_tDeuEmsRUsoyG83frY4');
  ok(gid === 'g:ChIJN1t_tDeuEmsRUsoyG83frY4', 'googleId prefixes');
  ok(parsePlaceId(gid).source === 'g' && parsePlaceId(gid).key === 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    'and parsePlaceId takes it apart again');
  ok(parsePlaceId('glencoe').source === 'braw', 'a bare id parses as ours');

  console.log('\n-- resolving --');
  const glencoe = getPlace('glencoe');
  ok(glencoe && glencoe.name === 'Glencoe', `a curated id resolves (${glencoe && glencoe.name})`);
  ok(glencoe.blurb && glencoe.xp > 0, 'with the blurb and XP that make it ours');
  ok(getPlace('not-a-place') === null, 'an unknown curated id is null, not undefined');
  ok(getPlace(null) === null, 'and so is nothing at all');

  // The important one: a Google id resolves to nothing until something
  // has fetched it in this page view. That is the honest offline state,
  // not a bug — the name was never ours to store.
  ok(getPlace('g:ChIJunknown') === null,
    'an unfetched Google id resolves to null, so callers must handle it');

  places.remember('g:ChIJabc', { id: 'g:ChIJabc', name: 'Somewhere', lat: 1, lon: 2 });
  ok(getPlace('g:ChIJabc').name === 'Somewhere', 'a remembered one resolves for this page view');
  ok(places.liveCount() === 1, 'and the buffer holds exactly it');
  places.remember('glencoe', { name: 'nope' });
  ok(places.liveCount() === 1 && getPlace('glencoe').name === 'Glencoe',
    'a curated id cannot be shadowed by the buffer');
  places.forgetAll();
  ok(places.liveCount() === 0 && getPlace('g:ChIJabc') === null,
    'clearing the buffer forgets it — nothing borrowed outlives the page view');

  console.log(fails ? `\nplaces: ${fails} FAILED` : '\nplaces: all good');
  process.exit(fails ? 1 : 0);
})();
