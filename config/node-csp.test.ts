import { describe, expect, test } from "vitest";
import { buildContentSecurityPolicy, nodeCspEnabled, scriptNonce } from "./node-csp";

describe("node-csp", () => {
  test("buildContentSecurityPolicy includes nonce", () => {
    const csp = buildContentSecurityPolicy("n-123");
    expect(csp).toContain("script-src 'nonce-n-123'");
    expect(csp).toContain("object-src 'none'");
  });

  test("scriptNonce reads string and object forms", () => {
    expect(scriptNonce("abc")).toBe("abc");
    expect(scriptNonce({ script: "s", style: false })).toBe("s");
    expect(scriptNonce({ script: false, style: "x" })).toBeUndefined();
  });

  test("nodeCspEnabled follows ENABLE_NODE_CSP", () => {
    const prev = process.env.ENABLE_NODE_CSP;
    process.env.ENABLE_NODE_CSP = "1";
    expect(nodeCspEnabled()).toBe(true);
    delete process.env.ENABLE_NODE_CSP;
    expect(nodeCspEnabled()).toBe(false);
    if (prev !== undefined) process.env.ENABLE_NODE_CSP = prev;
  });
});