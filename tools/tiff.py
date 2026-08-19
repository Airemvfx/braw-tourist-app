"""Minimal TIFF/GeoTIFF reader: enough to pull tiles out of the ESA
WorldCover COGs without rasterio (not available in this sandbox)."""
import struct, zlib

TYPESIZE = {1:1, 2:1, 3:2, 4:4, 5:8, 6:1, 7:1, 8:2, 9:4, 10:8, 11:4, 12:8, 16:8, 17:8, 18:8}
TAGS = {
    256: 'ImageWidth', 257: 'ImageLength', 258: 'BitsPerSample', 259: 'Compression',
    262: 'PhotometricInterpretation', 273: 'StripOffsets', 277: 'SamplesPerPixel',
    278: 'RowsPerStrip', 279: 'StripByteCounts', 284: 'PlanarConfiguration',
    317: 'Predictor', 320: 'ColorMap', 322: 'TileWidth', 323: 'TileLength',
    324: 'TileOffsets', 325: 'TileByteCounts', 339: 'SampleFormat',
    254: 'NewSubfileType',
    33550: 'ModelPixelScale', 33922: 'ModelTiepoint', 34735: 'GeoKeyDirectory',
}


class Tiff:
    def __init__(self, path):
        self.f = open(path, 'rb')
        head = self.f.read(8)
        bo = head[:2]
        assert bo in (b'II', b'MM'), 'not a TIFF'
        self.e = '<' if bo == b'II' else '>'
        magic = struct.unpack(self.e + 'H', head[2:4])[0]
        self.big = magic == 43
        if self.big:                                   # BigTIFF
            self.f.seek(8)
            off = struct.unpack(self.e + 'Q', self.f.read(8))[0]
        else:
            off = struct.unpack(self.e + 'I', head[4:8])[0]
        self.ifds = []
        while off:
            ifd, off = self._read_ifd(off)
            self.ifds.append(ifd)

    def _read_ifd(self, off):
        f, e = self.f, self.e
        f.seek(off)
        if self.big:
            n = struct.unpack(e + 'Q', f.read(8))[0]
            entry, esz = e + 'HHQQ', 20
        else:
            n = struct.unpack(e + 'H', f.read(2))[0]
            entry, esz = e + 'HHII', 12
        raw = f.read(n * esz)
        after = f.tell()          # _value seeks away for out-of-line values
        ifd = {}
        for i in range(n):
            tag, typ, cnt, val = struct.unpack(entry, raw[i * esz:(i + 1) * esz])
            ifd[TAGS.get(tag, tag)] = self._value(typ, cnt, val, i, raw, esz, entry)
        f.seek(after)
        nxt = struct.unpack(e + ('Q' if self.big else 'I'), f.read(8 if self.big else 4))[0]
        return ifd, nxt

    def _value(self, typ, cnt, val, i, raw, esz, entry):
        e = self.e
        size = TYPESIZE.get(typ, 1) * cnt
        inline = 8 if self.big else 4
        if size <= inline:
            # value sits in the field itself
            off = i * esz + (12 if self.big else 8)
            data = raw[off:off + size]
        else:
            self.f.seek(val)
            data = self.f.read(size)
        fmt = {1:'B', 2:'s', 3:'H', 4:'I', 5:'II', 6:'b', 7:'B', 8:'h', 9:'i',
               11:'f', 12:'d', 16:'Q', 17:'q', 18:'Q'}.get(typ, 'B')
        if typ == 2:
            return data.split(b'\0')[0].decode('latin1')
        if typ == 5:
            nums = struct.unpack(e + 'I' * (2 * cnt), data)
            return [nums[2 * k] / (nums[2 * k + 1] or 1) for k in range(cnt)]
        out = list(struct.unpack(e + fmt * cnt, data))
        return out[0] if cnt == 1 else out

    def levels(self):
        """(index, width, height) per IFD — full res first, then overviews."""
        return [(i, d['ImageWidth'], d['ImageLength']) for i, d in enumerate(self.ifds)]

    def read_level(self, idx):
        """Decode a whole (small) level into a flat bytes-like row-major buffer."""
        d = self.ifds[idx]
        W, H = d['ImageWidth'], d['ImageLength']
        tw, th = d['TileWidth'], d['TileLength']
        offs = d['TileOffsets']
        cnts = d['TileByteCounts']
        if not isinstance(offs, list): offs, cnts = [offs], [cnts]
        comp = d.get('Compression', 1)
        across = (W + tw - 1) // tw
        buf = bytearray(W * H)
        for n, (o, c) in enumerate(zip(offs, cnts)):
            if c == 0:
                continue
            self.f.seek(o)
            raw = self.f.read(c)
            if comp == 8 or comp == 32946:
                raw = zlib.decompress(raw)
            elif comp == 5:
                raw = lzw(raw)
            elif comp != 1:
                raise NotImplementedError(f'compression {comp}')
            tx, ty = (n % across) * tw, (n // across) * th
            for r in range(th):
                y = ty + r
                if y >= H:
                    break
                src = raw[r * tw:(r + 1) * tw]
                w = min(tw, W - tx)
                buf[y * W + tx:y * W + tx + w] = src[:w]
        return buf, W, H

    def geo(self, idx=0):
        """(originLon, originLat, pixelSizeLon, pixelSizeLat) for a level."""
        d0, d = self.ifds[0], self.ifds[idx]
        tp = d0['ModelTiepoint']; sc = d0['ModelPixelScale']
        scale = d0['ImageWidth'] / d['ImageWidth']
        return tp[3], tp[4], sc[0] * scale, sc[1] * scale


def lzw(data):
    out = bytearray(); dic = {i: bytes([i]) for i in range(256)}
    nxt, width, prev = 258, 9, None
    acc = bits = 0
    for byte in data:
        acc = (acc << 8) | byte; bits += 8
        while bits >= width:
            code = (acc >> (bits - width)) & ((1 << width) - 1); bits -= width
            if code == 256:
                dic = {i: bytes([i]) for i in range(256)}; nxt, width, prev = 258, 9, None
                continue
            if code == 257:
                return bytes(out)
            if prev is None:
                entry = dic[code]
            elif code in dic:
                entry = dic[code]
            else:
                entry = dic[prev] + dic[prev][:1]
            out += entry
            if prev is not None:
                dic[nxt] = dic[prev] + entry[:1]; nxt += 1
                if nxt + 1 >= (1 << width) and width < 12: width += 1
            prev = code
    return bytes(out)


if __name__ == '__main__':
    import sys
    t = Tiff(sys.argv[1])
    print('BigTIFF:', t.big, '| IFDs:', len(t.ifds))
    for i, w, h in t.levels():
        d = t.ifds[i]
        print(f'  L{i}: {w}x{h} tile={d.get("TileWidth")}x{d.get("TileLength")} '
              f'comp={d.get("Compression")} bits={d.get("BitsPerSample")} '
              f'pred={d.get("Predictor")} sub={d.get("NewSubfileType")}')
    print('geo L0:', t.geo(0))
