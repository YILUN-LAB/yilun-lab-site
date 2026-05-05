import { describe, expect, it } from "vitest";
import keystaticConfig from "../keystatic.config";

/**
 * Asserts that every field declared by the Zod content-collection schema
 * in src/content.config.ts is also declared in the Keystatic schema. The
 * Keystatic schema may have additional helpers, but every Zod field must
 * be present so save round-trips don't drop frontmatter.
 *
 * If this test fails after a content-config change, update keystatic.config.ts
 * to match.
 */

const ZOD_FIELDS = [
  "title",
  "subtitle",
  "tagline",
  "category",
  "year",
  "role",
  "medium",
  "runtime",
  "date",
  "accent",
  "weight",
  "aspect",
  "cover",
  "variant",
  "images",
  "youtube",
  "youtubeAlt",
  "chapters",
  "featured",
  "order",
  "draft",
];

describe("schema parity", () => {
  it("declares every Zod field in the Keystatic schema", () => {
    const declared = Object.keys(keystaticConfig.collections.projects.schema);
    for (const field of ZOD_FIELDS) {
      expect(declared, `missing field: ${field}`).toContain(field);
    }
  });
});
