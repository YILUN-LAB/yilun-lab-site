import { UnitGrid, type Gap, type Placed } from "./place";
import { scorePlacement, type ScoreWeights } from "./score";
import type {
  Breakpoint,
  LayoutCandidate,
  LayoutItem,
  LayoutResult,
  Placement,
  Size,
  Tier,
} from "./types";
import { COLUMNS, MIN_WIDTH, VOCABULARY, targetFeatureCount } from "./vocabulary";

export interface SearchOptions {
  /** Partial layouts kept per step. Wider beams find better layouts, slower. */
  beamWidth?: number;
  /** How many best-first finished candidates to return (for the playground). */
  keep?: number;
  /** Per-term overrides of `SCORE_WEIGHTS`, for tuning. */
  weights?: Partial<ScoreWeights>;
}

const DEFAULT_BEAM_WIDTH = 48;
const DEFAULT_KEEP = 1;

/** Priority for promotion to `feature`, from the MDX weight nudge. */
const WEIGHT_RANK: Record<NonNullable<LayoutItem["weight"]>, number> = {
  lead: 2,
  feature: 2,
  column: 1,
  tile: 0,
};

/**
 * Assigns tiers once, deterministically: item 0 leads; the supporting items
 * with the heaviest MDX weight become features, earlier items winning ties,
 * until the target count is met.
 */
function assignTiers(items: LayoutItem[]): Tier[] {
  const target = targetFeatureCount(items.length);
  const ranked = items
    .map((item, index) => ({ index, rank: item.weight ? WEIGHT_RANK[item.weight] : 1 }))
    .slice(1)
    .sort((a, b) => b.rank - a.rank || a.index - b.index)
    .slice(0, target)
    .map((entry) => entry.index);
  const features = new Set(ranked);
  return items.map((_, index) => (index === 0 ? "lead" : features.has(index) ? "feature" : "tile"));
}

interface BeamState {
  grid: UnitGrid;
  placements: Placement[];
  total: number;
  /** Order of creation; breaks score ties so results never depend on sort stability. */
  serial: number;
}

/**
 * Sizes a card may take in the current gap: it fills the gap exactly or
 * leaves at least one more card's width, so slivers cannot form. The wanted
 * tier is tried first, then the neighbouring supporting tier; as a last
 * resort every size of the wanted tier is allowed and the hole penalty
 * decides.
 */
function sizeOptions(
  wanted: Tier,
  gapWidth: number,
  breakpoint: Breakpoint
): { tier: Tier; size: Size }[] {
  const vocab = VOCABULARY[breakpoint];
  const minWidth = MIN_WIDTH[breakpoint];
  // Exact fill, one short (for an inset against a grid edge), or room for another card.
  const fits = (s: Size) => s.w === gapWidth || s.w === gapWidth - 1 || s.w <= gapWidth - minWidth;
  const own = vocab[wanted].filter(fits).map((size) => ({ tier: wanted, size }));
  if (own.length > 0) return own;
  if (wanted !== "lead") {
    const fallback: Tier = wanted === "feature" ? "tile" : "feature";
    const borrowed = vocab[fallback].filter(fits).map((size) => ({ tier: fallback, size }));
    if (borrowed.length > 0) return borrowed;
  }
  return vocab[wanted].map((size) => ({ tier: wanted, size }));
}

type Variant = (grid: UnitGrid, size: Size) => Placed<Size> | null;

/**
 * Ways to put a card into the current gap. Besides the plain fill, a card may
 * be dropped one row or indented one column when the empty cells this leaves
 * stay open to the outside: at the top row, or against the left or right
 * grid edge. Any variant that no longer fits is skipped; the plain fill falls
 * back to a full scan so the search always progresses.
 */
function placementVariants(
  gap: Gap,
  size: Size,
  cols: number,
  minWidth: number,
  index: number
): Variant[] {
  const atLeft = gap.x === 0;
  const atRight = gap.x + gap.width === cols;
  const atTop = gap.y === 0;
  const remainder = gap.width - 1 - size.w;
  const variants: Variant[] = [];
  // A card one unit short of the gap only makes sense as an edge inset; a
  // plain fill would leave a sliver.
  if (remainder !== 0) {
    variants.push((grid, s) =>
      grid.fits(gap.x, gap.y, s.w, s.h) ? grid.placeAt(gap.x, gap.y, s) : grid.place(s)
    );
  }
  if (index === 0) return variants;

  // Drops only break the top edge; lower down they read as a missing card.
  if (atTop && remainder !== 0) {
    variants.push((grid, s) => {
      if (!grid.fits(gap.x, gap.y + 1, s.w, s.h)) return null;
      grid.block(gap.x, gap.y, s.w, 1);
      return grid.placeAt(gap.x, gap.y + 1, s);
    });
  }
  if (atLeft && (remainder === 0 || remainder >= minWidth)) {
    variants.push((grid, s) => {
      if (!grid.fits(gap.x + 1, gap.y, s.w, s.h)) return null;
      grid.block(gap.x, gap.y, 1, s.h);
      return grid.placeAt(gap.x + 1, gap.y, s);
    });
  }
  if (atRight && remainder === 0) {
    variants.push((grid, s) => {
      if (!grid.fits(gap.x, gap.y, s.w, s.h)) return null;
      grid.block(gap.x + s.w, gap.y, 1, s.h);
      return grid.placeAt(gap.x, gap.y, s);
    });
  }
  return variants;
}

export function searchLayout(
  items: LayoutItem[],
  breakpoint: Breakpoint,
  options: SearchOptions = {}
): LayoutResult {
  const cols = COLUMNS[breakpoint];
  const beamWidth = Math.max(1, options.beamWidth ?? DEFAULT_BEAM_WIDTH);
  const keep = Math.max(1, options.keep ?? DEFAULT_KEEP);
  const weights = options.weights;

  if (items.length === 0) {
    const empty: LayoutCandidate = { placements: [], score: scorePlacement([], cols) };
    return { breakpoint, cols, rows: 0, best: empty, candidates: [empty] };
  }

  if (items.length === 1) {
    const lead = VOCABULARY[breakpoint].lead[0];
    const placements: Placement[] = [{ x: 0, y: 0, w: cols, h: lead.h, tier: "lead" }];
    const single: LayoutCandidate = { placements, score: scorePlacement(placements, cols) };
    return { breakpoint, cols, rows: lead.h, best: single, candidates: [single] };
  }

  const tiers = assignTiers(items);
  let serial = 0;
  let beam: BeamState[] = [
    { grid: new UnitGrid(cols), placements: [], total: 0, serial: serial++ },
  ];

  for (let index = 0; index < items.length; index++) {
    const last = index === items.length - 1;
    const next: BeamState[] = [];
    for (const state of beam) {
      const gap = state.grid.lowestGap();
      for (const { tier, size } of sizeOptions(tiers[index], gap.width, breakpoint)) {
        for (const variant of placementVariants(gap, size, cols, MIN_WIDTH[breakpoint], index)) {
          const grid = state.grid.clone();
          const placed = variant(grid, size);
          if (!placed) continue;
          const placements = [...state.placements, { ...placed, tier }];
          const score = scorePlacement(placements, cols, tiers, { partial: !last, weights });
          next.push({ grid, placements, total: score.total, serial: serial++ });
        }
      }
    }
    next.sort((a, b) => a.total - b.total || a.serial - b.serial);
    beam = next.slice(0, last ? Math.max(beamWidth, keep) : beamWidth);
  }

  const candidates: LayoutCandidate[] = beam.slice(0, keep).map((state) => ({
    placements: state.placements,
    score: scorePlacement(state.placements, cols, tiers, { weights }),
  }));
  const best = candidates[0];
  const rows = best.placements.reduce((max, p) => Math.max(max, p.y + p.h), 0);
  return { breakpoint, cols, rows, best, candidates };
}
