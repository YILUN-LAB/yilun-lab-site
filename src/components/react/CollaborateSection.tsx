import { motion } from "motion/react";
import { ArrowUpRight, PlayIcon, MailIcon, InstagramIcon, LinkedInIcon } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";
import { COLLAB_AREAS as AREAS } from "@lib/data/collab-areas";

export function CollaborateSection() {
  return (
    <section
      data-screen-label="Collaborate"
      id="collaborate"
      className="relative overflow-hidden bg-black/65 px-8 py-28 md:px-16 lg:px-20"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(50% 60% at 50% 50%, rgba(245,185,66,0.18), transparent 65%)",
        }}
      />
      <div className="relative mx-auto max-w-5xl text-center">
        <motion.div {...fadeBlurIn(0)}>
          <div className="mb-6 font-body text-sm text-white/80">// Work with us</div>
          <h2 className="font-heading text-5xl italic leading-[0.9] tracking-[-2px] text-white md:text-6xl lg:text-[5.5rem]">
            Tell us a space
            <br />
            you want to feel.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-body text-base font-light text-white/85 md:text-lg">
            We're taking on a small number of new collaborations each season. If your project asks
            for emotional weight and a memorable visual identity through light — let's talk.
          </p>
        </motion.div>

        <div className="mb-10 mt-14 grid grid-cols-2 gap-4 text-left md:grid-cols-4">
          {AREAS.map((a, i) => (
            <motion.div
              key={a.num}
              {...fadeBlurIn(0.1 + i * 0.08)}
              className="liquid-glass flex min-h-[180px] flex-col gap-2 rounded-[1.25rem] p-5"
            >
              <div className="font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                {a.num}
              </div>
              <div className="font-heading text-2xl italic leading-tight text-white">{a.name}</div>
              <div className="font-body text-sm font-light leading-snug text-white/75">
                {a.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          {...fadeBlurIn(0.4)}
          className="flex flex-wrap items-center justify-center gap-6"
        >
          <a
            href="/contact"
            className="liquid-glass-strong liquid-glass-tint inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Start a Collaboration <ArrowUpRight className="h-5 w-5" />
          </a>
          <a
            href="/contact"
            className="liquid-glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white"
          >
            Download Capabilities <PlayIcon className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          {...fadeBlurIn(0.5)}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <a
            href="mailto:hello@yilunlab.com"
            aria-label="Email the studio"
            className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:text-white"
          >
            <MailIcon className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com/yilun.lab"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:text-white"
          >
            <InstagramIcon className="h-5 w-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/yilun-zhan"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="liquid-glass flex h-11 w-11 items-center justify-center rounded-full text-white/90 transition-colors hover:text-white"
          >
            <LinkedInIcon className="h-5 w-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
