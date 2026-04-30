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
    <section className="relative bg-black px-8 md:px-16 lg:px-20 py-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 max-w-7xl mx-auto">
        <motion.div {...fadeBlurIn(0)}>
          <div className="text-sm font-body text-white/80 mb-6">// The Lab</div>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5rem] leading-[0.9] tracking-[-2px]">
            Light shapes<br />
            how a space is felt,<br />
            remembered,<br />
            returned to.
          </h2>
        </motion.div>
        <motion.div {...fadeBlurIn(0.15)} className="flex flex-col gap-6 self-end">
          <p className="text-base md:text-lg text-white/90 font-body font-light leading-relaxed max-w-prose">
            YILUN LAB is a creative lighting lab shaping emotion, space, and future experiences
            through light. We work across spatial design, installation, performance, and emerging
            technology — guided by a single conviction: that light is never just illumination.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed max-w-prose">
            We collaborate with artists, choreographers, brands, and institutions whose work asks
            for stronger emotional impact and a distinctive visual identity. From a quiet
            hospitality detail to a 360° immersive pavilion, our practice is the same: feel
            first, build second.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
                  {k}
                </div>
                <div className="font-heading italic text-white text-xl leading-tight">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
