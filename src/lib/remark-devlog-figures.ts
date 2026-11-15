import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

/**
 * Remark plugin for the devlog Markdown in `src/content/devlog/`.
 *
 * The text is written outside the site, with images linked as
 * `![alt](../images/NN-name.jpg)` and an italic caption on the next line. This
 * plugin points each image at its WebP under `public/` (same name, `.webp`),
 * adds its pixel size and lazy loading, and turns an image paragraph into a
 * `<figure>` with the caption as `<figcaption>`. Only files inside
 * `contentDir` are changed; a missing image fails the build.
 */
export interface DevlogFiguresOptions {
  /** Folder whose Markdown files this plugin rewrites. */
  contentDir: string;
  /** URL folder the WebP images are served from, e.g. `/assets/images/projects/x`. */
  imageUrl: string;
  /** The site's `public/` folder, used to read image sizes. */
  publicDir: string;
}

interface MdNode {
  type: string;
  url?: string;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, string | number> };
}

const LINKED_IMAGE = /^\.\.\/images\/([\w.-]+)\.(?:jpe?g|png|webp)$/i;

function isBlank(node: MdNode) {
  return node.type === "text" && (node.value ?? "").trim() === "";
}

function collectImages(node: MdNode, found: MdNode[]) {
  if (node.type === "image") found.push(node);
  for (const child of node.children ?? []) collectImages(child, found);
}

/** Turns `[image]` or `[image, newline, *caption*]` paragraphs into figures. */
function toFigure(node: MdNode): MdNode {
  if (node.type !== "paragraph") return node;
  const parts = (node.children ?? []).filter((child) => !isBlank(child));
  const [image, caption, ...rest] = parts;
  if (image?.type !== "image" || rest.length > 0) return node;
  if (caption && caption.type !== "emphasis") return node;

  const children: MdNode[] = [image];
  if (caption) {
    children.push({
      type: "devlogCaption",
      data: { hName: "figcaption" },
      children: caption.children ?? [],
    });
  }
  return { type: "devlogFigure", data: { hName: "figure" }, children };
}

function sourcePath(file: { path?: string | URL; history?: (string | URL)[] }) {
  const value = file.path ?? file.history?.[0];
  if (!value) return undefined;
  return value instanceof URL || String(value).startsWith("file:")
    ? fileURLToPath(value)
    : String(value);
}

export function remarkDevlogFigures(options: DevlogFiguresOptions) {
  const contentDir = path.resolve(options.contentDir) + path.sep;

  return async function transform(
    tree: MdNode,
    file: { path?: string | URL; history?: (string | URL)[] }
  ) {
    const filePath = sourcePath(file);
    if (!filePath || !path.resolve(filePath).startsWith(contentDir)) return;

    const images: MdNode[] = [];
    collectImages(tree, images);
    await Promise.all(
      images.map(async (image) => {
        const match = LINKED_IMAGE.exec(image.url ?? "");
        if (!match) {
          throw new Error(
            `${filePath}: image "${image.url}" must be linked as ../images/<name>.jpg`
          );
        }
        const url = `${options.imageUrl}/${match[1]}.webp`;
        const onDisk = path.join(options.publicDir, url);
        const { width, height } = await sharp(onDisk)
          .metadata()
          .catch(() => {
            throw new Error(`${filePath}: no WebP for "${image.url}" at ${onDisk}`);
          });
        image.url = url;
        image.data = {
          ...image.data,
          hProperties: {
            ...(width && height ? { width, height } : {}),
            loading: "lazy",
            decoding: "async",
          },
        };
      })
    );

    tree.children = (tree.children ?? []).map(toFigure);
  };
}
