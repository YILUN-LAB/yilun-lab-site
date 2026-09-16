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
  it.each([
    { bare: true, mobileGrid: false },
    { bare: false, mobileGrid: false },
    { bare: false, mobileGrid: true },
  ])("keeps padding and state classes separate for %j", (props) => {
    const items = [
      { id: "lab", label: "Lab" },
      { id: "works", label: "Works" },
    ];
    const { rerender } = render(<MorphPill {...props} items={items} activeId="works" />);
    const works = screen.getByRole("button", { name: "Works" });
    const padding = props.mobileGrid ? ["py-3", "md:py-2"] : ["py-2"];
    expect(works).toHaveClass(...padding, "text-[#fff5e0]");
    expect(works.parentElement).toHaveClass(
      props.mobileGrid ? "md:overflow-x-auto" : "overflow-x-auto"
    );
    if (!props.bare) expect(works.parentElement).toHaveClass("scroll-px-1.5", "p-1.5");
    rerender(<MorphPill {...props} items={items} activeId="lab" />);
    expect(works).toHaveClass(...padding, "glass-link");
  });

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
