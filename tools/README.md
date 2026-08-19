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
