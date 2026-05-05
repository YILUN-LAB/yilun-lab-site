import { useEffect, useState } from "react";
import { makePage } from "@keystatic/astro/ui";
import keystaticConfig from "../../../keystatic.config";
import { copy } from "@lib/keystatic-copy";
import "./admin-overrides.css";

const AdminUI = makePage(keystaticConfig);

/**
 * Reads `window.location.pathname` and reports whether the user is
 * currently viewing the Keystatic admin scoped to the `main` branch.
 * Polls every 500 ms because Keystatic uses pushState for branch
 * switches and pushState does not fire `popstate`.
 */
function useIsOnMainBranch(): boolean {
  const [onMain, setOnMain] = useState(false);
  useEffect(() => {
    const check = () => {
      const next = window.location.pathname.includes("/keystatic/branch/main/");
      setOnMain((prev) => (prev !== next ? next : prev));
    };
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, []);
  return onMain;
}

/**
 * Thin wrapper so [...params].astro can mount Keystatic with client:only.
 * Astro 6 requires the client:only target to be a statically-imported
 * component (not one derived from a variable in frontmatter).
 *
 * Renders a soft warning banner when the user is on the `main` branch
 * (URL contains `/keystatic/branch/main/`) so accidental clicks in
 * Keystatic's branch picker — which would commit straight to live —
 * are visible. Yilun's normal flow stays on `staging` and never sees it.
 *
 * The save pipeline + status pill + recovery banner + help modal exist
 * as standalone modules under src/lib/save-pipeline/ and
 * src/components/keystatic/ for a future Keystatic version that exposes
 * storage-adapter wrapping. They are intentionally not rendered here:
 * Keystatic 0.5.50 doesn't expose hooks for them, so they would only
 * show as decorative noise above the admin.
 */
export function AdminShell() {
  const onMain = useIsOnMainBranch();
  return (
    <>
      {onMain && (
        <div
          role="alert"
          className="bg-amber-500/15 border-b border-amber-400/40 px-4 py-2 text-sm text-amber-100 text-center"
        >
          {copy.adminShell.mainBranchWarning}
        </div>
      )}
      <AdminUI />
    </>
  );
}
