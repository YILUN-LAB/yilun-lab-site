import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FadingVideo } from "../src/components/react/FadingVideo";
import { motionValue } from "motion/react";
import { pickHeroVideo } from "../src/lib/hero-video";

let intersect: (entries: { isIntersecting: boolean }[]) => void;
let reduced = false;
let hidden = false;
let mediaPaused = true;
let play: ReturnType<typeof vi.fn>;
let policyChange: () => void;
const source = "/test.mp4";

beforeEach(() => {
  vi.useFakeTimers();
  reduced = false;
  hidden = false;
  mediaPaused = true;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof intersect) {
        intersect = callback;
      }
      observe() {}
      disconnect() {}
    }
  );
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, callback: () => void) => {
      policyChange = callback;
    },
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(document, "hidden", "get").mockImplementation(() => hidden);
  vi.spyOn(window, "scrollY", "get").mockReturnValue(0);
  vi.spyOn(HTMLMediaElement.prototype, "paused", "get").mockImplementation(() => mediaPaused);
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
    this: HTMLMediaElement
  ) {
    mediaPaused = true;
    this.dispatchEvent(new Event("pause"));
  });
  play = vi.fn(function (this: HTMLMediaElement) {
    mediaPaused = false;
    this.dispatchEvent(new Event("playing"));
    return Promise.resolve();
  });
  vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(play);
  localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(navigator, "connection", { configurable: true, value: undefined });
});

const mount = (mode: "scene" | "loop" | "still" = "scene") => {
  const exposure = motionValue(1);
  const onPlaybackReady = vi.fn();
  const result = render(
    <section>
      <FadingVideo
        src={source}
        poster="/poster.webp"
        mode={mode}
        exposure={exposure}
        onPlaybackReady={onPlaybackReady}
      />
    </section>
  );
  return { ...result, exposure, onPlaybackReady, video: result.container.querySelector("video")! };
};
const visible = async (value = true) => {
  await act(async () => {
    intersect([{ isIntersecting: value }]);
  });
};
const visibility = async (value: boolean) => {
  hidden = value;
  await act(async () => {
    document.dispatchEvent(new Event("visibilitychange"));
  });
};

describe("hero media lifecycle", () => {
  it("defers the video request until visible; resumes after leaving the viewport or tab", async () => {
    const { video } = mount("loop");
    expect(video).not.toHaveAttribute("src");
    await visible();
    expect(video).toHaveAttribute("src", source);
    expect(play).toHaveBeenCalledTimes(1);
    await visible(false);
    expect(video.paused).toBe(true);
    await visible();
    expect(play).toHaveBeenCalledTimes(2);
    await visibility(true);
    expect(video.paused).toBe(true);
    await visibility(false);
    expect(play).toHaveBeenCalledTimes(3);
  });

  it.each(["reduced", "saveData", "2g", "still"])(
    "keeps a poster without requesting video under %s",
    async (policy) => {
      reduced = policy === "reduced";
      Object.defineProperty(navigator, "connection", {
        configurable: true,
        value: {
          saveData: policy === "saveData",
          effectiveType: policy === "2g" ? "2g" : "4g",
          addEventListener() {},
          removeEventListener() {},
        },
      });
      const { video, onPlaybackReady } = mount(policy === "still" ? "still" : "scene");
      await visible();
      expect(video).not.toHaveAttribute("src");
      expect(video).toHaveAttribute("poster", "/poster.webp");
      expect(play).not.toHaveBeenCalled();
      expect(onPlaybackReady).toHaveBeenLastCalledWith(true);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(video.controls).toBe(false);
    }
  );

  it("honours a reduced-motion change while playing", async () => {
    const { video } = mount();
    await visible();
    reduced = true;
    act(() => policyChange());
    expect(video.paused).toBe(true);
  });

  it("slows on exit, holds the exact frame, and accelerates from it on every re-entry", async () => {
    const { video, exposure } = mount();
    await visible();
    video.currentTime = 3.25;
    expect(video.playbackRate).toBe(0.65);
    act(() => exposure.set(0.5));
    const midpointRate = video.playbackRate;
    expect(midpointRate).toBeGreaterThan(0.1);
    expect(midpointRate).toBeLessThan(0.65);
    act(() => exposure.set(0.05));
    expect(video.playbackRate).toBeLessThan(midpointRate);
    act(() => exposure.set(0));
    expect(video.paused).toBe(true);
    expect(video.currentTime).toBe(3.25);
    expect(video.style.opacity).toBe("1");
    expect(video).toHaveAttribute("src", source);
    for (let i = 0; i < 2; i++) {
      await act(async () => exposure.set(0.05));
      expect(video.paused).toBe(false);
      expect(video.playbackRate).toBeLessThan(midpointRate);
      expect(video.currentTime).toBe(3.25);
      act(() => exposure.set(1));
      expect(video.playbackRate).toBe(0.65);
      act(() => exposure.set(0));
      expect(video.paused).toBe(true);
    }
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(video.controls).toBe(false);
    expect(video).toHaveAttribute("tabindex", "-1");
  });

  it("reports readiness only after a normal-speed frame is presented on return", async () => {
    const { video, exposure, onPlaybackReady } = mount();
    let presentFrame: () => void;
    let frameId = 0;
    Object.defineProperty(video, "requestVideoFrameCallback", {
      configurable: true,
      value: (callback: () => void) => {
        presentFrame = callback;
        return ++frameId;
      },
    });
    Object.defineProperty(video, "cancelVideoFrameCallback", {
      configurable: true,
      value: vi.fn(),
    });
    await visible();
    act(() => presentFrame());
    expect(onPlaybackReady).toHaveBeenLastCalledWith(true);
    act(() => exposure.set(0));
    expect(onPlaybackReady).toHaveBeenLastCalledWith(false);
    await act(async () => exposure.set(0.2));
    act(() => presentFrame());
    expect(onPlaybackReady).toHaveBeenLastCalledWith(false);
    act(() => exposure.set(1));
    expect(video.playbackRate).toBe(0.65);
    // Changing playbackRate alone must not reveal the content.
    expect(onPlaybackReady).toHaveBeenLastCalledWith(false);
    act(() => presentFrame());
    expect(onPlaybackReady).toHaveBeenLastCalledWith(true);
  });

  it("waits for resumed playback after buffering, with a static fallback on error", async () => {
    const { video, exposure, onPlaybackReady } = mount();
    await visible();
    act(() => exposure.set(0));
    await act(async () => exposure.set(0.2));
    fireEvent.waiting(video);
    act(() => exposure.set(1));
    fireEvent.timeUpdate(video);
    expect(onPlaybackReady).toHaveBeenLastCalledWith(false);
    fireEvent.playing(video);
    expect(onPlaybackReady).toHaveBeenLastCalledWith(true);
    fireEvent.waiting(video);
    fireEvent.error(video);
    expect(onPlaybackReady).toHaveBeenLastCalledWith(true);
  });

  it("does not settle merely because a visitor focuses or reads content", async () => {
    const { video, container } = mount();
    await visible();
    fireEvent.focusIn(container.querySelector("section")!);
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(video.paused).toBe(false);
    expect(video.playbackRate).toBe(0.65);
  });

  it("cancels a loop fade during exit so the held frame stays visible", async () => {
    const { video, exposure } = mount();
    await visible();
    Object.defineProperty(video, "duration", { configurable: true, value: 8 });
    video.currentTime = 7.6;
    fireEvent.timeUpdate(video);
    expect(video.style.opacity).toBe("0");
    act(() => exposure.set(0.5));
    expect(video.style.opacity).toBe("1");
    mediaPaused = true;
    Object.defineProperty(video, "ended", {
      configurable: true,
      get: () => video.currentTime >= 8,
    });
    video.currentTime = 8;
    fireEvent.ended(video);
    act(() => exposure.set(0));
    await act(async () => {
      vi.advanceTimersByTime(1000);
      exposure.set(0.5);
    });
    expect(video.currentTime).toBe(8);
    expect(play).toHaveBeenCalledTimes(1);
    await act(async () => exposure.set(1));
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("loops with a fade and cancels pending restarts on unmount", async () => {
    const { video, unmount } = mount("loop");
    await visible();
    Object.defineProperty(video, "duration", { configurable: true, value: 8 });
    video.currentTime = 7.6;
    fireEvent.timeUpdate(video);
    expect(video.style.opacity).toBe("0");
    mediaPaused = true;
    fireEvent.ended(video);
    await act(async () => {
      vi.advanceTimersByTime(101);
    });
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
    fireEvent.ended(video);
    unmount();
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(play).toHaveBeenCalledTimes(2);
  });

  it("allows retry after autoplay is rejected", async () => {
    play.mockImplementationOnce(() =>
      Promise.reject(new DOMException("Blocked", "NotAllowedError"))
    );
    const { video } = mount();
    await visible();
    expect(video.style.opacity).toBe("0");
    await visible(false);
    await visible();
    expect(video.paused).toBe(false);
  });
});

describe("hero selection storage", () => {
  it.each(["null", '"oops"', "{}", "invalid"])("recovers from malformed queue %s", (value) => {
    localStorage.setItem("yilun-hero-queue", value);
    expect(pickHeroVideo()).toMatch(/^\/assets\/videos\/hero-[123]\.mp4$/);
  });
  it("rotates all three clips and avoids repeating across queue boundaries", () => {
    const first = Array.from({ length: 3 }, () => pickHeroVideo());
    expect(new Set(first).size).toBe(3);
    expect(pickHeroVideo()).not.toBe(first[2]);
  });
  it("works when storage throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("denied");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });
    expect(pickHeroVideo()).toContain("/assets/videos/hero-");
  });
});
