# The Unlit Cut: an illustrated development log

*The Unlit Cut* is a first-person light sandbox built in Unreal Engine 5.8 by team YILUN LAB during the four-day 2026 Epic AI MegaJam. Holding a flashlight and a cut-paper gobo box, you step onto the dark, scrapped sets of a halted film shoot. By warming or cooling your beam and sliding the lamp into the box, you open painted stage gauze, project a paper skyline, and print your own frames.

## Inspiration

Our creative lead works professionally as a lighting artist and designer, so the project began with a single question: what kind of game could grow out of real lighting craft, using reflection, transmission, stage gauze, a flashlight, and a few reflective materials? When the jam opened at 23:00 on November 11 with the theme *Director's Cut*, we read it as a question of power. In cinema, the director's scissors decide what is worth showing; in our game, the player is the lighting artist who walks back onto the dark stage to light the corners that were cut. Each lit composition is printed as a film frame, and the reel screened at the end is your own *Lighting Artist's Cut*.

![One opening storyboard frame generated with GPT Image: the first version and the darker old-film version](../images/12-intro-frame-old-and-dark.jpg)
*One opening storyboard frame generated with GPT Image: the first version (left) and the darker old-film version (right).*

We set the story in November 1994 in Soho, London, inside a basement black-box rehearsal room in a converted Victorian warehouse on the night the shoot was stopped. An opening storyboard of five frames introduces the hall. We generated those five frames on Day 3 as pencil line and pale watercolour inside a 35 mm border, and redrew them on Day 4 in a darker 1.375:1 old-film ratio. The game has only two characters: the director, Julian Vance, and the lighting artist played by the player.

![A plan view of the basement theatre as built](../images/15-theatre-plan.jpg)
*A plan view of the basement theatre as built.*

We wrote the one-page GDD at 00:45 on November 12, assembled the moodboard between 00:57 and 11:20, drafted the story copy at 20:15, and wrote full GDD versions 1.0 to 1.6. Eight named design principles guided our choices: *light is the protagonist*, *warmth lands in corners*, *immersion, not puzzles*, *the ending should move people*, *it has to be a game*, *the time and place should read at a glance*, *the lighting artist is not someone picking up scraps*, and *props must not look too old*.

## Design

Three spatial ideas turn our lighting toy into a playable game: colour temperature changes physical space, projections become real space, and transitions happen directly in the theatre without black screens. The game has no hard puzzles, fail state, timer, or combat, and people appear only as silhouettes and shadows, with the first-person hands as the single exception.

![Diagram of one play-through of The Unlit Cut](../images/22-diagram-play-flow.jpg)
*Diagram of one play-through: start screen, opening, prologue, Act 1 (wall, alley), optional encore, small plaza, finale, and the obedience ending if you walk out before the first print.*

Our first prototype on the night of November 12 tested the premise in a single room. When we playtested that Stage 1 build on November 13, we locked in the rule that *"the projection becomes real"*, a tribute to *Gorogoa*, and required that sliding the flashlight into the box must fill the wall ahead.

![An early prototype frame: a projected paper-city pattern on a dark stage, the lamp and the box in the foreground](../images/01-first-paper-city.jpg)
*An early prototype frame: a projected paper-city pattern on a dark stage, the lamp and the box in the foreground.*

Under cold light, a stage gauze curtain is a solid barrier. When you scroll the mouse wheel to warm the flashlight, the gauze where the warm beam lands turns transparent and you can walk right through it. After two automated blind playtests on Day 2, we lowered the warmth threshold everywhere from 0.85 to 0.65 and added a warm gold glow beneath the prologue curtain.

![Warm light opening the gauze and cold light blocked by it](../images/02-gauze-warm-cold.jpg)
*Warm light opening the gauze (left) and cold light blocked by it (right).*

In the prologue, you begin on the dark stage while Julian Vance's voice tells you not to touch the flashlight and to leave by the green EXIT. If you obey the director and walk 120 cm into the open black passage beneath the EXIT sign before printing your first frame, the run ends with *"Sensible choice..."* and a *Director's Cut* card. Once you make your first print, the exit closes, and finishing the course screens your prints in the finale before ending on *THE LIGHTING ARTIST'S CUT*.

![An early look at the prologue: lamp and box in hand on a dark stage, with an on-screen narration line](../images/03-prologue-first-look.jpg)
*An early look at the prologue: lamp and box in hand on a dark stage, with an on-screen narration line.*

Passing through the prologue curtain brings you to Act 1, *London Skyline*. Left-clicking slides the right-hand lamp into the window-cut gobo box so its skyline projection lands across a painted gauze wall where the director's red viewfinder hangs in space. When you fill the viewfinder with warm light and hold for 3 seconds, a camera flash fires, the composition prints as Frame 1, the gauze wall dissolves, and the flat projection rises into a three-dimensional paper alley from near to far over 3 seconds. A second viewfinder at the far gauze prints Frame 2 and opens the way to the small plaza.

![A contact sheet from an automated check of Act 1, including the moment a frame is printed and the SCRAPPED stamp](../images/04-act1-print-sheet.jpg)
*A contact sheet from an automated check of Act 1, including the moment a frame is printed and the SCRAPPED stamp.*

In our Day 2 builds, the paper-city alley ran straight ahead. On Day 3 we reshaped the street with a bend in the alley closed by an arched facade, and tucked a side room into the corner for an optional encore.

![The plan for the bend in the alley and the side room of the encore](../images/21-bend-plan.jpg)
*The plan for the bend in the alley and the side room of the encore.*

We built two versions of that side room on Day 3. In the afternoon we made *"Extra Number 47"*, placing a 20 cm ballet figurine on a chalk mark. That evening we adapted the curved reflective film from Act 2 of our story script for an optional encore called *"The Cut Door"*. Holding warm light close to the 30 cm curved reflective film bends two arcs of light until they lock into an "eye of light" inside a door-frame viewfinder. In Round 24, the eye material failed to compile during packaging and shipped as a white blob, so we fixed the shader and made `package.sh` fail whenever a material fails to compile.

![The Cut Door encore: the light eye before and after the fix](../images/10-door-light-eye.jpg)
*"The Cut Door" encore: the light eye before (a white blob) and after the fix.*

After five auditions in ElevenLabs (`eleven_v4`), we gave Julian Vance a *"British Theatrical"* voice with performance tags for pauses, breaths, sighs, raised voice, and whispers, paired with two music beds (`eleven_music_v2_5`) that crossfade with colour temperature. During playtesting we cut *"Scene Four."* from the fourth line, and re-recorded the first line to say *"the editing table"* so no brand names appeared.

## Art

Our one-line art direction was *"black-box light painting"*: painting with real light on cardboard models in a pitch-black small theatre where all colour comes from the player's light. On the Day 1 moodboard we adopted Direction B, *"Bling Bling"*: a black background, cream props, pearl iridescence, and sparse sparkle where light lands. On the prop boards we used old cream and warm grey surfaces with light wear and paper-tape repairs for our 3D models.

![Options for the box's hole patterns, drawn by script](../images/16-box-pattern-options.jpg)
*Options for the box's hole patterns, drawn by script.*

Already on Day 1, Python and Blender scripts (`Scripts/s1/gobo_depth.py` and `gobo_textures.py`) ray-cast the window gobo masks from the box model's recesses. On Day 2 we drafted hole-pattern options by script (`Scripts/s2/box_patterns.py`) and built a hollow optical box that cast native shadows.

![Window gobo masks ray-cast from the box model's recesses, from sharp to soft](../images/17-window-gobo-masks.jpg)
*Window gobo masks ray-cast from the box model's recesses, from sharp to soft.*

Early playtests on Day 2 caught two visual problems: the cold light looked too blue, and Package B03 felt worn and flat. We corrected the look with a 5000 K cold end and a 3000 K warm end. Inside the paper city, the skyscraper windows use light memory: they light up only where the flashlight's beam touches them, shimmer while lit, and fade very slowly after the beam moves on.

![Three captures of the paper city with window light](../images/05-city-windows.jpg)
*Three captures of the paper city with window light: just printed, about 30 seconds later, and with the box's light back in the middle.*

For the Act 1 gauze wall, our first city projection looked too photographic, so we generated a stylised painted mural across three rounds with GPT Image and repainted its silhouette on Day 3 into a London skyline. After the player prints the first frame, the painted gauze wall keeps a faint afterglow around the open hole.

![Before and after: the painted gauze wall keeps a faint afterglow around the hole after printing](../images/06-mural-afterglow.jpg)
*Before and after: the painted gauze wall keeps a faint afterglow around the hole after printing.*

On the final morning, we graded the city's materials toward cream (mural saturation 0.55 and brightness 1.25) and compared sweeps of light across the paper facades.

![Inside the paper city under a sweep of light: two versions of the city's materials compared during the last day's tuning](../images/20-city-sweep-before-after.jpg)
*Inside the paper city under a sweep of light: two versions of the city's materials compared during the last day's tuning.*

When you step out of the paper alley into the small plaza, the gobo box sinks away and the flashlight transforms into a star-tipped magic wand. In the centre of the plaza stands a 2.8-metre toy carousel. The carousel starts pure white in the darkness; when the wand's beam touches it within 6 metres, it starts turning to a four-bar E-major waltz loop and warms from white through pastel into full colour.

![The toy carousel white when first lit, then pastel, then full colour](../images/07-carousel-white-to-colour.jpg)
*The toy carousel white when first lit, then pastel, then full colour.*

From the star at its tip, the wand casts a star-shaped spot carrying a blue-and-red light photograph taken by our lighting artist in October 2021.

![The carousel lit, with the wand in hand](../images/19-carousel-and-wand.jpg)
*The carousel lit, with the wand in hand.*

We split the wand's ribbon into its own material slot (`SM_MagicWand_02`) and added a star flare and a star trail that we tuned to taper cleanly.

![The wand's star trail before and after it was made to taper](../images/08-wand-trail.jpg)
*The wand's star trail before and after it was made to taper.*

Above the plaza and the finale hangs a canopy of 200 stars that wake within 8 metres of the beam and twinkle out of step. Early on Day 4 we added the world-gone moment, hiding the paper city and stage flats once out of view and replacing them with a street boundary, 290 lit void stars, and 260 soft blurred backdrop dots.

![After the carousel is lit, looking back: the city is gone and only stars remain](../images/09-world-gone-stars.jpg)
*After the carousel is lit, looking back: the city is gone and only stars remain.*

To make the 1994 Soho rehearsal hall read at a glance, we enclosed the stage in a 273-piece theatre shell with cream-painted brick walls (`T_HouseWall_BaseColor`) and 11 set-dressing models, plus a notice of cancellation and a budget statement drawn by script (`Scripts/s2/ui_drafts.py`).

![Period props made for the set: a notice of cancellation and a budget statement](../images/18-cancellation-notices.jpg)
*Period props made for the set: a notice of cancellation and a budget statement.*

On the start screen, we replaced our early plain-text layout with cardboard letter cards hanging on threads over a pure black void, lit by a flashlight beam that follows the mouse pointer.

![The start screen: the first plain text layout and the later menu with hanging letter cards](../images/11-start-screen-before-after.jpg)
*The start screen: the first plain text layout (left) and the later menu with hanging letter cards (right).*

For the first-person view, we generated 60 cm cream forearm sleeves and updated hand grips via Blender scripts (`build_forearm_hands.py`), and added a thumb dial on the side and tail of the lamp (`SM_WarmthDial_02`) so scrolling turns the dial while the wrist stays still.

![Before and after of the first-person arms and the lamp, outside and inside the box](../images/13-arms-before-after.jpg)
*Before and after of the first-person arms and the lamp, outside and inside the box.*

## Engineering

Our project conventions (`AGENTS.md`, rule 9) started with a split where C++ owns systems and math while Blueprints own flow, visuals, and tuning. In practice, we pushed almost everything, including the scene flow, into C++ and Python editor scripts so we could test the rules without opening `.uasset` files by hand. Every gameplay rule is written first as a header of pure `inline` functions with no `UWorld` dependency, across 31 `*Math.h` and `*Rules.h` headers (`GauzeMath`, `FramingMath`, `FilmMath`, `FilmScreenMath`, `LightToyMath`, `FirstPersonPoseMath`, `EndingRules`, `EyeRules`, `MenuRules`, `GuidanceRules`), with default tuning in plain `USTRUCT` types (`FGauzeTuning`, `FFramingTuning`, `FFilmRailTuning`). `ALightArtistCharacter` carries `UFlashlightComponent`, `UGoboBoxComponent`, `UFilmPrinterComponent`, and `UDailiesComponent`, while C++ directors (`APrologueDirector`, `AActDirector`, `AFinaleDirector`) run the story alongside `AUnlitGameMode`, `AUnlitPlayerController`, and `AUnlitHUD`. The codebase has zero `BlueprintImplementableEvent` hooks; Blueprints are thin subclasses generated by `Scripts/editor/s2_act1/build_act1_blueprints.py` to assign assets and data tables.

Python scripts sent over MCP (`execute_tool_script`) build the levels and materials. `build_act1_level.py` places `L_Act1` from `act1_city_layout.json` and overlay JSONs, matching actors by label so reruns move existing actors in place, attaching `Zone_<label>` tags, and wiring references such as `framingZone`. At runtime, parts communicate through `MPC_Flashlight` for shared shader state and dynamic delegates (`AFramingZone::OnPrinted` to `AActDirector::HandleZonePrinted`, `UFilmReelSubsystem::OnPrintAdded`, `AFilmScreen::OnFinished`) for gameplay events. Because the rule headers have no world dependency, 279 automation tests in `Source/TheUnlitCut/Private/Tests/` run in a headless editor (`Scripts/run-tests.sh` with `-nullrhi`, or `UNLIT_TEST_RHI=offscreen` for the few tests that need fonts). Text fit is checked in the packaged game: `Unlit.TextFit` measures every English and Chinese story string with Slate's `FSlateTextLayout`, and agent scripts fail on any overflow.

![Architecture: world-free rule headers under C++ components and actors](../images/34-diagram-architecture.jpg)
*Architecture: world-free rule headers under C++ components and actors, C++ directors running the flow, thin Blueprints holding assets and tuning, editor Python building the level and materials, and the two test paths (headless automation tests; AgentRun on the packaged game).*

The gauze curtain shows how shaders, collision, and gameplay stay in lockstep. Every frame, `UFlashlightComponent::TickComponent` glides the beam's warmth toward the scroll-wheel target (`0.10` per notch) and calls `Apply()`, which updates the spotlight and writes `BeamOrigin`, `BeamDirection`, `BeamTanOuter`, `BeamOn`, `BeamWarmth`, `BeamColor`, `BeamIntensity`, `ReactiveAmount`, `BeamInBox`, and `CityReveal` into `MPC_Flashlight`. Those cone parameters come from `GetLitCone()`; when the lamp is inside the gobo box, that cone is the 60-degree-capped `LightToyMath::ProjectionCone` leaving the box's patterned face.

![One light, three readers: the flashlight writes its lit cone and warmth to MPC_Flashlight every frame](../images/32-diagram-flashlight-mpc.jpg)
*One light, three readers: the flashlight writes its lit cone and warmth to MPC_Flashlight every frame; M_Gauze's mask, the gauze's collision and the framing coverage all use the same cone.*

`M_Gauze` is a two-sided `BLEND_Masked` material with `ditherOpacityMask = True`; the shadow pass respects the mask, so warm light physically passes through the hole. Its Custom HLSL node ("S04") measures each pixel's distance along and across the beam ray, computes the hole radius (`HoleRadiusScale = 0.9`, `MinHoleRadius = 75` cm) with a `smoothstep` over the outer 35% (`EdgeSoftness = 0.35`), and scales transmission by `smoothstep(WarmthSolid, WarmthOpen, Warmth)` from `0.45` to `0.65` (with `add_print_hole.py` combining that live hole with a printed hole `PHole * saturate(PrintOpen)`). In `TG_PostUpdateWork`, `AGauzeScreen` evaluates `GauzeMath::IsPassable` with the same math and switches off blocking collision once transmission reaches `PassTransmission = 0.6`.

![Gauze transmission against beam warmth](../images/30-diagram-gauze-warmth.jpg)
*Gauze transmission against beam warmth: smoothstep(0.45, 0.65) as shipped (dashed: the first 0.85 tuning), the walk-through level at 0.6, and the hole cut around the beam's ray.*

```hlsl
// Scripts/editor/s1_gameplay/build_gauze.py, lines 12-18
float3 V = WorldPos - Origin.xyz;
float Along = max(dot(V, Dir.xyz), 0.0);
float Across = length(V - Dir.xyz * Along);
float Radius = max(Along * TanOuter * HoleRadiusScale, MinHoleRadius);
float Hole = 1.0 - smoothstep(1.0 - EdgeSoftness, 1.0, Across / Radius);
float Transmission = On * smoothstep(WarmthSolid, WarmthOpen, Warmth);
return 1.0 - Hole * Transmission;
```

Each `AFramingZone` is a flat 320 by 180 cm rectangle. At `BeginPlay`, `FramingMath::BuildSamples` places a 16 by 9 grid of cell centres, 144 world-space points in all, across that rectangle. Each tick, `FramingZone.cpp` tests every point against the flashlight's `GetLitCone()` (`FramingMath::IsLit`, checking range and cone angle without shadow or gobo raycasts) and divides the lit count by 144.

![144 sample points on a 320 by 180 cm frame tested against a light cone](../images/31-diagram-framing-coverage.jpg)
*144 sample points on a 320 × 180 cm frame tested against a light cone (example cone), and the hold clock: run at ≥ 0.70, pause between 0.50 and 0.70, clear below 0.50, print after 3 s (the example cone and coverage trace are illustrative).*

```cpp
// Source/TheUnlitCut/Public/Framing/FramingMath.h, lines 172-184
		const FVector ToPoint = Point - Beam.Origin;
		const double Distance = ToPoint.Size();
		if (Distance <= UE_KINDA_SMALL_NUMBER || Distance > Beam.Range)
		{
			return false;
		}
		const double Along = FVector::DotProduct(ToPoint, Beam.Direction);
		if (Along <= 0.0)
		{
			return false;
		}
		const double CosCone = FMath::Cos(FMath::DegreesToRadians(static_cast<double>(Beam.OuterConeDegrees)));
		return Along / Distance >= CosCone;
```

`FramingMath::Advance` drives the 3.0-second hold clock: at or above `HoldCoverage = 0.70`, the clock advances; between `0.50` and `0.70` it pauses; below `ClearCoverage = 0.50` it resets to zero. Required coverage relaxes to `0.55` after 60 seconds and `0.40` after 120 seconds of allowed time without a print. When a frame prints, `UFilmPrinterComponent::PrintWithScene` captures the player's view into a 1920 by 1080 render target with `USceneCaptureComponent2D`, running `1 + WarmUpCaptures` (three captures in the same frame) so temporal effects settle. `FilmMath::PrintStep` spreads the rest of the work across the next four frames before publishing the print to `UFilmReelSubsystem` and `AFilmRail`. In the finale, `AFilmScreen` (`FilmScreenMath::EvaluateStrip`) plays the reel across the giant gauze as a moving film strip: a 1.5 s leader, an 0.8 s eased slide and 4.0 s hold per print, and a final pull and 2.0 s dissolve.

```cpp
// Source/TheUnlitCut/Public/Film/FilmMath.h, lines 68-75
	/** Frame 0 retains the scene exactly as printed. A light and its shadow box must arrive together. */
	enum class EPrintStep : uint8 { Capture, KeptLightAndBox, RaysAndSound, PublishReel, PrepareNextPicture, Done };

	inline EPrintStep PrintStep(uint64 FramesSincePrint)
	{
		return FramesSincePrint < static_cast<uint64>(EPrintStep::Done)
			? static_cast<EPrintStep>(FramesSincePrint) : EPrintStep::Done;
	}
```

To verify packaged builds without human input, the `AgentRun` plugin plays 90 plain-text scripts in `Scripts/agent-runs/` via `Scripts/run-agent.sh` (`-AgentRun -AgentScript=<name> -windowed`). Inside the game, `AgentRun` drops physical input and sends virtual pointer and key events straight to Slate widget handlers, so background runs never steal the developer's mouse, keyboard, or window focus. `Scripts/s1/check_run.py` judges `#log`, `#nolog`, `#logbetween`, `#expect` (against `Unlit.Dump` states), and screenshot luminance rules (`#black`, `#bright`, `#differs`).

![The agent test loop](../images/33-diagram-agent-tests.jpg)
*The agent test loop, from text script and run-agent.sh to the packaged game with virtual input, log lines, screenshots, and #log or #expect checks that match build-independent tags (the sample numbers are illustrative).*

In Development builds, `GetActorNameOrLabel()` returns the editor label, whereas in Shipping `ACTOR_HAS_LABELS` is off and it returns the internal object name. To keep checks identical across configurations, `build_act1_level.py` bakes a cooked `Zone_<name>` tag onto every framing zone that `DescribeState()` logs as `zone=`. With a Shipping soak variant that routes `UE_LOG` lines to a result file, the same test scripts verify Development packages and the Shipping soak package.

```cpp
// Source/TheUnlitCut/Private/Framing/FramingZone.cpp, lines 463-473
	// frame= is the editor label in Development but the object name in Shipping (ACTOR_HAS_LABELS); zone= comes
	// from the cooked Zone_<name> tag the level script gives every zone, the same in every configuration and
	// through rebuilds, so checks match on zone=. The print line ("<name> printed: <state>") carries it too.
	FString ZoneTagName(TEXT("none"));
	for (const FName ZoneTag : Tags)
	{
		const FString TagText = ZoneTag.ToString();
		if (TagText.StartsWith(TEXT("Zone_"))) { ZoneTagName = TagText.RightChop(5); break; }
	}
	return FString::Printf(TEXT("frame=%s zone=%s coverage=%.2f held=%.2f phase=%s hold=%.2f near=%d fade=%.2f burn=%.2f running=%d"),
		*GetActorNameOrLabel(), *ZoneTagName, Coverage, State.HeldSeconds, *PhaseText, GetHoldCoverage(), bPawnNear ? 1 : 0, DisplayedFade, DisplayedBurn, State.Phase == EFramingPhase::Holding ? 1 : 0);
```

![A contact sheet from one automated run of the full course in the packaged game](../images/14-qa-course-sheet.jpg)
*A contact sheet from one automated run of the full course in the packaged game.*

## How we worked

Team YILUN LAB is two people, a creative lead and lighting artist and an engine-integration lead. AI role sessions worked alongside us, messaged one another, and tracked tasks in `Saved/Queue/*.md`. PM-Producer set priorities and wrote the QA and Windows briefs; Game-Designer wrote the specs, dialogue tables, level drawings, audio pipeline, and devlog; Art-Director managed meshes, materials, layouts, and fonts; and Programming-Lead owned C++, builds, packaging, and commits. On Day 3 at about 11:20 we split that role into Tech-Art-Lead (arms, shaders, Lumen, near light) and a new Programming-Lead (editor, packaging, Shipping, Windows, checks), joined by QA-Build and Programming-Lead-Remote on a Mac mini M4 Pro, Win-Build on our Windows PC, and PM-Intern. After two sessions collided on the editor on Day 3, `host-lock.sh` serialized all editor, build, and packaging runs.

Claude Code and Claude Opus subagents ran the role sessions, drove Unreal Engine 5.8 over Epic's experimental MCP server, wrote the early C++ systems, and wrote headless Blender and Python texture scripts. Codex CLI and GPT Image wrote C++ feature and UI code in git worktrees and generated the gauze mural, five opening storyboard frames, brick wall texture, and hanging-card menu assets. Tripo Studio and Meshy AI generated the 3D meshes, and those used in the game were cleaned and decimated in Blender. ElevenLabs and ffmpeg produced the voice, sound effects, and music, while Antigravity CLI (`agy`) edited in-game copy, hints, stage names, and video captions.

## What's next

Before submission, we still need to launch and play the final Windows candidate by hand, judge the in-game audio mix and mouse-look feel, review the darker opening frames, and record the gameplay trailer from `TRAILER_SHOTLIST.md`. On macOS, our signing scripts (`7be48a1`) and `docs/submission/README_Mac.txt` wait on a paid Apple Developer certificate for notarisation. For post-jam work, we have queued an upper-body skeleton for the first-person hands, the flashlight-only hand form in the prologue, the fuller flickering EXIT sign sequence, and the unmerged caustic reflector study (`origin/codex/reflector-light-2026-11-14`).

## Appendix: the four days at a glance

- Nov 12 (Day 1): We write the one-page GDD, assemble the moodboard, and generate 41 prop meshes.
- Nov 12, evening: The Stage 1 light toy runs in the test level, passing 10 headless tests.
- Nov 13 (Day 2): We build the hollow optical box, paint the gauze mural, and assemble Act 1.
- Nov 13, evening: Voice and music are wired in, and we lower the gauze warmth threshold.
- Nov 13, night: Window light memory, film-strip screening, and 200 hanging stars land by dawn.
- Nov 14 (Day 3): We add `host-lock.sh`, generate the opening storyboard frames, and refine the first-person arms.
- Nov 14, night: We enclose the stage in a 273-piece theatre shell and integrate the start menu.
- Nov 15 (Day 4): We add the world-gone starry void, redraw the opening frames, and pass Shipping checks.
