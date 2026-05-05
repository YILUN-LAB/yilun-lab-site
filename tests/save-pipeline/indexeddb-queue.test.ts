import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { saveQueue, type QueuedPayload } from "@lib/save-pipeline/indexeddb-queue";

const samplePayload = (slug: string): QueuedPayload => ({
  slug,
  fields: { tagline: "edited" },
  files: {},
  enqueuedAt: Date.now(),
});

describe("indexeddb-queue", () => {
  beforeEach(async () => {
    await saveQueue.clearAll();
  });

  it("enqueues and peeks", async () => {
    await saveQueue.enqueue(samplePayload("project-a"));
    const all = await saveQueue.peekAll();
    expect(all).toHaveLength(1);
    expect(all[0].slug).toBe("project-a");
  });

  it("merges enqueues for the same slug", async () => {
    await saveQueue.enqueue({ ...samplePayload("project-a"), fields: { tagline: "first" } });
    await saveQueue.enqueue({ ...samplePayload("project-a"), fields: { year: "2024" } });
    const all = await saveQueue.peekAll();
    expect(all).toHaveLength(1);
    expect(all[0].fields).toEqual({ tagline: "first", year: "2024" });
  });

  it("clears a slug", async () => {
    await saveQueue.enqueue(samplePayload("project-a"));
    await saveQueue.enqueue(samplePayload("project-b"));
    await saveQueue.clear("project-a");
    const all = await saveQueue.peekAll();
    expect(all.map((p) => p.slug)).toEqual(["project-b"]);
  });
});
