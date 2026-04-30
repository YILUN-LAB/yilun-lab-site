# Yilun Lab Website — Agent Guidelines

This is an Astro 5 + TypeScript + Tailwind 3 site, ported from a React-on-CDN
prototype that lives at `migration/yilun-lab-website/` (read-only reference,
not deployed, gitignored). The prototype is the visual + motion source of truth —
when a regression is suspected, compare against the prototype rendered locally.

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

- Don't modify `migration/` — it's the read-only handoff bundle (gitignored)
- Don't replace `motion` — fidelity to the prototype's animations was the
  reason it was chosen over CSS-only
- Don't add Framer Motion alternatives, react-spring, or other animation libraries
- Don't switch to component-level CSS modules — Tailwind + `global.css` is
  the established pattern; mixing styles across files breaks the liquid-glass
  cascade
- Don't break the `useGlassLensing` invariant: it must run once per page,
  and currently runs inside `<Navbar />`
- Don't commit anything under `docs/superpowers/`, `dist/`, `.astro/`,
  `.vercel/`, or `node_modules/` — they're gitignored on purpose

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

---

# Implementation Workflow (for AI agents executing the plan)

This repo's migration plan lives at
`docs/superpowers/plans/2026-04-29-yilun-lab-website-migration.md`
(local-only, gitignored). Follow this workflow per task:

## Per-task workflow

1. **Read the task** — task text and surrounding phase context.
2. **Implement** — write the code per the plan's "Step N" instructions, follow TDD where the plan calls for it.
3. **Run checks** — `npm run check`, plus any task-specific verification commands.
4. **Run code-simplifier** — invoke the `code-simplifier:code-simplifier`
   agent (or `/simplify` skill) on the changed files **before** committing.
   It reviews the diff for reuse, dead code, premature abstractions, and
   inefficiencies, and applies fixes.
5. **Commit** — exactly one commit per task, message body per the plan.
6. **Hand off for review** — spec compliance review first, then code quality review.

## Code-simplifier as a pre-commit step

Every implementer subagent **MUST** run `code-simplifier:code-simplifier`
on its changes before issuing the `git commit` command. The simplifier:

- Finds and removes redundant code (duplicate utility functions, dead
  imports, unused variables)
- Catches premature abstractions (one-call helper functions, generic
  wrappers around a single use case)
- Replaces over-engineered patterns with simpler equivalents
- Surfaces inconsistencies with neighboring code

If the simplifier proposes changes, the implementer applies them, re-runs
checks, and only then commits. If the simplifier reports nothing, commit
proceeds directly.

This step exists so each task's diff lands in its tightest, simplest form
before review — saving review iterations.

## Per-task model selection

Quality bar over cost. Implementation tasks use Sonnet or Opus only —
never Haiku. Reviewers always use Opus.

| Task category | Implementation model | Examples |
|---|---|---|
| Mechanical port + assembly + most feature work | **Sonnet 4.6** (`claude-sonnet-4-6`) | Default for nearly all tasks |
| Architecture, complex integration, debugging unblocking | **Opus 4.7** (`claude-opus-4-7`) | Tasks that touch multiple subsystems, require design judgment, or have failed once on Sonnet |

**Reviewer model defaults:**

| Reviewer role | Model |
|---|---|
| Spec compliance reviewer | **Opus 4.7** |
| Code quality reviewer | **Opus 4.7** |
| Final whole-implementation reviewer | **Opus 4.7** |

**Triage rules:**

- Default to Sonnet 4.6 for implementation. Reach for Opus 4.7 when the task
  involves multi-file integration with non-obvious cross-file invariants,
  architecture/design decisions, or debugging an unfamiliar regression.
- If an implementer returns `BLOCKED` or `NEEDS_CONTEXT` on Sonnet, escalate
  the next attempt to Opus.
- If a reviewer finds substantive issues twice on the same task, escalate
  the next implementer attempt to Opus.

## Reviewers

Two reviews run in series after every task:

1. **Spec compliance reviewer** — confirms the implementation matches what
   the plan asks for. Flags missing requirements and over-implementation
   ("you added X that wasn't in the spec"). Only when spec is ✅ does code
   quality review begin.
2. **Code quality reviewer** — checks the implementation for bugs, dead
   code, naming, type safety, accessibility (jsx-a11y), and adherence to
   conventions (e.g., paths, animation invariants).

If either reviewer finds issues, the same implementer subagent fixes them
and the relevant reviewer runs again. No skipping.

## Commits

- One commit per task — never batch tasks
- Commit message body comes from the plan's task definition
- All commits include the `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>` trailer
- Pre-commit hooks (Prettier, ESLint) must pass — never use `--no-verify`

## When stuck

Per `~/.claude/CLAUDE.md`: maximum 3 attempts per issue. After 3 failed
attempts, document what was tried, escalate the model tier, or escalate
to the human. Do not loop indefinitely.
