import { Title } from "@solidjs/meta";
import { useNavigate, useLocation } from "@solidjs/router";
import { createEffect, createSignal, onCleanup, Show, type ParentProps } from "solid-js";
import { AppPageContainer } from "../../components/app/AppPageContainer";
import { DiscoverOptInBanner } from "../../components/discover/DiscoverOptInBanner";
import { DiscoverSearch } from "../../components/discover/DiscoverSearch";
import { DiscoverSubNav } from "../../components/discover/DiscoverSubNav";
import { useAuth } from "../../lib/auth/context";
import { discoverCopy } from "../../lib/discover/copy";
import { shouldBlockDiscoverAppRoute } from "../../lib/discover/route-access";
import {
  bindDiscoverTrackFlush,
  flushDiscoverEvents,
  initDiscoverTrack,
  trackDiscoverEvent,
} from "../../lib/discover/track";
import { createProfileApi } from "../../lib/api/modules/profile.api";

export default function DiscoverLayout(props: ParentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const profileApi = createProfileApi(auth.productClient);
  const [privateViewer, setPrivateViewer] = createSignal(false);

  createEffect(
    () => location.pathname,
    (path) => {
      if (shouldBlockDiscoverAppRoute(path)) navigate("/404", { replace: true });
    },
  );

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      initDiscoverTrack(auth.productClient);
      trackDiscoverEvent("discover_open", "discover");
      onCleanup(bindDiscoverTrackFlush());
      onCleanup(() => {
        void flushDiscoverEvents();
      });
    },
  );

  createEffect(
    () => auth.status(),
    (status) => {
      if (status !== "authenticated") return;
      void profileApi.getProfile().then(
        (profile) => setPrivateViewer(profile.practiceVisibility === "private"),
        () => setPrivateViewer(false),
      );
    },
  );

  return (
    <AppPageContainer>
      <Title>{discoverCopy("discover.pageTitle")}</Title>
      <header class="mb-6 flex flex-col gap-4">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="text-display text-ink">{discoverCopy("discover.pageTitle")}</h1>
            <p class="text-body text-muted">{discoverCopy("discover.pageSubtitle")}</p>
          </div>
          <DiscoverSearch />
        </div>
        <DiscoverSubNav />
      </header>
      <Show when={privateViewer()}>
        <div class="mb-6">
          <DiscoverOptInBanner />
        </div>
      </Show>
      {props.children}
    </AppPageContainer>
  );
}