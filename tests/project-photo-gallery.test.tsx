import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ImageWallVariant } from "../src/components/react/ImageWallVariant";
import { ImagePosterVariant } from "../src/components/react/ImagePosterVariant";
import { VideoHeroVariant } from "../src/components/react/VideoHeroVariant";
import { Chapters, type ChapterData } from "../src/components/react/Chapters";

vi.mock("lite-youtube-embed", () => ({}));
vi.mock("lite-youtube-embed/src/lite-yt-embed.css", () => ({}));

afterEach(cleanup);

const first = { src: "/first.webp", alt: "First image", fullSrc: "/first.jpg" };
const second = { src: "/second.webp", alt: "Second image" };
const third = { src: "/third.webp", alt: "Third image" };

function open(alt: string) {
  fireEvent.click(screen.getByRole("button", { name: `View photograph: ${alt}` }));
  return screen.getByRole("dialog", { name: "Project photographs" });
}
function close(dialog: HTMLElement) {
  fireEvent.click(dialog.querySelector<HTMLButtonElement>("[data-lightbox-close]")!);
}

describe("Project photo viewers", () => {
  it("opens an image wall at the clicked photo, wraps, and shows its own project title without descriptions", () => {
    render(<ImageWallVariant title="Image Wall" images={[first, second]} />);
    const dialog = open(second.alt);
    expect(within(dialog).getByText("Image Wall")).toBeInTheDocument();
    expect(within(dialog).queryByText("Soft Boundary")).not.toBeInTheDocument();
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", second.src);
    expect(dialog.querySelector("footer")).toHaveTextContent("02 / 02");
    expect(within(dialog).queryByText(second.alt)).not.toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", first.src);
    expect(dialog.querySelector('img[aria-hidden="true"]')).toHaveAttribute("src", first.fullSrc);
  });

  it("does not create photo controls for empty image-wall placeholders", () => {
    render(<ImageWallVariant title="Empty project" />);
    expect(screen.queryByRole("button", { name: /View photograph/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("includes the poster and its gallery in one sequence, excluding duplicate sources", () => {
    render(
      <ImagePosterVariant
        title="Poster Project"
        poster={first}
        images={[{ ...first, alt: "Repeated poster" }, second]}
      />
    );
    const dialog = open(first.alt);
    expect(within(dialog).getByText("01 / 02")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Next photograph" }));
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", second.src);
    close(dialog);
    const reopened = open("Repeated poster");
    expect(within(reopened).getByText("01 / 02")).toBeInTheDocument();
  });

  it("opens video-project stills without replacing the video embed", async () => {
    const { container } = render(
      <VideoHeroVariant title="Video Project" youtube="test-video" images={[first, second]} />
    );
    await vi.waitFor(() =>
      expect(container.querySelector('lite-youtube[videoid="test-video"]')).not.toBeNull()
    );
    const video = container.querySelector("lite-youtube");
    const dialog = open(second.alt);
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", second.src);
    close(dialog);
    expect(container.querySelector("lite-youtube")).toBe(video);
  });

  const chapters: ChapterData[] = [
    {
      name: "First",
      note: "",
      cover: first.src,
      images: [first, second],
      description: "First chapter",
    },
    {
      name: "Second",
      note: "",
      cover: "/video-poster.webp",
      youtube: "chapter-video",
      images: [third],
      description: "Second chapter",
    },
  ];

  it("keeps tabbed viewing within the selected chapter and resets the sequence when switching chapters", () => {
    const { container } = render(
      <Chapters title="Chapters Project" variant="chapters-tabbed" chapters={chapters} />
    );
    let dialog = open("First — cover");
    expect(within(dialog).getByText("01 / 02")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", second.src);
    close(dialog);
    const video = container.querySelector("lite-youtube");
    fireEvent.click(screen.getByRole("button", { name: "Second", exact: true }));
    expect(
      screen.queryByRole("button", { name: "View photograph: First — cover" })
    ).not.toBeInTheDocument();
    dialog = open(third.alt);
    expect(within(dialog).getByText("01 / 01")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", third.src);
    close(dialog);
    expect(container.querySelector("lite-youtube")).toBe(video);
  });

  it("includes every visible chapter in a stacked sequence and skips video thumbnails", () => {
    render(<Chapters title="Stacked Project" variant="chapters" chapters={chapters} />);
    const dialog = open(third.alt);
    expect(within(dialog).getByText("03 / 03")).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img")).toHaveAttribute("src", first.src);
  });
});
