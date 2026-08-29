#!/usr/bin/env python3
"""
Fill the destination-image library from Wikimedia Commons.

Why Commons and not a stock API: it is the only source that is at once
place-accurate, permanently storable and usable in a commercial product.
Unsplash requires you to hotlink their CDN and forbids self-hosting;
stock photography gives you a beautiful generic beach rather than the
specific glen an itinerary names; and Google Places photographs may not
be stored at all.

The price of that is attribution. Commons licences vary per file — CC0,
public domain, CC BY, CC BY-SA all sit side by side — and every one of
the latter two requires credit. So this tool treats the credit record as
the point of the exercise, not a footnote: an image whose author and
licence cannot both be established is skipped rather than guessed at.

    python3 tools/fetch_commons.py --list          # what is missing
    python3 tools/fetch_commons.py --fetch         # download + write manifest
    python3 tools/fetch_commons.py --fetch --id glencoe
    python3 tools/fetch_commons.py --resize        # needs Pillow

Pure standard library for everything that matters. --resize is the one
step that wants Pillow, and it is separate precisely so that a machine
without it can still do the licensing work.

NOTE: commons.wikimedia.org is unreachable from the development sandbox
(blocked by the network proxy), so this is written to be run on your own
machine. Commit what it produces.
"""

import argparse, html, json, os, re, sys, time, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'js', 'data.js')
OUTDIR = os.path.join(ROOT, 'images', 'locations')
MANIFEST = os.path.join(ROOT, 'images', 'locations.json')

API = 'https://commons.wikimedia.org/w/api.php'
UA = 'BRAW-image-tool/1.0 (https://github.com/Airemvfx/braw-tourist-app)'
WIDTHS = [400, 800, 1600]

# Licences we may ship. Anything NonCommercial or NoDerivatives is out —
# this is a commercial product — and so is anything we cannot identify.
ALLOWED = re.compile(r'^(cc0|cc[ -]by(?:[ -]sa)?(?:[ -][0-9.]+)?|public domain|pd(?:-|$))', re.I)
FORBIDDEN = re.compile(r'\b(nc|nd|noncommercial|noderiv|fair use|non-free)\b', re.I)


def get(url, params=None, binary=False, tries=3):
    if params:
        url = url + '?' + urllib.parse.urlencode(params)
    for n in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=45) as r:
                raw = r.read()
            return raw if binary else json.loads(raw)
        except Exception as e:
            if n == tries - 1:
                print(f'    ! {type(e).__name__}: {e}', file=sys.stderr)
                return None
            time.sleep(2 ** n)


# A JS string literal in either quote style, escapes included. data.js uses
# both — "Grey Mare's Tail" alongside 'Ben A\'an' — so a parser that assumes
# one of them silently drops locations, which is the kind of bug that shows up
# as "why does that place never have a picture?" months later.
STR = r"""(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")"""


def _field(obj, key):
    m = re.search(key + r'\s*:\s*' + STR, obj)
    if not m:
        return None
    raw = m.group(1) if m.group(1) is not None else m.group(2)
    return re.sub(r'\\(.)', r'\1', raw)


def pois():
    """
    Every location in the POIS array, by id, name and region.

    Scoped to that array on purpose: data.js also holds START_CITIES and
    TRIP_CENTRES, which have ids and coordinates but are not places you
    visit and must not end up in the picture library.
    """
    src = open(DATA, encoding='utf-8').read()
    start = src.index('export const POIS = [')
    end = src.index('\n];', start)
    body = src[start:end]
    out = []
    for m in re.finditer(r'\{[^{}]*\}', body):
        obj = m.group(0)
        pid, name, region = _field(obj, 'id'), _field(obj, 'name'), _field(obj, 'region')
        if pid and name and region:
            out.append({'id': pid, 'name': name, 'region': region})
    return out


def strip_html(s):
    s = re.sub(r'<[^>]+>', ' ', s or '')
    return re.sub(r'\s+', ' ', html.unescape(s)).strip()


def credit_of(info):
    """
    Build a credit record, or return None if it cannot be built honestly.

    Missing author or unidentifiable licence means we do not use the file.
    A wrong credit is worse than no picture.
    """
    meta = info.get('extmetadata') or {}
    def field(k):
        return strip_html((meta.get(k) or {}).get('value', ''))

    licence = field('LicenseShortName') or field('License')
    author = field('Artist') or field('Attribution')
    if not licence or FORBIDDEN.search(licence) or not ALLOWED.match(licence):
        return None
    # Public-domain files legitimately have no author; everything else must.
    public_domain = re.match(r'^(cc0|public domain|pd)', licence, re.I)
    if not author and not public_domain:
        return None
    return {
        'author': author or 'Unknown (public domain)',
        'licence': licence,
        'licenceUrl': field('LicenseUrl'),
        'source': info.get('descriptionurl', ''),
    }


def search(poi, limit=8):
    """Candidate files for one location, best first."""
    q = f'{poi["name"]} {poi["region"]}'.strip()
    data = get(API, {
        'action': 'query', 'format': 'json', 'formatversion': '2',
        'generator': 'search', 'gsrsearch': f'{q} filetype:bitmap',
        'gsrnamespace': '6', 'gsrlimit': str(limit),
        'prop': 'imageinfo',
        'iiprop': 'url|size|extmetadata|mime',
        'iiurlwidth': str(max(WIDTHS)),
    })
    if not data:
        return []
    out = []
    for page in (data.get('query', {}).get('pages') or []):
        for info in (page.get('imageinfo') or []):
            if info.get('mime') not in ('image/jpeg', 'image/png', 'image/webp'):
                continue
            if (info.get('width') or 0) < 800:
                continue
            cr = credit_of(info)
            if not cr:
                continue
            out.append({
                'title': page.get('title', '').removeprefix('File:'),
                'url': info.get('thumburl') or info.get('url'),
                'width': info.get('width'), 'height': info.get('height'),
                'credit': cr,
            })
    # Landscape first: the media boxes are 16:10 and 4:3.
    out.sort(key=lambda c: (c['height'] > c['width'], -(c['width'] or 0)))
    return out


def load_manifest():
    if os.path.exists(MANIFEST):
        try:
            return json.load(open(MANIFEST, encoding='utf-8'))
        except Exception:
            pass
    return {'_comment': 'Destination photography from Wikimedia Commons. '
                        'Every entry carries the credit its licence requires; '
                        'the app renders it. Generated by tools/fetch_commons.py.',
            'version': 1, 'images': {}}


def save_manifest(man):
    man['images'] = dict(sorted(man['images'].items()))
    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(man, f, indent=2, ensure_ascii=False)
        f.write('\n')


def cmd_list(args):
    man = load_manifest()
    have = set(man['images'])
    all_p = pois()
    missing = [p for p in all_p if p['id'] not in have]
    print(f'{len(all_p)} locations · {len(have)} with an image · {len(missing)} missing')
    for p in missing[:args.limit or len(missing)]:
        print(f"  {p['id']:<34} {p['name']} — {p['region']}")


def cmd_fetch(args):
    man = load_manifest()
    os.makedirs(OUTDIR, exist_ok=True)
    todo = [p for p in pois()
            if (not args.id or p['id'] == args.id)
            and (args.force or p['id'] not in man['images'])]
    if args.limit:
        todo = todo[:args.limit]
    print(f'{len(todo)} to fetch')
    added = skipped = 0
    for p in todo:
        print(f"  {p['id']} — {p['name']}")
        cands = search(p)
        if not cands:
            print('    no usably-licensed candidate'); skipped += 1; continue
        c = cands[0]
        blob = get(c['url'], binary=True)
        if not blob:
            skipped += 1; continue
        ext = '.jpg' if c['url'].lower().endswith(('.jpg', '.jpeg')) else os.path.splitext(c['url'])[1] or '.jpg'
        fname = p['id'] + ext
        with open(os.path.join(OUTDIR, fname), 'wb') as f:
            f.write(blob)
        man['images'][p['id']] = {
            'file': f'images/locations/{fname}',
            # Bilingual, following the {en, pl} shape images/manifest.json
            # already uses. The English seed is a plain factual description;
            # the Polish is left empty deliberately, so the owner fills it in
            # rather than the tool inventing a translation nobody checked.
            'alt': {'en': f"{p['name']}, {p['region']}", 'pl': ''},
            'credit': dict(c['credit'], title=c['title']),
        }
        print(f"    {fname}  {len(blob)//1024} KB  · {c['credit']['licence']} · {c['credit']['author'][:48]}")
        added += 1
        save_manifest(man)
        time.sleep(0.4)          # be a polite API citizen
    print(f'\nadded {added}, skipped {skipped}')
    print('Now run --resize, check the pictures by eye, and commit.')


def cmd_resize(args):
    try:
        from PIL import Image
    except ImportError:
        sys.exit('--resize needs Pillow:  pip install Pillow\n'
                 'Everything else in this tool is standard library.')
    man = load_manifest()
    n = 0
    for pid, entry in man['images'].items():
        src = os.path.join(ROOT, entry['file'])
        if not os.path.exists(src):
            continue
        stem, _ = os.path.splitext(entry['file'])
        for w in WIDTHS:
            dst = os.path.join(ROOT, f'{stem}-{w}.webp')
            if os.path.exists(dst) and not args.force:
                continue
            im = Image.open(src).convert('RGB')
            if im.width > w:
                im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=82, method=6)
            n += 1
        # The manifest points at the WebP stem; js/media.js appends -400/-800/-1600.
        # Record what was actually written. The app emits no srcset
        # without this, because a srcset naming files nobody built shows
        # a failed placeholder for a picture that is sitting right there.
        entry['widths'] = list(WIDTHS)
        entry['file'] = stem + '.webp'
        if not os.path.exists(os.path.join(ROOT, entry['file'])):
            Image.open(src).convert('RGB').save(
                os.path.join(ROOT, entry['file']), 'WEBP', quality=82, method=6)
    save_manifest(man)
    print(f'wrote {n} renditions')


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--list', action='store_true', help='which locations have no image yet')
    ap.add_argument('--fetch', action='store_true', help='search Commons and download')
    ap.add_argument('--resize', action='store_true', help='build WebP renditions (needs Pillow)')
    ap.add_argument('--id', help='just this one location')
    ap.add_argument('--limit', type=int, default=0)
    ap.add_argument('--force', action='store_true', help='redo entries that already exist')
    a = ap.parse_args()
    if a.fetch: cmd_fetch(a)
    elif a.resize: cmd_resize(a)
    else: cmd_list(a)


if __name__ == '__main__':
    main()
