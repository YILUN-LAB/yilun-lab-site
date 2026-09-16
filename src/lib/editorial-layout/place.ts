import type { Size } from "./types";

export type Placed<T extends Size> = T & { x: number; y: number };

/**
 * Reading-order skyline fill. Each item takes the free position with the
 * lowest row, then the lowest column, where its whole rectangle fits. The
 * first item therefore always lands at (0, 0). The grid is `cols` wide and
 * grows downward as needed.
 */
export function placeItems<T extends Size>(sizes: T[], cols: number): Placed<T>[] {
  // occupied[y][x] is true when a card covers that cell. Rows are added lazily.
  const occupied: boolean[][] = [];
  const ensureRows = (count: number) => {
    while (occupied.length < count) occupied.push(new Array<boolean>(cols).fill(false));
  };
  const fits = (x: number, y: number, w: number, h: number) => {
    ensureRows(y + h);
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (occupied[row][col]) return false;
      }
    }
    return true;
  };
  const mark = (x: number, y: number, w: number, h: number) => {
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) occupied[row][col] = true;
    }
  };

  const placed: Placed<T>[] = [];
  for (const size of sizes) {
    if (size.w > cols) {
      throw new Error(`Editorial layout: item is wider (${size.w}) than the grid (${cols}).`);
    }
    let y = 0;
    let done = false;
    while (!done) {
      for (let x = 0; x + size.w <= cols; x++) {
        if (fits(x, y, size.w, size.h)) {
          mark(x, y, size.w, size.h);
          placed.push({ ...size, x, y });
          done = true;
          break;
        }
      }
      y++;
    }
  }
  return placed;
}
