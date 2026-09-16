import { defineConfig } from "vite";
import { resolve } from "node:path";

// Standalone tuning page for the editorial layout engine. Untracked; run with
//   npx vite --config playground/vite.config.ts
export default defineConfig({
  root: __dirname,
  publicDir: resolve(__dirname, "../public"),
  server: {
    port: 4400,
    fs: { allow: [resolve(__dirname, "..")] },
  },
});
