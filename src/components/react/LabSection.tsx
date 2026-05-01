import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";
import { selectHighlights, type HighlightInput } from "@lib/data/highlights";
import { EditorialGrid, type WorkCardData } from "./EditorialGrid";

type LabProjectInput = WorkCardData & Pick<HighlightInput, "cover" | "featured">;

interface LabSectionProps {
  projects: LabProjectInput[];
}

export function LabSection({ projects }: LabSectionProps) {
  const { lead, supporting } = selectHighlights(projects);

  // selectHighlights returns the HighlightInput subset (slug + title + tagline +
  // accent + cover + featured). Re-attach the full WorkCardData fields by looking
  // up each highlight's slug in the input projects array, so EditorialGrid gets
  // the weight + aspect + category + year fields it needs.
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const items = [lead, supporting[0], supporting[1]]
    .map((h) => bySlug.get(h.slug))
    .filter((p): p is LabProjectInput => p !== undefined);

  return (
    <section
      data-screen-label="Lab"
      id="lab"
      className="relative w-full bg-black/65 px-8 py-28 md:px-16 lg:px-20"
    >
      <motion.div {...fadeBlurIn(0)}>
        <div className="mb-6 font-body text-sm text-white/80">// The Lab</div>
        <h2 className="font-heading text-5xl italic leading-[0.9] tracking-[-2px] text-white md:text-6xl lg:text-[5.5rem]">
          Light.
          <br />
          Emotion.
          <br />
          Future.
        </h2>
      </motion.div>
      <motion.p
        {...fadeBlurIn(0.15)}
        className="mb-14 mt-6 max-w-xl font-body text-base font-light leading-snug text-white/80 md:text-lg"
      >
        An exploration of how light shapes emotion, space, and future
        experience — across performance, installation, and tech.
      </motion.p>

      <EditorialGrid items={items} mode="lab" />
    </section>
  );
}
