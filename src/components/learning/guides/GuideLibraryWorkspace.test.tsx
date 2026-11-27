import { cleanup, fireEvent, render, waitFor } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { GuideLibraryWorkspace } from "./GuideLibraryWorkspace";

const guide = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "Algorithms",
  description: "Core patterns",
  structureRevision: "1",
  metadataRevision: "2",
  archivedAt: null,
  deletedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const routerMocks = vi.hoisted(() => ({
  search: "",
  navigate: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  list: vi.fn(),
  enrollment: vi.fn(),
  lifecycle: vi.fn(),
}));

vi.mock("@solidjs/router", () => ({
  useLocation: () => ({
    pathname: "/app/learning",
    search: routerMocks.search,
    hash: "",
    state: {},
    query: {},
    key: "",
  }),
  useNavigate: () => routerMocks.navigate,
}));

function mockApi() {
  return {
    list: apiMocks.list,
    enrollment: apiMocks.enrollment,
    lifecycle: apiMocks.lifecycle,
  } as unknown as Parameters<typeof GuideLibraryWorkspace>[0]["api"];
}

afterEach(cleanup);

beforeEach(() => {
  routerMocks.search = "";
  routerMocks.navigate.mockReset();
  apiMocks.list.mockReset().mockResolvedValue({
    items: [guide],
    meta: { page: 1, pageSize: 25, total: 1 },
  });
  apiMocks.enrollment.mockReset().mockResolvedValue({
    id: "e1",
    guideId: guide.id,
    resumeNodeId: "22222222-2222-4222-8222-222222222222",
    lastActivityAt: "2026-01-02T00:00:00.000Z",
  });
  apiMocks.lifecycle.mockReset().mockResolvedValue({ resourceId: guide.id, replayed: false });
});

describe("GuideLibraryWorkspace", () => {
  test("loads active guides and shows resume link", async () => {
    const view = render(() => (
      <GuideLibraryWorkspace api={mockApi()} authStatus={() => "authenticated"} />
    ));
    await waitFor(() => {
      expect(view.getByRole("link", { name: "Continue" })).toBeInTheDocument();
    });
    expect(apiMocks.list).toHaveBeenCalledWith(
      expect.objectContaining({ status: "active" }),
      expect.any(AbortSignal),
    );
    expect(view.getByLabelText("Search guides")).toBeInTheDocument();
  });

  test("archived tab requests archived status", async () => {
    routerMocks.search = "?status=archived";
    const view = render(() => (
      <GuideLibraryWorkspace api={mockApi()} authStatus={() => "authenticated"} />
    ));
    flush();
    await waitFor(() => expect(apiMocks.list).toHaveBeenCalled());
    expect(apiMocks.list.mock.calls.at(-1)?.[0]).toMatchObject({ status: "archived" });
    expect(view.getByRole("tab", { name: "Archived" })).toHaveAttribute("aria-selected", "true");
  });

  test("archive calls lifecycle", async () => {
    const view = render(() => (
      <GuideLibraryWorkspace api={mockApi()} authStatus={() => "authenticated"} />
    ));
    await waitFor(() => view.getByRole("button", { name: "Archive" }));
    await fireEvent.click(view.getByRole("button", { name: "Archive" }));
    await waitFor(() =>
      expect(apiMocks.lifecycle).toHaveBeenCalledWith(
        guide.id,
        expect.objectContaining({ action: "archive", expectedMetadataRevision: "2" }),
      ),
    );
  });
});