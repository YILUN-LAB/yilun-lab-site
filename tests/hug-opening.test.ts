import { describe, expect, it } from "vitest";
import {
  glowAt,
  kelvinAt,
  morphWeights,
  nearestStateIndex,
  STATE_PROGRESS,
} from "../src/lib/hug-opening";
import { hug } from "../src/lib/data/hug";

const states = hug.states.items;

describe("Hug opening", () => {
  it("places open, half-open and gathered at 0, 0.5 and 1", () => {
    expect(STATE_PROGRESS).toEqual([0, 0.5, 1]);
  });

  it("matches each state's color temperature exactly", () => {
    STATE_PROGRESS.forEach((progress, index) => {
      expect(kelvinAt(states, progress)).toBe(states[index].kelvin);
    });
  });

  it("warms gradually between states", () => {
    expect(kelvinAt(states, 0.25)).toBe(3500);
    expect(kelvinAt(states, 0.75)).toBe(2600);
  });

  it("blends the glow color between neighbouring states", () => {
    expect(glowAt(states, 0)).toBe(states[0].glow);
    expect(glowAt(states, 1)).toBe(states[2].glow);
    expect(glowAt(states, 0.25)).toBe("255 195 135");
  });

  it("drives the half-open target first, then hands over to gathered", () => {
    expect(morphWeights(0)).toEqual([0, 0]);
    expect(morphWeights(0.25)).toEqual([0.5, 0]);
    expect(morphWeights(0.5)).toEqual([1, 0]);
    expect(morphWeights(0.75)).toEqual([0.5, 0.5]);
    expect(morphWeights(1)).toEqual([0, 1]);
  });

  it("clamps progress outside 0 to 1", () => {
    expect(morphWeights(-1)).toEqual([0, 0]);
    expect(kelvinAt(states, 2)).toBe(2200);
  });

  it("finds the nearest state", () => {
    expect(nearestStateIndex(0.2)).toBe(0);
    expect(nearestStateIndex(0.3)).toBe(1);
    expect(nearestStateIndex(0.9)).toBe(2);
  });
});
