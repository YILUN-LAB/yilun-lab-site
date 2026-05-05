import { useEffect, useState } from "react";
import { copy } from "@lib/keystatic-copy";
import type { SaveStateMachine, SaveState } from "@lib/save-pipeline/state-machine";

interface StatusPillProps {
  stateMachine: SaveStateMachine;
  liveSiteUrl?: string;
  onPublishNow?: () => void;
  onRetry?: () => void;
}

export function StatusPill({
  stateMachine,
  liveSiteUrl,
  onPublishNow,
  onRetry,
}: StatusPillProps) {
  const [state, setState] = useState<SaveState>(stateMachine.getState());
  const [expanded, setExpanded] = useState(false);

  useEffect(() => stateMachine.subscribe(setState), [stateMachine]);

  const visual = visualFor(state);

  return (
    <div className="relative inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/10"
        aria-expanded={expanded}
      >
        <span aria-hidden className={`inline-block h-1.5 w-1.5 rounded-full ${visual.dotClass}`} />
        <span className="font-body font-light">{visual.label}</span>
      </button>
      {state.kind === "pendingPublish" && (
        <button
          type="button"
          onClick={onPublishNow}
          className="text-xs text-white/85 underline underline-offset-2 hover:no-underline"
        >
          {copy.pill.publishNow}
        </button>
      )}
      {state.kind === "error" && (
        <button
          type="button"
          onClick={onRetry}
          className="text-xs text-white/85 underline underline-offset-2 hover:no-underline"
        >
          Retry
        </button>
      )}

      {expanded && (
        <div
          role="dialog"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-md border border-white/15 bg-black/95 p-4 text-xs text-white/85 shadow-xl"
        >
          <p className="mb-3 font-body leading-relaxed">{detailFor(state)}</p>
          {liveSiteUrl && (
            <a
              href={liveSiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block underline underline-offset-2 hover:no-underline"
            >
              Open the live site
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function visualFor(state: SaveState): { dotClass: string; label: string } {
  switch (state.kind) {
    case "saved":
      return { dotClass: "bg-emerald-400", label: copy.pill.saved };
    case "editing":
      return { dotClass: "bg-amber-400", label: copy.pill.editing };
    case "pendingPublish":
      return {
        dotClass: "bg-amber-400",
        label: copy.pill.pendingPublish(state.secondsRemaining),
      };
    case "publishing":
      return { dotClass: "bg-amber-300 animate-pulse", label: copy.pill.publishing };
    case "building":
      return {
        dotClass: "bg-amber-300 animate-pulse",
        label: copy.pill.building(state.secondsRemaining),
      };
    case "liveEstimated":
      return { dotClass: "bg-emerald-400", label: copy.pill.likelyLive };
    case "error":
      return { dotClass: "bg-red-500", label: copy.pill.saveFailed };
  }
}

function detailFor(state: SaveState): string {
  switch (state.kind) {
    case "saved":
      return "All changes are saved.";
    case "editing":
      return "You have unsaved changes.";
    case "pendingPublish":
      return `Your save will be published to the site in ${state.secondsRemaining} seconds. If you keep editing, this timer resets.`;
    case "publishing":
      return "Publishing your changes to GitHub now.";
    case "building":
      return `Your changes are committed. Vercel is building the site — usually about ${state.secondsRemaining} seconds.`;
    case "liveEstimated":
      return "Your changes should be live now. Open the site to verify.";
    case "error":
      return `Something went wrong: ${state.message}. Click Retry to try again.`;
  }
}
