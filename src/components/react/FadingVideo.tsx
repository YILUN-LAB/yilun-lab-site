import { useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import type { MotionValue } from "motion/react";

export type HeroPlaybackMode = "scene" | "loop" | "still";
interface FadingVideoProps {
  src: string;
  poster: string;
  mode?: HeroPlaybackMode;
  exposure?: MotionValue<number>;
  /** Normal-speed frame presented, or a deliberate static/error fallback. */
  onPlaybackReady?: (ready: boolean) => void;
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
  onPlaybackReady,
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
    let playing = false;
    let playbackReady = false;
    let revealed = false;
    let fadingOut = false;
    let firstFrame = 0;
    let firstFrameAtFullSpeed = false;
    let restartTimer: ReturnType<typeof setTimeout> | undefined;
    const amount = () => Math.max(0, Math.min(1, exposure?.get() ?? 1));
    const transitioning = () => mode === "scene" && amount() < 0.999;
    const staticPolicy = () =>
      mode === "still" ||
      motion.matches ||
      !!connection?.saveData ||
      /^(slow-)?2g$/.test(connection?.effectiveType ?? "");
    const reportReady = (ready: boolean) => {
      if (disposed || ready === playbackReady) return;
      playbackReady = ready;
      onPlaybackReady?.(ready);
    };
    const eligible = () =>
      !disposed && inView && amount() > 0 && !document.hidden && !staticPolicy();
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
        reportReady(staticPolicy());
        return;
      }
      if (blocked) {
        reportReady(true);
        return;
      }
      if (amount() < 1) reportReady(false);
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
      if (playing && !video.paused && amount() === 1 && !playbackReady) requestFrame();
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
            reportReady(true);
          }
        });
    };
    const reveal = () => {
      if (!eligible()) return;
      if (!revealed) performance.mark(`hero-video:first-frame:${src}`);
      opacity(1, revealed ? 400 : 1600);
      revealed = true;
    };
    const readyAtFullSpeed = () => {
      if (eligible() && playing && !video.paused && amount() === 1) reportReady(true);
    };
    const requestFrame = () => {
      if (typeof video.requestVideoFrameCallback !== "function") return;
      const atFullSpeed = amount() === 1;
      // Replace a low-speed callback when acceleration completes, so the UI
      // waits for a frame requested at the final speed rather than a timer.
      if (firstFrame) {
        if (!atFullSpeed || firstFrameAtFullSpeed) return;
        video.cancelVideoFrameCallback(firstFrame);
      }
      firstFrameAtFullSpeed = atFullSpeed;
      firstFrame = video.requestVideoFrameCallback(() => {
        firstFrame = 0;
        reveal();
        if (atFullSpeed) readyAtFullSpeed();
      });
    };
    const onPlaying = () => {
      if (!eligible()) {
        stop();
        return;
      }
      playing = true;
      if (typeof video.requestVideoFrameCallback === "function") {
        requestFrame();
      } else {
        reveal();
        readyAtFullSpeed();
      }
    };
    const onWaiting = () => {
      playing = false;
      reportReady(false);
    };
    const onTime = () => {
      if (typeof video.requestVideoFrameCallback !== "function") readyAtFullSpeed();
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
      reportReady(true);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(video.closest("section") ?? video);
    const unsubscribe = exposure?.on("change", sync);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("pause", onWaiting);
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
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("pause", onWaiting);
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
  }, [src, mode, exposure, glowRef, onPlaybackReady]);
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
