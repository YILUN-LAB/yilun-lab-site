import type { ReactNode } from "react";
import { motion } from "motion/react";
import { gradientFor, type AccentName } from "@lib/accent-gradients";
import { fadeBlurIn } from "@lib/motion-presets";

interface ChapterProps {
  name: string;
  note?: string;
  accent?: AccentName;
  cover?: string;
  children?: ReactNode;
}

export function Chapter({ name, note, accent, cover, children }: ChapterProps) {
  const accentKey: AccentName = accent ?? "amber";

  return (
    <motion.section
      data-chapter-name={name}
      {...fadeBlurIn(0)}
      className="mx-auto max-w-6xl px-8 py-16 md:px-16 lg:px-20"
    >
      <div className="mb-8">
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
          // Chapter
        </div>
        <h3 className="font-heading text-4xl italic leading-[0.95] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl">
          {name}
        </h3>
        {note && (
          <p className="mt-2 font-body text-base font-light italic text-white/70 md:text-lg">
            {note}
          </p>
        )}
      </div>

      <div className="liquid-glass relative mb-8 aspect-[16/9] overflow-hidden rounded-[1.25rem]">
        {cover ? (
          <img
            src={cover}
            alt={`${name} — cover`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(accentKey) }} />
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

      <div className="prose prose-invert mx-auto max-w-3xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg [&>p]:mb-4">
        {children}
      </div>
    </motion.section>
  );
}
