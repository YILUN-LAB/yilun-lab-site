import { useState } from "react";

interface HelpModalProps {
  notionGuideUrl?: string;
}

export function HelpModal({ notionGuideUrl }: HelpModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Help"
        className="rounded-full border border-white/15 bg-white/5 px-2 py-1 text-xs text-white/85 hover:bg-white/10"
      >
        ?
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/15 bg-black/95 p-6 text-sm text-white/90"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 font-heading text-xl italic">Editor help</h2>

            <h3 className="mb-2 font-body text-xs uppercase tracking-[0.18em] text-white/55">
              Common tasks
            </h3>
            <ul className="mb-6 space-y-2 font-body leading-relaxed">
              <li>
                <strong>Edit a project:</strong> Click any project in the list. Edit fields. Click
                Save.
              </li>
              <li>
                <strong>Add a new project:</strong> Click "+ New project" at the top. Fill in title,
                tagline, and at least one image. Click Save.
              </li>
              <li>
                <strong>Change the homepage order:</strong> Edit the "Order" field in the Status
                section. Lower numbers appear first.
              </li>
              <li>
                <strong>Feature a project on the homepage:</strong> Set "Featured slot" to 1, 2, or
                3 in the Status section. The site has three featured slots.
              </li>
              <li>
                <strong>Add a YouTube video:</strong> Paste the 11-character video ID into the
                YouTube field. Don't paste the full URL.
              </li>
              <li>
                <strong>Hide a project temporarily:</strong> Toggle "Draft" on in the Status
                section. The project disappears from the live site until you toggle it off.
              </li>
            </ul>

            <h3 className="mb-2 font-body text-xs uppercase tracking-[0.18em] text-white/55">
              Tips
            </h3>
            <ul className="mb-6 list-disc space-y-1 pl-5 font-body leading-relaxed">
              <li>
                Each save creates a version on GitHub — you can keep saving, but small batches work
                best.
              </li>
              <li>Image uploads are limited to 25 MB. JPGs work best.</li>
              <li>
                If something looks wrong on the live site after a save, give it 1–2 minutes to
                deploy.
              </li>
            </ul>

            <h3 className="mb-2 font-body text-xs uppercase tracking-[0.18em] text-white/55">
              When to ask Rudy
            </h3>
            <ul className="mb-6 list-disc space-y-1 pl-5 font-body leading-relaxed">
              <li>Changing a project's layout style (image wall vs. video vs. chapters)</li>
              <li>Renaming a project's URL</li>
              <li>Changing the homepage filter categories</li>
              <li>Anything that breaks the site</li>
            </ul>

            {notionGuideUrl && (
              <a
                href={notionGuideUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-full border border-white/25 px-4 py-2 text-xs hover:bg-white/5"
              >
                Full guide → opens in new tab
              </a>
            )}

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-3 rounded-full bg-white/10 px-4 py-2 text-xs hover:bg-white/15"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
