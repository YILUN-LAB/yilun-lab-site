/**
 * Editor-facing copy for the Keystatic admin. Centralized so we can
 * review/edit it as prose, and so future translation is feasible.
 * See docs/superpowers/specs/2026-05-04-keystatic-cms-ux.md §9.
 */
export const copy = {
  signIn: {
    title: "YILUN LAB",
    button: "Sign in with GitHub",
    fineprint: "Editor access is limited to the lab's GitHub organization.",
  },
  denied: {
    title: "YILUN LAB",
    body: "This GitHub account doesn't have editor access to the lab's site. If you should have access, ask Yilun (or Rudy) to add you as a collaborator on the GitHub repo with Write permission.",
    button: "Sign out",
  },
  fields: {
    title: {
      label: "Title",
      help: "The project's display name. Shown on the homepage card and the project page hero.",
    },
    subtitle: {
      label: "Subtitle",
      help: "Optional second line shown beneath the title. Use for a series subtitle like 'Drift · Eon · Mortal'.",
    },
    tagline: {
      label: "Tagline",
      help: "A one- or two-sentence summary of the project, shown on cards and below the project hero.",
    },
    year: {
      label: "Year",
      help: "Year of the work — usually `2024` or a span like `Spring 2024` or `2023–2024`.",
    },
    role: {
      label: "Role",
      help: "Your role in the project. E.g., `Lighting Designer`, `Lighting Artist · Director`.",
    },
    medium: {
      label: "Medium",
      help: "The form of the work. E.g., `Performance · projection`, `Three-channel video · light installation`.",
    },
    runtime: {
      label: "Runtime",
      help: "Duration if applicable. E.g., `9 min`, `12 min`. Leave blank if it doesn't apply.",
    },
    date: {
      label: "Date",
      help: "Specific show or release date if relevant. Free text — `Oct 2024`, `Premiered 2024-10-12`, etc.",
    },
    cover: {
      label: "Cover image",
      help: "The hero image for the project. Used on the homepage card and as the social-share preview. Drag a JPG or PNG here. Recommended ≥ 1200 wide. Will be auto-converted to WebP and a 1200×630 social preview.",
    },
    images: {
      label: "Gallery images",
      help: "Project gallery shown beneath the hero. Drag-drop to reorder. Each image needs alt text for screen readers and SEO.",
      itemAlt: "Describe the image — e.g., 'Dancer in red light against a black backdrop.'",
      itemCaption: "Optional small text shown over the image. Usually blank.",
    },
    youtube: {
      label: "YouTube video ID",
      help: "The 11-character ID from the YouTube URL — e.g., from youtube.com/watch?v=Z6S5O_1trdI, just Z6S5O_1trdI. Don't paste the full URL.",
    },
    youtubeAlt: {
      label: "Alternate YouTube videos",
      help: "Additional YouTube videos shown alongside the main one. Same 11-character ID format.",
    },
    chapters: {
      label: "Chapters",
      help: "For series-style projects, each chapter renders as its own section. Drag-drop to reorder.",
      name: "Chapter title. Shown in the tab bar and as the section heading.",
      note: "Short subtitle beneath the chapter name. E.g., 'untethered shimmer'.",
      accent: "Color theme for this chapter. Leave at default to inherit the project's accent.",
      cover: "Hero image for the chapter. Used as the section's main visual when there's no video.",
      youtube: "If this chapter has a video, paste its 11-char YouTube ID. Otherwise leave blank — the cover image will be shown.",
      images: "Optional gallery for this chapter.",
      description: "The chapter's prose. Use the toolbar for italics, bold, blockquote. No headings inside a chapter.",
    },
    featured: {
      label: "Featured slot",
      help: "Pin a project to one of the three featured slots on the homepage. Each slot holds one project; if you pick a slot that's already taken, you'll be asked whether to move it here.",
    },
    order: {
      label: "Order",
      help: "Sort position on the homepage and projects list. Lower numbers appear first.",
    },
    draft: {
      label: "Draft",
      help: "When on, this project is hidden from the live site. Use this to work on a project before it's ready to show publicly.",
    },
  },
  errors: {
    fileTooLarge: (mb: number) =>
      `That file is too large (${mb} MB). Try a JPG export or save at lower quality.`,
    invalidFileType: "Only image files are allowed (JPG, PNG, WebP, GIF).",
    youtubeInvalid:
      "Looks like a full URL — paste just the 11-character ID. Example: Z6S5O_1trdI",
    sessionExpired:
      "Your sign-in expired. Sign in again to save your changes — your edits are still here.",
    networkRetry: "Couldn't save your changes — check your connection and try again.",
    conversionFailed: "Couldn't convert that image. Try a different file or contact Rudy.",
    saveBlocked: "Please fix the highlighted fields before saving.",
  },
  pill: {
    saved: "Saved",
    editing: "Editing…",
    pendingPublish: (s: number) => `Publishing in ${s}s…`,
    publishing: "Publishing…",
    building: (s: number) => `Site building, ~${s}s…`,
    likelyLive: "Likely live — Open site →",
    saveFailed: "Save failed — Retry",
    publishNow: "Publish now",
  },
  publish: {
    ready: (n: number) => `Publish ${n} change${n === 1 ? "" : "s"} →`,
    publishing: "Publishing…",
    published: "Published. Live in ~1 minute.",
    conflict: "Couldn't publish — message Rudy and he'll sort it out.",
    networkError: "Connection issue — try again.",
  },
  toasts: {
    youtubeAutoExtracted: "Extracted the video ID for you.",
  },
  recoveryBanner: {
    body: "You had unsaved changes from your last session. We saved them locally — would you like to publish them now?",
    publish: "Publish",
    discard: "Discard",
    review: "Review changes",
  },
  mobileTip: {
    body: "Editing works best on a laptop or tablet. Mobile is fine for quick text fixes — heavier work like adding chapters or uploading images is much smoother on a bigger screen.",
  },
  adminShell: {
    mainBranchWarning:
      "You're editing main directly — these changes go straight to the live site. Switch to 'staging' for drafts.",
  },
};
