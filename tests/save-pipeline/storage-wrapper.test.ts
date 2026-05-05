import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBatchedStorage } from "@lib/save-pipeline/storage-wrapper";
import { saveQueue } from "@lib/save-pipeline/indexeddb-queue";

interface FakeAdapter {
  commit: ReturnType<typeof vi.fn>;
}

const makeAdapter = (): FakeAdapter => ({
  commit: vi.fn().mockResolvedValue({ ok: true }),
});

describe("batched storage wrapper", () => {
  beforeEach(async () => {
    await saveQueue.clearAll();
    // Fake only setTimeout/clearTimeout — fake-indexeddb relies on setImmediate
    // for transaction scheduling, so leaving it real keeps IDB ops responsive.
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });
  afterEach(() => vi.useRealTimers());

  it("debounces rapid saves into one commit", async () => {
    const adapter = makeAdapter();
    const wrapped = createBatchedStorage(adapter);

    await wrapped.commit({ slug: "p", fields: { a: 1 }, files: {} });
    await wrapped.commit({ slug: "p", fields: { b: 2 }, files: {} });
    await wrapped.commit({ slug: "p", fields: { c: 3 }, files: {} });

    expect(adapter.commit).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(10_000);

    expect(adapter.commit).toHaveBeenCalledTimes(1);
    expect(adapter.commit).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: "p",
        fields: expect.objectContaining({ a: 1, b: 2, c: 3 }),
      })
    );
  });

  it("two saves >10s apart produce two commits", async () => {
    const adapter = makeAdapter();
    const wrapped = createBatchedStorage(adapter);

    await wrapped.commit({ slug: "p", fields: { a: 1 }, files: {} });
    await vi.advanceTimersByTimeAsync(15_000);
    await wrapped.commit({ slug: "p", fields: { b: 2 }, files: {} });
    await vi.advanceTimersByTimeAsync(15_000);

    expect(adapter.commit).toHaveBeenCalledTimes(2);
  });

  it("flushNow bypasses debounce", async () => {
    const adapter = makeAdapter();
    const wrapped = createBatchedStorage(adapter);

    await wrapped.commit({ slug: "p", fields: { a: 1 }, files: {} });
    await wrapped.flushNow();

    expect(adapter.commit).toHaveBeenCalledTimes(1);
  });

  it("calls state machine transitions on commit lifecycle", async () => {
    const adapter = makeAdapter();
    const wrapped = createBatchedStorage(adapter);

    const states: string[] = [];
    wrapped.stateMachine.subscribe((s) => states.push(s.kind));

    await wrapped.commit({ slug: "p", fields: { a: 1 }, files: {} });
    expect(states).toContain("pendingPublish");

    // Fire the debounce timer, then drain real-timer setImmediate callbacks
    // that fake-indexeddb uses for transaction scheduling.
    await vi.advanceTimersByTimeAsync(10_000);
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));
    expect(states).toContain("publishing");
    expect(states).toContain("building");
  });

  it("flushes immediately on beforeunload", async () => {
    const adapter = makeAdapter();
    const wrapped = createBatchedStorage(adapter);
    wrapped.attachUnloadFlush(window);

    await wrapped.commit({ slug: "p", fields: { a: 1 }, files: {} });

    window.dispatchEvent(new Event("beforeunload"));
    // Drain fake-indexeddb setImmediate callbacks (same pattern as other tests)
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));

    expect(adapter.commit).toHaveBeenCalledTimes(1);
  });
});
