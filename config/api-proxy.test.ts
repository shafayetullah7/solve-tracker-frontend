// @vitest-environment node
import { createServer as createHttpServer } from "node:http";
import type { AddressInfo } from "node:net";
import { createServer as createViteServer, createLogger } from "vite";
import { describe, expect, test, vi } from "vitest";
import { createApiProxy } from "./api-proxy";

describe("API proxy", () => {
  test.each([
    undefined,
    "",
    "file:///tmp",
    "https://u:p@example.com",
    "https://example.com/path",
    "https://example.com/?x=1",
    "https://example.com/#x",
  ])("rejects invalid target %s", (target) => {
    expect(() => createApiProxy(target)).toThrow("API_PROXY_TARGET");
  });
  test("forwards through actual Vite with origin/body/query/cookie headers preserved", async () => {
    const received: string[] = [];
    const upstream = createHttpServer(async (request, response) => {
      let body = "";
      for await (const chunk of request) body += chunk;
      received.push(request.url ?? "");
      response.setHeader("Content-Type", "application/json");
      response.setHeader("Set-Cookie", [
        "first=1; HttpOnly; Path=/",
        "second=2; HttpOnly; Path=/",
      ]);
      response.end(
        JSON.stringify({
          url: request.url,
          origin: request.headers.origin,
          marker: request.headers["x-requested-with"],
          cookie: request.headers.cookie,
          body,
        }),
      );
    });
    await new Promise<void>((resolve) =>
      upstream.listen(0, "127.0.0.1", resolve),
    );
    const target = `http://127.0.0.1:${(upstream.address() as AddressInfo).port}`;
    const logger = createLogger("silent");
    logger.error = vi.fn();
    const vite = await createViteServer({
      configFile: false,
      root: process.cwd(),
      customLogger: logger,
      server: { host: "127.0.0.1", port: 0, proxy: createApiProxy(target) },
      appType: "custom",
    });
    try {
      await vite.listen();
      const origin = `http://127.0.0.1:${(vite.httpServer!.address() as AddressInfo).port}`;
      const result = await fetch(`${origin}/api/auth/session?view=compact`, {
        method: "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          "X-Requested-With": "practice",
          Cookie: "first=old",
        },
        body: '{"example":true}',
      });
      expect(await result.json()).toEqual({
        url: "/auth/session?view=compact",
        origin,
        marker: "practice",
        cookie: "first=old",
        body: '{"example":true}',
      });
      expect(result.headers.getSetCookie()).toEqual([
        "first=1; HttpOnly; Path=/",
        "second=2; HttpOnly; Path=/",
      ]);
      await fetch(`${origin}/apix`);
      expect(received).toEqual(["/auth/session?view=compact"]);
      await new Promise<void>((resolve, reject) =>
        upstream.close((error) => (error ? reject(error) : resolve())),
      );
      const unavailable = await fetch(`${origin}/api/unavailable`);
      expect(unavailable.status).toBe(502);
    } finally {
      await vite.close();
      if (upstream.listening)
        await new Promise<void>((resolve) => upstream.close(() => resolve()));
    }
  });
});
