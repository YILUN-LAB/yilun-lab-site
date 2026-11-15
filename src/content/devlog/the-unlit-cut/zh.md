# 《The Unlit Cut》：图文开发日志

*The Unlit Cut* 是 YILUN LAB 团队在 2026 Epic AI MegaJam 四天开发期内，用 Unreal Engine 5.8 制作的第一人称光影沙盒游戏。你一手拿着手电筒，一手托着剪纸遮光片盒（gobo box），走上电影停拍后黑暗废弃的布景舞台。通过调暖或调冷光束、把灯推进盒子里，你可以打开彩绘舞台纱幕、投出纸城天际线，冲印出自己的画面。

## 灵感

我们的创意负责人本身是职业灯光艺术家与设计师，因此项目始于一个问题：只用反射、透射、舞台纱幕、一把手电筒和几种反光材质，真正从灯光手艺出发能做出什么样的游戏？11 月 11 日 23:00 比赛公布主题 *Director's Cut*（导演剪辑版）时，我们把它看作一个关于话语权的问题。电影里，导演的剪刀决定什么值得被看见；在我们的游戏里，玩家扮演灯光师，重返黑暗舞台，照亮那些被剪掉的角落。每一幅布好光的构图都会冲印成一格胶片，终幕放映的那盘胶卷就是你自己的 *Lighting Artist's Cut*（灯光师剪辑版）。

![用 GPT Image 生成的一张开场分镜：初版与更暗的老电影版本](../images/12-intro-frame-old-and-dark.jpg)
*用 GPT Image 生成的一张开场分镜：初版（左）与更暗的老电影版本（右）。*

我们把故事定在 1994 年 11 月的伦敦 Soho 区，地点是一座维多利亚老仓库改建的地下黑匣子排练厅，时间正是剧组停拍当晚。开场用五张分镜介绍这座排练厅。我们在第 3 天生成了这五张 35 mm 画框内的铅笔淡彩分镜，又在第 4 天重绘成色调更暗的 1.375:1 老电影画幅。游戏只有两个角色：导演 Julian Vance，以及玩家扮演的灯光师。

![地下剧场实际搭建的平面图](../images/15-theatre-plan.jpg)
*地下剧场实际搭建的平面图。*

我们在 11 月 12 日 00:45 写完一页纸 GDD，00:57 至 11:20 整理好情绪板，20:15 起草剧情文案，并陆续写出完整 GDD 1.0 至 1.6 版。我们按八条设计原则做取舍：*光即主角*、*暖意落在角落*、*重沉浸，轻解谜*、*结局要打动人*、*必须好玩像个游戏*、*年代与地点一眼可辨*、*灯光师绝非捡破烂的人*，以及*道具不能旧过头*。

## 设计

三个空间点子把这套灯光玩具变成了可玩的游戏：色温改变物理空间，投影化为真实空间，转场直接在剧场内完成、全程不黑屏。游戏没有硬核解谜、失败判定、计时器或战斗；除第一人称双手这一处例外，人物全都只以剪影和影子出现。

![The Unlit Cut 单局完整流程图](../images/22-diagram-play-flow.jpg)
*单局完整流程图：标题画面、开场、序幕、第一幕（纱幕墙、小巷）、可选加演、小广场、终幕，以及在首次冲印前直接离开触发的顺从结局。*

11 月 12 日晚上的首个原型在一个单间里验证了核心构想。11 月 13 日试玩这个 Stage 1 版本后，我们敲定了*“投影成真”*这条规则，向 *Gorogoa* 致敬，并要求手电筒推进盒子后投出的画面必须铺满正前方的整面墙。

![早期原型画面：黑暗舞台上投出的纸城图案，前景是手电筒和遮光片盒](../images/01-first-paper-city.jpg)
*早期原型画面：黑暗舞台上投出的纸城图案，前景是手电筒和遮光片盒。*

冷光照射下，舞台纱幕是一道实体屏障。滚动鼠标滚轮调暖手电筒色温后，暖光落点处的纱幕会变透明，玩家可以直接穿过去。第 2 天跑完两轮自动化盲测后，我们把全局暖度阈值从 0.85 调低到 0.65，并在序幕纱幕下方加了一抹暖金色微光。

![暖光打开纱幕与冷光被纱幕挡住](../images/02-gauze-warm-cold.jpg)
*暖光打开纱幕（左）与冷光被纱幕挡住（右）。*

序幕开始时，你站在黑暗的舞台上，Julian Vance 的声音叮嘱你别碰手电筒，直接从绿色 EXIT 离开。如果你顺从导演，在冲印第一格画面前走入 EXIT 标志下方敞开的黑色通道达 120 cm，本局就会以一句 *"Sensible choice..."*（“明智的选择……”）和一张 *Director's Cut* 字幕卡结束。一旦你完成首次冲印，出口便会关闭；走完全程后，终幕会放映你冲印的所有画面，最后停在 *THE LIGHTING ARTIST'S CUT* 字幕上。

![序幕早期画面：手持电筒与遮光片盒站在黑暗舞台上，屏幕下方显示旁白字幕](../images/03-prologue-first-look.jpg)
*序幕早期画面：手持电筒与遮光片盒站在黑暗舞台上，屏幕下方显示旁白字幕。*

穿过序幕纱幕就进入第一幕 *London Skyline*（伦敦天际线）。按下鼠标左键，右手的手电筒会滑入镂空窗户图案的遮光片盒（gobo box），把天际线投影打在彩绘纱幕墙上，导演留下的红色取景框正悬在半空。用暖光填满取景框并保持 3 秒，相机闪光灯亮起，当前构图冲印为 第 1 格（Frame 1），纱幕墙随即消融，平面投影在 3 秒内由近及远升起，变成一条三维纸艺小巷。远端纱幕处的第二个取景框会冲印出 第 2 格（Frame 2），并打开通往小广场的路。

![第一幕自动化检查生成的缩略图样张，包含画面冲印瞬间与 SCRAPPED 印章](../images/04-act1-print-sheet.jpg)
*第一幕自动化检查生成的缩略图样张，包含画面冲印瞬间与 SCRAPPED（废弃）印章。*

第 2 天的版本里，纸城小巷还是一条笔直通道。第 3 天我们重做了街道布局，让小巷拐了个弯，尽头用拱门立面封住，并在转角处藏进一间侧室，作为可选的加演关卡。

![小巷弯道与加演侧室的平面设计图](../images/21-bend-plan.jpg)
*小巷弯道与加演侧室的平面设计图。*

第 3 天我们为这间侧室做了两个版本。下午做的是 *"Extra Number 47"*（47 号群演），在粉笔标记处放了一尊 20 cm 高的芭蕾人偶。当晚我们把剧情剧本第二幕里的弧形反光膜改造成名为 *"The Cut Door"*（被剪掉的门）的可选加演。把暖光凑近 30 cm 的弧形反光膜，两道弧光会弯曲收拢，在门框取景框内扣合成一只“光之眼”。第 24 轮打包时，光之眼材质编译失败，打出来的包里变成一团白块；我们修复了着色器，并把 `package.sh` 改成只要有任何材质编译失败就直接报错退出。

![The Cut Door 加演关卡：修复前后的光之眼](../images/10-door-light-eye.jpg)
*"The Cut Door" 加演关卡：修复前（一团白块）与修复后的光之眼。*

在 ElevenLabs（`eleven_v4`）试听五版声线后，我们为 Julian Vance 选定了 *"British Theatrical"*（英式戏剧腔）声线，配上停顿、呼吸、叹气、提高音量和耳语等表演标签，并搭配两轨随色温交叉淡入淡出的背景音乐（`eleven_music_v2_5`）。试玩调整时，我们删掉了第四句台词里的 *"Scene Four."*（“第四场。”），并重录了第一句台词，把剪辑台统一说成 *"the editing table"*，避免出现任何品牌名称。

## 美术

我们的一句话美术方向是*“黑匣子光绘”*：在全黑的小剧场里，用真实灯光在纸板模型上作画，所有色彩都来自玩家手中的光。第 1 天的情绪板上，我们选定了方向 B *"Bling Bling"*：纯黑背景、奶油色道具、珍珠虹彩，以及光束落点处稀疏的星点闪烁。道具设定板上，3D 模型采用旧奶油色与暖灰表面，带有轻微磨损和纸胶带修补痕迹。

![由脚本绘制的遮光片盒镂空图案方案](../images/16-box-pattern-options.jpg)
*由脚本绘制的遮光片盒镂空图案方案。*

早在第 1 天，Python 与 Blender 脚本（`Scripts/s1/gobo_depth.py` 和 `gobo_textures.py`）就通过光线投射，从盒子模型的凹槽生成了窗户遮光片遮罩。第 2 天我们用脚本（`Scripts/s2/box_patterns.py`）绘制了多版镂空图案方案，并做出能投射原生阴影的中空光学盒。

![从盒子模型凹槽光线投射生成的窗户遮光片遮罩，从锐利到柔和](../images/17-window-gobo-masks.jpg)
*从盒子模型凹槽光线投射生成的窗户遮光片遮罩，从锐利到柔和。*

第 2 天的早期试玩暴露出两个视觉问题：冷光偏蓝过重，同时 Package B03 显得陈旧灰平。我们把色温两端修正为冷光 5000 K、暖光 3000 K。纸城内部，摩天楼的窗户带有光记忆效果：只有手电筒光束扫过的地方才会亮起，点亮时微微闪烁，光束移开后极其缓慢地暗下去。

![纸城窗户光效的三张截图](../images/05-city-windows.jpg)
*纸城窗户光效的三张截图：刚冲印完成、约 30 秒后，以及遮光片盒光束重新照回中央。*

第一幕的纱幕墙上，初版城市投影照片感太强，于是我们用 GPT Image 经过三轮迭代生成了风格化手绘壁画，并在第 3 天把它的剪影重绘成伦敦天际线。玩家冲印出第一格画面后，彩绘纱幕墙会在敞开的破洞边缘留下一圈微弱余晖。

![修改前后对比：冲印后彩绘纱幕墙在破洞周围留下一圈微弱余晖](../images/06-mural-afterglow.jpg)
*修改前后对比：冲印后彩绘纱幕墙在破洞周围留下一圈微弱余晖。*

最后一天的早上，我们把城市材质整体往奶油色调校（壁画饱和度 0.55、亮度 1.25），并对比了光束扫过纸艺立面时的效果。

![光束扫过纸城内部：最后一天调色时两版城市材质的对比](../images/20-city-sweep-before-after.jpg)
*光束扫过纸城内部：最后一天调色时两版城市材质的对比。*

当你走出纸艺小巷踏入小广场，遮光片盒会向下收起，手电筒化作一根顶端带星的魔法棒。广场中央立着一座 2.8 米高的玩具旋转木马。黑暗中旋转木马起初是纯白色的；当你在 6 米内用魔法棒的光束照向它，木马便伴随四小节 E 大调华尔兹循环乐句转动起来，由纯白经粉彩渐渐晕染成全彩。

![玩具旋转木马初照亮时呈纯白，随后转为粉彩，最后变为全彩](../images/07-carousel-white-to-colour.jpg)
*玩具旋转木马初照亮时呈纯白，随后转为粉彩，最后变为全彩。*

魔法棒顶端的五角星会投出一个星形光斑，里面带着我们的灯光师在 2021 年 10 月拍摄的一张蓝红光影照片。

![手持魔法棒照亮旋转木马](../images/19-carousel-and-wand.jpg)
*手持魔法棒照亮旋转木马。*

我们把魔法棒的丝带拆成独立材质槽（`SM_MagicWand_02`），加上星芒辉光和星光拖尾，并把拖尾末端调校得干净利落地收尖。

![魔法棒星光拖尾做成收尖效果前后的对比](../images/08-wand-trail.jpg)
*魔法棒星光拖尾做成收尖效果前后的对比。*

小广场与终幕上方悬着由 200 颗星星组成的星幕，星星在光束靠近到 8 米内时苏醒，并错落闪烁。第 4 天一早，我们加入了“世界退场”时刻：当纸城与舞台景片移出视野后便将其隐藏，替换为街道边界、290 颗点亮的虚空星星，以及 260 个柔和虚化的背景光点。

![点亮旋转木马后回头望去：城市已经消失，只剩漫天繁星](../images/09-world-gone-stars.jpg)
*点亮旋转木马后回头望去：城市已经消失，只剩漫天繁星。*

为了让 1994 年 Soho 排练厅的气息一眼可辨，我们用 273 个构件搭起剧场外壳把舞台围合起来，配以奶油色涂漆砖墙（`T_HouseWall_BaseColor`）、11 个置景模型，以及由脚本（`Scripts/s2/ui_drafts.py`）生成的停拍通知与预算报表。

![为布景制作的年代感道具：停拍通知与预算报表](../images/18-cancellation-notices.jpg)
*为布景制作的年代感道具：停拍通知与预算报表。*

标题画面上，我们换掉了早期的纯文本排版，改为在纯黑虚空中用细线悬挂的纸板字母卡，由一束跟随鼠标指针移动的手电筒光束照亮。

![标题画面：初版纯文本排版与后来的悬挂字母卡菜单](../images/11-start-screen-before-after.jpg)
*标题画面：初版纯文本排版（左）与后来的悬挂字母卡菜单（右）。*

针对第一人称视角，我们通过 Blender 脚本（`build_forearm_hands.py`）生成了 60 cm 长的奶油色小臂衣袖并更新了手部握姿，还在手电筒侧面与尾部加上了拇指拨轮（`SM_WarmthDial_02`），这样滚动滚轮时手腕保持不动，只转动拨轮。

![第一人称手臂与手电筒在盒子外与盒子内的修改前后对比](../images/13-arms-before-after.jpg)
*第一人称手臂与手电筒在盒子外与盒子内的修改前后对比。*

## 工程

我们的项目规范（`AGENTS.md` 第 9 条）最初划分由 C++ 负责系统与数学计算，蓝图负责流程、视觉与参数配置。实际开发中，我们把包括场景流程在内的几乎所有逻辑都推进了 C++ 和 Python 编辑器脚本，这样无需手动打开 `.uasset` 文件就能直接测试规则。每一条玩法规则都先写成不依赖 `UWorld` 的纯 `inline` 函数头文件，分布在 31 个 `*Math.h` 和 `*Rules.h` 头文件中（`GauzeMath`、`FramingMath`、`FilmMath`、`FilmScreenMath`、`LightToyMath`、`FirstPersonPoseMath`、`EndingRules`、`EyeRules`、`MenuRules`、`GuidanceRules`），默认调参数据则放在纯 `USTRUCT` 类型里（`FGauzeTuning`、`FFramingTuning`、`FFilmRailTuning`）。`ALightArtistCharacter` 挂载 `UFlashlightComponent`、`UGoboBoxComponent`、`UFilmPrinterComponent` 和 `UDailiesComponent`，而 C++ 导演类（`APrologueDirector`、`AActDirector`、`AFinaleDirector`）配合 `AUnlitGameMode`、`AUnlitPlayerController` 和 `AUnlitHUD` 驱动剧情。代码库里一个 `BlueprintImplementableEvent` 钩子都没有；蓝图只是由 `Scripts/editor/s2_act1/build_act1_blueprints.py` 生成的薄子类，仅用于绑定资产和数据表。

通过 MCP（`execute_tool_script`）发送的 Python 脚本负责构建关卡和材质。`build_act1_level.py` 根据 `act1_city_layout.json` 及叠加 JSON 文件摆放 `L_Act1`，按标签匹配 Actor，因此重复运行时会就地移动已有 Actor，同时挂上 `Zone_<label>` 标签并连好 `framingZone` 等引用。运行时，各模块通过 `MPC_Flashlight` 共享着色器状态，并通过动态委托（`AFramingZone::OnPrinted` 绑定到 `AActDirector::HandleZonePrinted`、`UFilmReelSubsystem::OnPrintAdded`、`AFilmScreen::OnFinished`）传递玩法事件。由于规则头文件不依赖世界上下文，`Source/TheUnlitCut/Private/Tests/` 下的 279 个自动化测试可以直接在无头编辑器中运行（通过带 `-nullrhi` 的 `Scripts/run-tests.sh`，少数需要字体的测试则用 `UNLIT_TEST_RHI=offscreen`）。文本排版适配在打包后的游戏中检查：`Unlit.TextFit` 会用 Slate 的 `FSlateTextLayout` 测量每一条中英文剧情字符串，一旦出现溢出，agent 脚本就会报错失败。

![架构图：C++ 组件与 Actor 底层的无世界依赖规则头文件](../images/34-diagram-architecture.jpg)
*架构图：C++ 组件与 Actor 底层的无世界依赖规则头文件、驱动流程的 C++ 导演类、承载资产与参数的薄蓝图、构建关卡与材质的编辑器 Python 脚本，以及两条测试路径（无头自动化测试；打包游戏上的 AgentRun）。*

从纱幕能看出着色器、碰撞和玩法怎样保持一致。每一帧，`UFlashlightComponent::TickComponent` 都会让光束暖度平滑过渡向滚轮目标值（每格滚轮 `0.10`），并调用 `Apply()` 更新聚光灯，同时把 `BeamOrigin`、`BeamDirection`、`BeamTanOuter`、`BeamOn`、`BeamWarmth`、`BeamColor`、`BeamIntensity`、`ReactiveAmount`、`BeamInBox` 和 `CityReveal` 写入 `MPC_Flashlight`。这些光锥参数来自 `GetLitCone()`；当手电筒处于遮光片盒内时，该光锥就是从盒子镂空正面射出、上限 60 度的 `LightToyMath::ProjectionCone`。

![一束光，三处读取：手电筒每帧将照明光锥与暖度写入 MPC_Flashlight](../images/32-diagram-flashlight-mpc.jpg)
*一束光，三处读取：手电筒每帧将照明光锥与暖度写入 MPC_Flashlight；M_Gauze 的遮罩、纱幕碰撞与取景覆盖率全都共用同一个光锥。*

`M_Gauze` 是开启了 `ditherOpacityMask = True` 的双面 `BLEND_Masked` 材质；阴影通道会遵循该遮罩，因此暖光能物理穿过纱幕上的洞。它的 Custom HLSL 节点（"S04"）测量每个像素沿光束方向的距离与横向偏移，计算破洞半径（`HoleRadiusScale = 0.9`，`MinHoleRadius = 75` cm），在外围 35% 区域（`EdgeSoftness = 0.35`）做 `smoothstep` 羽化，再用 `smoothstep(WarmthSolid, WarmthOpen, Warmth)` 在 `0.45` 到 `0.65` 之间缩放透光率（`add_print_hole.py` 则把这个实时光洞与冲印后留下的常驻破洞 `PHole * saturate(PrintOpen)` 合并）。在 `TG_PostUpdateWork` 阶段，`AGauzeScreen` 用同一套数学公式计算 `GauzeMath::IsPassable`，一旦透光率达到 `PassTransmission = 0.6` 就关闭阻挡碰撞。

![纱幕透光率与光束暖度的关系](../images/30-diagram-gauze-warmth.jpg)
*纱幕透光率与光束暖度的关系：最终出货采用的 smoothstep(0.45, 0.65) 曲线（虚线为最初 0.85 的调参）、0.6 的可穿行阈值，以及围绕光束射线裁出的破洞。*

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

每个 `AFramingZone` 都是一个 320 × 180 cm 的平面矩形。在 `BeginPlay` 时，`FramingMath::BuildSamples` 会在该矩形上布置 16 × 9 的网格中心点，共计 144 个世界空间采样点。每一帧，`FramingZone.cpp` 都会用手电筒的 `GetLitCone()` 检测每个采样点（`FramingMath::IsLit`，只检查射程与光锥角度，不做阴影或遮光片光线投射），再把照亮的点数除以 144。

![320 × 180 cm 画框上的 144 个采样点与照明光锥的检测示意](../images/31-diagram-framing-coverage.jpg)
*320 × 180 cm 画框上的 144 个采样点与照明光锥（示例光锥）的检测示意，以及保持计时器逻辑：覆盖率 ≥ 0.70 时计时累加，介于 0.50 与 0.70 之间时暂停，低于 0.50 时清零，满 3 s 触发冲印（图中的示例光锥与覆盖率曲线仅作示意）。*

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

`FramingMath::Advance` 驱动着 3.0 秒的保持计时器：覆盖率达到或超过 `HoldCoverage = 0.70` 时计时推进；介于 `0.50` 与 `0.70` 之间时暂停；低于 `ClearCoverage = 0.50` 时归零。如果允许计时内迟迟未完成冲印，所需覆盖率会在 60 秒后放宽到 `0.55`，120 秒后放宽到 `0.40`。冲印画面时，`UFilmPrinterComponent::PrintWithScene` 会用 `USceneCaptureComponent2D` 把玩家视角捕获到一张 1920 × 1080 的渲染目标上，并在同一帧内执行 `1 + WarmUpCaptures`（即同帧连续捕获三次），让时域效果稳定下来。`FilmMath::PrintStep` 把后续工作分摊到接下来的四帧里完成，最后把冲印相片发布给 `UFilmReelSubsystem` 和 `AFilmRail`。到了终幕，`AFilmScreen`（`FilmScreenMath::EvaluateStrip`）会在巨幅纱幕上把整盘胶卷作为移动胶片条播放出来：先是 1.5 s 片头引带，每张冲印画面做 0.8 s 缓动滑入并停留 4.0 s，最后拉出胶片并在 2.0 s 内消融。

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

为了在无人值守的情况下验证打包版本，`AgentRun` 插件会通过 `Scripts/run-agent.sh`（`-AgentRun -AgentScript=<name> -windowed`）回放 `Scripts/agent-runs/` 下的 90 个纯文本脚本。在游戏内部，`AgentRun` 会屏蔽物理输入，直接把虚拟鼠标指针与按键事件发给 Slate 控件处理器，因此后台跑测试时不会抢开发者的鼠标、键盘或窗口焦点。`Scripts/s1/check_run.py` 负责校验 `#log`、`#nolog`、`#logbetween`、`#expect`（比对 `Unlit.Dump` 状态）以及截图亮度规则（`#black`、`#bright`、`#differs`）。

![自动化 agent 测试闭环](../images/33-diagram-agent-tests.jpg)
*自动化 agent 测试闭环：从文本脚本与 run-agent.sh 到接收虚拟输入的打包游戏，产出日志行与截图，再通过匹配跨构建配置一致标签的 #log 或 #expect 规则完成校验（图中示例数字仅作示意）。*

在 Development 构建中，`GetActorNameOrLabel()` 返回编辑器标签；而在 Shipping 构建中，`ACTOR_HAS_LABELS` 被关闭，该函数会返回内部对象名。为了让校验在不同构建配置下完全一致，`build_act1_level.py` 会在每个取景区域上烘焙一个可打包的 `Zone_<name>` 标签，由 `DescribeState()` 以 `zone=` 输出到日志。配合把 `UE_LOG` 行重定向到结果文件的 Shipping soak 变体包，同一套测试脚本可以同时验证 Development 包与 Shipping soak 包。

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

![打包游戏中单次全流程自动化跑测生成的截图样张](../images/14-qa-course-sheet.jpg)
*打包游戏中单次全流程自动化跑测生成的截图样张。*

## 我们怎么协作

YILUN LAB 团队由两个人组成：一位创意负责人兼灯光师，以及一位引擎整合负责人。多个 AI 角色会话与我们并肩工作，彼此收发消息，并在 `Saved/Queue/*.md` 中追踪任务。PM-Producer 制定优先级并撰写 QA 与 Windows 任务简报；Game-Designer 编写设计规格书、台词表、关卡图纸、音频管线与开发日志；Art-Director 管理网格体、材质、场景布局与字体；Programming-Lead 负责 C++、编译、打包与代码提交。第 3 天 11:20 左右，我们把程序角色拆分为 Tech-Art-Lead（手臂、着色器、Lumen、近景补光）和新的 Programming-Lead（编辑器、打包、Shipping、Windows、自动化校验），同时在另一台 Mac mini M4 Pro 上接入了 QA-Build 与 Programming-Lead-Remote，在我们的 Windows PC 上接入了 Win-Build，另外还加入了 PM-Intern。第 3 天发生两个会话同时操作编辑器的冲突后，我们引入 `host-lock.sh`，把所有编辑器操作、编译和打包任务全部串行化。

Claude Code 与 Claude Opus 子代理运行着各个角色会话，通过 Epic 的实验性 MCP 服务器驱动 Unreal Engine 5.8，编写了早期 C++ 系统，并写出了无头 Blender 与 Python 贴图生成脚本。Codex CLI 与 GPT Image 在 git worktree 中编写 C++ 功能与 UI 代码，并生成了纱幕壁画、五张开场分镜、砖墙贴图以及悬挂卡片菜单资产。Tripo Studio 与 Meshy AI 生成了 3D 网格体，实际进游戏的模型都在 Blender 中做了清理与减面。ElevenLabs 与 ffmpeg 制作了配音、音效与音乐，Antigravity CLI（`agy`）则润色了游戏内文案、操作提示、舞台区域名称与视频字幕。

## 下一步

正式提交前，我们还需要亲手启动并试玩最终的 Windows 候选包，评估游戏内的混音效果与鼠标视角手感，审阅调暗后的开场分镜，并按照 `TRAILER_SHOTLIST.md` 录制实机预告片。在 macOS 端，我们的签名脚本（`7be48a1`）和 `docs/submission/README_Mac.txt` 已就绪，只等付费 Apple Developer 证书到位即可完成公证。赛后更新计划中，我们已经排入了第一人称双手的上半身骨骼、序幕中只拿手电筒的手部形态、更完整的 EXIT 标志闪烁序列，以及尚未合并的焦散反光板预研分支（`origin/codex/reflector-light-2026-11-14`）。

## 附录：四天一览

- 11 月 12 日（第 1 天）：写完一页纸 GDD，整理好情绪板，生成 41 个道具网格体。
- 11 月 12 日傍晚：Stage 1 灯光玩具在测试关卡跑通，通过 10 项无头测试。
- 11 月 13 日（第 2 天）：做出中空光学盒，绘制纱幕壁画，搭建第一幕。
- 11 月 13 日傍晚：接入配音与音乐，调低纱幕暖度阈值。
- 11 月 13 日深夜：窗户光记忆、胶片条放映和 200 颗悬挂星星在黎明前落地。
- 11 月 14 日（第 3 天）：加入 `host-lock.sh`，生成开场分镜，细化第一人称手臂。
- 11 月 14 日深夜：用 273 个构件搭起剧场外壳围合舞台，整合标题菜单。
- 11 月 15 日（第 4 天）：加入世界退场后的星空虚空，重绘开场分镜，通过 Shipping 检查。
