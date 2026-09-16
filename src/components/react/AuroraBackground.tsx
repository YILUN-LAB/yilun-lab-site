import { useEffect, useRef } from "react";
import { createAuroraRenderer } from "@lib/aurora-renderer";

/**
 * Page-wide aurora with cached blur sprites in one small canvas.
 * The original CSS blobs provide the SSR / unsupported-browser fallback.
 * - position: fixed; z-index: -1; pointer-events: none — bleeds behind every section.
 * - prefers-reduced-motion: one still frame at the original CSS resting positions.
 */
export function AuroraBackground({ occludedByHero = false }: { occludedByHero?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const background = ref.current;
    if (!background) return;
    const hero = occludedByHero ? document.getElementById("top") : null;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const renderer = canvasRef.current ? createAuroraRenderer(canvasRef.current) : null;
    background.dataset.renderer = renderer ? "canvas" : "fallback";
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = hero?.getBoundingClientRect();
      const covered = !!rect && rect.top <= 0 && rect.bottom >= window.innerHeight;
      const heroVisible = !!rect && rect.bottom > 0 && rect.top < window.innerHeight;
      background.dataset.sleeping = String(document.hidden || heroVisible);
      background.dataset.covered = String(document.hidden || covered);
      renderer?.update({
        covered: document.hidden || covered,
        sleeping: document.hidden || heroVisible,
        reduced: motion.matches,
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    if (hero) observer.observe(hero);
    if (hero) {
      window.addEventListener("scroll", schedule, { passive: true });
    }
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
      renderer?.dispose();
    };
  }, [occludedByHero]);
  return (
    <>
      <style>{`
        @keyframes auroraDrift1 {
          0%   { transform: translate3d(-15vw, -10vh, 0); }
          50%  { transform: translate3d( 15vw,  20vh, 0); }
          100% { transform: translate3d(-15vw, -10vh, 0); }
        }
        @keyframes auroraDrift2 {
          0%   { transform: translate3d( 25vw,  30vh, 0); }
          50%  { transform: translate3d(-10vw,   5vh, 0); }
          100% { transform: translate3d( 25vw,  30vh, 0); }
        }
        @keyframes auroraDrift3 {
          0%   { transform: translate3d(  5vw,  60vh, 0); }
          50%  { transform: translate3d( 30vw,  35vh, 0); }
          100% { transform: translate3d(  5vw,  60vh, 0); }
        }
        .aurora-blob {
          position: absolute;
          width: 90vw;
          height: 90vw;
          max-width: 1300px;
          max-height: 1300px;
          border-radius: 50%;
          filter: blur(110px);
          opacity: 0.5;
          mix-blend-mode: screen;
          will-change: transform;
        }
        .aurora-blob--violet {
          left: 0; top: 0;
          background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
          animation: auroraDrift1 75s ease-in-out infinite;
        }
        .aurora-blob--amber {
          right: 0; top: 30vh;
          background: radial-gradient(circle, #f5af3c 0%, transparent 70%);
          animation: auroraDrift2 90s ease-in-out infinite;
        }
        .aurora-blob--cyan {
          left: 0; bottom: 0;
          background: radial-gradient(circle, #22d3ee 0%, transparent 70%);
          animation: auroraDrift3 80s ease-in-out infinite;
        }
        [data-sleeping=true] .aurora-blob {
          animation-play-state: paused;
          will-change: auto;
        }
        [data-covered=true] .aurora-blob {
          visibility: hidden;
        }
        .aurora-canvas {
          position: absolute;
          width: 100%; height: 100%;
          mix-blend-mode: screen;
        }
        [data-renderer=canvas] .aurora-blob { display: none; }
        [data-renderer=fallback] .aurora-blob { animation-play-state: paused; will-change: auto; }
        [data-covered=true] .aurora-canvas { visibility: hidden; }
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none; }
        }
      `}</style>
      <div
        ref={ref}
        data-sleeping={occludedByHero}
        data-covered={occludedByHero}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <canvas ref={canvasRef} className="aurora-canvas" width="0" height="0" />
        {/* No solid base layer here — the html element provides --warm-bg.
            That keeps the blobs blending against the page color directly,
            instead of being dimmed by a stacked dark gradient on top. */}
        <div className="aurora-blob aurora-blob--violet" />
        <div className="aurora-blob aurora-blob--amber" />
        <div className="aurora-blob aurora-blob--cyan" />
      </div>
    </>
  );
}
