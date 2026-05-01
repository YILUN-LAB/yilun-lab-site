import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { PillTabs, type PillTab } from "./PillTabs";
import { EditorialGrid } from "./EditorialGrid";
import type { WorkCardData } from "./WorkCard";
import { fadeBlurIn } from "@lib/motion-presets";

const CATEGORIES: PillTab[] = [
  { id: "all", label: "All Works" },
  { id: "art", label: "Light & Art" },
  { id: "dance", label: "Light & Dance" },
  { id: "tech", label: "Light & Tech" },
];

interface WorksSectionProps {
  projects: WorkCardData[];
}

export function WorksSection({ projects }: WorksSectionProps) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => projects.filter((p) => filter === "all" || p.category.includes(filter)),
    [projects, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) for (const cat of p.category) c[cat] = (c[cat] || 0) + 1;
    return c;
  }, [projects]);

  const tabs = useMemo<PillTab[]>(
    () => CATEGORIES.map((t) => ({ ...t, badge: counts[t.id] || 0 })),
    [counts]
  );

  return (
    <section
      data-screen-label="Works"
      id="works"
      className="relative w-full bg-black/65 px-8 py-28 md:px-16 lg:px-20"
    >
      <motion.div {...fadeBlurIn(0)} className="mb-14">
        <div className="mb-6 font-body text-sm text-white/80">// Works · Selected</div>
        <h2 className="max-w-3xl font-heading text-5xl italic leading-[0.9] tracking-[-2px] text-white md:text-6xl lg:text-[5.5rem]">
          A field of light
          <br />
          and what it shapes.
        </h2>
        <p className="mt-6 max-w-xl font-body text-base font-light leading-snug text-white/80 md:text-lg">
          From dance and immersive performance to spatial installation and AI-driven film, each work
          is an exploration of how light makes a moment unforgettable.
        </p>
      </motion.div>

      <PillTabs tabs={tabs} activeId={filter} onChange={setFilter} className="mb-10" />
      <div className="-mt-4 mb-6 font-body text-xs text-white/55">
        {filtered.length} {filtered.length === 1 ? "work" : "works"}
      </div>

      <EditorialGrid items={filtered} mode="works" />
    </section>
  );
}
