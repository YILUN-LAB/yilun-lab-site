import { motion } from "motion/react";
import { FadingVideo } from "./FadingVideo";
import { BlurText } from "./BlurText";
import { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon } from "./icons";
import { easeOut } from "@lib/motion-presets";

const HERO_VIDEO_SRC = "/assets/videos/hero.mp4";

export function Hero() {
  return (
    <section
      data-screen-label="Home"
      id="top"
      className="relative w-full min-h-screen overflow-hidden flex flex-col"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 35%, rgba(245,175,60,0.28), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(140,80,20,0.35), transparent 60%)," +
          "linear-gradient(to bottom, #0a0705 0%, #050302 100%)",
      }}
    >
      <FadingVideo
        src={HERO_VIDEO_SRC}
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="h-24" />

        <div className="flex-1 flex flex-col items-center justify-center text-center pt-12 px-4">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.4 }}
            className="liquid-glass rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1"
          >
            <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full">
              New
            </span>
            <span className="text-sm text-white/90 font-body">
              Studio open for 2026 commissions
            </span>
          </motion.div>

          <div className="mt-6 max-w-3xl">
            <BlurText
              text="Light is my language."
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85]"
            />
          </div>

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.8 }}
            className="mt-5 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight"
          >
            A creative lighting lab shaping emotion, space, and future experiences through light.
            Immersive, human-centered work for art, culture, hospitality, wellness, and the
            future-facing.
          </motion.p>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
            className="flex items-center gap-6 mt-6"
          >
            <a
              href="#works"
              className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              Enter the Lab <ArrowUpRight className="h-5 w-5" />
            </a>
            <a
              href="#works"
              className="liquid-glass rounded-full px-5 py-2.5 text-sm font-medium text-white inline-flex items-center gap-2 whitespace-nowrap"
            >
              See Selected Works <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.3 }}
            className="flex items-stretch gap-4 mt-8 flex-wrap justify-center"
          >
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <ClockIcon className="h-7 w-7 text-white" />
              <div className="mt-3 text-4xl font-heading italic text-white leading-none tracking-[-1px]">
                2022
              </div>
              <div className="text-xs text-white font-body font-light mt-2">
                Studio founded — practicing across art, performance, and tech
              </div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <GlobeIcon className="h-7 w-7 text-white" />
              <div className="mt-3 text-4xl font-heading italic text-white leading-none tracking-[-1px]">
                13+
              </div>
              <div className="text-xs text-white font-body font-light mt-2">
                Selected works across dance, installation, and AI film
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 1.4 }}
          className="flex flex-col items-center gap-4 pb-8 px-4"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            Collaborating with artists, choreographers, brands, and institutions
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 md:gap-x-16 gap-y-2 font-heading italic text-white text-2xl md:text-3xl tracking-tight">
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
