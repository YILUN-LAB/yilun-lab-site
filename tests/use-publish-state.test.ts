import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor, cleanup } from "@testing-library/react";
import { usePublishState } from "../src/lib/use-publish-state";

global.fetch = vi.fn();

describe("usePublishState", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("starts in 'idle' state when nothing to publish", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, count: 0 }),
    });
    const { result } = renderHook(() => usePublishState({ pollInterval: 0 }));
    await waitFor(() => expect(result.current.state).toBe("idle"));
    expect(result.current.count).toBe(0);
  });

  it("transitions to 'ready' when staging is ahead", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, count: 3 }),
    });
    const { result } = renderHook(() => usePublishState({ pollInterval: 0 }));
    await waitFor(() => expect(result.current.state).toBe("ready"));
    expect(result.current.count).toBe(3);
  });

  it("publish() transitions to 'publishing' then 'published' on success", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, count: 2 }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, sha: "x", count: 2 }),
      });
    const { result } = renderHook(() => usePublishState({ pollInterval: 0 }));
    await waitFor(() => expect(result.current.state).toBe("ready"));
    await act(async () => {
      await result.current.publish();
    });
    expect(result.current.state).toBe("published");
  });

  it("transitions to 'error' with merge-conflict on 409", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true, count: 1 }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ ok: false, error: "merge-conflict" }),
      });
    const { result } = renderHook(() => usePublishState({ pollInterval: 0 }));
    await waitFor(() => expect(result.current.state).toBe("ready"));
    await act(async () => {
      await result.current.publish();
    });
    expect(result.current.state).toBe("error");
    expect(result.current.errorKind).toBe("merge-conflict");
  });
});
