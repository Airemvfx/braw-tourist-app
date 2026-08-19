"""Bake real Scottish terrain into SVG paths for js/map-terrain.js.

Sources (all fetched from the open web, see the header written into the
generated file):
  * ESA WorldCover 2021 v200 — 10m land cover, read from the COG overviews
  * AWS Terrain Tiles (terrarium) — SRTM/ETOPO elevation, zoom 8
  * Natural Earth 10m — coastline and river centrelines

Everything is projected into the map's own equirectangular frame (the
BOUNDS/W/H in js/scotland-map.js) so the baked paths line up exactly with
the POI markers, which are projected from real lat/lon at runtime.
"""
import json, math, os, sys, time
from collections import defaultdict
from tiff import Tiff
from raster import read_png, douglas_peucker, ring_area, marching_squares

HERE = os.path.dirname(os.path.abspath(__file__))

# ---- the map frame, mirroring js/scotland-map.js exactly ----
LON0, LON1, LAT0, LAT1 = -7.4, -1.4, 54.5, 58.85
W, H = 560, 730

def project(lon, lat):
    return ((lon - LON0) / (LON1 - LON0) * W, (LAT1 - lat) / (LAT1 - LAT0) * H)

def unproject(x, y):
    return (LON0 + x / W * (LON1 - LON0), LAT1 - y / H * (LAT1 - LAT0))


# ============================================================ elevation

class Dem:
    """Zoom-8 terrarium tiles: elevation = (R*256 + G + B/256) - 32768."""
    Z = 8
    def __init__(self, folder):
        self.tiles = {}
        for name in os.listdir(folder):
            if not name.endswith('.png'):
                continue
            tx, ty = map(int, name[:-4].split('_'))
            buf, w, h = read_png(os.path.join(folder, name))
            self.tiles[(tx, ty)] = buf
        self.n = 2 ** self.Z * 256

    def at(self, lon, lat):
        px = (lon + 180.0) / 360.0 * self.n
        s = math.sin(math.radians(lat))
        py = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * self.n
        tx, ty = int(px) // 256, int(py) // 256
        buf = self.tiles.get((tx, ty))
        if buf is None:
            return -500.0
        ox, oy = int(px) % 256, int(py) % 256
        i = (oy * 256 + ox) * 3
        return (buf[i] * 256 + buf[i + 1] + buf[i + 2] / 256.0) - 32768.0


# =========================================================== land cover

class Cover:
    """ESA WorldCover overview level 4 (~148 m/px) across six 3x3-degree tiles."""
    def __init__(self, folder, level=4):
        self.tiles = []
        for name in sorted(os.listdir(folder)):
            if not name.endswith('.tif'):
                continue
            t = Tiff(os.path.join(folder, name))
            buf, w, h = t.read_level(level)
            lon0, lat0, psx, psy = t.geo(level)
            self.tiles.append((lon0, lat0, psx, psy, w, h, buf))

    def at(self, lon, lat):
        for lon0, lat0, psx, psy, w, h, buf in self.tiles:
            col = int((lon - lon0) / psx)
            row = int((lat0 - lat) / psy)
            if 0 <= col < w and 0 <= row < h:
                v = buf[row * w + col]
                if v:
                    return v
        return 0


def clip_rect(poly, xmin, ymin, xmax, ymax):
    """Sutherland-Hodgman clip of a projected ring against the map frame.

    Clamping coordinates instead (the first thing I tried) drags every
    off-frame vertex onto the same corner and fills the diagonal between
    them, which showed up as a wedge over the Irish Sea.
    """
    def half(pts, inside, isect):
        out = []
        n = len(pts)
        for i in range(n):
            a, b = pts[i], pts[(i + 1) % n]
            ia, ib = inside(a), inside(b)
            if ia:
                out.append(a)
                if not ib:
                    out.append(isect(a, b))
            elif ib:
                out.append(isect(a, b))
        return out

    def cut(p, q, t):
        return (p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t)

    poly = half(poly, lambda p: p[0] >= xmin,
                lambda a, b: cut(a, b, (xmin - a[0]) / (b[0] - a[0])))
    if not poly: return []
    poly = half(poly, lambda p: p[0] <= xmax,
                lambda a, b: cut(a, b, (xmax - a[0]) / (b[0] - a[0])))
    if not poly: return []
    poly = half(poly, lambda p: p[1] >= ymin,
                lambda a, b: cut(a, b, (ymin - a[1]) / (b[1] - a[1])))
    if not poly: return []
    poly = half(poly, lambda p: p[1] <= ymax,
                lambda a, b: cut(a, b, (ymax - a[1]) / (b[1] - a[1])))
    return poly


# ================================================== polygon rasterising

def rasterise(rings, gw, gh, sx, sy):
    """Even-odd scanline fill of projected rings into a gw*gh byte mask."""
    mask = bytearray(gw * gh)
    edges = []
    for ring in rings:
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]
            x2, y2 = ring[(i + 1) % n]
            if y1 != y2:
                edges.append((y1 * sy, x1 * sx, y2 * sy, x2 * sx))
    by_row = defaultdict(list)
    for y1, x1, y2, x2 in edges:
        lo, hi = (y1, y2) if y1 < y2 else (y2, y1)
        r0 = max(0, int(math.ceil(lo - 0.5)))
        r1 = min(gh - 1, int(math.floor(hi - 0.5)))
        for r in range(r0, r1 + 1):
            yc = r + 0.5
            if lo <= yc < hi:
                by_row[r].append(x1 + (x2 - x1) * (yc - y1) / (y2 - y1))
    for r, xs in by_row.items():
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            a = max(0, int(math.ceil(xs[i] - 0.5)))
            b = min(gw - 1, int(math.floor(xs[i + 1] - 0.5)))
            if b >= a:
                base = r * gw
                for c in range(a, b + 1):
                    mask[base + c] = 1
    return mask


# ============================================================== helpers

def blur(field, gw, gh, passes=1):
    for _ in range(passes):
        out = [0.0] * (gw * gh)
        for y in range(gh):
            y0 = (y - 1) * gw if y else 0
            y1 = y * gw
            y2 = (y + 1) * gw if y < gh - 1 else y1
            for x in range(gw):
                xm = x - 1 if x else 0
                xp = x + 1 if x < gw - 1 else x
                out[y1 + x] = (
                    field[y0 + xm] + field[y0 + x] + field[y0 + xp] +
                    field[y1 + xm] + field[y1 + x] + field[y1 + xp] +
                    field[y2 + xm] + field[y2 + x] + field[y2 + xp]) / 9.0
        field = out
    return field


def to_path(rings, dec=1):
    out = []
    for r in rings:
        if len(r) < 3:
            continue
        pts = ['%s,%s' % (round(x, dec), round(y, dec)) for x, y in r]
        out.append('M' + 'L'.join(pts) + 'Z')
    return ''.join(out)


def to_polyline(lines, dec=1):
    out = []
    for r in lines:
        if len(r) < 2:
            continue
        pts = ['%s,%s' % (round(x, dec), round(y, dec)) for x, y in r]
        out.append('M' + 'L'.join(pts))
    return ''.join(out)


def contours_of(field, gw, gh, level, sx, sy, tol, min_area, min_len=0, closed=True):
    """Marching squares in grid space, returned in map space."""
    paths = marching_squares(field, gw, gh, level)
    out = []
    for p in paths:
        p = [(x / sx, y / sy) for x, y in p]
        p = douglas_peucker(p, tol)
        if closed:
            if len(p) < 4:
                continue
            if abs(ring_area(p)) < min_area:
                continue
        else:
            if len(p) < 2:
                continue
            ln = sum(math.dist(p[i], p[i + 1]) for i in range(len(p) - 1))
            if ln < min_len:
                continue
        out.append(p)
    return out


# ================================================================ build

def main():
    t0 = time.time()
    log = lambda *a: print(f'[{time.time()-t0:6.1f}s]', *a, flush=True)

    # ---------------------------------------------- coastline (Natural Earth)
    def rings_from(path, keep=None, tol=0.35, min_area=1.2):
        data = json.load(open(os.path.join(HERE, path)))
        out = []
        for feat in data['features']:
            if keep and not keep(feat['properties']):
                continue
            g = feat['geometry']
            if g is None:
                continue
            polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
            for poly in polys:
                for ring in poly:
                    xs = [q[0] for q in ring]; ys = [q[1] for q in ring]
                    if max(xs) < LON0 - 0.6 or min(xs) > LON1 + 0.6: continue
                    if max(ys) < LAT0 - 0.6 or min(ys) > LAT1 + 0.6: continue
                    pr = clip_rect([project(q[0], q[1]) for q in ring], -2, -2, W + 2, H + 2)
                    if len(pr) < 4:
                        continue
                    sm = douglas_peucker(pr, tol)
                    if len(sm) < 4 or abs(ring_area(sm)) < min_area:
                        continue
                    out.append(sm)
        return out

    log('reading Natural Earth land…')
    land_rings = rings_from('ne_land.geojson')
    log(f'  {len(land_rings)} land rings')
    log('reading the Scotland boundary…')
    scot_rings = rings_from('ne_subunits.geojson',
                            keep=lambda p: p.get('SUBUNIT') == 'Scotland')
    log(f'  {len(scot_rings)} Scotland rings')

    # ---------------------------------------------------------- rasters
    log('loading DEM tiles…')
    dem = Dem(os.path.join(HERE, 'dem'))
    log(f'  {len(dem.tiles)} tiles')
    log('loading WorldCover overviews…')
    cov = Cover(HERE)
    log(f'  {len(cov.tiles)} tiles')

    # ------------------------------------------------ grids in map space
    # Land cover is sampled a little coarser than the map's own pixels:
    # anything finer is invisible once the SVG is drawn on a phone.
    CS = 0.75                      # cover samples per map pixel
    cw, ch = int(W * CS), int(H * CS)
    log(f'sampling land cover on a {cw}x{ch} grid…')
    cover = bytearray(cw * ch)
    for gy in range(ch):
        for gx in range(cw):
            lon, lat = unproject((gx + 0.5) / CS, (gy + 0.5) / CS)
            cover[gy * cw + gx] = cov.at(lon, lat)
    log('  done')

    ES = 0.55                      # elevation samples per map pixel
    ew, eh = int(W * ES), int(H * ES)
    log(f'sampling elevation on a {ew}x{eh} grid…')
    elev = [0.0] * (ew * eh)
    for gy in range(eh):
        for gx in range(ew):
            lon, lat = unproject((gx + 0.5) / ES, (gy + 0.5) / ES)
            elev[gy * ew + gx] = dem.at(lon, lat)
    log('  done')

    # Land masks, rasterised from the same rings that get drawn, so the
    # fills can never spill past the coastline that is on screen.
    # Masked on Scotland rather than on all land: this is a Scotland-only
    # app, so England, Ireland and the Isle of Man are drawn as plain
    # context and carry no land cover or relief of their own.
    log('rasterising the Scotland boundary…')
    land_cover_mask = rasterise(scot_rings, cw, ch, CS, CS)
    land_elev_mask = rasterise(scot_rings, ew, eh, ES, ES)

    # ------------------------------------------------- land cover bands
    # WorldCover puts Scottish heather moor and rough grazing under
    # Grassland (39% of the frame), and finds almost no Shrubland or Bare
    # ground here — measured, see the histogram in the commit message. So
    # grassland is the base fill and only these four are drawn on top;
    # the hills come from real elevation instead of a land-cover guess.
    GROUPS = [
        ('water',  {80}),          # inland lochs, once clipped to the coast
        ('forest', {10}),
        ('farm',   {40}),
        ('built',  {50}),
    ]
    out_cover = {}
    for name, codes in GROUPS:
        field = [1.0 if (cover[i] in codes and land_cover_mask[i]) else 0.0
                 for i in range(cw * ch)]
        field = blur(field, cw, ch, 1)
        rings = contours_of(field, cw, ch, 0.5, CS, CS,
                            tol=0.5, min_area=3.0)
        out_cover[name] = rings
        log(f'  {name:7} {len(rings):5} rings')

    # ------------------------------------------------------ relief
    log('tracing contours…')
    # Sea and anything off the mask sits below every threshold, so the
    # contours close on land and never run along the frame edge.
    ef = [elev[i] if land_elev_mask[i] else -600.0 for i in range(ew * eh)]
    ef = blur(ef, ew, eh, 1)
    # Stacked bands, each a subset of the one below: painted in order they
    # give a hypsometric tint, and stroked they give contour lines.
    out_contours = {}
    for key, level, tol, min_area in (('e200', 200, 0.7, 8.0),
                                      ('e450', 450, 0.7, 6.0),
                                      ('e750', 750, 0.7, 3.0)):
        rings = contours_of(ef, ew, eh, level, ES, ES, tol=tol, min_area=min_area)
        out_contours[key] = rings
        log(f'  {key} {len(rings)} rings')

    # ----------------------------------------------------------- rivers
    log('reading rivers…')
    rivers = json.load(open(os.path.join(HERE, 'ne_rivers.geojson')))
    out_rivers = []
    for feat in rivers['features']:
        g = feat['geometry']
        lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
        for line in lines:
            seg = []
            for lon, lat in line:
                if LON0 - 0.2 <= lon <= LON1 + 0.2 and LAT0 - 0.2 <= lat <= LAT1 + 0.2:
                    seg.append(project(lon, lat))
                elif len(seg) > 1:
                    out_rivers.append(douglas_peucker(seg, 0.5)); seg = []
                else:
                    seg = []
            if len(seg) > 1:
                out_rivers.append(douglas_peucker(seg, 0.5))
    def in_scotland(pt):
        gx, gy = int(pt[0] * CS), int(pt[1] * CS)
        return 0 <= gx < cw and 0 <= gy < ch and land_cover_mask[gy * cw + gx]
    out_rivers = [r for r in out_rivers
                  if sum(math.dist(r[i], r[i + 1]) for i in range(len(r) - 1)) > 6
                  and in_scotland(r[len(r) // 2])]
    log(f'  {len(out_rivers)} river segments')

    # ------------------------------------------------------------ emit
    payload = {
        'land': to_path(land_rings),
        'scotland': to_path(scot_rings),
        'cover': {k: to_path(v) for k, v in out_cover.items()},
        'relief': {k: to_path(v) for k, v in out_contours.items()},
        'rivers': to_polyline(out_rivers),
    }
    js = ['''// ============================================================
// GENERATED — do not edit by hand. See tools/build_terrain.py.
//
// Real Scottish terrain, baked into SVG paths in the map's own
// projection (BOUNDS/W/H in scotland-map.js), so it lines up with the
// POI markers without any runtime reprojection.
//
// Sources:
//   ESA WorldCover 2021 v200 (10 m land cover) — CC BY 4.0
//   AWS Terrain Tiles / SRTM + ETOPO1 elevation — public domain
//   Natural Earth 10 m coastline and rivers — public domain
// ============================================================

export const TERRAIN = {''']
    js.append('  land: %s,' % json.dumps(payload['land']))
    js.append('  scotland: %s,' % json.dumps(payload['scotland']))
    js.append('  cover: {')
    for k in payload['cover']:
        js.append('    %s: %s,' % (k, json.dumps(payload['cover'][k])))
    js.append('  },')
    js.append('  relief: {')
    for k in payload['relief']:
        js.append('    %s: %s,' % (k, json.dumps(payload['relief'][k])))
    js.append('  },')
    js.append('  rivers: %s,' % json.dumps(payload['rivers']))
    js.append('};')
    out = '\n'.join(js) + '\n'
    dest = os.path.join(HERE, 'map-terrain.js')
    open(dest, 'w').write(out)
    log(f'wrote {dest}  {len(out)/1024:.1f} KB')
    import gzip
    log(f'  gzipped ≈ {len(gzip.compress(out.encode()))/1024:.1f} KB')
    for k, v in payload['cover'].items():
        log(f'  cover.{k:7} {len(v)/1024:7.1f} KB')
    for k, v in payload['relief'].items():
        log(f'  {k} {len(v)/1024:7.1f} KB')
    log(f'  land   {len(payload["land"])/1024:7.1f} KB')
    log(f'  scot   {len(payload["scotland"])/1024:7.1f} KB')
    log(f'  rivers {len(payload["rivers"])/1024:7.1f} KB')


if __name__ == '__main__':
    main()
