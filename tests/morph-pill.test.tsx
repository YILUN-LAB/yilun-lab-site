import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CSSProperties } from "react";
import { MorphPill } from "../src/components/react/MorphPill";

vi.mock("motion/react", () => ({
  useReducedMotion: () => true,
  motion: {
    span: ({ animate, style }: { animate: CSSProperties; style: CSSProperties }) => (
      <span data-testid="indicator" style={{ ...style, ...animate }} />
    ),
  },
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("MorphPill measurement", () => {
  it("remeasures the active button when fonts or responsive layout change without changing selection", () => {
    let resize: ResizeObserverCallback = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: ResizeObserverCallback) {
          resize = callback;
        }
        observe = observe;
        disconnect = disconnect;
      }
    );
    const { unmount } = render(
      <MorphPill
        items={[
          { id: "all", label: "All Works", badge: 8 },
          { id: "art", label: "Light & Art", badge: 4 },
        ]}
        activeId="art"
      />
    );
    const active = screen.getByRole("button", { name: "Light & Art 4" });
    expect(observe).toHaveBeenCalledWith(active);
    expect(observe).toHaveBeenCalledWith(screen.getByRole("button", { name: "All Works 8" }));
    expect(observe).toHaveBeenCalledWith(active.parentElement);

    for (const [width, height] of [
      [140, 36],
      [120, 40],
    ]) {
      Object.defineProperties(active, {
        offsetWidth: { configurable: true, value: width },
        offsetHeight: { configurable: true, value: height },
      });
      act(() => resize([], {} as ResizeObserver));
      expect(screen.getByTestId("indicator")).toHaveStyle({
        width: `${width}px`,
        height: `${height}px`,
        opacity: "1",
      });
      expect(active).toHaveAttribute("aria-current", "true");
    }

    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
  });
});
