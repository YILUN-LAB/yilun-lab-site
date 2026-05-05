import { describe, expect, it } from "vitest";
import {
  transformProjectImage,
  FileTooLargeError,
  InvalidFileTypeError,
  MAX_FILE_SIZE_BYTES,
} from "@lib/keystatic-image";

function makeJpegFile(bytes: number, name = "photo.jpg"): File {
  const data = new Uint8Array(bytes);
  data[0] = 0xff;
  data[1] = 0xd8;
  data[bytes - 2] = 0xff;
  data[bytes - 1] = 0xd9;
  return new File([data], name, { type: "image/jpeg" });
}

describe("transformProjectImage", () => {
  it("rejects files over 25 MB", async () => {
    const huge = makeJpegFile(MAX_FILE_SIZE_BYTES + 1);
    await expect(transformProjectImage(huge, "gallery")).rejects.toBeInstanceOf(
      FileTooLargeError
    );
  });

  it("rejects non-image MIME types", async () => {
    const txt = new File(["hello"], "notes.txt", { type: "text/plain" });
    await expect(transformProjectImage(txt, "gallery")).rejects.toBeInstanceOf(
      InvalidFileTypeError
    );
  });
});
