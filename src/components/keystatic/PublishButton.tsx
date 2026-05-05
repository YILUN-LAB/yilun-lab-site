import type { ReactNode } from "react";
import { copy } from "@lib/keystatic-copy";
import { usePublishState } from "@lib/use-publish-state";

/**
 * Renders the "Publish N changes →" button when `staging` is ahead of
 * `main`. Hidden when there is nothing to publish. Click flow:
 * publishing → published (3s) → idle. On failure, falls back to a red
 * pill with retry copy.
 */

// Shared pill styling. Each tone maps to a pair of border/bg/text colors.
const TONE: Record<string, string> = {
  emerald:
    "border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25",
  amber: "border-amber-400/40 bg-amber-500/15 text-amber-200",
  red: "border-red-400/40 bg-red-500/15 text-red-200 hover:bg-red-500/25",
};

const PILL_BASE =
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors";

export function PublishButton() {
  const { state, count, errorKind, publish } = usePublishState();

  if (state === "idle") return null;

  let body: ReactNode;
  if (state === "ready") {
    body = (
      <button
        type="button"
        onClick={publish}
        className={`${PILL_BASE} ${TONE.emerald}`}
      >
        {copy.publish.ready(count)}
      </button>
    );
  } else if (state === "publishing") {
    body = (
      <span className={`${PILL_BASE} ${TONE.amber}`}>
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
        {copy.publish.publishing}
      </span>
    );
  } else if (state === "published") {
    body = (
      <span className={`${PILL_BASE} ${TONE.emerald}`}>
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
        {copy.publish.published}
      </span>
    );
  } else {
    const text =
      errorKind === "merge-conflict"
        ? copy.publish.conflict
        : copy.publish.networkError;
    body = (
      <button
        type="button"
        onClick={publish}
        className={`${PILL_BASE} ${TONE.red}`}
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
        {text}
      </button>
    );
  }

  return <div className="flex justify-end px-4 py-2">{body}</div>;
}
