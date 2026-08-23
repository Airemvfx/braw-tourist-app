# Browser checks

```
./tests/run.sh          # all suites
./tests/run.sh ferry    # one suite
```

Needs Python (for the static server, started automatically if nothing is
already on :8099) and the Chromium that ships with Playwright. The path to
that binary is currently hard-coded at the top of each file; change it if
your Playwright install differs.

| suite | what it holds the app to |
| --- | --- |
| `prompts` | a named interest is a filter — "whisky" returns five distilleries and nothing else |
| `build` | the journey builder: filters, search, reordering, day stepper, save, both languages, wide layout |
| `ferry` | a route across water says so, names the crossing, and costs the boat |
| `export` | GPX and GeoJSON parse; a backup round-trips; a junk file fails without changing anything |
| `geo` | live location: the consent gate, a refused permission, the moving dot, a geofence check-in, and that switching off releases the watch |
| `library` | the lore library: unlock rules, filters, both languages, and an Easter egg firing |
| `safety` | the safety screen is complete, emergency info comes first, and both languages are filled in |
| `scope` | trips scoped to a city or region, place names on the map, and the seasonal strip in both languages |
| `photos` | the photo store: a v1 database upgrades without losing anything, two visits to one place are two photographs, print grading is right, and saving strips EXIF and GPS |
| `cloud` | the hand-written Supabase client against a stand-in server: sign-in, one refresh for six parallel requests, conflict detection, upload, server-side pricing, and refusing a `service_role` key |
| `shop` | the Store: catalogue, calendar builder, print warnings, ordering without an account, both languages |
| `i18n-parity` | every string exists in both languages with matching placeholders, and every key the app asks for exists at all |
| `terrain` | the map sprite mounts once, redraws stay cheap, no console errors |
| `contrast` | every piece of text measured against its real composited background, both themes |
| `sweep` | every view renders in both themes with no page errors |
| `nav` | all navigation tabs stay reachable at 320 px |

`contrast` composites translucent layers before measuring. An earlier
version read a 4.5%-alpha wash as solid black and reported confident
nonsense, so if you change it, keep the compositing.

`i18n-parity` needs no browser and no server — it parses the source. The
rest do.

## The database

```
./supabase/check.sh
```

Separate from the above, and needing a local PostgreSQL rather than a
browser. It builds a throwaway cluster, applies `supabase/schema.sql`,
then attacks it as two ordinary users — reading each other's rows,
inserting an order by hand, discounting a total, marking an order paid,
overwriting a newer profile. All of those must fail.

Run it after any change to the schema. The browser holds a public key,
so row-level security and column privileges are the entire access model;
they are easy to loosen by accident and the loosening is silent.
