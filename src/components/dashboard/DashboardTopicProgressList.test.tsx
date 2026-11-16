import { cleanup, fireEvent, render, waitFor } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { DashboardTopicProgressList } from "./DashboardTopicProgressList";

const topicId = "11111111-1111-4111-8111-111111111111";

afterEach(cleanup);

describe("DashboardTopicProgressList", () => {
  test("links each topic to library filter", () => {
    const view = render(() => (
      <DashboardTopicProgressList
        topics={[
          {
            id: topicId,
            name: "Arrays",
            total: 5,
            solved: 2,
            unsolved: 3,
            percentComplete: 40,
          },
        ]}
      />
    ));
    const link = view.getByRole("link", { name: "Arrays" });
    expect(link.getAttribute("href")).toContain(`topicId=${topicId}`);
    expect(view.getByRole("progressbar", { name: /Arrays: 40%/ })).toBeInTheDocument();
  });

  test("shows empty state without topics", () => {
    const view = render(() => <DashboardTopicProgressList topics={[]} />);
    expect(view.getByText(/No topics yet/)).toBeInTheDocument();
  });

  test("reorders topics when Most remaining is selected", async () => {
    const lowId = "11111111-1111-4111-8111-111111111111";
    const highId = "22222222-2222-4222-8222-222222222222";
    const view = render(() => (
      <DashboardTopicProgressList
        topics={[
          {
            id: lowId,
            name: "Arrays",
            total: 5,
            solved: 4,
            unsolved: 1,
            percentComplete: 80,
          },
          {
            id: highId,
            name: "Graphs",
            total: 5,
            solved: 0,
            unsolved: 5,
            percentComplete: 0,
          },
        ]}
      />
    ));
    fireEvent.click(view.getByRole("button", { name: "Most remaining" }));
    await waitFor(() => {
      const links = view.getAllByRole("link", { name: /^(Arrays|Graphs)$/ });
      expect(links[0]).toHaveTextContent("Graphs");
      expect(links[1]).toHaveTextContent("Arrays");
    });
    const links = view.getAllByRole("link", { name: /^(Arrays|Graphs)$/ });
    expect(links[0].getAttribute("href")).toContain(`topicId=${highId}`);
  });
});