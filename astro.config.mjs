import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { remarkDevlogFigures } from "./src/lib/remark-devlog-figures.ts";

export default defineConfig({
  site: "https://www.yilunlab.com",
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkSmartypants],
      rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
    }),
    sitemap({
      // /connect is QR-only; /projects/hug (and its Chinese mirror at
      // /projects/hug/zh) is an unlisted competition entry reached only by
      // its direct link, and so is The Unlit Cut devlog (and its /zh mirror).
      // Keep them out of the sitemap.
      filter: (page) => !/\/(connect|projects\/(hug|the-unlit-cut-devlog)(\/zh)?)\/?$/.test(page),
    }),
  ],
  markdown: {
    // The Unlit Cut devlog text: images to public WebPs, captions to figures.
    remarkPlugins: [
      [
        remarkDevlogFigures,
        {
          contentDir: "./src/content/devlog/the-unlit-cut",
          imageUrl: "/assets/images/projects/the-unlit-cut-devlog",
          publicDir: "./public",
        },
      ],
    ],
  },
  vite: {
    ssr: { noExternal: ["motion"] },
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
});
