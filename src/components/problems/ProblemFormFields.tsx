import { type Accessor, For, Show } from "solid-js";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import type { FieldErrors } from "../../lib/auth/forms";
import {
  PROBLEM_DIFFICULTY_MAX,
  PROBLEM_NOTES_MAX,
  PROBLEM_PLATFORM_ID_MAX,
  PROBLEM_RATING_MAX,
  PROBLEM_RATING_MIN,
  PROBLEM_TITLE_MAX,
  PROBLEM_TITLE_MIN,
  PROBLEM_URL_HINT,
  PROBLEM_URL_MAX,
} from "../../lib/problems/fields";

export type ProblemFormMode = "create" | "edit";

type ProblemFormFieldsProps = {
  mode: ProblemFormMode;
  formId: string;
  title: Accessor<string>;
  onTitleInput: (value: string) => void;
  url: Accessor<string>;
  onUrlInput: (value: string) => void;
  platformProblemId: Accessor<string>;
  onPlatformProblemIdInput: (value: string) => void;
  difficulty: Accessor<string>;
  onDifficultyInput: (value: string) => void;
  rating: Accessor<string>;
  onRatingInput: (value: string) => void;
  notes: Accessor<string>;
  onNotesInput: (value: string) => void;
  alreadySolved: Accessor<boolean>;
  onAlreadySolvedChange: (value: boolean) => void;
  selectedTopicIds: Accessor<Set<string>>;
  onTopicToggle: (topicId: string, checked: boolean) => void;
  topics: Accessor<TopicResponse[]>;
  topicsLoading: Accessor<boolean>;
  topicsTruncated: Accessor<boolean>;
  fieldErrors: Accessor<FieldErrors>;
  formError: Accessor<string | undefined>;
  existingProblemId: Accessor<string | undefined>;
  existingProblemHref?: string;
};

export function ProblemFormFields(props: ProblemFormFieldsProps) {
  const isSelected = (id: string) => props.selectedTopicIds().has(id);

  return (
    <div class="space-y-4">
      <div>
        <label class="mb-2 block text-sm font-medium" for={`${props.formId}-title`}>
          Title
        </label>
        <input
          id={`${props.formId}-title`}
          class="ui-field"
          value={props.title()}
          onInput={(event) => props.onTitleInput(event.currentTarget.value)}
          aria-invalid={props.fieldErrors().title ? "true" : undefined}
          aria-describedby={`${props.formId}-title-hint ${props.formId}-title-error`}
          required
        />
        <p id={`${props.formId}-title-hint`} class="mt-2 text-sm text-muted">
          {PROBLEM_TITLE_MIN}–{PROBLEM_TITLE_MAX} characters.
        </p>
        <Show when={props.fieldErrors().title}>
          <p id={`${props.formId}-title-error`} class="mt-2 text-sm text-danger">
            {props.fieldErrors().title}
          </p>
        </Show>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium" for={`${props.formId}-url`}>
          Problem URL
        </label>
        <input
          id={`${props.formId}-url`}
          class="ui-field"
          type="url"
          inputmode="url"
          autocomplete="url"
          value={props.url()}
          onInput={(event) => props.onUrlInput(event.currentTarget.value)}
          aria-invalid={props.fieldErrors().url ? "true" : undefined}
          aria-describedby={`${props.formId}-url-hint ${props.formId}-url-error`}
          required
        />
        <p id={`${props.formId}-url-hint`} class="mt-2 text-sm text-muted">
          {PROBLEM_URL_HINT} Up to {PROBLEM_URL_MAX} characters.
        </p>
        <Show when={props.fieldErrors().url}>
          <p id={`${props.formId}-url-error`} class="mt-2 text-sm text-danger">
            {props.fieldErrors().url}
          </p>
        </Show>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            class="mb-2 block text-sm font-medium"
            for={`${props.formId}-platform-id`}
          >
            Platform problem ID <span class="text-muted">(optional)</span>
          </label>
          <input
            id={`${props.formId}-platform-id`}
            class="ui-field"
            value={props.platformProblemId()}
            onInput={(event) => props.onPlatformProblemIdInput(event.currentTarget.value)}
            aria-invalid={props.fieldErrors().platformProblemId ? "true" : undefined}
            aria-describedby={`${props.formId}-platform-hint`}
          />
          <p id={`${props.formId}-platform-hint`} class="mt-2 text-sm text-muted">
            Up to {PROBLEM_PLATFORM_ID_MAX} characters.
          </p>
        </div>
        <div>
          <label
            class="mb-2 block text-sm font-medium"
            for={`${props.formId}-difficulty`}
          >
            Difficulty <span class="text-muted">(optional)</span>
          </label>
          <input
            id={`${props.formId}-difficulty`}
            class="ui-field"
            value={props.difficulty()}
            onInput={(event) => props.onDifficultyInput(event.currentTarget.value)}
            aria-invalid={props.fieldErrors().difficulty ? "true" : undefined}
          />
          <p class="mt-2 text-sm text-muted">Up to {PROBLEM_DIFFICULTY_MAX} characters.</p>
        </div>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium" for={`${props.formId}-rating`}>
          Rating <span class="text-muted">(optional)</span>
        </label>
        <input
          id={`${props.formId}-rating`}
          class="ui-field"
          type="number"
          inputmode="numeric"
          value={props.rating()}
          onInput={(event) => props.onRatingInput(event.currentTarget.value)}
          aria-invalid={props.fieldErrors().rating ? "true" : undefined}
        />
        <p class="mt-2 text-sm text-muted">
          Integer from {PROBLEM_RATING_MIN.toLocaleString()} to{" "}
          {PROBLEM_RATING_MAX.toLocaleString()}.
        </p>
        <Show when={props.fieldErrors().rating}>
          <p class="mt-2 text-sm text-danger">{props.fieldErrors().rating}</p>
        </Show>
      </div>

      <div>
        <label class="mb-2 block text-sm font-medium" for={`${props.formId}-notes`}>
          Notes <span class="text-muted">(optional)</span>
        </label>
        <textarea
          id={`${props.formId}-notes`}
          class="ui-field min-h-28"
          value={props.notes()}
          onInput={(event) => props.onNotesInput(event.currentTarget.value)}
          aria-invalid={props.fieldErrors().notes ? "true" : undefined}
        />
        <p class="mt-2 text-sm text-muted">Up to {PROBLEM_NOTES_MAX.toLocaleString()} characters.</p>
        <Show when={props.fieldErrors().notes}>
          <p class="mt-2 text-sm text-danger">{props.fieldErrors().notes}</p>
        </Show>
      </div>

      <fieldset class="space-y-3">
        <legend class="text-sm font-medium">Topics</legend>
        <Show when={props.topicsLoading()}>
          <p class="text-sm text-muted" role="status">
            Loading your topics…
          </p>
        </Show>
        <Show when={!props.topicsLoading() && props.topics().length === 0}>
          <p class="text-sm text-muted">No topics yet. You can still save without topics.</p>
        </Show>
        <Show when={!props.topicsLoading() && props.topics().length > 0}>
          <Show when={props.topicsTruncated()}>
            <p class="text-sm text-muted" role="status">
              Showing the first 100 topics.
            </p>
          </Show>
          <ul class="space-y-2">
            <For each={props.topics()}>
              {(topic) => (
                <li>
                  <label class="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isSelected(topic.id)}
                      onChange={(event) =>
                        props.onTopicToggle(topic.id, event.currentTarget.checked)
                      }
                    />
                    <span>{topic.name}</span>
                  </label>
                </li>
              )}
            </For>
          </ul>
        </Show>
        <Show when={props.fieldErrors().topicIds}>
          <p class="text-sm text-danger">{props.fieldErrors().topicIds}</p>
        </Show>
      </fieldset>

      <Show when={props.mode === "create"}>
        <label class="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={props.alreadySolved()}
            onChange={(event) => props.onAlreadySolvedChange(event.currentTarget.checked)}
          />
          <span>Already solved</span>
        </label>
      </Show>

      <Show when={props.formError()}>
        <p class="text-sm text-danger" role="alert">
          {props.formError()}
        </p>
      </Show>

      <Show when={props.existingProblemId() && props.existingProblemHref}>
        <p class="text-sm text-muted">
          <a
            class="text-brand underline-offset-4 hover:underline"
            href={props.existingProblemHref}
          >
            View the problem already using this URL
          </a>
        </p>
      </Show>
    </div>
  );
}