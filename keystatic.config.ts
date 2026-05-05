import { config, fields, collection } from "@keystatic/core";
import { copy } from "@lib/keystatic-copy";

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

const categoryOptions = [
  { label: "Light & Art", value: "art" },
  { label: "Light & Dance", value: "dance" },
  { label: "Light & Tech", value: "tech" },
] as const;

const variantOptions = [
  { label: "Image wall", value: "image-wall" },
  { label: "Video hero", value: "video-hero" },
  { label: "Image poster", value: "image-poster" },
  { label: "Chapters", value: "chapters" },
  { label: "Chapters (tabbed)", value: "chapters-tabbed" },
] as const;

const weightOptions = [
  { label: "Lead", value: "lead" },
  { label: "Feature", value: "feature" },
  { label: "Column", value: "column" },
  { label: "Tile", value: "tile" },
] as const;

const aspectOptions = [
  { label: "4:5", value: "4/5" },
  { label: "16:10", value: "16/10" },
  { label: "1:1", value: "1/1" },
  { label: "5:4", value: "5/4" },
  { label: "4:3", value: "4/3" },
  { label: "21:9", value: "21/9" },
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
  storage: { kind: "local" },
  ui: {
    brand: { name: copy.signIn.title },
  },
  collections: {
    projects: collection({
      label: "Projects",
      slugField: "title",
      path: "src/content/projects/*",
      format: { contentField: "body" },
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
        category: fields.multiselect({
          label: "Category",
          description: "Hidden from Yilun's UI; serialized only.",
          options: categoryOptions,
          defaultValue: ["art"],
        }),
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
        accent: fields.select({
          label: "Accent (project-level)",
          description: "Hidden from Yilun's UI; serialized only.",
          options: accentOptions,
          defaultValue: "amber",
        }),
        weight: fields.select({
          label: "Weight",
          description: "Hidden from Yilun's UI; serialized only.",
          options: weightOptions,
          defaultValue: "column",
        }),
        aspect: fields.select({
          label: "Aspect",
          description: "Hidden from Yilun's UI; serialized only.",
          options: [{ label: "(none)", value: "" }, ...aspectOptions],
          defaultValue: "",
        }),
        cover: fields.image({
          label: copy.fields.cover.label,
          description: copy.fields.cover.help,
          directory: "public/assets/images/projects/{slug}",
          publicPath: "/assets/images/projects/{slug}/",
        }),
        variant: fields.select({
          label: "Variant",
          description: "Hidden from Yilun's UI; serialized only.",
          options: variantOptions,
          defaultValue: "image-wall",
        }),
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
