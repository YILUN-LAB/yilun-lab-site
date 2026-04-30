import { motion } from "motion/react";
import { ArrowUpRight, PlayIcon } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";
import { COLLAB_AREAS as AREAS } from "@lib/data/collab-areas";

export function CollaborateSection() {
  return (
    <section
      data-screen-label="Collaborate"
      id="collaborate"
      className="relative bg-black px-8 md:px-16 lg:px-20 py-28 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 50%, rgba(245,185,66,0.18), transparent 65%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div {...fadeBlurIn(0)}>
          <div className="text-sm font-body text-white/80 mb-6">// Work with us</div>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px]">
            Tell us a space<br />you want to feel.
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/85 font-body font-light max-w-2xl mx-auto">
            We're taking on a small number of new collaborations each season. If your project asks
            for emotional weight and a memorable visual identity through light — let's talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 mb-10 text-left">
          {AREAS.map((a, i) => (
            <motion.div
              key={a.num}
              {...fadeBlurIn(0.1 + i * 0.08)}
              className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[180px]"
            >
              <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                {a.num}
              </div>
              <div className="font-heading italic text-white text-2xl leading-tight">{a.name}</div>
              <div className="text-sm text-white/75 font-body font-light leading-snug">
                {a.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeBlurIn(0.4)} className="flex items-center gap-6 justify-center flex-wrap">
          <a
            href="/contact"
            className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            Start a Collaboration <ArrowUpRight className="h-5 w-5" />
          </a>
          <a
            href="/contact"
            className="liquid-glass rounded-full px-5 py-2.5 text-sm font-medium text-white inline-flex items-center gap-2"
          >
            Download Capabilities <PlayIcon className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          {...fadeBlurIn(0.5)}
          className="flex items-center gap-3 justify-center flex-wrap mt-10"
        >
          <a
            href="mailto:hello@yilunlab.com"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            hello@yilunlab.com
          </a>
          <a
            href="https://instagram.com/yilun.lab"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            @yilun.lab — Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/yilun-zhan"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            linkedin / yilun-zhan
          </a>
        </motion.div>
      </div>
    </section>
  );
}
