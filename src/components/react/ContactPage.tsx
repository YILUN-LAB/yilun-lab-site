import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { InstagramIcon, LinkedInIcon } from "./icons";
import { ContactForm } from "./ContactForm";
import { fadeBlurIn } from "@lib/motion-presets";
import { COLLAB_AREAS as AREAS } from "@lib/data/collab-areas";

export function ContactPage() {
  return (
    <div>
      <Navbar mode="page" activePage="contact" />
      <main className="pt-28">
        <section className="relative overflow-hidden bg-black px-8 pb-20 md:px-16 lg:px-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(245,185,66,0.20), transparent 65%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl text-center">
            <motion.div {...fadeBlurIn(0)}>
              <div className="mb-6 font-body text-sm text-white/80">// Work with us</div>
              <h1 className="font-heading text-6xl italic leading-[0.85] tracking-[-3px] text-white md:text-7xl lg:text-[8rem]">
                Tell us a space
                <br />
                you want to feel.
              </h1>
              <p className="mx-auto mt-8 max-w-2xl font-body text-base font-light text-white/85 md:text-xl">
                If your project asks for emotional weight and a memorable visual identity through
                light — we'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 pb-20 md:px-16 lg:px-20">
          <div className="mx-auto max-w-7xl">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="mb-4 font-body text-sm text-white/80">// Where we work</div>
              <h2 className="font-heading text-4xl italic leading-[0.9] tracking-[-2px] text-white md:text-5xl lg:text-6xl">
                Four areas of collaboration.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AREAS.map((a, i) => (
                <motion.div
                  key={a.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass flex min-h-[200px] flex-col gap-2 rounded-[1.25rem] p-5"
                >
                  <div className="font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                    {a.num}
                  </div>
                  <div className="font-heading text-2xl italic leading-tight text-white">
                    {a.name}
                  </div>
                  <div className="font-body text-sm font-light leading-snug text-white/75">
                    {a.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="get-in-touch"
          className="relative scroll-mt-28 bg-black px-8 pb-28 md:px-16 lg:px-20"
        >
          <div className="mx-auto max-w-3xl">
            <motion.div {...fadeBlurIn(0)} className="liquid-glass rounded-[1.5rem] p-8 md:p-12">
              <div className="mb-4 font-body text-sm text-white/80">// Get in touch</div>
              <h2 className="mb-8 font-heading text-4xl italic leading-[0.95] tracking-[-2px] text-white md:text-5xl">
                Let's talk about light.
              </h2>
              <p className="mb-8 font-body text-base font-light leading-relaxed text-white/85 md:text-lg">
                Tell us about your space, your timeline, and what you want it to feel like — we'll
                write back within a few days.
              </p>

              <ContactForm />

              <div className="mt-8 flex items-center gap-3 border-t border-white/10 pt-6">
                <span className="font-body text-xs uppercase tracking-[0.18em] text-white/55">
                  or find us on
                </span>
                <a
                  href="https://www.instagram.com/yilunlab/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-white/90"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yilun-zhan"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="liquid-glass flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:text-white/90"
                >
                  <LinkedInIcon className="h-5 w-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 pb-28 md:px-16 lg:px-20">
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              {...fadeBlurIn(0)}
              className="font-body text-sm font-light leading-relaxed text-white/65 md:text-base"
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
