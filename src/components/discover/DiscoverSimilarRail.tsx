import { createEffect, createSignal, For, Show } from "solid-js";
import { useAuth } from "../../lib/auth/context";
import {
  createDiscoverApi,
  type DiscoverPersonCard as DiscoverPersonCardType,
} from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";
import { DiscoverPersonCard } from "./DiscoverPersonCard";

export function DiscoverSimilarRail(props: { handle: string }) {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const [items, setItems] = createSignal<DiscoverPersonCardType[]>([]);

  createEffect(
    () => [props.handle, auth.status()] as const,
    () => {
      if (!isDiscoverFullEnabled() || auth.status() !== "authenticated") return;
      void api.similar(props.handle, 8).then((res) => setItems(res.items));
    },
  );

  return (
    <Show when={isDiscoverFullEnabled() && items().length > 0}>
      <section aria-labelledby="similar-rail">
        <h2 id="similar-rail" class="mb-3 text-title text-ink">
          {discoverCopy("rail.similar")}
        </h2>
        <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
          <For each={items()}>{(person) => <DiscoverPersonCard person={person} />}</For>
        </div>
      </section>
    </Show>
  );
}