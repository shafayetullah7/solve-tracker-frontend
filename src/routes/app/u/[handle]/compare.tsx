import { Title, Meta } from "@solidjs/meta";
import { useLocation, useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { AppPageContainer } from "../../../../components/app/AppPageContainer";
import { ComparePage } from "../../../../components/compare/ComparePage";
import type { CompareFocus } from "../../../../components/compare/compare-section-order";
import { PeopleUnavailable } from "../../../../components/people/PeopleUnavailable";
import { FormAlert } from "../../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../../lib/auth/context";
import { formatHandleLabel } from "../../../../lib/auth/user-handle";
import {
  createPeopleApi,
  type CompareResponse,
} from "../../../../lib/api/modules/people.api";
import { discoverCopy } from "../../../../lib/discover/copy";
import {
  discoverPeersComparePath,
  peopleComparePath,
} from "../../../../lib/people/paths";
import { trackDiscoverEvent } from "../../../../lib/discover/track";

const WEEK_OPTIONS = [4, 12, 26] as const;

function parseFocus(search: string): CompareFocus | undefined {
  const value = new URLSearchParams(search).get("focus");
  if (value === "cadence" || value === "topics") return value;
  return undefined;
}

function parseWeeks(search: string): number {
  const raw = new URLSearchParams(search).get("weeks");
  const n = raw ? Number(raw) : 12;
  return (WEEK_OPTIONS as readonly number[]).includes(n) ? n : 12;
}

export default function PeopleCompareRoute() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const peopleApi = createPeopleApi(auth.productClient);

  const handle = () => params.handle?.trim() ?? "";
  const weeks = () => parseWeeks(location.search);
  const focus = () => parseFocus(location.search);

  const [status, setStatus] = createSignal<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [unavailable, setUnavailable] = createSignal(false);
  const [data, setData] = createSignal<CompareResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();

  let abort: AbortController | undefined;

  async function load() {
    abort?.abort();
    const controller = new AbortController();
    abort = controller;
    setStatus("loading");
    setError(undefined);
    const result = await peopleApi.getCompare(handle(), weeks(), controller.signal);
    if (controller.signal.aborted) return;
    if (result === "unavailable") {
      setUnavailable(true);
      setData(undefined);
      setStatus("ready");
      return;
    }
    setUnavailable(false);
    setData(result);
    setStatus("ready");
    trackDiscoverEvent("discover_compare_open", "person-compare");
  }

  createEffect(
    () => [handle(), weeks()] as const,
    ([h]) => {
      if (!h) return;
      void load();
    },
  );

  onCleanup(() => abort?.abort());

  function setWeeks(next: number) {
    navigate(peopleComparePath(handle(), { weeks: next, focus: focus() }), {
      replace: true,
    });
  }

  return (
    <AppPageContainer>
      <Title>
        {discoverCopy("compare.title", { handle: formatHandleLabel(handle()) })}
      </Title>
      <Meta name="robots" content="noindex" />

      <Show when={unavailable()}>
        <PeopleUnavailable />
      </Show>

      <Show when={!unavailable()}>
        <header class="mb-6 space-y-3">
          <h1 class="text-page font-semibold">
            {discoverCopy("compare.title", { handle: formatHandleLabel(handle()) })}
          </h1>
          <div class="flex flex-wrap items-center gap-3 text-sm">
            <a
              class="rounded-full border border-brand px-3 py-1 text-brand"
              href={peopleComparePath(handle(), { weeks: weeks(), focus: focus() })}
              aria-current="page"
            >
              {discoverCopy("compare.vsPerson", { handle: formatHandleLabel(handle()) })}
            </a>
            <a
              class="rounded-full border border-line px-3 py-1 hover:border-brand"
              href={discoverPeersComparePath({ weeks: weeks(), focus: focus() })}
            >
              {discoverCopy("compare.vsPeers")}
            </a>
            <label class="ml-auto">
              {discoverCopy("compare.window", { weeks: weeks() })}
              <select
                class="ml-2 rounded-control border border-line px-2 py-1"
                value={weeks()}
                onChange={(e) => setWeeks(Number(e.currentTarget.value))}
              >
                <For each={WEEK_OPTIONS}>{(w) => (
                  <option value={w}>{w}</option>
                )}</For>
              </select>
            </label>
          </div>
        </header>

        <Switch>
          <Match when={status() === "loading"}>
            <LoadingPlaceholder variant="block" />
          </Match>
          <Match when={status() === "error"}>
            <FormAlert variant="error">{error()}</FormAlert>
          </Match>
          <Match when={status() === "ready" && data()}>
            {(payload) => (
              <ComparePage
                data={payload()}
                themLabel={formatHandleLabel(handle())}
                focus={focus()}
                summaryOnlyMessage={discoverCopy("compare.summaryOnlyTopics", {
                  handle: formatHandleLabel(handle()),
                })}
              />
            )}
          </Match>
        </Switch>
      </Show>
    </AppPageContainer>
  );
}