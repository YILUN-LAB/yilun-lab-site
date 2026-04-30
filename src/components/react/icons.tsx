import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

export function ArrowUpRight({ className = "h-5 w-5", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function PlayIcon({ className = "h-4 w-4", ...rest }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...rest} aria-hidden="true">
      <polygon points="6 4 20 12 6 20 6 4" />
    </svg>
  );
}

export function ClockIcon({ className = "h-7 w-7", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2.5" />
    </svg>
  );
}

export function GlobeIcon({ className = "h-7 w-7", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.8 3.2 4.2 6.2 4.2 9s-1.4 5.8-4.2 9c-2.8-3.2-4.2-6.2-4.2-9S9.2 6.2 12 3z" />
    </svg>
  );
}

export function ImageIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...rest} aria-hidden="true">
      <path d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21H5Zm1-4h12l-3.75-5-3 4L9 13l-3 4Z" />
    </svg>
  );
}

export function MovieIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...rest} aria-hidden="true">
      <path d="M4 6.47 5.76 10H20v8H4V6.47M22 4h-4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.89-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4Z" />
    </svg>
  );
}

export function BulbIcon({ className = "h-6 w-6", ...rest }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...rest} aria-hidden="true">
      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1Zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7Z" />
    </svg>
  );
}

export function MailIcon({ className = "h-5 w-5", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function InstagramIcon({ className = "h-5 w-5", ...rest }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-5 w-5", ...rest }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...rest} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14ZM8.5 18V10H6v8h2.5Zm-1.25-9.2a1.45 1.45 0 1 0 0-2.9 1.45 1.45 0 0 0 0 2.9ZM18 18v-4.6c0-2.18-1.16-3.2-2.7-3.2-1.25 0-1.81.69-2.12 1.17V10H10.7c.03.71 0 8 0 8h2.48v-4.47c0-.22.02-.44.08-.6.18-.45.6-.92 1.3-.92.92 0 1.29.7 1.29 1.72V18H18Z" />
    </svg>
  );
}
