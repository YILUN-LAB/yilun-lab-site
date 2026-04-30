import type { SVGProps } from "react";

type YilunLogoProps = SVGProps<SVGSVGElement> & { className?: string };

/**
 * Yilun Lab brandmark.
 * Geometric Y/U mark — a soft arc dome over a wider anchor curve, joined by
 * a vertical stem. Strokes use `currentColor` so the surrounding context
 * decides the tint (the navbar applies brand gold via text-[#F5C22D]).
 *
 * Source: public/assets/logo.svg
 */
export function YilunLogo({ className, ...rest }: YilunLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="310 117 180 180"
      fill="none"
      stroke="currentColor"
      strokeWidth="10"
      strokeLinecap="butt"
      role="img"
      aria-label="YILUN LAB"
      className={className}
      {...rest}
    >
      <path d="M 340 144 A 60 60 0 0 0 460 144" />
      <path d="M 328 222 A 78 78 0 0 0 472 222" />
      <path d="M 400 203 L 400 271" />
    </svg>
  );
}
