import { defineConfig, envField } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

// When PREVIEW_PASSWORD is set (preview-scope env on Vercel), build in
// "server" mode so every route — including pages that would otherwise
// prerender — runs through the basic-auth middleware. Production builds
// (no PREVIEW_PASSWORD) stay "static" for CDN-fast delivery.
const previewGated = Boolean(process.env.PREVIEW_PASSWORD);

export default defineConfig({
  site: "https://www.yilunlab.com",
  output: previewGated ? "server" : "static",
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
      // /connect is QR-only — keep it out of crawler indexes.
      filter: (page) =>
        !page.endsWith("/connect/") && !page.endsWith("/connect"),
    }),
  ],
  vite: {
    ssr: { noExternal: ["motion"] },
  },
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
});
