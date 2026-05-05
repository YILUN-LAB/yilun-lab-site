import { describe, it, expect, vi } from "vitest";

const VALID = "Basic " + Buffer.from("preview:correct-horse").toString("base64");
const WRONG = "Basic " + Buffer.from("preview:wrong-pass").toString("base64");

describe("preview-auth middleware", () => {
  async function load(envPassword: string | undefined) {
    vi.resetModules();
    const env = import.meta.env as Record<string, unknown>;
    if (envPassword === undefined) {
      // Vite coerces `env.X = undefined` to the string "undefined".
      // Use `delete` to actually unset the key.
      delete env.PREVIEW_PASSWORD;
    } else {
      env.PREVIEW_PASSWORD = envPassword;
    }
    return (await import("../src/middleware")).onRequest;
  }

  it("passes through when PREVIEW_PASSWORD is unset (production)", async () => {
    const onRequest = await load(undefined);
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = { request: new Request("https://yilunlab.com/") } as any;
    const res = await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("returns 401 when password is set and request lacks auth header", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn();
    const ctx = { request: new Request("https://edit.yilunlab.com/") } as any;
    const res = await onRequest(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toMatch(/Basic/);
  });

  it("returns 401 when password is wrong", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn();
    const ctx = {
      request: new Request("https://edit.yilunlab.com/", {
        headers: { authorization: WRONG },
      }),
    } as any;
    const res = await onRequest(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(401);
  });

  it("passes through with correct credentials", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = {
      request: new Request("https://edit.yilunlab.com/about", {
        headers: { authorization: VALID },
      }),
    } as any;
    const res = await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("adds X-Robots-Tag noindex header when gated", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = {
      request: new Request("https://edit.yilunlab.com/about", {
        headers: { authorization: VALID },
      }),
    } as any;
    const res = await onRequest(ctx, next);
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  });

  it("does NOT add X-Robots-Tag when ungated (production)", async () => {
    const onRequest = await load(undefined);
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = { request: new Request("https://yilunlab.com/") } as any;
    const res = await onRequest(ctx, next);
    expect(res.headers.get("x-robots-tag")).toBeNull();
  });

  it("redirects edit.yilunlab.com root to /keystatic", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn();
    const ctx = {
      request: new Request("https://edit.yilunlab.com/", {
        headers: { authorization: VALID },
      }),
    } as any;
    const res = await onRequest(ctx, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toBe(302);
    expect(res.headers.get("location")).toMatch(/\/keystatic$/);
  });

  it("does not redirect non-root paths on edit.yilunlab.com", async () => {
    const onRequest = await load("correct-horse");
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = {
      request: new Request("https://edit.yilunlab.com/projects/foo", {
        headers: { authorization: VALID },
      }),
    } as any;
    const res = await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("does not redirect yilunlab.com root (production)", async () => {
    const onRequest = await load(undefined);
    const next = vi.fn(async () => new Response("ok", { status: 200 }));
    const ctx = { request: new Request("https://yilunlab.com/") } as any;
    const res = await onRequest(ctx, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
