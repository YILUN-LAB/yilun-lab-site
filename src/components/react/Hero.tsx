import { motion } from "motion/react";
import { FadingVideo } from "./FadingVideo";
import { BlurText } from "./BlurText";
import { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon } from "./icons";
import { fadeBlurInImmediate } from "@lib/motion-presets";

const HERO_VIDEO_SRC = "/assets/videos/hero.mp4";

export function Hero() {
  return (
    <section
      data-screen-label="Home"
      id="top"
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 35%, rgba(245,175,60,0.28), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(140,80,20,0.35), transparent 60%)," +
          "linear-gradient(to bottom, #0a0705 0%, #050302 100%)",
      }}
    >
      <FadingVideo
        src={HERO_VIDEO_SRC}
        className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="h-24" />

        <div className="flex flex-1 flex-col items-center justify-center px-4 pt-12 text-center">
          <motion.a
            {...fadeBlurInImmediate(0.4)}
            href="https://litawards.com/winners/winner.php?id=4274&mode=win"
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:text-white"
          >
            <span className="rounded-full bg-[#F5C22D] px-3 py-1 text-xs font-semibold text-black">
              Winner
            </span>
            <span className="font-body text-sm text-white/90">
              LIT Awards 2026 — A Human Permeability
            </span>
          </motion.a>

          <div className="mt-6 max-w-3xl">
            <BlurText
              text="Light is my language."
              className="font-heading text-6xl italic leading-[0.85] text-white md:text-7xl lg:text-[5.5rem]"
            />
          </div>

          <motion.p
            {...fadeBlurInImmediate(0.8)}
            className="mt-5 max-w-2xl font-body text-sm font-light leading-tight text-white md:text-base"
          >
            A creative lighting lab shaping emotion, space, and future experiences through light.
            Immersive, human-centered work for art, culture, hospitality, wellness, and the
            future-facing.
          </motion.p>

          <motion.div {...fadeBlurInImmediate(1.1)} className="mt-6 flex items-center gap-6">
            <a
              href="#works"
              className="liquid-glass-strong liquid-glass-tint inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              Enter the Lab <ArrowUpRight className="h-5 w-5" />
            </a>
            <a
              href="#works"
              className="liquid-glass inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium text-white"
            >
              See Selected Works <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            {...fadeBlurInImmediate(1.3)}
            className="mt-8 flex flex-wrap items-stretch justify-center gap-4"
          >
            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <ClockIcon className="h-7 w-7 text-white" />
              <div className="mt-3 font-heading text-4xl italic leading-none tracking-[-1px] text-white">
                2022
              </div>
              <div className="mt-2 font-body text-xs font-light text-white">
                Studio founded — practicing across art, performance, and tech
              </div>
            </div>
            <div className="liquid-glass w-[220px] rounded-[1.25rem] p-5 text-left">
              <GlobeIcon className="h-7 w-7 text-white" />
              <div className="mt-3 font-heading text-4xl italic leading-none tracking-[-1px] text-white">
                13+
              </div>
              <div className="mt-2 font-body text-xs font-light text-white">
                Selected works across dance, installation, and AI film
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...fadeBlurInImmediate(1.4)}
          className="flex flex-col items-center gap-4 px-4 pb-8"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            Collaborating with artists, choreographers, brands, and institutions
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 font-heading text-2xl italic tracking-tight text-white md:gap-x-16 md:text-3xl">
            <span>Art</span>
            <span>Dance</span>
            <span>Hospitality</span>
            <span>Wellness</span>
            <span>Future</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
