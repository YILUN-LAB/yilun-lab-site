export function isAdminEnabled(): boolean {
  const mode = import.meta.env.PUBLIC_KEYSTATIC_STORAGE;
  return mode === "local" || mode === "github";
}
