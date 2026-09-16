# YILUN LAB Website — Agent Guidelines

This file is the shared instruction source for agents working in this repository.
`CLAUDE.md` imports it. Keep repository guidance in English and update this file
when architecture, commands, or workflows change.

Last reviewed against the local source tree: 2026-09-16. Treat current code,
configuration, and tests as authoritative for implementation details. This review
does not establish the state of remote branches or deployed services.

## Project and stack

YILUN LAB is a studio website with MDX case studies and a contact form, deployed
through Vercel. Content is maintained in the repository with agent assistance.

- **Framework:** Astro 6 (`^6.2.1` in `package.json`) with the Vercel adapter.
- **UI:** React 18 islands, TypeScript strict mode, Tailwind CSS 3, and `motion` 11.
- **Content:** Astro's glob-loaded MDX collection with the schema in
  `src/content.config.ts`.
- **Fonts:** self-hosted Instrument Serif and Barlow via `@fontsource`.
- **Services:** Resend for contact email; GitHub and Vercel for deployment.
- **Tests:** Vitest 4, happy-dom, and Testing Library.
- **Dependencies:** use npm and `package-lock.json`. `.npmrc` sets
  `legacy-peer-deps=true`; preserve this installation setting.

Production and preview builds use `output: "static"`, with the contact API explicitly
dynamic. Project routes retain `prerender = true`. The Keystatic/staging workflow
was retired on 2026-09-16; see `docs/archive/staging-retirement.md` for recovery.

The original React-on-CDN prototype under `migration/yilun-lab-website/` is a
read-only, gitignored historical reference. Use it for original visual or motion
comparisons when relevant, but preserve intentional changes in the current site.
Local plans under `docs/superpowers/` are historical/task references, not a
universal execution workflow or a prerequisite for ordinary maintenance.

## Repository map

| Location                | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `src/pages/`            | Public routes and the contact API                                           |
| `src/components/`       | Astro layouts, metadata, case-study rendering, and MDX glue                 |
| `src/components/react/` | Public React pages, media, navigation, and editorial grid                   |
| `src/content/projects/` | Project MDX files                                                           |
| `src/lib/`              | Motion, content helpers, and contact validation                             |
| `src/styles/global.css` | Public theme tokens and liquid-glass styles                                 |
| `public/assets/`        | Project images, videos, and brand assets                                    |
| `tests/`                | Unit and component tests, including contact validation and preview metadata |
| `scripts/`              | Asset optimization, logo rendering/checking, QR generation, and cleanup     |

Path aliases are `@/*`, `@components/*`, `@lib/*`, and `@styles/*`.
The public `/`, `/about`, `/contact`, and `/connect` pages mount React page islands;
case studies use Astro layout composition with smaller React islands.

## Local development and commands

Use `.env.example` as the environment-variable reference. Keep `RESEND_API_KEY`
server-side in ignored environment files. Vercel supplies `VERCEL_ENV`; preview
builds and runtime responses use it for noindex metadata. Never commit secrets.

Prefix shell commands with `rtk` in environments configured to use it; use
`rtk proxy <command>` when an unfiltered command is needed. The table lists the
underlying npm commands.

| Command                   | Purpose                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `npm ci`                  | Install locked dependencies                                              |
| `npm run dev`             | Start Astro development server, normally on port 4321                    |
| `npm run build`           | Build the site and Vercel output; validate content                       |
| `npm run preview`         | Invoke Astro's build preview; adapter support determines availability    |
| `npm run check`           | Run `astro check` and `tsc --noEmit`                                     |
| `npm run lint`            | Run ESLint, including accessibility rules                                |
| `npm test`                | Run the Vitest suite once                                                |
| `npm run test:watch`      | Run Vitest in watch mode                                                 |
| `npm run test:ui`         | Open Vitest's UI                                                         |
| `npm run format:check`    | Check formatting across the repository                                   |
| `npm run format`          | Rewrite formatting across the repository; prefer targeting changed files |
| `npm run assets:optimize` | Regenerate migration-derived WebP and Open Graph images                  |
| `npm run assets:hero`     | Generate hashed hero videos and posters (requires local FFmpeg)          |
| `npm run assets:gc`       | Report images not explicitly referenced in project MDX                   |
| `npm run qr:make`         | Generate the `/connect` QR assets                                        |

Use a development server for local browser checks when adapter preview is unavailable.

## Project content and rendering

1. Add or edit `src/content/projects/<slug>.mdx`, using a current entry as a model.
   Required metadata includes title, tagline, category, year, role, medium, and accent.
2. Put project images under `public/assets/images/projects/<slug>/` and provide alt text.
3. Validate frontmatter against `src/content.config.ts`. Preserve existing metadata,
   especially `category`, `accent`, `weight`, `aspect`, and `variant`.
4. Use `order` for ascending public ordering. Entries with `draft: true` are excluded
   from the homepage and generated project routes, including preview builds.
5. Keep exactly three non-draft projects with distinct `featured` values of 1, 2,
   and 3. `src/lib/data/highlights.ts` throws when this contract is violated.

Supported variants:

| Variant           | Rendering contract                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------- |
| `image-wall`      | Default image gallery with MDX intro                                                     |
| `video-hero`      | Requires a YouTube ID; supports alternate videos and images                              |
| `image-poster`    | First image is the poster; remaining images form the gallery; provide at least one image |
| `chapters`        | Requires at least one chapter; shows the chapter sequence                                |
| `chapters-tabbed` | Requires at least one chapter; tabs control the visible chapter                          |

`CaseStudyLayout.astro` chooses the renderer. Public project paths and the next-work
links derive from non-draft content. Do not hardcode an expected project count in
checks; derive it from the current collection and active filter.

`soft-boundary` uses `SoftBoundaryLayout.astro` and a dedicated React exhibition
page. Its English and Japanese text lives in `src/lib/data/soft-boundary.ts`;
the MDX entry maintains card metadata and the ordered image list. The project
defaults to Japanese when the browser language starts with `ja`, otherwise English.
Its language switch is scoped to the project article and does not change shared
navigation, other pages, or a saved site-wide preference. The homepage announcement
shows both languages together. The exhibition flyer is displayed as an image
without a download control.
See `docs/soft-boundary.md` for content sources, assets, and maintenance details.

Lab and Works share `EditorialGrid.tsx`. Preserve first-item promotion to `lead`,
full-width layout for one item, second-item promotion to `feature` for two items,
and the three-item lead spanning two rows at desktop widths. Weights control
card typography and controls; column spans adapt to fill rows. Both homepage
grids use 20px gaps and aligned cards without vertical offsets. See
`docs/editorial-grid.md` and the component for exact layout behavior.

The Lab uses `composition="featured"`: a seven-column lead fills the height of
two stacked five-column supporting cards, which use 16:10 media with a 272px
minimum height at desktop widths. Tablet places the lead above a supporting
pair; mobile stacks the cards with a 4:5 lead. LabSection supplies section-specific
weights without changing MDX metadata. Works opens with a 7+5 desktop pair,
then fills rows in thirds or halves. Tablet uses a full-width lead followed by
pairs, with any final orphan full-width. Media stretches to each row's height.

## Publishing and preview behavior

- Make content and code changes on short-lived branches, run checks, and use Vercel
  Preview deployments for review. Merge approved changes to `main` for production.
- `staging` and `feat/keystatic-cms` are deprecated. Never recreate their automatic
  sync/publish flow or re-enable their deployments without an explicit request.
- The historical code, content, and tests are preserved by annotated archive tags;
  recovery instructions are in `docs/archive/staging-retirement.md`.
- `/admin`, `/keystatic`, `/api/keystatic`, and `/api/publish` are removed. There is no
  browser-based editor, OAuth integration, or active autosave/recovery system.
- `BaseHead.astro` uses `VERCEL_ENV=preview` for noindex metadata on static pages.
  Middleware adds `X-Robots-Tag` to preview runtime responses. Noindex is not access
  control; use Vercel deployment protection for private previews.
- Preserve the prerender bypass and the runtime rejection of `x-astro-path` and
  `x-astro-locals` in `src/middleware.ts`.

## Public UI and service conventions

- Keep public styling in Tailwind and `global.css`.
- Keep `motion` as the animation library. Reuse `fadeBlurIn`, `BlurText`, and
  `PillTabs`. The shared `easeOut` curve is `[0, 0, 0.58, 1]`.
- `useGlassLensing` must run once per public page; it currently runs in `Navbar`.
- Hero rotation uses `hero-video.ts`; `hero-video-assets.ts` maps original clip IDs
  to hashed 1080p videos and SSR posters. `FadingVideo.tsx` defers requests for
  reduced motion, Save-Data, and 2G connections, and pauses outside the viewport
  or a visible tab. The homepage default settles on the first meaningful
  scroll or focus in Hero content; explicit playback resumes from that frame.
  Keep the loop option, playback controls, and storage-failure behavior.
  Homepage Aurora animation sleeps while any Hero is visible and is hidden only
  when fully covered. Other pages pause Aurora only in hidden tabs.
  See `docs/hero-video-performance.md` for evidence and the dev-only comparison UI.
- `/api/contact` validates with `ContactFormSchema`, applies an in-memory per-IP
  rate limit and honeypot, escapes email HTML, and sends through Resend. Preserve
  its input limits and both resolved-error and thrown-error handling. The rate
  limit is process-local, not a distributed guarantee.
- Keep canonical URLs, Open Graph images, JSON-LD, and preview metadata consistent.
  `/connect` is excluded from the sitemap and uses `noOgPreview` for noindex and
  suppressed social-preview metadata. Security headers are defined in `vercel.json`.

## Images and brand assets

The migration optimizer reads `migration/YILUN LAB Assets/`, creates project WebPs
at up to 1920 pixels wide and quality 80, and generates 1200-by-630 JPEG social images
from public WebPs. Missing migration sources skip WebP regeneration. Review its
hardcoded project mapping before using it for a new project or replacing curated images.

The asset cleanup script checks literal MDX references only. Its report can include
files used by computed paths, such as `cover.jpg` and fallback `01.webp`; inspect
those uses before running the destructive `--delete` option.

For logos, follow `public/assets/brand/logos/README.md` and the brand guide at
`public/assets/brand/README.md`. The current master is Figma **Official Logo V2**
(the September 9, 2026 export). Make geometry or typography changes in that master,
export SVG/PDF, verify in Illustrator, then update the public assets and manifest.
Run `node scripts/render-logos.mjs` and `node scripts/check-logos.mjs` after replacing
exports. PNG/JPG are derived assets; do not substitute raster art for the vector
master or reintroduce the removed masks into the outlined SVGs.

## Verification and handoff

For code changes, run `npm run check`, relevant Vitest tests, and lint; run a build
when content, routes, configuration, or rendering changes. Tests cover preview
middleware, the Soft Boundary language controls and assets, and a basic runner sanity check;
the build validates project frontmatter against the content schema. For documentation-only changes,
check referenced paths, commands, formatting, and the diff; a full app build is not required.

For visible or interactive changes, use an available real-browser tool and verify
actual behavior. Do not assume a particular MCP tool name or plugin is installed.
Start the local server, wait for its ready URL, and keep operations on a shared
browser session sequential. Save screenshots in ignored `.playwright-mcp/` and stop
only the temporary processes you started.

Check affected routes and relevant interactions:

- `/`: hero playback/reveals, Lab highlights, all Works filters, badge counts, and links.
- `/about`, `/contact`, `/connect`: content, navigation, responsive layout, form validation,
  and contact/social links. Use mocked email delivery for submission tests.
- Case studies: chapter tabs on `human-permeability` or `mood-cocoon`, video behavior on
  `true-self`, and poster rendering on `mo-gu`; verify images and next-work links.
- Invalid routes: verify the 404 page.
- Retirement changes: verify removed editor/API routes return 404, preview pages
  retain noindex, and production public pages remain indexable.

Check mobile/tablet/desktop widths of 375, 768, and 1280 pixels, reduced-motion
behavior, keyboard access, console errors, and failed network requests where relevant.
Retain Lighthouse goals of 90+ on the homepage and 95+ on text pages when measuring
performance; these are targets, not claims about current scores.

Report what changed, which checks ran, and any failures or unverified behavior.
Do not trigger real email delivery or a live publish merely to verify the UI.
Review the diff for unnecessary changes before handoff; do not fabricate agent
reviews, test results, model attribution, or deployment status. When committing,
keep commits focused and allow configured hooks to run.

Do not edit `migration/` or commit generated/local artifacts under
`docs/superpowers/`, `.claude/`, `.worktrees/`, `.playwright-mcp/`, `dist/`, `.astro/`,
`.output/`, `.vercel/`, or `node_modules/`. Preserve unrelated work and never commit secrets.
