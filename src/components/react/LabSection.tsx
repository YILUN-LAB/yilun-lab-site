import { motion } from "motion/react";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";
import { selectHighlights, type HighlightInput } from "@lib/data/highlights";

interface LabSectionProps {
  projects: HighlightInput[];
}

export function LabSection({ projects }: LabSectionProps) {
  const { lead, supporting } = selectHighlights(projects);

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

      <div className="grid grid-cols-12 gap-5">
        <LeadCard project={lead} />
        <div className="col-span-12 flex flex-col gap-5 md:col-span-5">
          <SupportingCard project={supporting[0]} delay={0.12} />
          <SupportingCard project={supporting[1]} delay={0.24} />
        </div>
      </div>
    </section>
  );
}

function LeadCard({ project }: { project: HighlightInput }) {
  return (
    <motion.a
      {...fadeBlurIn(0)}
      href={`/projects/${project.slug}`}
      className="group col-span-12 block md:col-span-7"
    >
      <div className="liquid-glass relative aspect-[4/5] w-full overflow-hidden rounded-[1.25rem]">
        <img
          src={project.cover}
          alt={`${project.title} — cover`}
          loading="eager"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="liquid-glass absolute left-4 top-4 rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white/85">
          // Featured
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <h3 className="font-heading text-4xl italic leading-[0.9] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl">
            {project.title}
          </h3>
          <p className="mt-3 max-w-xl font-body text-base font-light text-white/85 md:text-lg">
            {project.tagline}
          </p>
          <span className="liquid-glass-strong liquid-glass-tint mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 font-body text-sm font-semibold transition-transform group-hover:translate-x-0.5">
            View case study <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}

function SupportingCard({
  project,
  delay,
}: {
  project: HighlightInput;
  delay: number;
}) {
  return (
    <motion.a
      {...fadeBlurIn(delay)}
      href={`/projects/${project.slug}`}
      className="group block"
    >
      <div className="liquid-glass relative aspect-[16/10] w-full overflow-hidden rounded-[1.25rem]">
        <img
          src={project.cover}
          alt={`${project.title} — cover`}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <h3 className="font-heading text-3xl italic leading-[0.95] tracking-[-1px] text-white md:text-4xl">
            {project.title}
          </h3>
          <p className="mt-2 max-w-md font-body text-sm font-light text-white/85 md:text-base">
            {project.tagline}
          </p>
          <span className="liquid-glass mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-body text-xs font-medium text-white transition-transform group-hover:translate-x-0.5">
            View case study <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </motion.a>
  );
}
