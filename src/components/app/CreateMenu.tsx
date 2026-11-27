import { Show } from "solid-js";
import { IconPlus } from "../../icons";
import {
  learningImportPath,
  learningNewGuidePath,
} from "../../lib/learning/paths";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";

const TOPIC_CREATE_HASH = "#topic-create-name";

export type CreateMenuProps = {
  learningEnabled: boolean;
  onNavigate?: () => void;
};

export function CreateMenu(props: CreateMenuProps) {
  const closeOnNavigate = () => props.onNavigate?.();

  return (
    <details class="group relative">
      <summary
        class="ui-button flex w-full cursor-pointer list-none items-center justify-center gap-2 [&::-webkit-details-marker]:hidden"
        data-variant="primary"
        aria-haspopup="menu"
      >
        <IconPlus class="h-5 w-5 shrink-0" />
        Create
      </summary>
      <div
        class="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-panel border border-line bg-surface p-2 shadow-panel"
        role="menu"
        aria-label="Create"
      >
        <Show when={props.learningEnabled}>
          <a
            class="flex min-h-11 items-center rounded-control px-3 text-sm text-ink hover:bg-surface-muted"
            role="menuitem"
            href={learningNewGuidePath()}
            onClick={closeOnNavigate}
          >
            New guide
          </a>
          <a
            class="flex min-h-11 items-center rounded-control px-3 text-sm text-ink hover:bg-surface-muted"
            role="menuitem"
            href={learningImportPath()}
            onClick={closeOnNavigate}
          >
            Import guide
          </a>
        </Show>
        <a
          class="flex min-h-11 items-center rounded-control px-3 text-sm text-ink hover:bg-surface-muted"
          role="menuitem"
          href={problemNewPath()}
          onClick={closeOnNavigate}
        >
          Add problem
        </a>
        <a
          class="flex min-h-11 items-center rounded-control px-3 text-sm text-ink hover:bg-surface-muted"
          role="menuitem"
          href={`${paths.app.topics()}${TOPIC_CREATE_HASH}`}
          onClick={closeOnNavigate}
        >
          New topic
        </a>
      </div>
    </details>
  );
}