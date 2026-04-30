export interface CollabArea {
  num: string;
  name: string;
  desc: string;
}

export const COLLAB_AREAS = [
  { num: "01", name: "Art & Culture", desc: "Galleries, museums, public installations." },
  { num: "02", name: "Performance", desc: "Dance, theater, immersive stage works." },
  { num: "03", name: "Hospitality & Wellness", desc: "Atmosphere as architecture, light as care." },
  { num: "04", name: "Future Experiences", desc: "Pavilions, XR, AI, emerging tech." },
] as const satisfies readonly CollabArea[];
