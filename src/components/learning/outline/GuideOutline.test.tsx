import { cleanup, render } from "@solidjs/testing-library";
import { afterEach, describe, expect, test } from "vitest";
import type { NodeResponse } from "../../../lib/api/modules/learning-guides.api";
import { learningStudyPath } from "../../../lib/learning/paths";
import { GuideOutline } from "./GuideOutline";

afterEach(cleanup);

const guideId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const ids = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
  "33333333-3333-4333-8333-333333333333",
  "44444444-4444-4444-8444-444444444444",
] as const;

function node(
  id: string,
  parentId: string | null,
  position: number,
  title: string,
): NodeResponse {
  return {
    id,
    parentId,
    title,
    position,
    required: true,
    completionMode: "structural",
    contentRevision: "1",
    requirementRevision: "1",
    completed: false,
  };
}

function fourLevelTree(longLeafTitle: string): NodeResponse[] {
  return [
    node(ids[0], null, 0, "Level one — root"),
    node(ids[1], ids[0], 0, "Level two — branch"),
    node(ids[2], ids[1], 0, "Level three — nested"),
    node(ids[3], ids[2], 0, longLeafTitle),
  ];
}

describe("GuideOutline", () => {
  test("renders study links for four nested levels", () => {
    const nodes = fourLevelTree("Level four — leaf");
    const view = render(() => <GuideOutline guideId={guideId} nodes={nodes} currentNodeId={ids[2]} />);
    for (const id of ids) {
      const href = learningStudyPath(guideId, id);
      expect(view.getByRole("link", { name: new RegExp(nodes.find((n) => n.id === id)!.title.slice(0, 12)) })).toHaveAttribute(
        "href",
        href,
      );
    }
    expect(view.container.querySelectorAll("ul").length).toBeGreaterThanOrEqual(4);
    expect(view.getByRole("link", { name: /Level three/ })).toHaveAttribute("aria-current", "page");
  });

  test("structure actions use min-h-11 touch targets on row buttons", () => {
    const nodes = fourLevelTree("Leaf step");
    const onSelect = () => {};
    const view = render(() => (
      <GuideOutline guideId={guideId} nodes={nodes} onSelect={onSelect} showActions />
    ));
    const rowButtons = view.container.querySelectorAll("button.min-h-11");
    expect(rowButtons.length).toBe(4);
    expect(view.getAllByRole("link", { name: "Study" }).length).toBe(4);
    expect(view.getAllByRole("link", { name: "Content" }).length).toBe(4);
  });

  test("very long leaf title renders without error", () => {
    const longTitle = `${"DeepTitleSegment".repeat(15)}-end`;
    const nodes = fourLevelTree(longTitle);
    const view = render(() => <GuideOutline guideId={guideId} nodes={nodes} />);
    expect(view.getByText(longTitle)).toBeInTheDocument();
  });
});