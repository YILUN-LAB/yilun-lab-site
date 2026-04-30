import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

export function FadingVideo({ src, className = "", style = {} }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function fadeTo(target: number, duration = FADE_MS) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const from = parseFloat(video!.style.opacity || "0") || 0;
      const delta = target - from;
      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        video!.style.opacity = String(from + delta * t);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      }
      rafRef.current = requestAnimationFrame(step);
    }

    function onLoaded() {
      video!.style.opacity = "0";
      const p = video!.play();
      if (p && p.catch) p.catch(() => {});
      fadeTo(1);
    }

    function onTime() {
      const dur = video!.duration;
      if (!isFinite(dur) || dur <= 0) return;
      const left = dur - video!.currentTime;
      if (!fadingOutRef.current && left <= FADE_OUT_LEAD && left > 0) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    }

    function onEnded() {
      video!.style.opacity = "0";
      window.setTimeout(() => {
        try {
          video!.currentTime = 0;
          const p = video!.play();
          if (p && p.catch) p.catch(() => {});
        } catch {
          /* ignore */
        }
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    }

    video.style.opacity = "0";
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) onLoaded();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
