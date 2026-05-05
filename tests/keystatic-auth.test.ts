import { describe, expect, it, vi } from "vitest";
import { hasEditorAccess } from "@lib/keystatic-auth";

const okFetch = (permission: string) =>
  vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ permission }),
  } as Response);

const notFoundFetch = () =>
  vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
    json: () => Promise.resolve({}),
  } as Response);

describe("hasEditorAccess", () => {
  it("allows admin permission", async () => {
    const fetchMock = okFetch("admin");
    expect(
      await hasEditorAccess({ token: "t", owner: "o", repo: "r", username: "u", fetchImpl: fetchMock })
    ).toBe(true);
  });

  it("allows write permission", async () => {
    const fetchMock = okFetch("write");
    expect(
      await hasEditorAccess({ token: "t", owner: "o", repo: "r", username: "u", fetchImpl: fetchMock })
    ).toBe(true);
  });

  it("allows maintain permission", async () => {
    const fetchMock = okFetch("maintain");
    expect(
      await hasEditorAccess({ token: "t", owner: "o", repo: "r", username: "u", fetchImpl: fetchMock })
    ).toBe(true);
  });

  it("denies read permission", async () => {
    const fetchMock = okFetch("read");
    expect(
      await hasEditorAccess({ token: "t", owner: "o", repo: "r", username: "u", fetchImpl: fetchMock })
    ).toBe(false);
  });

  it("denies non-collaborator (404)", async () => {
    const fetchMock = notFoundFetch();
    expect(
      await hasEditorAccess({ token: "t", owner: "o", repo: "r", username: "u", fetchImpl: fetchMock })
    ).toBe(false);
  });
});
