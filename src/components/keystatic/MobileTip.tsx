import { useState } from "react";
import { copy } from "@lib/keystatic-copy";

const STORAGE_KEY = "keystatic.mobileTipDismissed";

export function MobileTip() {
  const [dismissed, setDismissed] = useState(
    typeof sessionStorage !== "undefined" && sessionStorage.getItem(STORAGE_KEY) === "1"
  );

  if (dismissed) return null;

  return (
    <div className="md:hidden mb-4 rounded-md border border-white/15 bg-white/5 px-4 py-3 text-xs text-white/85">
      <div className="flex items-start justify-between gap-3">
        <p className="font-body leading-relaxed">{copy.mobileTip.body}</p>
        <button
          type="button"
          aria-label="Dismiss tip"
          onClick={() => {
            sessionStorage.setItem(STORAGE_KEY, "1");
            setDismissed(true);
          }}
          className="-mt-1 rounded-full px-2 py-1 text-base text-white/55 hover:text-white/95"
        >
          ×
        </button>
      </div>
    </div>
  );
}
