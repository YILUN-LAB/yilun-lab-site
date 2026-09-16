import { act, cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AuroraBackground } from "../src/components/react/AuroraBackground";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("hides under a full hero, stays still under a partial hero, and animates after the hero leaves", () => {
  let bottom = 1200;
  const rect = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(() => ({
    top: 0,
    bottom,
    left: 0,
    right: 1280,
    width: 1280,
    height: bottom,
    x: 0,
    y: 0,
    toJSON() {},
  }));
  const { container } = render(
    <>
      <section id="top" />
      <AuroraBackground occludedByHero />
    </>
  );
  const background = container.querySelector("[data-sleeping]")!;
  expect(background).toHaveAttribute("data-sleeping", "true");
  expect(background).toHaveAttribute("data-covered", "true");
  bottom = 20;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(20);
  });
  expect(background).toHaveAttribute("data-sleeping", "true");
  expect(background).toHaveAttribute("data-covered", "false");
  bottom = -20;
  act(() => {
    window.dispatchEvent(new Event("scroll"));
    vi.advanceTimersByTime(20);
  });
  expect(background).toHaveAttribute("data-sleeping", "false");
  bottom = 1200;
  act(() => {
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(20);
  });
  expect(background).toHaveAttribute("data-sleeping", "true");
  expect(rect).toHaveBeenCalled();
});

it("sleeps in a hidden tab and resumes on ordinary pages", () => {
  let hidden = false;
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  const { container } = render(<AuroraBackground />);
  const background = container.querySelector("[data-sleeping]")!;
  expect(background).toHaveAttribute("data-sleeping", "false");
  hidden = true;
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(background).toHaveAttribute("data-sleeping", "true");
  hidden = false;
  act(() => document.dispatchEvent(new Event("visibilitychange")));
  expect(background).toHaveAttribute("data-sleeping", "false");
});
