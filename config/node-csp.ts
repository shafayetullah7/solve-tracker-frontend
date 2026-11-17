/** When set, Node assigns `event.nonce` and emits a baseline CSP on HTML. */
export function nodeCspEnabled(): boolean {
  return process.env.ENABLE_NODE_CSP === "1";
}

export function scriptNonce(
  nonce: import("@solidjs/web").CSPNonce | undefined,
): string | undefined {
  if (!nonce) return undefined;
  if (typeof nonce === "string") return nonce;
  const value = nonce.script;
  return value === false ? undefined : value;
}

export function buildContentSecurityPolicy(scriptNonceValue: string): string {
  return [
    "default-src 'self'",
    `script-src 'nonce-${scriptNonceValue}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "frame-ancestors 'none'",
  ].join("; ");
}