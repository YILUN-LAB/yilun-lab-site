import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";
import { gradientFor } from "@lib/accent-gradients";

interface ImageWallVariantProps {
  intro?: ReactNode;
  images?: Array<{ src: string; alt: string; caption?: string }>;
  accent?: string;
}

export function ImageWallVariant({ intro, images, accent = "amber" }: ImageWallVariantProps) {
  const tiles = images && images.length > 0 ? images : null;

  return (
    <div className="px-8 md:px-16 lg:px-20 py-16">
      {intro && (
        <motion.div
          {...fadeBlurIn(0)}
          className="max-w-3xl mx-auto text-center font-heading italic text-white text-3xl md:text-4xl lg:text-5xl tracking-[-1.5px] leading-[1.05] mb-16"
        >
          {intro}
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-6xl mx-auto">
        {tiles
          ? tiles.map((img, i) => (
              <motion.figure
                key={img.src}
                {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
                className="liquid-glass relative overflow-hidden rounded-[1rem] aspect-[3/4]"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {img.caption && (
                  <figcaption className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/80 to-transparent text-xs text-white/85 font-body font-light">
                    {img.caption}
                  </figcaption>
                )}
              </motion.figure>
            ))
          : Array.from({ length: 9 }).map((_, i) => (
              <motion.div
                key={i}
                {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
                className="liquid-glass relative overflow-hidden rounded-[1rem] aspect-[3/4]"
              >
                <div
                  className="absolute inset-0"
                  style={{ background: gradientFor(accent) }}
                />
                <div className="absolute top-3 left-3 liquid-glass rounded-full px-2.5 py-0.5 text-[10px] text-white/75 font-body uppercase tracking-wider">
                  Still {i + 1}
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
