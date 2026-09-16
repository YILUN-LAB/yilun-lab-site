# Hero media performance investigation

Date: 2026-09-16. Base commit: `5cfc073`. Branch: `codex/hero-video-performance`.
This is an isolated local implementation and design experiment, not a production deployment.

## Findings

### Loading and delivery

All three original clips are 8-second H.264 High / yuv420p files at 1920×1080,
24 fps. Their `moov` playback index is after `mdat`, which requires a tail range
request (or further downloading) before initialization. Hero 2 also contains
an AAC audio track despite being used as muted decoration. There was no SSR
poster; the video was selected only after React hydration, with `preload="auto"`.

| Clip | Original bytes | New bytes | Reduction | Poster bytes |
| ---- | -------------: | --------: | --------: | -----------: |
| 1    |     12,936,149 | 8,111,131 |     37.3% |      103,358 |
| 2    |      6,526,558 | 4,015,136 |     38.5% |       57,520 |
| 3    |      7,826,551 | 4,736,124 |     39.5% |       61,172 |

The new clips preserve resolution, frame rate, duration and framing. They use
x264 slow / CRF 23, have no audio, and put `moov` before `mdat`. Compression is
lossy: unchanged dimensions do not imply pixel-identical quality. A more aggressive
CRF 26 trial reduced clip 1 to about 4.9 MB, but the conservative variant was kept
for visual review. The original clips remain available for direct A/B comparison.

Posters are first frames at 1920×1080, WebP quality 85. The first poster is in
server-rendered HTML; selection rotates after hydration. A poster stays underneath
the video during loading, errors and crossfades. The default SSR poster is clip 1;
when another clip is chosen its poster can change briefly before playback.

### Actual Vercel dashboard observations

Read from the existing Hobby project, without changing settings or purchasing an upgrade:

- [Speed Insights](https://vercel.com/yiilunzhan-4453s-projects/yilun-lab-site/speed-insights):
  production, last 7 days (Sep 9–16), desktop RES 60, 43 performance events.
  The homepage route displayed 32 events / RES 69. These are metric events, not
  unique visitors. Detailed metrics and country comparisons displayed Plus gates.
  Mobile showed 9 events, too few for a useful regional inference.
- [CDN](https://vercel.com/yiilunzhan-4453s-projects/yilun-lab-site/cdn):
  last 12 hours, 540 edge requests, 0% 5xx, p90 TTFB 2 ms, cache hit rate 57%.
  Regional request shares included San Francisco 68.1%, Tokyo 13.7%, Singapore 7.4%,
  Hong Kong 0.2%. These are CDN region shares, not visitor-country proportions.
- A live HEAD request for `hero-1.mp4` returned `x-vercel-cache: HIT`, `sfo1`,
  byte-range support, and `Cache-Control: public, max-age=0, must-revalidate`.
  This test's egress reached San Francisco; it is not evidence of mainland direct
  connectivity. A single 1 MiB range request returned HTTP 206, TTFB 2.43 s,
  total 9.09 s (115 KB/s). Edge-side TTFB does not measure video download time
  at the user's device. This is one sample of the current network path.

[Vercel's mainland China guidance](https://vercel.com/kb/guide/accessing-vercel-hosted-sites-from-mainland-china)
explicitly states there are no mainland servers or CDN nodes and access can be
degraded. Moving the contact function's region would not relocate static MP4
serving. See [Vercel CDN caching](https://vercel.com/docs/caching/cdn-cache).
Neither the available aggregate scores nor the CDN panel establishes the cause
or size of the user's China-versus-North-America difference.

### GPU isolation on the user's M3 Max

The original page runs three drifting Aurora blobs (up to 1300×1300, blur 110 px,
`mix-blend-mode: screen`) behind an opaque Hero. Its video also loops offscreen,
and the visible UI uses multiple live backdrop filters. These are separate costs.

Initial real-Chrome experiments used `ioreg -r -c IOGPU`, ten one-second samples
per condition. Raw samples are retained locally under `.playwright-mcp/gpu-*.json`.

| Condition                                    | Whole-device GPU median |
| -------------------------------------------- | ----------------------: |
| Original homepage                            |                   70.5% |
| Video paused, Aurora running                 |                     86% |
| Video paused, Aurora hidden                  |                     26% |
| Video playing, Aurora hidden, glass retained |                     35% |
| Video playing, Aurora hidden, glass disabled |                   28.5% |

These sequential, whole-machine readings are diagnostic, not a controlled
benchmark or a promised percentage reduction. Other applications, Aurora phase,
clip phase and concurrent user activity were not held constant. The last run also
contained outliers (0% and 56%). Subsequent Chrome verification was interrupted by
concurrent browser interaction, so there is no clean final native-Chrome A/B claim.
The large drop when hiding the occluded Aurora supports fixing invisible work first;
it does not attribute all GPU activity to this tab. Merely pausing video was insufficient.

## Implemented behavior

- **Default: settle on engagement.** Loop initially at the existing 0.65× rate.
  A scroll past 16 px or focus inside Hero content eases playback down over
  1.6 seconds, then pauses on the decoded frame without seeking or replacing it
  with a different poster. Reading itself is not detected. The background button
  explicitly resumes from that frame; further interaction may settle it again.
- **Visible loop:** keeps the original fade-out/restart cadence, but pauses when
  outside the viewport or in a hidden tab. Explicit pauses persist across re-entry.
- **Poster only:** no video source is attached automatically. Reduced motion,
  Save-Data and detected 2G connections also default to this behavior. Explicit
  play remains available. No automatic heuristic depends on device price/model.
- **Aurora:** hidden while completely covered by Hero; visible but stationary
  while Hero partly occupies the viewport; resumes its existing drift once Hero
  leaves. Hidden tabs sleep. This prevents a tiny scroll from restarting the
  expensive background while the visitor is still reading Hero.
- **Loading:** first-frame poster in HTML, video revealed after a decoded-frame
  callback where available, no endless animation-frame polling. Short frame loops
  run only during deceleration; opacity fades use CSS transitions. Playback and
  loop timers are cleaned up on unmount/source changes.
- **Caching:** only content-hashed files under `/assets/videos/optimized/` get
  one-year immutable browser caching. Never replace a hashed URL with new bytes.
  Local `performance` marks record request and first presented frame for diagnosis;
  no new remote telemetry collector was added.
- **Storage:** clip rotation still uses the original IDs and now also recovers
  from valid JSON of the wrong shape (`null`, objects, strings).

## Compare locally

Run `rtk proxy npm run dev -- --host 127.0.0.1 --port 4322` and open
[the experiment](http://127.0.0.1:4322/?heroPreview=1). The footer overlay offers
motion mode, all three clips, original/optimized assets, Aurora behavior and glass
blur switches, plus playback/frame counters. Use the same clip, viewport and
foreground browser for comparisons. The panel is excluded from production builds.
The ordinary [homepage](http://127.0.0.1:4322/) shows the proposed product UI only.

The original-asset option compares encoding under the new player. To approximate
the original GPU workload, also choose Visible loop and Original: always running
Aurora. It is not an exact historical implementation benchmark.

Regenerate with `rtk npm run assets:hero` (requires local FFmpeg and installed npm
dependencies). It writes hash-named files and the TypeScript manifest. FFmpeg
version differences can change hashes. Review old unreferenced generated files
before removing them; the script does not delete prior versions. Original media
is preserved. Verify `moov` order, 24 fps, 1920×1080, no audio, and visual quality.

## Delivery options still worth testing

1. Keep Vercel and ship the lifecycle/poster/cache fixes after visual approval.
   This addresses invisible GPU work and makes the design usable before video loads.
2. Add a regional media origin while leaving Astro on Vercel. Compare the same
   encoded MP4 from candidate hosts using real mainland and North American networks,
   with VPN/proxy conditions recorded. Measure cold/warm TTFB, first presented frame,
   stall time and total downloaded bytes; confirm byte ranges and CORS. The current
   CSP restricts media to self, so an external origin requires a deliberate CSP update.
   A nearby international region alone is not a guarantee of mainland performance.
3. For a more exact macOS-wallpaper feel, author a clip with deceleration baked in
   and a curated final frame. Runtime playback-rate easing holds the current frame,
   but cannot generate extra source frames: very slow motion can visibly step.
   The current branch makes that tradeoff directly reviewable before editing source art.

No CDN migration, account upgrade, production deployment, or telemetry expansion
was performed. Country-level video-start data and a quiet-machine Chrome power
trace remain the useful next measurements.

## Verification

`npm run check`, `npm run lint`, `npm test` (33 tests in 5 files),
`npm run build`, changed-file Prettier checks, and `git diff --check` passed.
`npm run assets:hero` regenerated identical hashes and media sizes. Built HTML
was checked for the SSR poster, no premature video source, correct inline CSS,
and removal of the dev comparison panel from production JavaScript.

Tests cover playback eligibility,
visibility, manual control, reduced-motion changes, Save-Data, 2G, loop cleanup,
autoplay rejection, storage corruption and Aurora occlusion. Real-browser checks
cover desktop/tablet/mobile composition, first-frame display, keyboard and scroll
settling, re-entry and frame-counter stability. Network emulation, Safari playback
and controlled regional field measurements are not yet verified. The in-app
browser checked actual widths 375, 768 and 1280 px without horizontal overflow,
all Works filter counts (derived from the current content), all three media
choices, looping/re-entry, and scroll/keyboard settling. After correcting an
inline-style quote escaping hydration mismatch, a fresh page load produced
no console warnings or errors. Screenshots are in ignored `.playwright-mcp/`.
