import { useNavigate } from "@solidjs/router";
import { createEffect, Match, Switch } from "solid-js";
import { AppPageContainer } from "../components/app/AppPageContainer";
import { LandingPage } from "../components/landing/LandingPage";
import { LandingSeo } from "../components/landing/LandingSeo";
import { InlineLoadingMark } from "../components/ui/InlineLoadingMark";
import { Button } from "../components/ui/Button";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

export default function Home() {
  const auth = useAuth();
  const navigate = useNavigate();

  // Hard loads are redirected by the auth gate; this covers client-side state changes.
  createEffect(
    () => auth.status(),
    (status) => {
      if (status === "authenticated") navigate(paths.app(), { replace: true });
    },
  );

  return (
    <main id="main-content" class="flex min-h-0 flex-1 flex-col bg-canvas">
      <LandingSeo />
      <Switch>
        <Match when={auth.status() === "checking"}>
          <AppPageContainer>
            <InlineLoadingMark />
          </AppPageContainer>
        </Match>
        <Match when={auth.status() === "unavailable"}>
          <AppPageContainer>
            <p class="text-muted">We could not reach the server.</p>
            <Button class="mt-4" variant="secondary" onClick={() => void auth.retryBootstrap()}>
              Try again
            </Button>
          </AppPageContainer>
        </Match>
        <Match when={auth.status() === "authenticated"}>
          <AppPageContainer>
            <InlineLoadingMark />
          </AppPageContainer>
        </Match>
        <Match when={auth.status() === "anonymous"}>
          <AppPageContainer>
            <LandingPage />
          </AppPageContainer>
        </Match>
      </Switch>
    </main>
  );
}