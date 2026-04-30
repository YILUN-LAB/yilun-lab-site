// Ambient declarations for lite-youtube-embed (no .d.ts ships with the package).

declare module "lite-youtube-embed";
declare module "lite-youtube-embed/src/lite-yt-embed.css";

declare namespace JSX {
  interface IntrinsicElements {
    "lite-youtube": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & { videoid: string; class?: string },
      HTMLElement
    >;
  }
}
