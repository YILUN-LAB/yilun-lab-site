import type { AccentName } from "@lib/accent-gradients";

export interface HighlightInput {
  slug: string;
  title: string;
  tagline: string;
  accent: AccentName;
  cover: string;
  featured?: number;
}

export interface ResolvedHighlights {
  lead: HighlightInput;
  supporting: [HighlightInput, HighlightInput];
}

/**
 * Picks the three projects with `featured` set and orders them by value
 * (1 = lead, 2 + 3 = supporting). Throws if the input is misconfigured —
 * the homepage cannot render without exactly one of each.
 */
export function selectHighlights(projects: HighlightInput[]): ResolvedHighlights {
  const featured = projects
    .filter((p): p is HighlightInput & { featured: number } => typeof p.featured === "number")
    .sort((a, b) => a.featured - b.featured);

  const slugs = featured.map((p) => p.slug).join(", ");

  if (featured.length !== 3) {
    throw new Error(
      `Homepage highlights expects exactly 3 projects with a \`featured\` value. ` +
        `Got ${featured.length}: ${slugs}`
    );
  }

  const values = featured.map((p) => p.featured);
  if (values[0] !== 1 || values[1] !== 2 || values[2] !== 3) {
    throw new Error(
      `Homepage highlights expects featured values to be exactly {1, 2, 3}. ` +
        `Got [${values.join(", ")}] from [${slugs}]`
    );
  }

  return {
    lead: featured[0],
    supporting: [featured[1], featured[2]],
  };
}
