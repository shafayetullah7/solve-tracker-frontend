import { Title } from "@solidjs/meta";
import { Errored, Loading, Show, type ParentProps } from "solid-js";
import { RouteErrorFallback } from "./components/ui/RouteErrorFallback";
import { AuthNav } from "./components/auth/AuthNav";
import { AuthProvider, useAuth } from "./lib/auth/context";
import { paths, Router } from "./router";
import "./App.css";

function AppRouterContent(props: ParentProps) {
  const auth = useAuth();
  return (
    <>
      <Title>Practice</Title>
      <a
        class="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-surface focus:p-4"
        href="#main-content"
      >
        Skip to content
      </a>
      <Show when={auth.status() === "anonymous" || auth.status() === "unavailable"}>
        <nav
          aria-label="Main navigation"
          class="border-b border-line bg-surface px-5 py-4 sm:px-8"
        >
          <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <a
              class="text-xl font-bold tracking-tight text-brand"
              href={paths()}
            >
              practice<span class="text-muted">.</span>
            </a>
            <AuthNav />
          </div>
        </nav>
      </Show>
      <div class="flex min-h-0 flex-1 flex-col max-h-dvh overflow-hidden max-md:max-h-none max-md:overflow-visible md:h-dvh">
        <Errored
          fallback={(err, reset) => <RouteErrorFallback err={err} reset={reset} />}
        >
          <Loading
            fallback={
              <main class="p-8" role="status">
                Loading…
              </main>
            }
          >
            {props.children}
          </Loading>
        </Errored>
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>{(props) => <AppRouterContent>{props.children}</AppRouterContent>}</Router>
    </AuthProvider>
  );
}