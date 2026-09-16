import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import bootstrap from "../src/lib/hero-bootstrap.js?raw";
import { HERO_VIDEO_ASSETS } from "../src/lib/hero-video-assets";
import { getInitialHeroVideo } from "../src/lib/hero-video";

// Execute exactly the classic script shipped inline, with a real DOM/storage.
const runBootstrap = new Function(bootstrap);
const resetDocumentSelection = () => {
  delete document.documentElement.dataset.heroVideo;
  document.documentElement.style.removeProperty("--hero-poster");
  document.head.querySelectorAll('link[rel="preload"]').forEach((link) => link.remove());
};
beforeEach(() => {
  localStorage.clear();
  resetDocumentSelection();
  const script = document.createElement("script");
  script.dataset.heroAssets = JSON.stringify(HERO_VIDEO_ASSETS);
  vi.spyOn(document, "currentScript", "get").mockReturnValue(script);
});
afterEach(() => {
  vi.restoreAllMocks();
  resetDocumentSelection();
});

describe("hero pre-paint selection", () => {
  it.each(HERO_VIDEO_ASSETS)(
    "uses $original for both the initial poster and hydrated video",
    (asset) => {
      localStorage.setItem("yilun-hero-queue", JSON.stringify([asset.original]));
      runBootstrap();
      expect(document.documentElement.style.getPropertyValue("--hero-poster")).toBe(
        `url("${asset.poster}")`
      );
      expect(document.head.querySelector('link[rel="preload"]')).toHaveAttribute(
        "href",
        asset.poster
      );
      expect(getInitialHeroVideo()).toBe(asset.original);
      expect(getInitialHeroVideo()).toBe(asset.original);
      expect(localStorage.getItem("yilun-hero-queue")).toBe("[]");
    }
  );

  it("consumes one queue entry per document even if initialization runs twice", () => {
    const originals = HERO_VIDEO_ASSETS.map((asset) => asset.original);
    localStorage.setItem("yilun-hero-queue", JSON.stringify(originals));
    runBootstrap();
    runBootstrap();
    expect(getInitialHeroVideo()).toBe(originals[0]);
    expect(JSON.parse(localStorage.getItem("yilun-hero-queue")!)).toEqual(originals.slice(1));
    expect(document.head.querySelectorAll('link[rel="preload"]')).toHaveLength(1);
  });

  it.each(["null", '\"oops\"', "{}", "invalid", '[null, 7, \"/unknown.mp4\"]'])(
    "recovers from malformed queue %s",
    (value) => {
      localStorage.setItem("yilun-hero-queue", value);
      runBootstrap();
      const asset = HERO_VIDEO_ASSETS.find((asset) => asset.original === getInitialHeroVideo())!;
      expect(document.documentElement.style.getPropertyValue("--hero-poster")).toContain(
        asset.poster
      );
    }
  );

  it("rotates all three clips and avoids repeating across queue boundaries", () => {
    const visit = () => {
      resetDocumentSelection();
      runBootstrap();
      return getInitialHeroVideo();
    };
    const first = Array.from({ length: 3 }, visit);
    expect(new Set(first).size).toBe(3);
    expect(visit()).not.toBe(first[2]);
  });

  it("keeps poster and video aligned when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    runBootstrap();
    const asset = HERO_VIDEO_ASSETS.find((asset) => asset.original === getInitialHeroVideo())!;
    expect(document.documentElement.style.getPropertyValue("--hero-poster")).toContain(
      asset.poster
    );
  });

  it("uses the default poster's video if bootstrap is missing or invalid, without drawing randomly", () => {
    expect(getInitialHeroVideo()).toBe(HERO_VIDEO_ASSETS[0].original);
    document.documentElement.dataset.heroVideo = "/invalid.mp4";
    expect(getInitialHeroVideo()).toBe(HERO_VIDEO_ASSETS[0].original);
    expect(localStorage.getItem("yilun-hero-queue")).toBeNull();
  });
});
