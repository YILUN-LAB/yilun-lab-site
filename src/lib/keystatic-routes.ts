// Parses Keystatic admin URLs like
//   /keystatic/branch/staging/collection/projects/item/true-self
// and returns the project slug, or null if the path isn't a project edit page.
const PROJECT_EDIT_RE =
  /^\/keystatic\/branch\/[^/]+\/collection\/projects\/item\/([^/]+)\/?$/;

export function getProjectSlugFromPath(pathname: string): string | null {
  return pathname.match(PROJECT_EDIT_RE)?.[1] ?? null;
}
