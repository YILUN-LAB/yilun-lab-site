import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EditorialGrid, type WorkCardData } from "../src/components/react/EditorialGrid";
import { computeAshlarLayout } from "../src/lib/ashlar";

const items: WorkCardData[] = [
  {
    slug: "soft-boundary",
    title: "Soft Boundary",
    tagline: "A solo exhibition.",
    category: ["art"],
    year: "2026",
    accent: "violet",
    weight: "lead",
  },
  {
    slug: "human-permeability",
    title: "A Human Permeability",
    tagline: "Video works.",
    category: ["art", "dance"],
    year: "2024",
    accent: "violet",
    weight: "lead",
  },
  {
    slug: "mood-cocoon",
    title: "Mood Cocoon",
    tagline: "Three environments.",
    category: ["art", "tech"],
    year: "2025",
    accent: "cyan",
    weight: "feature",
  },
];

afterEach(cleanup);

describe("EditorialGrid with Ashlar", () => {
  it("places every card through the engine's CSS variables at each breakpoint", () => {
    render(<EditorialGrid items={items} mode="works" />);
    const layout = computeAshlarLayout(items);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    links.forEach((link, index) => {
      const style = link.getAttribute("style") ?? "";
      for (const bp of ["sm", "md", "lg"] as const) {
        const p = layout[bp].best.placements[index];
        expect(style).toContain(`--ashlar-${bp}-col: ${p.x + 1} / span ${p.w}`);
        expect(style).toContain(`--ashlar-${bp}-row: ${p.y + 1} / span ${p.h}`);
      }
    });
  });

  it("shows the featured badge only on the lead in lab mode", () => {
    const { unmount } = render(<EditorialGrid items={items} mode="lab" />);
    expect(screen.getAllByText("// Featured")).toHaveLength(1);
    unmount();
    render(<EditorialGrid items={items} mode="works" />);
    expect(screen.queryByText("// Featured")).toBeNull();
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<EditorialGrid items={[]} mode="works" />);
    expect(container.querySelectorAll("a")).toHaveLength(0);
  });
});
