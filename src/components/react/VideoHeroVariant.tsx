import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";

interface VideoHeroVariantProps {
  body?: ReactNode;
  youtube: string;
  youtubeAlt?: string[];
  images?: Array<{ src: string; alt: string; caption?: string }>;
}

export function VideoHeroVariant({ body, youtube, youtubeAlt, images }: VideoHeroVariantProps) {
  const [embedReady, setEmbedReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("lite-youtube-embed").then(() => {
      if (!cancelled) setEmbedReady(true);
    });
    import("lite-youtube-embed/src/lite-yt-embed.css");
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="px-8 py-12 md:px-16 lg:px-20">
      <motion.div
        {...fadeBlurIn(0)}
        className="liquid-glass relative mx-auto aspect-video max-w-6xl overflow-hidden rounded-[1.25rem]"
      >
        {embedReady && <lite-youtube videoid={youtube} class="h-full w-full" />}
      </motion.div>

      {body && (
        <motion.div
          {...fadeBlurIn(0.1)}
          className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-10 md:grid-cols-3"
        >
          <div className="font-body text-sm text-white/80">// About</div>
          <div className="flex flex-col gap-4 font-body text-base font-light leading-relaxed text-white/90 md:col-span-2 md:text-lg">
            {body}
          </div>
        </motion.div>
      )}

      {youtubeAlt && youtubeAlt.length > 0 && (
        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
          {youtubeAlt.map((id) => (
            <motion.div
              key={id}
              {...fadeBlurIn(0.1)}
              className="liquid-glass relative aspect-video overflow-hidden rounded-[1rem]"
            >
              {embedReady && <lite-youtube videoid={id} class="h-full w-full" />}
            </motion.div>
          ))}
        </div>
      )}

      {images && images.length > 0 && (
        <div className="mx-auto mt-12 grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((img, i) => (
            <motion.figure
              key={img.src}
              {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
              className="liquid-glass relative aspect-[4/3] overflow-hidden rounded-[1rem]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.figure>
          ))}
        </div>
      )}
    </div>
  );
}
