import { describe, it, expect, afterEach } from "vitest";

describe("/keystatic route gate", () => {
  const original = (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_STORAGE;

  afterEach(() => {
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_STORAGE = original;
  });

  it("returns false when PUBLIC_KEYSTATIC_STORAGE is unset", async () => {
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_STORAGE = undefined;
    const { isAdminEnabled } = await import("../src/lib/keystatic-flags");
    expect(isAdminEnabled()).toBe(false);
  });

  it("returns true when PUBLIC_KEYSTATIC_STORAGE is local", async () => {
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_STORAGE = "local";
    const { isAdminEnabled } = await import("../src/lib/keystatic-flags");
    expect(isAdminEnabled()).toBe(true);
  });

  it("returns true when PUBLIC_KEYSTATIC_STORAGE is github", async () => {
    (import.meta.env as Record<string, unknown>).PUBLIC_KEYSTATIC_STORAGE = "github";
    const { isAdminEnabled } = await import("../src/lib/keystatic-flags");
    expect(isAdminEnabled()).toBe(true);
  });
});
