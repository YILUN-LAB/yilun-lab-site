import type { APIRoute } from "astro";
import { fetchGithubUsername, hasEditorAccess } from "@lib/keystatic-auth";
import { mergeStagingToMain } from "@lib/github-merge";

export const prerender = false;

const TOKEN_COOKIE = "keystatic-gh-access-token";

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async (ctx) => {
  const token = ctx.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  const owner = import.meta.env.PUBLIC_KEYSTATIC_REPO_OWNER ?? "";
  const repo = import.meta.env.PUBLIC_KEYSTATIC_REPO_NAME ?? "";
  if (!owner || !repo) {
    return jsonResponse({ ok: false, error: "misconfigured" }, 500);
  }

  const username = await fetchGithubUsername(token);
  if (!username) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401);
  }

  const allowed = await hasEditorAccess({ token, owner, repo, username });
  if (!allowed) {
    return jsonResponse({ ok: false, error: "forbidden" }, 403);
  }

  const result = await mergeStagingToMain({ owner, repo, token });
  const status = result.ok
    ? 200
    : result.error === "merge-conflict"
      ? 409
      : 500;
  return jsonResponse(result, status);
};
