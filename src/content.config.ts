import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const accentEnum = z.enum([
  "amber",
  "blue",
  "red",
  "green",
  "violet",
  "cyan",
  "magenta",
  "spectrum",
]);

const weightEnum = z.enum(["lead", "feature", "column", "tile"]);
const aspectEnum = z.enum(["4/5", "16/10", "1/1", "5/4", "4/3", "21/9"]);

const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

const chapterSchema = z.object({
  name: z.string(),
  note: z.string(),
  accent: accentEnum.optional(),
  cover: z.string().optional(),
  youtube: z.string().optional(),
  images: z.array(imageSchema).optional(),
});

const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: z
    .object({
      title: z.string(),
      subtitle: z.string().optional(),
      tagline: z.string(),
      category: z.array(z.enum(["art", "dance", "tech"])).min(1),
      year: z.string(),
      role: z.string(),
      medium: z.string(),
      runtime: z.string().optional(),
      date: z.string().optional(),

      accent: accentEnum,
      size: z.enum(["xl", "lg", "md", "sm"]).default("md"),
      weight: weightEnum.default("column"),
      aspect: aspectEnum.optional(),
      cover: z.string().optional(),

      variant: z
        .enum(["image-wall", "video-hero", "image-poster", "chapters", "chapters-tabbed"])
        .default("image-wall"),

      images: z.array(imageSchema).default([]),

      youtube: z.string().optional(),
      youtubeAlt: z.array(z.string()).optional(),

      chapters: z.array(chapterSchema).optional(),

      featured: z.number().int().min(1).max(3).optional(),

      order: z.number().optional(),
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.variant === "video-hero" && !data.youtube) {
        ctx.addIssue({
          code: "custom",
          path: ["youtube"],
          message: 'variant "video-hero" requires a youtube ID',
        });
      }
      if (
        (data.variant === "chapters" || data.variant === "chapters-tabbed") &&
        (!data.chapters || data.chapters.length === 0)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["chapters"],
          message: `variant "${data.variant}" requires at least one entry in chapters`,
        });
      }
    }),
});

export const collections = { projects };
