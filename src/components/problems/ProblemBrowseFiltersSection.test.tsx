import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { AuthContextValue } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";
import type { PlatformListResponse } from "../../lib/api/modules/platforms.api";
import { PlatformCatalogProvider } from "../../lib/platforms/platform-catalog-context";
import { ProblemBrowseFiltersSection } from "./ProblemBrowseFiltersSection";

afterEach(cleanup);

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

describe("ProblemBrowseFiltersSection", () => {
  test("primary filters stay visible when advanced section is collapsed", () => {
    sessionStorage.removeItem("practice.problems.browseAdvancedFiltersExpanded");
    const view = render(() => (
      <AuthContextOverride value={authStub()}>
        <PlatformCatalogProvider
          listPlatforms={vi.fn().mockResolvedValue(platformCatalog)}
        >
          <ProblemBrowseFiltersSection
            searchKey="?status=unsolved"
            topics={() => []}
            topicsLoading={() => false}
            topicsTruncated={() => false}
            clearHref="/app/problems"
            onApply={() => {}}
          />
        </PlatformCatalogProvider>
      </AuthContextOverride>
    ));

    expect(
      view.getByRole("searchbox", { name: /search title/i }),
    ).toBeInTheDocument();
    expect(view.getByLabelText("Status")).toBeInTheDocument();
  });

  test("icon toggles advanced sort and topic filters", () => {
    sessionStorage.setItem(
      "practice.problems.browseAdvancedFiltersExpanded",
      "0",
    );
    const view = render(() => (
      <AuthContextOverride value={authStub()}>
        <PlatformCatalogProvider
          listPlatforms={vi.fn().mockResolvedValue(platformCatalog)}
        >
          <ProblemBrowseFiltersSection
            searchKey=""
            topics={() => []}
            topicsLoading={() => false}
            topicsTruncated={() => false}
            clearHref="/app/problems"
            onApply={() => {}}
          />
        </PlatformCatalogProvider>
      </AuthContextOverride>
    ));

    const toggle = view.getByRole("button", {
      name: /show sort and topic filters/i,
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(view.queryByLabelText("Sort by")).not.toBeInTheDocument();

    fireEvent.click(toggle);
    flush();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(view.getByLabelText("Sort by")).toBeInTheDocument();
  });
});