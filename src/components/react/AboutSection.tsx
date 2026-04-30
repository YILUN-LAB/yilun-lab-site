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
      className="relative bg-black px-8 py-28 md:px-16 lg:px-20"
    >
      <motion.div {...fadeBlurIn(0)} className="mx-auto mb-14 max-w-7xl">
        <div className="mb-6 font-body text-sm text-white/80">// Founder</div>
        <h2 className="font-heading text-5xl italic leading-[0.9] tracking-[-2px] text-white md:text-6xl lg:text-[5.5rem]">
          Yilun (Yilia) Zhan.
        </h2>
        <p className="mt-6 max-w-2xl font-body text-base font-light text-white/85 md:text-lg">
          Lighting artist, lighting designer, and founder of YILUN LAB.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16">
        <motion.div
          {...fadeBlurIn(0.1)}
          className="liquid-glass relative aspect-[4/5] overflow-hidden rounded-[1.25rem]"
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
            className="absolute bottom-0 left-1/2 h-[70%] w-[20%] -translate-x-1/2 rounded-t-full"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55))" }}
          />
          <div className="liquid-glass absolute left-4 top-4 rounded-full px-3 py-1 font-body text-[10px] uppercase tracking-wider text-white/80">
            Portrait — placeholder
          </div>
        </motion.div>

        <motion.div {...fadeBlurIn(0.2)} className="flex flex-col gap-6">
          <p className="font-body text-base font-light leading-relaxed text-white/90 md:text-lg">
            Yilun Zhan's practice focuses on creating emotional, immersive, and human-centered
            experiences through light — across spatial design, installation, performance, and
            emerging technology.
          </p>
          <p className="font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
            With a background in professional lighting design and a growing body of artistic and
            interdisciplinary work, she brings both conceptual vision and design sensitivity to
            projects that seek stronger emotional impact and distinctive visual identity.
          </p>
          <p className="font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
            She is especially interested in collaborations in art, culture, hospitality, wellness,
            and future-facing experiences — where light can shape how people feel, connect, and
            remember a space.
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="mb-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                  {k}
                </div>
                <div className="font-heading text-lg italic leading-tight text-white">{v}</div>
              </div>
            ))}
          </div>

          <a
            href="/about"
            className="liquid-glass-strong liquid-glass-tint mt-2 inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Read full bio <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
