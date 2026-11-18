import type { Accessor, ParentProps } from "solid-js";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { createPlatformsApi } from "../api/modules/platforms.api";
import type {
  PlatformCatalogItem,
  PlatformListResponse,
} from "../api/modules/platforms.api";
import { useAuth } from "../auth/context";
import {
  platformFilterOptionsFromEntries,
  platformLabelForStoredSlug,
  platformLabelFromUrl,
  platformPreviewFromUrl,
  platformSlugFromUrl,
} from "./catalog-runtime";
import {
  fallbackLabelForStoredSlug,
  fallbackLabelFromUrl,
  fallbackPreviewFromUrl,
} from "./platform-slugs";

export type CatalogStatus = "idle" | "loading" | "ready" | "error";

export type PlatformFilterOption = {
  slug: PlatformCatalogItem["slug"] | "other";
  label: string;
};

export type PlatformCatalogContextValue = {
  status: () => CatalogStatus;
  entries: () => PlatformCatalogItem[];
  error: () => unknown;
  loadCatalog: () => Promise<void>;
  reloadCatalog: () => Promise<void>;
};

const PlatformCatalogContext =
  createContext<PlatformCatalogContextValue | null>(null);

export function useOptionalPlatformCatalog():
  | PlatformCatalogContextValue
  | undefined {
  return useContext(PlatformCatalogContext) ?? undefined;
}

export function usePlatformCatalog(): PlatformCatalogContextValue {
  const value = useOptionalPlatformCatalog();
  if (!value) {
    throw new Error(
      "usePlatformCatalog must be used within PlatformCatalogProvider",
    );
  }
  return value;
}

export function usePlatformLabels() {
  const catalog = useOptionalPlatformCatalog();
  return createMemo(() => {
    const ready = catalog?.status() === "ready";
    const entries = ready ? catalog!.entries() : [];
    return {
      labelForStoredSlug: (slug: string) =>
        ready
          ? platformLabelForStoredSlug(entries, slug)
          : fallbackLabelForStoredSlug(slug),
      labelFromUrl: (url: string) =>
        ready
          ? platformLabelFromUrl(entries, url)
          : fallbackLabelFromUrl(url),
    };
  });
}

export function PlatformCatalogContextOverride(
  props: ParentProps<{ value: PlatformCatalogContextValue }>,
) {
  return (
    <PlatformCatalogContext value={props.value}>
      {props.children}
    </PlatformCatalogContext>
  );
}

export function usePlatformFilterOptions(): Accessor<PlatformFilterOption[]> {
  const catalog = usePlatformCatalog();
  return createMemo(() =>
    catalog.status() === "ready"
      ? platformFilterOptionsFromEntries(catalog.entries())
      : [],
  );
}

export function useCatalogEntries(): Accessor<PlatformCatalogItem[] | undefined> {
  const catalog = usePlatformCatalog();
  return createMemo(() =>
    catalog.status() === "ready" ? catalog.entries() : undefined,
  );
}

export function useRuntimePlatformHelpers() {
  const catalog = useOptionalPlatformCatalog();
  return createMemo(() => {
    const ready = catalog?.status() === "ready";
    const entries = ready ? catalog!.entries() : [];
    return {
      slugFromUrl: (url: string) =>
        ready ? platformSlugFromUrl(entries, url) : null,
      previewFromUrl: (url: string) =>
        ready
          ? platformPreviewFromUrl(entries, url)
          : catalog
            ? { slug: "other" as const, label: "Loading judges…" }
            : fallbackPreviewFromUrl(url),
      labelForStoredSlug: (slug: string) =>
        ready
          ? platformLabelForStoredSlug(entries, slug)
          : fallbackLabelForStoredSlug(slug),
    };
  });
}

export function PlatformCatalogProvider(
  props: ParentProps<{
    /** Test hook: bypass product client fetch. */
    listPlatforms?: (signal?: AbortSignal) => Promise<PlatformListResponse>;
  }>,
) {
  const auth = useAuth();
  const [status, setStatus] = createSignal<CatalogStatus>("idle");
  const [entries, setEntries] = createSignal<PlatformCatalogItem[]>([]);
  const [error, setError] = createSignal<unknown>(undefined);

  let inflight: Promise<void> | undefined;

  async function fetchCatalog(signal?: AbortSignal): Promise<void> {
    const list =
      props.listPlatforms ??
      ((s) => createPlatformsApi(auth.productClient).listPlatforms(s));
    const { items } = await list(signal);
    setEntries(items);
    setError(undefined);
    setStatus("ready");
  }

  async function loadCatalog(force = false): Promise<void> {
    if (!force && status() === "ready") return;
    if (!force && inflight) return inflight;
    setStatus("loading");
    setError(undefined);
    inflight = (async () => {
      try {
        await fetchCatalog();
      } catch (cause) {
        setError(cause);
        setStatus("error");
      } finally {
        inflight = undefined;
      }
    })();
    return inflight;
  }

  async function reloadCatalog(): Promise<void> {
    inflight = undefined;
    return loadCatalog(true);
  }

  const value: PlatformCatalogContextValue = {
    status,
    entries,
    error,
    loadCatalog: () => loadCatalog(false),
    reloadCatalog,
  };

  createEffect(
    () => status(),
    (current) => {
      if (current === "idle") void loadCatalog(false);
    },
  );

  return (
    <PlatformCatalogContext value={value}>{props.children}</PlatformCatalogContext>
  );
}