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
 * is on a project's edit page. Hidden everywhere else.
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
    <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-4 py-2 text-xs">
      <span className="text-white/50">{copy.adminShell.previewLabel}:</span>
      <a
        href={`/projects/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-emerald-300 underline underline-offset-2 hover:no-underline"
      >
        {copy.adminShell.openDraft}
      </a>
      <span className="text-white/30">·</span>
      <a
        href={`${LIVE_ORIGIN}/projects/${slug}`}
        target="_blank"
        rel="noreferrer"
        className="text-white/60 underline underline-offset-2 hover:no-underline"
      >
        {copy.adminShell.openLive}
      </a>
    </div>
  );
}
