import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Roles", "Artist · Designer · Founder"],
  ["Disciplines", "Spatial · Stage · Installation"],
  ["Recent", "MIT AI Filmmaking Hackathon 2025"],
  ["Open to", "Commission · Collaboration"],
];

const PRACTICE = [
  { num: "01", name: "Spatial Light",         note: "Galleries · museums · hospitality" },
  { num: "02", name: "Performance · Stage",   note: "Dance · theater · immersive" },
  { num: "03", name: "Installation",          note: "Pavilions · public works · interactive" },
  { num: "04", name: "Future Tech",           note: "AI film · XR · emerging media" },
];

const SELECTED_CREDITS = [
  { year: "2025", title: "MIT AI Filmmaking Hackathon — BLUE 001", role: "Director · Lighting" },
  { year: "2025", title: "TAO CAVE — Immersive pavilion",          role: "Lighting Artist · Tech Lead" },
  { year: "2024", title: "A Human Permeability — Drift · Eon · Mortal", role: "Lighting Artist · Director" },
  { year: "2024", title: "STARFALL — Ambient luminous field",      role: "Lighting Artist" },
  { year: "2024", title: "Eight Lights of HEALING",                role: "Lighting Designer" },
];

export function AboutPage() {
  return (
    <div>
      <Navbar mode="page" activePage="about" />
      <main className="pt-28">
        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20">
          <motion.div {...fadeBlurIn(0)} className="max-w-7xl mx-auto">
            <div className="text-sm font-body text-white/80 mb-6">// About</div>
            <h1 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px]">
              Yilun (Yilia) Zhan.
            </h1>
            <p className="mt-8 text-base md:text-xl text-white/85 font-body font-light max-w-2xl">
              Lighting artist, lighting designer, and founder of YILUN LAB — a creative lighting
              lab shaping emotion, space, and future experiences through light.
            </p>
          </motion.div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
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
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55))",
                }}
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
                With a background in professional lighting design and a growing body of artistic
                and interdisciplinary work, she brings both conceptual vision and design
                sensitivity to projects that seek stronger emotional impact and distinctive
                visual identity.
              </p>
              <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
                She is especially interested in collaborations in art, culture, hospitality,
                wellness, and future-facing experiences — where light can shape how people feel,
                connect, and remember a space.
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
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Practice</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Four ways light enters a space.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRACTICE.map((p, i) => (
                <motion.div
                  key={p.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[160px]"
                >
                  <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                    {p.num}
                  </div>
                  <div className="font-heading italic text-white text-2xl leading-tight">
                    {p.name}
                  </div>
                  <div className="text-sm text-white/75 font-body font-light leading-snug">
                    {p.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Selected credits</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
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
                  <span className="col-span-2 text-xs text-white/55 font-body uppercase tracking-[0.18em] pt-1">
                    {c.year}
                  </span>
                  <span className="col-span-7 font-heading italic text-white text-xl md:text-2xl leading-tight">
                    {c.title}
                  </span>
                  <span className="col-span-3 text-xs md:text-sm text-white/65 font-body font-light text-right pt-1">
                    {c.role}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeBlurIn(0)}>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Want to collaborate?
              </h2>
              <p className="mt-6 text-base md:text-lg text-white/80 font-body font-light">
                The studio is taking on a small number of new projects each season.
              </p>
              <a
                href="/contact"
                className="liquid-glass-strong liquid-glass-tint rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 mt-8"
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
