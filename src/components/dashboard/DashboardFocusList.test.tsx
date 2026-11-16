import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardFocusList } from "./DashboardFocusList";

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

describe("DashboardFocusList", () => {
  test("renders problem title link and unsolved footer", () => {
    const view = render(() => <DashboardFocusList problems={[problem]} />);
    const link = view.getByRole("link", { name: "Two Sum" });
    expect(link).toHaveAttribute(
      "href",
      "/app/problems/22222222-2222-4222-8222-222222222222",
    );
    const viewAll = view.getByRole("link", { name: /View all unsolved/i });
    expect(viewAll.getAttribute("href") ?? "").toContain("status=unsolved");
  });
});