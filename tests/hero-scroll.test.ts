import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { motionValue } from "motion/react";
import { createHeroScrollController, navigateHomeSection } from "../src/lib/hero-scroll";

const { animateMock } = vi.hoisted(() => ({ animateMock: vi.fn() }));
vi.mock("motion/react", async (original) => ({
  ...(await original<typeof import("motion/react")>()),
  animate: animateMock,
}));
let y = 0;
let height = 800;
let reduced = false;
let hidden = false;
let policy: () => void;
let cleanup: () => void;
let hero: HTMLElement;
let content: HTMLElement;
let exposure: ReturnType<typeof motionValue<number>>;
let reveal: ReturnType<typeof vi.fn>;
let transition: {
  target: number;
  update: (y: number) => void;
  finish: () => void;
  stop: ReturnType<typeof vi.fn>;
};
const rect = (top: number) => ({ top, height, bottom: top + height }) as DOMRect;
const wheel = (deltaY: number, target: EventTarget = window, extra: WheelEventInit = {}) => {
  const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true, ...extra });
  // happy-dom's WheelEvent omits the MouseEvent modifier initialization.
  if (extra.ctrlKey) Object.defineProperty(event, "ctrlKey", { value: true });
  target.dispatchEvent(event);
  return event;
};
const scroll = (position: number) => {
  y = position;
  window.dispatchEvent(new Event("scroll"));
};
const finish = () => {
  transition.update(transition.target);
  transition.finish();
};
const key = (key: string, target: EventTarget = window) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
};
const touch = (
  type: string,
  points: { clientX: number; clientY: number }[],
  target: EventTarget = window
) => {
  const event = new Event(type, { cancelable: true, bubbles: true });
  Object.defineProperty(event, "touches", { value: points });
  target.dispatchEvent(event);
  return event;
};
beforeEach(() => {
  vi.useFakeTimers();
  y = 0;
  height = 800;
  reduced = false;
  hidden = false;
  document.body.innerHTML =
    '<section id="top"><div data-hero-content><a href="#lab">Lab</a></div></section><section id="lab"></section><section id="works"></section>';
  hero = document.getElementById("top")!;
  content = hero.querySelector("div")!;
  vi.spyOn(window, "scrollY", "get").mockImplementation(() => y);
  vi.spyOn(window, "scrollTo").mockImplementation((options) => {
    y = (options as ScrollToOptions).top ?? y;
  });
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.spyOn(hero, "getBoundingClientRect").mockImplementation(() => rect(-y));
  vi.spyOn(document.getElementById("lab")!, "getBoundingClientRect").mockImplementation(() =>
    rect(height - y)
  );
  vi.spyOn(document.getElementById("works")!, "getBoundingClientRect").mockImplementation(() =>
    rect(2400 - y)
  );
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, callback: () => void) => {
      policy = callback;
    },
    removeEventListener() {},
  }));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    }
  );
  animateMock.mockImplementation((_from, target, options) => {
    transition = { target, update: options.onUpdate, finish: options.onComplete, stop: vi.fn() };
    return transition;
  });
  exposure = motionValue(1);
  reveal = vi.fn();
  cleanup = createHeroScrollController({ hero, content, exposure, onReveal: reveal });
});
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  animateMock.mockReset();
});

describe("Hero / Lab scene navigation", () => {
  it("finishes each gesture at Lab or Hero, with reversible exposure and repeated reveals", () => {
    expect(wheel(40).defaultPrevented).toBe(true);
    expect(transition.target).toBe(800);
    expect(content.inert).toBe(true);
    expect(reveal).toHaveBeenLastCalledWith(false);
    transition.update(400);
    expect(exposure.get()).toBe(0.5);
    finish();
    expect(y).toBe(800);
    expect(hero.dataset.heroState).toBe("outside");
    for (let i = 0; i < 2; i++) {
      wheel(-40);
      transition.update(400);
      expect(reveal).toHaveBeenLastCalledWith(false);
      expect(content.inert).toBe(true);
      finish();
      expect(reveal).toHaveBeenLastCalledWith(true);
      expect(content.inert).toBe(false);
      expect(y).toBe(0);
      expect(exposure.get()).toBe(1);
      expect(hero.dataset.heroState).toBe("inside");
      wheel(40);
      finish();
      expect(reveal).toHaveBeenLastCalledWith(false);
    }
  });
  it("keeps returning content hidden until full exposure and playback readiness, ignoring stale readiness after exit", () => {
    cleanup();
    const playbackReady = motionValue(false);
    cleanup = createHeroScrollController({
      hero,
      content,
      exposure,
      playbackReady,
      onReveal: reveal,
    });
    // Initial content is not held hostage by the first video download.
    expect(content.inert).toBe(false);
    wheel(40);
    finish();
    wheel(-40);
    transition.update(400);
    playbackReady.set(true);
    expect(content.inert).toBe(true);
    playbackReady.set(false);
    finish();
    expect(exposure.get()).toBe(1);
    expect(content.inert).toBe(true);
    playbackReady.set(true);
    expect(content.inert).toBe(false);
    expect(reveal).toHaveBeenLastCalledWith(true);
    wheel(40);
    finish();
    playbackReady.set(false);
    playbackReady.set(true);
    expect(content.inert).toBe(true);
  });
  it("lets Lab and later content scroll normally after the initiating gesture ends", () => {
    wheel(40);
    finish();
    expect(wheel(40).defaultPrevented).toBe(true);
    vi.advanceTimersByTime(180);
    expect(wheel(40).defaultPrevented).toBe(false);
    scroll(1300);
    expect(wheel(-40).defaultPrevented).toBe(false);
    expect(key("PageDown").defaultPrevented).toBe(false);
  });
  it("ignores pinch zoom, horizontal gestures, forms, and nested scrollable content", () => {
    expect(wheel(40, window, { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(wheel(40, window, { deltaX: 80 }).defaultPrevented).toBe(false);
    const input = document.createElement("input");
    content.append(input);
    expect(wheel(40, input).defaultPrevented).toBe(false);
    expect(key("Home", input).defaultPrevented).toBe(false);
    content.style.overflowY = "auto";
    Object.defineProperty(content, "scrollHeight", { configurable: true, value: 1000 });
    Object.defineProperty(content, "clientHeight", { configurable: true, value: 600 });
    expect(wheel(40, content).defaultPrevented).toBe(false);
    content.scrollTop = 400;
    expect(wheel(40, content).defaultPrevented).toBe(true);
  });
  it("supports PageDown, PageUp, Home, and accessible anchor navigation", () => {
    expect(key("PageDown").defaultPrevented).toBe(true);
    finish();
    expect(key("PageUp").defaultPrevented).toBe(true);
    finish();
    navigateHomeSection("works");
    expect(transition.target).toBe(2400);
    finish();
    key("Home");
    finish();
    expect(y).toBe(0);
    const anchor = content.querySelector("a")!;
    expect(key(" ", anchor).defaultPrevented).toBe(false);
    anchor.click();
    expect(transition.target).toBe(800);
    finish();
    expect(exposure.get()).toBe(0);
  });
  it("claims one vertical touch gesture but preserves horizontal swipes and multi-touch", () => {
    touch("touchstart", [{ clientX: 50, clientY: 300 }]);
    expect(touch("touchmove", [{ clientX: 100, clientY: 290 }]).defaultPrevented).toBe(false);
    expect(touch("touchmove", [{ clientX: 50, clientY: 230 }]).defaultPrevented).toBe(true);
    finish();
    expect(touch("touchmove", [{ clientX: 50, clientY: 200 }]).defaultPrevented).toBe(true);
    touch("touchend", []);
    touch("touchstart", [
      { clientX: 0, clientY: 0 },
      { clientX: 50, clientY: 50 },
    ]);
    expect(
      touch("touchmove", [
        { clientX: 0, clientY: 100 },
        { clientX: 50, clientY: 150 },
      ]).defaultPrevented
    ).toBe(false);
  });
  it("settles native scrollbar movement so a partial Hero is not a resting state", () => {
    scroll(250);
    vi.advanceTimersByTime(161);
    expect(transition.target).toBe(800);
    finish();
    scroll(650);
    window.dispatchEvent(new Event("scrollend"));
    expect(transition.target).toBe(0);
    finish();
    expect(y).toBe(0);
  });
  it("preserves the scene boundary across viewport changes and honors reduced motion", () => {
    wheel(40);
    finish();
    height = 600;
    window.dispatchEvent(new Event("resize"));
    expect(y).toBe(600);
    reduced = true;
    wheel(-40);
    expect(y).toBe(0);
    expect(exposure.get()).toBe(1);
    reduced = false;
    wheel(40);
    transition.update(200);
    reduced = true;
    policy();
    expect(y).toBe(600);
    expect(exposure.get()).toBe(0);
  });
  it("finishes a transition in a hidden tab and removes handlers on disposal", () => {
    wheel(40);
    transition.update(200);
    hidden = true;
    document.dispatchEvent(new Event("visibilitychange"));
    expect(y).toBe(800);
    expect(exposure.get()).toBe(0);
    cleanup();
    expect(wheel(-40).defaultPrevented).toBe(false);
    expect(content.inert).toBe(false);
  });
});
