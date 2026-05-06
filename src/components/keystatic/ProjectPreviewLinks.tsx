import { useEffect, useState } from "react";
import { copy } from "@lib/keystatic-copy";
import { getProjectSlugFromPath } from "@lib/keystatic-routes";

const LIVE_ORIGIN = "https://www.yilunlab.com";

/**
 * Polls window.location.pathname (Keystatic uses pushState navigation that
 * does not fire popstate, hence the interval) and reports the current
 * project slug if the editor is on a project edit page, otherwise null.
 */
function useProjectSlug(): string | null {
  const [slug, setSlug] = useState<string | null>(null);
  useEffect(() => {
    const check = () => {
      const next = getProjectSlugFromPath(window.location.pathname);
      setSlug((prev) => (prev !== next ? next : prev));
    };
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);
  return slug;
}

/**
 * Renders "Open draft preview" and "Open live page" links when the editor
 * is on a project's edit page. Hidden everywhere else. Styled to match
 * Keystatic's light UI (subtle slate palette, restrained type).
 *
 * - Draft preview points to a relative URL on the same origin (the gated
 *   preview deploy at edit.yilunlab.com); the editor's session cookie
 *   carries through, so the draft renders without re-auth.
 * - Live page points at production (yilunlab.com) for side-by-side
 *   comparison.
 */
export function ProjectPreviewLinks() {
  const slug = useProjectSlug();
  if (!slug) return null;
  return (
    <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
      <span className="font-medium uppercase tracking-wide text-slate-500">
        {copy.adminShell.previewLabel}
      </span>
      <a
        href={`/projects/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-blue-700 underline underline-offset-2 hover:no-underline"
      >
        {copy.adminShell.openDraft}
      </a>
      <span aria-hidden className="text-slate-300">
        ·
      </span>
      <a
        href={`${LIVE_ORIGIN}/projects/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-slate-600 underline underline-offset-2 hover:text-slate-900 hover:no-underline"
      >
        {copy.adminShell.openLive}
      </a>
    </div>
  );
}
