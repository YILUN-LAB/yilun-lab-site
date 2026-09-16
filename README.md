# YILUN LAB — Studio Website

Astro 6 + TypeScript + Tailwind site for [yilunlab.com](https://yilunlab.com).
Deployed to Vercel.

## Develop

```bash
npm ci
npm run dev
```

The dev server runs at `http://localhost:4321`.

## Build

```bash
npm run check
npm test
npm run lint
npm run build
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

## Publishing

Ask Codex to edit the project MDX and assets, validate the site, and prepare a
preview. Merge approved changes to `main` to deploy production. Use `npm run dev`
for local browser checks; the Vercel adapter does not provide a local build preview.

The old Keystatic editor and fixed `staging` environment were retired on
2026-09-16. Full source/history archives and recovery instructions are documented
in [the retirement record](docs/archive/staging-retirement.md). Ordinary Vercel
branch previews remain available and receive noindex metadata.

## See also

- [Logo assets and Figma export workflow](public/assets/brand/logos/README.md)

- [AGENTS.md](AGENTS.md) — shared guidance for AI coding agents working in this repo
- [CLAUDE.md](CLAUDE.md) — Claude entry point that imports `AGENTS.md`
- `docs/superpowers/specs/` — design specifications (gitignored, local only)
- `docs/superpowers/plans/` — implementation plans (gitignored, local only)
- `migration/` — original Claude Design handoff bundle (gitignored, read-only reference)
