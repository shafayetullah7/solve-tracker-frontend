import { render, screen } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import type { ProblemResponse } from "../../lib/api/modules/problems.api";
import { ProblemLibraryRow } from "./ProblemLibraryRow";

const problem: ProblemResponse = {
  id: "p1",
  title: "Two Sum",
  url: "https://leetcode.com/problems/two-sum",
  status: "unsolved",
  platformProblemId: null,
  difficulty: null,
  rating: null,
  notes: null,
  solvedAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  topics: [{ id: "t1", name: "Array" }],
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("ProblemLibraryRow", () => {
  test("shows Open, mark completion, and More without hover", () => {
    render(() => (
      <ul>
        <ProblemLibraryRow
          problem={problem}
          statusPending={false}
          onToggleCompletion={() => {}}
          onDelete={() => {}}
        />
      </ul>
    ));

    expect(screen.getByRole("link", { name: "Open" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Mark solved/i })).toBeVisible();
    expect(screen.getByText("More")).toBeVisible();
    expect(screen.queryByRole("link", { name: "View" })).not.toBeInTheDocument();
  });
});