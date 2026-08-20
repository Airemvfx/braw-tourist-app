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
| `terrain` | the map sprite mounts once, redraws stay cheap, no console errors |
| `contrast` | every piece of text measured against its real composited background, both themes |
| `sweep` | every view renders in both themes with no page errors |
| `nav` | all navigation tabs stay reachable at 320 px |

`contrast` composites translucent layers before measuring. An earlier
version read a 4.5%-alpha wash as solid black and reported confident
nonsense, so if you change it, keep the compositing.
