import { describe, expect, test } from "vitest";
import {
  assertCatalogsMatch,
  canonicalizePlatformCatalog,
  findCatalogMismatch,
} from "./catalog-canonical";

const sample = [
  {
    slug: "a",
    name: "A",
    baseUrl: "https://a.test",
    urlHosts: ["B.Host", "a.host"],
  },
] as const;

describe("canonicalizePlatformCatalog", () => {
  test("lowercases and sorts urlHosts", () => {
    expect(canonicalizePlatformCatalog(sample)[0]!.urlHosts).toEqual([
      "a.host",
      "b.host",
    ]);
  });
});

describe("findCatalogMismatch", () => {
  test("detects name drift at same slug order", () => {
    const right = [
      { ...sample[0], name: "B" },
    ];
    const mismatch = findCatalogMismatch(sample, right);
    expect(mismatch?.kind).toBe("field");
    if (mismatch?.kind === "field") {
      expect(mismatch.field).toBe("name");
    }
  });

  test("passes for equivalent hosts with different order", () => {
    const left = [
      {
        slug: "x",
        name: "X",
        baseUrl: "https://x.test",
        urlHosts: ["www.x.test", "x.test"],
      },
    ];
    const right = [
      {
        slug: "x",
        name: "X",
        baseUrl: "https://x.test",
        urlHosts: ["x.test", "www.x.test"],
      },
    ];
    expect(findCatalogMismatch(left, right)).toBeUndefined();
    expect(() =>
      assertCatalogsMatch(left, right, { left: "L", right: "R" }),
    ).not.toThrow();
  });
});