import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["tests/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@lib": path.resolve(__dirname, "src/lib"),
      "@styles": path.resolve(__dirname, "src/styles"),
      // The `astro:middleware` virtual module is only resolved by Astro's
      // build pipeline. Map it to its underlying implementation so tests
      // that import `src/middleware.ts` can run under vitest.
      "astro:middleware": path.resolve(
        __dirname,
        "node_modules/astro/dist/core/middleware/defineMiddleware.js"
      ),
    },
  },
});
