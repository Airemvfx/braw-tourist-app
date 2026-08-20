import json, math, os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'geo'))
sys.path.insert(0, HERE)
from build_terrain import clip_rect, rasterise
from raster import ring_area
from newpois import NEW

# --- land mask at ~1 km, from the same Natural Earth data the map uses ---
LON0, LON1, LAT0, LAT1 = -7.6, -1.2, 54.4, 59.0
DLAT, DLON = 0.009, 0.016
ROWS = int((LAT1-LAT0)/DLAT); COLS = int((LON1-LON0)/DLON)
land_json = json.load(open(os.path.join(HERE,'geo','ne_land.geojson')))
rings=[]
for feat in land_json['features']:
    g=feat['geometry']
    polys = g['coordinates'] if g['type']=='MultiPolygon' else [g['coordinates']]
    for poly in polys:
        for ring in poly:
            xs=[q[0] for q in ring]; ys=[q[1] for q in ring]
            if max(xs)<LON0 or min(xs)>LON1 or max(ys)<LAT0 or min(ys)>LAT1: continue
            pr=[(((q[0]-LON0)/DLON),((LAT1-q[1])/DLAT)) for q in ring]
            pr=clip_rect(pr,-2,-2,COLS+2,ROWS+2)
            if len(pr)>=4 and abs(ring_area(pr))>=0.5: rings.append(pr)
mask = rasterise(rings, COLS, ROWS, 1.0, 1.0)

def near_land(lat, lon, r=2):
    r0=int((LAT1-lat)/DLAT); c0=int((lon-LON0)/DLON)
    for dr in range(-r,r+1):
        for dc in range(-r,r+1):
            rr,cc=r0+dr,c0+dc
            if 0<=rr<ROWS and 0<=cc<COLS and mask[rr*COLS+cc]: return True
    return False

# --- anchors to sanity-check city attributions ---
CITY = {'Edinburgh':(55.953,-3.188),'Glasgow':(55.864,-4.252),'Aberdeen':(57.150,-2.094),
        'Inverness':(57.478,-4.225),'Dundee':(56.462,-2.971),'Stirling':(56.117,-3.937),
        'Perth':(56.396,-3.437)}
def km(a,b):
    dLat=(a[0]-b[0])*111
    dLon=(a[1]-b[1])*111*math.cos(math.radians((a[0]+b[0])/2))
    return math.hypot(dLat,dLon)

src=open('/home/user/braw-tourist-app/js/data.js',encoding='utf-8').read()
poi_block = src[src.index('export const POIS'):src.index('export const START_CITIES')]
existing_ids=set(re.findall(r"id: '([^']+)'", poi_block))
existing_regions=set(re.findall(r"region: '([^']+)'", src))

problems=[]; seen=set()
for p in NEW:
    tag=[]
    if p['id'] in existing_ids: tag.append('DUPLICATE of an existing id')
    if p['id'] in seen: tag.append('DUPLICATE within the new set')
    seen.add(p['id'])
    if p['region'] not in existing_regions: tag.append(f"UNKNOWN region {p['region']!r}")
    if not (LAT0 < p['lat'] < LAT1): tag.append(f"lat {p['lat']} OUT OF SCOTLAND")
    if not (LON0 < p['lon'] < LON1): tag.append(f"lon {p['lon']} out of frame")
    elif not near_land(p['lat'], p['lon']): tag.append('IN THE SEA (>2 km from land)')
    # city sanity
    for cname,(clat,clon) in CITY.items():
        if cname.lower() in (p['name']+p['id']).lower():
            d=km((p['lat'],p['lon']),(clat,clon))
            if d>25: tag.append(f'named for {cname} but {d:.0f} km away')
    for k in ('pl_name','pl_blurb','blurb','icon','time'):
        if not p.get(k): tag.append(f'missing {k}')
    if tag: problems.append((p['id'], p['lat'], p['lon'], '; '.join(tag)))

print(f'checked {len(NEW)} new locations')
print(f'existing ids: {len(existing_ids)}  ->  total would be {len(existing_ids)+len(NEW)}')
print()
if problems:
    print('PROBLEMS:')
    for i,la,lo,t in problems: print(f'  {i:24} {la:8.4f},{lo:8.4f}  {t}')
else:
    print('no problems found')
