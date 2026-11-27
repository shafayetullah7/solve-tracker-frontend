import { render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { PlatformListResponse } from "../../../lib/api/modules/platforms.api";
import type { AuthContextValue } from "../../../lib/auth/context";
import { AuthContextOverride } from "../../../lib/auth/context";
import { PlatformCatalogProvider } from "../../../lib/platforms/platform-catalog-context";
import { problemDetailPath } from "../../../lib/problems/paths";
import { BlockList } from "./BlockViews";

afterEach(() => vi.restoreAllMocks());

const platformCatalog: PlatformListResponse = {
  items: [
    {
      slug: "leetcode",
      name: "LeetCode",
      baseUrl: "https://leetcode.com",
      urlHosts: ["leetcode.com"],
    },
  ],
};

const listPlatforms = vi.fn().mockResolvedValue(platformCatalog);

function authStub(): AuthContextValue {
  return {
    status: () => "authenticated",
    user: () => ({ id: "u1", name: "T", email: "t@e.test", handle: "test_user" }),
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

function renderWithCatalog(ui: () => ReturnType<typeof BlockList>) {
  return render(() => (
    <AuthContextOverride value={authStub()}>
      <PlatformCatalogProvider listPlatforms={listPlatforms}>{ui()}</PlatformCatalogProvider>
    </AuthContextOverride>
  ));
}

const guideId = "11111111-1111-4111-8111-111111111111";
const nodeId = "22222222-2222-4222-8222-222222222222";
const problemId = "33333333-3333-4333-8333-333333333333";

describe("BlockList", () => {
  test("renders text as plain text without executing markup", () => {
    const { container } = renderWithCatalog(() => (
      <BlockList
        blocks={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            position: 0,
            type: "text",
            payload: { body: "<script>alert(1)</script>safe" },
            schemaVersion: 1,
          },
        ]}
      />
    ));
    expect(container.textContent).toContain("safe");
    expect(container.querySelector("script")).toBeNull();
  });

  test("unresolved problem block offers add to library with prefill", () => {
    const { getByRole } = renderWithCatalog(() => (
      <BlockList
        guideId={guideId}
        returnNodeId={nodeId}
        blocks={[
          {
            id: "44444444-4444-4444-8444-444444444444",
            position: 0,
            type: "problem",
            payload: {
              url: "https://leetcode.com/problems/two-sum/",
              label: "Two Sum",
            },
            problemResolution: "unresolved",
            schemaVersion: 1,
          },
        ]}
      />
    ));
    const add = getByRole("link", { name: "Add to library" });
    expect(add.getAttribute("href")).toContain("/app/problems/new?");
    expect(add.getAttribute("href")).toContain(encodeURIComponent("https://leetcode.com/problems/two-sum/"));
    expect(add.getAttribute("href")).toContain(encodeURIComponent(`/app/learning/${guideId}/study/${nodeId}`));
  });

  test("code block uses horizontal scroll container", () => {
    const longLine = "x".repeat(200);
    const { container } = renderWithCatalog(() => (
      <BlockList
        blocks={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            position: 0,
            type: "code",
            payload: { language: "rust", body: longLine },
            schemaVersion: 1,
          },
        ]}
      />
    ));
    const pre = container.querySelector("pre");
    expect(pre).not.toBeNull();
    expect(pre?.className).toContain("overflow-x-auto");
  });

  test("text block uses break-words for long unbroken content", () => {
    const longUrl = `https://example.com/${"segment/".repeat(40)}end`;
    const { container } = renderWithCatalog(() => (
      <BlockList
        blocks={[
          {
            id: "11111111-1111-4111-8111-111111111111",
            position: 0,
            type: "text",
            payload: { body: longUrl },
            schemaVersion: 1,
          },
        ]}
      />
    ));
    const paragraph = container.querySelector("p.break-words");
    expect(paragraph).not.toBeNull();
    expect(paragraph?.textContent).toContain("https://example.com/");
  });

  test("solved problem block links to library detail", () => {
    const { getByRole, getByText } = renderWithCatalog(() => (
      <BlockList
        guideId={guideId}
        returnNodeId={nodeId}
        blocks={[
          {
            id: "44444444-4444-4444-8444-444444444444",
            position: 0,
            type: "problem",
            payload: {
              url: "https://leetcode.com/problems/two-sum/",
              label: "Two Sum",
            },
            problemResolution: "solved",
            problemId,
            schemaVersion: 1,
          },
        ]}
      />
    ));
    expect(getByText(/Solved \(manual\)/)).toBeDefined();
    const library = getByRole("link", { name: "View in library" });
    expect(library.getAttribute("href")).toBe(problemDetailPath(problemId));
  });
});