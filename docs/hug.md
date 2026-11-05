# Hug product page (iF Design Award 2027)

`/projects/hug` is the product page submitted as the Web URL for Yilun Zhan's iF
Design Award 2027 entry (No. 817254). The jury opens only this page, in English.
iF requires the material to stay online and reachable from Germany from November
to April, so keep the URL stable and publicly accessible: give iF the production
URL, never a Vercel preview URL behind deployment protection. The iF username and
password fields are only for password-protected pages and stay empty.

Because it is a competition entry, the owner decided on 4 November 2026 to keep
Hug off the homepage: `hug.mdx` sets `unlisted: true`, so the page exists only at
its direct URL and other projects' next-work links skip it. Remove the flag to
list it in Works later.

## Sources

The owner supplied this [Drive folder](https://drive.google.com/drive/folders/1I7NrKyifjU-iHmLVnAyDvw8o4spy7dac)
on 4 November 2026: nine scene renders (`01_…png` to `12_…png`, 1448 × 1086) and
`Hug_iF2027_Project_Presentation_EN.pdf`, the eight-page PDF uploaded to iF.
Page copy combines the PDF with the iF form answers (Design Statement, Idea,
Form, Function, Differentiation, Sustainability), edited for the web with the
humanizer guidelines. Claims stay at the level of the source: the lamp is an R13
digital model, and behavior that is proposed or intended is described that way.

## Content and assets

- `src/content/projects/hug.mdx` holds card metadata, the cover, and the ordered
  scene renders with English captions translated from the Drive file names.
- `src/lib/data/hug.ts` holds all page copy, the studio and detail images, the
  three states with their color temperatures and sizes, the drawing slots, and
  the film ID.
- `src/components/HugLayout.astro` and `src/components/react/HugProject.tsx`
  render the page; `HugStates`, `HugDayStrip`, `HugLaminateDiagram`, and
  `HugZoomImage` are its parts. `tests/hug.test.tsx` covers the state selector,
  criteria sections, placeholders, lightbox, and a no-dash rule for the copy.

| Website asset                                 | Source                                |
| --------------------------------------------- | ------------------------------------- |
| `scene-01.webp` … `scene-12.webp`             | Drive PNGs with the same number       |
| `cover.webp`, `cover.jpg` (1200 × 630 social) | PDF page 1 studio image               |
| `state-open/half-open/gathered.webp`          | PDF page 3 (640 × 890 in the PDF)     |
| `states-lineup.webp`                          | PDF page 8, three states side by side |
| `detail-embrace.webp`                         | PDF page 4                            |
| `detail-edge.webp`, `detail-base.webp`        | PDF pages 8 and 7                     |
| `day-unlit.webp`, `night-gathered.webp`       | PDF page 6                            |

Renders are encoded as WebP at quality 82, PDF images at quality 86, without
resizing. The three state images are small in the PDF; replace them with larger
exports when available, keeping the file names. `npm run assets:gc` checks MDX
only, so it reports the studio and detail images referenced from `hug.ts`; they
are in use.

## Name and gestures

The owner kept the name Hug (not an acronym) and added "Hold · Unfold · Gather"
as a tagline on 4 November 2026. The hero shows the three words under the title
with amber initials; they open out from H·U·G on load and gather back on hover
(CSS only, `.hug-gesture-rest` in `global.css`). Hold refers to the proposed
hold-to-toggle touch zone, Unfold to the open state, Gather to the gathered state.

## Filling the placeholders

- Drawings: in `hug.ts`, give each entry in `development.drawings` a `src`, `alt`,
  `width`, and `height` (images under `public/assets/images/projects/hug/`).
  Drawings are shown on a light card, suited to dark linework on white.
- Film: set `development.youtube` to the YouTube video ID. iF requires the video
  to be publicly viewable, at most two minutes, in English or with English
  subtitles.
- More scenes: add them to `images` in `hug.mdx` in morning-to-night order.
