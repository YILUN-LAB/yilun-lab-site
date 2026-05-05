import { createElement } from "react";
import { config, fields, collection } from "@keystatic/core";
import { copy } from "@lib/keystatic-copy";

const MARK_LIGHT = "/assets/brand/logos/svg/yilun-lab-mark-black.svg";
const MARK_DARK = "/assets/brand/logos/svg/yilun-lab-mark-white.svg";

const brandMark = ({ colorScheme }: { colorScheme: "light" | "dark" }) =>
  createElement("img", {
    src: colorScheme === "dark" ? MARK_DARK : MARK_LIGHT,
    alt: "",
    style: { height: "24px", width: "24px", display: "block" },
  });

const accentOptions = [
  { label: "Amber", value: "amber" },
  { label: "Blue", value: "blue" },
  { label: "Red", value: "red" },
  { label: "Green", value: "green" },
  { label: "Violet", value: "violet" },
  { label: "Cyan", value: "cyan" },
  { label: "Magenta", value: "magenta" },
  { label: "Spectrum", value: "spectrum" },
] as const;

const imageItem = fields.object({
  src: fields.text({ label: "Image path", validation: { isRequired: true } }),
  alt: fields.text({
    label: "Alt text",
    description: copy.fields.images.itemAlt,
    validation: { isRequired: true },
  }),
  caption: fields.text({
    label: "Caption",
    description: copy.fields.images.itemCaption,
    multiline: true,
  }),
});

export default config({
  storage:
    import.meta.env.PUBLIC_KEYSTATIC_STORAGE === "github"
      ? {
          kind: "github",
          repo: {
            owner: import.meta.env.PUBLIC_KEYSTATIC_REPO_OWNER ?? "",
            name: import.meta.env.PUBLIC_KEYSTATIC_REPO_NAME ?? "",
          },
        }
      : { kind: "local" },
  ui: {
    brand: { name: copy.signIn.title, mark: brandMark },
  },
  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "src/content/projects/*",
      format: { contentField: "body" },
      // category, accent, weight, aspect, and variant use fields.ignored() so
      // they stay out of Yilun's form UI but round-trip through parse/serialize,
      // preserving existing frontmatter on save (per design spec §6).
      schema: {
        title: fields.slug({
          name: { label: copy.fields.title.label, description: copy.fields.title.help },
        }),
        subtitle: fields.text({
          label: copy.fields.subtitle.label,
          description: copy.fields.subtitle.help,
        }),
        tagline: fields.text({
          label: copy.fields.tagline.label,
          description: copy.fields.tagline.help,
          multiline: true,
          validation: { isRequired: true, length: { min: 1, max: 280 } },
        }),
        category: fields.ignored(),
        year: fields.text({
          label: copy.fields.year.label,
          description: copy.fields.year.help,
          validation: { isRequired: true, length: { min: 1, max: 40 } },
        }),
        role: fields.text({
          label: copy.fields.role.label,
          description: copy.fields.role.help,
          validation: { isRequired: true },
        }),
        medium: fields.text({
          label: copy.fields.medium.label,
          description: copy.fields.medium.help,
          validation: { isRequired: true },
        }),
        runtime: fields.text({
          label: copy.fields.runtime.label,
          description: copy.fields.runtime.help,
        }),
        date: fields.text({
          label: copy.fields.date.label,
          description: copy.fields.date.help,
        }),
        accent: fields.ignored(),
        weight: fields.ignored(),
        aspect: fields.ignored(),
        cover: fields.image({
          label: copy.fields.cover.label,
          description: copy.fields.cover.help,
          directory: "public/assets/images/projects/{slug}",
          publicPath: "/assets/images/projects/{slug}/",
        }),
        variant: fields.ignored(),
        images: fields.array(imageItem, {
          label: copy.fields.images.label,
          description: copy.fields.images.help,
          itemLabel: (props) => props.fields.alt.value || "(no alt yet)",
        }),
        youtube: fields.text({
          label: copy.fields.youtube.label,
          description: copy.fields.youtube.help,
          validation: { length: { max: 11 } },
        }),
        youtubeAlt: fields.array(
          fields.text({ label: "YouTube ID", validation: { length: { max: 11 } } }),
          {
            label: copy.fields.youtubeAlt.label,
            description: copy.fields.youtubeAlt.help,
            itemLabel: (props) => props.value || "(empty)",
          }
        ),
        chapters: fields.array(
          fields.object({
            name: fields.text({
              label: "Name",
              description: copy.fields.chapters.name,
              validation: { isRequired: true, length: { min: 1, max: 40 } },
            }),
            note: fields.text({
              label: "Note",
              description: copy.fields.chapters.note,
              validation: { isRequired: true, length: { min: 1, max: 80 } },
            }),
            accent: fields.select({
              label: "Accent",
              description: copy.fields.chapters.accent,
              options: [{ label: "(inherit)", value: "" }, ...accentOptions],
              defaultValue: "",
            }),
            cover: fields.image({
              label: "Cover",
              description: copy.fields.chapters.cover,
              directory: "public/assets/images/projects/{slug}",
              publicPath: "/assets/images/projects/{slug}/",
            }),
            youtube: fields.text({
              label: "YouTube ID",
              description: copy.fields.chapters.youtube,
              validation: { length: { max: 11 } },
            }),
            images: fields.array(imageItem, {
              label: "Images",
              description: copy.fields.chapters.images,
              itemLabel: (props) => props.fields.alt.value || "(no alt yet)",
            }),
            description: fields.text({
              label: "Description",
              description: copy.fields.chapters.description,
              multiline: true,
              validation: { isRequired: true },
            }),
          }),
          {
            label: copy.fields.chapters.label,
            description: copy.fields.chapters.help,
            itemLabel: (props) => props.fields.name.value || "(unnamed chapter)",
          }
        ),
        featured: fields.integer({
          label: copy.fields.featured.label,
          description: copy.fields.featured.help,
          validation: { min: 1, max: 3 },
        }),
        order: fields.integer({
          label: copy.fields.order.label,
          description: copy.fields.order.help,
          validation: { isRequired: true },
        }),
        draft: fields.checkbox({
          label: copy.fields.draft.label,
          description: copy.fields.draft.help,
          defaultValue: false,
        }),
        body: fields.mdx({
          label: "Project description",
          description:
            "The main paragraphs shown on the project page beneath the hero (only used for non-chapter variants).",
          options: {
            heading: false,
          },
        }),
      },
    }),
  },
});
