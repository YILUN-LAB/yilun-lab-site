export type Tier = "lead" | "feature" | "tile";

export type Breakpoint = "sm" | "md" | "lg";

/** Card footprint in grid units (columns × square rows). */
export interface Size {
  w: number;
  h: number;
}

/** A card placed on the unit grid. `x`/`y` are zero-based cell coordinates. */
export interface Placement extends Size {
  x: number;
  y: number;
  tier: Tier;
}

/** Minimal item description the engine needs. `weight` is an optional nudge. */
export interface LayoutItem {
  slug: string;
  weight?: "lead" | "feature" | "column" | "tile";
}

export interface ScoreBreakdown {
  seamRow: number;
  seamCol: number;
  crossJunction: number;
  holes: number;
  ragged: number;
  twins: number;
  balance: number;
  tierMix: number;
  height: number;
  total: number;
}

export interface LayoutCandidate {
  placements: Placement[];
  score: ScoreBreakdown;
  /** Draw index inside the search; documents the tie-break order. */
  draw: number;
}

export interface LayoutResult {
  breakpoint: Breakpoint;
  cols: number;
  /** Total occupied rows of the best candidate. */
  rows: number;
  best: LayoutCandidate;
  /** Best-first, including `best`; length is `options.keep`. */
  candidates: LayoutCandidate[];
  seed: number;
}
