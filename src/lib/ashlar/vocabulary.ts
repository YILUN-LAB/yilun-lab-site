import type { Breakpoint, Size, Tier } from "./types";

/**
 * Grid columns per breakpoint. Rows are square units of the same size, so a
 * 12-column tablet unit is about 35px and a desktop unit about 75px at the
 * reference widths. Mobile is a single visual column.
 */
export const COLUMNS: Record<Breakpoint, number> = { sm: 4, md: 12, lg: 12 };

/**
 * Narrowest card per breakpoint. A gap must be filled exactly or leave at
 * least this much room, so slivers cannot form. Tablet needs four units
 * (about 230px) for the overlay text; desktop can go to three (about 265px).
 */
export const MIN_WIDTH: Record<Breakpoint, number> = { sm: 4, md: 4, lg: 3 };

/**
 * Desktop footprints per tier (width × height in units). The lead's smallest
 * area must exceed every other size, so hierarchy holds by construction.
 * Wide, short "banner" features let a card straddle an earlier vertical seam.
 */
const WIDE: Record<Tier, Size[]> = {
  lead: [
    { w: 7, h: 5 },
    { w: 8, h: 5 },
    { w: 6, h: 5 },
    { w: 7, h: 6 },
  ],
  feature: [
    { w: 5, h: 4 },
    { w: 6, h: 4 },
    { w: 5, h: 3 },
    { w: 4, h: 5 },
    { w: 5, h: 5 },
    { w: 7, h: 3 },
    { w: 7, h: 4 },
    { w: 8, h: 3 },
  ],
  tile: [
    { w: 4, h: 3 },
    { w: 3, h: 3 },
    { w: 4, h: 4 },
    { w: 3, h: 4 },
    { w: 5, h: 3 },
    { w: 6, h: 3 },
  ],
};

function atLeastWidth(vocab: Record<Tier, Size[]>, minWidth: number): Record<Tier, Size[]> {
  return {
    lead: vocab.lead.filter((s) => s.w >= minWidth),
    feature: vocab.feature.filter((s) => s.w >= minWidth),
    tile: vocab.tile.filter((s) => s.w >= minWidth),
  };
}

export const VOCABULARY: Record<Breakpoint, Record<Tier, Size[]>> = {
  lg: WIDE,
  md: atLeastWidth(WIDE, MIN_WIDTH.md),
  sm: {
    lead: [{ w: 4, h: 5 }],
    feature: [{ w: 4, h: 4 }],
    tile: [{ w: 4, h: 3 }],
  },
};

/** Roughly a third of the supporting cards are features; at least one from two items. */
export function targetFeatureCount(itemCount: number): number {
  if (itemCount < 2) return 0;
  return Math.max(1, Math.round((itemCount - 1) / 3));
}
