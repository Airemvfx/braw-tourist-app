"""PNG decode, DEM/land-cover sampling, marching squares and simplification.
Pure stdlib: this sandbox has neither PIL nor numpy."""
import math, struct, zlib


# ---------------------------------------------------------------- PNG

def read_png(path):
    """8-bit RGB, non-interlaced (what the terrarium tiles are)."""
    data = open(path, 'rb').read()
    assert data[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos, idat, w = 8, bytearray(), None
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos + 4])[0]
        typ = data[pos + 4:pos + 8]
        body = data[pos + 8:pos + 8 + ln]
        if typ == b'IHDR':
            w, h, depth, ctype, _, _, interlace = struct.unpack('>IIBBBBB', body)
            assert depth == 8 and ctype == 2 and interlace == 0, (depth, ctype, interlace)
        elif typ == b'IDAT':
            idat += body
        elif typ == b'IEND':
            break
        pos += 12 + ln
    raw = zlib.decompress(bytes(idat))
    bpp, stride = 3, w * 3
    out = bytearray(w * h * 3)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]; p += 1
        line = bytearray(raw[p:p + stride]); p += stride
        if f == 1:
            for i in range(bpp, stride): line[i] = (line[i] + line[i - bpp]) & 255
        elif f == 2:
            for i in range(stride): line[i] = (line[i] + prev[i]) & 255
        elif f == 3:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 255
        elif f == 4:
            for i in range(stride):
                a = line[i - bpp] if i >= bpp else 0
                c = prev[i - bpp] if i >= bpp else 0
                b = prev[i]
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pr) & 255
        out[y * stride:(y + 1) * stride] = line
        prev = line
    return out, w, h


# ------------------------------------------------------- simplification

def douglas_peucker(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    t2 = tol * tol
    while stack:
        i, j = stack.pop()
        if j <= i + 1:
            continue
        ax, ay = pts[i]; bx, by = pts[j]
        dx, dy = bx - ax, by - ay
        den = dx * dx + dy * dy
        best, bi = -1.0, -1
        for k in range(i + 1, j):
            px, py = pts[k]
            if den == 0:
                d2 = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = ((px - ax) * dx + (py - ay) * dy) / den
                t = 0.0 if t < 0 else (1.0 if t > 1 else t)
                d2 = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d2 > best:
                best, bi = d2, k
        if best > t2:
            keep[bi] = True
            stack.append((i, bi)); stack.append((bi, j))
    return [p for p, k in zip(pts, keep) if k]


def ring_area(pts):
    a = 0.0
    for i in range(len(pts)):
        x1, y1 = pts[i]; x2, y2 = pts[(i + 1) % len(pts)]
        a += x1 * y2 - x2 * y1
    return a / 2.0


# ---------------------------------------------------- marching squares

def _key(x, y):
    return (round(x * 64), round(y * 64))


def marching_squares(field, W, H, level, closed=True):
    """Contours of `field` (flat list, row-major, W*H) at `level`.

    Returns a list of point lists. Closed rings when the contour does not
    touch the grid edge — callers pad the field so that it never does.
    """
    segs = []
    def ip(v1, v2, x1, y1, x2, y2):
        d = v2 - v1
        t = 0.5 if d == 0 else (level - v1) / d
        return (x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)

    for y in range(H - 1):
        row, nrow = y * W, (y + 1) * W
        for x in range(W - 1):
            v0 = field[row + x]          # top-left
            v1 = field[row + x + 1]      # top-right
            v2 = field[nrow + x + 1]     # bottom-right
            v3 = field[nrow + x]         # bottom-left
            idx = (1 if v0 > level else 0) | (2 if v1 > level else 0) | \
                  (4 if v2 > level else 0) | (8 if v3 > level else 0)
            if idx == 0 or idx == 15:
                continue
            top    = lambda: ip(v0, v1, x, y, x + 1, y)
            right  = lambda: ip(v1, v2, x + 1, y, x + 1, y + 1)
            bottom = lambda: ip(v3, v2, x, y + 1, x + 1, y + 1)
            left   = lambda: ip(v0, v3, x, y, x, y + 1)
            # segments oriented so that "inside" (> level) is on the left
            if idx in (1, 14):
                s = [(left(), top())] if idx == 1 else [(top(), left())]
            elif idx in (2, 13):
                s = [(top(), right())] if idx == 2 else [(right(), top())]
            elif idx in (3, 12):
                s = [(left(), right())] if idx == 3 else [(right(), left())]
            elif idx in (4, 11):
                s = [(right(), bottom())] if idx == 4 else [(bottom(), right())]
            elif idx in (6, 9):
                s = [(top(), bottom())] if idx == 6 else [(bottom(), top())]
            elif idx in (7, 8):
                s = [(left(), bottom())] if idx == 7 else [(bottom(), left())]
            elif idx == 5:
                s = [(left(), top()), (right(), bottom())]
            else:  # idx == 10
                s = [(top(), right()), (bottom(), left())]
            segs.extend(s)

    # chain segments end-to-end into paths, indexing by start point
    from collections import defaultdict
    by_start = defaultdict(list)
    for i, (a, b) in enumerate(segs):
        by_start[_key(*a)].append(i)

    used = [False] * len(segs)
    paths = []
    for i in range(len(segs)):
        if used[i]:
            continue
        used[i] = True
        chain = [segs[i][0], segs[i][1]]
        cur = segs[i][1]
        while True:
            nxt = None
            for j in by_start.get(_key(*cur), ()):
                if not used[j]:
                    nxt = j
                    break
            if nxt is None:
                break
            used[nxt] = True
            cur = segs[nxt][1]
            chain.append(cur)
            if _key(*cur) == _key(*chain[0]):
                break
        paths.append(chain)
    return paths
