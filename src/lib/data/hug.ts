/**
 * Hug: copy and studio assets for the iF Design Award 2027 product page.
 *
 * The scene renders and the card cover live in `src/content/projects/hug.mdx`.
 * Everything else the page shows is here, so text and images can be updated
 * without touching the layout. English only: the iF jury reads this page.
 *
 * Unpublished content: a drawing appears once its `src` is filled in, and the
 * product film once `development.youtube` is set. Until then nothing renders.
 */

const dir = "/assets/images/projects/hug";

export interface HugImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface HugState {
  id: "open" | "half-open" | "gathered";
  name: string;
  kelvin: number;
  /** Approximate display color of this color temperature, as "r g b". */
  glow: string;
  description: string;
  size: string;
  image: HugImage;
}

export interface HugDrawing {
  label: string;
  /** Leave undefined to keep this drawing off the page. */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface HugCriterion {
  id: string;
  label: string;
  heading: string;
  body: string[];
}

export const hug = {
  eyebrow: "Lighting design · Table lamp",
  title: "Hug",
  subtitle: "Light you can draw close.",
  lede: "Hug is a table lamp with two curved wings, designed so that the way you open it sets the light. Opened out, it gives a broad, neutral light for the day. Drawn together, it dims to a warm, low glow for the evening.",

  /** Their initials spell the name. The page never points this out. */
  gesturesLabel: "Three gestures",
  gestures: [
    {
      word: "Hold",
      text: "A deliberate hold on a concealed touch zone at the lower rear turns the light on or off.",
    },
    {
      word: "Unfold",
      text: "Opened out, the wings give a broad, neutral 4000\u00a0K light for the day.",
    },
    {
      word: "Gather",
      text: "Drawn together, they dim to a warm, low 2200\u00a0K glow for the evening.",
    },
  ],
  meta: ["2026", "Yilun Zhan", "Design concept"],
  award: "Submitted to the iF Design Award 2027",

  hero: {
    src: `${dir}/cover.webp`,
    alt: "Hug glowing warm in its gathered state, one milky wing curving in front of the other",
    width: 1448,
    height: 1086,
  } satisfies HugImage,

  facts: [
    { label: "Type", value: "Table lamp" },
    { label: "Light", value: "Dimmable tunable white, 2200 to 4000\u00a0K" },
    { label: "Height", value: "300\u00a0mm" },
    { label: "Estimated mass", value: "0.35 to 0.50\u00a0kg" },
    { label: "Power", value: "External low-voltage supply" },
    { label: "Status", value: "Digital model, prototype planned" },
  ],

  statement: {
    lead: "At the end of a full day, a small gesture can change how a room feels.",
    body: [
      "Hug lets you gather a sheet of light into an embrace. As the curved wings close, the light is designed to grow softer and warmer. Opened out, it fills more of the room for the day.",
      "A milky, tactile surface hides the light source and invites the hand. Unlit, the form still has a use: it can hold a few dry flowers. Hug is meant to add a small ritual to an ordinary room, where you shape the light around you and, for a moment, feel held.",
    ],
  },

  states: {
    kicker: "Three states",
    heading: "Open, half-open, gathered",
    intro:
      "Hug is one continuous form that changes through the day. A concealed position sensor is intended to read how far the wings are open and adjust brightness and color temperature to match.",
    sizeLabel: "Size, digital model",
    scaleLabel: "Color temperature",
    model: {
      src: "/assets/models/hug/hug-states.glb",
      label:
        "Pencil sketch of the digital model, showing the current opening. Drag it or use the turn buttons to see it from other sides.",
      hint: "Drag to turn",
      turnLeft: "Turn the model left",
      turnRight: "Turn the model right",
      loading: "Loading model",
      dimension: "300 mm",
      note: "Digital model, drawn as a sketch. Shapes between the three states are interpolated for illustration.",
    },
    renderNote: "Design visualization of the nearest state.",
    views: { label: "View", model: "Sketch", render: "Render" },
    slider: { label: "Opening", start: "Unfold", end: "Gather" },
    hold: {
      label: "Hold",
      hintOn: "Press and hold to switch off",
      hintOff: "Press and hold to switch on",
      off: "Off",
    },
    lineup: {
      src: `${dir}/states-lineup.webp`,
      alt: "The three states side by side: open and wide on the left, half-open in the middle, gathered and warmest on the right",
      width: 1600,
      height: 900,
    } satisfies HugImage,
    lineupCaption: "Open, half-open and gathered, side by side.",
    items: [
      {
        id: "open",
        name: "Open",
        kelvin: 4000,
        glow: "255 209 163",
        description: "A broader, neutral light for the day.",
        size: "265 × 86 × 300\u00a0mm",
        image: {
          src: `${dir}/state-open.webp`,
          alt: "Hug fully open, its two wings spread into a wide, flat silhouette",
          width: 640,
          height: 890,
        },
      },
      {
        id: "half-open",
        name: "Half-open",
        kelvin: 3000,
        glow: "255 180 107",
        description: "An inviting light for shared moments.",
        size: "143 × 167 × 300\u00a0mm",
        image: {
          src: `${dir}/state-half-open.webp`,
          alt: "Hug half-open, one wing partly turned behind the other",
          width: 640,
          height: 890,
        },
      },
      {
        id: "gathered",
        name: "Gathered",
        kelvin: 2200,
        glow: "255 147 44",
        description: "A lower, warmer glow for winding down.",
        size: "140 × 128 × 300\u00a0mm",
        image: {
          src: `${dir}/state-gathered.webp`,
          alt: "Hug gathered, the wings wrapped into a narrow oval with a warm glow",
          width: 640,
          height: 890,
        },
      },
    ] satisfies HugState[],
  },

  day: {
    kicker: "A day with Hug",
    heading: "From the morning desk to the bedside",
    intro:
      "Comfort has no fixed age or household. Hug can sit beside a desk, between two people over tea, or by the bed at the end of a book.",
    previous: "Previous scenes",
    next: "More scenes",
  },

  criteria: [
    {
      id: "idea",
      label: "Idea",
      heading: "A little room to exhale",
      body: [
        "The idea began with an embrace: the instinct to draw something close when we need a moment of ease. A full day does not always end when we get home, and sometimes a small gesture helps the room, and ourselves, settle.",
        "Hug gives that gesture a place in everyday lighting. You open it to share light with the room, then gather it in as the day winds down. The form, the touch and the changing warmth follow the same emotional rhythm.",
        "It is for anyone who wants a calmer atmosphere, alone or with others. The ambition is simple: a familiar object that offers a short pause in a busy day.",
      ],
    },
    {
      id: "form",
      label: "Form",
      heading: "An embrace, without a figure",
      body: [
        "Hug grew from one continuous S-shaped opening. One wing passes gently in front of the other, and the overlap makes a small, sheltered space for the light.",
        "The surface is planned as an optical-silicone light guide between milky diffuser skins, which gives it a soft, translucent finish that asks to be touched. Open, half-open and gathered, the wings keep the same flowing line.",
      ],
    },
    {
      id: "function",
      label: "Function",
      heading: "Opening becomes the control",
      body: [
        "A concealed position sensor is intended to link the guided movement to dimming and tunable white light, from 4000\u00a0K fully open through 3000\u00a0K half-open to 2200\u00a0K gathered.",
        "Fourteen LED positions run along a 10\u00a0mm cavity at the lower edge, each with its own heat island, and light the guide from below. An optical structure in the flexible laminate then releases the light across the curved surface. The aim is a broad glow with gradual changes in brightness instead of a bright line at the base.",
      ],
    },
    {
      id: "differentiation",
      label: "Differentiation",
      heading: "Adjusting a lamp as a small act of care",
      body: [
        "In Hug, the gesture, the shape and the light belong together. Gathering the wings is intended to bring the glow inward and make it warmer. You feel the familiar embrace through your hands and in the changing space between the two surfaces.",
        "Unlit, the milky curve becomes a quiet sculpture, and a removable support can hold dry stems inside the embrace, so the relationship carries on when the light is off. What sets Hug apart is this continuity between a useful object, a form that responds to you and an everyday ritual.",
      ],
    },
    {
      id: "sustainability",
      label: "Sustainability",
      heading: "A reason to keep it",
      body: [
        "Hug is designed around keeping: a form to live with by day and a light to return to at night. Emotional attachment, and having more than one daily role, are intended to support longer use.",
        "The LED and control assembly is designed to be serviced apart from the optical body, with rear access and its own heat path. The first prototype is planned with external low-voltage power and no built-in battery.",
      ],
    },
  ] satisfies HugCriterion[],

  idea: {
    image: {
      src: `${dir}/scene-06.webp`,
      alt: "Two hands gently drawing Hug's wings together on a desk",
      width: 1448,
      height: 1086,
    } satisfies HugImage,
    caption: "The gesture: drawing the wings together.",
  },

  form: {
    details: [
      {
        term: "Rounded shoulders",
        text: "The short upper edge flows into the sides and softens the outline.",
      },
      {
        term: "A quiet stance",
        text: "The lower edge meets the table directly, without a separate circular base.",
      },
      {
        term: "A controlled family of forms",
        text: "Concealed guidance is intended to keep the curve consistent as it opens and gathers.",
      },
    ],
    embrace: {
      src: `${dir}/detail-embrace.webp`,
      alt: "Close view of the overlap, where light collects in the gap between the two wings",
      width: 1448,
      height: 1086,
    } satisfies HugImage,
    edge: {
      src: `${dir}/detail-edge.webp`,
      alt: "The thin, rounded edge of one wing curving down toward the table",
      width: 1400,
      height: 1200,
    } satisfies HugImage,
    base: {
      src: `${dir}/detail-base.webp`,
      alt: "The lower edge meeting a wooden table without a separate base",
      width: 1448,
      height: 1086,
    } satisfies HugImage,
  },

  function: {
    drawing: {
      title: "Light path, measured from the digital model",
      elevation: "Front elevation, open",
      section: "Section A-A, enlarged",
      legendLabel: "Parts",
      legend: [
        "Outer diffuser, 0.4\u00a0mm",
        "Clear optical guide, 2.4\u00a0mm",
        "Inner diffuser, 0.4\u00a0mm",
        "LED, 2200 to 4000\u00a0K, centered under the guide (14 along the lower edge)",
        "Heat island, one under each LED",
        "Edge cavity, closed at both ends",
        "Control board envelope",
        "Opening sensor position",
      ],
      note: "Optical silicone is the leading material candidate for the guide. LEDs light its lower edge, and an extraction texture releases the light across the surface.",
      titleBlock: ["Hug", "Light path", "Units: mm", "Yilun Zhan"],
    },
    specs: [
      {
        term: "Light source",
        text: "14 LEDs in a 10\u00a0mm edge cavity, centered under the 2.4\u00a0mm guide, each on its own heat island.",
      },
      {
        term: "Light",
        text: "Dimmable tunable white, 2200 to 4000\u00a0K, linked to the position of the wings.",
      },
      {
        term: "On and off",
        text: "A concealed touch zone at the lower rear, operated by a deliberate hold.",
      },
      {
        term: "Power",
        text: "External low-voltage supply with a lower-rear inlet and cable restraint.",
      },
    ],
  },

  differentiation: {
    dusk: {
      label: "At dusk",
      text: "A soft light on the window seat as the day ends.",
      image: {
        src: `${dir}/scene-08.webp`,
        alt: "Hug glowing on a window seat at dusk, beside cushions, a blanket and a closed book",
        width: 1448,
        height: 1086,
      } satisfies HugImage,
    },
    night: {
      label: "By night",
      text: "Wings drawn close, glow lowered for a slower evening.",
      image: {
        src: `${dir}/night-gathered.webp`,
        alt: "Hug gathered and glowing softly on a nightstand while someone sleeps",
        width: 1448,
        height: 1086,
      } satisfies HugImage,
    },
  },

  sustainability: {
    strategies: [
      {
        term: "Multifunctionality",
        text: "A lamp at night, a sculpture that can hold dry flowers by day.",
      },
      {
        term: "Longevity",
        text: "Attachment and daily use give people a reason to keep it.",
      },
      {
        term: "Maintain and repair",
        text: "The LED and control assembly can be serviced apart from the optical body.",
      },
    ],
  },

  development: {
    kicker: "Development",
    heading: "From a line to a light",
    intro:
      "The development kept returning to one question: does the shape feel like it is gently holding the light? The S-curve stayed. The edge, the opening and the optical approach became quieter.",
    steps: [
      { term: "Keep the gesture", text: "A continuous opening and a soft overlap." },
      { term: "Refine the edge", text: "Rounded shoulders and a smooth lower return." },
      { term: "Shape the light", text: "Open, half-open and gathered states." },
    ],
    sizesLabel: "Size, digital model",
    massNote: "Estimated mass 0.35 to 0.50\u00a0kg, without the power adapter.",
    drawingsLabel: "Drawings",
    drawings: [
      { label: "Plan" },
      { label: "Front elevation" },
      { label: "Side elevation" },
    ] as HugDrawing[],
    filmLabel: "Product film",
    /** YouTube video ID. Leave undefined to keep the film section off the page. */
    youtube: undefined as string | undefined,
    statusLabel: "Development status",
    status:
      "Hug is developed as a digital model and design visualizations, with a physical prototype as the next step.",
  },

  credits: [
    { label: "Design", value: "Yilun Zhan" },
    { label: "Images", value: "Design visualizations of the digital model" },
  ],

  footer: "© 2026 Yilun Zhan",

  labels: {
    about: "About",
    facts: "Key facts",
    criteria: "Design criteria",
    enlarge: "Enlarge image",
  },
};
