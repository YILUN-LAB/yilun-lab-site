import { defineMiddleware } from "astro:middleware";

const FORBIDDEN_REQUEST_HEADERS = ["x-astro-path", "x-astro-locals"] as const;

export const onRequest = defineMiddleware(async (context, next) => {
  // Static HTML is generated at build time. BaseHead supplies preview noindex.
  if (context.isPrerendered) return next();

  for (const header of FORBIDDEN_REQUEST_HEADERS) {
    if (context.request.headers.get(header) !== null) {
      return new Response("Forbidden", { status: 403 });
    }
  }

  const response = await next();
  if (process.env.VERCEL_ENV !== "preview") return response;

  // Redirect responses may have immutable headers, so copy before updating.
  const previewResponse = new Response(response.body, response);
  previewResponse.headers.set("X-Robots-Tag", "noindex, nofollow");
  return previewResponse;
});
