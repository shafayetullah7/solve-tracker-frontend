import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Match, Switch } from "solid-js";
import { ProblemFormFields } from "../../../../components/problems/ProblemFormFields";
import { Button } from "../../../../components/ui/Button";
import { Panel } from "../../../../components/ui/Panel";
import { createProblemsApi } from "../../../../lib/api/modules/problems.api";
import { createTopicsApi, type TopicResponse } from "../../../../lib/api/modules/topics.api";
import { useAuth } from "../../../../lib/auth/context";
import { createFormState } from "../../../../lib/forms/create-form-state";
import { focusFirstInvalid } from "../../../../lib/forms/focus-first-invalid";
import { validateProblemDraft } from "../../../../lib/forms/validate-problem";
import {
  buildUpdateInput,
  hydrateFormFromProblem,
  toggleTopicId,
} from "../../../../lib/problems/form-state";
import { problemFormMessage } from "../../../../lib/problems/messages";
import { problemDetailPath } from "../../../../lib/problems/paths";
import { paths } from "../../../../router";

const FORM_ID = "problem-edit";

type LoadStatus = "idle" | "loading" | "ready" | "unavailable";

export default function ProblemEdit() {
  const auth = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const problemsApi = createProblemsApi(auth.productClient);
  const topicsApi = createTopicsApi(auth.productClient);
  const problemForm = createFormState("problem", { problemExtras: true });

  const [loadStatus, setLoadStatus] = createSignal<LoadStatus>("idle");
  const [loadMessage, setLoadMessage] = createSignal<string | undefined>();

  const [title, setTitle] = createSignal("");
  const [url, setUrl] = createSignal("");
  const [platformProblemId, setPlatformProblemId] = createSignal("");
  const [difficulty, setDifficulty] = createSignal("");
  const [rating, setRating] = createSignal("");
  const [notes, setNotes] = createSignal("");
  const alreadySolved = () => false;
  const [selectedTopicIds, setSelectedTopicIds] = createSignal<Set<string>>(new Set());

  const [topics, setTopics] = createSignal<TopicResponse[]>([]);
  const [topicsLoading, setTopicsLoading] = createSignal(true);
  const [topicsTruncated, setTopicsTruncated] = createSignal(false);

  async function loadForm() {
    const id = params.id;
    if (!id) return;
    setLoadStatus("loading");
    setLoadMessage(undefined);
    setTopicsLoading(true);
    try {
      const [problem, topicList] = await Promise.all([
        problemsApi.getOne(id),
        topicsApi.list({ page: 1, pageSize: 100 }),
      ]);
      const hydrated = hydrateFormFromProblem(problem);
      setTitle(hydrated.title);
      setUrl(hydrated.url);
      setPlatformProblemId(hydrated.platformProblemId);
      setDifficulty(hydrated.difficulty);
      setRating(hydrated.rating);
      setNotes(hydrated.notes);
      setSelectedTopicIds(hydrated.topicIds);
      setTopics(topicList.items);
      setTopicsTruncated(topicList.meta.total > topicList.items.length);
      setLoadStatus("ready");
    } catch (error) {
      setLoadStatus("unavailable");
      setLoadMessage(problemFormMessage(error));
    } finally {
      setTopicsLoading(false);
    }
  }

  createEffect(
    () => [auth.status(), params.id] as const,
    ([status]) => {
      if (status !== "authenticated") return;
      void loadForm();
    },
  );

  async function onSubmit(event: Event) {
    event.preventDefault();
    const id = params.id;
    if (!id || problemForm.pending() || loadStatus() !== "ready") return;
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
      problemForm.applyClientErrors(clientErrors);
      focusFirstInvalid(formEl);
      return;
    }
    problemForm.beginSubmit();
    problemForm.setPending(true);
    try {
      await problemsApi.update(
        id,
        buildUpdateInput({
          title: title(),
          url: url(),
          topicIds: selectedTopicIds(),
          platformProblemId: platformProblemId(),
          difficulty: difficulty(),
          rating: rating(),
          notes: notes(),
        }),
      );
      navigate(problemDetailPath(id));
    } catch (error) {
      problemForm.applyApiError(error);
      focusFirstInvalid(formEl);
    } finally {
      problemForm.setPending(false);
    }
  }

  return (
    <>
      <Title>Edit problem — Practice</Title>
      <header class="mb-8 flex flex-wrap items-start justify-between gap-4 max-w-2xl">
        <div>
          <h1 class="text-page font-semibold tracking-tight">Edit problem</h1>
          <p class="mt-2 text-muted">Update fields or change which topics apply.</p>
        </div>
        <a
          class="text-sm text-brand underline-offset-4 hover:underline"
          href={params.id ? problemDetailPath(params.id) : paths.app.problems()}
        >
          Back to details
        </a>
      </header>

      <Switch>
        <Match when={loadStatus() === "loading" || loadStatus() === "idle"}>
          <p class="text-muted" role="status">
            Loading problem…
          </p>
        </Match>
        <Match when={loadStatus() === "unavailable"}>
          <p class="text-muted">{loadMessage()}</p>
          <Button class="mt-4" variant="secondary" onClick={() => void loadForm()}>
            Try again
          </Button>
          <a
            class="mt-4 ml-4 inline-block text-sm text-brand underline-offset-4 hover:underline"
            href={paths.app.problems()}
          >
            Back to library
          </a>
        </Match>
        <Match when={loadStatus() === "ready"}>
          <Panel title="Problem details">
            <form class="max-w-2xl space-y-4" novalidate onSubmit={onSubmit}>
              <ProblemFormFields
                mode="edit"
                formId={FORM_ID}
                title={title}
                onTitleInput={(value) => {
                  setTitle(value);
                  problemForm.clearField("title");
                }}
                url={url}
                onUrlInput={(value) => {
                  setUrl(value);
                  problemForm.clearField("url");
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
                onAlreadySolvedChange={() => undefined}
                selectedTopicIds={selectedTopicIds}
                onTopicToggle={(topicId, checked) =>
                  setSelectedTopicIds(toggleTopicId(selectedTopicIds(), topicId, checked))
                }
                topics={topics}
                topicsLoading={topicsLoading}
                topicsTruncated={topicsTruncated}
                fieldErrors={problemForm.fieldErrors}
                formError={problemForm.formBanner}
                retryAfter={problemForm.retryAfter}
                existingProblemId={problemForm.existingProblemId}
                existingProblemHref={
                  problemForm.existingProblemId()
                    ? problemDetailPath(problemForm.existingProblemId()!)
                    : undefined
                }
              />
              <div class="flex flex-wrap gap-3">
                <Button type="submit" disabled={problemForm.pending()}>
                  {problemForm.pending() ? "Saving…" : "Save changes"}
                </Button>
                <a
                  class="ui-button"
                  data-variant="secondary"
                  href={params.id ? problemDetailPath(params.id) : paths.app.problems()}
                >
                  Cancel
                </a>
              </div>
            </form>
          </Panel>
        </Match>
      </Switch>
    </>
  );
}