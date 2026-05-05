import { defineMiddleware } from "astro:middleware";

const FORBIDDEN_REQUEST_HEADERS = ["x-astro-path", "x-astro-locals"] as const;

const REALM = "edit.yilunlab.com (drafts)";
const USERNAME = "preview";

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

  if (!checkAuth(context.request.headers.get("authorization"), password)) {
    return unauthorized();
  }

  const response = await next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
});
