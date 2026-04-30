import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { PillTabs, type PillTab } from "./PillTabs";
import { WorkCard, type WorkCardData } from "./WorkCard";
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
      className="relative w-full bg-black px-8 md:px-16 lg:px-20 py-28"
    >
      <motion.div {...fadeBlurIn(0)} className="mb-14">
        <div className="text-sm font-body text-white/80 mb-6">// Works · Selected</div>
        <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px] max-w-3xl">
          A field of light<br />and what it shapes.
        </h2>
        <p className="mt-6 max-w-xl text-white/80 font-body font-light text-base md:text-lg leading-snug">
          From dance and immersive performance to spatial installation and AI-driven film, each
          work is an exploration of how light makes a moment unforgettable.
        </p>
      </motion.div>

      <PillTabs tabs={tabs} activeId={filter} onChange={setFilter} className="mb-10" />
      <div className="text-xs text-white/55 font-body mb-6 -mt-4">
        {filtered.length} {filtered.length === 1 ? "work" : "works"}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {filtered.map((p, i) => (
          <WorkCard key={p.slug} project={p} idx={i} />
        ))}
      </div>
    </section>
  );
}
