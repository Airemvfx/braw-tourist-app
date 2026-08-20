"""Bake a terrain-constrained travel matrix into js/road-graph.js.

The app used to estimate every leg as straight-line distance x 1.3 at a
flat 60 km/h. That is fine across the central belt and badly wrong in the
two places it matters most:

  * across water — it happily "drove" people to Mull and Arran
  * across mountains — Glencoe to Ben Nevis came out at 12 mi / 20 min
    because the straight line goes over the Mamores; the road goes round

This is not a road network. It is a cost surface over the real land mask
and the real elevation, searched with Dijkstra, plus explicit ferry
edges for the crossings that actually exist. It cannot know about a
closed B-road, but it knows you cannot drive to Staffa, and it knows the
route to Ben Nevis follows the glen.

Inputs are the same downloads tools/build_terrain.py uses — see its
README. Run after any change to the POI list:

    python3 build_routes.py
"""
import heapq, json, math, os, re, time
from build_terrain import Dem, Cover, clip_rect, project, rasterise, LON0, LON1, LAT0, LAT1
from raster import douglas_peucker, ring_area

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

# Grid cells of roughly 1.2 km square at Scottish latitudes.
DLAT = 0.011
DLON = 0.020
PAD = 0.35                      # a little room outside the map frame

G_LAT0, G_LAT1 = LAT0 - PAD, LAT1 + PAD
G_LON0, G_LON1 = LON0 - PAD, LON1 + PAD
ROWS = int((G_LAT1 - G_LAT0) / DLAT)
COLS = int((G_LON1 - G_LON0) / DLON)

KM_PER_DEG_LAT = 111.0


def cell_of(lon, lat):
    return (int((G_LAT1 - lat) / DLAT), int((lon - G_LON0) / DLON))


def centre_of(r, c):
    return (G_LON0 + (c + 0.5) * DLON, G_LAT1 - (r + 0.5) * DLAT)


def km_between(r1, c1, r2, c2):
    lon1, lat1 = centre_of(r1, c1)
    lon2, lat2 = centre_of(r2, c2)
    dLat = (lat1 - lat2) * KM_PER_DEG_LAT
    dLon = (lon1 - lon2) * KM_PER_DEG_LAT * math.cos(math.radians((lat1 + lat2) / 2))
    return math.hypot(dLat, dLon)


# A grid path is straighter than tarmac; calibrated against known legs
# (Edinburgh-Stirling, Glasgow-Loch Lomond, Oban-Kilchurn, Dundee-St Andrews).
KM_FACTOR = 1.18

# Town driving is not rural driving. WorldCover's built-up class marks
# the cells; without this a hop across Edinburgh came out at three
# minutes, which would let a one-day city itinerary schedule about twice
# what anybody could actually do.
URBAN_KMH = 22.0

# Every arrival costs something before the visit starts: finding a space,
# paying, walking in, getting everyone out of the car. A leg is never
# quicker than this however short it looks on the map.
MIN_LEG_MIN = 8


def speed_kmh(elev):
    """Road speed by height. Scotland's roads live in the glens: above
    about 500 m there is essentially no public road, so the search treats
    high ground as a wall and goes looking for the pass instead.

    Base speed is a door-to-door average including towns, junctions and
    single-track, not a limit — calibrated against real legs rather than
    assumed."""
    if elev < 400:
        return 68.0 - elev * 0.05
    if elev < 500:
        return 48.0 - (elev - 400) * 0.16
    return 4.0


# ------------------------------------------------------------------
# Ferries. Times are the scheduled crossing plus a modest allowance for
# loading; the booking flag is what the itinerary surfaces to the user.
# ------------------------------------------------------------------
# Fixed crossings the grid is too coarse to resolve. The Skye Bridge
# strait is about 500 m wide — narrower than one cell — so without this
# the search sends everyone to Skye on the Mallaig ferry.
BRIDGES = [
    {'id': 'skye',       'a': (-5.7150, 57.2800), 'b': (-5.7400, 57.2740),
     'min': 3, 'name': 'Skye Bridge'},
    {'id': 'queensferry','a': (-3.4000, 55.9900), 'b': (-3.3900, 56.0130),
     'min': 6, 'name': 'Queensferry Crossing'},
]

FERRIES = [
    {'id': 'arran',   'a': (-4.8222, 55.6404), 'b': (-5.1393, 55.5769),
     'min': 70,  'book': True,  'name': 'Ardrossan – Brodick'},
    {'id': 'mull',    'a': (-5.4740, 56.4125), 'b': (-5.7080, 56.4700),
     'min': 60,  'book': True,  'name': 'Oban – Craignure'},
    {'id': 'staffa',  'a': (-6.3690, 56.3260), 'b': (-6.3417, 56.4318),
     'min': 120, 'book': True,  'name': 'Fionnphort – Staffa (boat trip)'},
    {'id': 'mallaig', 'a': (-5.8280, 57.0060), 'b': (-5.8940, 57.0640),
     'min': 45,  'book': True,  'name': 'Mallaig – Armadale'},
]


def main():
    t0 = time.time()
    log = lambda *a: print(f'[{time.time()-t0:6.1f}s]', *a, flush=True)
    log(f'grid {ROWS} x {COLS} = {ROWS*COLS:,} cells at ~1.2 km')

    # ---- nodes: every POI plus every start city -------------------
    src = open(os.path.join(ROOT, 'js', 'data.js'), encoding='utf-8').read()
    pois = [(m.group(1), float(m.group(3)), float(m.group(2)))
            for m in re.finditer(r"id: '([^']+)'.*?lat: (-?[\d.]+), lon: (-?[\d.]+)", src)]
    cities = [(m.group(1), float(m.group(3)), float(m.group(2))) for m in
              re.finditer(r"^  '?([a-z ]+)'?: \{ name: '[^']+', lat: (-?[\d.]+), lon: (-?[\d.]+)",
                          src, re.M)]
    nodes = [('poi:' + i, lon, lat) for i, lon, lat in pois] + \
            [('city:' + i.strip(), lon, lat) for i, lon, lat in cities]
    log(f'{len(pois)} locations + {len(cities)} start cities = {len(nodes)} nodes')

    # ---- passable land ---------------------------------------------
    log('rasterising land…')
    land_json = json.load(open(os.path.join(HERE, 'ne_land.geojson')))
    rings = []
    for feat in land_json['features']:
        g = feat['geometry']
        polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
        for poly in polys:
            for ring in poly:
                xs = [q[0] for q in ring]; ys = [q[1] for q in ring]
                if max(xs) < G_LON0 or min(xs) > G_LON1: continue
                if max(ys) < G_LAT0 or min(ys) > G_LAT1: continue
                # rasterise() works in grid units, so map lon/lat onto them
                pr = [(((q[0] - G_LON0) / DLON), ((G_LAT1 - q[1]) / DLAT)) for q in ring]
                pr = clip_rect(pr, -2, -2, COLS + 2, ROWS + 2)
                if len(pr) >= 4 and abs(ring_area(pr)) >= 0.5:
                    rings.append(pr)
    land = rasterise(rings, COLS, ROWS, 1.0, 1.0)
    log(f'  {sum(land):,} land cells ({100*sum(land)/(ROWS*COLS):.0f}%)')

    # ---- elevation, taken as the valley floor of each cell ---------
    log('sampling elevation (min over each cell, so glens read as glens)…')
    dem = Dem(os.path.join(HERE, 'dem'))
    cost = [0.0] * (ROWS * COLS)      # minutes to cross one cell-width
    for r in range(ROWS):
        for c in range(COLS):
            i = r * COLS + c
            if not land[i]:
                continue
            lon, lat = centre_of(r, c)
            samples = sorted(dem.at(lon + dx, lat + dy)
                             for dx in (-DLON / 3, 0, DLON / 3)
                             for dy in (-DLAT / 3, 0, DLAT / 3))
            # 2nd lowest, not the lowest: a genuine glen still reads as a
            # glen, but a single low pixel no longer drives a road over
            # the Mamores.
            cost[i] = max(0.0, samples[1])
    log('  done')

    log('marking built-up cells…')
    cov = Cover(HERE)
    urban = bytearray(ROWS * COLS)
    for r in range(ROWS):
        for c in range(COLS):
            i = r * COLS + c
            if not land[i]:
                continue
            lon, lat = centre_of(r, c)
            if cov.at(lon, lat) == 50:        # WorldCover: built-up
                urban[i] = 1
    log(f'  {sum(urban):,} built-up cells')

    # ---- graph search ----------------------------------------------
    NB = [(-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1)]

    def snap(lon, lat, drivable=True):
        """Where you actually park.

        Ben Nevis is a summit; the drive ends in Glen Nevis and the walk
        is already counted in the location's own dwell time. Snapping a
        summit to its own cell asks the router to drive up a mountain,
        which is both wrong and the reason Glencoe to Ben Nevis came out
        at a third of its real road distance. So nodes prefer the nearest
        low, road-plausible ground, widening the search until they find
        some; coastal locations fall back to nearest land."""
        r0, c0 = cell_of(lon, lat)
        best, bd = None, 1e9
        limit = 300.0 if drivable else 1e9
        for radius in (3, 6, 10, 14):
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    r, c = r0 + dr, c0 + dc
                    if not (0 <= r < ROWS and 0 <= c < COLS): continue
                    i = r * COLS + c
                    if not land[i] or cost[i] > limit: continue
                    d = dr * dr + dc * dc
                    if d < bd: bd, best = d, (r, c)
            if best is not None:
                return best
        # nothing low enough nearby: take the nearest land at any height
        for dr in range(-8, 9):
            for dc in range(-8, 9):
                r, c = r0 + dr, c0 + dc
                if 0 <= r < ROWS and 0 <= c < COLS and land[r * COLS + c]:
                    d = dr * dr + dc * dc
                    if d < bd: bd, best = d, (r, c)
        return best

    snapped = {}
    for name, lon, lat in nodes:
        s = snap(lon, lat)
        if s is None:
            raise SystemExit(f'no land cell near {name}')
        snapped[name] = s
    log('nodes snapped to land')

    # ferry edges, as extra links between two snapped port cells
    ferry_links = {}
    for f in BRIDGES:
        a, b = snap(*f['a'], False), snap(*f['b'], False)
        if not a or not b:
            log(f"  bridge {f['id']}: could not snap, skipped"); continue
        ia, ib = a[0] * COLS + a[1], b[0] * COLS + b[1]
        # empty id: a bridge is just road, nothing for the user to book
        ferry_links.setdefault(ia, []).append((ib, f['min'], ''))
        ferry_links.setdefault(ib, []).append((ia, f['min'], ''))
    log(f'{len(BRIDGES)} fixed crossings patched in')

    for f in FERRIES:
        a, b = snap(*f['a'], False), snap(*f['b'], False)
        if not a or not b:
            log(f"  ferry {f['id']}: could not snap, skipped"); continue
        ia, ib = a[0] * COLS + a[1], b[0] * COLS + b[1]
        ferry_links.setdefault(ia, []).append((ib, f['min'], f['id']))
        ferry_links.setdefault(ib, []).append((ia, f['min'], f['id']))
    log(f'{len(FERRIES)} ferry crossings wired in')

    # precompute per-cell traversal minutes for the 8 directions
    def edge_minutes(i, j):
        e = (cost[i] + cost[j]) / 2
        v = URBAN_KMH if (urban[i] and urban[j]) else speed_kmh(e)
        ri, ci = divmod(i, COLS)
        rj, cj = divmod(j, COLS)
        km = km_between(ri, ci, rj, cj) * KM_FACTOR
        # A gradient penalty was tried here and removed. It did tighten the
        # Mamores legs, but because a ferry pays no gradient cost it also
        # made boats look cheap: spurious "you need a crossing" verdicts
        # went from 290 pairs to 714. A false ferry warning is the exact
        # error this whole file exists to remove, so height alone it is.
        return km / v * 60.0, km

    order = [n[0] for n in nodes]
    index = {n: k for k, n in enumerate(order)}
    N = len(order)
    mins = [[0] * N for _ in range(N)]
    kms = [[0] * N for _ in range(N)]
    ferry = [[''] * N for _ in range(N)]

    targets = {snapped[n]: n for n in order}

    log('running Dijkstra from every node…')
    for si, name in enumerate(order):
        start = snapped[name]
        s = start[0] * COLS + start[1]
        dist = [1e18] * (ROWS * COLS)
        dkm = [0.0] * (ROWS * COLS)
        dfr = [''] * (ROWS * COLS)
        dist[s] = 0.0
        pq = [(0.0, s)]
        want = set(snapped[n] for n in order)
        found = 0
        while pq:
            d, i = heapq.heappop(pq)
            if d > dist[i] + 1e-9:
                continue
            ri, ci = divmod(i, COLS)
            if (ri, ci) in want:
                want.discard((ri, ci)); found += 1
                if found >= len(order):
                    break
            for dr, dc in NB:
                r2, c2 = ri + dr, ci + dc
                if not (0 <= r2 < ROWS and 0 <= c2 < COLS):
                    continue
                j = r2 * COLS + c2
                if not land[j]:
                    continue
                m, k = edge_minutes(i, j)
                nd = d + m
                if nd < dist[j]:
                    dist[j] = nd; dkm[j] = dkm[i] + k; dfr[j] = dfr[i]
                    heapq.heappush(pq, (nd, j))
            for j, fmin, fid in ferry_links.get(i, ()):
                nd = d + fmin
                if nd < dist[j]:
                    dist[j] = nd; dkm[j] = dkm[i] + (2 if not fid else 0)
                    dfr[j] = (dfr[i] + ',' + fid).strip(',') if fid else dfr[i]
                    heapq.heappush(pq, (nd, j))
        for n2 in order:
            r, c = snapped[n2]
            j = r * COLS + c
            ti = index[n2]
            if dist[j] < 1e17:
                mins[si][ti] = max(MIN_LEG_MIN, round(dist[j])) if si != ti else 0
                kms[si][ti] = round(dkm[j])
                ferry[si][ti] = dfr[j]
            else:
                mins[si][ti] = -1
        if si % 20 == 0:
            log(f'  {si}/{N}')
    log('search complete')

    # symmetrise (the surface is undirected; rounding can differ by a minute)
    for i in range(N):
        for j in range(i + 1, N):
            m = min(mins[i][j], mins[j][i]) if mins[i][j] > 0 and mins[j][i] > 0 else max(mins[i][j], mins[j][i])
            k = min(kms[i][j], kms[j][i]) if kms[i][j] and kms[j][i] else max(kms[i][j], kms[j][i])
            f = ferry[i][j] or ferry[j][i]
            mins[i][j] = mins[j][i] = m
            kms[i][j] = kms[j][i] = k
            ferry[i][j] = ferry[j][i] = f

    # ---- emit -------------------------------------------------------
    tri_m, tri_k, fr = [], [], {}
    for i in range(N):
        for j in range(i + 1, N):
            tri_m.append(mins[i][j])
            tri_k.append(kms[i][j])
            if ferry[i][j]:
                fr[f'{i},{j}'] = ferry[i][j]

    meta = {f['id']: {'min': f['min'], 'book': f['book'], 'name': f['name']} for f in FERRIES}
    out = f'''// ============================================================
// GENERATED — do not edit by hand. See tools/build_routes.py.
//
// Travel between every pair of locations, searched over the real land
// mask and real elevation rather than measured straight through hills
// and open water. Ferry crossings are explicit edges, so a leg that
// needs a boat says so instead of pretending to be a drive.
//
// Not a road network: it cannot know about a closed B-road or a 20 mph
// limit. It does know you cannot drive to Staffa.
// ============================================================

export const NODES = {json.dumps(order)};

// Upper-triangle matrices, row-major: pair (i<j) sits at
// i*N - i*(i+1)/2 + (j-i-1).
export const MINUTES = {json.dumps(tri_m)};
export const KM = {json.dumps(tri_k)};

// Only the pairs whose quickest route uses one, keyed "i,j".
export const FERRY_PAIRS = {json.dumps(fr)};
export const FERRIES = {json.dumps(meta, indent=2)};
'''
    dest = os.path.join(ROOT, 'js', 'road-graph.js')
    open(dest, 'w').write(out)
    import gzip
    log(f'wrote {dest}  {len(out)/1024:.1f} KB ({len(gzip.compress(out.encode()))/1024:.1f} KB gzipped)')
    log(f'  {len(tri_m):,} pairs, {len(fr)} of them needing a boat')


if __name__ == '__main__':
    main()
