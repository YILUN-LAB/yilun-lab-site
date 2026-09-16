import { cubicBezier } from "motion/react";

const ease = cubicBezier(0.42, 0, 0.58, 1);
const SCALE = 0.25;
const FRAME_MS = 1000 / 12;
const BLUR = 110;
const PADDING = BLUR * 3;
const COLORS = ["#7c3aed", "#f5af3c", "#22d3ee"];

/** Original CSS keyframes, including their ease-in-out on each half-cycle. */
export function auroraPositions(ms: number, width: number, height: number, still = false) {
  const diameter = Math.min(width * 0.9, 1300);
  if (still)
    return [
      [0, 0],
      [width - diameter, height * 0.3],
      [0, height - diameter],
    ];
  const phase = (seconds: number) => {
    const half = ((ms / 1000) % seconds) / (seconds / 2);
    return ease(half <= 1 ? half : 2 - half);
  };
  const violet = phase(75);
  const amber = phase(90);
  const cyan = phase(80);
  return [
    [width * (-0.15 + 0.3 * violet), height * (-0.1 + 0.3 * violet)],
    [width - diameter + width * (0.25 - 0.35 * amber), height * (0.6 - 0.25 * amber)],
    [width * (0.05 + 0.25 * cyan), height - diameter + height * (0.6 - 0.25 * cyan)],
  ];
}

/** Cache the blur at resize time; only composite three small sprites per frame.
 * A quarter-resolution canvas is sufficient for this 110px-blurred background.
 * It intentionally ignores devicePixelRatio: there are no sharp details here. */
export function createAuroraRenderer(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context || !("filter" in context)) return null;
  let width = 0;
  let height = 0;
  let sprites: HTMLCanvasElement[] = [];
  let elapsed = 0;
  let started = 0;
  let running = false;
  let covered = true;
  let reduced = false;
  let disposed = false;
  let timer = 0;
  let frame = 0;

  const time = () => elapsed + (running ? performance.now() - started : 0);
  const cancel = () => {
    window.clearTimeout(timer);
    cancelAnimationFrame(frame);
    timer = frame = 0;
  };
  const draw = () => {
    if (covered || disposed) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (w !== width || h !== height) {
      width = w;
      height = h;
      canvas.width = Math.ceil(w * SCALE);
      canvas.height = Math.ceil(h * SCALE);
      const diameter = Math.min(w * 0.9, 1300) * SCALE;
      const padding = PADDING * SCALE;
      sprites = COLORS.map((color) => {
        const sprite = document.createElement("canvas");
        sprite.width = sprite.height = Math.ceil(diameter + 2 * padding);
        const ctx = sprite.getContext("2d")!;
        const center = padding + diameter / 2;
        const gradient = ctx.createRadialGradient(
          center,
          center,
          0,
          center,
          center,
          (diameter / Math.SQRT2) * 0.7
        );
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, `${color}00`);
        ctx.fillStyle = gradient;
        ctx.filter = `blur(${BLUR * SCALE}px)`;
        ctx.fillRect(padding, padding, diameter, diameter);
        return sprite;
      });
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalCompositeOperation = "screen";
    context.globalAlpha = 0.5;
    auroraPositions(time(), width, height, reduced).forEach(([x, y], i) => {
      context.drawImage(sprites[i], (x - PADDING) * SCALE, (y - PADDING) * SCALE);
    });
  };
  const schedule = () => {
    // Do not spin a display-rate RAF merely to discard most callbacks.
    timer = window.setTimeout(() => {
      timer = 0;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!running || disposed) return;
        draw();
        schedule();
      });
    }, FRAME_MS);
  };
  return {
    update(state: { covered: boolean; sleeping: boolean; reduced: boolean }) {
      if (disposed) return;
      const nextRunning = !state.covered && !state.sleeping && !state.reduced;
      const changed = covered !== state.covered || reduced !== state.reduced;
      const resized = width !== window.innerWidth || height !== window.innerHeight;
      covered = state.covered;
      reduced = state.reduced;
      if (running !== nextRunning) {
        elapsed = time();
        running = nextRunning;
        started = performance.now();
        cancel();
        if (running) schedule();
      }
      if (changed || resized) draw();
    },
    dispose() {
      disposed = true;
      running = false;
      cancel();
      sprites = [];
      canvas.width = canvas.height = 0;
    },
  };
}
