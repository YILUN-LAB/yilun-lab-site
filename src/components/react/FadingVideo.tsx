import { useEffect, useRef, useState } from "react";
import type { CSSProperties, RefObject } from "react";

export type HeroPlaybackMode = "loop" | "settle" | "still";
interface FadingVideoProps {
  src: string;
  poster: string;
  mode?: HeroPlaybackMode;
  className?: string;
  style?: CSSProperties;
  glowRef?: RefObject<HTMLElement | null>;
}

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };
const PLAYBACK_RATE = 0.65;
const SETTLE_MS = 1600;

export function FadingVideo({
  src,
  poster,
  mode = "settle",
  className = "",
  style = {},
  glowRef,
}: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const hero = video.closest("section");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    let inView = false;
    let disposed = false;
    let manualPause = false;
    let explicitPlay = false;
    let settled = false;
    let settling = false;
    let pendingPlay = false;
    let revealed = false;
    let fadingOut = false;
    let frame = 0;
    let firstFrame = 0;
    let restartTimer: ReturnType<typeof setTimeout> | undefined;

    const preferStill = () =>
      mode === "still" ||
      motion.matches ||
      connection?.saveData ||
      /^(slow-)?2g$/.test(connection?.effectiveType ?? "");
    const shouldPlay = () =>
      !disposed &&
      inView &&
      !document.hidden &&
      !manualPause &&
      !settled &&
      (explicitPlay || !preferStill());
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
      cancelAnimationFrame(frame);
      frame = 0;
      if (settling) settled = true;
      settling = false;
      video.pause();
      setRunning(false);
      // Never leave a stopped frame halfway through the loop's fade-out.
      if (revealed) opacity(1);
      fadingOut = false;
    };
    const play = () => {
      if (!shouldPlay()) {
        stop();
        return;
      }
      if (pendingPlay || restartTimer !== undefined) return;
      if (!video.getAttribute("src")) {
        performance.mark(`hero-video:request:${src}`);
        video.src = src;
        video.load();
      }
      if (!video.paused) return;
      video.playbackRate = PLAYBACK_RATE;
      pendingPlay = true;
      void video
        .play()
        .then(() => {
          pendingPlay = false;
          if (!disposed && !shouldPlay()) video.pause();
        })
        .catch((error: unknown) => {
          pendingPlay = false;
          if (!disposed && shouldPlay()) {
            // A fast hide/show can interrupt a pending play without denying it.
            if (error instanceof DOMException && error.name === "AbortError") {
              play();
              return;
            }
            manualPause = true;
            setRunning(false);
          }
        });
    };
    const reveal = () => {
      if (!shouldPlay()) return;
      if (!revealed) performance.mark(`hero-video:first-frame:${src}`);
      opacity(1, revealed ? 500 : 2000);
      revealed = true;
    };
    const onPlaying = () => {
      if (!shouldPlay()) {
        stop();
        return;
      }
      setRunning(true);
      // Reveal only after an actual decoded frame, never merely loaded metadata.
      if (typeof video.requestVideoFrameCallback === "function") {
        if (firstFrame) video.cancelVideoFrameCallback(firstFrame);
        firstFrame = video.requestVideoFrameCallback(reveal);
      } else reveal();
    };
    const onTime = () => {
      if (settling || settled || video.paused) return;
      const left = video.duration - video.currentTime;
      if (Number.isFinite(left) && left > 0 && left <= 0.55 && !fadingOut) {
        fadingOut = true;
        opacity(0);
      }
    };
    const onEnded = () => {
      if (settling) {
        settled = true;
        stop();
        return;
      }
      if (!shouldPlay()) {
        stop();
        return;
      }
      opacity(0, 0);
      clearRestart();
      restartTimer = setTimeout(() => {
        restartTimer = undefined;
        if (!shouldPlay()) return;
        video.currentTime = 0;
        fadingOut = false;
        play();
      }, 100);
    };
    const settle = () => {
      if (mode !== "settle" || settled || settling || manualPause) return;
      clearRestart();
      if (!shouldPlay() || video.paused) {
        settled = true;
        stop();
        return;
      }
      settling = true;
      fadingOut = false;
      opacity(1);
      const started = performance.now();
      const step = (now: number) => {
        if (!shouldPlay()) {
          settled = true;
          stop();
          return;
        }
        const progress = Math.min(1, (now - started) / SETTLE_MS);
        video.playbackRate = 0.1 + (PLAYBACK_RATE - 0.1) * (1 - progress) ** 2;
        if (progress < 1) frame = requestAnimationFrame(step);
        else {
          settled = true;
          stop();
        }
      };
      frame = requestAnimationFrame(step);
    };
    const onScroll = () => {
      if (window.scrollY > 16) settle();
    };
    const onFocus = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLElement &&
        !event.target.closest("[data-hero-motion-control]")
      )
        settle();
    };
    const onPolicyChange = () => {
      explicitPlay = false;
      play();
    };
    const onPause = () => {
      if (!disposed) setRunning(false);
    };
    const onError = () => {
      manualPause = true;
      stop();
      opacity(0, 0);
    };
    toggleRef.current = () => {
      if (!video.paused && !settling) {
        manualPause = true;
        stop();
        return;
      }
      manualPause = false;
      explicitPlay = true;
      settled = false;
      settling = false;
      cancelAnimationFrame(frame);
      clearRestart();
      if (video.error) video.removeAttribute("src");
      if (video.ended) video.currentTime = 0;
      video.playbackRate = PLAYBACK_RATE;
      play();
    };

    video.addEventListener("playing", onPlaying);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    document.addEventListener("visibilitychange", play);
    motion.addEventListener("change", onPolicyChange);
    connection?.addEventListener("change", onPolicyChange);
    window.addEventListener("scroll", onScroll, { passive: true });
    hero?.addEventListener("focusin", onFocus);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      play();
    });
    observer.observe(hero ?? video);
    onScroll();

    return () => {
      disposed = true;
      clearRestart();
      cancelAnimationFrame(frame);
      if (firstFrame && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(firstFrame);
      observer.disconnect();
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", play);
      motion.removeEventListener("change", onPolicyChange);
      connection?.removeEventListener("change", onPolicyChange);
      window.removeEventListener("scroll", onScroll);
      hero?.removeEventListener("focusin", onFocus);
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.style.opacity = "0";
      toggleRef.current = () => {};
    };
  }, [src, mode, glowRef]);

  return (
    <>
      <video
        ref={videoRef}
        poster={poster}
        muted
        playsInline
        preload="none"
        aria-hidden="true"
        className={className}
        style={{ opacity: 0, ...style }}
      />
      <button
        type="button"
        data-hero-motion-control
        onClick={() => toggleRef.current()}
        className="absolute right-4 top-24 z-20 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[11px] text-white/80 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
      >
        {running ? "Pause background" : "Play background"}
      </button>
    </>
  );
}
