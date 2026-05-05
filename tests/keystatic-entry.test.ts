import { describe, it, expect } from "vitest";
import { getKeystaticEntryRedirect } from "../src/lib/keystatic-entry";

describe("getKeystaticEntryRedirect", () => {
  it("redirects /keystatic to /keystatic/branch/<branch>/", () => {
    expect(getKeystaticEntryRedirect("/keystatic", "staging")).toBe(
      "/keystatic/branch/staging/"
    );
  });

  it("redirects /keystatic/ to /keystatic/branch/<branch>/", () => {
    expect(getKeystaticEntryRedirect("/keystatic/", "staging")).toBe(
      "/keystatic/branch/staging/"
    );
  });

  it("returns null when already on a /keystatic/branch/... URL", () => {
    expect(
      getKeystaticEntryRedirect("/keystatic/branch/staging/", "staging")
    ).toBeNull();
    expect(
      getKeystaticEntryRedirect("/keystatic/branch/main/projects/foo", "staging")
    ).toBeNull();
  });

  it("returns null for other Keystatic sub-routes", () => {
    expect(
      getKeystaticEntryRedirect("/keystatic/repo/something", "staging")
    ).toBeNull();
  });

  it("falls back to 'main' when branch arg is empty / undefined", () => {
    expect(getKeystaticEntryRedirect("/keystatic", "")).toBe(
      "/keystatic/branch/main/"
    );
    expect(getKeystaticEntryRedirect("/keystatic", undefined)).toBe(
      "/keystatic/branch/main/"
    );
  });
});
