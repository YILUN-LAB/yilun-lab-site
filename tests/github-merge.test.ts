import { describe, it, expect, vi } from "vitest";
import { mergeStagingToMain } from "../src/lib/github-merge";

const ENV = { owner: "Y", repo: "r", token: "tok" };

describe("mergeStagingToMain", () => {
  it("returns noop when compare shows zero ahead", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ahead_by: 0, status: "identical" }),
    });
    const result = await mergeStagingToMain({ ...ENV, fetchImpl });
    expect(result).toEqual({ ok: true, noop: true });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("calls merge endpoint when staging is ahead, returns sha on 201", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ahead_by: 3, status: "ahead" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ sha: "abc123" }),
      });
    const result = await mergeStagingToMain({ ...ENV, fetchImpl });
    expect(result).toEqual({ ok: true, sha: "abc123", count: 3 });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const mergeCall = fetchImpl.mock.calls[1];
    expect(mergeCall[0]).toBe("https://api.github.com/repos/Y/r/merges");
    expect(mergeCall[1].method).toBe("POST");
    const body = JSON.parse(mergeCall[1].body);
    expect(body).toEqual({
      base: "main",
      head: "staging",
      commit_message: expect.stringContaining("Publish 3 change"),
    });
  });

  it("returns merge-conflict on 409", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ahead_by: 1, status: "ahead" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ message: "Merge conflict" }),
      });
    const result = await mergeStagingToMain({ ...ENV, fetchImpl });
    expect(result).toEqual({ ok: false, error: "merge-conflict" });
  });

  it("returns api-error on other failures", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ ahead_by: 1, status: "ahead" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: "boom" }),
      });
    const result = await mergeStagingToMain({ ...ENV, fetchImpl });
    expect(result).toEqual({ ok: false, error: "api-error", detail: "boom" });
  });
});
