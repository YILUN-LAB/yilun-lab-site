# Hero media performance investigation

Date: 2026-09-16. Base commit: `5cfc073`. Branch: `codex/hero-video-performance`.
Implementation and investigation record. Release validation against main `aa8bbf9` is recorded below.

## Findings

### Loading and delivery

All three original clips are 8-second H.264 High / yuv420p files at 1920×1080,
24 fps. Their `moov` playback index is after `mdat`, which requires a tail range
request (or further downloading) before initialization. Hero 2 also contains
an AAC audio track despite being used as muted decoration. There was no SSR
poster; the video was selected only after React hydration, with `preload="auto"`.

| Clip | Original bytes | New bytes | Reduction | Poster bytes |
| ---- | -------------: | --------: | --------: | -----------: |
| 1    |     12,936,149 | 8,015,813 |     38.0% |      103,358 |
| 2    |      6,526,558 | 3,887,739 |     40.4% |       57,520 |
| 3    |      7,826,551 | 4,652,588 |     40.6% |       61,172 |

The current clips preserve 1920×1080, 24 fps, 8-second duration and framing.
They use x264 slow / CRF 23, have no audio, and put `moov` before `mdat`.
Compression is lossy; unchanged dimensions do not imply pixel-identical quality.
The original files remain available for offline comparisons.

The source videos contain a fade-to-black outro, so simply enabling `loop` on
those files would retain a visible ending. The current assets instead bake an
8-second forward/return cycle from the bright first four seconds: source frames
`0..96,95..1`. Neither turning point is duplicated, and the file boundary goes
from source frame 1 to adjacent source frame 0. This removes the dark outro and
changes the motion into a repeating oscillation; the particles also run backward
on the return half. It is a design treatment of existing footage, not newly
synthesized motion. The browser decodes one ordinary H.264 stream, with no reverse
seeking, canvas drawing or second video decoder.

The first optimization pass retained each full original clip and weighed
8,111,131 / 4,015,136 / 4,736,124 bytes. The loop variants are slightly smaller
than those files. Superseded, never-deployed optimized MP4s were removed from
this branch after checking references; their originals and Git history remain.

Posters are first frames at 1920×1080, WebP quality 85. A synchronous inline
homepage head script selects one clip before the body paints and preloads its
matching poster. The SSR background uses a CSS custom property set by that script;
React reuses the same document selection without consuming another queue entry.
The poster stays underneath the video during loading, errors and initial fade-in.
With JavaScript unavailable, the CSS fallback remains clip 1. If the bootstrap
cannot run but React can, React also uses clip 1 rather than introducing a mismatch.

The earlier implementation always painted poster 1 before selecting a random
clip after hydration, producing a visible first-load jump for clips 2 and 3.
The pre-paint selection fixes that identity mismatch without crossfading different
Bubbles, changing the footage or giving up rotation between page loads.

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

- **Black-box background:** there is no playback button, native media control,
  or interactive experiment switch. Video runs at the existing 0.65× rate while
  fully inside Hero. Merely reading or focusing its content does not stop it.
- **Two resting positions:** the Hero / Lab boundary completes a 1.25-second
  scroll transition after a vertical gesture. It does not rest half inside Hero.
  Lab and later sections retain normal scrolling. Wheel momentum is consumed
  during the transition with a bounded tail; touch, keyboard, navigation links,
  native scrollbar settling and viewport changes share the same boundary.
- **Reversible scene:** visible Hero proportion drives playback rate from 0.65×
  toward 0.1× on exit, then pauses at zero exposure. Re-entry resumes the held
  frame at low speed and accelerates with exposure. The same native loop can wrap
  during acceleration without a terminal paused state. The player has no end
  fade, restart timer, explicit seek or clip swap. One Bubble is selected per
  page mount; reloading can select another, while scrolling cannot.
- **Content choreography:** Hero content fades and blurs out on exit; on every
  return, only the background is visible during acceleration. After Hero is fully
  entered and a frame at the normal 0.65× speed is presented, heading words,
  announcements, description, links, cards and footer replay their staggered
  reveal. `requestVideoFrameCallback` supplies readiness where supported; media
  events supply the fallback. There is no fixed delay guessing when playback
  will resume. Initial content, reduced-motion/data policies and playback errors
  retain readable content. Hidden Hero content is inert so it cannot catch
  keyboard focus. The global navigation remains available across sections.
- **Small viewports:** Hero is one small viewport high (`100svh`). Content can
  scroll internally when short screens or enlarged text need more room; these
  gestures finish reading the content before initiating a scene change.
- **Motion/data policies:** reduced motion skips the animated scroll; reduced
  motion, Save-Data and detected 2G leave a poster without requesting the video.
  A hidden tab or offscreen Hero pauses playback. No device-model heuristic or
  manual override is used.
- **Aurora:** hidden while completely covered by Hero; visible but stationary
  while Hero partly occupies the viewport; resumes its existing drift once Hero
  leaves. Hidden tabs sleep. This prevents a tiny scroll from restarting the
  expensive background while the visitor is still reading Hero.
- **Loading:** first-frame poster in HTML, video revealed after a decoded-frame
  callback where available, no endless animation-frame polling. A shared Motion
  value updates only during scrolling; opacity fades use CSS transitions. Playback and
  frame callbacks are cleaned up on unmount/source changes.
- **Caching:** only content-hashed files under `/assets/videos/optimized/` get
  one-year immutable browser caching. Never replace a hashed URL with new bytes.
  Local `performance` marks record request and first presented frame for diagnosis;
  no new remote telemetry collector was added.
- **Storage:** clip rotation still uses the original IDs and now also recovers
  from valid JSON of the wrong shape (`null`, objects, strings).

## Compare locally

Run `rtk proxy npm run dev -- --host 127.0.0.1 --port 4322` and open
[the homepage](http://127.0.0.1:4322/). Scroll down to Lab, then back up to Hero.
The background has no playback controls. For diagnosis only,
[`?heroPreview=1`](http://127.0.0.1:4322/?heroPreview=1) adds a non-interactive
readout of scene state, time, rate and decoded/dropped frames. The readout is
excluded from production builds. Earlier interactive A/B controls were removed
following design review. Original assets remain in the repository for offline
encoding comparisons.

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

No CDN migration, account upgrade, or telemetry expansion was performed.
Country-level video-start data and a quiet-machine Chrome power trace remain
useful next measurements. See the release validation below for the later Chrome A/B run.

## Verification

The first performance pass passed `npm run check`, lint, build and 33 tests;
asset regeneration produced identical hashes and sizes. Its real-browser work
covered all Works filters and all three clip encodings. The reversible-scene
revision replaces the manual-control tests with frame-preserving exit/re-entry,
no-control, loop-boundary and reading/focus behavior checks, and adds scroll
controller coverage for wheel momentum, touch gestures, keyboard navigation,
scrollbar settling, reduced motion, viewport changes and disposal.

Final revision: `npm run check` (zero diagnostics), `npm run lint`, `npm test`
(45 tests in 6 files), `npm run build`, changed-file formatting and `git diff
--check` passed. Production output contains the SSR poster and excludes both
playback controls and the diagnostic readout.

The in-app browser verified 1280×900, 768×1024 and 375×812 layouts without
horizontal overflow, plus 375×667 internal content scrolling before scene exit.
Wheel and keyboard transitions reached Hero / Lab endpoints; navbar navigation
reached Works and filtering still worked. Two separated offscreen readings held
exactly 6.98 s / 363 frames, and re-entry began at 6.98 s / 0.11× before returning
to 0.65×. The browser reported no console warnings or errors. These are playback
lifecycle observations, not a new whole-device GPU benchmark.
Network emulation, physical iOS/Safari touch playback and controlled regional
field measurements remain unverified. Screenshots and diagnostic captures stay
in ignored `.playwright-mcp/`.

The subsequent return-order revision was checked in the browser: while entering
at 0.17×, Hero content was inert and the title opacity was 0; after normal 0.65×
playback resumed, content became available and the title reached opacity 1. The
return resumed from the held 6.20 s frame. Added tests cover delayed playback
readiness, normal-speed frame presentation, buffering and static/error fallbacks.
The full check/lint/test/build run passed again with no browser console warnings
or errors.

## Continuous-loop corner case

The native-loop revision removes the JS end fade, 100 ms restart delay and the
ended-during-entry hold. Tests cover resuming at 7.95 s and wrapping during
acceleration, repeated ordinary loop boundaries without source reload or extra
play/pause calls, and unmount cleanup. Frame readiness still gates content once
per entry; ordinary loop boundaries do not hide or reload already visible UI.

FFprobe confirmed all three loop assets have 192 frames, 8 seconds, 1920×1080 at
24 fps, no audio and faststart. A 320×180 grayscale frame audit measured wrap
differences of 1.914 / 1.139 / 0.439 (out of 255), versus median ordinary adjacent
frame differences of 4.270 / 2.166 / 3.683. No black outro remains in the selected
range. These measurements check image discontinuities, not guaranteed zero-latency
browser decoding. The underlying processing uses FFmpeg's
[reverse filter](https://ffmpeg.org/ffmpeg-filters.html#reverse); playback uses the
[native media loop](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/loop).

In the browser, clip 3 was paused at 7.89 s, resumed at 0.12× with content hidden,
and wrapped to 0.37 s at 0.65× with content visible. The source URL stayed identical
and video opacity stayed 1. Captures are in `.playwright-mcp/hero-loop-review/`.

All three variants were played in the in-app browser. Desktop 1280×900, tablet
768×1024 and mobile 375×812 remained usable; mobile had no horizontal overflow.
Clip 1 also crossed an ordinary wrap at 0.06 s with content visible and opacity 1.
There were no console warnings/errors. Regeneration reproduced all three hashes
and byte counts; check, lint, 45 tests, build, formatting and diff checks passed.
Production output includes the three new loops and excludes the debug readout.
Physical Safari touch behavior and controlled GPU/regional measurements remain
outside this verification.

## Release validation after integrating main

On 2026-09-16, merged main `aa8bbf9` (including Ashlar and mobile filter fixes)
into the Hero branch at `b5a9425`. Check completed with zero diagnostics; lint,
91 tests across 11 files, and the production build passed.

A native Chrome window on the user's M3 Max compared two local production builds:
main `aa8bbf9` on port 4334 and candidate `b5a9425` on port 4335. The same window
and 1674×997 CSS-pixel viewport were used throughout, with Bubble 1 selected in
both builds and its normal 0.65× playback rate. A temporary, local-only HTTP
fixture seeded that clip and logged media state once per second; this diagnostic
script, its readout and its local collection endpoint are not in the deployed app.
No builds or encodes ran during sampling. Existing user applications were left open.

Each condition waited three seconds, then collected 25 approximately one-second
IOGPU samples. These are whole-device utilization readings, not per-tab GPU time
or power measurements. Runs alternated old → new → old → new. The small sample
size and shared machine limit generalization; the consistent difference supports
this Hero regression check without promising the same percentage on every device.

| Condition                                     | GPU median | Sample p95 |  Range |
| --------------------------------------------- | ---------: | ---------: | -----: |
| Blank before                                  |        14% |        18% |  0–19% |
| Old Hero, run 1                               |        71% |        72% | 67–79% |
| New Hero, run 1                               |        21% |        24% | 19–27% |
| Old Hero, run 2                               |        70% |        73% |  0–75% |
| New Hero, run 2                               |        24% |        29% | 21–29% |
| New page, Hero offscreen / Lab visible        |        70% |        73% | 68–77% |
| Blank after the additional Aurora experiments |        33% |        36% | 30–37% |

The final blank-page reading rose from 14% to 33%, demonstrating background
load drift during the session. Do not subtract one blank value to claim a
precise per-site GPU percentage. The adjacent, repeated Hero comparisons are
the useful evidence; a quiet-machine power trace is still unmeasured.

The two new-Hero intervals advanced 374 and 389 video frames respectively, with
zero dropped-frame increments. Both old intervals also reported zero drops.
After scrolling out, the new video stayed paused at 7.10514 seconds and frame
750 for all 25 media samples, with no further decoded frames and Hero content
inert. This verifies that the Hero's reduced GPU load is not an accidental
failure to play, and that its offscreen decoder actually stops.

The Lab reading is a remaining limitation: its visible, drifting Aurora still
has substantial GPU cost. Local fixture experiments with compositing isolation
(69% median) and an SVG blur texture (69%) did not help. Quantized CSS movement
reduced the median to 52% but changed the motion timing, so none of these
experiments is included in the release. This is a Hero performance improvement,
not a claim that the whole site now has low GPU utilization. A separate Aurora
redesign/renderer optimization needs visual review and further measurement.

Raw timestamped IOGPU samples, local fixture scripts and media observations are
retained in ignored `.playwright-mcp/gpu-review/`. The instrumentation, temporary
SVGs and benchmark worktree are excluded from tracked release files.


## First-load poster identity fix (2026-09-17)

The homepage now chooses its clip in a classic inline head script, before React
or body paint. Only the chosen poster is preloaded, and the decorative background
uses that URL through `--hero-poster`. React reads the document's existing choice;
it never advances the rotation queue during hydration. The fallback CSS and
missing-bootstrap video both use clip 1. The queue still rotates all three clips,
avoids a repeat across queue boundaries, and tolerates unavailable/corrupt storage.

Validation: `npm run check` reported zero diagnostics; lint, the production build,
and all 104 tests across 13 files passed. Bootstrap tests execute the actual raw
script and cover each poster/video pair, duplicate initialization, queue rotation,
malformed queues, denied storage and missing-bootstrap fallback. Production HTML
inspection confirmed a classic script before the body, no fixed Hero `<img>` URL,
and an identical poster style across SSR and hydration.

A local HTTP fixture served the production build while holding the HomePage JS
response. For forced clips 2 and 3, the real in-app browser showed the corresponding
poster with the island still unhydrated and no video element. Releasing the response
mounted and played the matching video at 0.65x; the poster URL stayed unchanged.
Desktop 1280x900 and mobile 375x812 were checked. A script-stripped fixture at
768x1024 retained poster 1. No horizontal overflow was observed. On the actual dev
homepage, exiting Hero held clip 2 at 5.089765 seconds; returning restored playback
and content with the same source. Neither hydrated run reported console warnings
or errors. This verifies first-load identity and existing scroll lifecycle, not a
new GPU or regional network benchmark. Local fixtures and screenshots remain in
ignored `.playwright-mcp/hero-first-frame/`.
