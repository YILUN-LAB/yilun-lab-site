export const ACCENT_GRADIENTS = {
  amber:
    "radial-gradient(60% 80% at 50% 50%, rgba(245,185,66,0.55), rgba(150,90,20,0.3) 60%, #050407 90%)",
  blue: "radial-gradient(60% 80% at 50% 50%, rgba(64,144,255,0.5), rgba(20,40,90,0.3) 60%, #050407 90%)",
  red: "radial-gradient(60% 80% at 50% 50%, rgba(255,90,90,0.5), rgba(120,30,30,0.3) 60%, #050407 90%)",
  green:
    "radial-gradient(60% 80% at 50% 50%, rgba(140,220,120,0.5), rgba(40,90,40,0.3) 60%, #050407 90%)",
  violet:
    "radial-gradient(60% 80% at 50% 50%, rgba(180,120,255,0.5), rgba(60,30,120,0.3) 60%, #050407 90%)",
  cyan: "radial-gradient(60% 80% at 50% 50%, rgba(120,220,230,0.5), rgba(40,90,100,0.3) 60%, #050407 90%)",
  magenta:
    "radial-gradient(60% 80% at 50% 50%, rgba(255,120,200,0.5), rgba(120,30,90,0.3) 60%, #050407 90%)",
  spectrum:
    "linear-gradient(180deg, transparent 38%, rgba(245,90,90,0.6) 42%, rgba(255,180,80,0.6) 48%, rgba(255,235,100,0.6) 53%, rgba(140,220,120,0.6) 58%, rgba(120,200,255,0.6) 63%, rgba(180,120,255,0.6) 68%, transparent 72%), #050407",
} as const;

export type AccentName = keyof typeof ACCENT_GRADIENTS;

export function gradientFor(accent: string | undefined): string {
  if (accent && Object.hasOwn(ACCENT_GRADIENTS, accent)) {
    return ACCENT_GRADIENTS[accent as AccentName];
  }
  return ACCENT_GRADIENTS.amber;
}
