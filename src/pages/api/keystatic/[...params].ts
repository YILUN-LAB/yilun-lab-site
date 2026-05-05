import type { APIRoute } from "astro";
import { makeHandler } from "@keystatic/astro/api";
import keystaticConfig from "../../../../keystatic.config";
import { fetchGithubUsername, hasEditorAccess } from "@lib/keystatic-auth";

export const prerender = false;

const baseHandler = makeHandler({ config: keystaticConfig });

// Path the Keystatic core handler matches for the GitHub OAuth exchange
// (see @keystatic/core/dist/keystatic-core-api-generic.js — `joined === 'github/oauth/callback'`).
const OAUTH_CALLBACK_SUFFIX = "/github/oauth/callback";

// Cookie name Keystatic writes after a successful OAuth exchange
// (see @keystatic/core/dist/keystatic-core-api-generic.js — `getTokenCookies`).
// The Astro wrapper relays Set-Cookie headers into ctx.cookies, so we read
// the token from there rather than from the response headers.
const ACCESS_TOKEN_COOKIE = "keystatic-gh-access-token";

export const ALL: APIRoute = async (ctx) => {
  const response = await baseHandler(ctx);

  if (!ctx.url.pathname.endsWith(OAUTH_CALLBACK_SUFFIX)) {
    return response;
  }

  const token = ctx.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return response;

  const owner = process.env.PUBLIC_KEYSTATIC_REPO_OWNER ?? "";
  const repo = process.env.PUBLIC_KEYSTATIC_REPO_NAME ?? "";
  if (!owner || !repo) return response;

  const username = await fetchGithubUsername(token);
  const allowed = username
    ? await hasEditorAccess({ token, owner, repo, username })
    : false;
  if (!allowed) {
    ctx.cookies.delete(ACCESS_TOKEN_COOKIE, { path: "/" });
    return Response.redirect(new URL("/admin/denied", ctx.url), 302);
  }

  return response;
};
