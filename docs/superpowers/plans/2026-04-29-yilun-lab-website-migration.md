# Yilun Lab Website Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the Yilun Lab Claude Design handoff prototype (`migration/yilun-lab-website/`) into a production Astro 5 + TypeScript + Tailwind site at the repo root, deployed to Vercel, with pixel-perfect visual + motion fidelity to the prototype.

**Architecture:** Astro static-output site. Each top-level page (`/`, `/about`, `/contact`) mounts a single React island (`client:load`) holding the entire prototype component tree for that page — guarantees 1:1 fidelity. Case study pages at `/projects/<slug>` are MDX-backed with four content variants (`image-wall`, `video-hero`, `chapters`, `chapters-tabbed`). All animations use the `motion` library; the prototype's `<style>` block is ported as-is into `src/styles/global.css`.

**Tech Stack:** Astro 5, TypeScript, React 18, Tailwind 3, `motion`, MDX content collections, `@astrojs/vercel` static adapter, self-hosted fonts via `@fontsource/*`.

**Spec:** `docs/superpowers/specs/2026-04-29-yilun-lab-website-migration-design.md`

**Source prototype (read-only reference):** `migration/yilun-lab-website/project/`
- `index.html` — markup shell + global CSS
- `src/data.jsx` — project listing data
- `src/sections.jsx` — all section components
- `src/glass.jsx` — inline icons
- `src/video.jsx` — `FadingVideo` component
- `src/blurtext.jsx` — `BlurText` component
- `src/app.jsx` — `useGlassLensing` hook + App entry

**Conventions used throughout this plan:**

- React components imported directly into `.astro` files **without** a client directive render as static HTML (no hydration, no JS shipped). This is correct for purely presentational components like SVG icons — do NOT add `client:load` to icon usages inside Astro pages.
- React components needing interactivity (hooks, event handlers) get `client:load` (always-on) or `client:visible` (lazy).
- Working directory for all `bash` commands is the repo root: `/Users/rudyz/Documents/projects/Yilun-Lab-Website`. Where shown explicitly with `cd ... &&` it's because the command would otherwise be ambiguous.

---

## Phase 1 — Scaffolding

### Task 1: Initialize package.json with dependencies

**Files:**
- Create: `package.json`
- Modify: `.gitignore`

- [ ] **Step 1: Inspect repo root state**

```bash
ls -la /Users/rudyz/Documents/projects/Yilun-Lab-Website
cat /Users/rudyz/Documents/projects/Yilun-Lab-Website/.gitignore
```

Expected: existing `.gitignore` has minimal content; `public/` and `src/` already exist (currently effectively empty).

- [ ] **Step 2: Create `package.json`**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/package.json`:

```json
{
  "name": "yilun-lab-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint ."
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/react": "^4.0.0",
    "@astrojs/mdx": "^4.0.0",
    "@astrojs/tailwind": "^6.0.0",
    "@astrojs/sitemap": "^3.2.0",
    "@astrojs/vercel": "^8.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "motion": "^11.11.0",
    "tailwindcss": "^3.4.0",
    "@fontsource/instrument-serif": "^5.1.0",
    "@fontsource/barlow": "^5.1.0",
    "lite-youtube-embed": "^0.3.3",
    "sharp": "^0.33.0",
    "@vercel/analytics": "^1.4.0",
    "@vercel/speed-insights": "^1.1.0",
    "remark-smartypants": "^3.0.2",
    "rehype-slug": "^6.0.0",
    "rehype-autolink-headings": "^7.1.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^22.0.0",
    "prettier": "^3.4.0",
    "prettier-plugin-astro": "^0.14.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "eslint": "^9.16.0",
    "eslint-plugin-astro": "^1.3.0",
    "eslint-plugin-jsx-a11y": "^6.10.0"
  }
}
```

- [ ] **Step 3: Update `.gitignore`**

Append to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/.gitignore`:

```
# Build output
dist/
.astro/

# Dependencies
node_modules/

# Vercel
.vercel/

# Logs
npm-debug.log*

# OS
.DS_Store
*/.DS_Store
```

- [ ] **Step 4: Install dependencies**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npm install
```

Expected: completes without errors. A `package-lock.json` and `node_modules/` are created.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "$(cat <<'EOF'
Scaffold package.json with Astro/React/motion dependencies

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create `astro.config.mjs` and `tsconfig.json`

**Files:**
- Create: `astro.config.mjs`
- Create: `tsconfig.json`

- [ ] **Step 1: Create `astro.config.mjs`**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/astro.config.mjs`:

```js
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
```

- [ ] **Step 2: Create `tsconfig.json`**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@styles/*": ["src/styles/*"]
    },
    "types": ["astro/client"]
  },
  "include": ["src", "astro.config.mjs"],
  "exclude": ["dist", "node_modules", "migration"]
}
```

- [ ] **Step 3: Verify build pipeline boots**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: errors about missing pages (we have none yet) but no config errors. Astro prints version + integrations loaded.

- [ ] **Step 4: Commit**

```bash
git add astro.config.mjs tsconfig.json
git commit -m "$(cat <<'EOF'
Add Astro config with React/MDX/Tailwind/Vercel integrations

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Tailwind config and global stylesheet

**Files:**
- Create: `tailwind.config.cjs`
- Create: `src/styles/global.css`
- Reference: `migration/yilun-lab-website/project/index.html` (lines 27–311 — the `<style>` block to port)

- [ ] **Step 1: Create `tailwind.config.cjs`**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/tailwind.config.cjs`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{astro,tsx,ts,jsx,js,mdx,html}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ["'Instrument Serif'", "serif"],
        body: ["'Barlow'", "sans-serif"],
      },
      colors: {
        amber: {
          highlight: "rgb(255 196 110)",
          primary: "rgb(245 175 60)",
          deep: "rgb(200 130 30)",
        },
        warm: { bg: "#0a0705" },
      },
      borderRadius: { DEFAULT: "9999px" },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Read prototype global CSS**

```bash
sed -n '27,311p' /Users/rudyz/Documents/projects/Yilun-Lab-Website/migration/yilun-lab-website/project/index.html
```

Note the entire `<style>` block — this is what we are porting.

- [ ] **Step 3: Create `src/styles/global.css`**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/src/styles/global.css`. Begin with font imports + Tailwind directives, then port the prototype's `<style>` block verbatim with body styles wrapped in `@layer base`:

```css
/* Self-hosted fonts (replaces Google Fonts CDN link from prototype) */
@import "@fontsource/instrument-serif/400.css";
@import "@fontsource/instrument-serif/400-italic.css";
@import "@fontsource/barlow/300.css";
@import "@fontsource/barlow/400.css";
@import "@fontsource/barlow/500.css";
@import "@fontsource/barlow/600.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ====== Theme: dark + amber/golden glow ====== */
:root {
  --amber-1: 255, 196, 110;
  --amber-2: 245, 175, 60;
  --amber-3: 200, 130, 30;
  --warm-bg: #0a0705;
}

@layer base {
  html, body { background: var(--warm-bg); color: #fff; }
  body {
    font-family: 'Barlow', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background:
      radial-gradient(1200px 700px at 50% -10%, rgba(var(--amber-2), 0.12), transparent 65%),
      radial-gradient(900px 600px at 100% 100%, rgba(var(--amber-2), 0.05), transparent 65%),
      var(--warm-bg);
  }
}

/* ====== Liquid Glass — interactive base ====== */
.liquid-glass,
.liquid-glass-strong {
  --gx: 50%;
  --gy: 50%;
  --glass-tint-r: 255;
  --glass-tint-g: 220;
  --glass-tint-b: 170;
  position: relative;
  overflow: hidden;
  isolation: isolate;
  transition:
    transform 380ms cubic-bezier(.2,.9,.2,1),
    box-shadow 380ms cubic-bezier(.2,.9,.2,1),
    backdrop-filter 380ms cubic-bezier(.2,.9,.2,1);
  will-change: transform, box-shadow;
}

.liquid-glass {
  background:
    radial-gradient(120% 80% at var(--gx) var(--gy),
      rgba(var(--glass-tint-r), var(--glass-tint-g), var(--glass-tint-b), 0.10) 0%,
      rgba(var(--glass-tint-r), var(--glass-tint-g), var(--glass-tint-b), 0.04) 40%,
      rgba(255,255,255,0.01) 100%);
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
  border: none;
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.12),
    inset 0 -1px 1px rgba(0,0,0,0.20),
    0 1px 2px rgba(0,0,0,0.18);
}

.liquid-glass-strong {
  background:
    radial-gradient(120% 80% at var(--gx) var(--gy),
      rgba(var(--glass-tint-r), var(--glass-tint-g), var(--glass-tint-b), 0.16) 0%,
      rgba(var(--glass-tint-r), var(--glass-tint-g), var(--glass-tint-b), 0.06) 45%,
      rgba(255,255,255,0.02) 100%);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: none;
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.18),
    inset 0 -1px 1px rgba(0,0,0,0.25),
    0 8px 24px rgba(0,0,0,0.35),
    0 1px 0 rgba(255,255,255,0.04);
}

.liquid-glass::before,
.liquid-glass-strong::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background:
    radial-gradient(60% 60% at var(--gx) var(--gy),
      rgba(255, 220, 160, 0.85) 0%,
      rgba(255, 220, 160, 0.20) 40%,
      rgba(255, 220, 160, 0) 70%),
    linear-gradient(180deg,
      rgba(255,235,200,0.55) 0%,
      rgba(255,220,160,0.18) 20%,
      rgba(255,220,160,0)    40%,
      rgba(255,220,160,0)    60%,
      rgba(255,220,160,0.18) 80%,
      rgba(255,235,200,0.55) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  transition: opacity 380ms ease;
  z-index: 2;
}
.liquid-glass-strong::before { padding: 1.6px; }

.liquid-glass::after,
.liquid-glass-strong::after {
  content: "";
  position: absolute; inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    40% 40% at var(--gx) var(--gy),
    rgba(255, 230, 180, 0.18) 0%,
    rgba(255, 230, 180, 0.06) 35%,
    rgba(255, 230, 180, 0) 70%
  );
  opacity: 0;
  transition: opacity 320ms ease;
  pointer-events: none;
  mix-blend-mode: screen;
  z-index: 1;
}

.liquid-glass:hover,
.liquid-glass-strong:hover { transform: translateY(-1px); }
.liquid-glass:hover::after,
.liquid-glass-strong:hover::after { opacity: 1; }

.liquid-glass:hover {
  box-shadow:
    inset 0 1px 1px rgba(255,235,200,0.20),
    inset 0 -1px 1px rgba(0,0,0,0.22),
    0 6px 18px rgba(0,0,0,0.28),
    0 0 0 0.5px rgba(255, 200, 120, 0.18);
}
.liquid-glass-strong:hover {
  box-shadow:
    inset 0 1px 1px rgba(255,235,200,0.28),
    inset 0 -1px 1px rgba(0,0,0,0.30),
    0 14px 36px rgba(0,0,0,0.45),
    0 0 0 0.5px rgba(255, 200, 120, 0.30),
    0 0 28px rgba(245, 175, 60, 0.18);
}

.liquid-glass:active,
.liquid-glass-strong:active {
  transform: translateY(0) scale(0.985);
  transition-duration: 120ms;
}
.liquid-glass:active::after,
.liquid-glass-strong:active::after {
  background: radial-gradient(
    55% 55% at var(--gx) var(--gy),
    rgba(255, 220, 150, 0.45) 0%,
    rgba(255, 200, 110, 0.18) 40%,
    rgba(255, 200, 110, 0) 75%
  );
  opacity: 1;
}
.liquid-glass-strong:active {
  box-shadow:
    inset 0 0 24px rgba(255, 200, 120, 0.30),
    inset 0 1px 1px rgba(255,235,200,0.30),
    0 4px 14px rgba(0,0,0,0.35),
    0 0 32px rgba(245, 175, 60, 0.30);
}
.liquid-glass:active {
  box-shadow:
    inset 0 0 16px rgba(255, 200, 120, 0.22),
    inset 0 1px 1px rgba(255,235,200,0.20),
    0 2px 8px rgba(0,0,0,0.25);
}

.liquid-glass-tint {
  --glass-tint-r: 255;
  --glass-tint-g: 196;
  --glass-tint-b: 110;
  background:
    radial-gradient(120% 80% at var(--gx) var(--gy),
      rgba(255, 200, 120, 0.30) 0%,
      rgba(245, 175, 60, 0.18) 45%,
      rgba(200, 130, 30, 0.08) 100%);
  color: #fff5e0;
  text-shadow: 0 1px 0 rgba(80, 40, 5, 0.45);
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.45),
    inset 0 -1px 1px rgba(120, 70, 10, 0.30),
    0 8px 24px rgba(0,0,0,0.35),
    0 0 24px rgba(245, 175, 60, 0.22);
}
.liquid-glass-tint::before {
  background:
    radial-gradient(60% 60% at var(--gx) var(--gy),
      rgba(255, 240, 200, 0.95) 0%,
      rgba(255, 220, 160, 0.30) 40%,
      rgba(255, 220, 160, 0) 70%),
    linear-gradient(180deg,
      rgba(255,245,210,0.75) 0%,
      rgba(255,225,170,0.30) 22%,
      rgba(255,210,140,0)    40%,
      rgba(255,210,140,0)    60%,
      rgba(255,225,170,0.30) 78%,
      rgba(255,245,210,0.75) 100%);
}
.liquid-glass-tint:hover {
  box-shadow:
    inset 0 1px 1px rgba(255,255,255,0.55),
    inset 0 -1px 1px rgba(120, 70, 10, 0.35),
    0 14px 36px rgba(0,0,0,0.45),
    0 0 40px rgba(255, 196, 110, 0.45);
}
.liquid-glass-tint:active {
  box-shadow:
    inset 0 0 24px rgba(255, 240, 200, 0.55),
    inset 0 1px 1px rgba(255,255,255,0.55),
    0 4px 14px rgba(0,0,0,0.35),
    0 0 50px rgba(255, 196, 110, 0.55);
}

.glass-link {
  position: relative;
  transition: color 220ms ease, background 220ms ease;
  z-index: 1;
}
.glass-link::before {
  content: "";
  position: absolute; inset: 0;
  border-radius: 9999px;
  background: radial-gradient(80% 80% at 50% 50%,
    rgba(255, 220, 160, 0.18) 0%,
    rgba(255, 220, 160, 0) 70%);
  opacity: 0;
  transition: opacity 240ms ease;
  z-index: -1;
}
.glass-link:hover { color: #fff; }
.glass-link:hover::before { opacity: 1; }

.scroll-edge {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 120px;
  pointer-events: none;
  z-index: 40;
  background: linear-gradient(to bottom, rgba(10,7,5,0.55), rgba(10,7,5,0));
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 0%, black 60%, transparent 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@media (prefers-reduced-motion: reduce) {
  .liquid-glass, .liquid-glass-strong { transition: none; }
  .liquid-glass:hover, .liquid-glass-strong:hover { transform: none; }
}
@media (prefers-reduced-transparency: reduce) {
  .liquid-glass {
    background: rgba(30, 22, 12, 0.9);
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  .liquid-glass-strong {
    background: rgba(35, 25, 14, 0.92);
    backdrop-filter: none; -webkit-backdrop-filter: none;
  }
  .liquid-glass-tint {
    background: rgba(245, 175, 60, 0.85); color: #1a1108;
  }
}
@media (prefers-contrast: more) {
  .liquid-glass, .liquid-glass-strong {
    box-shadow:
      inset 0 0 0 1px rgba(255, 220, 160, 0.55),
      0 8px 20px rgba(0,0,0,0.5);
  }
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 4: Verify TypeScript still passes**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: still complains about missing pages but no new errors.

- [ ] **Step 5: Commit**

```bash
git add tailwind.config.cjs src/styles/global.css
git commit -m "$(cat <<'EOF'
Add Tailwind config and port liquid-glass system to global CSS

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Prettier and ESLint configuration

**Files:**
- Create: `prettier.config.mjs`
- Create: `.prettierignore`
- Create: `eslint.config.mjs`
- Create: `.eslintignore`

- [ ] **Step 1: Create `prettier.config.mjs`**

Write:

```js
/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  overrides: [
    { files: "*.astro", options: { parser: "astro" } },
  ],
};
```

- [ ] **Step 2: Create `.prettierignore`**

```
dist/
.astro/
node_modules/
migration/
package-lock.json
public/
```

- [ ] **Step 3: Create `eslint.config.mjs`**

```js
import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";

export default [
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx,ts,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: { ...jsxA11y.configs.recommended.rules },
  },
  {
    ignores: ["dist/", ".astro/", "node_modules/", "migration/"],
  },
];
```

- [ ] **Step 4: Verify configs load**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx prettier --check . 2>&1 | head -5
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx eslint . 2>&1 | head -5
```

Expected: prettier reports any unformatted files (will be 0 since we have no source yet); eslint reports parsed without crashing.

- [ ] **Step 5: Commit**

```bash
git add prettier.config.mjs .prettierignore eslint.config.mjs
git commit -m "$(cat <<'EOF'
Add Prettier (with Astro + Tailwind plugins) and ESLint config

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Content collection schema

**Files:**
- Create: `src/content.config.ts`

- [ ] **Step 1: Create `src/content.config.ts`**

```ts
import { z, defineCollection } from "astro:content";

const accentEnum = z.enum([
  "amber", "blue", "red", "green",
  "violet", "cyan", "magenta", "spectrum",
]);

const projects = defineCollection({
  type: "content",
  schema: z.object({
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
      .optional(),

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
  }),
});

export const collections = { projects };
```

- [ ] **Step 2: Create empty content directory**

```bash
mkdir -p /Users/rudyz/Documents/projects/Yilun-Lab-Website/src/content/projects
```

- [ ] **Step 3: Verify Astro recognizes the collection**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro sync
```

Expected: completes successfully; creates `.astro/types.d.ts` with `projects` collection types.

- [ ] **Step 4: Commit**

```bash
git add src/content.config.ts
git commit -m "$(cat <<'EOF'
Add content collection schema for projects

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2 — Shared primitives

### Task 6: Accent gradient lookup

**Files:**
- Create: `src/lib/accent-gradients.ts`

- [ ] **Step 1: Create file**

```ts
export const ACCENT_GRADIENTS = {
  amber:
    "radial-gradient(60% 80% at 50% 50%, rgba(245,185,66,0.55), rgba(150,90,20,0.3) 60%, #050407 90%)",
  blue:
    "radial-gradient(60% 80% at 50% 50%, rgba(64,144,255,0.5), rgba(20,40,90,0.3) 60%, #050407 90%)",
  red:
    "radial-gradient(60% 80% at 50% 50%, rgba(255,90,90,0.5), rgba(120,30,30,0.3) 60%, #050407 90%)",
  green:
    "radial-gradient(60% 80% at 50% 50%, rgba(140,220,120,0.5), rgba(40,90,40,0.3) 60%, #050407 90%)",
  violet:
    "radial-gradient(60% 80% at 50% 50%, rgba(180,120,255,0.5), rgba(60,30,120,0.3) 60%, #050407 90%)",
  cyan:
    "radial-gradient(60% 80% at 50% 50%, rgba(120,220,230,0.5), rgba(40,90,100,0.3) 60%, #050407 90%)",
  magenta:
    "radial-gradient(60% 80% at 50% 50%, rgba(255,120,200,0.5), rgba(120,30,90,0.3) 60%, #050407 90%)",
  spectrum:
    "linear-gradient(180deg, transparent 38%, rgba(245,90,90,0.6) 42%, rgba(255,180,80,0.6) 48%, rgba(255,235,100,0.6) 53%, rgba(140,220,120,0.6) 58%, rgba(120,200,255,0.6) 63%, rgba(180,120,255,0.6) 68%, transparent 72%), #050407",
} as const;

export type AccentName = keyof typeof ACCENT_GRADIENTS;

export function gradientFor(accent: string | undefined): string {
  if (accent && accent in ACCENT_GRADIENTS) {
    return ACCENT_GRADIENTS[accent as AccentName];
  }
  return ACCENT_GRADIENTS.amber;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/accent-gradients.ts
git commit -m "$(cat <<'EOF'
Extract accent gradient lookup to src/lib

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Motion presets

**Files:**
- Create: `src/lib/motion-presets.ts`

- [ ] **Step 1: Create file**

```ts
import type { Variants, Transition } from "motion/react";

export const easeOut = [0, 0, 0.58, 1] as const;

export const fadeBlurIn = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  whileInView: { filter: "blur(0px)", opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.8, ease: easeOut, delay } as Transition,
});

export const fadeBlurInImmediate = (delay = 0) => ({
  initial: { filter: "blur(10px)", opacity: 0, y: 20 },
  animate: { filter: "blur(0px)", opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: easeOut, delay } as Transition,
});

export const blurInWord: Variants = {
  hidden: { filter: "blur(10px)", opacity: 0, y: 50 },
  visible: {
    filter: ["blur(10px)", "blur(5px)", "blur(0px)"],
    opacity: [0, 0.5, 1],
    y: [50, -5, 0],
  },
};

export const blurInWordTransition = (delayMs: number): Transition => ({
  duration: 0.7,
  times: [0, 0.5, 1],
  ease: easeOut,
  delay: delayMs / 1000,
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/motion-presets.ts
git commit -m "$(cat <<'EOF'
Add motion entrance presets shared across animated components

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Glass lensing hook

**Files:**
- Create: `src/lib/glass-lensing.ts`
- Reference: `migration/yilun-lab-website/project/src/app.jsx:7-29`

- [ ] **Step 1: Create file**

```ts
import { useEffect } from "react";

/**
 * Tracks the pointer and writes its relative position into --gx/--gy on every
 * ancestor `.liquid-glass` / `.liquid-glass-strong` element under the cursor.
 * The radial gradients in global.css read those vars to bend specular highlights
 * toward the pointer.
 *
 * Call once at the top of any island that contains glass elements (Navbar
 * works because it appears on every page).
 */
export function useGlassLensing() {
  useEffect(() => {
    function onMove(e: PointerEvent) {
      let node: HTMLElement | null = e.target as HTMLElement | null;
      while (node && node !== document.documentElement) {
        const cl = node.classList;
        if (cl && (cl.contains("liquid-glass") || cl.contains("liquid-glass-strong"))) {
          const r = node.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * 100;
          const y = ((e.clientY - r.top) / r.height) * 100;
          node.style.setProperty("--gx", x + "%");
          node.style.setProperty("--gy", y + "%");
        }
        node = node.parentElement;
      }
    }
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/glass-lensing.ts
git commit -m "$(cat <<'EOF'
Port useGlassLensing hook from prototype

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Inline icons

**Files:**
- Create: `src/components/react/icons.tsx`
- Reference: `migration/yilun-lab-website/project/src/glass.jsx`

- [ ] **Step 1: Create file**

```tsx
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function ArrowUpRight({ className = "h-5 w-5", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function PlayIcon({ className = "h-4 w-4", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

export function ClockIcon({ className = "h-7 w-7", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2.5" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-7 w-7", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 3.2 4.2 6.2 4.2 9s-1.4 5.8-4.2 9c-2.8-3.2-4.2-6.2-4.2-9S9.2 6.2 12 3z" />
    </svg>
  );
}

export function ImageIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
    </svg>
  );
}

export function MovieIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
    </svg>
  );
}

export function BulbIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...rest}
    >
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/icons.tsx
git commit -m "$(cat <<'EOF'
Port inline SVG icons from prototype to React components

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: BlurText component

**Files:**
- Create: `src/components/react/BlurText.tsx`
- Reference: `migration/yilun-lab-website/project/src/blurtext.jsx`

- [ ] **Step 1: Create file**

```tsx
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { blurInWord, blurInWordTransition } from "@lib/motion-presets";

interface BlurTextProps {
  text: string;
  className?: string;
  staggerMs?: number;
}

export function BlurText({ text, className = "", staggerMs = 100 }: BlurTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setVisible(true);
        }),
      { threshold: 0.1 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const words = text.split(" ");

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        rowGap: "0.1em",
        margin: 0,
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          variants={blurInWord}
          initial="hidden"
          animate={visible ? "visible" : "hidden"}
          transition={blurInWordTransition(i * staggerMs)}
          style={{ display: "inline-block", marginRight: "0.32em" }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}
```

- [ ] **Step 2: Verify type-check passes**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: no errors in `BlurText.tsx`. (Pages are still missing — that's fine.)

- [ ] **Step 3: Commit**

```bash
git add src/components/react/BlurText.tsx
git commit -m "$(cat <<'EOF'
Port BlurText word-by-word entrance animation

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: FadingVideo component

**Files:**
- Create: `src/components/react/FadingVideo.tsx`
- Reference: `migration/yilun-lab-website/project/src/video.jsx`

- [ ] **Step 1: Create file**

```tsx
import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

interface FadingVideoProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55;

export function FadingVideo({ src, className = "", style = {} }: FadingVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    function fadeTo(target: number, duration = FADE_MS) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const start = performance.now();
      const from = parseFloat(video!.style.opacity || "0") || 0;
      const delta = target - from;
      function step(now: number) {
        const t = Math.min(1, (now - start) / duration);
        video!.style.opacity = String(from + delta * t);
        if (t < 1) rafRef.current = requestAnimationFrame(step);
      }
      rafRef.current = requestAnimationFrame(step);
    }

    function onLoaded() {
      video!.style.opacity = "0";
      const p = video!.play();
      if (p && p.catch) p.catch(() => {});
      fadeTo(1);
    }

    function onTime() {
      const dur = video!.duration;
      if (!isFinite(dur) || dur <= 0) return;
      const left = dur - video!.currentTime;
      if (!fadingOutRef.current && left <= FADE_OUT_LEAD && left > 0) {
        fadingOutRef.current = true;
        fadeTo(0);
      }
    }

    function onEnded() {
      video!.style.opacity = "0";
      window.setTimeout(() => {
        try {
          video!.currentTime = 0;
          const p = video!.play();
          if (p && p.catch) p.catch(() => {});
        } catch {
          /* ignore */
        }
        fadingOutRef.current = false;
        fadeTo(1);
      }, 100);
    }

    video.style.opacity = "0";
    video.addEventListener("loadeddata", onLoaded);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("ended", onEnded);

    if (video.readyState >= 2) onLoaded();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoaded);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
```

- [ ] **Step 2: Verify type-check**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: clean for FadingVideo.

- [ ] **Step 3: Commit**

```bash
git add src/components/react/FadingVideo.tsx
git commit -m "$(cat <<'EOF'
Port FadingVideo crossfade-on-loop component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: PillTabs primitive

**Files:**
- Create: `src/components/react/PillTabs.tsx`

This is a generic version of the prototype's `FilterTabs` (sections.jsx:285-342) — extracted so the chapters-tabbed variant can reuse the same sliding-indicator behavior.

- [ ] **Step 1: Create file**

```tsx
import { useEffect, useRef, useState } from "react";

export interface PillTab {
  id: string;
  label: string;
  badge?: string | number;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function PillTabs({ tabs, activeId, onChange, className = "" }: PillTabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const active = c.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) return;
    const cR = c.getBoundingClientRect();
    const aR = active.getBoundingClientRect();
    setIndicator({ left: aR.left - cR.left, width: aR.width, opacity: 1 });
  }, [activeId, tabs]);

  return (
    <div
      ref={containerRef}
      className={
        "liquid-glass relative inline-flex flex-wrap items-center p-1.5 gap-1 rounded-full " +
        className
      }
    >
      <span
        className="liquid-glass-tint absolute rounded-full pointer-events-none"
        style={{
          left: indicator.left,
          width: indicator.width,
          top: 6,
          bottom: 6,
          opacity: indicator.opacity,
          transition:
            "left 420ms cubic-bezier(.2,.9,.2,1), width 420ms cubic-bezier(.2,.9,.2,1), opacity 240ms ease",
          zIndex: 0,
        }}
      />
      {tabs.map((t) => {
        const isActive = activeId === t.id;
        return (
          <button
            key={t.id}
            type="button"
            data-active={isActive}
            onClick={() => onChange(t.id)}
            className={
              "relative z-10 px-4 py-2 text-sm font-medium font-body rounded-full inline-flex items-center gap-2 transition-colors duration-300 " +
              (isActive ? "text-[#fff5e0]" : "glass-link text-white/85")
            }
            style={isActive ? { textShadow: "0 1px 0 rgba(80,40,5,0.45)" } : undefined}
          >
            {t.label}
            {t.badge !== undefined && (
              <span className={"text-[10px] " + (isActive ? "text-[#fff0d0]/75" : "text-white/50")}>
                {t.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/react/PillTabs.tsx
git commit -m "$(cat <<'EOF'
Add generic PillTabs primitive with sliding indicator

Reusable shell for both the homepage Works filter and the chapters-tabbed
case study variant.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3 — Layout shells

### Task 13: BaseHead.astro

**Files:**
- Create: `src/components/BaseHead.astro`

- [ ] **Step 1: Create file**

```astro
---
import "@styles/global.css";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

const {
  title,
  description = "A creative lighting lab shaping emotion, space, and future experiences through light.",
  ogImage = "/og-image.jpg",
  canonical = Astro.url.pathname,
} = Astro.props;

const fullTitle = title === "YILUN LAB" ? title : `${title} — YILUN LAB`;
const canonicalURL = new URL(canonical, Astro.site);
const ogImageURL = new URL(ogImage, Astro.site);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{fullTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalURL} />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<meta property="og:type" content="website" />
<meta property="og:url" content={canonicalURL} />
<meta property="og:title" content={fullTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={ogImageURL} />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={fullTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={ogImageURL} />
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BaseHead.astro
git commit -m "$(cat <<'EOF'
Add BaseHead with SEO + OG metadata + global CSS import

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: BaseLayout.astro

**Files:**
- Create: `src/components/BaseLayout.astro`

- [ ] **Step 1: Create file**

```astro
---
import BaseHead from "./BaseHead.astro";
import { Analytics } from "@vercel/analytics/astro";
import SpeedInsights from "@vercel/speed-insights/astro";

interface Props {
  title: string;
  description?: string;
  ogImage?: string;
  canonical?: string;
}

const props = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <BaseHead {...props} />
  </head>
  <body class="bg-black text-white font-body">
    <noscript class="block p-6 font-body text-white/70">
      This page is best experienced with JavaScript enabled.
    </noscript>
    <slot />
    <Analytics />
    <SpeedInsights />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BaseLayout.astro
git commit -m "$(cat <<'EOF'
Add BaseLayout with Vercel analytics + speed insights

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4 — Navigation + Footer

### Task 15: Navbar component

**Files:**
- Create: `src/components/react/Navbar.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:21-63`

The Navbar is per-spec the place where `useGlassLensing` runs (it appears on every page).

- [ ] **Step 1: Create file**

```tsx
import { useGlassLensing } from "@lib/glass-lensing";
import { ArrowUpRight } from "./icons";

interface NavbarProps {
  /**
   * "page" mode (default): items navigate to /, /#anchor, /about, /contact.
   * "scroll" mode: items scroll to anchors on the same page (homepage only).
   */
  mode?: "page" | "scroll";
  /** When mode="page", which top-level page is active so we can highlight it. */
  activePage?: "home" | "about" | "contact" | null;
}

export function Navbar({ mode = "page", activePage = null }: NavbarProps) {
  useGlassLensing();

  function jumpTo(target: string) {
    if (mode === "scroll") {
      if (target === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      const el = document.getElementById(target);
      if (el) {
        const top = el.getBoundingClientRect().top + window.pageYOffset - 20;
        window.scrollTo({ top, behavior: "smooth" });
      }
    } else {
      if (target === "top") window.location.href = "/";
      else if (target === "about") window.location.href = "/about";
      else if (target === "collaborate") window.location.href = "/contact";
      else window.location.href = `/#${target}`;
    }
  }

  const links = [
    { id: "capabilities", label: "Capabilities" },
    { id: "works", label: "Works" },
    { id: "about", label: "About" },
  ];

  function isLinkActive(id: string) {
    if (id === "about" && activePage === "about") return true;
    return false;
  }

  return (
    <>
      <div className="scroll-edge" aria-hidden="true" />
      <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 flex items-center justify-between font-body">
        <button
          onClick={() => jumpTo("top")}
          className="liquid-glass w-12 h-12 flex items-center justify-center rounded-full"
          aria-label="Yilun Lab"
        >
          <span className="font-heading italic text-white text-2xl leading-none lowercase select-none">
            y
          </span>
        </button>

        <div className="liquid-glass hidden md:flex items-center px-1.5 py-1.5 rounded-full">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => jumpTo(l.id)}
              className={
                "glass-link px-3 py-2 text-sm font-medium font-body rounded-full " +
                (isLinkActive(l.id) ? "text-[#fff5e0]" : "text-white/85")
              }
            >
              {l.label}
            </button>
          ))}
          <button
            onClick={() => jumpTo("collaborate")}
            className={
              "liquid-glass-strong liquid-glass-tint ml-1 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap"
            }
          >
            Collaborate <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="w-12 h-12 invisible" aria-hidden="true" />
      </nav>
    </>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/react/Navbar.tsx
git commit -m "$(cat <<'EOF'
Add Navbar island with page/scroll mode + glass lensing

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Footer component

**Files:**
- Create: `src/components/react/Footer.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:651-670`

- [ ] **Step 1: Create file**

```tsx
export function Footer() {
  return (
    <footer className="relative bg-black px-8 md:px-16 lg:px-20 pt-16 pb-10 border-t border-white/10">
      <div className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px] mb-12">
        Light. Emotion. Future.
      </div>
      <div className="flex items-end justify-between flex-wrap gap-6 text-xs text-white/55 font-body uppercase tracking-[0.18em]">
        <div>
          <div className="text-white/85">YILUN LAB · est. 2022</div>
          <div>Yilun (Yilia) Zhan, Founder</div>
        </div>
        <div className="text-right">
          <div className="text-white/85">© 2026 — All rights reserved.</div>
          <div>Built with light.</div>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/Footer.tsx
git commit -m "$(cat <<'EOF'
Port Footer component

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5 — Homepage sections

### Task 17: Hero component

**Files:**
- Create: `src/components/react/Hero.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:65-186`

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { FadingVideo } from "./FadingVideo";
import { BlurText } from "./BlurText";
import { ArrowUpRight, PlayIcon, ClockIcon, GlobeIcon } from "./icons";
import { easeOut } from "@lib/motion-presets";

const HERO_VIDEO_SRC = "/assets/videos/hero.mp4";

export function Hero() {
  return (
    <section
      data-screen-label="Home"
      id="top"
      className="relative w-full min-h-screen overflow-hidden flex flex-col"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 35%, rgba(245,175,60,0.28), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(140,80,20,0.35), transparent 60%)," +
          "linear-gradient(to bottom, #0a0705 0%, #050302 100%)",
      }}
    >
      <FadingVideo
        src={HERO_VIDEO_SRC}
        className="absolute left-1/2 top-0 -translate-x-1/2 object-cover object-top z-0"
        style={{ width: "120%", height: "120%" }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="h-24" />

        <div className="flex-1 flex flex-col items-center justify-center text-center pt-12 px-4">
          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.4 }}
            className="liquid-glass rounded-full inline-flex items-center gap-2 pl-1 pr-3 py-1"
          >
            <span className="bg-white text-black px-3 py-1 text-xs font-semibold rounded-full">
              New
            </span>
            <span className="text-sm text-white/90 font-body">
              Studio open for 2026 commissions
            </span>
          </motion.div>

          <div className="mt-6 max-w-3xl">
            <BlurText
              text="Light is my language."
              className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.85]"
            />
          </div>

          <motion.p
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.8 }}
            className="mt-5 text-sm md:text-base text-white max-w-2xl font-body font-light leading-tight"
          >
            A creative lighting lab shaping emotion, space, and future experiences through light.
            Immersive, human-centered work for art, culture, hospitality, wellness, and the
            future-facing.
          </motion.p>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.1 }}
            className="flex items-center gap-6 mt-6"
          >
            <a
              href="#works"
              className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap"
            >
              Enter the Lab <ArrowUpRight className="h-5 w-5" />
            </a>
            <a
              href="#works"
              className="liquid-glass rounded-full px-5 py-2.5 text-sm font-medium text-white inline-flex items-center gap-2 whitespace-nowrap"
            >
              See Selected Works <PlayIcon className="h-4 w-4" />
            </a>
          </motion.div>

          <motion.div
            initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
            animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 1.3 }}
            className="flex items-stretch gap-4 mt-8 flex-wrap justify-center"
          >
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <ClockIcon className="h-7 w-7 text-white" />
              <div className="mt-3 text-4xl font-heading italic text-white leading-none tracking-[-1px]">
                2022
              </div>
              <div className="text-xs text-white font-body font-light mt-2">
                Studio founded — practicing across art, performance, and tech
              </div>
            </div>
            <div className="liquid-glass p-5 w-[220px] rounded-[1.25rem] text-left">
              <GlobeIcon className="h-7 w-7 text-white" />
              <div className="mt-3 text-4xl font-heading italic text-white leading-none tracking-[-1px]">
                13+
              </div>
              <div className="text-xs text-white font-body font-light mt-2">
                Selected works across dance, installation, and AI film
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: easeOut, delay: 1.4 }}
          className="flex flex-col items-center gap-4 pb-8 px-4"
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white">
            Collaborating with artists, choreographers, brands, and institutions
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 md:gap-x-16 gap-y-2 font-heading italic text-white text-2xl md:text-3xl tracking-tight">
            <span>Art</span>
            <span>Dance</span>
            <span>Hospitality</span>
            <span>Wellness</span>
            <span>Future</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/Hero.tsx
git commit -m "$(cat <<'EOF'
Port Hero section with FadingVideo + BlurText + entrance animations

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: Capabilities component

**Files:**
- Create: `src/components/react/Capabilities.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:189-282`

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { FadingVideo } from "./FadingVideo";
import { ImageIcon, MovieIcon, BulbIcon } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";
import type { ComponentType, SVGProps } from "react";

const CAP_VIDEO_SRC = "/assets/videos/capabilities.mp4";

interface CardData {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
  title: string;
  tags: string[];
  body: string;
}

const CARDS: CardData[] = [
  {
    Icon: ImageIcon,
    title: "Spatial Light",
    tags: ["Atmosphere", "Architecture", "Memory", "Hospitality"],
    body: "Light treated as a second skin — designed for galleries, museums, and hospitality spaces where atmosphere is the architecture.",
  },
  {
    Icon: MovieIcon,
    title: "Performance & Installation",
    tags: ["Dance", "Stage", "Immersive", "Pavilion"],
    body: "Stage and spatial light for choreographers and immersive works — from intimate solos to 360° pavilions translating ideas into a living light-scape.",
  },
  {
    Icon: BulbIcon,
    title: "Future Experiences",
    tags: ["AI Film", "XR", "Interactive", "Emerging Tech"],
    body: "Pavilions, XR, AI-driven film, and emerging tech — light at the edge of what a space can do, recently shown at MIT AI Filmmaking Hackathon 2025.",
  },
];

export function Capabilities() {
  return (
    <section
      data-screen-label="Capabilities"
      id="capabilities"
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(60% 50% at 50% 30%, rgba(245,175,60,0.22), transparent 60%)," +
          "radial-gradient(80% 60% at 50% 100%, rgba(120,70,20,0.30), transparent 60%)," +
          "linear-gradient(to bottom, #0a0705 0%, #050302 100%)",
      }}
    >
      <FadingVideo
        src={CAP_VIDEO_SRC}
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="relative z-10 px-8 md:px-16 lg:px-20 pt-24 pb-10 flex flex-col min-h-screen">
        <div className="mb-auto">
          <div className="text-sm font-body text-white/80 mb-6">// Capabilities</div>
          <h2 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[6rem] leading-[0.9] tracking-[-3px]">
            The Lab,<br />
            in practice
          </h2>
          <p className="mt-8 max-w-xl text-white/85 font-body font-light text-base md:text-lg leading-snug">
            Light shapes how a space is felt, remembered, returned to. Across spatial design,
            installation, performance, and emerging technology — guided by a single conviction:
            that light is never just illumination.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {CARDS.map((c, idx) => (
            <CapabilityCard key={c.title} card={c} delay={idx * 0.12} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityCard({ card, delay }: { card: CardData; delay: number }) {
  const { Icon, title, tags, body } = card;
  return (
    <motion.div
      {...fadeBlurIn(delay)}
      className="liquid-glass rounded-[1.25rem] p-6 min-h-[360px] flex flex-col"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="liquid-glass w-11 h-11 rounded-[0.75rem] flex items-center justify-center">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5 max-w-[70%]">
          {tags.map((t) => (
            <span
              key={t}
              className="liquid-glass rounded-full px-3 py-1 text-[11px] text-white/90 font-body whitespace-nowrap"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-1" />
      <div className="mt-6">
        <h3 className="font-heading italic text-white text-3xl md:text-4xl tracking-[-1px] leading-none">
          {title}
        </h3>
        <p className="mt-3 text-sm text-white/90 font-body font-light leading-snug max-w-[32ch]">
          {body}
        </p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/Capabilities.tsx
git commit -m "$(cat <<'EOF'
Port Capabilities section with three cards + capabilities video

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: Manifesto section

**Files:**
- Create: `src/components/react/ManifestoSection.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:466-504`

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Founded", "2022"],
  ["Practice", "Spatial · Installation · Performance · Tech"],
  ["Clients", "Art · Hospitality · Wellness"],
  ["Status", "Available — 2026"],
];

export function ManifestoSection() {
  return (
    <section className="relative bg-black px-8 md:px-16 lg:px-20 py-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 max-w-7xl mx-auto">
        <motion.div {...fadeBlurIn(0)}>
          <div className="text-sm font-body text-white/80 mb-6">// The Lab</div>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5rem] leading-[0.9] tracking-[-2px]">
            Light shapes<br />
            how a space is felt,<br />
            remembered,<br />
            returned to.
          </h2>
        </motion.div>
        <motion.div {...fadeBlurIn(0.15)} className="flex flex-col gap-6 self-end">
          <p className="text-base md:text-lg text-white/90 font-body font-light leading-relaxed max-w-prose">
            YILUN LAB is a creative lighting lab shaping emotion, space, and future experiences
            through light. We work across spatial design, installation, performance, and emerging
            technology — guided by a single conviction: that light is never just illumination.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed max-w-prose">
            We collaborate with artists, choreographers, brands, and institutions whose work asks
            for stronger emotional impact and a distinctive visual identity. From a quiet
            hospitality detail to a 360° immersive pavilion, our practice is the same: feel
            first, build second.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
                  {k}
                </div>
                <div className="font-heading italic text-white text-xl leading-tight">{v}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/ManifestoSection.tsx
git commit -m "$(cat <<'EOF'
Port Manifesto section with two-column layout + fact cards

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: WorkCard component

**Files:**
- Create: `src/components/react/WorkCard.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:390-463`

The card now renders an `<a>` element (per spec §5 architectural rule 5) so links work without JS and are SEO-discoverable.

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { ArrowUpRight } from "./icons";
import { gradientFor } from "@lib/accent-gradients";
import { easeOut } from "@lib/motion-presets";

export interface WorkCardData {
  slug: string;
  title: string;
  subtitle?: string;
  tagline: string;
  category: string[];
  year?: string;
  accent: string;
  size: "xl" | "lg" | "md" | "sm";
}

const SIZE_CLASSES: Record<string, string> = {
  xl: "col-span-12",
  lg: "col-span-12 md:col-span-8",
  md: "col-span-12 sm:col-span-6 md:col-span-4",
  sm: "col-span-6 md:col-span-4",
};

interface WorkCardProps {
  project: WorkCardData;
  idx: number;
}

export function WorkCard({ project, idx }: WorkCardProps) {
  const aspect = project.size === "xl" ? "aspect-[16/7]" : "aspect-[4/3]";
  return (
    <motion.a
      href={`/projects/${project.slug}`}
      initial={{ filter: "blur(10px)", opacity: 0, y: 20 }}
      whileInView={{ filter: "blur(0px)", opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{
        duration: 0.7,
        ease: easeOut,
        delay: Math.min(idx * 0.06, 0.6),
      }}
      className={"group block text-left " + SIZE_CLASSES[project.size]}
    >
      <div className={"liquid-glass relative w-full overflow-hidden rounded-[1.25rem] " + aspect}>
        <div
          className="absolute inset-0"
          style={{ background: gradientFor(project.accent) }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(35% 30% at 50% 45%, rgba(255,255,255,0.18), transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-4 left-4 liquid-glass rounded-full px-3 py-1 text-[10px] text-white/80 font-body uppercase tracking-wider">
          {project.year || "—"}
        </div>
        <div className="absolute top-4 right-4 liquid-glass rounded-full w-9 h-9 flex items-center justify-center text-white/90 group-hover:text-white transition-colors">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
          <h3 className="font-heading italic text-white text-2xl md:text-3xl lg:text-4xl tracking-[-1px] leading-none">
            {project.title}
          </h3>
          {project.subtitle && (
            <div className="mt-1 text-white/70 text-sm font-body font-light">
              {project.subtitle}
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <p className="text-sm text-white/85 font-body font-light leading-snug max-w-[42ch]">
          {project.tagline}
        </p>
        <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] whitespace-nowrap pt-0.5">
          {project.category
            .map((c) => `Light & ${c[0].toUpperCase() + c.slice(1)}`)
            .join(" · ")}
        </div>
      </div>
    </motion.a>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/WorkCard.tsx
git commit -m "$(cat <<'EOF'
Port WorkCard as <a> link to /projects/<slug>

Replaces the prototype's onClick-modal with a real anchor for SEO and
no-JS support per spec architectural rule.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: WorksSection (uses PillTabs)

**Files:**
- Create: `src/components/react/WorksSection.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:344-388`

`WorksSection` accepts the project list as a prop (sourced from the content collection in the page wrapper).

- [ ] **Step 1: Create file**

```tsx
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { PillTabs, type PillTab } from "./PillTabs";
import { WorkCard, type WorkCardData } from "./WorkCard";
import { fadeBlurIn } from "@lib/motion-presets";

const CATEGORIES: PillTab[] = [
  { id: "all", label: "All Works" },
  { id: "art", label: "Light & Art" },
  { id: "dance", label: "Light & Dance" },
  { id: "tech", label: "Light & Tech" },
];

interface WorksSectionProps {
  projects: WorkCardData[];
}

export function WorksSection({ projects }: WorksSectionProps) {
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => projects.filter((p) => filter === "all" || p.category.includes(filter)),
    [projects, filter]
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) for (const cat of p.category) c[cat] = (c[cat] || 0) + 1;
    return c;
  }, [projects]);

  const tabs: PillTab[] = CATEGORIES.map((t) => ({ ...t, badge: counts[t.id] || 0 }));

  return (
    <section
      data-screen-label="Works"
      id="works"
      className="relative w-full bg-black px-8 md:px-16 lg:px-20 py-28"
    >
      <motion.div {...fadeBlurIn(0)} className="mb-14">
        <div className="text-sm font-body text-white/80 mb-6">// Works · Selected</div>
        <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px] max-w-3xl">
          A field of light<br />and what it shapes.
        </h2>
        <p className="mt-6 max-w-xl text-white/80 font-body font-light text-base md:text-lg leading-snug">
          From dance and immersive performance to spatial installation and AI-driven film, each
          work is an exploration of how light makes a moment unforgettable.
        </p>
      </motion.div>

      <PillTabs tabs={tabs} activeId={filter} onChange={setFilter} className="mb-10" />
      <div className="text-xs text-white/55 font-body mb-6 -mt-4">
        {filtered.length} {filtered.length === 1 ? "work" : "works"}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {filtered.map((p, i) => (
          <WorkCard key={p.slug} project={p} idx={i} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/WorksSection.tsx
git commit -m "$(cat <<'EOF'
Port WorksSection with PillTabs filter + content-collection-backed grid

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: AboutSection (homepage teaser)

**Files:**
- Create: `src/components/react/AboutSection.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:506-580`

The homepage version is the prototype's About section with a "Read full bio →" CTA appended pointing to `/about`.

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Roles", "Artist · Designer · Founder"],
  ["Disciplines", "Spatial · Stage · Installation"],
  ["Recent", "MIT AI Filmmaking Hackathon 2025"],
  ["Open to", "Commission · Collaboration"],
];

export function AboutSection() {
  return (
    <section
      data-screen-label="About"
      id="about"
      className="relative bg-black px-8 md:px-16 lg:px-20 py-28"
    >
      <motion.div {...fadeBlurIn(0)} className="mb-14">
        <div className="text-sm font-body text-white/80 mb-6">// Founder</div>
        <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px]">
          Yilun (Yilia) Zhan.
        </h2>
        <p className="mt-6 text-base md:text-lg text-white/85 font-body font-light max-w-2xl">
          Lighting artist, lighting designer, and founder of YILUN LAB.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start max-w-7xl mx-auto">
        <motion.div
          {...fadeBlurIn(0.1)}
          className="liquid-glass rounded-[1.25rem] aspect-[4/5] overflow-hidden relative"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(50% 60% at 50% 35%, rgba(245,185,66,0.55), transparent 70%), linear-gradient(to bottom, #150d08 0%, #050407 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(20% 15% at 50% 38%, rgba(255,220,170,0.6), transparent 70%)",
              mixBlendMode: "screen",
            }}
          />
          <div
            className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[20%] h-[70%] rounded-t-full"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55))" }}
          />
          <div className="absolute top-4 left-4 liquid-glass rounded-full px-3 py-1 text-[10px] text-white/80 font-body uppercase tracking-wider">
            Portrait — placeholder
          </div>
        </motion.div>

        <motion.div {...fadeBlurIn(0.2)} className="flex flex-col gap-6">
          <p className="text-base md:text-lg text-white/90 font-body font-light leading-relaxed">
            Yilun Zhan's practice focuses on creating emotional, immersive, and human-centered
            experiences through light — across spatial design, installation, performance, and
            emerging technology.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
            With a background in professional lighting design and a growing body of artistic and
            interdisciplinary work, she brings both conceptual vision and design sensitivity to
            projects that seek stronger emotional impact and distinctive visual identity.
          </p>
          <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
            She is especially interested in collaborations in art, culture, hospitality, wellness,
            and future-facing experiences — where light can shape how people feel, connect, and
            remember a space.
          </p>

          <div className="grid grid-cols-2 gap-3 mt-2">
            {FACTS.map(([k, v]) => (
              <div key={k} className="liquid-glass rounded-[1rem] p-4">
                <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
                  {k}
                </div>
                <div className="font-heading italic text-white text-lg leading-tight">{v}</div>
              </div>
            ))}
          </div>

          <a
            href="/about"
            className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 self-start mt-2"
          >
            Read full bio <ArrowUpRight className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/AboutSection.tsx
git commit -m "$(cat <<'EOF'
Port AboutSection with portrait placeholder + bio + read-more CTA

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: CollaborateSection (homepage teaser)

**Files:**
- Create: `src/components/react/CollaborateSection.tsx`
- Reference: `migration/yilun-lab-website/project/src/sections.jsx:582-649`

- [ ] **Step 1: Create file**

```tsx
import { motion } from "motion/react";
import { ArrowUpRight, PlayIcon } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const AREAS = [
  { num: "01", name: "Art & Culture", desc: "Galleries, museums, public installations." },
  { num: "02", name: "Performance", desc: "Dance, theater, immersive stage works." },
  { num: "03", name: "Hospitality & Wellness", desc: "Atmosphere as architecture, light as care." },
  { num: "04", name: "Future Experiences", desc: "Pavilions, XR, AI, emerging tech." },
];

export function CollaborateSection() {
  return (
    <section
      data-screen-label="Collaborate"
      id="collaborate"
      className="relative bg-black px-8 md:px-16 lg:px-20 py-28 overflow-hidden"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(50% 60% at 50% 50%, rgba(245,185,66,0.18), transparent 65%)",
        }}
      />
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div {...fadeBlurIn(0)}>
          <div className="text-sm font-body text-white/80 mb-6">// Work with us</div>
          <h2 className="font-heading italic text-white text-5xl md:text-6xl lg:text-[5.5rem] leading-[0.9] tracking-[-2px]">
            Tell us a space<br />you want to feel.
          </h2>
          <p className="mt-6 text-base md:text-lg text-white/85 font-body font-light max-w-2xl mx-auto">
            We're taking on a small number of new collaborations each season. If your project asks
            for emotional weight and a memorable visual identity through light — let's talk.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 mb-10 text-left">
          {AREAS.map((a, i) => (
            <motion.div
              key={a.num}
              {...fadeBlurIn(0.1 + i * 0.08)}
              className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[180px]"
            >
              <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                {a.num}
              </div>
              <div className="font-heading italic text-white text-2xl leading-tight">{a.name}</div>
              <div className="text-sm text-white/75 font-body font-light leading-snug">
                {a.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeBlurIn(0.4)} className="flex items-center gap-6 justify-center flex-wrap">
          <a
            href="/contact"
            className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            Start a Collaboration <ArrowUpRight className="h-5 w-5" />
          </a>
          <a
            href="/contact"
            className="liquid-glass rounded-full px-5 py-2.5 text-sm font-medium text-white inline-flex items-center gap-2"
          >
            Download Capabilities <PlayIcon className="h-4 w-4" />
          </a>
        </motion.div>

        <motion.div
          {...fadeBlurIn(0.5)}
          className="flex items-center gap-3 justify-center flex-wrap mt-10"
        >
          <a
            href="mailto:hello@yilunlab.com"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            hello@yilunlab.com
          </a>
          <a
            href="https://instagram.com/yilun.lab"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            @yilun.lab — Instagram
          </a>
          <a
            href="https://www.linkedin.com/in/yilun-zhan"
            className="liquid-glass rounded-full px-4 py-1.5 text-xs text-white/90 font-body"
          >
            linkedin / yilun-zhan
          </a>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/CollaborateSection.tsx
git commit -m "$(cat <<'EOF'
Port CollaborateSection with collab area cards + CTA pills

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6 — Homepage assembly

### Task 24: HomePage island + index.astro

**Files:**
- Create: `src/components/react/HomePage.tsx`
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/components/react/HomePage.tsx`**

```tsx
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { Capabilities } from "./Capabilities";
import { ManifestoSection } from "./ManifestoSection";
import { WorksSection } from "./WorksSection";
import { AboutSection } from "./AboutSection";
import { CollaborateSection } from "./CollaborateSection";
import { Footer } from "./Footer";
import type { WorkCardData } from "./WorkCard";

interface HomePageProps {
  projects: WorkCardData[];
}

export function HomePage({ projects }: HomePageProps) {
  return (
    <div>
      <Navbar mode="scroll" activePage="home" />
      <main>
        <Hero />
        <Capabilities />
        <ManifestoSection />
        <WorksSection projects={projects} />
        <AboutSection />
        <CollaborateSection />
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/pages/index.astro`**

```astro
---
import { getCollection } from "astro:content";
import BaseLayout from "@components/BaseLayout.astro";
import { HomePage } from "@components/react/HomePage";

const entries = await getCollection("projects", ({ data }) => !data.draft);
entries.sort((a, b) => (a.data.order ?? 9999) - (b.data.order ?? 9999));

const projects = entries.map((e) => ({
  slug: e.slug,
  title: e.data.title,
  subtitle: e.data.subtitle,
  tagline: e.data.tagline,
  category: e.data.category,
  year: e.data.year,
  accent: e.data.accent,
  size: e.data.size,
}));
---

<BaseLayout title="YILUN LAB" description="Light. Emotion. Future.">
  <HomePage client:load projects={projects} />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: build succeeds. May warn about empty content collection — acceptable; we seed in Phase 9.

- [ ] **Step 4: Commit**

```bash
git add src/components/react/HomePage.tsx src/pages/index.astro
git commit -m "$(cat <<'EOF'
Assemble HomePage island and mount as / via index.astro

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 7 — Other top-level pages

### Task 25: AboutPage + about.astro

**Files:**
- Create: `src/components/react/AboutPage.tsx`
- Create: `src/pages/about.astro`

The full about page expands the homepage teaser with deeper bio, a practice block, and a placeholder "selected credits" list.

- [ ] **Step 1: Create `src/components/react/AboutPage.tsx`**

```tsx
import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const FACTS: Array<[string, string]> = [
  ["Roles", "Artist · Designer · Founder"],
  ["Disciplines", "Spatial · Stage · Installation"],
  ["Recent", "MIT AI Filmmaking Hackathon 2025"],
  ["Open to", "Commission · Collaboration"],
];

const PRACTICE = [
  { num: "01", name: "Spatial Light",         note: "Galleries · museums · hospitality" },
  { num: "02", name: "Performance · Stage",   note: "Dance · theater · immersive" },
  { num: "03", name: "Installation",          note: "Pavilions · public works · interactive" },
  { num: "04", name: "Future Tech",           note: "AI film · XR · emerging media" },
];

const SELECTED_CREDITS = [
  { year: "2025", title: "MIT AI Filmmaking Hackathon — BLUE 001", role: "Director · Lighting" },
  { year: "2025", title: "TAO CAVE — Immersive pavilion",          role: "Lighting Artist · Tech Lead" },
  { year: "2024", title: "A Human Permeability — Drift · Eon · Mortal", role: "Lighting Artist · Director" },
  { year: "2024", title: "STARFALL — Ambient luminous field",      role: "Lighting Artist" },
  { year: "2024", title: "Eight Lights of HEALING",                role: "Lighting Designer" },
];

export function AboutPage() {
  return (
    <div>
      <Navbar mode="page" activePage="about" />
      <main className="pt-28">
        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20">
          <motion.div {...fadeBlurIn(0)} className="max-w-7xl mx-auto">
            <div className="text-sm font-body text-white/80 mb-6">// About</div>
            <h1 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px]">
              Yilun (Yilia) Zhan.
            </h1>
            <p className="mt-8 text-base md:text-xl text-white/85 font-body font-light max-w-2xl">
              Lighting artist, lighting designer, and founder of YILUN LAB — a creative lighting
              lab shaping emotion, space, and future experiences through light.
            </p>
          </motion.div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start max-w-7xl mx-auto">
            <motion.div
              {...fadeBlurIn(0.1)}
              className="liquid-glass rounded-[1.25rem] aspect-[4/5] overflow-hidden relative"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(50% 60% at 50% 35%, rgba(245,185,66,0.55), transparent 70%), linear-gradient(to bottom, #150d08 0%, #050407 100%)",
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(20% 15% at 50% 38%, rgba(255,220,170,0.6), transparent 70%)",
                  mixBlendMode: "screen",
                }}
              />
              <div
                className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[20%] h-[70%] rounded-t-full"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.55))",
                }}
              />
              <div className="absolute top-4 left-4 liquid-glass rounded-full px-3 py-1 text-[10px] text-white/80 font-body uppercase tracking-wider">
                Portrait — placeholder
              </div>
            </motion.div>

            <motion.div {...fadeBlurIn(0.2)} className="flex flex-col gap-6">
              <p className="text-base md:text-lg text-white/90 font-body font-light leading-relaxed">
                Yilun Zhan's practice focuses on creating emotional, immersive, and human-centered
                experiences through light — across spatial design, installation, performance, and
                emerging technology.
              </p>
              <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
                With a background in professional lighting design and a growing body of artistic
                and interdisciplinary work, she brings both conceptual vision and design
                sensitivity to projects that seek stronger emotional impact and distinctive
                visual identity.
              </p>
              <p className="text-base md:text-lg text-white/80 font-body font-light leading-relaxed">
                She is especially interested in collaborations in art, culture, hospitality,
                wellness, and future-facing experiences — where light can shape how people feel,
                connect, and remember a space.
              </p>

              <div className="grid grid-cols-2 gap-3 mt-2">
                {FACTS.map(([k, v]) => (
                  <div key={k} className="liquid-glass rounded-[1rem] p-4">
                    <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
                      {k}
                    </div>
                    <div className="font-heading italic text-white text-lg leading-tight">{v}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Practice</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Four ways light enters a space.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRACTICE.map((p, i) => (
                <motion.div
                  key={p.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[160px]"
                >
                  <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                    {p.num}
                  </div>
                  <div className="font-heading italic text-white text-2xl leading-tight">
                    {p.name}
                  </div>
                  <div className="text-sm text-white/75 font-body font-light leading-snug">
                    {p.note}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Selected credits</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Recent work, in brief.
              </h2>
            </motion.div>
            <ul className="divide-y divide-white/10">
              {SELECTED_CREDITS.map((c, i) => (
                <motion.li
                  key={`${c.year}-${c.title}`}
                  {...fadeBlurIn(0.05 + i * 0.04)}
                  className="grid grid-cols-12 gap-4 py-5"
                >
                  <span className="col-span-2 text-xs text-white/55 font-body uppercase tracking-[0.18em] pt-1">
                    {c.year}
                  </span>
                  <span className="col-span-7 font-heading italic text-white text-xl md:text-2xl leading-tight">
                    {c.title}
                  </span>
                  <span className="col-span-3 text-xs md:text-sm text-white/65 font-body font-light text-right pt-1">
                    {c.role}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div {...fadeBlurIn(0)}>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Want to collaborate?
              </h2>
              <p className="mt-6 text-base md:text-lg text-white/80 font-body font-light">
                The studio is taking on a small number of new projects each season.
              </p>
              <a
                href="/contact"
                className="liquid-glass-strong liquid-glass-tint rounded-full px-6 py-3 text-sm font-semibold inline-flex items-center gap-2 mt-8"
              >
                Start a Collaboration <ArrowUpRight className="h-5 w-5" />
              </a>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/pages/about.astro`**

```astro
---
import BaseLayout from "@components/BaseLayout.astro";
import { AboutPage } from "@components/react/AboutPage";
---

<BaseLayout
  title="About"
  description="Yilun (Yilia) Zhan, founder of YILUN LAB — lighting artist and designer."
>
  <AboutPage client:load />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/react/AboutPage.tsx src/pages/about.astro
git commit -m "$(cat <<'EOF'
Add AboutPage with full bio, practice block, selected credits, CTA

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 26: ContactPage + contact.astro

**Files:**
- Create: `src/components/react/ContactPage.tsx`
- Create: `src/pages/contact.astro`

- [ ] **Step 1: Create `src/components/react/ContactPage.tsx`**

```tsx
import { motion } from "motion/react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ArrowUpRight } from "./icons";
import { fadeBlurIn } from "@lib/motion-presets";

const AREAS = [
  { num: "01", name: "Art & Culture", desc: "Galleries, museums, public installations." },
  { num: "02", name: "Performance", desc: "Dance, theater, immersive stage works." },
  { num: "03", name: "Hospitality & Wellness", desc: "Atmosphere as architecture, light as care." },
  { num: "04", name: "Future Experiences", desc: "Pavilions, XR, AI, emerging tech." },
];

export function ContactPage() {
  return (
    <div>
      <Navbar mode="page" activePage="contact" />
      <main className="pt-28">
        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(60% 60% at 50% 0%, rgba(245,185,66,0.20), transparent 65%)",
            }}
          />
          <div className="relative max-w-5xl mx-auto text-center">
            <motion.div {...fadeBlurIn(0)}>
              <div className="text-sm font-body text-white/80 mb-6">// Work with us</div>
              <h1 className="font-heading italic text-white text-6xl md:text-7xl lg:text-[8rem] leading-[0.85] tracking-[-3px]">
                Tell us a space<br />you want to feel.
              </h1>
              <p className="mt-8 text-base md:text-xl text-white/85 font-body font-light max-w-2xl mx-auto">
                If your project asks for emotional weight and a memorable visual identity through
                light — we'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-20">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="mb-10">
              <div className="text-sm font-body text-white/80 mb-4">// Where we work</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-[-2px]">
                Four areas of collaboration.
              </h2>
            </motion.div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AREAS.map((a, i) => (
                <motion.div
                  key={a.num}
                  {...fadeBlurIn(0.1 + i * 0.08)}
                  className="liquid-glass rounded-[1.25rem] p-5 flex flex-col gap-2 min-h-[200px]"
                >
                  <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em]">
                    {a.num}
                  </div>
                  <div className="font-heading italic text-white text-2xl leading-tight">
                    {a.name}
                  </div>
                  <div className="text-sm text-white/75 font-body font-light leading-snug">
                    {a.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto">
            <motion.div {...fadeBlurIn(0)} className="liquid-glass rounded-[1.5rem] p-8 md:p-12">
              <div className="text-sm font-body text-white/80 mb-4">// Get in touch</div>
              <h2 className="font-heading italic text-white text-4xl md:text-5xl leading-[0.95] tracking-[-2px] mb-8">
                Let's talk about light.
              </h2>
              <p className="text-base md:text-lg text-white/85 font-body font-light leading-relaxed mb-8">
                Email is the fastest way to reach the studio. Tell us about your space, your
                timeline, and what you want it to feel like — we'll write back within a few days.
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href="mailto:hello@yilunlab.com"
                  className="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-3 text-sm font-semibold inline-flex items-center justify-between gap-2"
                >
                  hello@yilunlab.com <ArrowUpRight className="h-5 w-5" />
                </a>
                <a
                  href="https://instagram.com/yilun.lab"
                  className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white inline-flex items-center justify-between gap-2"
                >
                  Instagram — @yilun.lab <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/in/yilun-zhan"
                  className="liquid-glass rounded-full px-5 py-3 text-sm font-medium text-white inline-flex items-center justify-between gap-2"
                >
                  LinkedIn — yilun-zhan <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="relative bg-black px-8 md:px-16 lg:px-20 pb-28">
          <div className="max-w-3xl mx-auto text-center">
            <motion.p
              {...fadeBlurIn(0)}
              className="text-sm md:text-base text-white/65 font-body font-light leading-relaxed"
            >
              Currently taking a small number of new collaborations each season.
            </motion.p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
```

- [ ] **Step 2: Create `src/pages/contact.astro`**

```astro
---
import BaseLayout from "@components/BaseLayout.astro";
import { ContactPage } from "@components/react/ContactPage";
---

<BaseLayout
  title="Contact"
  description="Start a collaboration with YILUN LAB. Light. Emotion. Future."
>
  <ContactPage client:load />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

- [ ] **Step 4: Commit**

```bash
git add src/components/react/ContactPage.tsx src/pages/contact.astro
git commit -m "$(cat <<'EOF'
Add ContactPage with collab areas + email/social pills

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: 404.astro

**Files:**
- Create: `src/pages/404.astro`

The 404 is small enough that it doesn't need a React island — just a static Astro page that mounts the Navbar/Footer islands inline.

- [ ] **Step 1: Create file**

```astro
---
import BaseLayout from "@components/BaseLayout.astro";
import { Navbar } from "@components/react/Navbar";
import { Footer } from "@components/react/Footer";
import { ArrowUpRight } from "@components/react/icons";
---

<BaseLayout title="Lost in the dark" description="Page not found.">
  <Navbar client:load mode="page" />
  <main class="min-h-[80vh] flex items-center justify-center px-8">
    <div class="max-w-2xl text-center">
      <div class="text-sm font-body text-white/60 mb-6">// 404</div>
      <h1 class="font-heading italic text-white text-6xl md:text-7xl lg:text-[7rem] leading-[0.85] tracking-[-3px]">
        Lost in the dark.
      </h1>
      <p class="mt-6 text-base md:text-lg text-white/70 font-body font-light">
        The page you're looking for isn't here. Light leads back home.
      </p>
      <a
        href="/"
        class="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2 mt-8"
      >
        Back to home <ArrowUpRight className="h-4 w-4" />
      </a>
    </div>
  </main>
  <Footer />
</BaseLayout>
```

- [ ] **Step 2: Type-check**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/404.astro
git commit -m "$(cat <<'EOF'
Add 404 page with Lost in the dark headline + back-home CTA

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 8 — Case study system

### Task 28: MediaBlock component

**Files:**
- Create: `src/components/MediaBlock.astro`

`MediaBlock` is the MDX-callable wrapper for case study media — image, video, or YouTube. YouTube uses `lite-youtube-embed`.

- [ ] **Step 1: Create file**

```astro
---
import "lite-youtube-embed/src/lite-yt-embed.css";

interface Props {
  type: "image" | "video" | "youtube";
  src: string;
  alt?: string;
  caption?: string;
  poster?: string;
  aspect?: string;
}

const { type, src, alt = "", caption, poster, aspect = "aspect-[4/3]" } = Astro.props;
---

{type === "image" && (
  <figure class="liquid-glass relative overflow-hidden rounded-[1.25rem] my-6">
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      class={`w-full h-auto ${aspect ? aspect + " object-cover" : ""}`}
    />
    {caption && (
      <figcaption class="px-4 py-3 text-xs text-white/70 font-body font-light">
        {caption}
      </figcaption>
    )}
  </figure>
)}

{type === "video" && (
  <figure class={`liquid-glass relative overflow-hidden rounded-[1.25rem] my-6 ${aspect}`}>
    <video
      src={src}
      poster={poster}
      controls
      playsinline
      preload="metadata"
      class="w-full h-full object-cover"
    >
      <track kind="captions" />
    </video>
    {caption && (
      <figcaption class="px-4 py-3 text-xs text-white/70 font-body font-light">
        {caption}
      </figcaption>
    )}
  </figure>
)}

{type === "youtube" && (
  <figure class="liquid-glass relative overflow-hidden rounded-[1.25rem] my-6 aspect-video">
    <lite-youtube videoid={src} class="w-full h-full"></lite-youtube>
    {caption && (
      <figcaption class="px-4 py-3 text-xs text-white/70 font-body font-light">
        {caption}
      </figcaption>
    )}
  </figure>
)}

<script>
  import "lite-youtube-embed";
</script>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MediaBlock.astro
git commit -m "$(cat <<'EOF'
Add MediaBlock for image/video/youtube embeds in case studies

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 29: ImageWallVariant

**Files:**
- Create: `src/components/react/ImageWallVariant.tsx`

The default variant — centered intro paragraph above a 3-column image grid (matches the user's reference image).

- [ ] **Step 1: Create file**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/ImageWallVariant.tsx
git commit -m "$(cat <<'EOF'
Add ImageWallVariant — default case study layout with 3-col image grid

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 30: VideoHeroVariant

**Files:**
- Create: `src/components/react/VideoHeroVariant.tsx`

Variant 2 — YouTube hero on top, body prose, optional secondary image grid below.

- [ ] **Step 1: Create file**

```tsx
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
          /* @ts-expect-error custom element */
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
                /* @ts-expect-error custom element */
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/VideoHeroVariant.tsx
git commit -m "$(cat <<'EOF'
Add VideoHeroVariant — lite-youtube embed + prose + optional image grid

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 31: Chapters + Chapter slot components

**Files:**
- Create: `src/components/react/ChaptersContext.tsx`
- Create: `src/components/react/Chapter.tsx`
- Create: `src/components/react/Chapters.tsx`

Per spec §7.3, MDX authors wrap chapter prose in `<Chapter name="...">` blocks inside a `<Chapters>` parent. The wrapper reads variant from context — for `chapters` it stacks all children; for `chapters-tabbed` it renders only the active one.

- [ ] **Step 1: Create `src/components/react/ChaptersContext.tsx`**

```tsx
import { createContext, useContext } from "react";

export interface ChapterMeta {
  name: string;
  note: string;
  accent?: string;
  cover?: string;
}

export interface ChaptersContextValue {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterMeta[];
  activeName: string;
  setActiveName: (name: string) => void;
}

export const ChaptersContext = createContext<ChaptersContextValue | null>(null);

export function useChaptersContext(): ChaptersContextValue {
  const ctx = useContext(ChaptersContext);
  if (!ctx) {
    throw new Error("Chapter components must be used inside <Chapters>");
  }
  return ctx;
}
```

- [ ] **Step 2: Create `src/components/react/Chapter.tsx`**

```tsx
import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useChaptersContext } from "./ChaptersContext";
import { gradientFor } from "@lib/accent-gradients";
import { fadeBlurIn } from "@lib/motion-presets";

interface ChapterProps {
  name: string;
  children?: ReactNode;
}

export function Chapter({ name, children }: ChapterProps) {
  const ctx = useChaptersContext();
  const meta = ctx.chapters.find((c) => c.name === name);

  if (ctx.variant === "chapters-tabbed" && ctx.activeName !== name) {
    return null;
  }

  const accent = meta?.accent || "amber";

  return (
    <motion.section
      key={name}
      {...fadeBlurIn(0)}
      className="px-8 md:px-16 lg:px-20 py-16 max-w-6xl mx-auto"
    >
      {ctx.variant === "chapters" && (
        <div className="mb-8">
          <div className="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-2">
            // Chapter
          </div>
          <h3 className="font-heading italic text-white text-4xl md:text-5xl lg:text-6xl leading-[0.95] tracking-[-1.5px]">
            {name}
          </h3>
          {meta?.note && (
            <p className="mt-2 text-base md:text-lg text-white/70 font-body font-light italic">
              {meta.note}
            </p>
          )}
        </div>
      )}

      <div className="liquid-glass relative overflow-hidden rounded-[1.25rem] aspect-[16/9] mb-8">
        {meta?.cover ? (
          <img
            src={meta.cover}
            alt={`${name} — cover`}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <>
            <div className="absolute inset-0" style={{ background: gradientFor(accent) }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(35% 35% at 50% 50%, rgba(255,255,255,0.18), transparent 70%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
      </div>

      <div className="prose prose-invert max-w-3xl mx-auto text-base md:text-lg text-white/90 font-body font-light leading-relaxed [&>p]:mb-4">
        {children}
      </div>
    </motion.section>
  );
}
```

- [ ] **Step 3: Create `src/components/react/Chapters.tsx`**

```tsx
import type { ReactNode } from "react";
import { useState } from "react";
import { ChaptersContext, type ChapterMeta } from "./ChaptersContext";
import { PillTabs, type PillTab } from "./PillTabs";

interface ChaptersProps {
  variant: "chapters" | "chapters-tabbed";
  chapters: ChapterMeta[];
  children: ReactNode;
}

export function Chapters({ variant, chapters, children }: ChaptersProps) {
  const [activeName, setActiveName] = useState(chapters[0]?.name ?? "");

  const tabs: PillTab[] = chapters.map((c) => ({ id: c.name, label: c.name }));

  return (
    <ChaptersContext.Provider value={{ variant, chapters, activeName, setActiveName }}>
      {variant === "chapters-tabbed" && chapters.length > 0 && (
        <div className="px-8 md:px-16 lg:px-20 py-8 flex justify-center">
          <PillTabs tabs={tabs} activeId={activeName} onChange={setActiveName} />
        </div>
      )}
      <div>{children}</div>
    </ChaptersContext.Provider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/components/react/ChaptersContext.tsx src/components/react/Chapter.tsx src/components/react/Chapters.tsx
git commit -m "$(cat <<'EOF'
Add Chapters/Chapter slot components for chapters + chapters-tabbed variants

Single MDX authoring shape for both stacked and tabbed; wrapper reads
variant from context to decide rendering.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 32: CaseStudyLayout.astro + projects/[slug].astro

**Files:**
- Create: `src/components/CaseStudyLayout.astro`
- Create: `src/pages/projects/[slug].astro`

The layout is one Astro file that receives the full project entry, renders the navbar/header/meta/variant body/footer, and slots the MDX content.

- [ ] **Step 1: Create `src/components/CaseStudyLayout.astro`**

```astro
---
import { type CollectionEntry } from "astro:content";
import { Navbar } from "@components/react/Navbar";
import { Footer } from "@components/react/Footer";
import { ImageWallVariant } from "@components/react/ImageWallVariant";
import { VideoHeroVariant } from "@components/react/VideoHeroVariant";
import { Chapters } from "@components/react/Chapters";
import { ArrowUpRight } from "@components/react/icons";

interface Props {
  entry: CollectionEntry<"projects">;
  next?: CollectionEntry<"projects"> | null;
}

const { entry, next } = Astro.props;
const { data } = entry;
const { Content } = await entry.render();

const categoryRail = data.category
  .map((c) => `Light & ${c[0].toUpperCase() + c.slice(1)}`)
  .join(" · ");
---

<Navbar client:load mode="page" />

<article class="pt-28 pb-20 bg-black">
  <header class="relative px-8 md:px-16 lg:px-20 pb-12">
    <div class="max-w-6xl mx-auto">
      <div class="text-sm font-body text-white/80 mb-4">// {categoryRail}</div>
      <h1 class="font-heading italic text-white text-5xl md:text-7xl lg:text-[7rem] leading-[0.85] tracking-[-3px]">
        {data.title}
      </h1>
      {data.subtitle && (
        <div class="mt-3 font-heading italic text-white/80 text-2xl md:text-3xl">
          {data.subtitle}
        </div>
      )}
      <p class="mt-6 max-w-2xl text-base md:text-lg text-white/85 font-body font-light leading-relaxed">
        {data.tagline}
      </p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-10 max-w-3xl">
        {[
          ["Year", data.year || "—"],
          ["Role", data.role || "—"],
          ["Medium", data.medium || "—"],
          ["Runtime", data.runtime || data.date || "—"],
        ].map(([k, v]) => (
          <div class="liquid-glass rounded-[1rem] p-4">
            <div class="text-[10px] text-white/55 font-body uppercase tracking-[0.18em] mb-1.5">
              {k}
            </div>
            <div class="text-sm text-white font-body">{v}</div>
          </div>
        ))}
      </div>
    </div>
  </header>

  {data.variant === "image-wall" && (
    <ImageWallVariant
      client:load
      images={data.images}
      accent={data.accent}
      intro={<Content />}
    />
  )}

  {data.variant === "video-hero" && data.youtube && (
    <VideoHeroVariant
      client:load
      youtube={data.youtube}
      youtubeAlt={data.youtubeAlt}
      images={data.images}
      body={<Content />}
    />
  )}

  {(data.variant === "chapters" || data.variant === "chapters-tabbed") && data.chapters && (
    <Chapters client:load variant={data.variant} chapters={data.chapters}>
      <Content />
    </Chapters>
  )}

  {next && (
    <div class="px-8 md:px-16 lg:px-20 mt-12 max-w-6xl mx-auto">
      <div class="flex justify-between items-center pt-10 border-t border-white/10">
        <span class="text-xs text-white/55 font-body uppercase tracking-[0.18em]">Next work</span>
        <a
          href={`/projects/${next.slug}`}
          class="liquid-glass-strong liquid-glass-tint rounded-full px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
        >
          {next.data.title} <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )}
</article>

<Footer />
```

- [ ] **Step 2: Create `src/pages/projects/[slug].astro`**

```astro
---
import { getCollection, type CollectionEntry } from "astro:content";
import BaseLayout from "@components/BaseLayout.astro";
import CaseStudyLayout from "@components/CaseStudyLayout.astro";

export async function getStaticPaths() {
  const entries = await getCollection("projects", ({ data }) => !data.draft);
  entries.sort((a, b) => (a.data.order ?? 9999) - (b.data.order ?? 9999));

  return entries.map((entry, i) => {
    const next = entries[(i + 1) % entries.length];
    return {
      params: { slug: entry.slug },
      props: { entry, next },
    };
  });
}

interface Props {
  entry: CollectionEntry<"projects">;
  next: CollectionEntry<"projects">;
}

const { entry, next } = Astro.props;
---

<BaseLayout
  title={entry.data.title}
  description={entry.data.tagline}
  canonical={`/projects/${entry.slug}`}
>
  <CaseStudyLayout entry={entry} next={next} />
</BaseLayout>
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

Expected: build succeeds. May warn about empty content collection (no MDX yet) — that's fine; we seed in Phase 9.

- [ ] **Step 4: Commit**

```bash
git add src/components/CaseStudyLayout.astro src/pages/projects/[slug].astro
git commit -m "$(cat <<'EOF'
Add CaseStudyLayout and dynamic /projects/[slug] route

Branches on data.variant to mount one of four React variants; passes
MDX <Content /> through as either intro, body, or chapters body.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 33: MDX components glue

**Files:**
- Create: `src/lib/mdx-components.ts`
- Modify: `src/components/CaseStudyLayout.astro`

To make `<Chapter>` callable inside MDX bodies, Astro's `<Content />` accepts a `components` prop. We register `Chapter` (and a server-side `MediaBlock` wrapper) globally for case study content.

- [ ] **Step 1: Create `src/lib/mdx-components.ts`**

```ts
import { Chapter } from "@components/react/Chapter";

export const caseStudyComponents = {
  Chapter,
};
```

- [ ] **Step 2: Modify `src/components/CaseStudyLayout.astro`**

Add the import to the frontmatter (after the other imports):

```ts
import { caseStudyComponents } from "@lib/mdx-components";
```

Then make three exact replacements in the body of the file:

Replace:
```astro
      intro={<Content />}
```
with:
```astro
      intro={<Content components={caseStudyComponents} />}
```

Replace:
```astro
      body={<Content />}
```
with:
```astro
      body={<Content components={caseStudyComponents} />}
```

Replace:
```astro
    <Chapters client:load variant={data.variant} chapters={data.chapters}>
      <Content />
    </Chapters>
```
with:
```astro
    <Chapters client:load variant={data.variant} chapters={data.chapters}>
      <Content components={caseStudyComponents} />
    </Chapters>
```

- [ ] **Step 3: Type-check**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro check
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/mdx-components.ts src/components/CaseStudyLayout.astro
git commit -m "$(cat <<'EOF'
Wire Chapter component into MDX rendering via Content components prop

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 9 — Seed content collection

### Task 34: Seed all 13 MDX project files

**Files:**
- Create: `src/content/projects/human-permeability.mdx`
- Create: `src/content/projects/true-self.mdx`
- Create: `src/content/projects/through-limits.mdx`
- Create: `src/content/projects/starfall.mdx`
- Create: `src/content/projects/eight-lights.mdx`
- Create: `src/content/projects/saoko.mdx`
- Create: `src/content/projects/myself.mdx`
- Create: `src/content/projects/bizcochito.mdx`
- Create: `src/content/projects/her.mdx`
- Create: `src/content/projects/morning-birdsong.mdx`
- Create: `src/content/projects/tao-cave.mdx`
- Create: `src/content/projects/blue-001.mdx`
- Create: `src/content/projects/aura-cave-intro.mdx`

Each file is generated from `migration/yilun-lab-website/project/src/data.jsx` per the migration map in spec §11. Order numbers match the source array index.

- [ ] **Step 1: Create `human-permeability.mdx`**

```mdx
---
title: A Human Permeability
subtitle: Drift · Eon · Mortal
tagline: A series of video discussing the multi-faceted nature of a human being, a living, and an individual.
category: [art, dance]
year: "2024"
role: Lighting Artist · Director
medium: Three-channel video · light installation
runtime: 12 min
accent: violet
size: lg
variant: chapters-tabbed
chapters:
  - { name: Drift,  note: untethered shimmer,        accent: cyan }
  - { name: Eon,    note: a soul stirring,           accent: magenta }
  - { name: Mortal, note: unbecoming softly alive,   accent: red }
order: 1
---

A Human Permeability is a triptych of moving-image works that traces the porous edges of selfhood — where the body, its shadows, and the light around it begin to bleed into one another.

Each chapter — Drift, Eon, Mortal — uses a distinct lighting vocabulary to articulate a different state of being: the wandering body, the timeless body, the finite body.

Light is treated not as illumination but as a second skin: it touches, dissolves, lingers, and leaves traces on the figure long after the gesture is gone.

<Chapter name="Drift">
  Drift is the wandering body. Light treated as a second skin — it touches, dissolves, lingers, and leaves traces long after the gesture is gone.
</Chapter>

<Chapter name="Eon">
  Eon is the timeless body. A soul stirring across centuries, an interior horizon held still by a single luminous gesture.
</Chapter>

<Chapter name="Mortal">
  Mortal is the finite body. Unbecoming, softly alive — light gathers and disperses, marking the small distance between presence and disappearance.
</Chapter>
```

- [ ] **Step 2: Create `true-self.mdx`**

```mdx
---
title: TRUE SELF
tagline: A mirror, and what it reflects when you persevere.
category: [dance, art]
year: "2024"
role: Lighting Designer
medium: Performance · projection
runtime: 9 min
accent: amber
size: md
variant: image-wall
order: 2
---

A study in mirrored light — the stage becomes the surface and the dancer becomes the reflection. Across nine minutes, the body returns to itself.
```

- [ ] **Step 3: Create `through-limits.mdx`**

```mdx
---
title: THROUGH LIMITS
tagline: Movement at the edge of light. The body as a threshold.
category: [dance, art]
year: "2023"
role: Lighting Designer
medium: Stage · spatial light
accent: spectrum
size: md
variant: image-wall
order: 3
---

Through Limits asks where the body ends and the light begins. The dancer crosses into and out of beams that act less as illumination than as a sequence of doorways.
```

- [ ] **Step 4: Create `starfall.mdx`**

```mdx
---
title: STARFALL
tagline: An ambient luminous field — falling slow, like memory.
category: [art]
year: "2024"
role: Lighting Artist
medium: Installation
accent: cyan
size: xl
variant: image-wall
order: 4
---

Starfall is a slow-moving light field. Particles of luminance drift downward across the room, never landing — a piece about how memory accumulates without arrival.
```

- [ ] **Step 5: Create `eight-lights.mdx`**

```mdx
---
title: Eight Lights of HEALING
tagline: A four-piece dance-light suite on memory, light, and somatic release.
category: [dance]
year: "2024"
role: Lighting Designer
medium: Performance series
accent: blue
size: lg
variant: image-wall
order: 5
---

A four-piece dance-light suite. Eight Lights traces movement, breath, and recovery as colors of light — a sequence that asks the audience to feel rather than watch.
```

- [ ] **Step 6: Create `saoko.mdx`**

```mdx
---
title: SAOKO
tagline: A flicker that lives in the opening rhythm of the dance — a spectral charge.
category: [dance]
year: "2023"
role: Lighting Designer
medium: Performance
accent: magenta
size: sm
variant: image-wall
order: 6
---

A spectral charge held in the opening rhythm — Saoko's light is not steady; it flickers in time with the body, electric and unstable.
```

- [ ] **Step 7: Create `myself.mdx`**

```mdx
---
title: MYSELF
tagline: The piece is a study in self-portrait through borrowed light.
category: [dance]
year: "2023"
role: Lighting Designer
medium: Performance
accent: cyan
size: sm
variant: image-wall
order: 7
---

A self-portrait drawn in borrowed light. Myself is the dancer's hand on her own shadow.
```

- [ ] **Step 8: Create `bizcochito.mdx`**

```mdx
---
title: BIZCOCHITO
tagline: A dancer crossing live beams of color — sweet, electric, and motion-clad.
category: [dance]
year: "2023"
role: Lighting Designer
medium: Performance
accent: red
size: sm
variant: image-wall
order: 8
---

Color as candy, beams as ribbons — Bizcochito is sweet, fast, and bright. Light meets motion at the speed of joy.
```

- [ ] **Step 9: Create `her.mdx`**

```mdx
---
title: "HE:R"
tagline: A spectrum, summarized through the body — what every woman can be.
category: [dance]
year: "2023"
role: Lighting Designer
medium: Performance
accent: spectrum
size: sm
variant: image-wall
order: 9
---

A full spectrum, refracted through the body. HE:R is a portrait of plurality — what every woman can be, all at once.
```

- [ ] **Step 10: Create `morning-birdsong.mdx`**

```mdx
---
title: Morning Birdsong
tagline: Two figures and a lull — a moment when you are most alive.
category: [dance]
year: "2023"
role: Lighting Designer
medium: Performance
accent: green
size: sm
variant: image-wall
order: 10
---

A lull, held between two dancers. The light is soft, the air is full of song — a reminder that aliveness is quiet.
```

- [ ] **Step 11: Create `tao-cave.mdx`**

```mdx
---
title: TAO CAVE
tagline: An immersive lighting pavilion translating the Taoist Five Elements into a living light-scape.
category: [tech, art]
year: "2025"
role: Lighting Artist · Tech Lead
medium: Pavilion · interactive light
date: 1/31/25
accent: amber
size: md
variant: image-wall
order: 11
---

Tao Cave translates the Taoist Five Elements into a 360° light-scape. Visitors move through wood, fire, earth, metal, and water — each element rendered as a distinct lighting vocabulary.
```

- [ ] **Step 12: Create `blue-001.mdx`**

```mdx
---
title: BLUE 001
tagline: An AI-generated short film premiered at MIT AI Filmmaking Hackathon 2025.
category: [tech]
year: "2025"
role: Director · Lighting
medium: Short film · AI
date: 2/16/25
accent: blue
size: md
variant: image-wall
order: 12
---

BLUE 001 is an AI-driven short film about a single color and what it remembers. Premiered at MIT AI Filmmaking Hackathon 2025.
```

- [ ] **Step 13: Create `aura-cave-intro.mdx`**

```mdx
---
title: Aura Cave — Intro
tagline: The opening movement of an ongoing immersive cave project.
category: [tech]
year: "2025"
role: Lighting Artist
medium: Installation · light
date: 1/22/25
accent: blue
size: md
variant: image-wall
order: 13
---

The opening movement of Aura Cave, an ongoing immersive series. Light enters first — sound and motion follow.
```

- [ ] **Step 14: Verify the collection loads**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npx astro sync && npx astro check
```

Expected: 13 entries in the projects collection; no schema errors. Astro reports each entry validated.

- [ ] **Step 15: Commit**

```bash
git add src/content/projects
git commit -m "$(cat <<'EOF'
Seed 13 MDX project files from prototype data.jsx

human-permeability uses chapters-tabbed; the rest use image-wall as
default. All have empty images[] — gradient placeholders render until
real images are added.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 10 — Assets

### Task 35: Download placeholder videos

**Files:**
- Create: `public/assets/videos/hero.mp4`
- Create: `public/assets/videos/capabilities.mp4`

- [ ] **Step 1: Create directory**

```bash
mkdir -p /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos
```

- [ ] **Step 2: Download videos via curl**

```bash
curl -L -o /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos/hero.mp4 \
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_080021_d598092b-c4c2-4e53-8e46-94cf9064cd50.mp4"
curl -L -o /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos/capabilities.mp4 \
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4"
```

Expected: hero.mp4 ≈ 2.1 MB, capabilities.mp4 ≈ 20.7 MB.

- [ ] **Step 3: Verify file integrity**

```bash
ls -la /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos
ffprobe -v error -show_entries format=duration,size -of csv=p=0 /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos/hero.mp4
ffprobe -v error -show_entries format=duration,size -of csv=p=0 /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/videos/capabilities.mp4
```

Expected: both files probe successfully; duration ≈ 7.0s and 12.0s respectively.

- [ ] **Step 4: Commit**

The videos are large binary blobs but core to the design. Commit them so deploys don't depend on the external CDN:

```bash
git add public/assets/videos/hero.mp4 public/assets/videos/capabilities.mp4
git commit -m "$(cat <<'EOF'
Add placeholder hero and capabilities videos to public assets

Same filenames as referenced by Hero.tsx and Capabilities.tsx so
real footage can be dropped in without code changes.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 36: Placeholder favicon, OG image, gitkeep for image folders

**Files:**
- Create: `public/favicon.svg`
- Create: `public/og-image.jpg`
- Create: `public/assets/images/.gitkeep`

- [ ] **Step 1: Create `public/favicon.svg`**

A minimal italic-y favicon matching the brand mark:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="32" fill="#0a0705"/>
  <text x="50%" y="56%" text-anchor="middle"
        font-family="Georgia, 'Instrument Serif', serif"
        font-style="italic" font-size="44" fill="#f5af3c">y</text>
</svg>
```

- [ ] **Step 2: Add a placeholder OG image**

Create a script `scripts/make-og-image.mjs` and run it:

```bash
mkdir -p /Users/rudyz/Documents/projects/Yilun-Lab-Website/scripts
```

Write `/Users/rudyz/Documents/projects/Yilun-Lab-Website/scripts/make-og-image.mjs`:

```js
import sharp from "sharp";

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%">
      <stop offset="0%" stop-color="#f5af3c" stop-opacity="0.45"/>
      <stop offset="70%" stop-color="#0a0705" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0a0705"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="320" text-anchor="middle"
        font-family="Georgia, serif" font-style="italic"
        font-size="110" fill="#ffffff">YILUN LAB</text>
  <text x="600" y="395" text-anchor="middle"
        font-family="Georgia, serif" font-style="italic"
        font-size="40" fill="#fff5e0">Light. Emotion. Future.</text>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 85 })
  .toFile("public/og-image.jpg");

console.log("public/og-image.jpg written");
```

Run it:

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && node scripts/make-og-image.mjs
```

Expected: prints "public/og-image.jpg written" and `public/og-image.jpg` exists at ~30 KB.

- [ ] **Step 3: Create `.gitkeep`**

```bash
mkdir -p /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/images
touch /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/images/.gitkeep
```

- [ ] **Step 4: Remove the existing stray .DS_Store**

```bash
rm -f /Users/rudyz/Documents/projects/Yilun-Lab-Website/public/assets/.DS_Store
```

- [ ] **Step 5: Commit**

```bash
git add public/favicon.svg public/og-image.jpg public/assets/images/.gitkeep
git commit -m "$(cat <<'EOF'
Add placeholder favicon, OG image, and image folder structure

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 11 — Deploy + DX

### Task 37: Verify Vercel adapter analytics + speed insights

**Files:**
- (No new files — verify the existing wiring)

The `astro.config.mjs` already enables web analytics on the adapter, and `BaseLayout.astro` mounts both `<Analytics />` and `<SpeedInsights />` components from `@vercel/analytics/astro` and `@vercel/speed-insights/astro`. This task verifies that the Vercel-specific imports resolve correctly.

- [ ] **Step 1: Verify build produces a Vercel output**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npm run build
```

Expected: build completes; `dist/` contains the static site; `.vercel/output/` contains the Vercel adapter output. Output mentions "Vercel" in the build log.

- [ ] **Step 2: Spot-check the built HTML for analytics scripts**

```bash
grep -l "vercel" /Users/rudyz/Documents/projects/Yilun-Lab-Website/.vercel/output/static/*.html | head
grep -o "_vercel/insights" /Users/rudyz/Documents/projects/Yilun-Lab-Website/.vercel/output/static/index.html
```

Expected: at least one HTML file references `_vercel/insights` (the speed-insights endpoint).

- [ ] **Step 3: Local preview**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npm run preview &
sleep 3
curl -s http://localhost:4321/ | head -20
kill %1
```

Expected: preview server returns the homepage HTML.

- [ ] **Step 4: Commit (only if changes were needed)**

If verification revealed missing wiring and required code edits, commit them. Otherwise this task is verification-only and produces no commit.

---

### Task 38: Add CLAUDE.md with DX guidance

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create `CLAUDE.md`**

```markdown
# Yilun Lab Website — Agent Guidelines

This is an Astro 5 + TypeScript + Tailwind 3 site, ported from a React-on-CDN
prototype that lives at `migration/yilun-lab-website/` (read-only reference;
do not edit). The prototype is the visual + motion source of truth — when
a regression is suspected, compare against the prototype rendered locally.

## Stack

- **Framework:** Astro 5 (`output: "static"`), Vercel adapter
- **Pages:** `/`, `/about`, `/contact` each mount one big React island
  (`client:load`) for guaranteed prototype fidelity. Case study pages
  at `/projects/<slug>` use multiple smaller islands.
- **Styles:** Tailwind 3 + `src/styles/global.css` (the liquid-glass system
  ported verbatim from the prototype's `<style>` block)
- **Animation:** `motion` library (Framer Motion successor)
- **Content:** MDX collection at `src/content/projects/` with Zod schema in
  `src/content.config.ts`
- **Fonts:** self-hosted via `@fontsource/instrument-serif` and `@fontsource/barlow`

## Layout conventions

- React components live under `src/components/react/` (TSX)
- Astro components live under `src/components/` (Astro)
- Shared utilities under `src/lib/`
- Path aliases: `@components/*`, `@lib/*`, `@styles/*`

## Adding a project

1. Create `src/content/projects/<slug>.mdx`
2. Use one of the four `variant` values: `image-wall` (default), `video-hero`,
   `chapters`, or `chapters-tabbed`
3. Add images under `public/assets/images/projects/<slug>/`
4. The homepage Works grid + `/projects/<slug>` route auto-update

## Useful commands

| Command | What |
|---|---|
| `npm run dev` | Astro dev server with HMR |
| `npm run build` | Static + Vercel adapter build |
| `npm run preview` | Preview the built site locally |
| `npm run check` | `astro check` + `tsc --noEmit` |
| `npm run format` | Prettier (Astro + Tailwind plugins) write |
| `npm run lint` | ESLint with jsx-a11y |

## Don't

- Don't modify `migration/` — it's the read-only handoff bundle
- Don't replace `motion` — fidelity to the prototype's animations was the
  reason it was chosen over CSS-only
- Don't add Framer Motion alternatives, react-spring, or other animation libraries
- Don't switch to component-level CSS modules — Tailwind + `global.css` is
  the established pattern; mixing styles across files breaks the liquid-glass
  cascade
- Don't break the `useGlassLensing` invariant: it must run once per page,
  and currently runs inside `<Navbar />`

## Animation invariants

- Entrance animations use `fadeBlurIn(delay)` from `@lib/motion-presets`
- Word-by-word reveals use `<BlurText>` from `@components/react/BlurText`
- Tab-bar sliding indicators come from `<PillTabs>` — both Works filter and
  chapters-tabbed reuse it
- The `easeOut` constant in `motion-presets.ts` matches Framer's classic
  `easeOut` curve (`[0, 0, 0.58, 1]`); don't change without justification

## Testing strategy

- Schema validation runs during `astro build` — broken frontmatter fails
  the build
- For visual changes, run `npm run dev` and compare against the prototype
  served from `migration/yilun-lab-website/project/index.html` (open in a
  separate tab or browser)
- Lighthouse target: 90+ on `/`, 95+ on text pages
- Sanity checks: `prefers-reduced-motion` (DevTools → Rendering), mobile
  viewports 375/768/1280
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "$(cat <<'EOF'
Add CLAUDE.md with DX guidance for future agents

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 39: Update root README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read existing README**

```bash
cat /Users/rudyz/Documents/projects/Yilun-Lab-Website/README.md
```

The current README is one byte (effectively empty).

- [ ] **Step 2: Replace with informative README**

Write to `/Users/rudyz/Documents/projects/Yilun-Lab-Website/README.md`:

```markdown
# YILUN LAB — Studio Website

Astro 5 + TypeScript + Tailwind site for [yilunlab.com](https://yilunlab.com).
Deployed to Vercel.

## Develop

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

## Project structure

- `src/pages/` — Astro pages (`index.astro`, `about.astro`, `contact.astro`,
  `404.astro`, `projects/[slug].astro`)
- `src/components/` — Astro components (layouts, MDX glue)
- `src/components/react/` — React islands
- `src/content/projects/` — MDX project case studies
- `src/styles/global.css` — liquid-glass system + theme tokens
- `src/lib/` — shared utilities (motion presets, accent gradients,
  glass-lensing hook, MDX components)
- `public/assets/` — images and videos served as-is

## Adding a project

Create `src/content/projects/<slug>.mdx` with frontmatter (see existing
files for examples) and add images under
`public/assets/images/projects/<slug>/`. The homepage and routes update
automatically.

## See also

- `CLAUDE.md` — guidance for AI coding agents working in this repo
- `docs/superpowers/specs/` — design specifications
- `docs/superpowers/plans/` — implementation plans
- `migration/` — original Claude Design handoff bundle (read-only reference)
```

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "$(cat <<'EOF'
Replace placeholder README with project setup + structure docs

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Phase 12 — Verification

### Task 40: Local QA pass

**Files:**
- (No code changes — verification + bug-fix loop)

- [ ] **Step 1: Format and lint**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website
npm run format
npm run lint
npm run check
```

Expected: all three commands succeed (or surface only known false positives).

- [ ] **Step 2: Build**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npm run build
```

Expected: produces `dist/` and `.vercel/output/`. No errors. Build log
mentions all 13 project pages were generated.

- [ ] **Step 3: Spin up dev server and verify each page**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website && npm run dev
```

Then in a browser, walk through:

1. `http://localhost:4321/` — homepage. Verify each section renders:
   - Hero video plays and crossfades on loop; "Light is my language."
     reveals word by word; CTAs and stats fade in with stagger
   - Capabilities video plays; three cards with icons/tags/body
   - Manifesto two-column layout
   - Works section: All/Art/Dance/Tech filter; pill indicator slides;
     14 (or 13) cards visible under "All Works" with correct counts
   - About teaser with portrait placeholder + 4 fact cards + "Read full bio"
   - Collaborate teaser with 4 area cards + email/IG/LI pills
   - Footer "Light. Emotion. Future."
2. Hover over the navbar logo, the center pill, and any liquid-glass card —
   the lensing highlight should track the cursor
3. `http://localhost:4321/about` — full bio, practice block, selected
   credits, CTA
4. `http://localhost:4321/contact` — collab areas, contact card, availability note
5. `http://localhost:4321/projects/human-permeability` — chapters-tabbed
   variant; pill-tab switcher with Drift/Eon/Mortal; tab change re-runs
   entrance animation
6. `http://localhost:4321/projects/true-self` — image-wall variant; 9
   gradient-placeholder tiles in 3-column grid; intro paragraph centered above
7. `http://localhost:4321/some-bad-slug` — 404 page

- [ ] **Step 4: Compare against prototype**

In a separate tab or browser, render the prototype directly:

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website/migration/yilun-lab-website/project && python3 -m http.server 8000
```

Open `http://localhost:8000`. Side-by-side compare each section against the
new homepage. Note any visual or motion drift. For each diff:

1. Open the corresponding component in `src/components/react/`
2. Identify the mismatch (class names, motion props, gradient values)
3. Fix in place
4. Reload dev server; re-verify

- [ ] **Step 5: Reduced-motion check**

In Chrome DevTools → Rendering → Emulate CSS media feature
`prefers-reduced-motion: reduce`. Reload the homepage. Expected: glass
hover transforms disabled; entrance animations should not trigger
visible movement (the prototype's a11y media query in global.css covers
the glass; for `motion` entrances, the library respects the same media
query automatically when `Variants` use it).

- [ ] **Step 6: Mobile viewport check**

DevTools device emulation at 375×812 (iPhone SE), 768×1024 (iPad),
1280×800 (laptop). Verify:

- Navbar center pill hides at <768px (per prototype's `hidden md:flex`)
- Works grid reflows: at sm-only, 2 columns; at md, the size-class grid kicks in
- Hero text stays centered and readable

- [ ] **Step 7: Lighthouse**

In Chrome DevTools → Lighthouse, run a Performance + Accessibility +
Best Practices + SEO report on `/`. Targets:

- Performance ≥ 90
- Accessibility ≥ 95
- Best Practices ≥ 95
- SEO ≥ 95

If Performance falls short, common culprits:
- Capabilities video is too large (~21 MB) — fine for now since it's a
  placeholder, but flag for replacement
- LCP element should be Hero video poster or BlurText container — if
  it's the video itself, add a `poster=` attribute

- [ ] **Step 8: Stop dev server**

```bash
# Stop the npm run dev process from Step 3
```

- [ ] **Step 9: Commit any fixes from steps 4–7**

```bash
git status
# Stage only files genuinely modified for fidelity fixes
git add <files>
git commit -m "$(cat <<'EOF'
QA fixes: <describe specific fidelity / a11y / perf fixes>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

If no fixes were needed, skip this step.

---

### Task 41: Initial deploy to Vercel

**Files:**
- (No new files — Vercel setup is dashboard-driven; this is the manual handoff step)

This task assumes the user has a Vercel account and a Git remote already.

- [ ] **Step 1: Push to a Git remote**

```bash
cd /Users/rudyz/Documents/projects/Yilun-Lab-Website
git status
git log --oneline | head -20
```

If no remote is configured, ask the user to create a GitHub repo and run:

```bash
git remote add origin <repo-url>
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel via the dashboard**

Tell the user:

> 1. Go to [vercel.com/new](https://vercel.com/new)
> 2. Import the GitHub repo
> 3. Vercel auto-detects Astro — no configuration changes needed
> 4. Click "Deploy"

- [ ] **Step 3: Verify deploy**

Once Vercel finishes the first build, the user should:

1. Open the preview URL Vercel issues
2. Verify all routes work: `/`, `/about`, `/contact`, `/projects/human-permeability`, `/projects/true-self`, `/non-existent` (→ 404)
3. In the Vercel dashboard → Analytics, confirm Web Analytics is enabled
4. In Speed Insights, confirm metrics are being collected (may take a few visits)

- [ ] **Step 4: Set up custom domain (optional)**

If the user owns `yilunlab.com`:

1. In Vercel project → Settings → Domains, add `yilunlab.com` and `www.yilunlab.com`
2. Follow the DNS instructions Vercel provides
3. Wait for DNS propagation (a few minutes to a few hours)

This step is fully manual and outside this plan's automation.

- [ ] **Step 5: No commit — deploy is dashboard-driven**

---

## Plan complete

When all tasks above are done:

- Yilun Lab studio site is live on Vercel
- Homepage, About, Contact, and 13 case study pages render with prototype fidelity
- All four case study variants are wired and tested with at least one project each (image-wall on most, chapters-tabbed on `human-permeability`)
- Real images and replacement videos can be dropped into `public/assets/` without code changes
- Future agents pick up the conventions from `CLAUDE.md`

The migration artifacts in `migration/` remain in the repo as the read-only fidelity reference.

