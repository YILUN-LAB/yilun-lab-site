import { describe, it, expect, vi } from "vitest";
import { createHmac } from "node:crypto";

const VALID = "Basic " + Buffer.from("preview:correct-horse").toString("base64");
const WRONG = "Basic " + Buffer.from("preview:wrong-pass").toString("base64");

// Mirrors signSession() in src/middleware.ts so tests can assert exact cookie values.
function expectedSession(password: string): string {
  return createHmac("sha256", password).update("preview-gate-v1").digest("base64url");
}

function makeCookieJar(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial));
  const setCalls: Array<{ name: string; value: string; opts?: unknown }> = [];
  return {
    store,
    setCalls,
    api: {
      get: (name: string) =>
        store.has(name) ? { value: store.get(name)! } : undefined,
      set: (name: string, value: string, opts?: unknown) => {
        store.set(name, value);
        setCalls.push({ name, value, opts });
      },
      delete: (name: string) => {
        store.delete(name);
      },
    },
  };
}

function makeCtx({
  url = "https://edit.yilunlab.com/about",
  headers,
  cookies,
}: {
  url?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
} = {}) {
  const jar = makeCookieJar(cookies);
  const ctx = {
    request: new Request(url, { headers }),
    cookies: jar.api,
  } as unknown as Parameters<
    Awaited<ReturnType<typeof loadOnRequest>>
  >[0];
  return { ctx, jar };
}

async function loadOnRequest(envPassword: string | undefined) {
  vi.resetModules();
  const env = import.meta.env as Record<string, unknown>;
  if (envPassword === undefined) {
    // Vite coerces `env.X = undefined` to the string "undefined". Use `delete`.
    delete env.PREVIEW_PASSWORD;
  } else {
    env.PREVIEW_PASSWORD = envPassword;
  }
  return (await import("../src/middleware")).onRequest;
}

describe("preview-auth middleware", () => {
  describe("PREVIEW_PASSWORD unset (production)", () => {
    it("passes through unconditionally", async () => {
      const onRequest = await loadOnRequest(undefined);
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx } = makeCtx({ url: "https://yilunlab.com/" });
      const res = await onRequest(ctx, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });

    it("does NOT add X-Robots-Tag", async () => {
      const onRequest = await loadOnRequest(undefined);
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx } = makeCtx({ url: "https://yilunlab.com/" });
      const res = await onRequest(ctx, next);
      expect(res.headers.get("x-robots-tag")).toBeNull();
    });

    it("does not redirect yilunlab.com root", async () => {
      const onRequest = await loadOnRequest(undefined);
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx } = makeCtx({ url: "https://yilunlab.com/" });
      const res = await onRequest(ctx, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe("basic-auth header (first-visit path)", () => {
    it("returns 401 with no auth header and no cookie", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn();
      const { ctx } = makeCtx({ url: "https://edit.yilunlab.com/" });
      const res = await onRequest(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(401);
      expect(res.headers.get("www-authenticate")).toMatch(/Basic/);
    });

    it("returns 401 when basic-auth password is wrong", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn();
      const { ctx } = makeCtx({ headers: { authorization: WRONG } });
      const res = await onRequest(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(401);
    });

    it("passes through with correct basic-auth credentials and sets a session cookie", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx, jar } = makeCtx({ headers: { authorization: VALID } });
      const res = await onRequest(ctx, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(jar.setCalls).toHaveLength(1);
      expect(jar.setCalls[0]).toMatchObject({
        name: "yilab-preview",
        value: expectedSession("correct-horse"),
      });
      expect(jar.setCalls[0].opts).toMatchObject({
        sameSite: "lax",
        httpOnly: true,
        secure: true,
        path: "/",
      });
    });

    it("adds X-Robots-Tag when gated", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx } = makeCtx({ headers: { authorization: VALID } });
      const res = await onRequest(ctx, next);
      expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
    });

    it("redirects edit.yilunlab.com root to /keystatic", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn();
      const { ctx } = makeCtx({
        url: "https://edit.yilunlab.com/",
        headers: { authorization: VALID },
      });
      const res = await onRequest(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(302);
      expect(res.headers.get("location")).toMatch(/\/keystatic$/);
    });

    it("does not redirect non-root paths", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx } = makeCtx({
        url: "https://edit.yilunlab.com/projects/foo",
        headers: { authorization: VALID },
      });
      const res = await onRequest(ctx, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).toBe(200);
    });
  });

  describe("session cookie (subsequent-request path)", () => {
    it("passes through with valid cookie and no auth header", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx, jar } = makeCtx({
        cookies: { "yilab-preview": expectedSession("correct-horse") },
      });
      const res = await onRequest(ctx, next);
      expect(next).toHaveBeenCalled();
      expect(res.status).toBe(200);
      // Cookie already valid → don't re-set it on every request.
      expect(jar.setCalls).toHaveLength(0);
    });

    it("rejects a tampered cookie value", async () => {
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn();
      const { ctx } = makeCtx({
        cookies: { "yilab-preview": "not-a-real-signature" },
      });
      const res = await onRequest(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(401);
    });

    it("rejects a cookie signed with a different password (e.g. password rotated)", async () => {
      const onRequest = await loadOnRequest("new-password");
      const next = vi.fn();
      const { ctx } = makeCtx({
        cookies: { "yilab-preview": expectedSession("old-password") },
      });
      const res = await onRequest(ctx, next);
      expect(next).not.toHaveBeenCalled();
      expect(res.status).toBe(401);
    });

    it("survives the OAuth round-trip — cookie set by /login carries to /callback", async () => {
      // Step 1: /github/login arrives with basic-auth header (same-origin click).
      // Middleware mints the cookie + lets the request through.
      const onRequest = await loadOnRequest("correct-horse");
      const next = vi.fn(async () => new Response("ok", { status: 200 }));
      const { ctx: loginCtx, jar } = makeCtx({
        url: "https://edit.yilunlab.com/api/keystatic/github/login",
        headers: { authorization: VALID },
      });
      await onRequest(loginCtx, next);
      const mintedCookie = jar.setCalls[0]?.value;
      expect(mintedCookie).toBe(expectedSession("correct-horse"));

      // Step 2: github.com redirects back to /callback. The browser strips
      // basic-auth credentials on cross-origin redirects, but DOES send the
      // SameSite=Lax cookie. Middleware must accept the cookie alone.
      const { ctx: callbackCtx } = makeCtx({
        url: "https://edit.yilunlab.com/api/keystatic/github/oauth/callback?code=x",
        cookies: { "yilab-preview": mintedCookie },
        // No authorization header — that's the whole point.
      });
      const callbackRes = await onRequest(callbackCtx, next);
      expect(callbackRes.status).toBe(200);
    });
  });
});
