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

The owner kept the name Hug (not an acronym) and added the gestures Hold, Unfold
and Gather on 4 November 2026. Their initials spell the name, but the page never
says so: the hero shows only the title and subtitle, and the three words appear
after the statement as a quiet row describing each gesture. An earlier version
with amber initials and an unfolding animation under the title was dropped as
too explicit. Hold refers to the proposed hold-to-toggle touch zone, Unfold to
the open state, Gather to the gathered state.

## Interactive sketch model

The three-states section shows the R13 model as a pencil sketch on paper,
after the owner's reference of car design sketches (4 November 2026). It sits
in the stage with a Sketch / Render switch; Render shows the studio images.

- Controls: the state buttons snap to open, half-open or gathered; the Unfold /
  Gather slider sets any opening in between and moves the color temperature
  continuously (`src/lib/hug-opening.ts`); Hold switches the light with a
  700 ms press, matching the proposed hold-to-toggle touch zone (keyboard and
  assistive activation switch at once). Turn buttons and dragging rotate the
  model; it turns slowly on its own after 4 s idle unless reduced motion is on.
- Drawing (`src/lib/hug-model-scene.ts`): a normal and depth pass feeds a
  composite shader that finds outlines (silhouette, creases, wing overlap),
  traces each twice with a slight wobble, hatches the shaded side and lays a
  marker wash in the current color temperature. Switched off, the wash goes.
  The construction ellipse, ground line, shadow strokes, axis and 300 mm mark
  are SVG over the canvas (`HugModelViewer.tsx`).
- Loading: three.js and the model load only when the stage nears the screen.
  Without WebGL 2, or if loading fails, the stage falls back to Render.
- The meshopt decoder uses WebAssembly, so the site CSP in `vercel.json`
  allows `'wasm-unsafe-eval'`. Without it the model fails only in production.

To regenerate `public/assets/models/hug/hug-states.glb` from the owner's
`HUG_R13_三态完整版_全开半开闭合.blend` (scene 00):

```sh
blender -b HUG_R13_三态完整版_全开半开闭合.blend --python scripts/export-hug-model.py -- /tmp/hug-states.glb
npx @gltf-transform/cli@4 meshopt /tmp/hug-states.glb public/assets/models/hug/hug-states.glb --level high
```

The script takes each state in its local frame. The scene's object rotations
are camera staging (half-open is turned -38°), so dropping them faces all three
states forward and keeps the morph from spinning. The shell and edge light
cavity share one topology across states (50,038 and 4,256 vertices), so
half-open and gathered export as morph targets. The compressed file is about
635 KB (about 255 KB gzipped).

## Filling the placeholders

- Drawings: in `hug.ts`, give each entry in `development.drawings` a `src`, `alt`,
  `width`, and `height` (images under `public/assets/images/projects/hug/`).
  Drawings are shown on a light card, suited to dark linework on white.
- Film: set `development.youtube` to the YouTube video ID. iF requires the video
  to be publicly viewable, at most two minutes, in English or with English
  subtitles.
- More scenes: add them to `images` in `hug.mdx` in morning-to-night order.
