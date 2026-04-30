import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { gradientFor, type AccentName } from "@lib/accent-gradients";
import { fadeBlurIn } from "@lib/motion-presets";

interface ChapterImage {
  src: string;
  alt: string;
  caption?: string;
}

interface ChapterProps {
  name: string;
  note?: string;
  accent?: AccentName;
  cover?: string;
  youtube?: string;
  images?: ChapterImage[];
  children?: ReactNode;
}

export function Chapter({ name, note, accent, cover, youtube, images, children }: ChapterProps) {
  const accentKey: AccentName = accent ?? "amber";
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    if (!youtube) return;
    let cancelled = false;
    import("lite-youtube-embed").then(() => {
      if (!cancelled) setEmbedReady(true);
    });
    import("lite-youtube-embed/src/lite-yt-embed.css");
    return () => {
      cancelled = true;
    };
  }, [youtube]);

  return (
    <motion.section
      data-chapter-name={name}
      {...fadeBlurIn(0)}
      className="mx-auto max-w-6xl px-8 py-16 md:px-16 lg:px-20"
    >
      <div className="mb-8">
        <div className="mb-2 font-body text-[10px] uppercase tracking-[0.18em] text-white/55">
          // Chapter
        </div>
        <h3 className="font-heading text-4xl italic leading-[0.95] tracking-[-1.5px] text-white md:text-5xl lg:text-6xl">
          {name}
        </h3>
        {note && (
          <p className="mt-2 font-body text-base font-light italic text-white/70 md:text-lg">
            {note}
          </p>
        )}
      </div>

      <div className="liquid-glass relative mb-8 aspect-video overflow-hidden rounded-[1.25rem]">
        {youtube ? (
          embedReady && <lite-youtube videoid={youtube} class="h-full w-full" />
        ) : cover ? (
          <img
            src={cover}
            alt={`${name} — cover`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(accentKey) }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 35% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      <div className="prose prose-invert mx-auto max-w-3xl font-body text-base font-light leading-relaxed text-white/90 md:text-lg [&>p]:mb-4">
        {children}
      </div>

      {images && images.length > 0 && (
        <div className="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img, i) => (
            <motion.figure
              key={img.src}
              {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.3))}
              className="liquid-glass relative aspect-[3/4] overflow-hidden rounded-[1rem]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              {img.caption && (
                <figcaption className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 font-body text-xs font-light text-white/85">
                  {img.caption}
                </figcaption>
              )}
            </motion.figure>
          ))}
        </div>
      )}
    </motion.section>
  );
}
