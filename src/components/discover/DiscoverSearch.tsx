import { useNavigate } from "@solidjs/router";
import { createEffect, createSignal, For, onCleanup, Show } from "solid-js";
import {
  createDiscoverApi,
  type DiscoverPersonCard,
} from "../../lib/api/modules/discover.api";
import { discoverCopy } from "../../lib/discover/copy";
import { peopleProfilePath } from "../../lib/people/paths";
import { useAuth } from "../../lib/auth/context";
import { trackDiscoverEvent } from "../../lib/discover/track";

const DEBOUNCE_MS = 250;

export function DiscoverSearch() {
  const auth = useAuth();
  const api = createDiscoverApi(auth.productClient);
  const navigate = useNavigate();
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<DiscoverPersonCard[]>([]);
  const [open, setOpen] = createSignal(false);
  const [activeIndex, setActiveIndex] = createSignal(-1);
  let timer: ReturnType<typeof setTimeout> | undefined;

  createEffect(
    () => query(),
    (q) => {
      const trimmed = q.trim();
      if (timer) clearTimeout(timer);
      if (trimmed.length < 2) {
        setResults([]);
        return;
      }
      timer = setTimeout(async () => {
        try {
          const res = await api.search(trimmed);
          setResults(res.items);
          setOpen(true);
          trackDiscoverEvent("discover_search", "discover");
        } catch {
          setResults([]);
        }
      }, DEBOUNCE_MS);
      onCleanup(() => {
        if (timer) clearTimeout(timer);
      });
    },
  );

  function openFirst() {
    const first = results()[0];
    if (first) navigate(peopleProfilePath(first.handle));
  }

  return (
    <div class="relative w-full max-w-md">
      <label class="sr-only" for="discover-search">
        {discoverCopy("search.placeholder")}
      </label>
      <input
        id="discover-search"
        type="search"
        role="combobox"
        aria-expanded={open() && results().length > 0 ? "true" : "false"}
        aria-autocomplete="list"
        aria-activedescendant={
          activeIndex() >= 0 ? `discover-search-option-${activeIndex()}` : undefined
        }
        class="w-full min-h-11 rounded-control border border-line bg-surface px-3 text-body"
        placeholder={discoverCopy("search.placeholder")}
        value={query()}
        onInput={(e) => setQuery(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setQuery("");
            setOpen(false);
            return;
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, results().length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            e.preventDefault();
            const idx = activeIndex();
            if (idx >= 0 && results()[idx]) {
              navigate(peopleProfilePath(results()[idx]!.handle));
            } else {
              openFirst();
            }
          }
        }}
      />
      <Show when={open() && query().trim().length >= 2}>
        <ul
          class="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-card border border-line bg-surface shadow-md"
          role="listbox"
        >
          <Show
            when={results().length > 0}
            fallback={
              <li class="px-3 py-2 text-caption text-muted">
                {discoverCopy("empty.noSearchMatch")}
              </li>
            }
          >
            <For each={results()}>
              {(item, i) => (
                <li
                  id={`discover-search-option-${i()}`}
                  role="option"
                  aria-selected={activeIndex() === i() ? "true" : "false"}
                  class="cursor-pointer px-3 py-2 hover:bg-surface-muted"
                  onMouseDown={() => navigate(peopleProfilePath(item.handle))}
                >
                  {item.name} · @{item.handle}
                </li>
              )}
            </For>
          </Show>
        </ul>
      </Show>
    </div>
  );
}