import type { Placement, ScoreBreakdown } from "./types";

/**
 * Penalty weights. Lower total is better. These are the main tuning surface;
 * the terms themselves are documented in docs/editorial-grid.md.
 */
export const SCORE_WEIGHTS = {
  seamRow: 1,
  seamCol: 1,
  crossJunction: 3,
  holes: 4,
  ragged: 2,
  twins: 1.5,
  balance: 6,
  tierMix: 2,
  height: 0.5,
} as const;

/** Extra penalty when a seam runs the entire width or height. */
const FULL_SEAM_PENALTY = 4;
/** Fraction of the width a horizontal seam may run before it reads as a row. */
const SEAM_ROW_FREE_FRACTION = 0.5;
/** Bottom-edge range (in units) that still reads as intentional. */
const RAGGED_FREE_UNITS = 2;

const EMPTY = -1;

function buildCellMap(placements: Placement[], cols: number): { cells: number[][]; rows: number } {
  const rows = placements.reduce((max, p) => Math.max(max, p.y + p.h), 0);
  const cells: number[][] = Array.from({ length: rows }, () => new Array<number>(cols).fill(EMPTY));
  placements.forEach((p, id) => {
    for (let y = p.y; y < p.y + p.h; y++) {
      for (let x = p.x; x < p.x + p.w; x++) cells[y][x] = id;
    }
  });
  return { cells, rows };
}

function seamPenalty(run: number, free: number, full: number): number {
  const excess = Math.max(0, run - free);
  return excess * excess + (run >= full ? FULL_SEAM_PENALTY : 0);
}

/** Longest run of consecutive boundary cells along a line. */
function longestRun(isBoundary: (i: number) => boolean, length: number): number {
  let best = 0;
  let current = 0;
  for (let i = 0; i < length; i++) {
    current = isBoundary(i) ? current + 1 : 0;
    if (current > best) best = current;
  }
  return best;
}

export function scorePlacement(
  placements: Placement[],
  cols: number,
  targetFeatures: number
): ScoreBreakdown {
  const { cells, rows } = buildCellMap(placements, cols);
  const between = (a: number, b: number) => a !== EMPTY && b !== EMPTY && a !== b;

  // Horizontal seams: card meets a different card across line y.
  let seamRow = 0;
  const rowFree = cols * SEAM_ROW_FREE_FRACTION;
  for (let y = 1; y < rows; y++) {
    const run = longestRun((x) => between(cells[y - 1][x], cells[y][x]), cols);
    seamRow += seamPenalty(run, rowFree, cols);
  }

  // Vertical seams: free up to the tallest card (the lead), then penalised.
  let seamCol = 0;
  const tallest = placements.reduce((max, p) => Math.max(max, p.h), 0);
  for (let x = 1; x < cols; x++) {
    const run = longestRun((y) => between(cells[y][x - 1], cells[y][x]), rows);
    seamCol += seamPenalty(run, tallest, rows);
  }

  // Four-way junctions: four different cards touch one vertex.
  let crossJunction = 0;
  for (let y = 1; y < rows; y++) {
    for (let x = 1; x < cols; x++) {
      const tl = cells[y - 1][x - 1];
      const tr = cells[y - 1][x];
      const bl = cells[y][x - 1];
      const br = cells[y][x];
      if (between(tl, tr) && between(bl, br) && between(tl, bl) && between(tr, br)) {
        crossJunction++;
      }
    }
  }

  // Holes: empty cells with an occupied cell somewhere below in the column.
  // Ragged: range of column bottoms.
  let holes = 0;
  let minBottom = Number.POSITIVE_INFINITY;
  let maxBottom = 0;
  for (let x = 0; x < cols; x++) {
    let bottom = 0;
    for (let y = rows - 1; y >= 0; y--) {
      if (cells[y][x] !== EMPTY) {
        bottom = y + 1;
        break;
      }
    }
    for (let y = 0; y < bottom; y++) if (cells[y][x] === EMPTY) holes++;
    minBottom = Math.min(minBottom, bottom);
    maxBottom = Math.max(maxBottom, bottom);
  }
  const raggedRange = cols > 0 ? maxBottom - minBottom : 0;
  const raggedExcess = Math.max(0, raggedRange - RAGGED_FREE_UNITS);
  const ragged = raggedExcess * raggedExcess;

  // Twins: edge-adjacent pairs with identical footprint.
  const adjacent = new Set<string>();
  const notePair = (a: number, b: number) => {
    if (between(a, b)) adjacent.add(a < b ? `${a}:${b}` : `${b}:${a}`);
  };
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x > 0) notePair(cells[y][x - 1], cells[y][x]);
      if (y > 0) notePair(cells[y - 1][x], cells[y][x]);
    }
  }
  let twins = 0;
  for (const key of adjacent) {
    const [a, b] = key.split(":").map(Number);
    if (placements[a].w === placements[b].w && placements[a].h === placements[b].h) twins++;
  }

  // Balance: horizontal offset of the area centroid, normalised by width.
  let area = 0;
  let moment = 0;
  for (const p of placements) {
    const a = p.w * p.h;
    area += a;
    moment += a * (p.x + p.w / 2);
  }
  const balance = area > 0 ? Math.abs(moment / area - cols / 2) / cols : 0;

  const featureCount = placements.filter((p) => p.tier === "feature").length;
  const tierMix = Math.abs(featureCount - targetFeatures);

  const height = rows;

  const terms = {
    seamRow,
    seamCol,
    crossJunction,
    holes,
    ragged,
    twins,
    balance,
    tierMix,
    height,
  };
  const total = (Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).reduce(
    (sum, key) => sum + terms[key] * SCORE_WEIGHTS[key],
    0
  );
  return { ...terms, total };
}
