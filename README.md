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
- `docs/superpowers/specs/` — design specifications (gitignored, local only)
- `docs/superpowers/plans/` — implementation plans (gitignored, local only)
- `migration/` — original Claude Design handoff bundle (gitignored, read-only reference)
