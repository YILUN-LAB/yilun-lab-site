import {
  SCORE_WEIGHTS,
  searchLayout,
  type Breakpoint,
  type LayoutCandidate,
  type LayoutItem,
  type ScoreWeights,
} from "../src/lib/ashlar";

interface Project extends LayoutItem {
  title: string;
  tagline: string;
  category: string[];
  year: string;
  accent: string;
  cover: string;
  featured?: number;
  order: number;
  draft: boolean;
}

// --- content -----------------------------------------------------------------

const raw = import.meta.glob("../src/content/projects/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function frontmatter(source: string): Record<string, string> {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!match) return out;
  const lines = match[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const kv = line.match(/^([a-zA-Z]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value === ">-" || value === "|" || value === ">") {
      const parts: string[] = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) parts.push(lines[++i].trim());
      value = parts.join(" ");
    } else if (value === "") {
      const parts: string[] = [];
      while (i + 1 < lines.length && /^\s+-\s/.test(lines[i + 1])) {
        parts.push(lines[++i].replace(/^\s+-\s*/, "").trim());
      }
      value = `[${parts.join(", ")}]`;
    }
    out[kv[1]] = value.replace(/^["']|["']$/g, "");
  }
  return out;
}

const projects: Project[] = Object.entries(raw)
  .map(([path, source]) => {
    const fm = frontmatter(source);
    const slug = path.replace(/^.*\/([^/]+)\.mdx$/, "$1");
    return {
      slug,
      title: fm.title ?? slug,
      tagline: fm.tagline ?? "",
      category: (fm.category ?? "")
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      year: fm.year ?? "",
      accent: fm.accent ?? "amber",
      weight: fm.weight as LayoutItem["weight"],
      cover: fm.cover ?? `/assets/images/projects/${slug}/01.webp`,
      featured: fm.featured ? Number(fm.featured) : undefined,
      order: fm.order ? Number(fm.order) : 9999,
      draft: fm.draft === "true",
    };
  })
  .filter((p) => !p.draft)
  .sort((a, b) => a.order - b.order);

const nonFeatured = projects.filter((p) => typeof p.featured !== "number");
const lab = projects
  .filter((p): p is Project & { featured: number } => typeof p.featured === "number")
  .sort((a, b) => a.featured - b.featured);

const PRESETS: Record<string, () => Project[]> = {
  "Works · All": () => nonFeatured,
  "Works · Light & Art": () => nonFeatured.filter((p) => p.category.includes("art")),
  "Works · Light & Dance": () => nonFeatured.filter((p) => p.category.includes("dance")),
  "Works · Light & Tech": () => nonFeatured.filter((p) => p.category.includes("tech")),
  Lab: () => lab,
  "Synthetic (Items count)": () =>
    Array.from({ length: 12 }, (_, i) => ({
      ...projects[i % projects.length],
      slug: `synthetic-${i}`,
      title: `${projects[i % projects.length].title}`,
      weight: undefined,
    })),
};

// --- viewport frames -----------------------------------------------------------

const GUTTER: Record<Breakpoint, number> = { sm: 32, md: 64, lg: 80 };
const VIEWPORTS: Record<string, { bp: Breakpoint; width: number }[]> = {
  "lg-1536": [{ bp: "lg", width: 1536 }],
  "lg-1280": [{ bp: "lg", width: 1280 }],
  "lg-1024": [{ bp: "lg", width: 1024 }],
  "md-768": [{ bp: "md", width: 768 }],
  "sm-375": [{ bp: "sm", width: 375 }],
  all: [
    { bp: "lg", width: 1280 },
    { bp: "md", width: 768 },
    { bp: "sm", width: 375 },
  ],
};

// --- ui ----------------------------------------------------------------------------

const form = document.getElementById("controls") as HTMLFormElement;
const stage = document.getElementById("stage") as HTMLElement;
const weightsBox = document.getElementById("weights") as HTMLElement;
const presetSelect = form.elements.namedItem("preset") as HTMLSelectElement;

for (const name of Object.keys(PRESETS)) {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  presetSelect.append(option);
}

const weightInputs = new Map<keyof ScoreWeights, HTMLInputElement>();
for (const key of Object.keys(SCORE_WEIGHTS) as (keyof ScoreWeights)[]) {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "number";
  input.step = "0.5";
  input.value = String(SCORE_WEIGHTS[key]);
  input.addEventListener("input", render);
  label.append(key, input);
  weightsBox.append(label);
  weightInputs.set(key, input);
}

document.getElementById("reset")?.addEventListener("click", () => {
  for (const [key, input] of weightInputs) input.value = String(SCORE_WEIGHTS[key]);
  render();
});
form.addEventListener("input", render);
form.addEventListener("submit", (event) => event.preventDefault());

function readWeights(): Partial<ScoreWeights> {
  const out: Partial<ScoreWeights> = {};
  for (const [key, input] of weightInputs) {
    const value = Number(input.value);
    if (Number.isFinite(value) && value !== SCORE_WEIGHTS[key]) out[key] = value;
  }
  return out;
}

function currentItems(): Project[] {
  const data = new FormData(form);
  const preset = String(data.get("preset"));
  const count = Number(data.get("count"));
  const items = PRESETS[preset]();
  return preset.startsWith("Synthetic") ? items.slice(0, count) : items;
}

function renderCard(
  project: Project,
  placement: LayoutCandidate["placements"][number],
  opts: { labels: boolean; covers: boolean }
) {
  const card = document.createElement("a");
  card.className = `card ${placement.tier}`;
  card.href = "#";
  card.style.gridColumn = `${placement.x + 1} / span ${placement.w}`;
  card.style.gridRow = `${placement.y + 1} / span ${placement.h}`;
  if (opts.covers) {
    const img = document.createElement("img");
    img.src = project.cover;
    img.alt = "";
    img.loading = "lazy";
    card.append(img);
  } else {
    card.style.background = `hsl(${(project.slug.length * 47) % 360} 40% 22%)`;
  }
  const shade = document.createElement("div");
  shade.className = "shade";
  card.append(shade);
  const year = document.createElement("div");
  year.className = "pill year";
  year.textContent = project.year || "—";
  card.append(year);
  if (opts.labels) {
    const size = document.createElement("div");
    size.className = "pill size";
    size.textContent = `${placement.tier} ${placement.w}×${placement.h}`;
    card.append(size);
  }
  const text = document.createElement("div");
  text.className = "text";
  text.innerHTML = `<h3></h3><p></p><span class="cta">View case study ↗</span>`;
  (text.querySelector("h3") as HTMLElement).textContent = project.title;
  (text.querySelector("p") as HTMLElement).textContent = project.tagline;
  card.append(text);
  return card;
}

function renderFrame(
  items: Project[],
  bp: Breakpoint,
  width: number,
  candidate: LayoutCandidate,
  cols: number,
  opts: { labels: boolean; covers: boolean }
) {
  const frame = document.createElement("div");
  frame.className = `frame ${bp}`;
  frame.style.width = `${width}px`;
  frame.style.padding = `${GUTTER[bp] / 2}px ${GUTTER[bp]}px`;
  const inner = document.createElement("div");
  inner.className = "frame-inner";
  const grid = document.createElement("div");
  grid.className = "grid";
  grid.style.setProperty("--cols", String(cols));
  candidate.placements.forEach((placement, i) => {
    grid.append(renderCard(items[i], placement, opts));
  });
  inner.append(grid);
  frame.append(inner);
  return frame;
}

function asciiMap(candidate: LayoutCandidate, cols: number): string {
  const rows = Math.max(0, ...candidate.placements.map((p) => p.y + p.h));
  const grid = Array.from({ length: rows }, () => new Array<string>(cols).fill("·"));
  candidate.placements.forEach((p, i) => {
    for (let y = p.y; y < p.y + p.h; y++) {
      for (let x = p.x; x < p.x + p.w; x++) grid[y][x] = String.fromCharCode(65 + i);
    }
  });
  return grid.map((row) => row.join("")).join("\n");
}

function renderScore(candidate: LayoutCandidate, cols: number) {
  const box = document.createElement("div");
  box.className = "score";
  const map = document.createElement("pre");
  map.className = "map";
  map.textContent = asciiMap(candidate, cols);
  box.append(map);
  const s = candidate.score;
  const parts = Object.entries(s).map(([key, value]) => {
    const span = document.createElement("span");
    const shown = typeof value === "number" ? Number(value.toFixed(2)) : value;
    span.innerHTML = key === "total" ? `<b>total ${shown}</b>` : `${key} ${shown}`;
    if (key !== "total" && Number(value) > 0) span.classList.add("hot");
    return span;
  });
  box.append(...parts);
  return box;
}

function render() {
  const data = new FormData(form);
  const items = currentItems();
  const keep = Number(data.get("keep"));
  const beamWidth = Number(data.get("beam"));
  const viewports = VIEWPORTS[String(data.get("viewport"))];
  const opts = { labels: data.get("labels") === "on", covers: data.get("covers") === "on" };
  const weights = readWeights();
  stage.replaceChildren();

  const results = viewports.map((v) => ({
    ...v,
    result: searchLayout(items, v.bp, { keep, beamWidth, weights }),
  }));

  for (let c = 0; c < keep; c++) {
    const section = document.createElement("section");
    section.className = "candidate";
    const heading = document.createElement("h2");
    heading.textContent = `Candidate ${c + 1} · ${items.length} items`;
    section.append(heading);
    const frames = document.createElement("div");
    frames.className = "frames";
    for (const { bp, width, result } of results) {
      const candidate = result.candidates[c];
      if (!candidate) continue;
      const column = document.createElement("div");
      column.append(renderFrame(items, bp, width, candidate, result.cols, opts));
      column.append(renderScore(candidate, result.cols));
      frames.append(column);
    }
    section.append(frames);
    stage.append(section);
  }
}

render();
