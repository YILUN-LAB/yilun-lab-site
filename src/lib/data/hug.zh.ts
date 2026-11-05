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

/** No-break space between a number and its unit, e.g. 4000 K. */
const nbsp = String.fromCharCode(0xa0);

function withAlt<T extends HugImage>(image: T, alt: string): T {
  return { ...image, alt };
}

const [open, halfOpen, gathered] = hug.states.items;

export const hugZh: HugCopy = {
  ...hug,
  lang: "zh-Hans",
  eyebrow: "灯具设计 · 台灯",
  subtitle: "可以拢在怀里的光。",
  lede: "Hug 是一盏带有两片弧形灯翼的台灯。按照设计，你怎么打开它，光就怎么亮起：展开时，是适合白天的开阔中性光；合拢时，便暗成夜晚低柔的暖光。",

  gesturesLabel: "三个手势",
  gestures: [
    {
      word: "Hold",
      gloss: "长按",
      text: "手指在灯背下方的隐藏触控区稍作停留，即可开灯或关灯。",
    },
    {
      word: "Unfold",
      gloss: "展开",
      text: `两翼展开，亮起开阔、中性的 4000${nbsp}K 光线，适合白天。`,
    },
    {
      word: "Gather",
      gloss: "合拢",
      text: `两翼收拢，光线渐暗为低柔温润的 2200${nbsp}K 暖光，适合夜晚。`,
    },
  ],
  meta: ["2026", "Yilun Zhan", "设计概念"],
  award: "已提交参评 iF 设计奖 2027",

  hero: withAlt(hug.hero, "合拢状态下的 Hug 泛着暖光，一片乳白色灯翼轻拢在另一片前方"),

  facts: [
    { label: "类型", value: "台灯" },
    { label: "光线", value: `亮度与色温可调白光，2200 至 4000${nbsp}K` },
    { label: "高度", value: `300${nbsp}mm` },
    { label: "预估重量", value: `0.35 至 0.50${nbsp}kg` },
    { label: "供电", value: "外置低压电源" },
    { label: "状态", value: "数字模型，计划制作样机" },
  ],

  statement: {
    lead: "充实的一天结束时，一个小小的动作，就能改变整个房间的氛围。",
    body: [
      "Hug 让你将整片光拢入怀中。按照设计，当弧形两翼收拢，光线会随之变得柔和、温暖；敞开时，光线便在白天照亮更大的空间。",
      "温润的乳白色表面藏起了光源，触感亲切，让人不由得想伸手触碰。未点亮时，灯身也能插上几枝干花。Hug 希望为寻常的房间添一份小小的日常仪式：当你亲手拢起周遭的光，那一刻，自己也仿佛被轻轻拥住。",
    ],
  },

  states: {
    ...hug.states,
    kicker: "三种状态",
    heading: "展开、半开、合拢",
    intro:
      "Hug 的形态连贯一体，随一天中的时段流转而变化。按照设计，内部隐藏的位置传感器会感知两翼开合的程度，同步调节亮度与色温。",
    sizeLabel: "尺寸（数字模型）",
    scaleLabel: "色温",
    model: {
      ...hug.states.model,
      label:
        "数字模型的铅笔素描视图，展示当前的开合状态。拖动模型或点击旋转按钮，可从不同角度观察。",
      hint: "拖动旋转",
      turnLeft: "向左转动模型",
      turnRight: "向右转动模型",
      loading: "模型加载中",
      note: "以素描风格呈现的数字模型。三种状态之间的过渡形态由插值生成，仅供示意。",
    },
    renderNote: "当前最接近状态的设计效果图。",
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
      "三种状态并排展示：左侧完全展开、形态最宽，中间为半开状态，右侧合拢、光色最暖"
    ),
    lineupCaption: "从左至右：展开、半开、合拢。",
    items: [
      {
        ...open,
        name: "展开",
        description: "开阔、中性的光线，适合白天。",
        image: withAlt(open.image, "完全展开的 Hug，两片灯翼舒展成宽展平缓的轮廓"),
      },
      {
        ...halfOpen,
        name: "半开",
        description: "温和亲切的光线，适合相聚时刻。",
        image: withAlt(halfOpen.image, "半开状态的 Hug，一片灯翼半转至另一片后方"),
      },
      {
        ...gathered,
        name: "合拢",
        description: "低柔温暖的微光，适合慢慢放松下来。",
        image: withAlt(gathered.image, "合拢状态的 Hug，两翼环抱成修长的椭圆形，泛着暖光"),
      },
    ],
  },

  day: {
    kicker: "Hug 的一天",
    heading: "从清晨的书桌到床边",
    intro:
      "对舒适的向往不分年龄，也不限于某一种家庭。Hug 可以摆在书桌一角、两人对坐饮茶的几案中央，或是睡前读完最后一页书的床头。",
    previous: "上一组场景",
    next: "更多场景",
  },

  criteria: [
    {
      id: "idea",
      label: "理念",
      heading: "给自己留一点喘息的余地",
      body: [
        "设计的起点是一个拥抱：当人需要片刻放松时，总会本能地想把什么拢到身边。忙完一整天，回到家未必就能立刻松弛下来；有时一个小小的动作，就能帮房间和自己一起慢慢安定下来。",
        "Hug 将这个动作融入了日常照明。白昼里敞开灯翼，让光线与房间共享；夜深时将它合拢，把暖意收回近处。形态的开合、指尖的触感与冷暖的渐变，都顺应着同一段情绪节奏。",
        "它适合每一个想要更平静氛围的人，无论独处还是与人相伴。设计的初衷很简单：做一件温和熟悉的日常器物，在忙碌的日子里留出片刻停顿。",
      ],
    },
    {
      id: "form",
      label: "形态",
      heading: "抽离具象的拥抱",
      body: [
        "Hug 的形态生发自一条连续的 S 形开口。一片灯翼从另一片前方轻柔交叠而过，围合出一处拢住光线的小小空间。",
        "灯面计划以光学硅胶作为导光层，夹在两层乳白色扩散表皮之间，呈现出柔和温润的半透明质感，让人忍不住想要触碰。无论处于展开、半开还是合拢状态，两翼始终保持着同一条流畅的线条。",
      ],
    },
    {
      id: "function",
      label: "功能",
      heading: "开合本身就是控制",
      body: [
        `按照设计，隐藏的位置传感器会将受导向结构约束的开合动作与调光、调色温联动：完全展开时为 4000${nbsp}K，半开时为 3000${nbsp}K，合拢时则降至 2200${nbsp}K。`,
        `灯体下沿的 10${nbsp}mm 腔体内排布着 14 个 LED 灯位，各自配有独立的导热岛，自下而上照亮导光层；柔性复合层内的光学结构随之将光线导出至整个弧面。这样设计的目标是获得自然渐变的大面积柔光，避免底部出现生硬的亮线。`,
      ],
    },
    {
      id: "differentiation",
      label: "差异化",
      heading: "调一盏灯，也是一次小小的关照",
      body: [
        "在 Hug 的设计里，动作、形态与光是融为一体的。按照设计，收拢两翼时，光线也会向内收敛并逐渐变暖。通过双手的触碰，以及两片弧面之间收放的空间，你能感受到那份熟悉的拥抱感。",
        "未点亮时，乳白色的弧面如同一座安静的雕塑，内部的可拆卸支架还能插放几枝干花，让器物与人的陪伴在关灯后依然延续。实用照明、回应双手动作的形态，以及小小的日常仪式，在这里连成了一个整体，这正是 Hug 的独特之处。",
      ],
    },
    {
      id: "sustainability",
      label: "可持续性",
      heading: "一个留下它的理由",
      body: [
        "Hug 的设计围绕“长久留存”展开：白天是相伴日常的器物，夜晚则是让人安心归来的灯光。按设计初衷，情感上的依恋加上不止一种日常用途，能让一件物品被使用得更久。",
        "LED 模组与控制组件在设计上可与光学灯体分离检修，从背面开启，并配有独立的散热通道。首台样机计划采用外置低压电源供电，不设内置电池。",
      ],
    },
  ],

  idea: {
    image: withAlt(hug.idea.image, "两只手在书桌上轻轻把 Hug 的两翼合拢"),
    caption: "核心手势：将两翼轻轻合拢。",
  },

  form: {
    details: [
      { term: "圆润的肩线", text: "短促的上沿自然汇入两侧，柔化了整体轮廓。" },
      { term: "安静的姿态", text: "下沿直接落于桌面，省去了独立的圆形底座。" },
      {
        term: "统一的形态序列",
        text: "按照设计，隐藏式导向结构让灯翼在开合过程中始终保持一致的弧度。",
      },
    ],
    embrace: withAlt(hug.form.embrace, "两翼交叠处的近景，光线聚拢在两片弧面之间的缝隙里"),
    edge: withAlt(hug.form.edge, "一片灯翼薄而圆润的边缘，向下延伸至桌面"),
    base: withAlt(hug.form.base, "灯体下沿直接落在木质桌面上，没有独立的底座"),
  },

  function: {
    drawing: {
      title: "光路图（据数字模型测绘）",
      elevation: "正立面图，展开状态",
      section: "A-A 剖面图，局部放大",
      legendLabel: "结构部件",
      legend: [
        `外扩散层，0.4${nbsp}mm`,
        `透明导光层，2.4${nbsp}mm`,
        `内扩散层，0.4${nbsp}mm`,
        `LED，2200 至 4000${nbsp}K，居中设于导光层下方（沿下沿共排布 14 颗）`,
        "导热岛，每颗 LED 下方各设一个",
        "下沿腔体，两端封闭",
        "控制板安装空间",
        "开合位置传感器",
      ],
      note: "光学硅胶是导光层的首选材料方案。LED 自下沿照亮导光层，再由导光纹理将光线释放至整个灯面。",
      titleBlock: ["Hug", "光路", "单位：mm", "Yilun Zhan"],
    },
    specs: [
      {
        term: "光源",
        text: `14 颗 LED 排布于 10${nbsp}mm 的下沿腔体内，居中对准 2.4${nbsp}mm 导光层下方，各自配有独立导热岛。`,
      },
      {
        term: "光线",
        text: `亮度与色温可调白光，2200 至 4000${nbsp}K，随两翼开合位置同步变化。`,
      },
      { term: "开关", text: "位于灯背下方的隐藏触控区，需有意长按才会响应。" },
      { term: "供电", text: "外置低压电源，进线口设于背面下方，配有线缆固定结构。" },
    ],
  },

  differentiation: {
    dusk: {
      label: "黄昏",
      text: "白昼将尽，窗边坐榻上亮起一团柔和的光。",
      image: withAlt(
        hug.differentiation.dusk.image,
        "黄昏时分，Hug 在窗边坐榻上泛着柔光，身旁放着靠垫、毛毯与一本合上的书"
      ),
    },
    night: {
      label: "夜晚",
      text: "两翼收拢，光线压低，陪伴节奏放缓的夜晚。",
      image: withAlt(
        hug.differentiation.night.image,
        "夜晚有人正在安睡，床头柜上的 Hug 处于合拢状态，亮着柔和的微光"
      ),
    },
  },

  sustainability: {
    strategies: [
      { term: "一物多用", text: "夜晚是台灯，白天是可插放干花的安静雕塑。" },
      { term: "长久陪伴", text: "情感上的依恋与每天的使用，让人愿意长久留存。" },
      { term: "易于维护", text: "LED 模组与控制组件可独立于光学灯体进行检修。" },
    ],
  },

  development: {
    ...hug.development,
    kicker: "设计推敲",
    heading: "从一条线到一盏灯",
    intro:
      "整个推敲过程始终围绕着一个问题：这个形态，看起来像是在轻柔地拢住光吗？S 形主曲线保留了下来，而边缘过渡、开口比例与光学结构则收束得更为内敛安静。",
    steps: [
      { term: "保留手势", text: "连续的开口线条，轻柔的交叠关系。" },
      { term: "推敲边缘", text: "圆润的肩线，平顺的下沿收口。" },
      { term: "塑造光线", text: "展开、半开与合拢三种光效状态。" },
    ],
    sizesLabel: "尺寸（数字模型）",
    massNote: `预估重量 0.35 至 0.50${nbsp}kg，不含电源适配器。`,
    drawingsLabel: "工程图纸",
    drawings: hug.development.drawings.map((drawing, index) => ({
      ...drawing,
      label: ["平面图", "正立面图", "侧立面图"][index] ?? drawing.label,
    })),
    filmLabel: "产品短片",
    statusLabel: "开发进度",
    status: "Hug 目前已完成数字模型构建与设计效果图呈现，下一步计划制作实体样机。",
  },

  credits: [
    { label: "设计", value: "Yilun Zhan" },
    { label: "图像", value: "基于数字模型制作的设计效果图" },
  ],

  labels: {
    about: "简介",
    facts: "基本参数",
    criteria: "设计维度",
    enlarge: "放大查看",
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
    alt: "清晨，有人在窗边的书桌前画草图，笔记本旁的 Hug 完全展开并亮着光",
    caption: "清晨工作",
  },
  "scene-02.webp": {
    alt: "有人在挂着雨痕的窗前写字，展开的 Hug 亮在一杯水旁",
    caption: "雨夜窗前的一小块明亮",
  },
  "scene-04.webp": {
    alt: "洒满阳光的客厅里，展开的 Hug 摆在木质边柜上，旁边是一把扶手椅",
    caption: "白昼里的柔软雕塑",
  },
  "scene-05.webp": {
    alt: "有人坐在扶手椅里看书，身旁圆边几上的 Hug 呈半开状态",
    caption: "留一半安静给阅读",
  },
  "scene-06.webp": {
    alt: "两只手在书桌上轻轻把 Hug 的两翼合拢",
    caption: "把光轻轻收拢",
  },
  "scene-07.webp": {
    alt: "两个人在圆茶几旁喝茶，半开的 Hug 放在两只茶杯之间",
    caption: "两个人共享的安静",
  },
  "scene-08.webp": {
    alt: "黄昏时分，Hug 在窗边坐榻上泛着柔光，身旁放着靠垫、毛毯与一本合上的书",
    caption: "窗边留一个可以停下的位置",
  },
  "scene-10.webp": {
    alt: "一只手将钥匙放进托盘，玄关柜上的 Hug 处于合拢状态，泛着暖光",
    caption: "回家时的一点暖",
  },
  "scene-12.webp": {
    alt: "有人在床上安睡，床头柜上的 Hug 泛着低柔的暖光",
    caption: "最后一页之后",
  },
};
