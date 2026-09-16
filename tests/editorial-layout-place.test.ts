import { describe, expect, it } from "vitest";
import { placeItems } from "../src/lib/editorial-layout/place";
import { hashString, mulberry32 } from "../src/lib/editorial-layout/random";
import type { Placement, Size } from "../src/lib/editorial-layout/types";

function overlaps(a: Placement, b: Placement): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

const sizes: Size[] = [
  { w: 7, h: 5 },
  { w: 5, h: 4 },
  { w: 4, h: 3 },
  { w: 3, h: 3 },
  { w: 5, h: 3 },
  { w: 4, h: 4 },
];

describe("placeItems", () => {
  it("places the first item at the origin", () => {
    const placed = placeItems(sizes, 12);
    expect(placed[0]).toMatchObject({ x: 0, y: 0, w: 7, h: 5 });
  });

  it("never overlaps", () => {
    for (const cols of [4, 8, 12]) {
      const fitted = sizes.map((s) => ({ w: Math.min(s.w, cols), h: s.h }));
      const placed = placeItems(fitted, cols);
      for (let i = 0; i < placed.length; i++) {
        for (let j = i + 1; j < placed.length; j++) {
          expect(overlaps(placed[i], placed[j])).toBe(false);
        }
      }
    }
  });

  it("never exceeds the column count", () => {
    const placed = placeItems(sizes, 12);
    for (const p of placed) expect(p.x + p.w).toBeLessThanOrEqual(12);
  });

  it("fills the lowest free row first, then the lowest column", () => {
    // lead 7x5 at (0,0); feature 5x4 at (7,0); the 4x3 tile fits at (7,4)
    // under the feature before any slot below the lead becomes lower.
    const placed = placeItems(sizes.slice(0, 3), 12);
    expect(placed[1]).toMatchObject({ x: 7, y: 0 });
    expect(placed[2]).toMatchObject({ x: 7, y: 4 });
  });

  it("throws when an item is wider than the grid", () => {
    expect(() => placeItems([{ w: 5, h: 2 }], 4)).toThrow(/wider/);
  });
});

describe("random", () => {
  it("prng is deterministic for a seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    for (const v of seqA) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("hash is stable and differs for different strings", () => {
    expect(hashString("mo-gu|tao-cave")).toBe(hashString("mo-gu|tao-cave"));
    expect(hashString("mo-gu|tao-cave")).not.toBe(hashString("tao-cave|mo-gu"));
  });
});
