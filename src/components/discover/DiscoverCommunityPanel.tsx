import { createEffect, createSignal, Show } from "solid-js";
import { createDiscoverApi } from "../../lib/api/modules/discover.api";
import { useAuth } from "../../lib/auth/context";
import { LoadingPlaceholder } from "../ui/LoadingPlaceholder";

export function DiscoverCommunityPanel(props: { problemId: string }) {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [listCount, setListCount] = createSignal(0);
  const [status, setStatus] = createSignal<"idle" | "loading" | "ready">("idle");
  let ref: HTMLDivElement | undefined;

  createEffect(
    () => props.problemId,
    () => {
    const el = ref;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || status() !== "idle") return;
        setStatus("loading");
        void api.problemCommunity(props.problemId).then((res) => {
          setListCount(res.listCount);
          setStatus("ready");
        });
      },
      { rootMargin: "80px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
    },
  );

  return (
    <div ref={ref} class="rounded-card border border-line bg-surface p-4">
      <Show when={status() === "loading"}>
        <LoadingPlaceholder lines={2} />
      </Show>
      <Show when={status() === "ready" && listCount() >= 3}>
        <p class="text-body text-ink">
          This problem appears in {listCount()} public lists from other practicers.
        </p>
      </Show>
    </div>
  );
}