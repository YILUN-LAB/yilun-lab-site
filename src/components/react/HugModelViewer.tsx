import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { HugScene, HugSceneInputs, HugSketchLayout } from "@lib/hug-model-scene";

interface HugModelViewerProps {
  src: string;
  progress: number;
  /** "r g b" */
  glow: string;
  power: boolean;
  /** False while another view covers the model; rendering pauses. */
  active: boolean;
  label: string;
  hint: string;
  loading: string;
  dimensionLabel: string;
  turnLeft: string;
  turnRight: string;
  onUnavailable: () => void;
}

const graphite = "#3a3530";

export function hasWebGL2(): boolean {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

/** Tapered pencil stroke between two points, `width` at its thickest. */
function strokePath(x0: number, y0: number, x1: number, y1: number, width: number) {
  const mx = (x0 + x1) / 2;
  const my = (y0 + y1) / 2;
  return `M ${x0} ${y0} Q ${mx} ${my - width} ${x1} ${y1} Q ${mx} ${my + width} ${x0} ${y0} Z`;
}

/** Construction ellipse, ground line, shadow strokes and height mark around the model. */
function SketchGuides({ layout, label }: { layout: HugSketchLayout; label: string }) {
  const id = useId().replace(/:/g, "");
  const { width, height, base: b, dimension: d } = layout;
  const shadowY = b.cy + b.ry * 0.32;
  const labelY = (d.top + d.bottom) / 2;
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <filter id={`${id}-pencil`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="1.6" />
        </filter>
      </defs>
      <g filter={`url(#${id}-pencil)`} stroke={graphite} fill="none" strokeLinecap="round">
        <ellipse
          cx={b.cx}
          cy={b.cy}
          rx={b.rx}
          ry={b.ry}
          strokeWidth={0.9}
          opacity={0.32}
          transform={`rotate(-1.2 ${b.cx} ${b.cy})`}
        />
        <ellipse
          cx={b.cx + 3}
          cy={b.cy - 1}
          rx={b.rx * 0.97}
          ry={b.ry * 1.05}
          strokeWidth={0.7}
          opacity={0.2}
          transform={`rotate(1.6 ${b.cx} ${b.cy})`}
        />
        <path
          d={`M ${b.cx + 1} ${b.cy + b.ry * 1.4} L ${b.cx - 1} ${d.top - (d.bottom - d.top) * 0.12}`}
          strokeWidth={0.7}
          strokeDasharray="7 6"
          opacity={0.2}
        />
        <path
          d={`M ${b.cx - b.rx * 1.9} ${b.cy + 3} L ${b.cx + b.rx * 1.75} ${b.cy - 2}`}
          strokeWidth={0.8}
          opacity={0.3}
        />
        <path
          d={`M ${d.x} ${d.bottom} L ${d.x} ${d.top} M ${d.x - 6} ${d.top} L ${d.x + 6} ${d.top} M ${d.x - 6} ${d.bottom} L ${d.x + 6} ${d.bottom}`}
          strokeWidth={0.8}
          opacity={0.5}
        />
      </g>
      <g filter={`url(#${id}-pencil)`} fill={graphite}>
        <path
          d={strokePath(b.cx - b.rx * 0.78, shadowY, b.cx + b.rx * 0.5, shadowY - 2, 2.4)}
          opacity={0.7}
        />
        <path
          d={strokePath(b.cx - b.rx * 0.45, shadowY + 6, b.cx + b.rx * 0.62, shadowY + 4, 1.6)}
          opacity={0.5}
        />
        <path
          d={strokePath(b.cx - b.rx * 1.15, shadowY + 11, b.cx + b.rx * 0.2, shadowY + 10, 0.9)}
          opacity={0.35}
        />
      </g>
      <text
        x={d.x + 10}
        y={labelY}
        fill={graphite}
        opacity={0.75}
        fontFamily="'Instrument Serif', serif"
        fontStyle="italic"
        fontSize={15}
        dominantBaseline="middle"
        transform={`rotate(-90 ${d.x + 10} ${labelY})`}
        textAnchor="middle"
      >
        {label}
      </text>
    </svg>
  );
}

/**
 * The R13 model as a pencil sketch on paper, morphing with `progress` and
 * turning when dragged. three.js loads only when the viewer nears the screen.
 */
export function HugModelViewer({
  src,
  progress,
  glow,
  power,
  active,
  label,
  hint,
  loading,
  dimensionLabel,
  turnLeft,
  turnRight,
  onUnavailable,
}: HugModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HugScene | null>(null);
  const inputsRef = useRef<HugSceneInputs>({ progress, glow, power, active });
  inputsRef.current = { progress, glow, power, active };
  const unavailableRef = useRef(onUnavailable);
  unavailableRef.current = onUnavailable;
  const reducedMotion = useReducedMotion();
  const reducedMotionRef = useRef(reducedMotion);
  reducedMotionRef.current = reducedMotion;

  const [layout, setLayout] = useState<HugSketchLayout | null>(null);
  const [ready, setReady] = useState(false);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    sceneRef.current?.invalidate();
  }, [progress, glow, power, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasWebGL2()) {
      unavailableRef.current();
      return;
    }
    let disposed = false;

    async function load(element: HTMLCanvasElement) {
      try {
        const { mountHugModel } = await import("@lib/hug-model-scene");
        if (disposed) return;
        const scene = await mountHugModel({
          canvas: element,
          src,
          getInputs: () => inputsRef.current,
          reducedMotion: Boolean(reducedMotionRef.current),
          onLayout: setLayout,
          onInteract: () => setInteracted(true),
        });
        if (disposed) {
          scene.dispose();
          return;
        }
        sceneRef.current = scene;
        setReady(true);
      } catch (error) {
        console.error(`Hug model viewer could not load ${src}`, error);
        if (!disposed) unavailableRef.current();
      }
    }

    const nearScreen = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        nearScreen.disconnect();
        void load(canvas);
      },
      { rootMargin: "300px" }
    );
    nearScreen.observe(canvas);

    return () => {
      disposed = true;
      nearScreen.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [src]);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#f2ede4]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      />
      {layout && <SketchGuides layout={layout} label={dimensionLabel} />}
      {!ready && (
        <p className="absolute inset-x-0 bottom-5 text-center font-body text-xs text-[#6b645b]">
          {loading}
        </p>
      )}
      {ready && (
        <div className="absolute bottom-3 right-3 flex gap-1">
          {[
            { text: turnLeft, radians: -0.5, glyph: "↺" },
            { text: turnRight, radians: 0.5, glyph: "↻" },
          ].map((control) => (
            <button
              key={control.glyph}
              type="button"
              aria-label={control.text}
              tabIndex={active ? 0 : -1}
              onClick={() => sceneRef.current?.rotateBy(control.radians)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#3a3530]/25 text-base text-[#3a3530] transition-colors hover:bg-[#3a3530]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            >
              <span aria-hidden="true">{control.glyph}</span>
            </button>
          ))}
        </div>
      )}
      {ready && !interacted && (
        <p className="pointer-events-none absolute bottom-4 left-4 font-heading text-base italic text-[#5b544c]">
          {hint}
        </p>
      )}
    </div>
  );
}
