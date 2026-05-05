import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@lib/keystatic-auth", () => ({
  fetchGithubUsername: vi.fn(),
  hasEditorAccess: vi.fn(),
  githubHeaders: (token: string) => ({ Authorization: `Bearer ${token}` }),
}));
vi.mock("@lib/github-merge", () => ({
  mergeStagingToMain: vi.fn(),
}));

import { fetchGithubUsername, hasEditorAccess } from "@lib/keystatic-auth";
import { mergeStagingToMain } from "@lib/github-merge";
import { POST } from "../src/pages/api/publish";

function makeContext(cookieValue: string | null) {
  const cookies = {
    get: (name: string) =>
      name === "keystatic-gh-access-token" && cookieValue
        ? { value: cookieValue }
        : undefined,
  };
  return {
    request: new Request("http://localhost/api/publish", { method: "POST" }),
    cookies,
    url: new URL("http://localhost/api/publish"),
  } as any;
}

describe("/api/publish", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_REPO_OWNER =
      "Y";
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_REPO_NAME =
      "r";
    (fetchGithubUsername as any).mockResolvedValue("rudyz");
  });

  it("returns 401 when no token cookie present", async () => {
    const res = await POST(makeContext(null));
    expect(res.status).toBe(401);
  });

  it("returns 403 when user is not in editor allowlist", async () => {
    (hasEditorAccess as any).mockResolvedValue(false);
    const res = await POST(makeContext("token-abc"));
    expect(res.status).toBe(403);
  });

  it("returns 200 with noop when staging matches main", async () => {
    (hasEditorAccess as any).mockResolvedValue(true);
    (mergeStagingToMain as any).mockResolvedValue({ ok: true, noop: true });
    const res = await POST(makeContext("token-abc"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, noop: true });
  });

  it("returns 200 with sha on successful merge", async () => {
    (hasEditorAccess as any).mockResolvedValue(true);
    (mergeStagingToMain as any).mockResolvedValue({
      ok: true,
      sha: "abc",
      count: 2,
    });
    const res = await POST(makeContext("token-abc"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, sha: "abc", count: 2 });
  });

  it("returns 409 with merge-conflict error", async () => {
    (hasEditorAccess as any).mockResolvedValue(true);
    (mergeStagingToMain as any).mockResolvedValue({
      ok: false,
      error: "merge-conflict",
    });
    const res = await POST(makeContext("token-abc"));
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ ok: false, error: "merge-conflict" });
  });

  it("dry-run mode returns count without calling mergeStagingToMain", async () => {
    (hasEditorAccess as any).mockResolvedValue(true);
    // Stub global fetch for the username AND the compare API
    global.fetch = vi.fn(async (url: string) => {
      if (url.includes("/user")) {
        return new Response(JSON.stringify({ login: "rudyz" }), {
          status: 200,
        });
      }
      if (url.includes("/compare/")) {
        return new Response(JSON.stringify({ ahead_by: 3 }), { status: 200 });
      }
      throw new Error(`Unexpected fetch ${url}`);
    }) as any;

    const ctx = {
      request: new Request("http://localhost/api/publish?dry-run=1", {
        method: "POST",
      }),
      cookies: { get: () => ({ value: "token-abc" }) },
      url: new URL("http://localhost/api/publish?dry-run=1"),
    } as any;

    const res = await POST(ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, count: 3 });
    expect(mergeStagingToMain).not.toHaveBeenCalled();
  });
});
