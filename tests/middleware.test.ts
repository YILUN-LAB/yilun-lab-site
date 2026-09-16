import { afterEach, describe, expect, it, vi } from "vitest";
import { onRequest } from "../src/middleware";

function context(headers: Record<string, string> = {}, isPrerendered = false) {
  return {
    request: new Request("https://www.yilunlab.com/api/contact", { headers }),
    isPrerendered,
  } as Parameters<typeof onRequest>[0];
}

afterEach(() => vi.unstubAllEnvs());

describe("request middleware after editor retirement", () => {
  it.each(["production", "development"])("preserves %s responses", async (env) => {
    vi.stubEnv("VERCEL_ENV", env);
    const response = new Response("ok", { status: 201 });
    const result = await onRequest(context(), async () => response);
    expect(result).toBe(response);
    expect(result.headers.has("X-Robots-Tag")).toBe(false);
  });

  it("adds preview noindex without requiring the old password", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const result = await onRequest(context(), async () => new Response("ok"));
    expect(result.status).toBe(200);
    expect(await result.text()).toBe("ok");
    expect(result.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
    expect(result.headers.has("WWW-Authenticate")).toBe(false);
    expect(result.headers.has("Set-Cookie")).toBe(false);
  });

  it("preserves redirects with immutable headers in preview", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const result = await onRequest(context(), async () =>
      Response.redirect("https://www.yilunlab.com/", 308)
    );
    expect(result.status).toBe(308);
    expect(result.headers.get("location")).toBe("https://www.yilunlab.com/");
    expect(result.headers.get("X-Robots-Tag")).toBe("noindex, nofollow");
  });

  it.each(["x-astro-path", "x-astro-locals"])("rejects %s on runtime requests", async (header) => {
    const next = vi.fn();
    const result = await onRequest(context({ [header]: "injected" }), next);
    expect(result.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("leaves prerendering to the page, even in preview", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    const response = new Response("static page");
    expect(await onRequest(context({}, true), async () => response)).toBe(response);
    expect(response.headers.has("X-Robots-Tag")).toBe(false);
  });
});
