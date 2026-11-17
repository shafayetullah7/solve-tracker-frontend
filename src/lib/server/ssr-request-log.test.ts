import { describe, expect, test, vi } from "vitest";
import { logSsrRequestFailure } from "./ssr-request-log";

describe("logSsrRequestFailure", () => {
  test("logs path and message without cookie header", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const event = {
      request: new Request("http://localhost:3001/app", {
        headers: { cookie: "practice_access=secret" },
      }),
    };
    logSsrRequestFailure(new Error("stream broke"), event as never);
    expect(spy).toHaveBeenCalledOnce();
    const line = String(spy.mock.calls[0]![0]);
    expect(line).toContain("GET");
    expect(line).toContain("/app");
    expect(line).toContain("stream broke");
    expect(line).not.toContain("secret");
    expect(line).not.toContain("cookie");
    spy.mockRestore();
  });
});