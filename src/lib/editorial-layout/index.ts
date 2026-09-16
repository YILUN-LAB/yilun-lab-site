import { searchLayout, type SearchOptions } from "./search";
import type { Breakpoint, LayoutItem, LayoutResult } from "./types";

export { searchLayout } from "./search";
export type { SearchOptions } from "./search";
export { COLUMNS, VOCABULARY, targetFeatureCount } from "./vocabulary";
export { SCORE_WEIGHTS, scorePlacement } from "./score";
export type { ScoreOptions, ScoreWeights } from "./score";
export type * from "./types";

const BREAKPOINTS: Breakpoint[] = ["sm", "md", "lg"];

/**
 * Computes the best layout for every breakpoint. Deterministic for a given
 * slug order, so server and client renders agree.
 */
export function computeEditorialLayout(
  items: LayoutItem[],
  options: SearchOptions = {}
): Record<Breakpoint, LayoutResult> {
  const results = {} as Record<Breakpoint, LayoutResult>;
  for (const breakpoint of BREAKPOINTS) {
    results[breakpoint] = searchLayout(items, breakpoint, options);
  }
  return results;
}
