import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useHeroScene } from "@lib/use-hero-scene";
import { FadingVideo } from "./FadingVideo";
import { HERO_VIDEO_ASSETS } from "@lib/hero-video-assets";
import { BlurText } from "./BlurText";
import { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon } from "./icons";
import { fadeBlurInImmediate } from "@lib/motion-presets";
import { getInitialHeroVideo } from "@lib/hero-video";
import { softBoundaryAnnouncement } from "@lib/data/soft-boundary";

export function Hero() {
  const glowRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { exposure, contentVisible, onPlaybackReady } = useHeroScene(heroRef, contentRef);
  const reduced = useReducedMotion();
  const reveal = (delay: number) => ({
    ...fadeBlurInImmediate(reduced ? 0 : delay),
    animate: contentVisible
      ? { filter: "blur(0px)", opacity: 1, y: 0 }
      : { filter: reduced ? "blur(0px)" : "blur(8px)", opacity: 0, y: reduced ? 0 : -16 },
    transition: {
      duration: reduced ? 0 : contentVisible ? 0.7 : 0.5,
      delay: reduced || !contentVisible ? 0 : delay,
      ease: [0, 0, 0.58, 1] as const,
    },
  });
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    setVideoSrc(getInitialHeroVideo());
  }, []);
  const asset =
    HERO_VIDEO_ASSETS.find((asset) => asset.original === videoSrc) ?? HERO_VIDEO_ASSETS[0];

  return (
    <section
      ref={heroRef}
      data-screen-label="Home"
      id="top"
      className="relative flex h-[100svh] w-full flex-col overflow-hidden"
      style={{ background: "linear-gradient(to bottom, #0a0705 0%, #050302 100%)" }}
    >
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          opacity: 1,
          background:
            "radial-gradient(60% 50% at 50% 35%, rgba(245,175,60,0.28), transparent 60%)," +
            "radial-gradient(80% 60% at 50% 100%, rgba(140,80,20,0.35), transparent 60%)",
        }}
      />
      <div
        data-hero-poster
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 z-0 -translate-x-1/2 bg-cover bg-top bg-no-repeat"
        style={{
          width: "120%",
          height: "120%",
          backgroundImage: `var(--hero-poster, url("${HERO_VIDEO_ASSETS[0].poster}"))`,
        }}
      />
      {videoSrc && (
        <FadingVideo
          src={asset.src}
          poster={asset.poster}
          exposure={exposure}
          onPlaybackReady={onPlaybackReady}
          className="absolute left-1/2 top-0 z-0 -translate-x-1/2 object-cover object-top"
          style={{ width: "120%", height: "120%" }}
          glowRef={glowRef}
        />
      )}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg," +
            "rgba(0,0,0,0.2) 0%," +
            "rgba(0,0,0,0.55) 30%," +
            "rgba(0,0,0,0.55) 75%," +
            "rgba(0,0,0,0.7) 100%)",
        }}
      />

      <div
        ref={contentRef}
        data-hero-content
        className="hero-content relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain"
      >
        <div className="h-20 shrink-0 md:h-24" />

        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-3 pt-3 text-center md:pb-10 md:pt-12">
          <div
            role="group"
            aria-label="Studio news"
            className="flex w-fit max-w-full flex-col items-center gap-2.5"
          >
            <motion.a
              {...reveal(0.4)}
              href="/projects/soft-boundary"
              className="soft-boundary-news liquid-glass grid w-full grid-cols-[5rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-2xl py-3 pl-2 pr-3 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
            >
              <span className="justify-self-center rounded-full bg-[#C9BBF4] px-3 py-1 text-xs font-semibold text-[#251D3D]">
                Exhibition
              </span>
              <span className="min-w-0 font-body">
                <span className="block text-sm font-medium text-white">
                  {softBoundaryAnnouncement.en}
                  <span className="mx-1.5 text-white/50">·</span>
                  <span lang="ja" className="inline-block text-xs font-normal text-white/85">
                    {softBoundaryAnnouncement.ja}
                  </span>
                </span>
                <span className="mt-1 block text-[11px] tracking-wide text-white/80">
                  {softBoundaryAnnouncement.dates} ·{" "}
                  <span className="hidden sm:inline">{softBoundaryAnnouncement.venue}</span>
                  <span className="sm:hidden">{softBoundaryAnnouncement.city}</span>
                </span>
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/90" />
            </motion.a>

            <motion.a
              {...reveal(0.55)}
              href="https://litawards.com/winners/winner.php?id=4274&mode=win"
              target="_blank"
              rel="noopener noreferrer"
              className="liquid-glass grid w-full grid-cols-[5rem_minmax(0,1fr)_1rem] items-center gap-3 rounded-full py-1 pl-2 pr-3 text-left transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-200"
            >
              <span className="justify-self-center rounded-full bg-[#F5AF3C] px-3 py-1 text-xs font-semibold text-black">
                Winner
              </span>
              <span className="font-body text-sm text-white/90">
                LIT Awards 2025 — A Human Permeability
              </span>
              <ArrowUpRight className="h-4 w-4 text-white/90" />
            </motion.a>
          </div>

          <div className="mt-4 max-w-3xl md:mt-12">
            <BlurText
              as="h1"
              active={contentVisible}
              text="Light is my language."
              className="font-heading text-[3.5rem] italic leading-[0.85] text-white md:text-7xl lg:text-[5.5rem]"
            />
          </div>

          <motion.p
            {...reveal(0.8)}
            className="mt-3 max-w-2xl font-body text-sm font-light leading-tight text-white md:mt-4 md:text-base"
          >
            A creative lighting lab shaping emotion, space, and future experiences through light.
            Immersive, human-centered work for art, culture, hospitality, wellness, and the
            future-facing.
          </motion.p>

          <motion.div {...reveal(1.1)} className="mt-4 flex items-center gap-3 md:mt-5 md:gap-6">
            <a
              href="#lab"
              className="liquid-glass-strong liquid-glass-tint inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold md:px-5"
            >
              Enter the Lab <ArrowUpRight className="h-5 w-5" />
            </a>
            <a
              href="#works"
              className="liquid-glass inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-medium text-white md:px-5"
            >
              See Selected Works <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            {...reveal(1.3)}
            className="mt-4 flex w-full max-w-[456px] items-stretch justify-center gap-4 md:mt-8"
          >
            <div className="liquid-glass min-w-0 flex-1 rounded-[1.25rem] p-3 text-left md:p-5">
              <ClockIcon className="h-6 w-6 text-white md:h-7 md:w-7" />
              <div className="mt-2 font-heading text-4xl italic leading-none tracking-[-1px] text-white md:mt-3">
                2022
              </div>
              <div className="mt-2 font-body text-xs font-light text-white">
                Studio founded — practicing across art, performance, and tech
              </div>
            </div>
            <div className="liquid-glass min-w-0 flex-1 rounded-[1.25rem] p-3 text-left md:p-5">
              <GlobeIcon className="h-6 w-6 text-white md:h-7 md:w-7" />
              <div className="mt-2 font-heading text-4xl italic leading-none tracking-[-1px] text-white md:mt-3">
                13+
              </div>
              <div className="mt-2 font-body text-xs font-light text-white">
                Selected works across dance, installation, and AI film
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          {...reveal(1.4)}
          className="flex shrink-0 flex-col items-center gap-2 px-4 pb-20 md:gap-4 md:pb-8"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            Collaborating with artists, choreographers, brands, and institutions
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 font-heading text-xl italic tracking-tight text-white md:gap-x-16 md:text-3xl">
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
