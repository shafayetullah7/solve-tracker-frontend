import { createEffect, createSignal, For, Show } from "solid-js";
import {
  createDiscoverApi,
  type DiscoverHubProblemsResponse,
} from "../../lib/api/modules/discover.api";
import { encodeTopicKey } from "../../lib/discover/topic-key";
import { useAuth } from "../../lib/auth/context";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";
import { DiscoverCommonProblemRow } from "./DiscoverCommonProblemRow";

const COLLAPSE_KEY = "discover.ideas.collapsed";

export function DiscoverIdeasPanel(props: {
  topicId: string;
  topicName: string;
  normalizedName: string;
}) {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [collapsed, setCollapsed] = createSignal(
    typeof localStorage !== "undefined"
      ? localStorage.getItem(COLLAPSE_KEY) !== "false"
      : true,
  );
  const [items, setItems] = createSignal<DiscoverHubProblemsResponse["items"]>([]);
  const [status, setStatus] = createSignal<"idle" | "loading" | "ready" | "error">("idle");
  let panelRef: HTMLDivElement | undefined;

  createEffect(
    () => [collapsed(), props.normalizedName] as const,
    () => {
    const el = panelRef;
    if (!el || collapsed()) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        if (status() !== "idle") return;
        setStatus("loading");
        void api
          .topicProblems(encodeTopicKey(props.normalizedName), true)
          .then((res) => {
            setItems(res.items.slice(0, 6));
            setStatus("ready");
          })
          .catch(() => setStatus("error"));
      },
      { rootMargin: "80px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
    },
  );

  const toggle = () => {
    const next = !collapsed();
    setCollapsed(next);
    localStorage.setItem(COLLAPSE_KEY, next ? "true" : "false");
  };

  return (
    <div ref={panelRef} class="rounded-card border border-line bg-surface p-4">
      <button
        type="button"
        class="flex w-full items-center justify-between text-left"
        onClick={toggle}
        aria-expanded={collapsed() ? "false" : "true"}
      >
        <span class="text-title text-ink">
          Ideas from others · {props.topicName}
        </span>
        <span class="text-caption text-muted">{collapsed() ? "Show" : "Hide"}</span>
      </button>
      <Show when={!collapsed()}>
        <Show when={status() === "loading"}>
          <LoadingPlaceholder lines={3} />
        </Show>
        <Show when={status() === "ready" && items().length > 0}>
          <ul class="mt-3">
            <For each={items()}>
              {(row) => <DiscoverCommonProblemRow row={row} topicId={props.topicId} />}
            </For>
          </ul>
        </Show>
      </Show>
    </div>
  );
}