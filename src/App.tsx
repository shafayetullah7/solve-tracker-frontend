import { Title } from "@solidjs/meta";
import { Loading } from "solid-js";
import { paths, Router } from "./router";
import "./App.css";
export default function App() {
  return (
    <Router>
      {(props) => (
        <>
          <Title>Practice</Title>
          <a
            class="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-surface focus:p-4"
            href="#main-content"
          >
            Skip to content
          </a>
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
              <a
                class="text-sm text-muted underline-offset-4 hover:underline"
                href={paths.users()}
              >
                Template examples
              </a>
            </div>
          </nav>
          <div id="main-content" tabindex="-1">
            <Loading
              fallback={
                <main class="p-8" role="status">
                  Loading…
                </main>
              }
            >
              {props.children}
            </Loading>
          </div>
        </>
      )}
    </Router>
  );
}
