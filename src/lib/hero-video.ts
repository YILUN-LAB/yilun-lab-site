import { HERO_VIDEO_ASSETS } from "./hero-video-assets";

/** Reuse the pre-paint selection; hydration must never draw another clip. */
export function getInitialHeroVideo(): string {
  const selected =
    typeof document === "undefined" ? undefined : document.documentElement.dataset.heroVideo;
  return (HERO_VIDEO_ASSETS.find((asset) => asset.original === selected) ?? HERO_VIDEO_ASSETS[0])
    .original;
}
