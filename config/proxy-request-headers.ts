/** Strip client-supplied forwarding headers unless the edge is trusted. */
export function trustProxyHeaders(): boolean {
  return process.env.TRUST_PROXY_HEADERS === "1";
}

const FORWARDED_HEADER_NAMES = [
  "forwarded",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
  "x-real-ip",
] as const;

export function headersForApiProxy(incoming: Headers): Headers {
  const headers = new Headers(incoming);
  if (!trustProxyHeaders()) {
    for (const name of FORWARDED_HEADER_NAMES) {
      headers.delete(name);
    }
  }
  return headers;
}