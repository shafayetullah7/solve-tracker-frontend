import { describe, expect, test } from "vitest";
import {
  LANDING_FEATURES,
  LANDING_HERO,
  LANDING_SEO,
} from "./landing-copy";

describe("landing-copy (6E)", () => {
  test("SEO and hero mention guides and problems", () => {
    expect(LANDING_SEO.description).toMatch(/guide/i);
    expect(LANDING_SEO.description).toMatch(/problem|coding/i);
    expect(LANDING_SEO.description).toMatch(/separate|streak/i);
    expect(LANDING_HERO.title).toMatch(/Learn/i);
    expect(LANDING_HERO.subtitle).toMatch(/guide/i);
  });

  test("features include guides and overview", () => {
    const titles = LANDING_FEATURES.items.map((item) => item.title);
    expect(titles).toContain("Guides");
    expect(titles).toContain("Overview");
    expect(LANDING_FEATURES.items).toHaveLength(4);
  });

  test("does not claim unified productivity metric", () => {
    const combined = [
      LANDING_SEO.description,
      LANDING_HERO.subtitle,
      ...LANDING_FEATURES.items.map((i) => i.description),
    ].join(" ");
    expect(combined.toLowerCase()).not.toMatch(/unified streak/);
    expect(combined.toLowerCase()).not.toMatch(/combined productivity/);
  });
});