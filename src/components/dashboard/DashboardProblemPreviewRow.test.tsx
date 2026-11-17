import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { DashboardProblemPreviewRow } from "./DashboardProblemPreviewRow";

afterEach(cleanup);

const problem: ProblemResponse = {
  id: "33333333-3333-4333-8333-333333333333",
  title: "Graph Path",
  url: "https://codeforces.com/problemset/problem/1/A",
  platformSlug: "codeforces",
  platformProblemId: null,
  difficulty: null,
  rating: null,
  notes: null,
  status: "solved" as const,
  solvedAt: "2026-02-01T00:00:00.000Z",
  topics: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-02-01T00:00:00.000Z",
};

describe("DashboardProblemPreviewRow", () => {
  test("links to detail and shows platform label", () => {
    const view = render(() => <DashboardProblemPreviewRow problem={problem} />);
    expect(view.getByRole("link", { name: "Graph Path" })).toHaveAttribute(
      "href",
      "/app/problems/33333333-3333-4333-8333-333333333333",
    );
    expect(view.getByText(/Codeforces/i)).toBeInTheDocument();
  });
});