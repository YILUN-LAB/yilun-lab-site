import type { LightboxPhoto } from "./PhotoLightbox";
import { ProjectPhoto, ProjectPhotoGallery } from "./ProjectPhotoGallery";
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";
import { gradientFor, type AccentName } from "@lib/accent-gradients";

interface ImageWallVariantProps {
  title: string;
  intro?: ReactNode;
  images?: Array<LightboxPhoto & { caption?: string }>;
  accent?: AccentName;
}

export function ImageWallVariant({
  title,
  intro,
  images,
  accent = "amber",
}: ImageWallVariantProps) {
  const tiles = images && images.length > 0 ? images : null;

  return (
    <ProjectPhotoGallery title={title} photos={images ?? []}>
      <div className="px-8 py-16 md:px-16 lg:px-20">
        {intro && (
          <motion.div
            {...fadeBlurIn(0)}
            className="mx-auto mb-16 max-w-3xl text-center font-heading text-3xl italic leading-[1.05] tracking-[-1.5px] text-white md:text-4xl lg:text-5xl"
          >
            {intro}
          </motion.div>
        )}

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {tiles
            ? tiles.map((img, i) => (
                <motion.figure
                  key={img.src}
                  {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
                  className="liquid-glass relative aspect-[3/4] overflow-hidden rounded-[1rem]"
                >
                  <ProjectPhoto photo={img} />
                  {img.caption && (
                    <figcaption className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3 font-body text-xs font-light text-white/85">
                      {img.caption}
                    </figcaption>
                  )}
                </motion.figure>
              ))
            : Array.from({ length: 9 }).map((_, i) => (
                <motion.div
                  key={i}
                  {...fadeBlurIn(0.05 + Math.min(i * 0.04, 0.4))}
                  className="liquid-glass relative aspect-[3/4] overflow-hidden rounded-[1rem]"
                >
                  <div className="absolute inset-0" style={{ background: gradientFor(accent) }} />
                  <div className="liquid-glass absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-body text-[10px] uppercase tracking-wider text-white/75">
                    Still {i + 1}
                  </div>
                </motion.div>
              ))}
        </div>
      </div>
    </ProjectPhotoGallery>
  );
}
