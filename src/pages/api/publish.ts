import type { APIRoute } from "astro";
import {
  fetchGithubUsername,
  githubHeaders,
  hasEditorAccess,
} from "@lib/keystatic-auth";
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

  // Dry-run mode: compare staging to main, return the ahead count and a
  // short summary of each pending commit. The UI uses count to decide
  // whether to show the Publish button, and the commit summaries to
  // render an expandable "what's changing?" panel.
  if (new URL(ctx.request.url).searchParams.get("dry-run") === "1") {
    const compare = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/main...staging`,
      { headers: githubHeaders(token) }
    );
    if (!compare.ok) {
      return jsonResponse({ ok: false, error: "api-error" }, 500);
    }
    const data = (await compare.json()) as {
      ahead_by: number;
      commits: Array<{ sha: string; commit: { message: string } }>;
    };
    const commits = (data.commits ?? []).map((c) => ({
      sha: c.sha,
      // First line of the commit message; Keystatic emits one-line messages
      // anyway but trim defensively.
      message: c.commit.message.split("\n", 1)[0],
    }));
    return jsonResponse({ ok: true, count: data.ahead_by, commits }, 200);
  }

  const result = await mergeStagingToMain({ owner, repo, token });
  const status = result.ok
    ? 200
    : result.error === "merge-conflict"
      ? 409
      : 500;
  return jsonResponse(result, status);
};
