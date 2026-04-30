import { motion } from "motion/react";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Roles", "Artist · Designer · Founder"],
  ["Disciplines", "Spatial · Stage · Installation"],
  ["Recent", "MIT AI Filmmaking Hackathon 2025"],
  ["Open to", "Commission · Collaboration"],
];

export function AboutSection() {
  return (
    <section
      data-screen-label="About"
      id="about"
      className="relative bg-black px-8 md:px-16 lg:px-20 py-28"
    >
      <motion.div {...fadeBlurIn(0)} className="mb-14 max-w-7xl mx-auto">
        <div className="text-sm font-body text-white/80 mb-6">// Founder</div>
        <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px]">
          Yilun (Yilia) Zhan.
        </h2>
        <p className="mt-6 text-base md:text-lg text-white/85 font-body font-light max-w-2xl">
          Lighting artist, lighting designer, and founder of YILUN LAB.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start max-w-7xl mx-auto">
        <motion.div
          {...fadeBlurIn(0.1)}
          className="liquid-glass rounded-[1.25rem] aspect-[4/5] overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 35%, rgba(245,185,66,0.55), transparent 70%), linear-gradient(to bottom, #150d08 0%, #050407 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(20% 15% at 50% 38%, rgba(255,220,170,0.6), transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[20%] h-[70%] rounded-t-full"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55))" }}
          />
          <div className="absolute top-4 left-4 liquid-glass rounded-full px-3 py-1 text-[10px] text-white/80 font-body uppercase tracking-wider">
            Portrait — placeholder
          </div>
        </motion.div>

        <motion.div {...fadeBlurIn(0.2)} className="flex flex-col gap-6">
          <p className="text-base md:text-lg text-white/90 font-body font-light leading-relaxed">
            Yilun Zhan's practice focuses on creating emotional, immersive, and human-centered
            experiences through light — across spatial design, installation, performance, and
            emerging technology.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
            With a background in professional lighting design and a growing body of artistic and
            interdisciplinary work, she brings both conceptual vision and design sensitivity to
            projects that seek stronger emotional impact and distinctive visual identity.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
            She is especially interested in collaborations in art, culture, hospitality, wellness,
            and future-facing experiences — where light can shape how people feel, connect, and
            remember a space.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
                  {k}
                </div>
                <div className="font-heading italic text-white text-lg leading-tight">{v}</div>
              </div>
            ))}
          </div>

          <a
            href="/about"
            className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 self-start mt-2"
          >
            Read full bio <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
