import { useEffect, useState } from "react";
import type { HeroPlaybackMode } from "./FadingVideo";

export interface HeroPreviewOptions {
  mode: HeroPlaybackMode;
  clip: number;
  original: boolean;
}

/** Never mounted in production. Compare one variable at a time on the real page. */
export function HeroPerformanceControls({
  options,
  onChange,
}: {
  options: HeroPreviewOptions;
  onChange: (value: HeroPreviewOptions) => void;
}) {
  const [aurora, setAurora] = useState("automatic");
  const [glass, setGlass] = useState(true);
  const [stats, setStats] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => {
      const video = document.querySelector<HTMLVideoElement>("#top video");
      const quality = video?.getVideoPlaybackQuality?.();
      const source = video?.getAttribute("src");
      const request = performance.getEntriesByName(`hero-video:request:${source}`).at(-1);
      const first = performance.getEntriesByName(`hero-video:first-frame:${source}`).at(-1);
      const firstFrame =
        request && first && first.startTime >= request.startTime
          ? ` · first frame ${(first.startTime - request.startTime).toFixed(0)}ms`
          : "";
      setStats(
        video
          ? `${video.paused ? "paused" : "playing"} · ${video.currentTime.toFixed(2)}s · ${video.playbackRate.toFixed(2)}× · ${quality?.totalVideoFrames ?? 0} frames / ${quality?.droppedVideoFrames ?? 0} dropped${firstFrame}`
          : "poster"
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <aside
      className="fixed bottom-2 left-2 right-2 z-[100] w-fit max-w-[calc(100%-1rem)] rounded-lg border border-white/20 bg-black p-3 text-xs text-white"
      aria-label="Hero performance experiment"
    >
      <div className="flex flex-wrap gap-3">
        <label>
          Motion{" "}
          <select
            className="bg-zinc-900"
            value={options.mode}
            onChange={(e) => onChange({ ...options, mode: e.target.value as HeroPlaybackMode })}
          >
            <option value="settle">Settle on interaction</option>
            <option value="loop">Visible loop</option>
            <option value="still">Poster only</option>
          </select>
        </label>
        <label>
          Clip{" "}
          <select
            className="bg-zinc-900"
            value={options.clip}
            onChange={(e) => onChange({ ...options, clip: Number(e.target.value) })}
          >
            <option value={0}>1</option>
            <option value={1}>2</option>
            <option value={2}>3</option>
          </select>
        </label>
        <label>
          Asset{" "}
          <select
            className="bg-zinc-900"
            value={String(options.original)}
            onChange={(e) => onChange({ ...options, original: e.target.value === "true" })}
          >
            <option value="false">Optimized 1080p</option>
            <option value="true">Original 1080p</option>
          </select>
        </label>
        <label>
          Aurora{" "}
          <select
            className="bg-zinc-900"
            value={aurora}
            onChange={(e) => setAurora(e.target.value)}
          >
            <option value="automatic">Automatic</option>
            <option value="running">Original: always running</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
        <label>
          <input type="checkbox" checked={glass} onChange={(e) => setGlass(e.target.checked)} />{" "}
          Glass blur
        </label>
      </div>
      <output className="mt-2 block font-mono">{stats}</output>
      {aurora === "hidden" && <style>{`.aurora-blob { display: none !important; }`}</style>}
      {aurora === "running" && (
        <style>{`[data-sleeping] .aurora-blob { visibility: visible !important; animation-play-state: running !important; will-change: transform; }`}</style>
      )}
      {!glass && (
        <style>{`.liquid-glass, .liquid-glass-strong, .scroll-edge { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`}</style>
      )}
    </aside>
  );
}
