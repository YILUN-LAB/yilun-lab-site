import { describe, expect, it } from "vitest";
import { SCORE_WEIGHTS, scorePlacement } from "../src/lib/editorial-layout/score";
import type { Placement, Tier } from "../src/lib/editorial-layout/types";

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
    const grid = scorePlacement(rowGrid, 12, 1);
    const brick = scorePlacement(staggered, 12, 1);
    expect(grid.seamRow).toBeGreaterThan(brick.seamRow);
  });

  it("penalises a full-height vertical seam", () => {
    const twoColumns = [card(0, 0, 6, 8, "lead"), card(6, 0, 6, 8)];
    const offset = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 4), card(4, 5, 8, 3)];
    expect(scorePlacement(twoColumns, 12, 1).seamCol).toBeGreaterThan(
      scorePlacement(offset, 12, 1).seamCol
    );
  });

  it("counts four-way junctions but not T-junctions", () => {
    const cross = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 3, 3), card(3, 3, 3, 3)];
    const tee = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 6, 3)];
    expect(scorePlacement(cross, 6, 1).crossJunction).toBe(1);
    expect(scorePlacement(tee, 6, 1).crossJunction).toBe(0);
  });

  it("counts empty cells that have a card below them as holes", () => {
    const holey = [card(0, 0, 2, 1, "lead"), card(0, 1, 4, 1)];
    expect(scorePlacement(holey, 4, 0).holes).toBe(2);
  });

  it("does not penalise a ragged bottom within two units", () => {
    const flush = [card(0, 0, 2, 2, "lead"), card(2, 0, 2, 2)];
    const gentle = [card(0, 0, 2, 3, "lead"), card(2, 0, 2, 1)];
    const wild = [card(0, 0, 2, 5, "lead"), card(2, 0, 2, 1)];
    expect(scorePlacement(flush, 4, 0).ragged).toBe(0);
    expect(scorePlacement(gentle, 4, 0).ragged).toBe(0);
    expect(scorePlacement(wild, 4, 0).ragged).toBeGreaterThan(0);
  });

  it("counts edge-adjacent cards with identical size as twins", () => {
    const twins = [card(0, 0, 4, 4, "lead"), card(4, 0, 3, 3), card(7, 0, 3, 3)];
    const mixed = [card(0, 0, 4, 4, "lead"), card(4, 0, 3, 3), card(7, 0, 4, 3)];
    expect(scorePlacement(twins, 12, 0).twins).toBe(1);
    expect(scorePlacement(mixed, 12, 0).twins).toBe(0);
  });

  it("measures horizontal imbalance of the area centroid", () => {
    const centred = [card(0, 0, 4, 2, "lead"), card(4, 0, 4, 2), card(8, 0, 4, 2)];
    const leftHeavy = [card(0, 0, 4, 4, "lead"), card(4, 0, 2, 1)];
    expect(scorePlacement(centred, 12, 0).balance).toBeCloseTo(0, 5);
    expect(scorePlacement(leftHeavy, 12, 0).balance).toBeGreaterThan(0.1);
  });

  it("measures deviation from the target feature count", () => {
    const layout = [card(0, 0, 6, 4, "lead"), card(6, 0, 6, 4, "feature"), card(0, 4, 6, 3)];
    expect(scorePlacement(layout, 12, 1).tierMix).toBe(0);
    expect(scorePlacement(layout, 12, 3).tierMix).toBe(2);
  });

  it("reports total grid height", () => {
    const layout = [card(0, 0, 7, 5, "lead"), card(7, 0, 5, 4), card(7, 4, 5, 3)];
    expect(scorePlacement(layout, 12, 1).height).toBe(7);
  });

  it("totals the weighted terms", () => {
    const layout = [card(0, 0, 3, 3, "lead"), card(3, 0, 3, 3), card(0, 3, 3, 3), card(3, 3, 3, 3)];
    const score = scorePlacement(layout, 6, 2);
    const expected = (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).reduce(
      (sum, key) => sum + score[key] * SCORE_WEIGHTS[key],
      0
    );
    expect(score.total).toBeCloseTo(expected, 8);
  });
});
