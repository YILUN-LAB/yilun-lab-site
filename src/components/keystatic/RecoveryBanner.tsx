import { useEffect, useState } from "react";
import { copy } from "@lib/keystatic-copy";
import { saveQueue, type QueuedPayload } from "@lib/save-pipeline/indexeddb-queue";

interface RecoveryBannerProps {
  onPublish: (payloads: QueuedPayload[]) => Promise<void>;
}

export function RecoveryBanner({ onPublish }: RecoveryBannerProps) {
  const [queued, setQueued] = useState<QueuedPayload[]>([]);

  useEffect(() => {
    saveQueue.peekAll().then(setQueued);
  }, []);

  if (queued.length === 0) return null;

  const slugs = queued.map((p) => p.slug).join(", ");

  return (
    <div
      role="alert"
      className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-white/95"
    >
      <p className="mb-2 font-body">
        {copy.recoveryBanner.body}
        {queued.length > 1 && <span className="opacity-80"> ({queued.length} projects: {slugs})</span>}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPublish(queued).then(() => setQueued([]))}
          className="rounded-full bg-white/15 px-3 py-1 text-xs hover:bg-white/25"
        >
          {copy.recoveryBanner.publish}
        </button>
        <button
          type="button"
          onClick={async () => {
            await Promise.all(queued.map((p) => saveQueue.clear(p.slug)));
            setQueued([]);
          }}
          className="rounded-full bg-white/5 px-3 py-1 text-xs hover:bg-white/10"
        >
          {copy.recoveryBanner.discard}
        </button>
      </div>
    </div>
  );
}
