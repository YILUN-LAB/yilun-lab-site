import type { Size } from "./types";

export type Placed<T extends Size> = T & { x: number; y: number };

export interface Gap {
  x: number;
  y: number;
  /** Contiguous free cells from `x` rightwards on row `y`. */
  width: number;
}

/**
 * Occupancy grid `cols` wide that grows downward. Cards are placed in reading
 * order at the lowest row, then the lowest column, where they fit. The first
 * card therefore always lands at (0, 0).
 */
export class UnitGrid {
  private occupied: boolean[][] = [];

  constructor(readonly cols: number) {}

  get rows(): number {
    return this.occupied.length;
  }

  /** Independent copy, so a search can branch from one state. */
  clone(): UnitGrid {
    const copy = new UnitGrid(this.cols);
    copy.occupied = this.occupied.map((row) => row.slice());
    return copy;
  }

  private ensureRows(count: number): void {
    while (this.occupied.length < count) {
      this.occupied.push(new Array<boolean>(this.cols).fill(false));
    }
  }

  private isFree(x: number, y: number): boolean {
    return y >= this.occupied.length || !this.occupied[y][x];
  }

  fits(x: number, y: number, w: number, h: number): boolean {
    if (x < 0 || x + w > this.cols) return false;
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) {
        if (!this.isFree(col, row)) return false;
      }
    }
    return true;
  }

  /** Lowest, then leftmost, empty cell together with its free run to the right. */
  lowestGap(): Gap {
    for (let y = 0; ; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (!this.isFree(x, y)) continue;
        let width = 0;
        while (x + width < this.cols && this.isFree(x + width, y)) width++;
        return { x, y, width };
      }
    }
  }

  findSlot(w: number, h: number): { x: number; y: number } {
    if (w > this.cols) {
      throw new Error(`Editorial layout: item is wider (${w}) than the grid (${this.cols}).`);
    }
    for (let y = 0; ; y++) {
      for (let x = 0; x + w <= this.cols; x++) {
        if (this.fits(x, y, w, h)) return { x, y };
      }
    }
  }

  place<T extends Size>(size: T): Placed<T> {
    const { x, y } = this.findSlot(size.w, size.h);
    return this.placeAt(x, y, size);
  }

  /** Places at an explicit position; throws if any cell is already taken. */
  placeAt<T extends Size>(x: number, y: number, size: T): Placed<T> {
    if (!this.fits(x, y, size.w, size.h)) {
      throw new Error(`Ashlar: cannot place ${size.w}×${size.h} at (${x}, ${y}); cells are occupied.`);
    }
    this.block(x, y, size.w, size.h);
    return { ...size, x, y };
  }

  /**
   * Marks cells as taken without a card, so later cards skip them. Used to
   * leave a deliberate perimeter inset (a dropped or indented card).
   */
  block(x: number, y: number, w: number, h: number): void {
    this.ensureRows(y + h);
    for (let row = y; row < y + h; row++) {
      for (let col = x; col < x + w; col++) this.occupied[row][col] = true;
    }
  }
}

/** Convenience wrapper: place every size in order on a fresh grid. */
export function placeItems<T extends Size>(sizes: T[], cols: number): Placed<T>[] {
  const grid = new UnitGrid(cols);
  return sizes.map((size) => grid.place(size));
}
