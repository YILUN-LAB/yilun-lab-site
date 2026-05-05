export function getKeystaticEntryRedirect(
  pathname: string,
  branch: string | undefined
): string | null {
  if (pathname !== "/keystatic" && pathname !== "/keystatic/") {
    return null;
  }
  const target = branch && branch.length > 0 ? branch : "main";
  return `/keystatic/branch/${target}/`;
}
