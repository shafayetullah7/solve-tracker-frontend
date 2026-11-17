import { describe, expect, test } from "vitest";
import { resolveApiProxyOrigin } from "./api-proxy-origin";

describe("resolveApiProxyOrigin", () => {
  test("accepts a bare origin", () => {
    expect(resolveApiProxyOrigin("http://localhost:3000")).toBe(
      "http://localhost:3000",
    );
  });

  test("rejects missing value", () => {
    expect(() => resolveApiProxyOrigin(undefined)).toThrow(
      /API_PROXY_TARGET must be an explicit/,
    );
  });

  test("rejects path on origin", () => {
    expect(() => resolveApiProxyOrigin("http://localhost:3000/api")).toThrow(
      /without credentials, path/,
    );
  });
});