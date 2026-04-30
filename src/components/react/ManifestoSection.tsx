import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Founded", "2022"],
  ["Practice", "Spatial · Installation · Performance · Tech"],
  ["Clients", "Art · Hospitality · Wellness"],
  ["Status", "Available — 2026"],
];

export function ManifestoSection() {
  return (
    <section className="relative bg-black px-8 py-28 md:px-16 lg:px-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-2 md:gap-20">
        <motion.div {...fadeBlurIn(0)}>
          <div className="mb-6 font-body text-sm text-white/80">// The Lab</div>
          <h2 className="font-heading text-5xl italic leading-[0.9] tracking-[-2px] text-white md:text-6xl lg:text-[5rem]">
            Light shapes
            <br />
            how a space is felt,
            <br />
            remembered,
            <br />
            returned to.
          </h2>
        </motion.div>
        <motion.div {...fadeBlurIn(0.15)} className="flex flex-col gap-6 self-end">
          <p className="max-w-prose font-body text-base font-light leading-relaxed text-white/90 md:text-lg">
            YILUN LAB is a creative lighting lab shaping emotion, space, and future experiences
            through light. We work across spatial design, installation, performance, and emerging
            technology — guided by a single conviction: that light is never just illumination.
          </p>
          <p className="max-w-prose font-body text-base font-light leading-relaxed text-white/80 md:text-lg">
            We collaborate with artists, choreographers, brands, and institutions whose work asks
            for stronger emotional impact and a distinctive visual identity. From a quiet
            hospitality detail to a 360° immersive pavilion, our practice is the same: feel first,
            build second.
          </p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="mb-1.5 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
                  {k}
                </div>
                <div className="font-heading text-xl italic leading-tight text-white">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
