import { useEffect, useState } from "react";

/** Read-only developer instrumentation; never mounted in production. */
export function HeroPerformanceReadout() {
  const [stats, setStats] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => {
      const hero = document.getElementById("top");
      const video = hero?.querySelector("video");
      const quality = video?.getVideoPlaybackQuality?.();
      setStats(
        video
          ? `${hero?.dataset.heroState ?? "inside"} · ${video.paused ? "static" : "playing"} · ${video.currentTime.toFixed(2)}s · ${video.playbackRate.toFixed(2)}× · ${quality?.totalVideoFrames ?? 0} frames / ${quality?.droppedVideoFrames ?? 0} dropped`
          : "poster"
      );
    }, 150);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <output
      data-hero-debug
      className="pointer-events-none fixed bottom-2 left-2 z-[100] rounded-md bg-black/80 px-3 py-2 font-mono text-[10px] text-white/70"
      aria-live="off"
    >
      {stats}
    </output>
  );
}
