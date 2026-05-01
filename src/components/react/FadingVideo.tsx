import { useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
  glowRef?: RefObject<HTMLElement | null>;
}

const FADE_IN_MS = 2000;
const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;
const PLAYBACK_RATE = 0.65;

export function FadingVideo({ src, className = "", style = {}, glowRef }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function setOpacity(value: string) {
      video!.style.opacity = value;
      if (glowRef?.current) glowRef.current.style.opacity = value;
    }

    let fadeGen = 0;
    function fadeTo(target: number, duration = FADE_MS) {
      const myGen = ++fadeGen;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const from = parseFloat(video!.style.opacity || "0") || 0;
      const delta = target - from;
      function step(now: number) {
        if (myGen !== fadeGen) return;
        const t = Math.min(1, (now - start) / duration);
        setOpacity(String(from + delta * t));
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      }
      rafRef.current = requestAnimationFrame(step);
    }

    function onLoaded() {
      setOpacity("0");
      video!.playbackRate = PLAYBACK_RATE;
      const p = video!.play();
      if (p && p.catch) p.catch(() => {});
      fadeTo(1, FADE_IN_MS);
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
      setOpacity("0");
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

    setOpacity("0");
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) onLoaded();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      fadingOutRef.current = false;
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [src, glowRef]);

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
