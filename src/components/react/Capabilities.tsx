import { motion } from "motion/react";
import { FadingVideo } from "./FadingVideo";
import { ImageIcon, MovieIcon, BulbIcon } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";
import type { ComponentType, SVGProps } from "react";

const CAP_VIDEO_SRC = "/assets/videos/capabilities.mp4";

interface CardData {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  title: string;
  tags: string[];
  body: string;
}

const CARDS: CardData[] = [
  {
    Icon: ImageIcon,
    title: "Spatial Light",
    tags: ["Atmosphere", "Architecture", "Memory", "Hospitality"],
    body: "Light treated as a second skin — designed for galleries, museums, and hospitality spaces where atmosphere is the architecture.",
  },
  {
    Icon: MovieIcon,
    title: "Performance & Installation",
    tags: ["Dance", "Stage", "Immersive", "Pavilion"],
    body: "Stage and spatial light for choreographers and immersive works — from intimate solos to 360° pavilions translating ideas into a living light-scape.",
  },
  {
    Icon: BulbIcon,
    title: "Future Experiences",
    tags: ["AI Film", "XR", "Interactive", "Emerging Tech"],
    body: "Pavilions, XR, AI-driven film, and emerging tech — light at the edge of what a space can do, recently shown at MIT AI Filmmaking Hackathon 2025.",
  },
];

export function Capabilities() {
  return (
    <section
      data-screen-label="Capabilities"
      id="capabilities"
      className="relative min-h-screen w-full overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 30%, rgba(245,175,60,0.22), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(120,70,20,0.30), transparent 60%)," +
          "linear-gradient(to bottom, #0a0705 0%, #050302 100%)",
      }}
    >
      <FadingVideo
        src={CAP_VIDEO_SRC}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-10 pt-24 md:px-16 lg:px-20">
        <div className="mb-auto">
          <div className="mb-6 font-body text-sm text-white/80">// Capabilities</div>
          <h2 className="font-heading text-6xl italic leading-[0.9] tracking-[-3px] text-white md:text-7xl lg:text-[6rem]">
            The Lab,
            <br />
            in practice
          </h2>
          <p className="mt-8 max-w-xl font-body text-base font-light leading-snug text-white/85 md:text-lg">
            Light shapes how a space is felt, remembered, returned to. Across spatial design,
            installation, performance, and emerging technology — guided by a single conviction: that
            light is never just illumination.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CARDS.map((c, idx) => (
            <CapabilityCard key={c.title} card={c} delay={idx * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({ card, delay }: { card: CardData; delay: number }) {
  const { Icon, title, tags, body } = card;
  return (
    <motion.div
      {...fadeBlurIn(delay)}
      className="liquid-glass flex min-h-[360px] flex-col rounded-[1.25rem] p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="liquid-glass flex h-11 w-11 items-center justify-center rounded-[0.75rem]">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="liquid-glass whitespace-nowrap rounded-full px-3 py-1 font-body text-[11px] text-white/90"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1" />
      <div className="mt-6">
        <h3 className="font-heading text-3xl italic leading-none tracking-[-1px] text-white md:text-4xl">
          {title}
        </h3>
        <p className="mt-3 max-w-[32ch] font-body text-sm font-light leading-snug text-white/90">
          {body}
        </p>
      </div>
    </motion.div>
  );
}
