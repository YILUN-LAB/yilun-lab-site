import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const AREAS = [
  { num: "01", name: "Art & Culture", desc: "Galleries, museums, public installations." },
  { num: "02", name: "Performance", desc: "Dance, theater, immersive stage works." },
  { num: "03", name: "Hospitality & Wellness", desc: "Atmosphere as architecture, light as care." },
  { num: "04", name: "Future Experiences", desc: "Pavilions, XR, AI, emerging tech." },
];

export function ContactPage() {
  return (
    <div>
      <Navbar mode="page" activePage="contact" />
      <main className="pt-28">
        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(245,185,66,0.20), transparent 65%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div {...fadeBlurIn(0)}>
              <div className="text-sm font-body text-white/80 mb-6">// Work with us</div>
              <h1 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px]">
                Tell us a space<br />you want to feel.
              </h1>
              <p className="mt-8 text-base md:text-xl text-white/85 font-body font-light max-w-2xl mx-auto">
                If your project asks for emotional weight and a memorable visual identity through
                light — we'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Where we work</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Four areas of collaboration.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AREAS.map((a, i) => (
                <motion.div
                  key={a.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[200px]"
                >
                  <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                    {a.num}
                  </div>
                  <div className="font-heading italic text-white text-2xl leading-tight">
                    {a.name}
                  </div>
                  <div className="text-sm text-white/75 font-body font-light leading-snug">
                    {a.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="liquid-glass rounded-[1.5rem] p-8 md:p-12">
              <div className="text-sm font-body text-white/80 mb-4">// Get in touch</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl leading-[0.95] tracking-[-2px] mb-8">
                Let's talk about light.
              </h2>
              <p className="text-base md:text-lg text-white/85 font-body font-light leading-relaxed mb-8">
                Email is the fastest way to reach the studio. Tell us about your space, your
                timeline, and what you want it to feel like — we'll write back within a few days.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="mailto:hello@yilunlab.com"
                  className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-3 text-sm font-semibold inline-flex items-center justify-between gap-2"
                >
                  hello@yilunlab.com <ArrowUpRight className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/yilun.lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white inline-flex items-center justify-between gap-2"
                >
                  Instagram — @yilun.lab <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yilun-zhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white inline-flex items-center justify-between gap-2"
                >
                  LinkedIn — yilun-zhan <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              {...fadeBlurIn(0)}
              className="text-sm md:text-base text-white/65 font-body font-light leading-relaxed"
            >
              Currently taking a small number of new collaborations each season.
            </motion.p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
