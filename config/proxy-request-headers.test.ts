import { afterEach, describe, expect, test } from "vitest";
import { headersForApiProxy, trustProxyHeaders } from "./proxy-request-headers";

describe("headersForApiProxy", () => {
  const prev = process.env.TRUST_PROXY_HEADERS;

  afterEach(() => {
    if (prev === undefined) delete process.env.TRUST_PROXY_HEADERS;
    else process.env.TRUST_PROXY_HEADERS = prev;
  });

  test("strips forwarding headers by default", () => {
    delete process.env.TRUST_PROXY_HEADERS;
    const incoming = new Headers({
      cookie: "practice_access=x",
      "x-forwarded-for": "203.0.113.1",
      "x-forwarded-proto": "https",
    });
    const out = headersForApiProxy(incoming);
    expect(out.get("cookie")).toBe("practice_access=x");
    expect(out.get("x-forwarded-for")).toBeNull();
    expect(out.get("x-forwarded-proto")).toBeNull();
    expect(trustProxyHeaders()).toBe(false);
  });

  test("keeps forwarding headers when TRUST_PROXY_HEADERS=1", () => {
    process.env.TRUST_PROXY_HEADERS = "1";
    const incoming = new Headers({ "x-forwarded-for": "203.0.113.1" });
    const out = headersForApiProxy(incoming);
    expect(out.get("x-forwarded-for")).toBe("203.0.113.1");
  });
});