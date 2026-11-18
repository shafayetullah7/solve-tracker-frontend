import { render } from "@solidjs/testing-library";
import { onSettled } from "solid-js";
import { describe, expect, test, vi } from "vitest";
import type { AuthContextValue } from "../auth/context";
import { AuthContextOverride } from "../auth/context";
import type { PlatformListResponse } from "../api/modules/platforms.api";
import {
  PlatformCatalogProvider,
  usePlatformCatalog,
} from "./platform-catalog-context";

const sample: PlatformListResponse = {
  items: [
    {
      slug: "leetcode",
      name: "LeetCode",
      baseUrl: "https://leetcode.com",
      urlHosts: ["leetcode.com"],
    },
  ],
};

function authStub(): AuthContextValue {
  return {
    status: () => "authenticated",
    user: () => ({ id: "u1", name: "T", email: "t@e.test" }),
    account: () => undefined,
    productClient: { request: vi.fn() } as AuthContextValue["productClient"],
    authApi: {} as AuthContextValue["authApi"],
    coordinator: {} as AuthContextValue["coordinator"],
    supportsAutoRecovery: true,
    revocationUnconfirmed: () => false,
    establishSession: vi.fn(),
    clearSession: vi.fn(),
    retryBootstrap: vi.fn(),
    reloadSession: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
  };
}

function Probe(props: {
  onUpdate?: (catalog: ReturnType<typeof usePlatformCatalog>) => void;
}) {
  const catalog = usePlatformCatalog();
  onSettled(() => {
    props.onUpdate?.(catalog);
  });
  return (
    <p data-testid="status">{catalog.status()}</p>
  );
}

describe("PlatformCatalogProvider", () => {
  test("loads catalog once and becomes ready", async () => {
    const listPlatforms = vi.fn().mockResolvedValue(sample);
    const { getByTestId } = render(() => (
      <AuthContextOverride value={authStub()}>
        <PlatformCatalogProvider listPlatforms={listPlatforms}>
          <Probe />
        </PlatformCatalogProvider>
      </AuthContextOverride>
    ));
    await vi.waitFor(() =>
      expect(getByTestId("status")).toHaveTextContent("ready"),
    );
    expect(listPlatforms).toHaveBeenCalledTimes(1);
  });

  test("dedupes concurrent loadCatalog calls", async () => {
    const listPlatforms = vi.fn().mockResolvedValue(sample);
    let catalogRef: ReturnType<typeof usePlatformCatalog> | undefined;
    render(() => (
      <AuthContextOverride value={authStub()}>
        <PlatformCatalogProvider listPlatforms={listPlatforms}>
          <Probe
            onUpdate={(catalog) => {
              catalogRef = catalog;
            }}
          />
        </PlatformCatalogProvider>
      </AuthContextOverride>
    ));
    await vi.waitFor(() => expect(catalogRef?.status()).toBe("ready"));
    await catalogRef?.loadCatalog();
    await catalogRef?.loadCatalog();
    expect(listPlatforms).toHaveBeenCalledTimes(1);
  });

  test("reloadCatalog retries after error", async () => {
    const listPlatforms = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(sample);
    let catalogRef: ReturnType<typeof usePlatformCatalog> | undefined;
    render(() => (
      <AuthContextOverride value={authStub()}>
        <PlatformCatalogProvider listPlatforms={listPlatforms}>
          <Probe
            onUpdate={(catalog) => {
              catalogRef = catalog;
            }}
          />
        </PlatformCatalogProvider>
      </AuthContextOverride>
    ));
    await vi.waitFor(() => expect(catalogRef?.status()).toBe("error"));
    await catalogRef?.reloadCatalog();
    await vi.waitFor(() => expect(catalogRef?.status()).toBe("ready"));
    expect(listPlatforms).toHaveBeenCalledTimes(2);
    expect(catalogRef?.entries()).toHaveLength(1);
  });
});