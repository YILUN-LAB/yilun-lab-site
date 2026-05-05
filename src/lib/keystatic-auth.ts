const ALLOWED_PERMISSIONS = new Set(["admin", "maintain", "write"]);

interface CheckArgs {
  token: string;
  owner: string;
  repo: string;
  username: string;
  fetchImpl?: typeof fetch;
}

/**
 * Mirrors the security boundary GitHub itself enforces on commit, so
 * "can sign in" stays in lockstep with "can save".
 */
export async function hasEditorAccess({
  token,
  owner,
  repo,
  username,
  fetchImpl = fetch,
}: CheckArgs): Promise<boolean> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/collaborators/${encodeURIComponent(username)}/permission`;
  const res = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { permission?: string };
  return ALLOWED_PERMISSIONS.has(data.permission ?? "");
}
