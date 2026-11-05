# Hug product page (iF Design Award 2027)

`/projects/hug` is the product page submitted as the Web URL for Yilun Zhan's iF
Design Award 2027 entry. The jury opens only this page, in English.
iF requires the material to stay online and reachable from Germany from November
to April, so keep the URL stable and publicly accessible: give iF the production
URL, never a Vercel preview URL behind deployment protection. The iF username and
password fields are only for password-protected pages and stay empty.

Because it is a competition entry, the owner decided on 4 November 2026 to keep
Hug off the homepage: `hug.mdx` sets `unlisted: true`, so the page exists only at
its direct URL and other projects' next-work links skip it. Remove the flag to
list it in Works later.

The entry is submitted under Yilun Zhan's own name (owner's decision, 5 November
2026). The page therefore stands alone: no studio navigation, footer, next-work
link or studio name, a personal page title ("Hug by Yilun Zhan"), a person as
JSON-LD creator with no organization data, and its own icon traced from the
lamp's outline (`icon.svg`). The domain cannot change. Do not mention the iF
application number or the model's internal revision name on the page; the test
in `tests/hug.test.tsx` guards both and the studio name.

## Sources

The owner supplied this [Drive folder](https://drive.google.com/drive/folders/1I7NrKyifjU-iHmLVnAyDvw8o4spy7dac)
on 4 November 2026: nine scene renders (`01_…png` to `12_…png`, 1448 × 1086) and
`Hug_iF2027_Project_Presentation_EN.pdf`, the eight-page PDF uploaded to iF.
Page copy combines the PDF with the iF form answers (Design Statement, Idea,
Form, Function, Differentiation, Sustainability), edited for the web with the
humanizer guidelines. Claims stay at the level of the source: the lamp is a
digital model, and behavior that is proposed or intended is described that way.

## Content and assets

- `src/content/projects/hug.mdx` holds card metadata, the cover, and the ordered
  scene renders with English captions translated from the Drive file names.
- `src/lib/data/hug.ts` holds all page copy, the studio and detail images, the
  three states with their color temperatures and sizes, the drawing slots, and
  the film ID.
- `src/components/HugLayout.astro` and `src/components/react/HugProject.tsx`
  render the page; `HugStates`, `HugDayStrip`, `HugLightPath`, and
  `HugZoomImage` are its parts. `tests/hug.test.tsx` covers the state selector,
  criteria sections, the light path drawing, hidden unpublished content,
  lightbox, the
  standalone personal page, and a no-dash rule for the copy.

| Website asset                                 | Source                                |
| --------------------------------------------- | ------------------------------------- |
| `scene-01.webp` … `scene-12.webp`             | Drive PNGs with the same number       |
| `cover.webp`, `cover.jpg` (1200 × 630 social) | PDF page 1 studio image               |
| `state-open/half-open/gathered.webp`          | PDF page 3 (640 × 890 in the PDF)     |
| `states-lineup.webp`                          | PDF page 8, three states side by side |
| `detail-embrace.webp`                         | PDF page 4                            |
| `detail-edge.webp`, `detail-base.webp`        | PDF pages 8 and 7                     |
| `night-gathered.webp`                         | PDF page 6                            |

The Differentiation pair uses `scene-08.webp` for "At dusk" (owner's choice,
5 November 2026; it replaced the unlit daytime image with dry stems).

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

The three-states section shows the digital model as a pencil sketch on paper,
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
three-state .blend file (scene 00):

```sh
blender -b HUG_三态_入光组件居中.blend --python scripts/export-hug-model.py -- /tmp/hug-states.glb
npx @gltf-transform/cli@4 meshopt /tmp/hug-states.glb public/assets/models/hug/hug-states.glb --level high
```

The script takes each state in its local frame. The scene's object rotations
are camera staging (half-open is turned -38°), so dropping them faces all three
states forward and keeps the morph from spinning. The shell and edge light
cavity share one topology across states (50,038 and 4,256 vertices), so
half-open and gathered export as morph targets. The compressed file is about
635 KB (about 255 KB gzipped).

## Light path drawing (Function)

`HugLightPath.tsx` is a technical drawing on the same paper as the sketch
model: a front elevation of the open state and section A-A through the
middle LED (enlarged), with numbered parts, dimensions
and a title block. Light rises from each LED in the elevation and reflects
inside the guide in the section; reduced motion stops both.

It draws only from `src/lib/data/hug-function-drawing.json`, measured from the
open state in scene 00 by `scripts/export-hug-function-drawing.py`: the traced
front silhouette (266.7 × 300 mm), the 10 mm edge cavity, 14 LED positions and
heat islands, the control board envelope, the opening sensor, and the cut
profiles of shell, guide, cavity, LED and heat island. The laminate measures
3.4 mm with a 2.4 mm guide; the 0.4 mm diffuser values come from the owner's
exploded layer scene (05). Regenerate with:

```sh
blender -b HUG_三态_入光组件居中.blend --python scripts/export-hug-function-drawing.py -- src/lib/data/hug-function-drawing.json
npx prettier --write src/lib/data/hug-function-drawing.json
```

### Light-entry correction (5 November 2026)

In the owner's original file the U-channel edge cavity sat about 0.8 to 1.7 mm
off the laminate in all 12 lamp assemblies: the laminate cut into the channel's
right wall, and the LEDs, centred in the channel, faced only about 15 % of the
light guide. With the owner's agreement, `scripts/center-hug-light-entry.py`
produced `HUG_三态_入光组件居中.blend`, a copy in which, for each assembly and
square to the laminate (its local direction, since the gathered base curves
tightly and leans about 7 degrees):

- each edge-cavity vertex moves so the channel centre meets the laminate's
  centre where it sits in the channel;
- the end caps, control board envelope and opening sensor move with it;
- each LED and heat island moves onto the centre of the guide's lower edge.

Nothing else changes (384 objects moved, 12 cavity meshes reshaped; materials
and scenes identical). Its `--check` mode reports, per assembly, the channel
to laminate offset (now at most 0.04 mm), whether each LED sits under the
guide, each heat island in the channel, and the laminate clear of the walls.
The base band is now roughly symmetric (about 1.8 and 1.5 mm proud of the
laminate instead of 3.3 mm and flush). The light path data and the web model
are exported from this file, and tests check the LED and laminate placement in
the drawing data.

## Tone

On 5 November 2026 the owner asked to remove copy that undersells the entry:
the "Not yet claimed" sustainability note, the list of properties still to
validate, "not been tested" in the drawing note and the long development
status. Proposed behavior is still described as intended or planned, but the
page does not list caveats. A test in `tests/hug.test.tsx` guards these phrases.

## Publishing drawings and the film

Unfinished content stays off the page; nothing renders for an empty slot.

- Drawings: in `hug.ts`, give each entry in `development.drawings` a `src`, `alt`,
  `width`, and `height` (images under `public/assets/images/projects/hug/`). Only
  drawings with a `src` appear, on a light card suited to dark linework on white.
- Film: set `development.youtube` to the YouTube video ID; the film block then
  appears. iF requires the video
  to be publicly viewable, at most two minutes, in English or with English
  subtitles.
- More scenes: add them to `images` in `hug.mdx` in morning-to-night order.
