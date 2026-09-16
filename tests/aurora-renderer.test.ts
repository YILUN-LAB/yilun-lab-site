import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { auroraPositions, createAuroraRenderer } from "../src/lib/aurora-renderer";

function mockContext() {
  return {
    filter: "none",
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    globalCompositeOperation: "source-over",
    globalAlpha: 1,
  };
}
let contexts: ReturnType<typeof mockContext>[];
beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
    ],
  });
  contexts = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
    const context = mockContext();
    contexts.push(context);
    return context as unknown as CanvasRenderingContext2D;
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("preserves the original CSS path endpoints and round trips", () => {
  const w = 1000,
    h = 800;
  expect(auroraPositions(0, w, h)).toEqual([
    [-150, -80],
    [350, 480],
    [50, 380],
  ]);
  expect(auroraPositions(37500, w, h)[0][0]).toBeCloseTo(150);
  expect(auroraPositions(45000, w, h)[1][0]).toBeCloseTo(0);
  expect(auroraPositions(40000, w, h)[2][0]).toBeCloseTo(300);
  expect(auroraPositions(75000, w, h)[0]).toEqual(auroraPositions(0, w, h)[0]);
});

it("allocates no sprites under Hero, caches blur, and stops all work while asleep", () => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 0;
  const renderer = createAuroraRenderer(canvas)!;
  renderer.update({ covered: true, sleeping: true, reduced: false });
  expect(canvas.width).toBe(0);
  expect(contexts).toHaveLength(1);
  expect(vi.getTimerCount()).toBe(0);

  renderer.update({ covered: false, sleeping: false, reduced: false });
  expect(contexts).toHaveLength(4);
  expect(canvas.width).toBe(Math.ceil(window.innerWidth / 4));
  const main = contexts[0];
  vi.advanceTimersByTime(1000);
  expect(main.drawImage.mock.calls.length).toBeGreaterThan(3);
  expect(main.drawImage.mock.calls.length).toBeLessThanOrEqual(3 * 13);
  expect(contexts).toHaveLength(4);
  expect(contexts.slice(1).every((ctx) => ctx.fillRect.mock.calls.length === 1)).toBe(true);

  renderer.update({ covered: false, sleeping: true, reduced: false });
  const count = main.drawImage.mock.calls.length;
  vi.advanceTimersByTime(5000);
  expect(main.drawImage).toHaveBeenCalledTimes(count);
  expect(vi.getTimerCount()).toBe(0);
  renderer.update({ covered: false, sleeping: false, reduced: false });
  vi.advanceTimersByTime(100);
  const lastViolet = main.drawImage.mock.calls.at(-3)!;
  expect(lastViolet[1]).toBeCloseTo(
    (auroraPositions(1100, window.innerWidth, window.innerHeight)[0][0] - 330) / 4,
    0
  );
  renderer.dispose();
  const disposedCount = main.drawImage.mock.calls.length;
  vi.advanceTimersByTime(1000);
  expect(main.drawImage).toHaveBeenCalledTimes(disposedCount);
  expect(canvas.width).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("renders reduced motion once and redraws after resizing without starting a loop", () => {
  const canvas = document.createElement("canvas");
  const renderer = createAuroraRenderer(canvas)!;
  renderer.update({ covered: false, sleeping: false, reduced: true });
  expect(contexts[0].drawImage).toHaveBeenCalledTimes(3);
  vi.advanceTimersByTime(1000);
  expect(contexts[0].drawImage).toHaveBeenCalledTimes(3);
  vi.stubGlobal("innerWidth", 375);
  renderer.update({ covered: false, sleeping: false, reduced: true });
  expect(canvas.width).toBe(94);
  expect(contexts[0].drawImage).toHaveBeenCalledTimes(6);
  expect(vi.getTimerCount()).toBe(0);
  renderer.dispose();
});

it("allows a static CSS fallback when 2D canvas or blur is unavailable", () => {
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
  expect(createAuroraRenderer(document.createElement("canvas"))).toBeNull();
  vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue({} as CanvasRenderingContext2D);
  expect(createAuroraRenderer(document.createElement("canvas"))).toBeNull();
});
