import { Meta, Title } from "@solidjs/meta";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../components/app/AppPageContainer";
import { PeopleListHeader } from "../../../../components/people/PeopleListHeader";
import { PeopleUnavailable } from "../../../../components/people/PeopleUnavailable";
import { Button } from "../../../../components/ui/Button";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { PlatformMark } from "../../../../components/platforms/PlatformMark";
import { formatHandleLabel } from "../../../../lib/auth/user-handle";
import type { PublicProblemRow, PublicTopicHeader } from "../../../../lib/api/modules/people.api";
import { createPublicPeopleApi } from "../../../../lib/api/modules/public-people.api";
import { discoverCopy } from "../../../../lib/discover/copy";
import { publicPeopleProfilePath } from "../../../../lib/people/paths";
import {
  parsePublicTopicSearch,
  stringifyPublicTopicQuery,
} from "../../../../lib/people/public-topic-query";
import { paths } from "../../../../router";

type LoadStatus = "idle" | "loading" | "ready" | "error";

const publicApi = createPublicPeopleApi();

function PublicProblemTableRow(props: { row: PublicProblemRow }) {
  const ownerLabel = () =>
    props.row.ownerStatus === "solved" ? "✓ Solved" : "○ Unsolved";

  return (
    <tr class="border-t border-line">
      <td class="px-3 py-2">{props.row.title}</td>
      <td class="px-3 py-2">
        <PlatformMark slug={props.row.platformSlug} />
      </td>
      <td class="px-3 py-2 tabular-nums">{props.row.difficulty}</td>
      <td class="px-3 py-2">{ownerLabel()}</td>
    </tr>
  );
}

export default function PublicPeopleTopicPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const handle = () => params.handle?.trim() ?? "";
  const topicId = () => params.topicId?.trim() ?? "";

  const [unavailable, setUnavailable] = createSignal(false);
  const [header, setHeader] = createSignal<PublicTopicHeader | undefined>();
  const [headerStatus, setHeaderStatus] = createSignal<LoadStatus>("idle");

  const [listStatus, setListStatus] = createSignal<LoadStatus>("idle");
  const [items, setItems] = createSignal<PublicProblemRow[]>([]);
  const [total, setTotal] = createSignal(0);
  const [listError, setListError] = createSignal<string | undefined>();

  const query = () => parsePublicTopicSearch(location.search);

  let headerAbort: AbortController | undefined;
  let listAbort: AbortController | undefined;

  async function loadHeader() {
    headerAbort?.abort();
    const controller = new AbortController();
    headerAbort = controller;
    setHeaderStatus("loading");
    const result = await publicApi.getTopicHeader(
      handle(),
      topicId(),
      controller.signal,
    );
    if (controller.signal.aborted) return;
    if (result === "unavailable") {
      setUnavailable(true);
      setHeader(undefined);
      setHeaderStatus("ready");
      return;
    }
    setUnavailable(false);
    setHeader(result);
    setHeaderStatus("ready");
  }

  async function loadProblems() {
    listAbort?.abort();
    const controller = new AbortController();
    listAbort = controller;
    setListStatus("loading");
    setListError(undefined);
    try {
      const result = await publicApi.listTopicProblems(
        handle(),
        topicId(),
        query(),
        controller.signal,
      );
      if (controller.signal.aborted) return;
      if (result === "unavailable") {
        setUnavailable(true);
        setListStatus("ready");
        return;
      }
      setItems(result.items);
      setTotal(result.meta.total);
      setListStatus("ready");
    } catch {
      if (controller.signal.aborted) return;
      setListStatus("error");
      setListError("Could not load problems.");
    }
  }

  createEffect(
    () => [handle(), topicId()] as const,
    ([h, id]) => {
      if (!h || !id) return;
      void loadHeader();
    },
  );

  createEffect(
    () =>
      [location.search, unavailable(), headerStatus(), header()] as const,
    ([, unavail, status, hdr]) => {
      if (unavail || status !== "ready" || !hdr) return;
      void loadProblems();
    },
  );

  onCleanup(() => {
    headerAbort?.abort();
    listAbort?.abort();
  });

  function updateQuery(patch: Partial<ReturnType<typeof query>>) {
    const next = { ...query(), ...patch, page: patch.page ?? 1 };
    navigate(`${location.pathname}${stringifyPublicTopicQuery(next)}`, {
      replace: true,
    });
  }

  const page = () => query().page ?? 1;
  const pageSize = () => query().pageSize ?? 50;
  const pageCount = () => Math.max(1, Math.ceil(total() / pageSize()));

  const registerNext = () =>
    `/register?next=${encodeURIComponent(`/app/u/${encodeURIComponent(handle())}/topics/${encodeURIComponent(topicId())}`)}`;

  return (
    <main id="main-content" class="flex min-h-0 flex-1 flex-col bg-canvas">
      <Title>
        {header()
          ? `${header()!.name} · ${formatHandleLabel(handle())}`
          : `${formatHandleLabel(handle())} · Practice`}
      </Title>
      <Meta name="robots" content="noindex, nofollow" />

      <AppPageContainer>
        <Show when={unavailable()}>
          <PeopleUnavailable />
        </Show>

        <Show when={!unavailable()}>
          <Switch>
            <Match when={headerStatus() === "loading"}>
              <LoadingPlaceholder variant="block" />
            </Match>
            <Match when={header()}>
              {(h) => (
                <h1 class="text-page font-semibold">{h().name}</h1>
              )}
            </Match>
          </Switch>

          <Show when={header()}>
            {(h) => (
              <div class="mt-6 space-y-8">
                <PeopleListHeader
                  handle={handle()}
                  header={h()}
                  profilePath={publicPeopleProfilePath}
                />
                <div class="flex flex-wrap gap-2">
                  <a href={registerNext()}>
                    <Button type="button">{discoverCopy("public.signUpToCompare")}</Button>
                  </a>
                  <a href={paths.login()}>
                    <Button type="button" variant="secondary">
                      Sign in
                    </Button>
                  </a>
                </div>

                <section aria-labelledby="public-topic-filters">
                  <h2 id="public-topic-filters" class="sr-only">
                    Filters
                  </h2>
                  <div class="flex flex-wrap gap-3">
                    <label class="text-sm">
                      Owner status
                      <select
                        class="ml-2 rounded-control border border-line px-2 py-1"
                        value={query().status ?? ""}
                        onChange={(e) =>
                          updateQuery({
                            status:
                              e.currentTarget.value === ""
                                ? undefined
                                : (e.currentTarget.value as "solved" | "unsolved"),
                          })
                        }
                      >
                        <option value="">All</option>
                        <option value="solved">Solved</option>
                        <option value="unsolved">Unsolved</option>
                      </select>
                    </label>
                  </div>
                </section>

                <Switch>
                  <Match when={listStatus() === "loading"}>
                    <LoadingPlaceholder variant="block" />
                  </Match>
                  <Match when={listStatus() === "error"}>
                    <FormAlert variant="error">
                      {listError()}
                      <button
                        type="button"
                        class="ml-2 underline"
                        onClick={() => void loadProblems()}
                      >
                        Try again
                      </button>
                    </FormAlert>
                  </Match>
                  <Match when={listStatus() === "ready"}>
                    <Show
                      when={items().length > 0}
                      fallback={
                        <p class="text-muted">{discoverCopy("list.emptyProblems")}</p>
                      }
                    >
                      <div class="overflow-x-auto rounded-panel border border-line">
                        <table class="min-w-full text-left text-sm">
                          <thead class="bg-surface-muted/40 text-label text-muted">
                            <tr>
                              <th class="px-3 py-2 font-medium">Title</th>
                              <th class="px-3 py-2 font-medium">Platform</th>
                              <th class="px-3 py-2 font-medium">Difficulty</th>
                              <th class="px-3 py-2 font-medium">
                                {discoverCopy("row.ownerColumn")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <For each={items()}>
                              {(row) => <PublicProblemTableRow row={row} />}
                            </For>
                          </tbody>
                        </table>
                      </div>
                    </Show>
                    <Show when={total() > pageSize()}>
                      <div class="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={page() <= 1}
                          onClick={() => updateQuery({ page: page() - 1 })}
                        >
                          Previous
                        </Button>
                        <span class="text-sm text-muted tabular-nums">
                          Page {page()} of {pageCount()}
                        </span>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={page() >= pageCount()}
                          onClick={() => updateQuery({ page: page() + 1 })}
                        >
                          Next
                        </Button>
                      </div>
                    </Show>
                  </Match>
                </Switch>
              </div>
            )}
          </Show>
        </Show>
      </AppPageContainer>
    </main>
  );
}