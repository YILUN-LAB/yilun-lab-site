# The Unlit Cut: an illustrated development log

*The Unlit Cut* is a first-person light sandbox built in Unreal Engine 5.8 by team YILUN LAB during the four-day 2026 Epic AI MegaJam. Holding a flashlight and a cut-paper gobo box, you step onto the dark, scrapped sets of a halted film shoot. By warming or cooling your beam and sliding the lamp into the box, you open painted stage gauze, project a paper skyline, and print your own frames.

## Inspiration

Our creative lead works professionally as a lighting artist and designer, so the project began with a single question: what kind of game could grow out of real lighting craft, using reflection, transmission, stage gauze, a flashlight, and a few reflective materials? When the jam opened at 23:00 on November 11 with the theme *Director's Cut*, we read it as a question of power. In cinema, the director's scissors decide what is worth showing; in our game, the player is the lighting artist who walks back onto the dark stage to light the corners that were cut. Each lit composition is printed as a film frame, and the reel screened at the end is your own *Lighting Artist's Cut*.

![An early idea sketch: a lighting artist on the dark stage, the beam through a cut-paper box opening the gauze](../images/35-inspiration-sketch.jpg)
*An idea sketch made with GPT Image from our moodboard: the beam passes through the cut-paper box, and where it is warm the gauze opens.*

![One opening storyboard frame generated with GPT Image: the first version and the darker old-film version](../images/12-intro-frame-old-and-dark.jpg)
*One opening storyboard frame generated with GPT Image: the first version (left) and the darker old-film version (right).*

We set the story in November 1994 in Soho, London, inside a basement black-box rehearsal room in a converted Victorian warehouse on the night the shoot was stopped. An opening storyboard of five frames introduces the hall. We generated those five frames on Day 3 as pencil line and pale watercolour inside a 35 mm border, and redrew them on Day 4 in a darker 1.375:1 old-film ratio. Props on the set tell that story before any line is spoken: a notice that the shoot is cancelled and a budget statement. The game has only two characters: the director, Julian Vance, and the lighting artist played by the player.

![Period props made for the set: a notice of cancellation and a budget statement](../images/18-cancellation-notices.jpg)
*Period props made for the set: a notice of cancellation and a budget statement.*

We wrote the one-page GDD at 00:45 on November 12, assembled the moodboard between 00:57 and 11:20, drafted the story copy at 20:15, and wrote full GDD versions 1.0 to 1.6. Eight named design principles guided our choices: *light is the protagonist*, *warmth lands in corners*, *immersion, not puzzles*, *the ending should move people*, *it has to be a game*, *the time and place should read at a glance*, *the lighting artist is not someone picking up scraps*, and *props must not look too old*.

## Design

Three spatial ideas turn our lighting toy into a playable game: colour temperature changes physical space, projections become real space, and transitions happen directly in the theatre without black screens. The game has no hard puzzles, fail state, timer, or combat, and people appear only as silhouettes and shadows, with the first-person hands as the single exception.

![Diagram of one play-through of The Unlit Cut](../images/22-diagram-play-flow.jpg)
*Diagram of one play-through: start screen, opening, prologue, Act 1 (wall, alley), optional encore, small plaza, finale, and the obedience ending if you walk out before the first print.*

Our first prototype on the night of November 12 tested the premise in a single room. When we playtested that Stage 1 build on November 13, we locked in the rule that *"the projection becomes real"*, a tribute to *Gorogoa*, and required that sliding the flashlight into the box must fill the wall ahead.

![An early prototype frame: a projected paper-city pattern on a dark stage, the lamp and the box in the foreground](../images/01-first-paper-city.jpg)
*An early prototype frame: a projected paper-city pattern on a dark stage, the lamp and the box in the foreground.*

Under cold light, a stage gauze curtain is a solid barrier. When you scroll the mouse wheel to warm the flashlight, the gauze where the warm beam lands turns transparent and you can walk right through it. After two automated blind playtests on Day 2, we lowered the warmth threshold everywhere from 0.85 to 0.65 and added a warm gold glow beneath the prologue curtain.

![The colour-temperature test: the same stage under the cold and the warm end of the flashlight](../images/02-gauze-warm-cold.jpg)
*The colour-temperature test: the same stage under the cold end (left) and the warm end (right) of the flashlight.*

![Warm light opening a hole in the gauze so the stage behind shows through](../images/23-gauze-pass-through.jpg)
*Warm light opens a hole in the gauze; the stage behind shows through and you can walk in.*

In the prologue, you begin on the dark stage while Julian Vance's voice tells you not to touch the flashlight and to leave by the green EXIT. If you obey the director and walk 120 cm into the open black passage beneath the EXIT sign before printing your first frame, the run ends with *"Sensible choice..."* and a *Director's Cut* card. Once you make your first print, the exit closes, and finishing the course screens your prints in the finale before ending on *THE LIGHTING ARTIST'S CUT*.

![An early look at the prologue: lamp and box in hand on a dark stage, with an on-screen narration line](../images/03-prologue-first-look.jpg)
*An early look at the prologue: lamp and box in hand on a dark stage, with an on-screen narration line.*

Passing through the prologue curtain brings you to Act 1, *London Skyline*. Left-clicking slides the right-hand lamp into the window-cut gobo box so its skyline projection lands across a painted gauze wall where the director's red viewfinder hangs in space. When you fill the viewfinder with warm light and hold for 3 seconds, a camera flash fires, the composition prints as Frame 1, the gauze wall dissolves, and the flat projection rises into a three-dimensional paper alley from near to far over 3 seconds. A second viewfinder at the far gauze prints Frame 2 and opens the way to the small plaza.

![A contact sheet from an automated check of Act 1, including the moment a frame is printed and the SCRAPPED stamp](../images/04-act1-print-sheet.jpg)
*A contact sheet from an automated check of Act 1, including the moment a frame is printed and the SCRAPPED stamp.*

In our Day 2 builds, the paper-city alley ran straight ahead. On Day 3 we reshaped the street with a bend in the alley closed by an arched facade, and tucked a side room into the corner for an optional encore.

![The plan for the bend in the alley and the side room of the encore](../images/21-bend-plan.jpg)
*The plan for the bend in the alley and the side room of the encore.*

![The bend in the alley and the side room in the game](../images/24-side-room-in-game.jpg)
*The same places in the game: the bend in the alley (left) and the side room, with the ballet figure's shadow framed on the backdrop (right).*

We built two versions of that side room on Day 3. In the afternoon we made *"Extra Number 47"*, placing a 20 cm ballet figurine on a chalk mark. That evening we adapted the curved reflective film from Act 2 of our story script for an optional encore called *"The Cut Door"*. Holding warm light close to the 30 cm curved reflective film bends two arcs of light until they lock into an "eye of light" inside a door-frame viewfinder. In Round 24, the eye material failed to compile during packaging and shipped as a white blob, so we fixed the shader and made `package.sh` fail whenever a material fails to compile.

![The Cut Door encore: the light eye before and after the fix](../images/10-door-light-eye.jpg)
*"The Cut Door" encore: the light eye before (a white blob) and after the fix.*

After five auditions in ElevenLabs (`eleven_v4`), we gave Julian Vance a *"British Theatrical"* voice with performance tags for pauses, breaths, sighs, raised voice, and whispers, paired with two music beds (`eleven_music_v2_5`) that crossfade with colour temperature. During playtesting we cut *"Scene Four."* from the fourth line, and re-recorded the first line to say *"the editing table"* so no brand names appeared.

On the last afternoon we tuned the course from playtests (subject to the final build). The fifth opening frame now speaks to the player in the second person, and the director's subtitles start with DIRECTOR:. The green EXIT sign blinks twice with a tube buzz when the director says *"take the green exit"*, and an obedient exit ends under a 1930s gramophone foxtrot. One scroll notch warms the lamp twice as much as before, so about seven notches open the prologue gauze. Quick camera turns no longer show the cut end of the left arm. Hints follow the area you are in before the main line, and nudge you to light the carousel and to look up at the stars. After the lights go out, looking up at the stars draws a line of wonder from the director. The finale screening starts only when you stand in front of the great gauze, and we cut the line *"Scene Twelve."* from the script.

## Art

Our one-line art direction was *"black-box light painting"*: painting with real light on cardboard models in a pitch-black small theatre where all colour comes from the player's light. On the Day 1 moodboard we adopted Direction B, *"Bling Bling"*: a black background, cream props, pearl iridescence, and sparse sparkle where light lands. On the prop boards we used old cream and warm grey surfaces with light wear and paper-tape repairs for our 3D models.

![Direction B moodboard frames next to the same moments in a late build](../images/26-direction-b-vs-package.jpg)
*We kept comparing builds with the direction B frames: the prologue, the paper city and the screening, moodboard on the left and the game on the right.*

![Options for the box's hole patterns, drawn by script](../images/16-box-pattern-options.jpg)
*Options for the box's hole patterns, drawn by script.*

Already on Day 1, Python and Blender scripts ray-cast the window gobo masks from the box model's recesses. On Day 2 we drafted hole-pattern options by script and built a hollow optical box that cast native shadows.

![Window gobo masks ray-cast from the box model's recesses, from sharp to soft](../images/17-window-gobo-masks.jpg)
*Window gobo masks ray-cast from the box model's recesses, from sharp to soft.*

Early playtests on Day 2 caught two visual problems: the cold light looked too blue, and Package B03 felt worn and flat. We corrected the look with a 5000 K cold end and a 3000 K warm end. Inside the paper city, the skyscraper windows use light memory: they light up only where the flashlight's beam touches them, shimmer while lit, and fade very slowly after the beam moves on.

![Inside the paper city under the warm beam: windows light up where the light lands](../images/05-city-windows.jpg)
*Inside the paper city under the warm beam: the windows light up where the light lands.*

For the Act 1 gauze wall, our first city projection looked too photographic, so we generated a stylised painted mural across three rounds with GPT Image and repainted its silhouette on Day 3 into a London skyline. After the player prints the first frame, the painted gauze wall keeps a faint afterglow around the open hole.

![Before and after: the painted gauze wall keeps a faint afterglow around the hole after printing](../images/06-mural-afterglow.jpg)
*Before and after: the painted gauze wall keeps a faint afterglow around the hole after printing.*

On the final morning, we graded the city's materials toward cream (mural saturation 0.55 and brightness 1.25).

When you step out of the paper alley into the small plaza, the gobo box sinks away and the flashlight transforms into a star-tipped magic wand. In the centre of the plaza stands a 2.8-metre toy carousel. The carousel starts pure white in the darkness; when the wand's beam touches it within 6 metres, it starts turning to a four-bar E-major waltz loop and warms from white through pastel into full colour.

![The toy carousel white when first lit, then pastel, then full colour](../images/07-carousel-white-to-colour.jpg)
*The toy carousel white when first lit, then pastel, then full colour, and up close among the horses.*

From the star at its tip, the wand casts a star-shaped spot.

![The carousel lit, with the wand in hand](../images/19-carousel-and-wand.jpg)
*The carousel lit, with the wand in hand.*

We split the wand's ribbon into its own material slot and added a star flare and a star trail that we tuned to taper cleanly.

![The wand's star trail before and after it was made to taper](../images/08-wand-trail.jpg)
*The wand's star trail before and after it was made to taper.*

Above the plaza and the finale hangs a canopy of 200 stars that wake within 8 metres of the beam and twinkle out of step. Early on Day 4 we added the world-gone moment, hiding the paper city and stage flats once out of view and replacing them with a street boundary, 290 lit void stars, and 260 soft blurred backdrop dots.

![The starry sky that replaces the city once the carousel is lit](../images/09-world-gone-stars.jpg)
*After the carousel is lit, the city is gone and the sky is full of stars.*

The game now ends on a closing screen our creative lead designed (subject to the final build): eight of the game's objects on a gold oval over blue velvet. The objects, the flashlight among them, float and move aside when the mouse comes near and light up under it, and the carousel turns.

![The closing screen as designed and in the game](../images/27-ending-design-vs-game.jpg)
*The closing screen: the design (left) and the same screen in the game (right).*

To make the 1994 Soho rehearsal hall read at a glance, we enclosed the stage in a 273-piece theatre shell with cream-painted brick walls and 11 set-dressing models. The notice of cancellation and the budget statement on the walls were drawn by script.

![A plan view of the basement theatre as built](../images/15-theatre-plan.jpg)
*A plan view of the basement theatre as built.*

On the start screen, we replaced our early plain-text layout with cardboard letter cards hanging on threads over a pure black void, lit by a flashlight beam that follows the mouse pointer.

![The start screen: the first plain text layout and the later menu with hanging letter cards](../images/11-start-screen-before-after.jpg)
*The start screen: the first plain text layout (left) and the later menu with hanging letter cards (right).*

For the first-person view, we generated 60 cm cream forearm sleeves and updated hand grips with Blender scripts, and added a thumb dial on the side and tail of the lamp so scrolling turns the dial while the wrist stays still.

![Close-up of the first-person hands before and after, lamp outside and inside the box](../images/13-arms-before-after.jpg)
*The hands before and after, with the lamp outside the box (top) and inside it (bottom).*

## Engineering

We split the game into three layers. At the bottom sit the rules: how warm light opens the gauze, how much of a viewfinder the beam covers, when a frame prints, how the finale reel moves. Each rule is a small C++ header of pure functions with no game world behind it, 31 of them in all, with their default tuning in plain data structs. Above them, a handful of C++ components on the player (flashlight, gobo box, film printer) and a C++ director per scene run the story. Blueprints are thin: an editor script generates them, and they only point at meshes, materials and tuning tables. Because the rules never need a running world, 279 automated tests check them in a headless editor in about a minute.

![Architecture: world-free rule headers under C++ components and actors](../images/34-diagram-architecture.jpg)
*Architecture: world-free rules at the bottom, C++ components and scene directors above them, thin Blueprints holding assets and tuning, Python editor scripts building the levels, and two test paths (headless tests on the rules, scripted runs of the packaged game).*

The levels are not built by hand either. Python scripts sent to the editor over MCP read a layout file and place every set piece, wall and viewfinder by name, so running the script again moves what is already there instead of piling up copies. That let the layout change many times a day (the bend in the alley, the side room, the theatre shell) without anyone dragging actors around.

The flashlight is the one source of truth for light. Every frame it eases its warmth toward the scroll-wheel setting and writes its lit cone and warmth into a material parameter collection that every material can read. When the lamp is inside the gobo box, that cone becomes the narrower projection cone leaving the box's patterned face. The gauze shader, the gauze's collision and the viewfinder all read the same cone, so what you see, what you can walk through and what counts as lit never disagree.

![One light, three readers: the flashlight writes its lit cone and warmth every frame](../images/32-diagram-flashlight-mpc.jpg)
*One light, three readers: the flashlight writes its lit cone and warmth every frame; the gauze's mask, the gauze's collision and the framing coverage all use the same cone.*

The gauze is a masked, two-sided material. For each pixel the shader measures how far along the beam it sits and how far off the beam's centre line, and opens a round hole whose radius grows with distance and never drops below 75 cm, with the outer 35% of the radius feathered. How open the hole is depends on warmth: nothing below 0.45, fully open at 0.65, with a smooth curve between. The shadow pass uses the same mask, so warm light really passes through the hole and lights the stage behind it. On the gameplay side, the gauze runs the same math after each frame and switches its collision off once transmission reaches 0.6, which is the moment you can step through. Printing a frame adds a second, permanent hole that keeps a faint afterglow at its edge.

![Gauze transmission against beam warmth](../images/30-diagram-gauze-warmth.jpg)
*Gauze transmission against beam warmth: smoothstep(0.45, 0.65) as shipped (dashed: the first 0.85 tuning), the walk-through level at 0.6, and the hole cut around the beam's ray.*

A viewfinder is a flat 320 by 180 cm frame covered by a 16 by 9 grid of 144 sample points. Each frame we test every point against the flashlight's cone (distance and angle only, no shadow rays) and count how many are lit. At 70% coverage a 3-second hold clock runs; between 50% and 70% it pauses; below 50% it resets. If you struggle, the target relaxes to 55% after 60 seconds and 40% after 120. When the clock completes, the game captures your view three times in the same frame so temporal effects settle, then spreads the rest of the work (the kept light, the rays and sound, adding the print to the reel) over the next four frames so the print never causes a hitch. In the finale, the reel plays across the giant gauze as a moving film strip, each print sliding in and holding for 4 seconds.

![A mock of the finale film strip, step by step](../images/28-film-strip.jpg)
*The mock we drew before building the finale strip: an empty leader, the prints sliding in one by one, the pull at the end and the final dissolve.*

![144 sample points on a 320 by 180 cm frame tested against a light cone](../images/31-diagram-framing-coverage.jpg)
*144 sample points on a 320 × 180 cm frame tested against a light cone, and the hold clock: run at ≥ 0.70, pause between 0.50 and 0.70, clear below 0.50, print after 3 s (the example cone and coverage trace are illustrative).*

To test the packaged game without a person at the keyboard, our AgentRun plugin plays 90 plain-text scripts. It ignores the real mouse and keyboard and feeds virtual input straight into the game's UI layer, so a test run in the background never takes over the developer's machine. A checker then reads the run's log lines, state dumps and screenshot brightness. Shipping builds strip editor labels from objects, so the level script stamps each viewfinder with a tag that survives packaging, and the same test scripts work on Development and Shipping builds. Another check measures every English and Chinese line of text with the game's own text layout and fails the run if anything overflows its box.

![The agent test loop](../images/33-diagram-agent-tests.jpg)
*The agent test loop, from text script to the packaged game with virtual input, log lines, screenshots, and checks that match build-independent tags (the sample numbers are illustrative).*

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
- Nov 15, afternoon: Playtest fixes, area-aware hints and the new closing screen go into the final candidate.
