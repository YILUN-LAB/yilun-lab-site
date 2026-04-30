/**
 * Page-wide GPU-friendly aurora background.
 * Three large radial blobs drift in slow CSS keyframe loops.
 * - position: fixed; z-index: -1; pointer-events: none — bleeds behind every section.
 * - prefers-reduced-motion: animation is disabled, blobs stay at their phase 0 positions.
 */
export function AuroraBackground() {
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
          opacity: 0.28;
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
        @media (prefers-reduced-motion: reduce) {
          .aurora-blob { animation: none; }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0705] to-[#050302]" />
        <div className="aurora-blob aurora-blob--violet" />
        <div className="aurora-blob aurora-blob--amber" />
        <div className="aurora-blob aurora-blob--cyan" />
      </div>
    </>
  );
}
