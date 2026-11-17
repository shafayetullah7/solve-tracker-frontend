import type { ProxyOptions } from "vite";
import { resolveApiProxyOrigin, rewriteApiPath } from "./api-proxy-origin.ts";

export function createApiProxy(
  value: string | undefined,
): Record<string, ProxyOptions> {
  const origin = resolveApiProxyOrigin(value);
  return {
    "^/api(?:/|\\?|$)": {
      target: origin,
      changeOrigin: false,
      rewrite: (path) => rewriteApiPath(path),
    },
  };
}