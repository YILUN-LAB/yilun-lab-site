# Ashlar layout system

Ashlar is the deterministic layout engine behind the homepage's Lab and Works
grids. It replaces hand-tuned column spans, aspect ratios, and composition
props with a search over a small vocabulary of card sizes, scored for how
editorial the result looks. The engine lives in
[`src/lib/ashlar/`](../src/lib/ashlar/) and is consumed by
[`EditorialGrid`](../src/components/react/EditorialGrid.tsx).

## Purpose and naming

The engine is named after random-coursed ashlar masonry: square-cut stones of
varied sizes laid so that no joint runs continuously across the wall. That is
the visual goal for the grids — cards of different sizes packed tightly, with
seams that stagger rather than line up into rows, columns, or a uniform
lattice. "Ashlar" replaces the working name "editorial layout engine" used
during development.

## Public API

```ts
import { computeAshlarLayout, searchLayout } from "@lib/ashlar";

// One LayoutResult per breakpoint (sm, md, lg), deterministic for a given item order.
const layouts = computeAshlarLayout(items, options);

// A single breakpoint, used internally and by the playground.
const result = searchLayout(items, "lg", options);
```

`items` is `{ slug: string; weight?: "lead" | "feature" | "column" | "tile" }[]`.
`options` (both calls) accepts `beamWidth`, `keep`, and `weights` (a partial
override of `SCORE_WEIGHTS`, for tuning). A `LayoutResult` carries `cols`,
`rows`, the `best` candidate, and up to `keep` best-first `candidates`, each
with `placements` (`{ x, y, w, h, tier }` per item, in unit-grid cells) and a
`ScoreBreakdown`.

## Unit grid and breakpoints

Every breakpoint lays cards on an occupancy grid of square-ish unit cells. The
gap between cards is 20px at every breakpoint.

| Breakpoint | Columns | Min card width | Row height                                          |
| ---------- | ------- | -------------- | --------------------------------------------------- |
| `sm`       | 4       | 4 (full width) | Square units; every card spans all 4 columns        |
| `md`       | 12      | 4              | 1.5× a column unit (CSS only, not in the unit grid) |
| `lg`       | 12      | 3              | Square units                                        |

On mobile (`sm`) every card is full-width, so hierarchy comes entirely from
height: 5 units for the lead, 4 for a feature, 3 for a tile. On `md` and `lg`
the unit grid itself stays square; the taller row only shows up in the CSS
that maps grid units to pixels, so cards read comfortably on tablet without
the engine needing to know about it.

At the 768px tablet reference width, the content column is about 640px; with
eleven 20px gaps between the 12 columns, each column unit is about 35px, so
the 4-unit minimum card width is about 200px, and a row unit (1.5× a column
unit) is about 52px. At the 1280px desktop reference width, a column unit is
about 75px.

## Tiers and the weight nudge

Every layout has exactly three tiers: `lead`, `feature`, `tile`.

- Item 0 is always the lead, always placed at the grid's top-left origin, and
  always the largest card by area — this holds by construction, since every
  lead size in the vocabulary exceeds every feature and tile size.
- Of the remaining items, roughly a third become features
  (`targetFeatureCount`, at least one once there are two or more items); the
  rest are tiles.
- The MDX `weight` field (`lead`, `feature`, `column`, `tile`) is only a
  nudge for which supporting items are promoted to feature. `lead` and
  `feature` rank highest, `column` ranks in the middle, `tile` ranks lowest,
  and an unset weight ranks like `column`. Ties (including no weights at all)
  go to the earlier item in source order.
- Card footprints come from `VOCABULARY[breakpoint][tier]` in
  [`vocabulary.ts`](../src/lib/ashlar/vocabulary.ts) — a short list of
  width×height options per tier. The search, not the tier assignment, picks
  which exact size an item takes, based on the score.

Tier assignment happens once per breakpoint, before the search runs; it does
not change based on which sizes end up fitting well.

## Placement and perimeter variants

Cards are placed in reading order (source order) using a skyline fill: each
card goes into the current lowest free cell, then the leftmost free cell at
that row (`UnitGrid.lowestGap` in [`place.ts`](../src/lib/ashlar/place.ts)).

A card's width must either fill the current gap exactly or leave enough room
for at least one more card of the minimum width for that breakpoint — so a
placement can never strand a useless sliver of space next to it.

To keep the outer silhouette from reading as a flush rectangle, a card next
to the grid's perimeter may take one of a few variants instead of a plain
fill:

- **Drop** — a card on the top row may drop one unit down, leaving a one-unit
  gap above it. Drops are only allowed on the top row; lower down, a dropped
  card would read as a missing card rather than a deliberate break.
- **Indent** — a card against the left edge may indent one unit inward.
- **Short** — a card against the right edge may stop one unit short of it.

Every variant leaves its empty cells open to the outside of the grid, so they
never count as holes (see below). The plain fill is always tried too, so the
search can fall back to it when a variant does not help the score.

## Search

`searchLayout` runs a deterministic beam search (default width 48): at each
item, every surviving partial layout expands into every valid tier size ×
placement variant combination, the results are scored and sorted by total
score, and only the best `beamWidth` survive to the next item. Score ties are
broken by a creation-order serial counter, not by array position, so the
result never depends on sort stability.

Because the beam search has no randomness and item order is the only input
that affects placement, the same list of slugs always produces the same
layout — server-rendered HTML and the client's hydrated render agree without
a mismatch. In informal measurement, computing all three breakpoints stays
under about 30ms for 8 cards and 60ms for 12; the test suite enforces a
200ms ceiling for 12 items across all three breakpoints combined as a
regression guard, not a tight benchmark.

## Score

`scorePlacement` (in [`score.ts`](../src/lib/ashlar/score.ts)) returns a
breakdown of penalty terms; lower is better. `SCORE_WEIGHTS` holds the
per-term multipliers and is the main tuning surface.

| Term            | Weight | What it penalises                                                                                                                                                                                                                       |
| --------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seamRow`       |      1 | Horizontal seams where two different cards meet across a row line, beyond a free run of half the grid width. A full-width seam costs much more — except directly under the lead, which is a cheap "hero break."                         |
| `seamCol`       |      1 | Vertical seams between columns, free up to the lead's height, with an extra charge when a seam runs the full grid height.                                                                                                               |
| `crossJunction` |      3 | Four different cards meeting at one vertex (a "+" junction), which reads as a rigid grid. T-junctions are free.                                                                                                                         |
| `holes`         |     10 | Empty cells enclosed by cards — cells that cannot reach the outside of the bounding box through other empty cells (found by a flood fill from the border).                                                                              |
| `ragged`        |      2 | How uneven the bottom edge is: the range between the shallowest and deepest column bottoms, beyond a 2-unit free allowance.                                                                                                             |
| `skyline`       |      3 | Notches (empty runs boxed in by cards on both sides), lone "tooth" cards with open space on both sides at the bottom, and distinct bottom levels beyond two — keeps the bottom edge reading as a simple stair rather than a jagged one. |
| `twins`         |    1.5 | Edge-adjacent pairs of cards with an identical footprint (same width and height).                                                                                                                                                       |
| `narrow`        |    1.5 | Cards under the 4-unit comfort width, only counted where the grid is wide enough (8+ columns) for that to be a real choice.                                                                                                             |
| `edges`         |      1 | Straight runs of cards flush along the outer top, left, or right silhouette, beyond a free allowance — the perimeter should look irregular, not framed.                                                                                 |
| `inset`         |      1 | Each empty cell more than two rows above the deepest bottom (drops, indents, notches, holes). Cheap per cell, so the search only spends insets where they break a seam or a flush edge.                                                 |
| `balance`       |      6 | Horizontal offset of the layout's area centroid from the grid's center, normalised by width.                                                                                                                                            |
| `tierMix`       |      8 | Cards that could not take their assigned tier and borrowed a neighbouring tier's size instead; also valid on partial (in-progress) layouts.                                                                                             |
| `height`        |    0.5 | Total occupied rows — a light pull toward more compact layouts.                                                                                                                                                                         |

`ragged` and `skyline` are only meaningful once a layout's bottom edge is
final, so they are held at 0 while a layout is still partway through the
search (`options.partial`).

## Rendering contract

`EditorialGrid` calls `computeAshlarLayout` and, per card, sets six inline CSS
custom properties from the resulting placements:

```
--ashlar-sm-col / --ashlar-sm-row
--ashlar-md-col / --ashlar-md-row
--ashlar-lg-col / --ashlar-lg-row
```

Each value is a CSS grid line range, e.g. `1 / span 7`. `src/styles/global.css`
defines `.ashlar` (a `container-type: inline-size` wrapper) and
`.ashlar-grid`, which map those variables onto `grid-column` /
`grid-row` under media queries at 768px and 1024px, and size rows with `cqw`
units so the grid scales with its own container rather than the viewport.

Card typography still follows the tier the engine assigned: `lead` gets lead
styling, `feature` gets feature styling, and `tile` gets the same compact
styling as the old `column` weight. In `mode="lab"`, the `// Featured` badge
still shows on the lead card only.

## Tuning workflow

The tracked playground at [`playground/`](../playground/) is a standalone
Vite page for tuning the engine visually, run with:

```bash
npm run ashlar:playground
```

It serves at `http://localhost:4400` and renders the top candidates for any
preset — Works All, each Works filter, Lab, and synthetic sets of 1 through
12 items — at 375, 768, 1280, and 1536px widths, alongside live inputs for
`SCORE_WEIGHTS` and an ASCII map of each candidate's grid.

Tuning Ashlar means editing `SCORE_WEIGHTS` (in
[`score.ts`](../src/lib/ashlar/score.ts)) and `VOCABULARY` (in
[`vocabulary.ts`](../src/lib/ashlar/vocabulary.ts)), checking the result in
the playground across presets and widths, then verifying on the real
homepage.

## No manual layout

Manual layout overrides are not allowed for the homepage grids. The MDX
`aspect` field is removed from the content schema; no component may hard-code
column spans, row spans, aspect ratios, or positions for Lab or Works cards;
and `grid-auto-flow: dense` must not be used anywhere in these grids. Any
change to how cards are arranged — a different split for three items, a
wider "hero break" allowance, a new card size — goes through the engine's
vocabulary and score, not through per-card overrides in a component or MDX
file.

## Research basis

The score function is built on established layout-aesthetics research rather
than an arbitrary rule list. Ngo, Teo & Byrne (2003), "Modelling interface
aesthetics," proposed measurable metrics — balance, sequence, economy — for
screen layouts, which inform `balance` and the overall shape of the scoring
approach. O'Donovan, Agarwala & Hertzmann (2014), "Learning Layouts for
Single-Page Graphic Designs," learned layout quality from real page designs
and motivated treating alignment and seam structure as scorable, tunable
features rather than fixed rules. Atkins (2008), the BRIC algorithm, and
Moussa (2022), "An Algorithm for Irregular Grids," both address packing
photos of varied sizes into tight, irregular grids without gaps or
overlaps — the same constraint Ashlar's skyline placement and gap-fill rule
solve for card grids.
