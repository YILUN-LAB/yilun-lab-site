import type { SVGProps } from "react";

type YilunLogoProps = SVGProps<SVGSVGElement> & { className?: string };

/**
 * Yilun Lab brandmark (V1).
 *
 * Inlined so `currentColor` inherits the parent text color (the navbar
 * button uses text-white, so the strokes paint white). The viewBox is
 * cropped tight to the artwork so the mark fills its container — the
 * source file at /public/assets/logo.svg keeps the original 500×300
 * canvas for OG / social use.
 */
export function YilunLogo({ className, ...rest }: YilunLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="130 45 240 240"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      role="img"
      aria-label="YILUN LAB"
      className={className}
      {...rest}
    >
      <path d="M 140 150 C 200 80, 300 80, 360 150" strokeWidth="4" />
      <path
        d="M 250 150 L 250 250 L 320 250"
        strokeWidth="14"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <path d="M 250 150 L 190 90" strokeWidth="14" strokeLinecap="square" />
      <path d="M 250 150 L 320 80" strokeWidth="2" strokeLinecap="square" />
    </svg>
  );
}
