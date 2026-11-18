import { createMemo, type Accessor, For, Show } from "solid-js";
import { useRuntimePlatformHelpers } from "../../lib/platforms/platform-catalog-context";
import { PlatformMark } from "../platforms/PlatformMark";
import type { TopicResponse } from "../../lib/api/modules/topics.api";
import type { FieldErrors } from "../../lib/forms/field-errors";
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
import { FormAlert } from "../ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../ui/FormField";

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
  retryAfter?: Accessor<string | undefined>;
  existingProblemId: Accessor<string | undefined>;
  existingProblemHref?: string;
};

export function ProblemFormFields(props: ProblemFormFieldsProps) {
  const platformHelpers = useRuntimePlatformHelpers();
  const isSelected = (id: string) => props.selectedTopicIds().has(id);
  const titleId = () => `${props.formId}-title`;
  const urlId = () => `${props.formId}-url`;
  const platformId = () => `${props.formId}-platform-id`;
  const difficultyId = () => `${props.formId}-difficulty`;
  const ratingId = () => `${props.formId}-rating`;
  const notesId = () => `${props.formId}-notes`;

  const titleHint = () => `${PROBLEM_TITLE_MIN}–${PROBLEM_TITLE_MAX} characters.`;
  const urlHint = () => `${PROBLEM_URL_HINT} Up to ${PROBLEM_URL_MAX} characters.`;
  const platformHint = () =>
    `Up to ${PROBLEM_PLATFORM_ID_MAX} characters. The judge site is detected from the problem URL above.`;
  const platformPreview = createMemo(() =>
    platformHelpers().previewFromUrl(props.url()),
  );
  const difficultyHint = () => `Up to ${PROBLEM_DIFFICULTY_MAX} characters.`;
  const ratingHint = () =>
    `Integer from ${PROBLEM_RATING_MIN.toLocaleString()} to ${PROBLEM_RATING_MAX.toLocaleString()}.`;
  const notesHint = () => `Up to ${PROBLEM_NOTES_MAX.toLocaleString()} characters.`;

  return (
    <div class="space-y-4">
      <FormField
        id={titleId()}
        label="Title"
        required
        hint={titleHint()}
        error={props.fieldErrors().title}
      >
        <input
          class="ui-field"
          value={props.title()}
          onInput={(event) => props.onTitleInput(event.currentTarget.value)}
          {...formFieldControlAttrs({
            id: titleId(),
            hint: titleHint(),
            error: props.fieldErrors().title,
            required: true,
          })}
        />
      </FormField>

      <FormField
        id={urlId()}
        label="Problem URL"
        required
        hint={urlHint()}
        error={props.fieldErrors().url}
      >
        <input
          class="ui-field"
          type="url"
          inputmode="url"
          autocomplete="url"
          value={props.url()}
          onInput={(event) => props.onUrlInput(event.currentTarget.value)}
          {...formFieldControlAttrs({
            id: urlId(),
            hint: urlHint(),
            error: props.fieldErrors().url,
            required: true,
          })}
        />
      </FormField>

      <div class="space-y-1" aria-live="polite">
        <p class="text-sm text-muted">
          Detected platform:{" "}
          <Show
            when={platformPreview().label !== "Enter a URL to detect the judge."}
            fallback={
              <span class="text-body">{platformPreview().label}</span>
            }
          >
            <PlatformMark slug={platformPreview().slug} class="inline-flex" />
          </Show>
        </p>
        <p class="text-caption text-muted">
          Preview only. The saved platform is determined from this URL on the server.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <FormField
          id={platformId()}
          label="Judge problem ID (optional)"
          hint={platformHint()}
          error={props.fieldErrors().platformProblemId}
        >
          <input
            class="ui-field"
            value={props.platformProblemId()}
            onInput={(event) =>
              props.onPlatformProblemIdInput(event.currentTarget.value)
            }
            {...formFieldControlAttrs({
              id: platformId(),
              hint: platformHint(),
              error: props.fieldErrors().platformProblemId,
            })}
          />
        </FormField>
        <FormField
          id={difficultyId()}
          label="Difficulty (optional)"
          hint={difficultyHint()}
          error={props.fieldErrors().difficulty}
        >
          <input
            class="ui-field"
            value={props.difficulty()}
            onInput={(event) => props.onDifficultyInput(event.currentTarget.value)}
            {...formFieldControlAttrs({
              id: difficultyId(),
              hint: difficultyHint(),
              error: props.fieldErrors().difficulty,
            })}
          />
        </FormField>
      </div>

      <FormField
        id={ratingId()}
        label="Rating (optional)"
        hint={ratingHint()}
        error={props.fieldErrors().rating}
      >
        <input
          class="ui-field"
          type="number"
          inputmode="numeric"
          value={props.rating()}
          onInput={(event) => props.onRatingInput(event.currentTarget.value)}
          {...formFieldControlAttrs({
            id: ratingId(),
            hint: ratingHint(),
            error: props.fieldErrors().rating,
          })}
        />
      </FormField>

      <FormField
        id={notesId()}
        label="Notes (optional)"
        hint={notesHint()}
        error={props.fieldErrors().notes}
      >
        <textarea
          class="ui-field min-h-28"
          value={props.notes()}
          onInput={(event) => props.onNotesInput(event.currentTarget.value)}
          {...formFieldControlAttrs({
            id: notesId(),
            hint: notesHint(),
            error: props.fieldErrors().notes,
          })}
        />
      </FormField>

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
        <FormAlert variant="error" retryAfter={props.retryAfter?.()}>
          {props.formError()}
        </FormAlert>
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