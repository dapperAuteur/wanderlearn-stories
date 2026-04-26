# public/assets/img/alice/

Drop overlay-card images here. The seed JSON in
`src/curriculum/alice/*.json` references these paths verbatim.

## Expected files

Hub 1:
- `h1-clocks-count.png`
- `h1-bookshelves.png`
- `h1-rabbit-pace.png`

Hub 2:
- `h2-door-compare.png`
- `h2-key-shape.png`
- `h2-drink-bigger.png`

## Format guidelines (plan 05)

- **Format:** `.png` for transparent illustrations, `.webp` for
  flat photos.
- **Texture LODs:** ship at three sizes (256, 512, 1024 px) per
  plan 05. Filename suffix convention: `name-256.png`, `name-512.png`,
  `name-1024.png`. The runtime picks based on
  `devicePixelRatio × screen.width`. (Picker logic comes when the
  asset pipeline solidifies — for now, `name.png` at 512 is fine.)
- **Compression:** crush PNGs (e.g., `pngquant`) before committing.
  Total per-hub transferred budget is ≤ 12 MB on low-end mobile.
- **Source:** original art *or* public-domain Tenniel illustrations
  (1865 *Alice* illustrations are public domain). No stock photography.

## Accessibility

Card images are decorative when paired with audio narration; pair
with `alt=""` for screen readers (already configured in
`src/scene/SceneOverlay.tsx`). The narration is the primary
information channel; the image is supportive.
