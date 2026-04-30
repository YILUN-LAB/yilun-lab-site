import { motion } from "motion/react";
import { ArrowUpRight } from "./icons";
import { gradientFor, type AccentName } from "@lib/accent-gradients";
import { easeOut } from "@lib/motion-presets";

export interface WorkCardData {
  slug: string;
  title: string;
  subtitle?: string;
  tagline: string;
  category: string[];
  year?: string;
  accent: AccentName;
  size: "xl" | "lg" | "md" | "sm";
}

const SIZE_CLASSES: Record<string, string> = {
  xl: "col-span-12",
  lg: "col-span-12 md:col-span-8",
  md: "col-span-12 sm:col-span-6 md:col-span-4",
  sm: "col-span-6 md:col-span-4",
};

interface WorkCardProps {
  project: WorkCardData;
  idx: number;
}

export function WorkCard({ project, idx }: WorkCardProps) {
  const aspect = project.size === "xl" ? "aspect-[16/7]" : "aspect-[4/3]";
  return (
    <motion.a
      href={`/projects/${project.slug}`}
      initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.7,
        ease: easeOut,
        delay: Math.min(idx * 0.06, 0.6),
      }}
      className={"group block text-left " + SIZE_CLASSES[project.size]}
    >
      <div className={"liquid-glass relative w-full overflow-hidden rounded-[1.25rem] " + aspect}>
        <div className="absolute inset-0" style={{ background: gradientFor(project.accent) }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(35% 30% at 50% 45%, rgba(255,255,255,0.18), transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="liquid-glass absolute left-4 top-4 rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white/80">
          {project.year || "—"}
        </div>
        <div className="liquid-glass absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <h3 className="font-heading text-2xl italic leading-none tracking-[-1px] text-white md:text-3xl lg:text-4xl">
            {project.title}
          </h3>
          {project.subtitle && (
            <div className="mt-1 font-body text-sm font-light text-white/70">
              {project.subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="max-w-[42ch] font-body text-sm font-light leading-snug text-white/85">
          {project.tagline}
        </p>
        <div className="whitespace-nowrap pt-0.5 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
          {project.category.map((c) => `Light & ${c[0].toUpperCase() + c.slice(1)}`).join(" · ")}
        </div>
      </div>
    </motion.a>
  );
}
