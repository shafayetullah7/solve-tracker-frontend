import { Title } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createMemo, createSignal, Show, untrack } from "solid-js";
import { ProblemFormFields } from "../../../components/problems/ProblemFormFields";
import { Button } from "../../../components/ui/Button";
import { Panel } from "../../../components/ui/Panel";
import { createProblemsApi } from "../../../lib/api/modules/problems.api";
import { createTopicsApi, type TopicResponse } from "../../../lib/api/modules/topics.api";
import { useAuth } from "../../../lib/auth/context";
import { createFormState } from "../../../lib/forms/create-form-state";
import { focusFirstInvalid } from "../../../lib/forms/focus-first-invalid";
import { validateProblemDraft } from "../../../lib/forms/validate-problem";
import {
  buildCreateInput,
  nextFromSearch,
  titleFromSearch,
  topicIdFromSearch,
  toggleTopicId,
  urlFromSearch,
} from "../../../lib/problems/form-state";
import { problemDetailPath } from "../../../lib/problems/paths";
import { safeReturnPath } from "../../../lib/auth/forms";
import { paths } from "../../../router";

const FORM_ID = "problem-create";

export default function ProblemNew() {
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const problemsApi = createProblemsApi(auth.productClient);
  const topicsApi = createTopicsApi(auth.productClient);
  const form = createFormState("problem", { problemExtras: true });

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

  async function loadTopics() {
    setTopicsLoading(true);
    try {
      const result = await topicsApi.list({ page: 1, pageSize: 100 });
      setTopics(result.items);
      setTopicsTruncated(result.meta.total > result.items.length);
      const preselect = untrack(preselectTopic);
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

  createEffect(
    () => location.search,
    (search) => {
      const prefilledUrl = urlFromSearch(search);
      if (prefilledUrl) setUrl(prefilledUrl);
      const prefilledTitle = titleFromSearch(search);
      if (prefilledTitle) setTitle(prefilledTitle);
    },
  );

  async function onSubmit(event: Event) {
    event.preventDefault();
    if (form.pending()) return;
    const formEl = event.currentTarget as HTMLFormElement;
    const clientErrors = validateProblemDraft({
      title: title(),
      url: url(),
      platformProblemId: platformProblemId(),
      difficulty: difficulty(),
      rating: rating(),
      notes: notes(),
    });
    if (Object.keys(clientErrors).length > 0) {
      form.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    form.beginSubmit();
    form.setPending(true);
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
      const returnTo = safeReturnPath(nextFromSearch(location.search));
      navigate(returnTo ?? problemDetailPath(created.id));
    } catch (error) {
      form.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      form.setPending(false);
    }
  }

  const preselectTopic = createMemo(() => topicIdFromSearch(location.search));
  const studyReturn = createMemo(() => {
    const next = safeReturnPath(nextFromSearch(location.search));
    if (!next?.includes("/app/learning/") || !next.includes("/study/")) return undefined;
    return next;
  });

  return (
    <>
      <Title>Add problem — Practice</Title>
      <header class="mb-8 max-w-2xl">
        <h1 class="text-page font-semibold tracking-tight">Add a problem</h1>
        <p class="mt-2 text-muted">Save a practice problem link and organize it with your topics.</p>
      </header>

      <Panel title="Problem details" description="Required fields are title and URL.">
        <form class="max-w-2xl space-y-4" novalidate onSubmit={onSubmit}>
          <ProblemFormFields
            mode="create"
            formId={FORM_ID}
            title={title}
            onTitleInput={(value) => {
              setTitle(value);
              form.clearField("title");
            }}
            url={url}
            onUrlInput={(value) => {
              setUrl(value);
              form.clearField("url");
            }}
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
            fieldErrors={form.fieldErrors}
            formError={form.formBanner}
            retryAfter={form.retryAfter}
            existingProblemId={form.existingProblemId}
            existingProblemHref={
              form.existingProblemId()
                ? problemDetailPath(form.existingProblemId()!)
                : undefined
            }
          />
          <div class="flex flex-wrap gap-3">
            <Button type="submit" disabled={form.pending()}>
              {form.pending() ? "Saving…" : "Save problem"}
            </Button>
            <a class="ui-button" data-variant="secondary" href={paths.app.problems()}>
              Cancel
            </a>
          </div>
        </form>
      </Panel>

      <Show when={preselectTopic()}>
        <p class="mt-4 text-sm text-muted">
          Started from a topic filter — the matching topic is pre-selected when available.
        </p>
      </Show>
      <Show when={studyReturn()}>
        <p class="mt-4 text-sm text-muted">
          You&apos;ll return to your guide step after saving.
        </p>
      </Show>
    </>
  );
}