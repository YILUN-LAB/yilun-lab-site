import { useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import type { MotionValue } from "motion/react";

export type HeroPlaybackMode = "scene" | "loop" | "still";
interface FadingVideoProps {
  src: string;
  poster: string;
  mode?: HeroPlaybackMode;
  exposure?: MotionValue<number>;
  className?: string;
  style?: CSSProperties;
  glowRef?: RefObject<HTMLElement | null>;
}
type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const PLAYBACK_RATE = 0.65;

/** Decorative media: navigation owns playback; there are no user controls. */
export function FadingVideo({
  src,
  poster,
  mode = "scene",
  exposure,
  className = "",
  style = {},
  glowRef,
}: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let inView = false;
    let disposed = false;
    let blocked = false;
    let previouslyEligible = false;
    let pendingPlay = false;
    let revealed = false;
    let fadingOut = false;
    let firstFrame = 0;
    let restartTimer: ReturnType<typeof setTimeout> | undefined;
    const amount = () => Math.max(0, Math.min(1, exposure?.get() ?? 1));
    const transitioning = () => mode === "scene" && amount() < 0.999;
    const eligible = () =>
      !disposed &&
      inView &&
      amount() > 0 &&
      !document.hidden &&
      mode !== "still" &&
      !motion.matches &&
      !connection?.saveData &&
      !/^(slow-)?2g$/.test(connection?.effectiveType ?? "");
    const opacity = (value: number, duration = 500) => {
      video.style.transition = `opacity ${duration}ms ease-out`;
      video.style.opacity = String(value);
      if (glowRef?.current) {
        glowRef.current.style.transition = `opacity ${duration}ms ease-out`;
        glowRef.current.style.opacity = String(value);
      }
    };
    const clearRestart = () => {
      clearTimeout(restartTimer);
      restartTimer = undefined;
    };
    const stop = () => {
      clearRestart();
      if (!video.paused) video.pause();
      if (revealed && fadingOut) opacity(1);
      fadingOut = false;
    };
    const sync = () => {
      const active = eligible();
      if (active && !previouslyEligible) blocked = false;
      previouslyEligible = active;
      if (!active) {
        stop();
        return;
      }
      if (blocked) return;
      if (transitioning()) {
        clearRestart();
        if (fadingOut) opacity(1);
        fadingOut = false;
        // A naturally ended clip remains a still until the scene is fully back.
        if (video.ended) return;
      }
      if (!video.getAttribute("src")) {
        performance.mark(`hero-video:request:${src}`);
        video.src = src;
        video.load();
      }
      // The same continuous scene value drives deceleration and acceleration.
      // Never seek when leaving or re-entering: preserve the held frame.
      video.playbackRate =
        mode === "scene" ? 0.1 + (PLAYBACK_RATE - 0.1) * amount() ** 2 : PLAYBACK_RATE;
      if (pendingPlay || restartTimer !== undefined || !video.paused) return;
      if (video.ended) {
        video.currentTime = 0;
        opacity(0, 0);
      }
      pendingPlay = true;
      void video
        .play()
        .then(() => {
          pendingPlay = false;
          if (!disposed && !eligible()) video.pause();
        })
        .catch((error: unknown) => {
          pendingPlay = false;
          if (!disposed && eligible()) {
            if (error instanceof DOMException && error.name === "AbortError") {
              sync();
              return;
            }
            blocked = true;
          }
        });
    };
    const reveal = () => {
      if (!eligible()) return;
      if (!revealed) performance.mark(`hero-video:first-frame:${src}`);
      opacity(1, revealed ? 400 : 1600);
      revealed = true;
    };
    const onPlaying = () => {
      if (!eligible()) {
        stop();
        return;
      }
      if (typeof video.requestVideoFrameCallback === "function") {
        if (firstFrame) video.cancelVideoFrameCallback(firstFrame);
        firstFrame = video.requestVideoFrameCallback(reveal);
      } else reveal();
    };
    const onTime = () => {
      if (transitioning() || video.paused) return;
      const left = video.duration - video.currentTime;
      if (Number.isFinite(left) && left > 0 && left <= 0.55 && !fadingOut) {
        fadingOut = true;
        opacity(0);
      }
    };
    const onEnded = () => {
      if (transitioning() || !eligible()) {
        stop();
        return;
      }
      opacity(0, 0);
      clearRestart();
      restartTimer = setTimeout(() => {
        restartTimer = undefined;
        if (!eligible()) return;
        video.currentTime = 0;
        fadingOut = false;
        sync();
      }, 100);
    };
    const onError = () => {
      blocked = true;
      stop();
      opacity(0, 0);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(video.closest("section") ?? video);
    const unsubscribe = exposure?.on("change", sync);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    connection?.addEventListener("change", sync);
    return () => {
      disposed = true;
      clearRestart();
      observer.disconnect();
      unsubscribe?.();
      if (firstFrame && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(firstFrame);
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      connection?.removeEventListener("change", sync);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.style.opacity = "0";
    };
  }, [src, mode, exposure, glowRef]);
  return (
    <video
      ref={videoRef}
      poster={poster}
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
