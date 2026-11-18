import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import { TopicProgressRow } from "./TopicProgressRow";

const topicId = "11111111-1111-4111-8111-111111111111";

afterEach(cleanup);

describe("TopicProgressRow", () => {
  test("links topic and shows progress bar with detail", () => {
    const view = render(() => (
      <TopicProgressRow
        row={{
          id: topicId,
          name: "Arrays",
          total: 5,
          solved: 2,
          unsolved: 3,
          percentComplete: 40,
        }}
      />
    ));
    const link = view.getByRole("link", { name: "Arrays" });
    expect(link.getAttribute("href")).toContain(`topicId=${topicId}`);
    expect(view.getByRole("progressbar", { name: /Arrays: 40%/ })).toBeInTheDocument();
    expect(view.getByText("2 / 5 solved (40%)")).toBeInTheDocument();
  });

  test("empty topic shows friendly detail without implying zero solved fraction", () => {
    const view = render(() => (
      <TopicProgressRow
        row={{
          id: topicId,
          name: "Empty",
          total: 0,
          solved: 0,
          unsolved: 0,
          percentComplete: 0,
        }}
      />
    ));
    expect(view.getByText("No problems linked yet")).toBeInTheDocument();
  });

  test("progress unavailable hides bar", () => {
    const view = render(() => (
      <TopicProgressRow
        progressUnavailable
        row={{
          id: topicId,
          name: "Arrays",
          total: 5,
          solved: 2,
          unsolved: 3,
          percentComplete: 40,
        }}
      />
    ));
    expect(view.queryByRole("progressbar")).toBeNull();
    expect(view.getByText("Progress unavailable")).toBeInTheDocument();
  });
});