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

| Command                   | What                                                                          |
| ------------------------- | ----------------------------------------------------------------------------- |
| `npm run dev`             | Astro dev server with HMR                                                     |
| `npm run build`           | Static + Vercel adapter build                                                 |
| `npm run preview`         | Preview the built site locally                                                |
| `npm run check`           | `astro check` + `tsc --noEmit`                                                |
| `npm run format`          | Prettier (Astro + Tailwind plugins) write                                     |
| `npm run lint`            | ESLint with jsx-a11y                                                          |
| `npm run assets:optimize` | One-shot WebP migration from `migration/YILUN LAB Assets/` → `public/assets/` |
| `npm run qr:make`         | Generate the /connect QR code (PNG + SVG) into `public/assets/brand/qr/`      |

Asset pipeline: source images live in `migration/YILUN LAB Assets/`
(gitignored, never committed). `npm run assets:optimize` reads them,
converts to WebP at max 1920 px wide / quality 80, and writes
`public/assets/images/projects/<slug>/01.webp` … `NN.webp` plus
`public/assets/images/founder/headshot.webp`. The script is idempotent;
re-run it whenever assets change. Skips the 289 MB
`Tao Cave Final.mp4` — TAO CAVE uses its YouTube embed instead.

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
- For visual changes, run the **Browser Verification Workflow** below
  instead of asking the human to walk through manually
- Lighthouse target: 90+ on `/`, 95+ on text pages
- Sanity checks: `prefers-reduced-motion` (DevTools → Rendering), mobile
  viewports 375/768/1280

## Browser Verification Workflow

When the build/lint can't catch a regression — animation timing, hover
states, click-through flows, layout breakage — drive a real browser
through the Playwright MCP tools rather than asking the human.

### Tools

The Playwright MCP tools are deferred. Load them once at the start of a
verification run via `ToolSearch`:

```
ToolSearch query: "select:mcp__plugin_playwright_playwright__browser_navigate,mcp__plugin_playwright_playwright__browser_snapshot,mcp__plugin_playwright_playwright__browser_take_screenshot,mcp__plugin_playwright_playwright__browser_click,mcp__plugin_playwright_playwright__browser_hover,mcp__plugin_playwright_playwright__browser_console_messages,mcp__plugin_playwright_playwright__browser_resize,mcp__plugin_playwright_playwright__browser_network_requests,mcp__plugin_playwright_playwright__browser_close,mcp__plugin_playwright_playwright__browser_evaluate,mcp__plugin_playwright_playwright__browser_wait_for"
```

The browser maintains a single shared session — do **not** dispatch
multiple browser tools in parallel; navigations and clicks must run
sequentially. Server commands (dev server, prototype http server) are
the only thing to put in `run_in_background: true`.

### Run order

1. **Start the dev server in the background**

   ```bash
   npm run dev
   ```

   Use `Bash` with `run_in_background: true`. Wait ~3 seconds for it to
   bind to `http://localhost:4321`.

2. **(Optional) Start the prototype as a comparison reference**

   ```bash
   cd migration/yilun-lab-website/project && python3 -m http.server 8000
   ```

   Also `run_in_background: true`. Use only when validating fidelity to
   the original handoff design — skip for routine regression checks.

3. **Walk each route**

   For each URL: `browser_navigate` → `browser_snapshot` (text-based
   accessibility tree, cheap, captures structure) → `browser_console_messages`
   (catch JS errors). Use `browser_take_screenshot` only when a visual
   reference will go in the report or compare against the prototype.

   **Always save screenshots under `.playwright-mcp/`** (e.g.
   `filename: ".playwright-mcp/qa-home-fold.jpg"`). That directory is
   gitignored alongside the playwright auto-snapshots, so verification
   artifacts never end up in commits.

   Standard routes for this site:

   | Route | What to check |
   | --- | --- |
   | `/` | Hero video plays, headline word-by-word reveal, Works grid populates with 13 cards, all sections present |
   | `/about` | Full bio, practice block, selected credits list, "Start a Collaboration" CTA links to `/contact` |
   | `/contact` | 4 collab area cards, contact card with email + IG + LinkedIn pills, external pills have `target="_blank"` |
   | `/projects/human-permeability` | `chapters-tabbed` variant — **click each tab** (Drift / Eon / Mortal); after each click, take a snapshot and confirm only the active chapter's body is visible |
   | `/projects/true-self` (or any `image-wall`) | 3-col grid of gradient placeholder tiles, intro paragraph centered |
   | `/some-bad-slug` | Redirects to or renders the 404 page ("Lost in the dark.") |

4. **Test interactions where they exist**

   - **Chapter tabs** (`/projects/human-permeability`): click each
     `[data-chapter-name]` toggling tab. Confirm `display: none` is
     applied to inactive sections by reading the snapshot.
   - **Works filter** (`/`): click each filter pill (All Works / Light &
     Art / Light & Dance / Light & Tech). Confirm grid card count matches
     the badge.
   - **Hover effects**: `browser_hover` on a work card or navbar pill —
     the liquid-glass lensing should track the cursor. Verify visually
     via screenshot.

5. **Multi-viewport check**

   `browser_resize` → 375 (mobile) → snapshot → 768 (tablet) → snapshot
   → 1280 (desktop) → snapshot. Confirm:
   - The center nav pill hides below 768px (`hidden md:flex`)
   - Works grid reflows (single column on mobile, multi-column above)

6. **Network sanity**

   After each page load (or once at the end on the homepage),
   `browser_network_requests` and grep for 4xx / 5xx. Missing video,
   image, or font requests are immediate red flags.

7. **Tear down**

   - `browser_close`
   - `KillShell` the dev server background process
   - `KillShell` the prototype HTTP server (if started)

### Reporting findings

Classify by severity:

- **Critical** — console errors, broken interactions, missing content
- **Important** — visual divergence from the prototype that affects
  brand identity
- **Minor** — small layout / spacing / font-weight tolerances

Always include in the report:

- Which routes were visited
- 0 to ~6 screenshots (key views only — don't flood the report)
- Console error log (or "0 errors")
- Specific interactions tested + results
- Multi-viewport behavior summary

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

| Task category                                           | Implementation model                 | Examples                                                                                     |
| ------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| Mechanical port + assembly + most feature work          | **Sonnet 4.6** (`claude-sonnet-4-6`) | Default for nearly all tasks                                                                 |
| Architecture, complex integration, debugging unblocking | **Opus 4.7** (`claude-opus-4-7`)     | Tasks that touch multiple subsystems, require design judgment, or have failed once on Sonnet |

**Reviewer model defaults:**

| Reviewer role                       | Model        |
| ----------------------------------- | ------------ |
| Spec compliance reviewer            | **Opus 4.7** |
| Code quality reviewer               | **Opus 4.7** |
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
