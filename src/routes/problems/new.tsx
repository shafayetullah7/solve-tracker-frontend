import { Title } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { ProblemFormFields } from "../../components/problems/ProblemFormFields";
import { Button } from "../../components/ui/Button";
import { Panel } from "../../components/ui/Panel";
import { ApiError } from "../../lib/api/errors";
import { createProblemsApi } from "../../lib/api/modules/problems.api";
import { createTopicsApi, type TopicResponse } from "../../lib/api/modules/topics.api";
import { useAuth } from "../../lib/auth/context";
import type { FieldErrors } from "../../lib/auth/forms";
import {
  buildCreateInput,
  topicIdFromSearch,
  toggleTopicId,
} from "../../lib/problems/form-state";
import {
  problemExistingIdFromError,
  problemFieldErrors,
  problemFormMessage,
} from "../../lib/problems/messages";
import { problemDetailPath } from "../../lib/problems/paths";

const FORM_ID = "problem-create";

export default function ProblemNew() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const problemsApi = createProblemsApi(auth.productClient);
  const topicsApi = createTopicsApi(auth.productClient);

  const [title, setTitle] = createSignal("");
  const [url, setUrl] = createSignal("");
  const [platformProblemId, setPlatformProblemId] = createSignal("");
  const [difficulty, setDifficulty] = createSignal("");
  const [rating, setRating] = createSignal("");
  const [notes, setNotes] = createSignal("");
  const [alreadySolved, setAlreadySolved] = createSignal(false);
  const [selectedTopicIds, setSelectedTopicIds] = createSignal<Set<string>>(new Set());

  const [topics, setTopics] = createSignal<TopicResponse[]>([]);
  const [topicsLoading, setTopicsLoading] = createSignal(true);
  const [topicsTruncated, setTopicsTruncated] = createSignal(false);

  const [pending, setPending] = createSignal(false);
  const [formError, setFormError] = createSignal<string | undefined>();
  const [fieldErrors, setFieldErrors] = createSignal<FieldErrors>({});
  const [existingProblemId, setExistingProblemId] = createSignal<string | undefined>();

  async function loadTopics() {
    setTopicsLoading(true);
    try {
      const result = await topicsApi.list({ page: 1, pageSize: 100 });
      setTopics(result.items);
      setTopicsTruncated(result.meta.total > result.items.length);
      const preselect = topicIdFromSearch(location.search);
      if (preselect && result.items.some((topic) => topic.id === preselect)) {
        setSelectedTopicIds(new Set([preselect]));
      }
    } catch {
      setTopics([]);
    } finally {
      setTopicsLoading(false);
    }
  }

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void loadTopics();
    },
  );

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (pending()) return;
    setPending(true);
    setFormError(undefined);
    setFieldErrors({});
    setExistingProblemId(undefined);
    try {
      const created = await problemsApi.create(
        buildCreateInput({
          title: title(),
          url: url(),
          topicIds: selectedTopicIds(),
          platformProblemId: platformProblemId(),
          difficulty: difficulty(),
          rating: rating(),
          notes: notes(),
          alreadySolved: alreadySolved(),
        }),
      );
      navigate(problemDetailPath(created.id));
    } catch (error) {
      setFormError(problemFormMessage(error));
      if (error instanceof ApiError && error.code === "VALIDATION_ERROR") {
        setFieldErrors(problemFieldErrors(error.details));
      }
      const existingId = problemExistingIdFromError(error);
      if (existingId) setExistingProblemId(existingId);
    } finally {
      setPending(false);
    }
  }

  const preselectTopic = topicIdFromSearch(location.search);

  return (
    <>
      <Title>Add problem — Practice</Title>
      <header class="mb-8 max-w-2xl">
        <h1 class="text-page font-semibold tracking-tight">Add a problem</h1>
        <p class="mt-2 text-muted">Save a practice problem link and organize it with your topics.</p>
      </header>

      <Panel title="Problem details" description="Required fields are title and URL.">
        <form class="max-w-2xl space-y-4" onSubmit={onSubmit}>
          <ProblemFormFields
            mode="create"
            formId={FORM_ID}
            title={title}
            onTitleInput={setTitle}
            url={url}
            onUrlInput={setUrl}
            platformProblemId={platformProblemId}
            onPlatformProblemIdInput={setPlatformProblemId}
            difficulty={difficulty}
            onDifficultyInput={setDifficulty}
            rating={rating}
            onRatingInput={setRating}
            notes={notes}
            onNotesInput={setNotes}
            alreadySolved={alreadySolved}
            onAlreadySolvedChange={setAlreadySolved}
            selectedTopicIds={selectedTopicIds}
            onTopicToggle={(topicId, checked) =>
              setSelectedTopicIds(toggleTopicId(selectedTopicIds(), topicId, checked))
            }
            topics={topics}
            topicsLoading={topicsLoading}
            topicsTruncated={topicsTruncated}
            fieldErrors={fieldErrors}
            formError={formError}
            existingProblemId={existingProblemId}
            existingProblemHref={
              existingProblemId() ? problemDetailPath(existingProblemId()!) : undefined
            }
          />
          <div class="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending()}>
              {pending() ? "Saving…" : "Save problem"}
            </Button>
            <a class="ui-button" data-variant="secondary" href="/problems">
              Cancel
            </a>
          </div>
        </form>
      </Panel>

      <Show when={preselectTopic}>
        <p class="mt-4 text-sm text-muted">
          Started from a topic filter — the matching topic is pre-selected when available.
        </p>
      </Show>
    </>
  );
}