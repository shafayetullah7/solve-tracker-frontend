import { Title } from "@solidjs/meta";
import { useNavigate } from "@solidjs/router";
import { Match, Show, Switch, onSettled } from "solid-js";
import { Button } from "../components/ui/Button";
import { Panel } from "../components/ui/Panel";
import { useAuth } from "../lib/auth/context";
import { paths } from "../router";

function RedirectToLibrary() {
  const navigate = useNavigate();
  onSettled(() => navigate(paths.problems(), { replace: true }));
  return (
    <p class="text-muted" role="status">
      Opening your library…
    </p>
  );
}

export default function Home() {
  const auth = useAuth();

  return (
    <main class="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <Title>Practice — Coding problem tracker</Title>
      <Switch>
        <Match when={auth.status() === "checking"}>
          <p class="text-muted" role="status">
            Checking session…
          </p>
        </Match>
        <Match when={auth.status() === "unavailable"}>
          <p class="text-muted">We could not reach the server.</p>
          <Button class="mt-4" variant="secondary" onClick={() => void auth.retryBootstrap()}>
            Try again
          </Button>
        </Match>
        <Match when={auth.status() === "authenticated"}>
          <RedirectToLibrary />
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
          <Show when={import.meta.env.DEV}>
            <p class="mt-8 text-sm text-muted">
              Contributors:{" "}
              <a
                class="text-brand underline-offset-4 hover:underline"
                href={paths.users()}
              >
                UI foundation examples
              </a>
            </p>
          </Show>
        </Match>
      </Switch>
    </main>
  );
}