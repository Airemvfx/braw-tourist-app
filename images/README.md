# Photos

Original photography used for the landing carousel and the app backdrop.

The manifest in this folder is **already filled in** with five entries,
alt text and bilingual captions. The image files themselves are not here
yet — add them with these exact names and everything switches on:

| filename | photo |
|---|---|
| `skye-glen-falls.jpg`    | burn falling through a gorge into a green glen |
| `skye-falls-pool.jpg`    | waterfall over granite slabs into a clear pool |
| `skye-glen-wide.jpg`     | wide glen between rocky peaks |
| `skye-cotton-grass.jpg`  | bog cotton on the moor, waterfall behind |
| `portree-harbour.jpg`    | Portree harbour, Isle of Skye |

Rename yours to match, or edit `manifest.json` to match your filenames —
whichever is less work.

## How it behaves

Entries are **verified at load time**: any file that is not present is
skipped silently. So the manifest can list photos before they are
committed without ever showing a broken image, and a typo costs you one
missing slide rather than a broken landing page.

With no usable images at all, the carousel and backdrop stay hidden and
the layout is exactly as it is today.

## Manifest shape

```json
{
  "images": [
    {
      "src": "images/glencoe.jpg",
      "alt": "Glencoe under low cloud",
      "caption": { "en": "Glencoe", "pl": "Glencoe" }
    }
  ]
}
```

- `src` — required, relative to the site root.
- `alt` — used by screen readers. Worth writing properly.
- `caption` — optional. A plain string, or `{ en, pl }` to follow the
  language switch.

## Size them before committing

These ship to every visitor, so file size matters more than absolute
quality:

- long edge **≤ 2000px** — more is wasted on any phone
- **JPEG quality ~80**, or WebP if you can export it
- aim for **under ~400KB each**; five at that size is ~2MB total
- the carousel frame is 16:10, so landscape crops best

Phone originals are typically 5–15MB each. Committed unresized, five of
them would outweigh the entire rest of the app by a factor of about
twenty and make the landing page markedly slower than the artwork it
sits beside.

Quick resize with ImageMagick:

```bash
magick input.jpg -resize 2000x2000\> -quality 80 images/skye-glen-falls.jpg
```
