/**
 * Hug: Chinese copy for the mirror page at /projects/hug/zh.
 *
 * Numbers, image files, sizes, color temperatures and the model path come from
 * the English copy in `hug.ts`, so a change there reaches both pages. Only the
 * words are here. Keep the claims at the same strength as the English page
 * (a digital model with proposed behavior) and polish with humanizer-zh.
 *
 * The iF jury sees the English page only; it does not link here.
 */

import { hug, type HugCopy, type HugImage } from "./hug";

const nbsp = " ";

function withAlt<T extends HugImage>(image: T, alt: string): T {
  return { ...image, alt };
}

const [open, halfOpen, gathered] = hug.states.items;

export const hugZh: HugCopy = {
  ...hug,
  lang: "zh-Hans",
  eyebrow: "灯光设计 · 台灯",
  subtitle: "可以拢在怀里的光。",
  lede: "Hug 是一盏有两片弧形翼的台灯，按照设计，打开的方式决定光的样子。完全展开时，光线宽而中性，适合白天；两翼合拢后，光会调暗，变成低而暖的微光，适合夜晚。",

  gesturesLabel: "三个手势",
  gestures: [
    {
      word: "Hold",
      gloss: "长按",
      text: "按住灯背面下方隐藏的触控区片刻，灯就会打开或关闭。",
    },
    {
      word: "Unfold",
      gloss: "展开",
      text: `两翼展开，给出宽阔、中性的 4000${nbsp}K 光，适合白天。`,
    },
    {
      word: "Gather",
      gloss: "合拢",
      text: `两翼合拢，光调暗成低而暖的 2200${nbsp}K 微光，适合夜晚。`,
    },
  ],
  meta: ["2026", "Yilun Zhan", "设计概念"],
  award: "已提交参评 iF 设计奖 2027",

  hero: withAlt(hug.hero, "合拢状态的 Hug 亮着暖光，一片乳白色的翼弯到另一片前面"),

  facts: [
    { label: "类型", value: "台灯" },
    { label: "光", value: `可调光、可调色温的白光，2200 至 4000${nbsp}K` },
    { label: "高度", value: `300${nbsp}mm` },
    { label: "预估重量", value: `0.35 至 0.50${nbsp}kg` },
    { label: "供电", value: "外置低压电源" },
    { label: "状态", value: "数字模型，计划制作样机" },
  ],

  statement: {
    lead: "一整天结束时，一个小小的动作，就能改变房间给人的感觉。",
    body: [
      "Hug 让你把一片光拢进怀里。弧形的两翼合上时，光按设计会变得更柔、更暖；展开时，光会照到房间更多的地方，适合白天。",
      "乳白、有触感的表面把光源藏了起来，让人想伸手去碰。不开灯时，这个造型也有用处，可以插几枝干花。Hug 想给普通的房间添一个小小的仪式：你亲手调整身边的光，在那一刻，也像被轻轻抱住。",
    ],
  },

  states: {
    ...hug.states,
    kicker: "三种状态",
    heading: "展开、半开、合拢",
    intro:
      "Hug 是一个连续的造型，随一天的时间变化。按照设计，隐藏的位置传感器会读取两翼打开的程度，相应调整亮度和色温。",
    sizeLabel: "尺寸（数字模型）",
    scaleLabel: "色温",
    model: {
      ...hug.states.model,
      label: "数字模型的铅笔素描，显示当前的开合程度。拖动模型或使用旋转按钮，可以从其他角度查看。",
      hint: "拖动旋转",
      turnLeft: "向左转动模型",
      turnRight: "向右转动模型",
      loading: "模型加载中",
      note: "数字模型，以素描方式呈现。三种状态之间的形态是示意性的插值。",
    },
    renderNote: "设计效果图，显示最接近的状态。",
    nameStop: "：",
    views: { label: "视图", model: "素描", render: "效果图" },
    slider: { label: "开合程度", start: "展开", end: "合拢" },
    hold: {
      label: "长按",
      hintOn: "长按关灯",
      hintOff: "长按开灯",
      off: "关灯",
    },
    lineup: withAlt(
      hug.states.lineup,
      "三种状态并排：左边完全展开、最宽，中间半开，右边合拢、色温最暖"
    ),
    lineupCaption: "从左到右：展开、半开、合拢。",
    items: [
      {
        ...open,
        name: "展开",
        description: "更宽、偏中性的光，适合白天。",
        image: withAlt(open.image, "完全展开的 Hug，两片翼舒展成宽而平的轮廓"),
      },
      {
        ...halfOpen,
        name: "半开",
        description: "温和亲切的光，适合与人相聚的时候。",
        image: withAlt(halfOpen.image, "半开的 Hug，一片翼有一部分转到另一片后面"),
      },
      {
        ...gathered,
        name: "合拢",
        description: "更低、更暖的光，适合慢慢放松下来。",
        image: withAlt(gathered.image, "合拢的 Hug，两翼包成窄窄的椭圆，亮着暖光"),
      },
    ],
  },

  day: {
    kicker: "Hug 的一天",
    heading: "从清晨的书桌到床边",
    intro:
      "舒适不分年龄，也不限家庭形态。Hug 可以放在书桌旁，放在两个人喝茶的桌上，也可以放在床头，陪你读完一本书。",
    previous: "上一组场景",
    next: "更多场景",
  },

  criteria: [
    {
      id: "idea",
      label: "理念",
      heading: "给自己留一点喘息的余地",
      body: [
        "这个想法来自拥抱：需要放松的时候，人会本能地想把什么拉到身边。忙完一整天，回到家也不一定就能停下来；有时一个小动作，能让房间安定下来，也让自己安定下来。",
        "Hug 把这个动作放进了日常照明。你打开它，和整个房间分享光；一天快结束时，再把它合拢。造型、触感和逐渐变化的暖意，跟着同一种情绪节奏。",
        "它适合所有想要更平静氛围的人，一个人或和别人在一起都可以。目标很简单：一件熟悉的物件，在忙碌的一天里给人片刻停顿。",
      ],
    },
    {
      id: "form",
      label: "形态",
      heading: "一个没有人形的拥抱",
      body: [
        "Hug 由一条连续的 S 形开口发展而来。一片翼轻轻从另一片前方经过，重叠的地方围出一个小小的、被护住的空间，留给光。",
        "表面计划采用光学硅胶导光层，夹在两层乳白扩散层之间，质感柔和、半透明，让人想去摸。无论展开、半开还是合拢，两翼都保持同一条流畅的线条。",
      ],
    },
    {
      id: "function",
      label: "功能",
      heading: "开合本身就是控制",
      body: [
        `按照设计，隐藏的位置传感器会把有导向的开合动作与调光、色温联动：完全展开时 4000${nbsp}K，半开时 3000${nbsp}K，合拢时 2200${nbsp}K。`,
        `下沿有一条 10${nbsp}mm 的腔体，里面排布 14 个 LED 位置，每个都有独立的导热岛，从下方照亮导光层。柔性层压材料里的光学结构再把光释放到整个弧面上。目标是一片大面积的柔光，亮度逐渐过渡，底部不出现一条亮线。`,
      ],
    },
    {
      id: "differentiation",
      label: "差异化",
      heading: "调一盏灯，也是一次小小的关照",
      body: [
        "在 Hug 上，手势、形态和光是一体的。按照设计，合拢两翼会让光向内收、变得更暖。你通过双手，也通过两片表面之间不断变化的空间，感受到熟悉的拥抱。",
        "不开灯时，乳白的弧面是一件安静的雕塑；一个可拆卸的支架可以在怀抱里插几枝干花，灯关了，这份关系也还在。Hug 的不同之处，在于把有用的物件、会回应你的造型和日常的仪式连在了一起。",
      ],
    },
    {
      id: "sustainability",
      label: "可持续性",
      heading: "一个留下它的理由",
      body: [
        "Hug 的设计围绕“留下来”：白天是可以一起生活的造型，晚上是愿意回到身边的光。情感上的依恋，加上不止一种日常用途，是为了让人用得更久。",
        "LED 和控制组件设计为可以与光学主体分开维修，从背面进入，并有独立的散热路径。第一台样机计划使用外置低压电源，不内置电池。",
      ],
    },
  ],

  idea: {
    image: withAlt(hug.idea.image, "两只手在书桌上轻轻把 Hug 的两翼合拢"),
    caption: "这个手势：把两翼合拢。",
  },

  form: {
    details: [
      { term: "圆润的肩部", text: "短短的上沿顺势过渡到两侧，让轮廓更柔和。" },
      { term: "安静的姿态", text: "下沿直接落在桌面上，没有单独的圆形底座。" },
      {
        term: "受控的形态变化",
        text: "按照设计，隐藏的导向结构会让弧线在展开和合拢时保持一致。",
      },
    ],
    embrace: withAlt(hug.form.embrace, "两翼重叠处的近景，光聚在两片翼之间的缝隙里"),
    edge: withAlt(hug.form.edge, "一片翼薄而圆润的边缘，向桌面弯下去"),
    base: withAlt(hug.form.base, "下沿直接落在木桌上，没有单独的底座"),
  },

  function: {
    drawing: {
      title: "光路，根据数字模型测量绘制",
      elevation: "正立面，展开状态",
      section: "A-A 剖面，局部放大",
      legendLabel: "部件",
      legend: [
        `外扩散层，0.4${nbsp}mm`,
        `透明导光层，2.4${nbsp}mm`,
        `内扩散层，0.4${nbsp}mm`,
        `LED，2200 至 4000${nbsp}K，居中位于导光层下方（下沿共 14 个）`,
        "导热岛，每个 LED 下方一个",
        "边缘腔体，两端封闭",
        "控制板预留空间",
        "开合传感器位置",
      ],
      note: "导光层的首选候选材料是光学硅胶。LED 从下沿照亮导光层，出光纹理再把光释放到整个表面。",
      titleBlock: ["Hug", "光路", "单位：mm", "Yilun Zhan"],
    },
    specs: [
      {
        term: "光源",
        text: `14 个 LED 位于 10${nbsp}mm 的边缘腔体内，居中位于 2.4${nbsp}mm 导光层下方，每个都有独立的导热岛。`,
      },
      {
        term: "光",
        text: `可调光、可调色温的白光，2200 至 4000${nbsp}K，随两翼的开合位置变化。`,
      },
      { term: "开关", text: "背面下方的隐藏触控区，需要有意按住片刻。" },
      { term: "供电", text: "外置低压电源，进线口在背面下方，配有线缆固定件。" },
    ],
  },

  differentiation: {
    dusk: {
      label: "黄昏",
      text: "一天将尽，窗边的座位上有一点柔和的光。",
      image: withAlt(
        hug.differentiation.dusk.image,
        "黄昏时 Hug 在窗边座位上亮着，旁边有靠垫、毯子和一本合上的书"
      ),
    },
    night: {
      label: "夜晚",
      text: "两翼合拢，光调低，夜晚慢了下来。",
      image: withAlt(
        hug.differentiation.night.image,
        "合拢的 Hug 在床头柜上亮着柔光，旁边有人在睡觉"
      ),
    },
  },

  sustainability: {
    strategies: [
      { term: "多功能", text: "晚上是灯，白天是可以插干花的雕塑。" },
      { term: "长久使用", text: "情感上的依恋和每天的使用，让人有理由一直留着它。" },
      { term: "维护与维修", text: "LED 和控制组件可以与光学主体分开维修。" },
    ],
  },

  development: {
    ...hug.development,
    kicker: "开发过程",
    heading: "从一条线到一盏灯",
    intro:
      "开发过程一直回到同一个问题：这个造型，看起来像是在轻轻抱着光吗？S 形曲线保留了下来，边缘、开口和光学方案变得更安静。",
    steps: [
      { term: "保留手势", text: "连续的开口，柔和的重叠。" },
      { term: "打磨边缘", text: "圆润的肩部，平顺的下沿收口。" },
      { term: "塑造光线", text: "展开、半开、合拢三种状态。" },
    ],
    sizesLabel: "尺寸（数字模型）",
    massNote: `预估重量 0.35 至 0.50${nbsp}kg，不含电源适配器。`,
    drawingsLabel: "图纸",
    drawings: hug.development.drawings.map((drawing, index) => ({
      ...drawing,
      label: ["平面图", "正立面图", "侧立面图"][index] ?? drawing.label,
    })),
    filmLabel: "产品影片",
    statusLabel: "开发状态",
    status: "Hug 目前已完成数字模型和设计效果图，下一步是制作实体样机。",
  },

  credits: [
    { label: "设计", value: "Yilun Zhan" },
    { label: "图片", value: "数字模型的设计效果图" },
  ],

  labels: {
    about: "关于",
    facts: "基本信息",
    criteria: "设计维度",
    enlarge: "放大图片",
  },

  lightbox: {
    title: "项目图片",
    open: "查看图片",
    close: "关闭图片查看器",
    previous: "上一张",
    next: "下一张",
    loading: "图片加载中…",
    unavailable: "原图无法加载，正在显示预览。",
  },

  languageLink: { href: "/projects/hug", label: "English", lang: "en" },
};

/**
 * Chinese alt text and captions for the scene renders listed in hug.mdx, by
 * file. The captions are the titles Yilun gave the render files.
 */
export const hugZhScenes: Record<string, { alt: string; caption: string }> = {
  "scene-01.webp": {
    alt: "清晨，有人在窗边的书桌前画草图，笔记本旁的 Hug 展开亮着",
    caption: "清晨工作",
  },
  "scene-02.webp": {
    alt: "有人在挂着雨痕的窗前写字，Hug 展开放在一杯水旁边",
    caption: "雨夜窗前的一小块明亮",
  },
  "scene-04.webp": {
    alt: "洒满阳光的客厅里，Hug 展开放在木质边柜上，旁边是一把扶手椅",
    caption: "白昼里的柔软雕塑",
  },
  "scene-05.webp": {
    alt: "有人坐在扶手椅里看书，旁边圆边几上的 Hug 半开着",
    caption: "留一半安静给阅读",
  },
  "scene-06.webp": {
    alt: "两只手在书桌上轻轻把 Hug 的两翼合拢",
    caption: "把光轻轻收拢",
  },
  "scene-07.webp": {
    alt: "两个人在圆茶几旁喝茶，Hug 半开着放在两只杯子之间",
    caption: "两个人共享的安静",
  },
  "scene-08.webp": {
    alt: "黄昏时 Hug 在窗边座位上亮着，旁边有靠垫、毯子和一本合上的书",
    caption: "窗边留一个可以停下的位置",
  },
  "scene-10.webp": {
    alt: "一只手把钥匙放进托盘，玄关柜上的 Hug 合拢着，亮着暖光",
    caption: "回家时的一点暖",
  },
  "scene-12.webp": {
    alt: "有人在床上睡着了，床头柜上的 Hug 亮着低而暖的光",
    caption: "最后一页之后",
  },
};
