import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useChaptersContext } from "./ChaptersContext";
import { gradientFor } from "@lib/accent-gradients";
import { fadeBlurIn } from "@lib/motion-presets";

interface ChapterProps {
  name: string;
  children?: ReactNode;
}

export function Chapter({ name, children }: ChapterProps) {
  const ctx = useChaptersContext();
  const meta = ctx.chapters.find((c) => c.name === name);

  if (ctx.variant === "chapters-tabbed" && ctx.activeName !== name) {
    return null;
  }

  const accent = meta?.accent || "amber";

  return (
    <motion.section
      key={name}
      {...fadeBlurIn(0)}
      className="px-8 md:px-16 lg:px-20 py-16 max-w-6xl mx-auto"
    >
      {ctx.variant === "chapters" && (
        <div className="mb-8">
          <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-2">
            // Chapter
          </div>
          <h3 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-1.5px]">
            {name}
          </h3>
          {meta?.note && (
            <p className="mt-2 text-base md:text-lg text-white/70 font-body font-light italic">
              {meta.note}
            </p>
          )}
        </div>
      )}

      <div className="liquid-glass relative overflow-hidden rounded-[1.25rem] aspect-[16/9] mb-8">
        {meta?.cover ? (
          <img
            src={meta.cover}
            alt={`${name} — cover`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(accent) }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 35% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      <div className="prose prose-invert max-w-3xl mx-auto text-base md:text-lg text-white/90 font-body font-light leading-relaxed [&>p]:mb-4">
        {children}
      </div>
    </motion.section>
  );
}
