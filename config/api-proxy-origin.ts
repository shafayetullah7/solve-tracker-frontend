/** Validates `API_PROXY_TARGET` and returns the backend origin (no trailing path). */
export function resolveApiProxyOrigin(value: string | undefined): string {
  let target: URL;
  try {
    target = new URL(value ?? "");
  } catch {
    throw new Error("API_PROXY_TARGET must be an explicit HTTP(S) origin.");
  }
  if (
    !["http:", "https:"].includes(target.protocol) ||
    target.username ||
    target.password ||
    target.pathname !== "/" ||
    target.search ||
    target.hash
  ) {
    throw new Error(
      "API_PROXY_TARGET must be an HTTP(S) origin without credentials, path, query, or fragment.",
    );
  }
  return target.origin;
}

export function rewriteApiPath(pathWithSearch: string): string {
  return pathWithSearch.replace(/^\/api(?=\/|\?|$)/, "") || "/";
}