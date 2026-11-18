import { Title, Meta } from "@solidjs/meta";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../../components/app/AppPageContainer";
import { PeopleCopyTopicButton } from "../../../../../components/people/PeopleCopyTopicButton";
import { PeopleListHeader } from "../../../../../components/people/PeopleListHeader";
import { PeoplePublicProblemRow } from "../../../../../components/people/PeoplePublicProblemRow";
import { PeopleUnavailable } from "../../../../../components/people/PeopleUnavailable";
import { Button } from "../../../../../components/ui/Button";
import { FormAlert } from "../../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../../lib/auth/context";
import { formatHandleLabel } from "../../../../../lib/auth/user-handle";
import {
  createPeopleApi,
  type PublicProblemRow,
  type PublicTopicHeader,
} from "../../../../../lib/api/modules/people.api";
import { discoverCopy } from "../../../../../lib/discover/copy";
import { peopleTopicPath } from "../../../../../lib/people/paths";
import { trackDiscoverEvent } from "../../../../../lib/discover/track";
import { usePlatformFilterOptions } from "../../../../../lib/platforms/platform-catalog-context";
import {
  parsePublicTopicSearch,
  stringifyPublicTopicQuery,
} from "../../../../../lib/people/public-topic-query";

type LoadStatus = "idle" | "loading" | "ready" | "error";

export default function PeoplePublicTopicPage() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const peopleApi = createPeopleApi(auth.productClient);
  const platformOptions = usePlatformFilterOptions();

  const handle = () => params.handle?.trim() ?? "";
  const topicId = () => params.topicId?.trim() ?? "";

  const [unavailable, setUnavailable] = createSignal(false);
  const [header, setHeader] = createSignal<PublicTopicHeader | undefined>();
  const [headerStatus, setHeaderStatus] = createSignal<LoadStatus>("idle");

  const [listStatus, setListStatus] = createSignal<LoadStatus>("idle");
  const [items, setItems] = createSignal<PublicProblemRow[]>([]);
  const [total, setTotal] = createSignal(0);
  const [listError, setListError] = createSignal<string | undefined>();
  const [viewerTopicId, setViewerTopicId] = createSignal<string | undefined>();

  const query = () => parsePublicTopicSearch(location.search);

  let headerAbort: AbortController | undefined;
  let listAbort: AbortController | undefined;

  async function loadHeader() {
    headerAbort?.abort();
    const controller = new AbortController();
    headerAbort = controller;
    setHeaderStatus("loading");
    const result = await peopleApi.getPublicTopic(
      handle(),
      topicId(),
      controller.signal,
    );
    if (controller.signal.aborted) return;
    if (!result.ok) {
      setUnavailable(true);
      setHeader(undefined);
      setHeaderStatus("ready");
      return;
    }
    setUnavailable(false);
    setHeader(result.data);
    setHeaderStatus("ready");
    trackDiscoverEvent("discover_list_open", "public-topic");
  }

  async function loadProblems() {
    listAbort?.abort();
    const controller = new AbortController();
    listAbort = controller;
    setListStatus("loading");
    setListError(undefined);
    try {
      const result = await peopleApi.listPublicProblems(
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

  return (
    <AppPageContainer>
      <Title>
        {header()
          ? `${header()!.name} · ${formatHandleLabel(handle())}`
          : `${formatHandleLabel(handle())} · Practice`}
      </Title>
      <Meta name="robots" content="noindex" />

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
              <PeopleListHeader handle={handle()} header={h()} />
              <PeopleCopyTopicButton
                client={auth.productClient}
                handle={handle()}
                topicId={topicId()}
                onCopied={(id) => setViewerTopicId(id)}
              />

              <Show when={(h().moreLists ?? []).length > 0}>
                <section aria-labelledby="more-lists" class="space-y-3">
                  <h2 id="more-lists" class="text-title text-ink">
                    {discoverCopy("list.moreLists", { topicName: h().name })}
                  </h2>
                  <ul class="divide-y divide-line rounded-card border border-line">
                    <For each={h().moreLists ?? []}>
                      {(list) => (
                        <li class="flex items-center justify-between gap-3 px-4 py-3">
                          <div>
                            <p class="text-label text-ink">{list.name}</p>
                            <p class="text-caption text-muted">@{list.handle}</p>
                          </div>
                          <a
                            class="text-label text-brand hover:underline"
                            href={peopleTopicPath(list.handle, list.topicId)}
                          >
                            {discoverCopy("row.open")}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </section>
              </Show>

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
                  <label class="text-sm">
                    Platform
                    <select
                      class="ml-2 rounded-control border border-line px-2 py-1"
                      value={query().platform ?? ""}
                      onChange={(e) =>
                        updateQuery({
                          platform:
                            e.currentTarget.value === ""
                              ? undefined
                              : (e.currentTarget.value as NonNullable<
                                  ReturnType<typeof query>["platform"]
                                >),
                        })
                      }
                    >
                      <option value="">All</option>
                      <For each={platformOptions()}>
                        {(opt) => <option value={opt.slug}>{opt.label}</option>}
                      </For>
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
                            <th class="px-3 py-2 font-medium">
                              {discoverCopy("row.youColumn")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={items()}>
                            {(row) => (
                              <PeoplePublicProblemRow
                                row={row}
                                viewerTopicId={viewerTopicId()}
                                onAdded={() => void loadProblems()}
                              />
                            )}
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
  );
}