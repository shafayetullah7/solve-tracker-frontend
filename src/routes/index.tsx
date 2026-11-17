import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { createEffect, Match, Switch } from "solid-js";
import { InlineLoadingMark } from "../components/ui/InlineLoadingMark";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
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
    <main class="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <Title>Practice — Coding problem tracker</Title>
      <Switch>
        <Match when={auth.status() === "checking"}>
          <InlineLoadingMark />
        </Match>
        <Match when={auth.status() === "unavailable"}>
          <p class="text-muted">We could not reach the server.</p>
          <Button class="mt-4" variant="secondary" onClick={() => void auth.retryBootstrap()}>
            Try again
          </Button>
        </Match>
        <Match when={auth.status() === "authenticated"}>
          <InlineLoadingMark />
        </Match>
        <Match when={auth.status() === "anonymous"}>
          <header class="mb-8">
            <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">
              Track practice problems in one place
            </h1>
            <p class="mt-4 text-base leading-7 text-muted">
              Save links from LeetCode, Codeforces, and other platforms. Organize with topics,
              mark what you have solved, and browse your library with filters.
            </p>
          </header>
          <Panel
            title="Get started"
            description="Create a personal account to save problems and progress."
          >
            <div class="flex flex-wrap gap-3">
              <a class="ui-button" data-variant="primary" href={paths.register()}>
                Register
              </a>
              <a class="ui-button" data-variant="secondary" href={paths.login()}>
                Sign in
              </a>
            </div>
          </Panel>
        </Match>
      </Switch>
    </main>
  );
}