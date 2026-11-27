import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vitest";
import { ProblemLearningReferences } from "./ProblemLearningReferences";

describe("ProblemLearningReferences", () => {
  it("renders nothing when items are empty", () => {
    const { container } = render(() => <ProblemLearningReferences items={[]} />);
    expect(container.textContent?.trim()).toBe("");
  });

  it("lists guide and step links", () => {
    render(() => (
      <ProblemLearningReferences
        items={[
          {
            guideId: "11111111-1111-4111-8111-111111111111",
            guideTitle: "DSA basics",
            nodeId: "22222222-2222-4222-8222-222222222222",
            nodeTitle: "Two pointers",
          },
        ]}
      />
    ));
    expect(screen.getByRole("link", { name: "Two pointers" })).toHaveAttribute(
      "href",
      "/app/learning/11111111-1111-4111-8111-111111111111/study/22222222-2222-4222-8222-222222222222",
    );
    expect(screen.getByText("DSA basics")).toBeInTheDocument();
  });
});