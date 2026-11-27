import { createMemo, createSignal, For, Show } from "solid-js";
import {
  createLearningAssessmentsApi,
  type AttemptResponse,
} from "../../../lib/api/modules/learning-assessments.api";
import type { ApiClient } from "../../../lib/api/client";
import { learningStudyPath } from "../../../lib/learning/paths";
import { Button } from "../../ui/Button";
import { FormAlert } from "../../ui/FormAlert";

export type AssessmentWorkspaceProps = {
  guideId: string;
  assessmentId: string;
  returnNodeId?: string;
  client: ApiClient;
};

export function AssessmentWorkspace(props: AssessmentWorkspaceProps) {
  const api = createLearningAssessmentsApi(props.client);
  const [attempt, setAttempt] = createSignal<AttemptResponse | undefined>();
  const [activeIndex, setActiveIndex] = createSignal(0);
  const [error, setError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [loaded, setLoaded] = createSignal(false);

  const questions = () => attempt()?.questions ?? [];
  const activeQuestion = createMemo(() => questions()[activeIndex()]);
  const finalized = () => attempt()?.status === "finalized";

  async function bootstrap() {
    setPending(true);
    setError(undefined);
    try {
      const row = await api.startAttempt(props.guideId, props.assessmentId);
      setAttempt(row);
      setLoaded(true);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not start attempt.");
    } finally {
      setPending(false);
    }
  }

  void bootstrap();

  async function saveResponse(questionId: string, response: unknown) {
    const current = attempt();
    if (!current || finalized()) return;
    setPending(true);
    setError(undefined);
    try {
      const row = await api.saveAnswer(
        props.guideId,
        props.assessmentId,
        current.id,
        { questionId, response, operationId: crypto.randomUUID() },
      );
      setAttempt(row);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not save answer.");
    } finally {
      setPending(false);
    }
  }

  async function submit() {
    const current = attempt();
    if (!current) return;
    if (!finalized() && !window.confirm("Submit answers now? Unanswered questions score zero.")) return;
    setPending(true);
    setError(undefined);
    try {
      const row = await api.submitAttempt(
        props.guideId,
        props.assessmentId,
        current.id,
        crypto.randomUUID(),
      );
      setAttempt(row);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Could not submit.");
    } finally {
      setPending(false);
    }
  }

  function currentAnswer(questionId: string) {
    return attempt()?.answers.find((row) => row.questionId === questionId)?.response;
  }

  return (
    <div class="space-y-6">
      <Show when={error()}>
        {(message) => <FormAlert variant="error">{message()}</FormAlert>}
      </Show>
      <Show when={!loaded() && pending()}>
        <p class="text-body text-muted">Starting assessment…</p>
      </Show>
      <Show when={attempt()} keyed>
        {(row) => (
          <>
            <Show when={row.status === "finalized"}>
              <div class="rounded-panel border border-line bg-surface p-4">
                <p class="text-label font-semibold text-ink">Results</p>
                <p class="mt-2 text-body text-ink">
                  Score: {row.scoreBasisPoints !== null ? `${row.scoreBasisPoints / 100}%` : "—"}
                </p>
                <p class="mt-1 text-body text-ink">
                  {row.passed ? "Passed" : "Did not pass"} (need {(row.passingBasisPoints / 100).toFixed(0)}%)
                </p>
                <Show when={props.returnNodeId}>
                  {(nodeId) => (
                    <a
                      class="ui-button mt-4 inline-flex items-center"
                      data-variant="secondary"
                      href={learningStudyPath(props.guideId, nodeId())}
                    >
                      Back to step
                    </a>
                  )}
                </Show>
                <Button type="button" class="mt-4" variant="secondary" disabled={pending()} onClick={() => void bootstrap()}>
                  Retake
                </Button>
              </div>
            </Show>
            <Show when={row.status === "in_progress"}>
              <nav class="flex flex-wrap gap-2" aria-label="Questions">
                <For each={questions()}>
                  {(q, index) => (
                    <button
                      type="button"
                      class={
                        index() === activeIndex()
                          ? "min-h-10 min-w-10 rounded-control border border-brand bg-surface text-sm font-medium text-brand"
                          : "min-h-10 min-w-10 rounded-control border border-line bg-surface text-sm font-medium"
                      }
                      onClick={() => setActiveIndex(index())}
                    >
                      {index() + 1}
                    </button>
                  )}
                </For>
              </nav>
              <Show when={activeQuestion()} keyed>
                {(question) => (
                  <section class="rounded-panel border border-line bg-surface p-4 space-y-4">
                    <p class="text-body font-medium text-ink">
                      {typeof question.prompt.stem === "string" ? question.prompt.stem : "Question"}
                    </p>
                    <Show when={question.kind === "single_choice" || question.kind === "multiple_choice"}>
                      <ul class="space-y-2">
                        <For
                          each={
                            Array.isArray(question.prompt.options)
                              ? (question.prompt.options as { id: string; label: string }[])
                              : []
                          }
                        >
                          {(option) => (
                            <li>
                              <label class="flex cursor-pointer items-center gap-2 text-body text-ink">
                                <input
                                  type={question.kind === "multiple_choice" ? "checkbox" : "radio"}
                                  name={question.id}
                                  checked={
                                    question.kind === "multiple_choice"
                                      ? (currentAnswer(question.id) as { selectedOptionIds?: string[] } | undefined)
                                          ?.selectedOptionIds?.includes(option.id) ?? false
                                      : (currentAnswer(question.id) as { selectedOptionId?: string } | undefined)
                                          ?.selectedOptionId === option.id
                                  }
                                  disabled={pending()}
                                  onChange={() => {
                                    if (question.kind === "multiple_choice") {
                                      const prev =
                                        (currentAnswer(question.id) as { selectedOptionIds?: string[] } | undefined)
                                          ?.selectedOptionIds ?? [];
                                      const next = prev.includes(option.id)
                                        ? prev.filter((id) => id !== option.id)
                                        : [...prev, option.id];
                                      void saveResponse(question.id, { selectedOptionIds: next });
                                    } else {
                                      void saveResponse(question.id, { selectedOptionId: option.id });
                                    }
                                  }}
                                />
                                {option.label}
                              </label>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                    <Show when={question.kind === "true_false"}>
                      <div class="flex gap-4">
                        <Button
                          type="button"
                          variant={
                            (currentAnswer(question.id) as { value?: boolean } | undefined)?.value === true
                              ? "primary"
                              : "secondary"
                          }
                          disabled={pending()}
                          onClick={() => void saveResponse(question.id, { value: true })}
                        >
                          True
                        </Button>
                        <Button
                          type="button"
                          variant={
                            (currentAnswer(question.id) as { value?: boolean } | undefined)?.value === false
                              ? "primary"
                              : "secondary"
                          }
                          disabled={pending()}
                          onClick={() => void saveResponse(question.id, { value: false })}
                        >
                          False
                        </Button>
                      </div>
                    </Show>
                    <Show when={question.kind === "numerical"}>
                      <input
                        type="number"
                        class="min-h-11 w-full max-w-xs rounded-control border border-line bg-surface px-3 text-base text-ink"
                        disabled={pending()}
                        value={
                          (currentAnswer(question.id) as { valueScaled?: number } | undefined)?.valueScaled ?? ""
                        }
                        onInput={(event) => {
                          const raw = event.currentTarget.value;
                          if (raw === "") {
                            void saveResponse(question.id, null);
                            return;
                          }
                          const scaled = Math.round(Number(raw) * 100);
                          void saveResponse(question.id, { valueScaled: scaled });
                        }}
                      />
                      <p class="text-xs text-muted">
                        Enter a decimal (×100 scale). Clear the field to mark unanswered.
                      </p>
                    </Show>
                  </section>
                )}
              </Show>
              <Button type="button" disabled={pending()} onClick={() => void submit()}>
                {pending() ? "Submitting…" : "Submit assessment"}
              </Button>
            </Show>
          </>
        )}
      </Show>
    </div>
  );
}