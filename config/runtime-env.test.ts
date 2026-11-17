import { afterEach, describe, expect, test, vi } from "vitest";

describe("runtime-env", () => {
  const prevTarget = process.env.API_PROXY_TARGET;
  const prevNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    vi.resetModules();
    if (prevTarget === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = prevTarget;
    if (prevNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNodeEnv;
  });

  test("hydrates API_PROXY_TARGET from .env on disk", async () => {
    delete process.env.API_PROXY_TARGET;
    vi.resetModules();
    const { apiProxyTargetForRuntime } = await import("./runtime-env");
    expect(apiProxyTargetForRuntime()).toBe("http://localhost:3000");
  });

  test("dev default localhost:3000 when unset and no .env value", async () => {
    process.env.API_PROXY_TARGET = "http://localhost:3000";
    delete process.env.NODE_ENV;
    vi.resetModules();
    const { apiProxyTargetForRuntime } = await import("./runtime-env");
    expect(apiProxyTargetForRuntime()).toBe("http://localhost:3000");
  });
});