import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardQueueGrid } from "./DashboardQueueGrid";

afterEach(cleanup);

const problem = {
  id: "22222222-2222-4222-8222-222222222222",
  title: "Two Sum",
  url: "https://leetcode.com/problems/two-sum/",
  platformProblemId: null,
  difficulty: null,
  rating: null,
  notes: null,
  status: "unsolved" as const,
  solvedAt: null,
  topics: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("DashboardQueueGrid", () => {
  test("renders three queue columns when ready", () => {
    const view = render(() => (
      <DashboardQueueGrid
        status="ready"
        focus={[problem]}
        recentAdded={[]}
        recentSolved={[]}
      />
    ));
    expect(view.getByRole("heading", { name: "Pick up next" })).toBeInTheDocument();
    expect(view.getByRole("heading", { name: "Recently added" })).toBeInTheDocument();
    expect(view.getByRole("heading", { name: "Recently solved" })).toBeInTheDocument();
    expect(view.getByRole("link", { name: "Two Sum" })).toHaveAttribute(
      "href",
      "/app/problems/22222222-2222-4222-8222-222222222222",
    );
  });

  test("shows error alert when previews fail", () => {
    const view = render(() => (
      <DashboardQueueGrid
        status="error"
        focus={[]}
        recentAdded={[]}
        recentSolved={[]}
        errorMessage="Network error"
      />
    ));
    expect(view.getByRole("alert")).toHaveTextContent("Network error");
  });
});