import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FadingVideo } from "../src/components/react/FadingVideo";
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

const mount = (mode: "settle" | "loop" | "still" = "settle") => {
  const result = render(
    <section>
      <FadingVideo src={source} poster="/poster.webp" mode={mode} />
    </section>
  );
  return { ...result, video: result.container.querySelector("video")! };
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
      const { video } = mount(policy === "still" ? "still" : "settle");
      await visible();
      expect(video).not.toHaveAttribute("src");
      expect(video).toHaveAttribute("poster", "/poster.webp");
      expect(play).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Play background" }));
      expect(video).toHaveAttribute("src", source);
      await act(async () => {});
      expect(play).toHaveBeenCalledTimes(1);
    }
  );

  it("honours a reduced-motion change while playing", async () => {
    const { video } = mount();
    await visible();
    reduced = true;
    act(() => policyChange());
    expect(video.paused).toBe(true);
  });

  it("keeps an explicit pause when the tab or viewport returns", async () => {
    const { video } = mount();
    await visible();
    fireEvent.click(screen.getByRole("button", { name: "Pause background" }));
    await visible(false);
    await visible();
    await visibility(true);
    await visibility(false);
    expect(video.paused).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("decelerates on keyboard engagement and holds the frame until explicitly played", async () => {
    const { video, container } = mount();
    await visible();
    const link = document.createElement("a");
    link.href = "#lab";
    container.querySelector("section")!.append(link);
    fireEvent.focusIn(link);
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(video.playbackRate).toBeLessThan(0.65);
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(video.paused).toBe(true);
    expect(video.style.opacity).toBe("1");
    await visible(false);
    await visible();
    expect(video.paused).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Play background" }));
    await act(async () => {});
    expect(video.paused).toBe(false);
    expect(video.playbackRate).toBe(0.65);
  });

  it("settles after meaningful scrolling but loop mode keeps playing", async () => {
    const { video, rerender } = mount();
    await visible();
    vi.spyOn(window, "scrollY", "get").mockReturnValue(20);
    fireEvent.scroll(window);
    await act(async () => {
      vi.advanceTimersByTime(1700);
    });
    expect(video.paused).toBe(true);
    rerender(
      <section>
        <FadingVideo src={source} poster="/poster.webp" mode="loop" />
      </section>
    );
    await visible();
    fireEvent.scroll(window);
    await act(async () => {
      vi.advanceTimersByTime(1700);
    });
    expect(video.paused).toBe(false);
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
    fireEvent.click(screen.getByRole("button", { name: "Play background" }));
    await act(async () => {});
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
