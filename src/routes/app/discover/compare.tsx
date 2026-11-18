import { Title, Meta } from "@solidjs/meta";
import { useLocation, useNavigate } from "@solidjs/router";
import { createEffect, createSignal, Match, onCleanup, Switch } from "solid-js";
import { AppPageContainer } from "../../../components/app/AppPageContainer";
import { ComparePage } from "../../../components/compare/ComparePage";
import type { CompareFocus } from "../../../components/compare/compare-section-order";
import { FormAlert } from "../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../lib/auth/context";
import {
  createDiscoverApi,
  type CompareResponse,
} from "../../../lib/api/modules/discover.api";
import { discoverCopy } from "../../../lib/discover/copy";
import { discoverForYouPath } from "../../../lib/discover/paths";
import { discoverPeersComparePath } from "../../../lib/people/paths";
import { trackDiscoverEvent } from "../../../lib/discover/track";

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

export default function DiscoverPeersCompareRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const discoverApi = createDiscoverApi(auth.productClient);

  const weeks = () => parseWeeks(location.search);
  const focus = () => parseFocus(location.search);
  const [status, setStatus] = createSignal<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [data, setData] = createSignal<CompareResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();

  let abort: AbortController | undefined;

  async function load() {
    abort?.abort();
    const controller = new AbortController();
    abort = controller;
    setStatus("loading");
    setError(undefined);
    try {
      const result = await discoverApi.comparePeers(weeks());
      if (controller.signal.aborted) return;
      setData(result);
      setStatus("ready");
      trackDiscoverEvent("discover_compare_open", "peers-compare");
    } catch {
      if (controller.signal.aborted) return;
      setStatus("error");
      setError("Not enough people to compare yet.");
    }
  }

  createEffect(
    () => weeks(),
  () => {
      void load();
    },
  );

  onCleanup(() => abort?.abort());

  function setWeeks(next: number) {
    navigate(discoverPeersComparePath({ weeks: next, focus: focus() }), {
      replace: true,
    });
  }

  return (
    <AppPageContainer>
      <Title>{discoverCopy("compare.vsPeers")}</Title>
      <Meta name="robots" content="noindex" />

      <header class="mb-6 space-y-3">
        <h1 class="text-page font-semibold">{discoverCopy("compare.vsPeers")}</h1>
        <div class="flex flex-wrap items-center gap-3 text-sm">
          <a
            class="rounded-full border border-line px-3 py-1 hover:border-brand"
            href={discoverForYouPath()}
          >
            Pick someone to compare
          </a>
          <span
            class="rounded-full border border-brand px-3 py-1 text-brand"
            aria-current="page"
          >
            {discoverCopy("compare.vsPeers")}
          </span>
          <label class="ml-auto">
            {discoverCopy("compare.window", { weeks: weeks() })}
            <select
              class="ml-2 rounded-control border border-line px-2 py-1"
              value={weeks()}
              onChange={(e) => setWeeks(Number(e.currentTarget.value))}
            >
              {WEEK_OPTIONS.map((w) => (
                <option value={w}>{w}</option>
              ))}
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
              themLabel={discoverCopy("dashboard.benchmarkPeers")}
              focus={focus()}
            />
          )}
        </Match>
      </Switch>
    </AppPageContainer>
  );
}