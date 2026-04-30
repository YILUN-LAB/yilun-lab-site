# Yilun Lab Website — Migration Design

**Date:** 2026-04-29
**Status:** Approved (pending user review of this spec)
**Source:** `migration/yilun-lab-website/` handoff bundle from Claude Design
**Target:** Astro + TypeScript + Tailwind site deployed to Vercel

## 1. Goal

Recreate the Yilun Lab studio site from the prototype handoff with **pixel-perfect visual + motion fidelity**, restructured as a multi-page Astro site with a content-collection-backed project case study system, ready to deploy to Vercel.

## 2. Scope

In scope:
- Port the prototype's homepage (Hero · Capabilities · Manifesto · Works · About teaser · Collaborate teaser) to `index.astro`
- Add dedicated `about.astro` and `contact.astro` pages that expand the homepage teasers
- Add `projects/[slug].astro` dynamic case study pages backed by an MDX content collection
- Self-host the placeholder videos under `public/assets/videos/` so the prototype's CloudFront URLs don't become a runtime dependency
- Ship 13 MDX project files seeded with the data.jsx copy, ready for image and video updates later
- Configure Vercel deploy with sitemap, web analytics, and speed insights

Out of scope (deferrable):
- Real contact form (mailto: only on day 1)
- Chinese-language version (architecture supports later)
- `/projects` listing index page (homepage Works section is the only listing on day 1)
- Lightbox / fullscreen image viewer
- Real founder portrait, real OG image, real favicon (placeholders accepted)
- Real per-project images and YouTube embeds (empty arrays render gradient placeholders)

## 3. User decisions made during brainstorming

| Decision | Choice | Why |
|---|---|---|
| Site architecture | Hybrid: single-page landing + dedicated About/Contact + case study routes | Preserves cinematic landing while making case studies shareable URLs |
| Styling | Tailwind + small global stylesheet | Prototype already speaks Tailwind dialect; lowest translation cost |
| Videos | Self-hosted in `public/assets/videos/` | Removes external CDN dependency |
| Animation library | `motion` (Framer Motion's successor) | Only path to guaranteed 100% prototype fidelity |
| Contact page form | None on day 1 — mailto + social pills | Lowest friction; form-ready slot reserved |
| Case study templates | At least 4 variants | Per user; image-wall + video-hero + chapters + chapters-tabbed |
| Implementation approach | One big React island per page on home/about/contact | Guarantees prototype fidelity (no SSR/CSR boundary risk) |
| Dependencies | "Strongly recommend" + DX "nice to have" tiers | See §10 |

## 4. Tech stack

| Concern | Choice |
|---|---|
| Framework | Astro 5.x |
| Language | TypeScript |
| Styles | Tailwind 3.x + `src/styles/global.css` |
| Islands | React 18 via `@astrojs/react` |
| Animation | `motion` library |
| Content | MDX via `@astrojs/mdx` + content collections |
| Icons | Inline SVG components (ported from `glass.jsx`) |
| Deploy | Vercel via `@astrojs/vercel/static` |
| Output | `output: "static"` — fully SSG |
| Fonts | Self-hosted via `@fontsource/instrument-serif`, `@fontsource/barlow` |

## 5. Project layout

```
yilun-lab-website/
├── astro.config.mjs                # integrations: react, mdx, tailwind, sitemap, vercel
├── tailwind.config.cjs             # font families, theme tokens (amber palette)
├── tsconfig.json
├── package.json
├── prettier.config.mjs             # +tailwindcss + astro plugins
├── eslint.config.mjs               # +astro + jsx-a11y
├── CLAUDE.md                        # (added during implementation) DX guidance
├── public/
│   ├── favicon.svg
│   ├── og-image.jpg
│   └── assets/
│       ├── images/
│       │   ├── portrait.jpg                       (founder portrait)
│       │   └── projects/<slug>/*                  (case study image walls)
│       └── videos/
│           ├── hero.mp4
│           └── capabilities.mp4
└── src/
    ├── content.config.ts                          (Zod schema)
    ├── content/
    │   └── projects/
    │       ├── human-permeability.mdx
    │       ├── true-self.mdx
    │       ├── through-limits.mdx
    │       ├── starfall.mdx
    │       ├── eight-lights.mdx
    │       ├── saoko.mdx
    │       ├── myself.mdx
    │       ├── bizcochito.mdx
    │       ├── her.mdx
    │       ├── morning-birdsong.mdx
    │       ├── tao-cave.mdx
    │       ├── blue-001.mdx
    │       └── aura-cave-intro.mdx
    ├── styles/
    │   └── global.css
    ├── lib/
    │   ├── glass-lensing.ts                        (pointer-tracking hook)
    │   ├── motion-presets.ts                       (fadeBlurIn, blurInWord, easings)
    │   └── accent-gradients.ts                     (color → gradient map)
    ├── components/
    │   ├── BaseLayout.astro                        (shared HTML scaffold)
    │   ├── BaseHead.astro                          (SEO meta, OG, fonts)
    │   ├── SiteHeader.astro                        (mounts <Navbar /> island)
    │   ├── SiteFooter.astro                        (static)
    │   ├── ProjectGrid.astro                       (mounts <WorksSection /> island)
    │   ├── ProjectCard.astro                       (static card; MDX-usable)
    │   ├── MediaBlock.astro                        (MDX helper: image | video | youtube)
    │   ├── CaseStudyLayout.astro                   (layout for projects/[slug])
    │   └── react/
    │       ├── HomePage.tsx                        (full home tree — one island)
    │       ├── AboutPage.tsx
    │       ├── ContactPage.tsx
    │       ├── Navbar.tsx
    │       ├── Hero.tsx
    │       ├── Capabilities.tsx
    │       ├── ManifestoSection.tsx
    │       ├── WorksSection.tsx
    │       ├── AboutSection.tsx
    │       ├── CollaborateSection.tsx
    │       ├── Footer.tsx
    │       ├── BlurText.tsx
    │       ├── FadingVideo.tsx
    │       ├── PillTabs.tsx                        (generic pill switcher)
    │       ├── FilterTabs.tsx                      (uses PillTabs — Works filter)
    │       ├── ChapterTabs.tsx                     (uses PillTabs — chapter switcher)
    │       ├── WorkCard.tsx                        (interactive grid card; routes to /projects/<slug>)
    │       ├── Chapters.tsx                        (wrapper — variant-aware container)
    │       ├── Chapter.tsx                          (slot component — single chapter content)
    │       └── icons.tsx                           (ArrowUpRight, PlayIcon, ClockIcon, etc.)
    └── pages/
        ├── index.astro                             (mounts <HomePage client:load />)
        ├── about.astro                             (mounts <AboutPage client:load />)
        ├── contact.astro                           (mounts <ContactPage client:load />)
        ├── 404.astro                               (mounts minimal not-found)
        └── projects/
            └── [slug].astro                        (CaseStudyLayout wrapping MDX)
```

### Architectural rules

1. **One big React island per page** for home, about, contact. The page-level `.astro` file mounts a single `<HomePage />` / `<AboutPage />` / `<ContactPage />` with `client:load`. The full prototype component tree lives inside that one island.
2. **Case study pages use multiple smaller islands** (Navbar + Footer + per-section). This is acceptable because case studies are a new design, not a port of the prototype, so there is no fidelity baseline to preserve.
3. **All React lives in `src/components/react/`** to avoid filename collisions with Astro components and to make the boundary explicit.
4. **`useGlassLensing` runs once per page** — placed inside `<Navbar />` since Navbar renders on every page.
5. **Project cards are `<a>` elements** — the prototype's `ProjectOverlay` modal is dropped. `WorkCard` renders an `<a href="/projects/<slug>">` so links work without JS, get correct hover/right-click semantics, and are SEO-discoverable.

## 6. Content schema

`src/content.config.ts`:

```ts
import { z, defineCollection } from "astro:content";

const projects = defineCollection({
  type: "content",
  schema: z.object({
    // Listing metadata (homepage card + case study header)
    title:     z.string(),
    subtitle:  z.string().optional(),
    tagline:   z.string(),
    category:  z.array(z.enum(["art", "dance", "tech"])).min(1),
    year:      z.string(),
    role:      z.string(),
    medium:    z.string(),
    runtime:   z.string().optional(),
    date:      z.string().optional(),

    // Card visual
    accent:    z.enum(["amber","blue","red","green","violet","cyan","magenta","spectrum"]),
    size:      z.enum(["xl","lg","md","sm"]).default("md"),
    cover:     z.string().optional(),

    // Case study layout
    variant:   z.enum(["image-wall","video-hero","chapters","chapters-tabbed"]).default("image-wall"),

    // Variant: image-wall
    images:    z.array(z.object({
                  src:     z.string(),
                  alt:     z.string(),
                  caption: z.string().optional()
                })).optional(),

    // Variant: video-hero
    youtube:    z.string().optional(),
    youtubeAlt: z.array(z.string()).optional(),

    // Variant: chapters / chapters-tabbed
    chapters:  z.array(z.object({
                  name:    z.string(),
                  note:    z.string(),
                  accent:  z.enum(["amber","blue","red","green","violet","cyan","magenta","spectrum"]).optional(),
                  cover:   z.string().optional()
                })).optional(),

    order:     z.number().optional(),
    draft:     z.boolean().default(false)
  })
});

export const collections = { projects };
```

## 7. Case study variants

### 7.1 `image-wall` (default — matches the user's reference image)

```
[centered intro paragraph]

[3 × N image grid filling the body]

[year/role/medium meta cards]

[Next work →]
```
- `images[]` populates the grid
- MDX body is the centered intro
- `images: []` (empty) → grid renders gradient placeholders

### 7.2 `video-hero`

```
[21:9 lazy YouTube embed]

Title — italic serif
Tagline

[year][role][medium][runtime]

Body prose (// About rail label + paragraphs)

[smaller image grid below body if images[]]

[Next work →]
```
- `youtube` (YouTube ID) required
- Uses `lite-youtube-embed` to defer iframe load until click
- `images[]` optional secondary content

### 7.3 `chapters` (stacked)

```
Title — italic serif
Subtitle (e.g. "Drift · Eon · Mortal")
Centered intro paragraph

━ I. Drift ━
[chapter image, accent gradient]
Chapter prose

━ II. Eon ━
...

[Next work →]
```
- `chapters[]` in frontmatter defines order, names, accents, cover images
- MDX body uses a `<Chapters>` wrapper containing `<Chapter name="Drift">…</Chapter>` blocks for per-chapter prose. Each `<Chapter>` block accepts free-form MDX (rich text, `<MediaBlock>` calls, etc.):

```mdx
<Chapters>
  <Chapter name="Drift">
    Drift prose with **rich** formatting.
    <MediaBlock type="image" src="..." alt="..." />
  </Chapter>
  <Chapter name="Eon">…</Chapter>
  <Chapter name="Mortal">…</Chapter>
</Chapters>
```

The `<Chapters>` component reads `variant` from page context: for `chapters` it renders all `<Chapter>` children stacked; for `chapters-tabbed` it renders only the active one with the pill switcher above. Both variants share this same authoring shape.

### 7.4 `chapters-tabbed` (4th variant — interactive switcher)

```
Title
Subtitle (chapter list)
Centered intro paragraph

╭─────────────────────────╮
│ ●Drift  Eon  Mortal     │ ← Pill tab bar (same component as homepage Works filter)
╰─────────────────────────╯

[active chapter content fades in here on tab change —
 chapter accent gradient, hero image, prose, optional grid]

[Next work →]
```
- One chapter visible at a time
- Pill bar uses **the same `<PillTabs />` component** as homepage `FilterTabs` (sliding tinted indicator, identical hover states, identical liquid-glass material). `PillTabs` accepts a generic `tabs: { id, label, badge? }[]` shape; `FilterTabs` passes counts as `badge`, `ChapterTabs` omits the badge.
- Tab change re-runs the same blur-in entrance animation the rest of the site uses (motion `whileInView`)
- Chapter accent gradient drives the section's tint

### Default variant assignment for the 13 seeded projects

| Project | Variant |
|---|---|
| `human-permeability` | `chapters-tabbed` (source data has Drift / Eon / Mortal) |
| All others | `image-wall` |

Variant can be promoted per-project (e.g. to `video-hero`) once real YouTube IDs and images are in place.

## 8. Page composition

### `index.astro` — Homepage

Mounts `<HomePage client:load />`:
1. Navbar (fixed)
2. Hero — hero video, "Light is my language.", badge, CTAs, stats, partners
3. Capabilities — capabilities video, 3 cards
4. Manifesto — "// The Lab"
5. Works — filterable project grid; clicks navigate to `/projects/<slug>`
6. About teaser — "// Founder", short bio + portrait + 4 fact cards. Ends with "Read full bio → /about"
7. Collaborate teaser — "// Work with us" + 4 collab area cards. Ends with "Start a collaboration → /contact"
8. Footer

Sections 6 and 7 are condensed forms of the prototype's full About/Collaborate sections; full versions live on dedicated pages.

### `about.astro` — Founder page

Mounts `<AboutPage client:load />`:
1. Navbar
2. About hero — "// About" rail + "Yilun (Yilia) Zhan."
3. Full bio — portrait + multi-paragraph bio
4. Practice block — disciplines breakdown
5. Selected credits — recent shows / press / talks (placeholder list ok day 1)
6. CTA strip — "Want to collaborate? → /contact"
7. Footer

### `contact.astro` — Contact page

Mounts `<ContactPage client:load />`:
1. Navbar
2. Hero — "Tell us a space you want to feel."
3. Collab areas — 4 cards full size
4. Contact card — email + Instagram + LinkedIn pills + inquiry copy
5. Availability note
6. Footer

### `projects/[slug].astro` — Case study

Uses `<CaseStudyLayout>`:
1. SiteHeader (Navbar island)
2. Project header — rail label, title, subtitle, tagline
3. Meta grid — Year / Role / Medium / Runtime
4. Variant body (image-wall / video-hero / chapters / chapters-tabbed)
5. Related / next — picks next project from same category, falls back to next in `order`
6. SiteFooter

### `404.astro`

Navbar + centered "Lost in the dark." (italic serif) + "Back to home" pill + Footer.

### Navigation table

| Link | Destination | Behavior |
|---|---|---|
| **Y** logo | `/` | Top of homepage / navigate home |
| **Capabilities** | `/#capabilities` | Anchor scroll on home; Astro auto-scrolls otherwise |
| **Works** | `/#works` | Anchor scroll on home; Astro auto-scrolls otherwise |
| **About** | `/about` | Always navigate to dedicated page |
| **Collaborate** (CTA) | `/contact` | Always navigate |

The prototype's "Index" link is dropped (logo handles top-of-home).
Active-page styling: when on `/about`, the About link gets the tinted (amber) state. On homepage, no nav item is highlighted (anchors don't drive page-level state).

## 9. Theme + styling

### Tailwind extensions

```js
theme: {
  extend: {
    fontFamily: {
      heading: ["'Instrument Serif'", "serif"],
      body:    ["'Barlow'",          "sans-serif"]
    },
    colors: {
      amber: {
        highlight: "rgb(255 196 110)",
        primary:   "rgb(245 175 60)",
        deep:      "rgb(200 130 30)"
      },
      warm: { bg: "#0a0705" }
    },
    borderRadius: { DEFAULT: "9999px" }
  }
}
```

### `src/styles/global.css`

Wholesale port of the prototype's `<style>` block (lines 27–311 of `index.html`) with two adjustments:
1. Self-hosted font imports replace the Google Fonts CDN link
2. `body` styles wrapped in `@layer base { … }` so Tailwind utilities can override

Sections preserved as-is:
- `:root` custom properties (`--amber-1/2/3`, `--warm-bg`)
- Body layered radial gradients
- `.liquid-glass`, `.liquid-glass-strong`, `.liquid-glass-tint`
- `::before` refractive edge ring + `::after` specular highlight
- `:hover`, `:active` press states
- `.glass-link` pill chip transitions
- `.scroll-edge` top dissolve
- A11y media queries: `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`
- `.no-scrollbar` utility

### Extracted constants

`src/lib/accent-gradients.ts`:
```ts
export const ACCENT_GRADIENTS = { amber: "...", blue: "...", /* etc */ } as const;
export type AccentName = keyof typeof ACCENT_GRADIENTS;
```

`src/lib/glass-lensing.ts`:
```ts
export function useGlassLensing() { /* pointermove → walk DOM → set --gx/--gy */ }
```
Called once inside `<Navbar />` (which appears on every page).

`src/lib/motion-presets.ts`:
```ts
export const easeOut = [0, 0, 0.58, 1] as const;
export const fadeBlurIn = (delay = 0) => ({ initial: { filter: "blur(10px)", opacity: 0, y: 20 }, ... });
export const blurInWord = { /* keyframe array for BlurText */ };
```

## 10. Dependencies

### Strongly recommended (install at scaffolding)

| Package | Role |
|---|---|
| `@astrojs/sitemap` | Auto-generated sitemap.xml |
| `@vercel/analytics` | Privacy-friendly visit metrics (free) |
| `@vercel/speed-insights` | Core Web Vitals tracking |
| `@fontsource/instrument-serif`, `@fontsource/barlow` | Self-hosted fonts |
| `lite-youtube-embed` | Lazy YouTube embeds (case study video-hero variant) |
| `sharp` | Required for `astro:assets` `<Image />` optimization |

### DX (install at scaffolding)

| Package | Role |
|---|---|
| `prettier` + `prettier-plugin-astro` + `prettier-plugin-tailwindcss` | Formatter; Tailwind plugin auto-sorts classes |
| `eslint` + `eslint-plugin-astro` + `eslint-plugin-jsx-a11y` | Linter + a11y catches |
| `rehype-slug` + `rehype-autolink-headings` | Auto-id MDX headings |
| `remark-smartypants` | Curly quotes / em-dashes in prose |

### Deferred — add when needed

| Package | Trigger |
|---|---|
| `yet-another-react-lightbox` | When image walls should expand fullscreen |
| `@astrojs/rss` | When journal/news section is added |
| `@formspree/astro` or `resend` | When real contact form is needed |
| `astro-i18n` | When Chinese version is planned |

### Not used

`astro-seo`, `astro-icon`, framer/motion alternatives, carousel libraries.

## 11. Migration map (data → MDX)

For each entry in `migration/yilun-lab-website/project/src/data.jsx`:

| Source field | Target MDX field | Notes |
|---|---|---|
| `id` | filename `<id>.mdx` | slug |
| `title` | `title` | — |
| `subtitle` | `subtitle` | optional |
| `tagline` | `tagline` | — |
| `category` | `category` | array kept verbatim |
| `year` | `year` | — |
| `role` | `role` | — |
| `medium` | `medium` | — |
| `runtime` | `runtime` | optional |
| `date` | `date` | optional |
| `accent` | `accent` | — |
| `size` | `size` | — |
| `body[]` | MDX body paragraphs | one paragraph per array entry |
| `chapters[].color` (e.g., `viz-cyan`) | `chapters[].accent` (`cyan`) | strip `viz-` prefix |
| `viz` | dropped | replaced by `accent` + `variant` |
| (none) | `variant` | `chapters-tabbed` for human-permeability; `image-wall` otherwise |
| (none) | `images: []` | empty array; gradient placeholders render |
| (none) | `youtube` | unset — promotion to `video-hero` deferred |
| (none) | `order: N` | preserves source-file order |

13 MDX files generated mechanically.

## 12. What's dropped from the prototype

| Dropped | Reason |
|---|---|
| `<script src=".../babel.min.js">` | Real build pipeline; no in-browser JSX |
| `<script src=".../react.development.js">` UMD | React via npm |
| `<script src=".../framer-motion.js">` | `motion` via npm |
| `<script src="https://cdn.tailwindcss.com">` | Tailwind compiled via `@astrojs/tailwind` |
| `<noscript>` JS-required banner | Astro pre-renders content; smaller fallback retained |
| `ProjectOverlay` modal | Replaced by `/projects/<slug>` routes |
| `data.jsx` `window.PROJECTS` global | Replaced by content collection |
| Console.error patch for Framer | Not needed once on `motion` directly |

## 13. Build + deploy

### `astro.config.mjs`

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/static";

export default defineConfig({
  site: "https://yilunlab.com",
  output: "static",
  adapter: vercel({ webAnalytics: { enabled: true }, imageService: true }),
  integrations: [
    react(),
    mdx({
      remarkPlugins: ["remark-smartypants"],
      rehypePlugins: ["rehype-slug",
                      ["rehype-autolink-headings", { behavior: "wrap" }]]
    }),
    tailwind({ applyBaseStyles: false }),
    sitemap()
  ],
  vite: { ssr: { noExternal: ["motion"] } }
});
```

### `package.json` scripts

```json
"scripts": {
  "dev":     "astro dev",
  "build":   "astro build",
  "preview": "astro preview",
  "check":   "astro check && tsc --noEmit",
  "format":  "prettier --write .",
  "lint":    "eslint ."
}
```

### Vercel

Zero-config — push to a Git repo connected to Vercel; Vercel detects Astro, builds with `npm run build`, deploys static assets to its edge. Custom domain `yilunlab.com` hooked in dashboard. Web Analytics + Speed Insights auto-enabled via the adapter.

## 14. Performance budget (first deploy)

| Metric | Target | Approach |
|---|---|---|
| Lighthouse Performance | 90+ on `/`; 95+ on text-only pages | Static HTML + Vercel edge cache |
| First Contentful Paint | <1.0 s | Self-hosted fonts; no render-blocking JS |
| Total JS / page | <80 KB gzipped | `motion` only on animated islands |
| Largest video | <5 MB | 1080p H.264, ~3 Mbps; replacement spec in §15 |

## 15. Video specs (for replacement footage)

| Video | Dimensions | Aspect | FPS | Duration | Target size | Notes |
|---|---|---|---|---|---|---|
| Hero | 1920×1080 (or 2560×1440) | 16:9 | 24–30 | 6–10 s | ~3 MB | Visual focus upper-center; full-bleed; scaled 120% |
| Capabilities | ~1500×1300 or 1600×1600 | ~6:5 / 1:1 | 24–30 | 10–14 s | ~4–6 MB | Square-ish; `object-cover` behind `min-h-screen` |

Both: H.264 main/high profile, yuv420p, MP4 container, **silent (`-an`)**, first frame ≈ last frame (loop crossfade hides the cut).

## 16. Testing strategy

The Astro build itself is the primary correctness check (TypeScript + content collection schema validation + MDX parse). Beyond that:

- **Manual visual check**: open `/`, `/about`, `/contact`, `/projects/human-permeability` (chapters-tabbed) and `/projects/true-self` (image-wall) in the dev server. Compare against the prototype rendered locally.
- **Reduced-motion sanity check**: toggle `prefers-reduced-motion` in DevTools; entrance animations should disable, glass hover transforms should disable.
- **Mobile sanity check**: viewport widths 375 / 768 / 1280 — header pill should hide on mobile (per prototype `hidden md:flex`), grid should reflow.
- **Lighthouse on `/`** before deploy; aim for the §14 budget.

No unit tests on day 1 — the components are presentational, the content is schema-validated by Zod, and behavioral surface area is small.

## 17. Open items (non-blocking)

| Item | Resolution path |
|---|---|
| Real founder portrait | Drop into `public/assets/images/portrait.jpg` |
| Real OG image | 1200×630 JPEG into `public/og-image.jpg` |
| Real favicon | SVG into `public/favicon.svg` |
| Real project images | Per-project folders under `public/assets/images/projects/<slug>/`; update `images[]` in MDX |
| Real video footage | Drop into `public/assets/videos/hero.mp4` and `capabilities.mp4`; same filenames = no code change |
| YouTube IDs | Set `youtube:` in per-project MDX; flip `variant` to `video-hero` |
| Selected credits / press list | Edit `AboutPage.tsx` directly or extract to a small data file |
| Real `hello@yilunlab.com`, IG, LinkedIn handles | Already in prototype copy; no change needed |
