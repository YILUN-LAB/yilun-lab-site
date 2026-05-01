import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { AuroraBackground } from "./AuroraBackground";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Roles", "Artist · Designer · Founder"],
  ["Disciplines", "Spatial · Stage · Installation"],
  ["Recent", "MIT AI Filmmaking Hackathon 2025"],
  ["Open to", "Commission · Collaboration"],
];

const PRACTICE = [
  { num: "01", name: "Spatial Light", note: "Galleries · museums · hospitality" },
  { num: "02", name: "Performance · Stage", note: "Dance · theater · immersive" },
  { num: "03", name: "Installation", note: "Pavilions · public works · interactive" },
  { num: "04", name: "Future Tech", note: "AI film · XR · emerging media" },
];

const SELECTED_CREDITS = [
  { year: "2025", title: "Mood Cocoon — Three sensory environments", role: "Lighting Artist · Researcher" },
  { year: "2025", title: "TAO CAVE — Immersive pavilion", role: "Lighting Artist · Tech Lead" },
  {
    year: "2024",
    title: "A Human Permeability — Drift · Eon · Mortal",
    role: "Lighting Artist · Director",
  },
  { year: "2024", title: "TRUE SELF — Performance · projection", role: "Lighting Designer" },
  { year: "2024", title: "Mo Gu — Installation · light", role: "Lighting Artist" },
];

export function AboutPage() {
  return (
    <div>
      <AuroraBackground />
      <Navbar mode="page" activePage="about" />
      <main className="pt-28">
        <section className="relative bg-black/65 px-8 pb-20 md:px-16 lg:px-20">
          <motion.div {...fadeBlurIn(0)} className="mx-auto max-w-7xl">
            <div className="mb-6 font-body text-sm text-white/80">// About</div>
            <h1 className="font-heading text-6xl italic leading-[0.85] tracking-[-3px] text-white md:text-7xl lg:text-[8rem]">
              Yilun Zhan.
            </h1>
            <p className="mt-8 max-w-2xl font-body text-base font-light text-white/85 md:text-xl">
              Lighting artist, lighting designer, and founder of YILUN LAB — a creative lighting lab
              shaping emotion, space, and future experiences through light.
            </p>
          </motion.div>
        </section>

        <section className="relative bg-black/65 px-8 pb-28 md:px-16 lg:px-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16">
            <motion.div
              {...fadeBlurIn(0.1)}
              className="liquid-glass relative aspect-[4/5] overflow-hidden rounded-[1.25rem]"
            >
              <img
                src="/assets/images/founder/headshot.webp"
                alt="Yilun Zhan portrait"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition: "50% 30%" }}
              />
            </motion.div>

            <motion.div {...fadeBlurIn(0.2)} className="flex flex-col gap-6">
              <p className="font-body text-base font-light leading-relaxed text-white/90 md:text-lg">
                Her practice focuses on creating emotional, immersive, and human-centered
                experiences through light — across spatial design, installation, performance, and
                emerging technology.
              </p>
              <p className="font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
                With a background in professional lighting design and a growing body of artistic and
                interdisciplinary work, she brings both conceptual vision and design sensitivity to
                projects that seek stronger emotional impact and distinctive visual identity.
              </p>
              <p className="font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
                She is especially interested in collaborations in art, culture, hospitality,
                wellness, and future-facing experiences — where light can shape how people feel,
                connect, and remember a space.
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
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black/65 px-8 pb-28 md:px-16 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="mb-4 font-body text-sm text-white/80">// Practice</div>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-[-2px] text-white md:text-5xl lg:text-6xl">
                Four ways light enters a space.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PRACTICE.map((p, i) => (
                <motion.div
                  key={p.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass flex min-h-[160px] flex-col gap-2 rounded-[1.25rem] p-5"
                >
                  <div className="font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {p.num}
                  </div>
                  <div className="font-heading text-2xl italic leading-tight text-white">
                    {p.name}
                  </div>
                  <div className="font-body text-sm font-light leading-snug text-white/75">
                    {p.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-black/65 px-8 pb-28 md:px-16 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="mb-4 font-body text-sm text-white/80">// Selected credits</div>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-[-2px] text-white md:text-5xl lg:text-6xl">
                Recent work, in brief.
              </h2>
            </motion.div>
            <ul className="divide-y divide-white/10">
              {SELECTED_CREDITS.map((c, i) => (
                <motion.li
                  key={`${c.year}-${c.title}`}
                  {...fadeBlurIn(0.05 + i * 0.04)}
                  className="grid grid-cols-12 gap-4 py-5"
                >
                  <span className="col-span-2 pt-1 font-body text-xs uppercase tracking-[0.18em] text-white/55">
                    {c.year}
                  </span>
                  <span className="col-span-7 font-heading text-xl italic leading-tight text-white md:text-2xl">
                    {c.title}
                  </span>
                  <span className="col-span-3 pt-1 text-right font-body text-xs font-light text-white/65 md:text-sm">
                    {c.role}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative bg-black/65 px-8 pb-28 md:px-16 lg:px-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div {...fadeBlurIn(0)}>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-[-2px] text-white md:text-5xl lg:text-6xl">
                Want to collaborate?
              </h2>
              <p className="mt-6 font-body text-base font-light text-white/80 md:text-lg">
                The studio is taking on a small number of new projects each season.
              </p>
              <a
                href="/contact"
                className="liquid-glass-strong liquid-glass-tint mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
              >
                Start a Collaboration <ArrowUpRight className="h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
