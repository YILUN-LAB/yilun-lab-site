# Aurora rendering experiment

Date: 2026-09-17. Branch: `codex/aurora-performance`, based on production main
`269fbbd` (Hero PR #5). The merged Hero branch was deleted locally and remotely.
The worktree was renamed to `Yilun-Lab-Website-aurora-perf`; earlier local evidence
remains under its ignored `.playwright-mcp/` directory. This document records the implementation and its measurement limits.
Release approval and validation are recorded below.

## Implementation

`AuroraBackground.tsx` retains its visibility policy and CSS fallback. Its main
renderer, `src/lib/aurora-renderer.ts`, caches three radial-gradient sprites with
the original 110 px blur. It composites these sprites into one canvas whose
backing dimensions are one quarter of the CSS viewport dimensions, independent
of device pixel ratio. The blur is rebuilt only when the viewport changes.
Canvas and sprite compositing preserve screen blending and 0.5 opacity.

Positions, 75/90/80-second periods, colors, and the original CSS ease-in-out curve
are retained. A timeout followed by one animation frame limits updates to at most
12 fps; it does not run a display-rate callback just to discard work. Actual
cadence depends on frame alignment and scheduling. This changes temporal sampling
and raster resolution, so it is an approximation and requires visual review.
The low-frequency, 110 px-blurred image is the reason for this tradeoff.

While Hero fully covers the background, no sprites or canvas backing pixels are
allocated initially. Partial Hero exposure holds the scene still; leaving Hero
resumes the saved animation clock. Hidden tabs and cleanup cancel both the timeout
and pending animation frame. Reduced motion draws a single still image at the
original nonanimated CSS positions. If 2D Canvas or its filter property is
unavailable, the original CSS blobs remain as a static fallback. No playback
controls or external assets/services were added.

## Verification

Typecheck (zero diagnostics), lint, 95 tests in 12 files, and the production build
passed. New tests check original path endpoints, blur caching, initial allocation
under Hero, no work while sleeping, resume without advancing through hidden time,
reduced motion, resizing, fallback and disposal.

Isolated real-browser screenshots compared the CSS and canvas renderer at the
same initial animation phase and a height of 900 CSS pixels. The fixture used
actual renderer code bundled locally and the component's original CSS. These are
image comparisons at one phase, not proof of identical motion at every frame.

| Width | Mean absolute RGB channel difference (0–255) | Maximum channel difference |
| ----- | -------------------------------------------: | -------------------------: |
| 375   |                                        0.322 |                          5 |
| 768   |                                        0.372 |                          6 |
| 1280  |                                        0.451 |                          6 |

Native Chrome also rendered the first canvas version in the real Lab page.
GPU testing was interrupted by foreground/window changes: an initial 24 fps
budget prototype produced a mixed 43% median, but part of that interval was
hidden. A later old-page run reached 100% amid changing background load, and the
paired new-page run was interrupted by browser interaction. Neither is a valid
final A/B result. No GPU reduction is claimed for this final 12 fps candidate.
A quiet, foreground-stable comparison against main is still required to
quantify the performance benefit. Release approval does not establish a GPU
reduction.

The development server was restarted after the worktree move and production
build to clear stale Vite dependency URLs; actual hydration was then verified. The real page used a 94 px-wide backing
canvas at a 375 px viewport, with no horizontal overflow. Returning to Hero
set Aurora to covered/sleeping while its video continued to play. About and
Connect used 320 px-wide backing canvases at 1280 px; Contact (which has no
Aurora) still rendered its form. No new console errors appeared after the
development-server restart.
Screenshots, sample logs and local benchmark fixtures are ignored under
`.playwright-mcp/aurora-review/`. They are not part of the production app.

## Local review

Run `npm run dev -- --host 127.0.0.1 --port 4322` in the Aurora worktree and open
`http://127.0.0.1:4322/#lab`. Review motion on Lab and Works, then return to Hero
and visit About/Contact/Connect. Compare with production without changing the
Hero design or the Ashlar layouts. Physical Safari touch and a stable Chrome
GPU/power trace remain unverified.

## Release approval

On 2026-09-17 the user reviewed the local result and explicitly approved merge,
push and deployment. Main `45689b4`, including the navigation pill padding fix,
was integrated at `046ed8e` without conflicts. The resulting version passed
98 tests in 12 files, typecheck with zero diagnostics, lint and production build.
The release retains the GPU measurement limitation above; no percentage saving
or validated power reduction is claimed.
