import { cleanup, fireEvent, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DashboardContinueLearningSection } from "./DashboardContinueLearningSection";
import type { DashboardContinueGuide } from "../../lib/dashboard/load-dashboard-continue-learning";

afterEach(cleanup);

const guideId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const row: DashboardContinueGuide = {
  guide: {
    id: guideId,
    title: "Graph theory",
    description: "",
    structureRevision: "1",
    metadataRevision: "1",
    archivedAt: null,
    deletedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  resumeNodeId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  progress: { completedRequired: 2, totalRequired: 5, percent: 40 },
  resumeHref: `/app/learning/${guideId}/study/bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb`,
  resumeLabel: "Continue",
};

describe("DashboardContinueLearningSection", () => {
  test("loading shows heading and placeholder", () => {
    const view = render(() => (
      <DashboardContinueLearningSection status="loading" items={[]} />
    ));
    expect(view.getByRole("heading", { name: "Continue learning" })).toBeInTheDocument();
    expect(view.getByText(/required study steps only/)).toBeInTheDocument();
  });

  test("error shows retry", async () => {
    const onRetry = vi.fn();
    const view = render(() => (
      <DashboardContinueLearningSection
        status="error"
        items={[]}
        errorMessage="Network error"
        onRetry={onRetry}
      />
    ));
    expect(view.getByRole("alert")).toHaveTextContent("Network error");
    await fireEvent.click(view.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  test("empty ready shows create and import links", () => {
    const view = render(() => (
      <DashboardContinueLearningSection status="ready" items={[]} />
    ));
    expect(view.getByText(/No guides yet/)).toBeInTheDocument();
    expect(view.getByRole("link", { name: "New guide" })).toHaveAttribute(
      "href",
      "/app/learning/new",
    );
    expect(view.getByRole("link", { name: "import" })).toHaveAttribute(
      "href",
      "/app/learning/import",
    );
  });

  test("ready shows guide card and continue link", () => {
    const view = render(() => (
      <DashboardContinueLearningSection status="ready" items={[row]} />
    ));
    expect(view.getByRole("link", { name: "Graph theory" })).toHaveAttribute(
      "href",
      `/app/learning/${guideId}`,
    );
    expect(view.getByRole("link", { name: "Continue" })).toHaveAttribute("href", row.resumeHref);
    expect(view.getByText(/Progress: 2 \/ 5 required steps/)).toBeInTheDocument();
  });
});