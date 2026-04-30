import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/static";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

export default defineConfig({
  site: "https://yilunlab.com",
  output: "static",
  adapter: vercel({
    webAnalytics: { enabled: true },
    imageService: true,
  }),
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkSmartypants],
      rehypePlugins: [
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
      ],
    }),
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  vite: {
    ssr: { noExternal: ["motion"] },
  },
});
