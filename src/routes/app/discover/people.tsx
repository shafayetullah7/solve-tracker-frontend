import { useSearchParams } from "@solidjs/router";
import { createEffect, createSignal, For, Match, Switch } from "solid-js";
import { DiscoverPersonRow } from "../../../components/discover/DiscoverPersonRow";
import { FormAlert } from "../../../components/ui/FormAlert";
import { LoadingPlaceholder } from "../../../components/ui/LoadingPlaceholder";
import { useAuth } from "../../../lib/auth/context";
import { discoverCopy } from "../../../lib/discover/copy";
import {
  createDiscoverApi,
  type DiscoverPeopleListResponse,
  type DiscoverPeopleQuery,
} from "../../../lib/api/modules/discover.api";

type PeoplePageRail = NonNullable<DiscoverPeopleQuery["rail"]>;

type Status = "idle" | "loading" | "ready" | "error";

export default function DiscoverPeoplePage() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [params, setParams] = useSearchParams();
  const [status, setStatus] = createSignal<Status>("idle");
  const [data, setData] = createSignal<DiscoverPeopleListResponse | undefined>();
  const [error, setError] = createSignal<string | undefined>();

  const rail = (): PeoplePageRail =>
    (params.rail as PeoplePageRail | undefined) ?? "peers";

  createEffect(
    () => [auth.status(), params.rail, params.page, params.goal, params.platform, params.topic, params.active] as const,
    () => {
    if (auth.status() !== "authenticated") return;
    setStatus("loading");
    const page = Number(params.page ?? 1) || 1;
    const goalParam = params.goal;
    void api
      .listPeople({
        rail: rail(),
        page,
        goal:
          goalParam === "interview" ||
          goalParam === "contests" ||
          goalParam === "fundamentals" ||
          goalParam === "coaching"
            ? goalParam
            : undefined,
        platform: params.platform as DiscoverPeopleQuery["platform"],
        topic: params.topic as string | undefined,
        active: params.active === "true" ? "true" : undefined,
      })
      .then((res) => {
        setData(res);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Could not load people.");
        setStatus("error");
      });
    },
  );

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2">
        <select
          class="min-h-11 rounded-control border border-line bg-surface px-3"
          value={rail()}
          onChange={(e) => setParams({ rail: e.currentTarget.value, page: "1" })}
        >
          <option value="peers">People like you</option>
          <option value="ahead">A step ahead</option>
          <option value="same_goal">Same goal</option>
          <option value="consistent">Consistent practicers</option>
          <option value="active_week">Active this week</option>
          <option value="following">{discoverCopy("people.filters.following")}</option>
        </select>
      </div>
      <Switch>
        <Match when={status() === "loading"}>
          <LoadingPlaceholder lines={5} />
        </Match>
        <Match when={status() === "error"}>
          <FormAlert variant="error">{error()}</FormAlert>
        </Match>
        <Match when={status() === "ready"}>
          <For each={data()?.items ?? []}>{(person) => <DiscoverPersonRow person={person} />}</For>
        </Match>
      </Switch>
    </div>
  );
}