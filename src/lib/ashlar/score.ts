import type { Placement, ScoreBreakdown, Tier } from "./types";

/**
 * Penalty weights. Lower total is better. These are the main tuning surface;
 * the terms themselves are documented in docs/editorial-grid.md.
 */
export const SCORE_WEIGHTS = {
  seamRow: 1,
  seamCol: 1,
  crossJunction: 3,
  holes: 10,
  ragged: 2,
  skyline: 3,
  twins: 1.5,
  narrow: 1.5,
  edges: 1,
  inset: 1,
  balance: 6,
  tierMix: 8,
  height: 0.5,
} as const;

/** Cards narrower than this (in units) count as narrow on tablet and desktop. */
const COMFORT_WIDTH = 4;

/** Extra penalty when a vertical seam runs the entire height. */
const FULL_SEAM_PENALTY = 4;
/** A full-width seam directly under the lead is a deliberate hero break. */
const HERO_BREAK_PENALTY = 2;
/** Any other full-width seam reads as a row. Sized above a 12-wide run's excess². */
const FULL_ROW_PENALTY = 48;
/** Fraction of the width a horizontal seam may run before it reads as a row. */
const SEAM_ROW_FREE_FRACTION = 0.5;
/** Bottom-edge range (in units) that still reads as intentional. */
const RAGGED_FREE_UNITS = 2;
/** Distinct bottom levels that still read as a simple stair. */
const SKYLINE_FREE_LEVELS = 2;

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

/** Empty cells not connected to the outside of the bounding box via empty cells. */
function countEnclosedCells(cells: number[][], cols: number, rows: number): number {
  if (rows === 0) return 0;
  const seen: boolean[][] = Array.from({ length: rows }, () =>
    new Array<boolean>(cols).fill(false)
  );
  const stack: [number, number][] = [];
  const push = (y: number, x: number) => {
    if (y < 0 || y >= rows || x < 0 || x >= cols) return;
    if (seen[y][x] || cells[y][x] !== EMPTY) return;
    seen[y][x] = true;
    stack.push([y, x]);
  };
  for (let x = 0; x < cols; x++) {
    push(0, x);
    push(rows - 1, x);
  }
  for (let y = 0; y < rows; y++) {
    push(y, 0);
    push(y, cols - 1);
  }
  let exterior = 0;
  while (stack.length > 0) {
    const [y, x] = stack.pop() as [number, number];
    exterior++;
    push(y - 1, x);
    push(y + 1, x);
    push(y, x - 1);
    push(y, x + 1);
  }
  let empty = 0;
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) if (cells[y][x] === EMPTY) empty++;
  return empty - exterior;
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

export type ScoreWeights = { [K in keyof typeof SCORE_WEIGHTS]: number };

export interface ScoreOptions {
  /**
   * True while a layout is still being built: the bottom edge is not final,
   * so `ragged` and `skyline` are left at 0.
   */
  partial?: boolean;
  /** Per-term overrides of `SCORE_WEIGHTS`, for tuning. */
  weights?: Partial<ScoreWeights>;
}

export function scorePlacement(
  placements: Placement[],
  cols: number,
  wantedTiers: Tier[] = [],
  options: ScoreOptions = {}
): ScoreBreakdown {
  const partial = options.partial === true;
  const { cells, rows } = buildCellMap(placements, cols);
  const between = (a: number, b: number) => a !== EMPTY && b !== EMPTY && a !== b;

  // Horizontal seams: card meets a different card across line y. A full-width
  // seam directly under the lead is a deliberate hero break and stays cheap;
  // any other full-width seam reads as a row and costs much more.
  let seamRow = 0;
  const rowFree = cols * SEAM_ROW_FREE_FRACTION;
  const heroBottom = placements.length > 0 ? placements[0].y + placements[0].h : -1;
  for (let y = 1; y < rows; y++) {
    const run = longestRun((x) => between(cells[y - 1][x], cells[y][x]), cols);
    const emptyRow = cells[y].every((id) => id === EMPTY);
    if (emptyRow) {
      seamRow += FULL_ROW_PENALTY;
      continue;
    }
    if (run >= cols) {
      seamRow += y === heroBottom ? HERO_BREAK_PENALTY : FULL_ROW_PENALTY;
      continue;
    }
    const excess = Math.max(0, run - rowFree);
    seamRow += excess * excess;
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

  // Holes: empty cells that cannot reach the outside of the bounding box
  // through other empty cells. Perimeter insets (a dropped or indented card)
  // stay open to the outside and are therefore not holes.
  const holes = countEnclosedCells(cells, cols, rows);

  // Ragged: range of column bottoms.
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
    minBottom = Math.min(minBottom, bottom);
    maxBottom = Math.max(maxBottom, bottom);
  }

  // Inset: empty cells more than the free ragged range above the deepest
  // bottom (drops, indents, notches, holes). Each one costs a little, so the
  // search only spends them where they break a seam or a flush edge.
  let inset = 0;
  const insetLimit = maxBottom - RAGGED_FREE_UNITS;
  for (let y = 0; y < insetLimit; y++) {
    for (let x = 0; x < cols; x++) if (cells[y][x] === EMPTY) inset++;
  }

  // Edges: straight runs along the outer silhouette read as a frame. The top
  // edge is free up to half the width; the left and right edges are free up
  // to half the height, or the tallest card if that is more (the lead has to
  // sit somewhere).
  const topRun = longestRun((x) => cells[0]?.[x] !== EMPTY && cells[0]?.[x] !== undefined, cols);
  const leftRun = longestRun((y) => cells[y][0] !== EMPTY, rows);
  const rightRun = longestRun((y) => cells[y][cols - 1] !== EMPTY, rows);
  const sideFree = Math.max(tallest, rows * SEAM_ROW_FREE_FRACTION);
  const edgeExcess = (run: number, free: number) => {
    const excess = Math.max(0, run - free);
    return excess * excess;
  };
  const edges =
    edgeExcess(topRun, rowFree) + edgeExcess(leftRun, sideFree) + edgeExcess(rightRun, sideFree);
  const raggedRange = cols > 0 ? maxBottom - minBottom : 0;
  const raggedExcess = Math.max(0, raggedRange - RAGGED_FREE_UNITS);
  const ragged = raggedExcess * raggedExcess;

  // Skyline: the bottom edge should read as a simple stair. Count empty runs
  // boxed in by cards on both sides (notches), rows where a card stands alone
  // with space on both edges (teeth), plus any distinct bottom levels beyond two.
  let notches = 0;
  for (let y = 0; y < rows; y++) {
    let x = 0;
    let emptyAtLeft = false;
    let emptyAtRight = false;
    while (x < cols) {
      if (cells[y][x] !== EMPTY) {
        x++;
        continue;
      }
      const start = x;
      while (x < cols && cells[y][x] === EMPTY) x++;
      if (start === 0) emptyAtLeft = true;
      if (x === cols) emptyAtRight = true;
      if (start > 0 && x < cols) notches++;
    }
    // A lone card with space on both edges only reads as a tooth at the bottom.
    if (emptyAtLeft && emptyAtRight && y >= minBottom) notches++;
  }
  const bottoms = new Set<number>();
  for (let x = 0; x < cols; x++) {
    for (let y = rows - 1; y >= 0; y--) {
      if (cells[y][x] !== EMPTY) {
        bottoms.add(y + 1);
        break;
      }
    }
  }
  const skyline = notches + Math.max(0, bottoms.size - SKYLINE_FREE_LEVELS);

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

  // Tier mix: cards that could not take their assigned tier and borrowed a
  // neighbouring size instead. Valid on partial layouts too.
  const tierMix = placements.filter(
    (p, i) => wantedTiers[i] !== undefined && p.tier !== wantedTiers[i]
  ).length;

  // Narrow: cards under the comfortable width, only where the grid is wide
  // enough for that to be a choice (mobile cards always span the grid).
  const narrow =
    cols >= 2 * COMFORT_WIDTH ? placements.filter((p) => p.w < COMFORT_WIDTH).length : 0;

  const height = rows;

  const terms = {
    seamRow,
    seamCol,
    crossJunction,
    holes,
    ragged: partial ? 0 : ragged,
    skyline: partial ? 0 : skyline,
    twins,
    narrow,
    edges,
    inset,
    balance,
    tierMix,
    height,
  };
  const weights: ScoreWeights = { ...SCORE_WEIGHTS, ...options.weights };
  const total = (Object.keys(SCORE_WEIGHTS) as (keyof ScoreWeights)[]).reduce(
    (sum, key) => sum + terms[key] * weights[key],
    0
  );
  return { ...terms, total };
}
