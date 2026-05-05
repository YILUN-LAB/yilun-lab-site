import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSaveStateMachine } from "@lib/save-pipeline/state-machine";

describe("save state machine", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("starts in saved state", () => {
    const sm = createSaveStateMachine();
    expect(sm.getState().kind).toBe("saved");
  });

  it("transitions to editing on markDirty", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    expect(sm.getState().kind).toBe("editing");
  });

  it("starts the debounce countdown on saveClicked", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    const s = sm.getState();
    expect(s.kind).toBe("pendingPublish");
    if (s.kind === "pendingPublish") expect(s.secondsRemaining).toBe(10);
  });

  it("decrements every second during pendingPublish", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(3000);
    const s = sm.getState();
    if (s.kind === "pendingPublish") expect(s.secondsRemaining).toBe(7);
  });

  it("resets countdown on subsequent saveClicked", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(5000);
    sm.saveClicked();
    const s = sm.getState();
    if (s.kind === "pendingPublish") expect(s.secondsRemaining).toBe(10);
  });

  it("transitions to publishing when countdown ends", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(10_000);
    expect(sm.getState().kind).toBe("publishing");
  });

  it("transitions to building on commitOk", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(10_000);
    sm.commitOk();
    const s = sm.getState();
    expect(s.kind).toBe("building");
    if (s.kind === "building") expect(s.secondsRemaining).toBe(60);
  });

  it("transitions to liveEstimated when build estimate ends", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(10_000);
    sm.commitOk();
    vi.advanceTimersByTime(60_000);
    expect(sm.getState().kind).toBe("liveEstimated");
  });

  it("transitions to error on commitFail", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(10_000);
    sm.commitFail(new Error("network"));
    expect(sm.getState().kind).toBe("error");
  });

  it("publishNow skips the debounce", () => {
    const sm = createSaveStateMachine();
    sm.markDirty();
    sm.saveClicked();
    vi.advanceTimersByTime(2000);
    sm.publishNow();
    expect(sm.getState().kind).toBe("publishing");
  });

  it("notifies subscribers on every transition", () => {
    const sm = createSaveStateMachine();
    const listener = vi.fn();
    const unsubscribe = sm.subscribe(listener);
    sm.markDirty();
    expect(listener).toHaveBeenCalledTimes(1);
    sm.saveClicked();
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    sm.markDirty();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
