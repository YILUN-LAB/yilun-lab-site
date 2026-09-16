# Editorial Layout Engine Implementation Plan

**Goal:** A deterministic placement engine that arranges 1–12 homepage cards of
varied sizes into an editorial, non-grid-looking composition at three
breakpoints, used by both the Lab and Works sections.

**Architecture:** Seeded search over size assignments → reading-order skyline
placement on a unit grid → aesthetic score (seam runs, cross junctions, holes,
raggedness, twins, balance, tier mix, height). `EditorialGrid` maps the result
to CSS variables consumed by `global.css` media queries.

**Tech stack:** TypeScript, Vitest, CSS Grid with container-query units, React
18 island, `motion` layout animation. Vite (already installed) for the
untracked playground.

**Spec:** `docs/superpowers/specs/2026-09-16-editorial-layout-engine-design.md`
(local, gitignored).

## Global constraints

- Gap stays 20px at all breakpoints; breakpoints are base / 768px / 1024px.
- Columns: 4 (sm), 8 (md), 12 (lg). Rows are square units via `cqw`.
- Item 0 is the only `lead`, always at (0, 0), always the largest card.
- No card narrower than 3 units on md and lg; mobile cards span all 4 units.
- Output must be identical for identical slug lists (SSR/hydration safety).
- No new dependencies. No `grid-auto-flow: dense`. No changes to MDX schema.
- Keep `motion`, `fadeBlurIn`, weight-based typography maps, Lab badge.

## File map

| File                                         | Responsibility                                            |
| -------------------------------------------- | --------------------------------------------------------- |
| `src/lib/editorial-layout/types.ts`          | Shared types: `Tier`, `Size`, `Placement`, `Breakpoint`, `LayoutInput`, `ScoreBreakdown`, `LayoutResult` |
| `src/lib/editorial-layout/vocabulary.ts`     | `VOCABULARY[breakpoint][tier]`, `COLUMNS[breakpoint]`, `targetFeatureCount(n)` |
| `src/lib/editorial-layout/place.ts`          | `placeItems(sizes, cols) → Placement[]` skyline fill      |
| `src/lib/editorial-layout/score.ts`          | `scorePlacement(placements, cols, targetFeatures) → ScoreBreakdown` |
| `src/lib/editorial-layout/random.ts`         | `hashString(s)`, `mulberry32(seed)`                       |
| `src/lib/editorial-layout/search.ts`         | `searchLayout(input, breakpoint, options) → LayoutResult` |
| `src/lib/editorial-layout/index.ts`          | `computeEditorialLayout(items, options) → Record<Breakpoint, LayoutResult>` |
| `tests/editorial-layout.test.ts`             | Engine unit tests                                         |
| `playground/index.html`, `playground/main.ts`| Untracked visual tuning page                              |
| `src/styles/global.css`                      | `.editorial-layout` variable mapping                      |
| `src/components/react/EditorialGrid.tsx`     | Consume engine, drop span/aspect rules                    |
| `src/components/react/LabSection.tsx`        | Pass three items without forcing weights                  |
| `docs/editorial-grid.md`, `AGENTS.md`        | Document the new behaviour                                |

## Stage 1: Placement and randomness primitives

**Goal:** `placeItems` and `random.ts` with tests.
**Success criteria:** For any list of sizes and `cols` in {4, 8, 12}, output has
no overlaps, stays inside `cols`, item 0 sits at (0, 0), and positions follow
lowest-row-then-lowest-column. `mulberry32(1)` yields a fixed sequence;
`hashString` is stable.
**Tests:** `places first item at origin`, `never overlaps`, `never exceeds
columns`, `fills the lowest free row first`, `prng is deterministic`,
`hash is stable`.
**Status:** Not Started

## Stage 2: Score function

**Goal:** `scorePlacement` returning a breakdown with `total`.
**Success criteria:** A uniform 3-by-4 row grid scores a higher `seamRow` than a
staggered brick layout of the same items; a "+" arrangement scores
`crossJunction` = 1; a layout with an enclosed empty cell scores `holes` > 0;
`ragged` is 0 when bottoms are flush.
**Tests:** one test per term above plus `total is the weighted sum`.
**Status:** Not Started

## Stage 3: Vocabulary, search and public API

**Goal:** `searchLayout` and `computeEditorialLayout` produce valid layouts for
n = 1…12 at every breakpoint, deterministically.
**Success criteria:** Same slugs → deep-equal result; different slugs → different
seed; item 0 is lead and largest; feature count within ±1 of target for n ≥ 4;
best candidate has zero holes for the real project set; runtime under 50ms for
12 items × 3 breakpoints in Vitest.
**Tests:** `is deterministic`, `lead is first and largest`, `respects tier
targets`, `no holes for site content`, `handles zero and one item`, `runs fast`.
**Status:** Not Started

## Stage 4: Playground and visual check

**Goal:** Untracked Vite page at `playground/` rendering the top three candidates
for a chosen count, seed and breakpoint width, with a score table and a
"real content" preset from `src/content/projects`.
**Success criteria:** User confirms the desktop, tablet and mobile results look
editorial and not chaotic; weights in `score.ts` and vocabulary tuned as needed.
**Tests:** Manual visual check; engine tests stay green after tuning.
**Status:** Not Started

## Stage 5: Site integration

**Goal:** `EditorialGrid` uses the engine; Lab and Works render through it.
**Success criteria:** `npm run check`, `npm test`, `npm run lint`, `npm run
build` pass; homepage verified in a real browser at 375, 768 and 1280 px for all
four Works filters and the Lab; no console errors; layout animates on filter
change; badge only on Lab lead.
**Tests:** `tests/editorial-grid.test.tsx` renders the component with three items
and asserts one `--el-lg` style per card and badge presence per mode.
**Status:** Not Started

## Stage 6: Documentation and handoff

**Goal:** Update `docs/editorial-grid.md` and the Lab/Works paragraphs in
`AGENTS.md`; decide with the user whether to keep the playground; remove this
plan file.
**Success criteria:** Docs describe tiers, vocabulary, score terms and
determinism; diff reviewed; commits focused.
**Tests:** `npm run format:check` on changed files.
**Status:** Not Started
