/**
 * Unlisted projects (for example a competition entry) keep their own page but
 * stay off the homepage and out of other projects' next-work links.
 */
interface SequencedProject {
  id: string;
  data: { unlisted?: boolean };
}

export function listedProjects<T extends SequencedProject>(sorted: T[]): T[] {
  return sorted.filter((project) => !project.data.unlisted);
}

/** The next listed project after `current` in `sorted`, wrapping around. */
export function nextWorkFor<T extends SequencedProject>(sorted: T[], current: T): T {
  const start = sorted.indexOf(current);
  for (let step = 1; step <= sorted.length; step++) {
    const candidate = sorted[(start + step) % sorted.length];
    if (!candidate.data.unlisted && candidate !== current) return candidate;
  }
  throw new Error(`No listed project to follow "${current.id}"`);
}
