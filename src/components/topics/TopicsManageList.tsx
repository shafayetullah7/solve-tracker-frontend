import type { JSX } from "@solidjs/web";
import { createMemo, For, Show } from "solid-js";
import type { TopicProgress } from "../../lib/api/modules/progress.api";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import {
  sortDashboardTopics,
  type DashboardTopicSortMode,
} from "../../lib/dashboard/sort-dashboard-topics";
import { topicProgressForItem } from "../../lib/problems/progress-display";
import { Button } from "../ui/Button";
import { FormAlert } from "../ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../ui/FormField";
import { TopicProgressRow } from "./TopicProgressRow";

export type TopicsManageListProps = {
  items: TopicResponse[];
  progressById: Map<string, TopicProgress>;
  progressUnavailable?: boolean;
  sortMode: DashboardTopicSortMode;
  editingId: string | undefined;
  renameValue: string;
  renameFieldError: string | undefined;
  renameFormBanner: string | undefined;
  renameRetryAfter: string | undefined;
  renamePending: boolean;
  onRenameValueInput: (value: string) => void;
  onRenameClearField: () => void;
  onStartRename: (topic: TopicResponse) => void;
  onCancelRename: () => void;
  onRenameSave: (topicId: string, formEl: HTMLFormElement) => void;
  onOpenDelete: (topic: TopicResponse) => void;
  shareControl?: (topic: TopicResponse) => JSX.Element;
  rowFooter?: (topic: TopicResponse) => JSX.Element;
};

export function TopicsManageList(props: TopicsManageListProps) {
  const sortedItems = createMemo(() => {
    const rows = props.items.map((topic) =>
      topicProgressForItem(topic, props.progressById),
    );
    return sortDashboardTopics(rows, props.sortMode).map((row) => {
      const catalog = props.items.find((item) => item.id === row.id);
      return { row, catalog: catalog! };
    });
  });

  return (
    <ul class="divide-y divide-line rounded-panel border border-line bg-surface shadow-panel">
      <For each={sortedItems()}>
        {({ row, catalog }) => (
          <li class="px-5 py-4">
            <Show
              when={props.editingId === catalog.id}
              fallback={
                <div class="flex flex-col gap-2">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <TopicProgressRow
                    row={row}
                    progressUnavailable={props.progressUnavailable}
                  />
                  <div class="flex shrink-0 flex-wrap items-center gap-2">
                    <Show when={props.shareControl}>
                      {props.shareControl!(catalog)}
                    </Show>
                    <Button variant="secondary" onClick={() => props.onStartRename(catalog)}>
                      Rename
                    </Button>
                    <Button variant="secondary" onClick={() => props.onOpenDelete(catalog)}>
                      Delete
                    </Button>
                  </div>
                </div>
                <Show when={props.rowFooter}>{props.rowFooter!(catalog)}</Show>
                </div>
              }
            >
              <form
                class="space-y-2"
                novalidate
                onSubmit={(event) => {
                  event.preventDefault();
                  props.onRenameSave(catalog.id, event.currentTarget as HTMLFormElement);
                }}
              >
                <FormField
                  id={`topic-rename-${catalog.id}`}
                  label="Rename topic"
                  hint="1–100 characters."
                  error={props.renameFieldError}
                >
                  <input
                    class="ui-field"
                    value={props.renameValue}
                    onInput={(event) => {
                      props.onRenameValueInput(event.currentTarget.value);
                      props.onRenameClearField();
                    }}
                    {...formFieldControlAttrs({
                      id: `topic-rename-${catalog.id}`,
                      hint: "1–100 characters.",
                      error: props.renameFieldError,
                    })}
                  />
                </FormField>
                <Show when={props.renameFormBanner}>
                  <FormAlert variant="error" retryAfter={props.renameRetryAfter}>
                    {props.renameFormBanner}
                  </FormAlert>
                </Show>
                <div class="flex flex-wrap gap-2">
                  <Button type="submit" disabled={props.renamePending}>
                    {props.renamePending ? "Saving…" : "Save"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={props.onCancelRename}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Show>
          </li>
        )}
      </For>
    </ul>
  );
}