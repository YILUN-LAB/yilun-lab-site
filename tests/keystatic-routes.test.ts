import { describe, it, expect } from "vitest";
import { getProjectSlugFromPath } from "../src/lib/keystatic-routes";

describe("getProjectSlugFromPath", () => {
  it("extracts the slug from a project edit URL", () => {
    expect(
      getProjectSlugFromPath(
        "/keystatic/branch/staging/collection/projects/item/true-self"
      )
    ).toBe("true-self");
  });

  it("handles trailing slash", () => {
    expect(
      getProjectSlugFromPath(
        "/keystatic/branch/staging/collection/projects/item/true-self/"
      )
    ).toBe("true-self");
  });

  it("works on any branch name", () => {
    expect(
      getProjectSlugFromPath(
        "/keystatic/branch/main/collection/projects/item/human-permeability"
      )
    ).toBe("human-permeability");
  });

  it("returns null on the branch root", () => {
    expect(getProjectSlugFromPath("/keystatic/branch/staging/")).toBeNull();
  });

  it("returns null on the projects collection list", () => {
    expect(
      getProjectSlugFromPath("/keystatic/branch/staging/collection/projects")
    ).toBeNull();
    expect(
      getProjectSlugFromPath("/keystatic/branch/staging/collection/projects/")
    ).toBeNull();
  });

  it("returns null on a different collection", () => {
    expect(
      getProjectSlugFromPath(
        "/keystatic/branch/staging/collection/posts/item/some-post"
      )
    ).toBeNull();
  });

  it("returns null outside the admin", () => {
    expect(getProjectSlugFromPath("/projects/true-self")).toBeNull();
    expect(getProjectSlugFromPath("/")).toBeNull();
  });
});
