import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS, scorePlacement } from "../src/lib/ashlar/score";
import type { Placement, Tier } from "../src/lib/ashlar/types";

function card(x: number, y: number, w: number, h: number, tier: Tier = "tile"): Placement {
  return { x, y, w, h, tier };
}

describe("scorePlacement", () => {
  it("penalises a full-width horizontal seam more than a staggered layout", () => {
    const rowGrid = [
      card(0, 0, 4, 3, "lead"),
      card(4, 0, 4, 3),
      card(8, 0, 4, 3),
      card(0, 3, 4, 3),
      card(4, 3, 4, 3),
      card(8, 3, 4, 3),
    ];
    const staggered = [
      card(0, 0, 7, 5, "lead"),
      card(7, 0, 5, 4),
      card(7, 4, 5, 3),
      card(0, 5, 4, 3),
      card(4, 5, 3, 2),
    ];
    const grid = scorePlacement(rowGrid, 12);
    const brick = scorePlacement(staggered, 12);
    expect(grid.seamRow).toBeGreaterThan(brick.seamRow);
  });

  it("treats one full seam under the lead as a cheap hero break", () => {
    const heroBand = [
      card(0, 0, 6, 4, "lead"),
      card(6, 0, 6, 4, "feature"),
      card(0, 4, 6, 3),
      card(6, 4, 6, 3),
    ];
    const rows = [
      card(0, 0, 4, 3, "lead"),
      card(4, 0, 4, 3),
      card(8, 0, 4, 3),
      card(0, 3, 4, 3),
      card(4, 3, 4, 3),
      card(8, 3, 4, 3),
      card(0, 6, 4, 3),
      card(4, 6, 4, 3),
      card(8, 6, 4, 3),
    ];
    expect(scorePlacement(heroBand, 12).seamRow).toBeLessThan(5);
    expect(scorePlacement(rows, 12).seamRow).toBeGreaterThan(40);
  });

  it("penalises a lone card protruding from the middle of the bottom edge", () => {
    const tooth = [card(0, 0, 4, 3, "lead"), card(4, 0, 4, 4), card(8, 0, 4, 3)];
    const edge = [card(0, 0, 4, 4, "lead"), card(4, 0, 4, 3), card(8, 0, 4, 3)];
    expect(scorePlacement(tooth, 12).skyline).toBe(1);
    expect(scorePlacement(edge, 12).skyline).toBe(0);
  });

  it("penalises a full-height vertical seam", () => {
    const twoColumns = [card(0, 0, 6, 8, "lead"), card(6, 0, 6, 8)];
    const offset = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 4), card(4, 5, 8, 3)];
    expect(scorePlacement(twoColumns, 12).seamCol).toBeGreaterThan(
      scorePlacement(offset, 12).seamCol
    );
  });

  it("counts four-way junctions but not T-junctions", () => {
    const cross = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 3, 3), card(3, 3, 3, 3)];
    const tee = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 6, 3)];
    expect(scorePlacement(cross, 6).crossJunction).toBe(1);
    expect(scorePlacement(tee, 6).crossJunction).toBe(0);
  });

  it("counts enclosed empty cells as holes", () => {
    const holey = [card(0, 0, 4, 2, "lead"), card(4, 0, 4, 1), card(8, 0, 4, 2), card(0, 2, 12, 1)];
    expect(scorePlacement(holey, 12).holes).toBe(4);
  });

  it("does not count perimeter insets as holes", () => {
    // Second card dropped one row; third card indented one column.
    const inset = [card(0, 0, 7, 5, "lead"), card(7, 1, 5, 3), card(1, 5, 4, 3)];
    expect(scorePlacement(inset, 12).holes).toBe(0);
  });

  it("penalises flush outer edges and rewards drops and indents", () => {
    const flush = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 4), card(0, 5, 4, 3)];
    const broken = [card(0, 0, 7, 5, "lead"), card(7, 1, 5, 4), card(1, 5, 4, 3)];
    expect(scorePlacement(flush, 12).edges).toBeGreaterThan(30);
    expect(scorePlacement(broken, 12).edges).toBeLessThan(5);
  });

  it("treats an entirely empty row as a full-width seam", () => {
    const banded = [card(0, 0, 6, 3, "lead"), card(6, 0, 6, 3), card(0, 4, 6, 3), card(6, 4, 6, 3)];
    expect(scorePlacement(banded, 12).seamRow).toBeGreaterThan(40);
  });

  it("counts empty cells well above the deepest bottom as insets", () => {
    // Dropped second card: five empty cells on the top row. The one-row
    // ragged bottom on the right is within the free range and not an inset.
    const inset = [card(0, 0, 7, 5, "lead"), card(7, 1, 5, 3)];
    expect(scorePlacement(inset, 12).inset).toBe(5);
    const flush = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 3)];
    expect(scorePlacement(flush, 12).inset).toBe(0);
    // A right-edge column left empty far above the bottom is an inset too.
    const notch = [card(0, 0, 7, 5, "lead"), card(7, 0, 4, 5), card(0, 5, 12, 3)];
    expect(scorePlacement(notch, 12).inset).toBe(5);
  });

  it("does not penalise a ragged bottom within two units", () => {
    const flush = [card(0, 0, 2, 2, "lead"), card(2, 0, 2, 2)];
    const gentle = [card(0, 0, 2, 3, "lead"), card(2, 0, 2, 1)];
    const wild = [card(0, 0, 2, 5, "lead"), card(2, 0, 2, 1)];
    expect(scorePlacement(flush, 4).ragged).toBe(0);
    expect(scorePlacement(gentle, 4).ragged).toBe(0);
    expect(scorePlacement(wild, 4).ragged).toBeGreaterThan(0);
  });

  it("penalises notched or many-levelled bottom edges", () => {
    // Two levels, a plain stair: fine.
    const stair = [card(0, 0, 4, 4, "lead"), card(4, 0, 4, 3), card(8, 0, 4, 3)];
    // Middle column ends higher than both neighbours: a notch of two cells.
    const notched = [card(0, 0, 4, 4, "lead"), card(4, 0, 4, 2), card(8, 0, 4, 4)];
    // Three distinct bottom levels.
    const levels = [card(0, 0, 4, 4, "lead"), card(4, 0, 4, 3), card(8, 0, 4, 2)];
    expect(scorePlacement(stair, 12).skyline).toBe(0);
    expect(scorePlacement(notched, 12).skyline).toBe(2);
    expect(scorePlacement(levels, 12).skyline).toBe(1);
  });

  it("counts cards narrower than four units on wide grids only", () => {
    const layout = [card(0, 0, 6, 4, "lead"), card(6, 0, 3, 3), card(9, 0, 3, 3)];
    expect(scorePlacement(layout, 12).narrow).toBe(2);
    const mobile = [card(0, 0, 4, 5, "lead"), card(0, 5, 4, 3)];
    expect(scorePlacement(mobile, 4).narrow).toBe(0);
  });

  it("counts edge-adjacent cards with identical size as twins", () => {
    const twins = [card(0, 0, 4, 4, "lead"), card(4, 0, 3, 3), card(7, 0, 3, 3)];
    const mixed = [card(0, 0, 4, 4, "lead"), card(4, 0, 3, 3), card(7, 0, 4, 3)];
    expect(scorePlacement(twins, 12).twins).toBe(1);
    expect(scorePlacement(mixed, 12).twins).toBe(0);
  });

  it("measures horizontal imbalance of the area centroid", () => {
    const centred = [card(0, 0, 4, 2, "lead"), card(4, 0, 4, 2), card(8, 0, 4, 2)];
    const leftHeavy = [card(0, 0, 4, 4, "lead"), card(4, 0, 2, 1)];
    expect(scorePlacement(centred, 12).balance).toBeCloseTo(0, 5);
    expect(scorePlacement(leftHeavy, 12).balance).toBeGreaterThan(0.1);
  });

  it("counts cards that could not take their assigned tier", () => {
    const layout = [card(0, 0, 6, 4, "lead"), card(6, 0, 6, 4, "feature"), card(0, 4, 6, 3)];
    expect(scorePlacement(layout, 12, ["lead", "feature", "tile"]).tierMix).toBe(0);
    expect(scorePlacement(layout, 12, ["lead", "tile", "feature"]).tierMix).toBe(2);
  });

  it("reports total grid height", () => {
    const layout = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 4), card(7, 4, 5, 3)];
    expect(scorePlacement(layout, 12).height).toBe(7);
  });

  it("skips end-state terms when scoring a partial layout", () => {
    const partial = [card(0, 0, 4, 5, "lead"), card(4, 0, 4, 3), card(8, 0, 4, 1)];
    const full = scorePlacement(partial, 12);
    const mid = scorePlacement(partial, 12, [], { partial: true });
    expect(full.ragged + full.skyline).toBeGreaterThan(0);
    expect(mid.ragged).toBe(0);
    expect(mid.skyline).toBe(0);
    expect(mid.seamRow).toBe(full.seamRow);
  });

  it("accepts weight overrides for tuning", () => {
    const layout = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 3, 3), card(3, 3, 3, 3)];
    const base = scorePlacement(layout, 6);
    const tuned = scorePlacement(layout, 6, [], { weights: { crossJunction: 100 } });
    expect(tuned.crossJunction).toBe(base.crossJunction);
    expect(tuned.total - base.total).toBeCloseTo(100 - SCORE_WEIGHTS.crossJunction, 8);
  });

  it("totals the weighted terms", () => {
    const layout = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 3, 3), card(3, 3, 3, 3)];
    const score = scorePlacement(layout, 6);
    const expected = (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).reduce(
      (sum, key) => sum + score[key] * SCORE_WEIGHTS[key],
      0
    );
    expect(score.total).toBeCloseTo(expected, 8);
  });
});
