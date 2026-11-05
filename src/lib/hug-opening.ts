/**
 * Hug's opening as one number: 0 is fully open, 0.5 half-open, 1 gathered.
 * The digital model only defines the three states; values in between are
 * interpolated for illustration, the way the proposed control is meant to
 * change brightness and color temperature gradually with the opening.
 */

export const STATE_PROGRESS = [0, 0.5, 1] as const;

interface StateLike {
  kelvin: number;
  /** "r g b" */
  glow: string;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** The segment (0 = open to half-open, 1 = half-open to gathered) and the position within it. */
function segment(progress: number): [number, number] {
  const p = clamp(progress);
  return p <= 0.5 ? [0, p / 0.5] : [1, (p - 0.5) / 0.5];
}

export function kelvinAt(states: StateLike[], progress: number): number {
  const [i, t] = segment(progress);
  const kelvin = states[i].kelvin + (states[i + 1].kelvin - states[i].kelvin) * t;
  return Math.round(kelvin / 10) * 10;
}

export function glowAt(states: StateLike[], progress: number): string {
  const [i, t] = segment(progress);
  const from = states[i].glow.split(" ").map(Number);
  const to = states[i + 1].glow.split(" ").map(Number);
  return from.map((channel, c) => Math.round(channel + (to[c] - channel) * t)).join(" ");
}

/** Weights of the half-open and gathered morph targets, relative to the open base mesh. */
export function morphWeights(progress: number): [number, number] {
  const [i, t] = segment(progress);
  return i === 0 ? [t, 0] : [1 - t, t];
}

export function nearestStateIndex(progress: number): number {
  return Math.round(clamp(progress) * 2);
}
