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
    <div className="px-8 md:px-16 lg:px-20 py-12">
      <motion.div
        {...fadeBlurIn(0)}
        className="liquid-glass relative overflow-hidden rounded-[1.25rem] aspect-video max-w-6xl mx-auto"
      >
        {embedReady && (
          <lite-youtube videoid={youtube} class="w-full h-full" />
        )}
      </motion.div>

      {body && (
        <motion.div
          {...fadeBlurIn(0.1)}
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 max-w-6xl mx-auto"
        >
          <div className="text-sm font-body text-white/80">// About</div>
          <div className="md:col-span-2 flex flex-col gap-4 text-base md:text-lg text-white/90 font-body font-light leading-relaxed">
            {body}
          </div>
        </motion.div>
      )}

      {youtubeAlt && youtubeAlt.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 max-w-6xl mx-auto">
          {youtubeAlt.map((id) => (
            <motion.div
              key={id}
              {...fadeBlurIn(0.1)}
              className="liquid-glass relative overflow-hidden rounded-[1rem] aspect-video"
            >
              {embedReady && (
                <lite-youtube videoid={id} class="w-full h-full" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {images && images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-12 max-w-6xl mx-auto">
          {images.map((img, i) => (
            <motion.figure
              key={img.src}
              {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
              className="liquid-glass relative overflow-hidden rounded-[1rem] aspect-[4/3]"
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.figure>
          ))}
        </div>
      )}
    </div>
  );
}
