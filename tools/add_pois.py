# -*- coding: utf-8 -*-
"""Insert the new locations into data.js (structure) and
i18n-content.js (Polish), written once in newpois.py."""
import os, sys, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from newpois import NEW
ROOT = '/home/user/braw-tourist-app'

def js(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

# ---------------- data.js ----------------
p = os.path.join(ROOT, 'js', 'data.js')
src = open(p, encoding='utf-8').read()
lines = ['', '  // ============================================================',
         '  // City and regional stops, added so short trips have somewhere to go.',
         '  // Every coordinate checked against the land mask and its own city.',
         '  // ============================================================']
by_region = {}
for x in NEW:
    by_region.setdefault(x['region'], []).append(x)
for region in sorted(by_region):
    lines.append('')
    lines.append(f'  // ---- {region} ----')
    for x in by_region[region]:
        tags = ', '.join(f"'{t}'" for t in x['tags'])
        lines.append(
            f"  {{ id: '{x['id']}', name: '{js(x['name'])}', region: '{x['region']}', "
            f"lat: {x['lat']}, lon: {x['lon']}, tags: [{tags}], xp: {x['xp']}, pop: {x['pop']}, "
            f"icon: '{x['icon']}', time: '{x['time']}', blurb: '{js(x['blurb'])}' }},")

anchor = "\n];\n\n// Starting points the parser can recognise."
assert src.count(anchor) == 1
src = src.replace(anchor, '\n' + '\n'.join(lines) + anchor)
open(p, 'w', encoding='utf-8').write(src)
print(f'data.js: added {len(NEW)} locations')

# ---------------- i18n-content.js ----------------
p2 = os.path.join(ROOT, 'js', 'i18n-content.js')
src2 = open(p2, encoding='utf-8').read()
out = ['', '  // ---- city and regional stops ----']
for region in sorted(by_region):
    for x in by_region[region]:
        out.append(f"  '{x['id']}': {{ name: '{js(x['pl_name'])}', blurb: '{js(x['pl_blurb'])}' }},")

m = re.search(r"export const PL_POIS = \{", src2)
assert m, 'PL_POIS not found'
# close of the PL_POIS object: the first '};' after it
end = src2.index('\n};', m.end())
src2 = src2[:end] + '\n' + '\n'.join(out) + src2[end:]
open(p2, 'w', encoding='utf-8').write(src2)
print(f'i18n-content.js: added {len(NEW)} Polish entries')
