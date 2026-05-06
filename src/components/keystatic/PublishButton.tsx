import { useState } from "react";
import { copy } from "@lib/keystatic-copy";
import { usePublishState } from "@lib/use-publish-state";

/**
 * Renders an admin-chrome bar above Keystatic's UI when `staging` is ahead
 * of `main`, exposing a Publish action and an expandable list of pending
 * commits ("what's changing?"). Hidden when there is nothing to publish.
 *
 * Visual style matches Keystatic's light UI rather than the marketing
 * site's dark liquid-glass palette — light backgrounds, subtle borders,
 * blue primary accent.
 */
export function PublishButton() {
  const { state, count, commits, errorKind, publish } = usePublishState();
  const [expanded, setExpanded] = useState(false);

  if (state === "idle") return null;

  if (state === "ready") {
    return (
      <div className="border-b border-slate-200 bg-blue-50/60 px-4 py-2 text-sm text-slate-700">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-900">
              {copy.publish.pendingLabel(count)}
            </span>
            {commits.length > 0 && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="text-xs text-slate-600 underline underline-offset-2 hover:text-slate-900 hover:no-underline"
              >
                {expanded ? copy.publish.hideDetails : copy.publish.showDetails}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={publish}
            className="inline-flex items-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            {copy.publish.ready(count)}
          </button>
        </div>
        {expanded && commits.length > 0 && (
          <ul className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-xs text-slate-700">
            {commits.map((c) => (
              <li key={c.sha} className="flex items-baseline gap-2">
                <span className="font-mono text-[10px] text-slate-400">
                  {c.sha.slice(0, 7)}
                </span>
                <span>{c.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  if (state === "publishing") {
    return (
      <div className="border-b border-slate-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
          {copy.publish.publishing}
        </span>
      </div>
    );
  }

  if (state === "published") {
    return (
      <div className="border-b border-slate-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-900">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          {copy.publish.published}
        </span>
      </div>
    );
  }

  // error
  const text =
    errorKind === "merge-conflict"
      ? copy.publish.conflict
      : copy.publish.networkError;
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-rose-50 px-4 py-2 text-sm text-rose-900">
      <span className="inline-flex items-center gap-2">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
        {text}
      </span>
      <button
        type="button"
        onClick={publish}
        className="rounded-md border border-rose-300 bg-white px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100"
      >
        Retry
      </button>
    </div>
  );
}
