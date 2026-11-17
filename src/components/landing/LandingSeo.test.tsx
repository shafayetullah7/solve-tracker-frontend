import { describe, expect, test } from "vitest";
import { LANDING_SEO } from "./landing-copy";
import { buildLandingJsonLd } from "./LandingSeo";

describe("LandingSeo", () => {
  test("structured data matches marketing copy", () => {
    const jsonLd = buildLandingJsonLd();
    expect(jsonLd["@type"]).toBe("WebApplication");
    expect(jsonLd.name).toBe(LANDING_SEO.jsonLd.name);
    expect(jsonLd.description).toBe(LANDING_SEO.description);
  });

  test("declares og image asset metadata", () => {
    expect(LANDING_SEO.ogImageWidth).toBeGreaterThan(0);
    expect(LANDING_SEO.ogImagePath).toBe("/og-image.jpg");
  });
});