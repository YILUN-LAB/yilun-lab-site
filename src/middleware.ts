import { defineMiddleware } from "astro:middleware";
import { createHmac } from "node:crypto";

const FORBIDDEN_REQUEST_HEADERS = ["x-astro-path", "x-astro-locals"] as const;

const REALM = "edit.yilunlab.com (drafts)";
const USERNAME = "preview";

// Cookie set after successful basic-auth so the session survives cross-origin
// redirects (notably the OAuth round-trip through github.com). Browsers strip
// cached basic-auth credentials on cross-origin top-level redirects, but a
// SameSite=Lax cookie is sent — that's why this exists.
const SESSION_COOKIE = "yilab-preview";
const SESSION_COOKIE_MAX_AGE_S = 60 * 60 * 12; // 12 hours

function unauthorized(): Response {
  return new Response("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

function checkAuth(header: string | null, password: string): boolean {
  if (!header || !header.startsWith("Basic ")) return false;
  let decoded: string;
  try {
    decoded = atob(header.slice(6));
  } catch {
    return false;
  }
  const idx = decoded.indexOf(":");
  if (idx === -1) return false;
  return decoded.slice(0, idx) === USERNAME && decoded.slice(idx + 1) === password;
}

// HMAC the password with a constant tag. Anyone with the password can mint a
// valid cookie — that's the whole gate. No additional secret needed.
function signSession(password: string): string {
  return createHmac("sha256", password).update("preview-gate-v1").digest("base64url");
}

export const onRequest = defineMiddleware(async (context, next) => {
  if (!context.isPrerendered) {
    for (const header of FORBIDDEN_REQUEST_HEADERS) {
      if (context.request.headers.get(header) !== null) {
        return new Response("Forbidden", { status: 403 });
      }
    }
  }

  const password = import.meta.env.PREVIEW_PASSWORD;

  if (!password) {
    return next();
  }

  const expectedSession = signSession(password);
  const cookieValue = context.cookies.get(SESSION_COOKIE)?.value;
  const cookieValid = cookieValue === expectedSession;
  const headerValid = checkAuth(context.request.headers.get("authorization"), password);

  if (!cookieValid && !headerValid) {
    return unauthorized();
  }

  // Mint/refresh the session cookie when the user just authed via basic-auth.
  // SameSite=Lax means the cookie travels on top-level cross-origin redirects
  // (e.g. the github.com → edit.yilunlab.com OAuth callback), which is what
  // basic-auth credentials don't do.
  if (headerValid && !cookieValid) {
    context.cookies.set(SESSION_COOKIE, expectedSession, {
      maxAge: SESSION_COOKIE_MAX_AGE_S,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
    });
  }

  // Bare-root on the preview subdomain → land in the editor.
  // Yilun's bookmark is just edit.yilunlab.com; root → /keystatic gets her
  // straight to the admin (which then redirects to the staging branch).
  //
  // Use new Response(null, ...) instead of Response.redirect() so the
  // response has mutable headers — Astro injects the Set-Cookie minted
  // above by mutating the response, and Response.redirect() returns a
  // frozen Headers (TypeError: immutable).
  const url = new URL(context.request.url);
  if (url.pathname === "/" && url.hostname.startsWith("edit.")) {
    return new Response(null, {
      status: 302,
      headers: { Location: new URL("/keystatic", url).toString() },
    });
  }

  const response = await next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
});
