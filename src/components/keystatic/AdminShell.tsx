import { makePage } from "@keystatic/astro/ui";
import keystaticConfig from "../../../keystatic.config";
import "./admin-overrides.css";

const AdminUI = makePage(keystaticConfig);

/**
 * Thin wrapper so [...params].astro can mount Keystatic with client:only.
 * Astro 6 requires the client:only target to be a statically-imported
 * component (not one derived from a variable in frontmatter).
 *
 * The save pipeline + status pill + recovery banner + help modal exist
 * as standalone modules under src/lib/save-pipeline/ and
 * src/components/keystatic/ for a future Keystatic version that exposes
 * storage-adapter wrapping. They are intentionally not rendered here:
 * Keystatic 0.5.50 doesn't expose hooks for them, so they would only
 * show as decorative noise above the admin.
 */
export function AdminShell() {
  return <AdminUI />;
}
