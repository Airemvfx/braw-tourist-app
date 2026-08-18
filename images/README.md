# Photos

Original photography used for the landing carousel and the app backdrop.

## Adding photos

1. Put the image files in this folder.
2. List them in `manifest.json`:

```json
{
  "images": [
    { "src": "images/glencoe.jpg",  "alt": "Glencoe under low cloud",       "caption": "Glencoe" },
    { "src": "images/quiraing.jpg", "alt": "The Quiraing ridge at sunrise", "caption": "The Quiraing, Skye" }
  ]
}
```

`src` is required. `alt` is used by screen readers — worth writing.
`caption` is optional and shown over the slide.

An empty list (the default) disables the carousel and backdrop cleanly:
nothing renders, nothing 404s, and the layout is unchanged.

## Recommended before committing

These ship to every visitor, so size matters more than absolute quality:

- long edge **≤ 2000px** — beyond that is wasted on any phone
- **JPEG quality ~80**, or WebP if you can produce it
- aim for **under ~400KB each**; six photos at that size is ~2.4MB total
- landscape orientation suits the carousel's aspect best

Originals straight from a camera are typically 5–15MB each, which would
make the landing page far slower than the artwork it sits beside.
