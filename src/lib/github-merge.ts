import { githubHeaders } from "@lib/keystatic-auth";

type MergeArgs = {
  owner: string;
  repo: string;
  token: string;
  fetchImpl?: typeof fetch;
};

type MergeResult =
  | { ok: true; noop: true }
  | { ok: true; sha: string; count: number }
  | { ok: false; error: "merge-conflict" }
  | { ok: false; error: "api-error"; detail: string };

export async function mergeStagingToMain({
  owner,
  repo,
  token,
  fetchImpl = fetch,
}: MergeArgs): Promise<MergeResult> {
  const compare = await fetchImpl(
    `https://api.github.com/repos/${owner}/${repo}/compare/main...staging`,
    { headers: githubHeaders(token) }
  );
  if (!compare.ok) {
    const body = (await compare.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      ok: false,
      error: "api-error",
      detail: body.message ?? "compare failed",
    };
  }
  const { ahead_by } = (await compare.json()) as { ahead_by: number };
  if (ahead_by === 0) return { ok: true, noop: true };

  const merge = await fetchImpl(
    `https://api.github.com/repos/${owner}/${repo}/merges`,
    {
      method: "POST",
      headers: { ...githubHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({
        base: "main",
        head: "staging",
        commit_message: `Publish ${ahead_by} change${ahead_by === 1 ? "" : "s"} from edit.yilunlab.com`,
      }),
    }
  );
  if (merge.status === 409) return { ok: false, error: "merge-conflict" };
  if (!merge.ok) {
    const body = (await merge.json().catch(() => ({}))) as {
      message?: string;
    };
    return {
      ok: false,
      error: "api-error",
      detail: body.message ?? `HTTP ${merge.status}`,
    };
  }
  const { sha } = (await merge.json()) as { sha: string };
  return { ok: true, sha, count: ahead_by };
}
