import { defineMiddleware } from "astro:middleware";

const FORBIDDEN_REQUEST_HEADERS = ["x-astro-path", "x-astro-locals"] as const;

export const onRequest = defineMiddleware((context, next) => {
  if (context.isPrerendered) return next();
  for (const header of FORBIDDEN_REQUEST_HEADERS) {
    if (context.request.headers.get(header) !== null) {
      return new Response("Forbidden", { status: 403 });
    }
  }
  return next();
});
