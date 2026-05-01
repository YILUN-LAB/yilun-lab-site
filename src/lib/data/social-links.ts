import type { ComponentType, SVGProps } from "react";
import { InstagramIcon, LinkedInIcon } from "@components/react/icons";

export interface SocialLink {
  /** Stable id, used as React key. */
  id: string;
  /** Button label, stored title-case. The pill renders it via Tailwind
   *  `uppercase tracking-[0.18em]` — the data file stays readable; the
   *  visual all-caps treatment lives in the component. */
  label: string;
  /** Used in `aria-label`: "Find Yilun Lab on {platform}". */
  platform: string;
  /** Public profile URL. Modern iOS/Android route Instagram/LinkedIn URLs
   *  to the native app via universal links automatically — no special
   *  deep-link scheme required. */
  href: string;
  /** Pre-existing icon component from icons.tsx. */
  Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
}

export const SOCIAL_LINKS = [
  {
    id: "instagram",
    label: "Find us on Instagram",
    platform: "Instagram",
    href: "https://www.instagram.com/yilunlab/",
    Icon: InstagramIcon,
  },
  {
    id: "linkedin",
    label: "Find us on LinkedIn",
    platform: "LinkedIn",
    href: "https://www.linkedin.com/in/yilun-zhan",
    Icon: LinkedInIcon,
  },
] as const satisfies readonly SocialLink[];
