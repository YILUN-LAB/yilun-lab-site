import { describe, expect, it } from "vitest";
import { listedProjects, nextWorkFor } from "../src/lib/data/project-sequence";

const project = (id: string, unlisted = false) => ({ id, data: { unlisted } });
const sorted = [project("a"), project("hidden", true), project("b"), project("c")];

describe("project sequence", () => {
  it("keeps unlisted projects off public listings", () => {
    expect(listedProjects(sorted).map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("skips unlisted projects in next-work links", () => {
    expect(nextWorkFor(sorted, sorted[0]).id).toBe("b");
    expect(nextWorkFor(sorted, sorted[3]).id).toBe("a");
  });

  it("points an unlisted project to the next listed one", () => {
    expect(nextWorkFor(sorted, sorted[1]).id).toBe("b");
  });

  it("wraps an unlisted last project to the first listed one", () => {
    const tail = [project("a"), project("b"), project("hidden", true)];
    expect(nextWorkFor(tail, tail[2]).id).toBe("a");
  });
});
