# Terrain builder

Regenerates `js/map-terrain.js` — the real Scottish terrain the maps draw.
Run it only when the map frame or the layer choices change; the output is
committed, so the site itself never touches these scripts.

```
python3 build_terrain.py        # writes map-terrain.js beside itself
```

Pure standard library. The sandbox this was written in had neither
`rasterio` nor `numpy` nor `PIL`, so `tiff.py` reads the GeoTIFF overviews
and `raster.py` decodes the PNGs, blurs, traces contours and simplifies.

## Inputs

Download these next to the scripts first (about 150 MB, none of it shipped):

| file | source |
| --- | --- |
| `*.tif` — 6 tiles `N54/N57` × `W009/W006/W003` | `https://esa-worldcover.s3.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_{TILE}_Map.tif` |
| `dem/{x}_{y}.png` — zoom 8, x 121–128, y 74–82 | `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/8/{x}/{y}.png` |
| `ne_land.geojson`, `ne_rivers.geojson`, `ne_subunits.geojson` | `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_{land,rivers_lake_centerlines,admin_0_map_subunits}.geojson` |

## What it does

1. Projects everything into the map's own frame — the `BOUNDS`/`W`/`H` in
   `js/scotland-map.js`. Change those and you must change `LON0…H` here to
   match, or the baked terrain will drift away from the POI markers.
2. Coastline from Natural Earth, clipped to the frame (Sutherland–Hodgman).
   The Scotland subunit is kept separately: it masks the detail layers, so
   England, Ireland and Man are drawn as plain context.
3. Land cover from the WorldCover overviews (~148 m/px), one traced layer
   per class. WorldCover files Scottish heather moor under *Grassland*
   (39% of the frame) and finds almost no Shrubland or Bare ground, so
   grassland is the base fill and only forest, cropland, water and
   built-up are drawn on top.
4. Elevation from the terrarium tiles, contoured at 200/450/750 m. Painted
   in order they give a hypsometric tint; stroked they give contour lines.
   This is what carries "hills", rather than a land-cover guess.

## Licences

* ESA WorldCover 2021 v200 — **CC BY 4.0, attribution required**. It is in
  the app footer (`foot.data`); do not drop it.
* AWS Terrain Tiles (SRTM/ETOPO1) — public domain.
* Natural Earth — public domain.

---

# Travel matrix (`build_routes.py`)

Regenerates `js/road-graph.js` — how far and how long between every pair
of locations, and which pairs need a boat.

```
python3 build_routes.py
```

Uses the same downloads as the terrain build, plus nothing else. Run it
after adding, moving or removing a location, or the new one falls back to
a straight-line guess.

## How it works, and how wrong it is

A cost surface over the real land mask and real elevation, searched with
Dijkstra on ~1.2 km cells. Ferries are explicit graph edges; the Skye
Bridge and Queensferry Crossing are patched in because the strait at Kyle
of Lochalsh is about 500 m wide, narrower than one cell, and without them
the search sends everyone to Skye by ferry.

Measured against known journeys: **median error 11% on distance, 17% on
time**. That is good enough to plan around and not good enough to
navigate by, which is why the app also exports GPX.

Two known weaknesses, both from the same root — terrain cannot tell a
glen with an A-road from a glen with a footpath:

* Legs between Glencoe and the Fort William area come out short. The
  search finds the Lairig Mòr, which carries the West Highland Way and no
  tarmac.
* A gradient penalty fixes that and was tried. It is not in the build,
  because a ferry pays no gradient cost, so boats started winning routes
  they should lose: spurious crossings went from 290 pairs to 714. A
  false "you need a ferry" is the exact error this file exists to remove.

Real road data (an OSM extract through OSRM or Valhalla) is the fix for
both. This gets the dangerous cases right without a routing server.

---

# Adding locations (`newpois.py` + `add_pois.py` + `verify.py`)

Locations are written **once**, with both languages together, in
`newpois.py`. Nothing is edited by hand in two places.

```
python3 verify.py     # check before touching anything
python3 add_pois.py   # split into data.js and i18n-content.js
python3 build_routes.py   # then rebuild the travel matrix
```

`verify.py` is the important one and should always be run first. It
checks every entry against:

* the real Natural Earth land mask — a location more than 2 km from land
  is a typo, not a location
* its own name — anything called "Aberdeen …" that is not within 25 km of
  Aberdeen is flagged. This caught a latitude typed as 55.15 instead of
  57.15, which put Aberdeen Beach 222 km away in the Borders
* duplicate ids, unknown region names, and missing Polish text

Region names must match ones already in the dataset, or the new region
gets no passport icon and no stamp.

**After adding locations, rebuild the travel matrix.** Until you do, any
new location falls back to a straight-line guess and will not know about
ferries.
