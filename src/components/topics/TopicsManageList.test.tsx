import { cleanup, fireEvent, render, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import { TopicsManageList } from "./TopicsManageList";

const lowId = "11111111-1111-4111-8111-111111111111";
const highId = "22222222-2222-4222-8222-222222222222";

function topic(id: string, name: string): TopicResponse {
  return {
    id,
    name,
    isPublic: false,
    description: "",
    createdAt: "2020-01-01T00:00:00.000Z",
    updatedAt: "2020-01-01T00:00:00.000Z",
  };
}

afterEach(cleanup);

describe("TopicsManageList", () => {
  test("shows rename and delete actions", () => {
    const view = render(() => (
      <TopicsManageList
        items={[topic(lowId, "Arrays")]}
        progressById={
          new Map([
            [
              lowId,
              {
                id: lowId,
                name: "Arrays",
                total: 1,
                solved: 0,
                unsolved: 1,
                percentComplete: 0,
              },
            ],
          ])
        }
        sortMode="default"
        editingId={undefined}
        renameValue=""
        renameFieldError={undefined}
        renameFormBanner={undefined}
        renameRetryAfter={undefined}
        renamePending={false}
        onRenameValueInput={() => {}}
        onRenameClearField={() => {}}
        onStartRename={() => {}}
        onCancelRename={() => {}}
        onRenameSave={() => {}}
        onOpenDelete={() => {}}
      />
    ));
    expect(view.getByRole("button", { name: "Rename" })).toBeInTheDocument();
    expect(view.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  test("reorders when sort mode is mostRemaining", async () => {
    function Harness() {
      const [sortMode, setSortMode] = createSignal<"default" | "mostIncomplete" | "mostRemaining">(
        "default",
      );
      return (
        <>
          <button type="button" onClick={() => setSortMode("mostRemaining")}>
            Apply sort
          </button>
          <TopicsManageList
            items={[topic(lowId, "Arrays"), topic(highId, "Graphs")]}
            progressById={
              new Map([
                [
                  lowId,
                  {
                    id: lowId,
                    name: "Arrays",
                    total: 5,
                    solved: 4,
                    unsolved: 1,
                    percentComplete: 80,
                  },
                ],
                [
                  highId,
                  {
                    id: highId,
                    name: "Graphs",
                    total: 5,
                    solved: 0,
                    unsolved: 5,
                    percentComplete: 0,
                  },
                ],
              ])
            }
            sortMode={sortMode()}
            editingId={undefined}
            renameValue=""
            renameFieldError={undefined}
            renameFormBanner={undefined}
            renameRetryAfter={undefined}
            renamePending={false}
            onRenameValueInput={() => {}}
            onRenameClearField={() => {}}
            onStartRename={() => {}}
            onCancelRename={() => {}}
            onRenameSave={() => {}}
            onOpenDelete={() => {}}
          />
        </>
      );
    }
    const view = render(() => <Harness />);
    fireEvent.click(view.getByRole("button", { name: "Apply sort" }));
    await waitFor(() => {
      const links = view.getAllByRole("link", { name: /^(Arrays|Graphs)$/ });
      expect(links[0]).toHaveTextContent("Graphs");
      expect(links[1]).toHaveTextContent("Arrays");
    });
  });

  test("calls onStartRename from row action", () => {
    const onStartRename = vi.fn();
    const items = [topic(lowId, "Arrays")];
    const view = render(() => (
      <TopicsManageList
        items={items}
        progressById={new Map()}
        sortMode="default"
        editingId={undefined}
        renameValue=""
        renameFieldError={undefined}
        renameFormBanner={undefined}
        renameRetryAfter={undefined}
        renamePending={false}
        onRenameValueInput={() => {}}
        onRenameClearField={() => {}}
        onStartRename={onStartRename}
        onCancelRename={() => {}}
        onRenameSave={() => {}}
        onOpenDelete={() => {}}
      />
    ));
    fireEvent.click(view.getByRole("button", { name: "Rename" }));
    expect(onStartRename).toHaveBeenCalledWith(items[0]);
  });
});