# YILUN LAB Brand Assets

YILUN LAB uses a monochrome identity system. This directory holds the
production brand kit — masters in SVG, plus rendered PNG/JPG variants
for handoff to external use.

## Logo system

- **Mark** — symbol only, square
- **Lockup, horizontal** — symbol + YILUN LAB, side by side (primary lockup)
- **Lockup, stacked** — symbol + YILUN LAB, stacked (secondary)

Use the **black** version on light or cream backgrounds, the **white**
version on black or dark backgrounds.

## File types

| Format | When to use                                                       |
| ------ | ----------------------------------------------------------------- |
| SVG    | Web, digital layouts, anything that needs to scale                |
| PNG    | Transparent raster — slide decks, documents, thumbnails           |
| JPG    | Fixed-background previews — social, embedded, "show me the logo" |

SVG is the master. PNG and JPG are rendered from the SVG and re-rendered
whenever the master changes.

## Naming convention

```
{brand}-{asset}-{layout?}-{color}-{background?}-{size?}.{ext}
```

- **brand** — always `yilun-lab`
- **asset** — `mark` | `lockup`
- **layout** — `horizontal` | `stacked` (only on lockup)
- **color** — `black` | `white`
- **background** — `transparent` | `on-cream` | `on-black` | `on-dark`
  (omitted for SVG; required for raster)
- **size** — pixel width with `w` suffix, or square edge length
  (omitted for SVG; required for raster)

Examples:

```
yilun-lab-mark-black.svg
yilun-lab-lockup-horizontal-white.svg
yilun-lab-mark-black-transparent-1024.png
yilun-lab-lockup-horizontal-white-on-black-2400w.jpg
```

## Website usage

The website itself only references a small subset of the brand kit. The
rest is for Yilun's external use (decks, PR, partners).

| Where                       | File                                                       |
| --------------------------- | ---------------------------------------------------------- |
| Navbar (light background)   | `logos/svg/yilun-lab-lockup-horizontal-black.svg`          |
| Footer (dark background)    | `logos/svg/yilun-lab-lockup-horizontal-white.svg`          |
| Mobile / favicon source     | `logos/svg/yilun-lab-mark-black.svg`, `/favicon.svg`       |
| Social share preview        | `/og-image.jpg`                                            |

## Favicons & app icons

Stored in `/public/` (root of the served domain):

| File                  | Size    | Purpose                                |
| --------------------- | ------- | -------------------------------------- |
| `favicon.svg`         | vector  | Modern browsers (preferred)            |
| `favicon-48.png`      | 48×48   | Legacy fallback                        |
| `apple-touch-icon.png`| 180×180 | iOS home screen                        |
| `icon-192.png`        | 192×192 | PWA / Android                          |
| `icon-512.png`        | 512×512 | PWA / Android (high-res)               |

The `favicon.svg` is a stylized variant of the mark (gold strokes,
cream orb on near-black) — the PNG icons are rasterized from it for
visual continuity across platforms.

## Open Graph image

`/og-image.jpg` is **not** a logo master — it's a 1200×630 social
share preview composed of the white horizontal lockup over a dark
background with a warm halo and the studio tagline. Per Meta/Facebook
guidance: at least 1200×630, under 8 MB.

## Don't

- Don't stretch the logo
- Don't add color effects
- Don't place the black logo on dark backgrounds
- Don't place the white logo on light backgrounds
- Don't use JPG as the master logo
- Don't use AI-generated raster output as final brand art
