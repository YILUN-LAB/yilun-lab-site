import { describe, expect, it } from "vitest";
import { computeAshlarLayout, searchLayout } from "../src/lib/ashlar";
import { COLUMNS, targetFeatureCount } from "../src/lib/ashlar/vocabulary";
import type { Breakpoint, LayoutItem } from "../src/lib/ashlar/types";

const BREAKPOINTS: Breakpoint[] = ["sm", "md", "lg"];

const worksAll: LayoutItem[] = [
  { slug: "true-self", weight: "lead" },
  { slug: "her", weight: "feature" },
  { slug: "through-limits", weight: "column" },
  { slug: "tao-cave", weight: "feature" },
  { slug: "mo-gu", weight: "tile" },
  { slug: "saoko", weight: "tile" },
  { slug: "myself", weight: "column" },
  { slug: "bizcochito", weight: "tile" },
];
const worksArt = worksAll.filter((i) =>
  ["true-self", "through-limits", "tao-cave", "mo-gu"].includes(i.slug)
);
const worksDance = worksAll.filter((i) =>
  ["true-self", "her", "through-limits", "saoko", "myself", "bizcochito"].includes(i.slug)
);
const worksTech = worksAll.filter((i) => ["tao-cave", "mo-gu"].includes(i.slug));
const lab: LayoutItem[] = [
  { slug: "soft-boundary", weight: "lead" },
  { slug: "human-permeability", weight: "lead" },
  { slug: "mood-cocoon", weight: "feature" },
];
const siteSets = { worksAll, worksArt, worksDance, worksTech, lab };

function fakeItems(n: number): LayoutItem[] {
  return Array.from({ length: n }, (_, i) => ({ slug: `item-${i}` }));
}

describe("searchLayout", () => {
  it("is deterministic for the same input", () => {
    const a = searchLayout(worksAll, "lg");
    const b = searchLayout(worksAll, "lg");
    expect(a).toEqual(b);
  });

  it("promotes items with a heavier MDX weight to features first", () => {
    const items: LayoutItem[] = [
      { slug: "a" },
      { slug: "b", weight: "tile" },
      { slug: "c", weight: "feature" },
      { slug: "d", weight: "tile" },
    ];
    const { best } = searchLayout(items, "lg");
    expect(best.placements[2].tier).toBe("feature");
  });

  it("renders the first item as the only lead, at the origin, and largest", () => {
    for (const bp of BREAKPOINTS) {
      for (let n = 1; n <= 12; n++) {
        const { best } = searchLayout(fakeItems(n), bp);
        const [first, ...rest] = best.placements;
        expect(first).toMatchObject({ x: 0, y: 0, tier: "lead" });
        for (const p of rest) {
          expect(p.tier).not.toBe("lead");
          expect(p.w * p.h).toBeLessThan(first.w * first.h);
        }
      }
    }
  });

  it("keeps the feature count within one of the target", () => {
    for (let n = 4; n <= 12; n++) {
      const { best } = searchLayout(fakeItems(n), "lg");
      const features = best.placements.filter((p) => p.tier === "feature").length;
      expect(Math.abs(features - targetFeatureCount(n))).toBeLessThanOrEqual(1);
    }
  });

  it("produces no holes for the site's content sets on tablet and desktop", () => {
    for (const [name, items] of Object.entries(siteSets)) {
      for (const bp of ["md", "lg"] as Breakpoint[]) {
        const { best } = searchLayout(items, bp);
        expect(best.score.holes, `${name} @ ${bp}`).toBe(0);
      }
    }
  });

  it("never overlaps or overflows for any count", () => {
    for (const bp of BREAKPOINTS) {
      for (let n = 1; n <= 12; n++) {
        const { best, cols } = searchLayout(fakeItems(n), bp);
        expect(cols).toBe(COLUMNS[bp]);
        const ps = best.placements;
        for (let i = 0; i < ps.length; i++) {
          expect(ps[i].x + ps[i].w).toBeLessThanOrEqual(cols);
          for (let j = i + 1; j < ps.length; j++) {
            const a = ps[i];
            const b = ps[j];
            const hit = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
            expect(hit, `${n} items @ ${bp}: ${i} vs ${j}`).toBe(false);
          }
        }
      }
    }
  });

  it("keeps cards in reading order from top to bottom, allowing one-unit drops", () => {
    for (const bp of BREAKPOINTS) {
      const { best } = searchLayout(fakeItems(10), bp);
      for (let i = 1; i < best.placements.length; i++) {
        expect(best.placements[i].y).toBeGreaterThanOrEqual(best.placements[i - 1].y - 1);
      }
    }
  });

  it("breaks the flush top and left edges for larger sets", () => {
    for (const items of [worksAll, worksDance]) {
      const { best, cols } = searchLayout(items, "lg");
      const topCovered = new Set<number>();
      const leftCovered = new Set<number>();
      for (const p of best.placements) {
        if (p.y === 0) for (let x = p.x; x < p.x + p.w; x++) topCovered.add(x);
        if (p.x === 0) for (let y = p.y; y < p.y + p.h; y++) leftCovered.add(y);
      }
      const rows = Math.max(...best.placements.map((p) => p.y + p.h));
      expect(topCovered.size, "top edge").toBeLessThan(cols);
      expect(leftCovered.size, "left edge").toBeLessThan(rows);
    }
  });

  it("spans the full width for a single item", () => {
    for (const bp of BREAKPOINTS) {
      const { best, cols } = searchLayout(fakeItems(1), bp);
      expect(best.placements[0].w).toBe(cols);
    }
  });

  it("returns an empty layout for no items", () => {
    const result = searchLayout([], "lg");
    expect(result.best.placements).toEqual([]);
    expect(result.rows).toBe(0);
  });

  it("returns candidates sorted best-first", () => {
    const { candidates, best } = searchLayout(fakeItems(8), "lg", { keep: 3 });
    expect(candidates).toHaveLength(3);
    expect(candidates[0]).toEqual(best);
    expect(candidates[1].score.total).toBeGreaterThanOrEqual(candidates[0].score.total);
    expect(candidates[2].score.total).toBeGreaterThanOrEqual(candidates[1].score.total);
  });
});

describe("computeAshlarLayout", () => {
  it("returns one result per breakpoint", () => {
    const result = computeAshlarLayout(lab);
    expect(Object.keys(result).sort()).toEqual(["lg", "md", "sm"]);
    expect(result.sm.cols).toBe(4);
    expect(result.lg.best.placements).toHaveLength(3);
  });

  it("runs quickly for the largest set", () => {
    const start = performance.now();
    computeAshlarLayout(fakeItems(12));
    expect(performance.now() - start).toBeLessThan(200);
  });
});
