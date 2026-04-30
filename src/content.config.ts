import { z, defineCollection } from "astro:content";

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

const projects = defineCollection({
  type: "content",
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
      cover: z.string().optional(),

      variant: z
        .enum(["image-wall", "video-hero", "chapters", "chapters-tabbed"])
        .default("image-wall"),

      images: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string(),
            caption: z.string().optional(),
          })
        )
        .default([]),

      youtube: z.string().optional(),
      youtubeAlt: z.array(z.string()).optional(),

      chapters: z
        .array(
          z.object({
            name: z.string(),
            note: z.string(),
            accent: accentEnum.optional(),
            cover: z.string().optional(),
          })
        )
        .optional(),

      order: z.number().optional(),
      draft: z.boolean().default(false),
    })
    .superRefine((data, ctx) => {
      if (data.variant === "video-hero" && !data.youtube) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["youtube"],
          message: 'variant "video-hero" requires a youtube ID',
        });
      }
      if (
        (data.variant === "chapters" || data.variant === "chapters-tabbed") &&
        (!data.chapters || data.chapters.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["chapters"],
          message: `variant "${data.variant}" requires at least one entry in chapters`,
        });
      }
    }),
});

export const collections = { projects };
