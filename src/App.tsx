import { Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { Show, type ParentProps } from "solid-js";
import { RouteBoundary } from "./components/ui/RouteBoundary";
import { PracticeBrandLink } from "./components/brand/PracticeBrandLink";
import { AuthNav } from "./components/auth/AuthNav";
import { AuthProvider, useAuth } from "./lib/auth/context";
import { isAuthSurfacePath } from "./lib/auth/forms";
import { paths, Router } from "./router";
import "./App.css";

function AppRouterContent(props: ParentProps) {
  const auth = useAuth();
  const location = useLocation();
  const showGuestNav = () =>
    (auth.status() === "anonymous" || auth.status() === "unavailable") &&
    !isAuthSurfacePath(location.pathname);
  /** Full viewport lock is for auth surfaces and `/app` only — guest nav + `h-dvh` clips the landing. */
  const lockViewportHeight = () => !showGuestNav();
  return (
    <div class="flex min-h-0 flex-1 flex-col">
      <Title>Practice</Title>
      <a
        class="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-surface focus:p-4"
        href="#main-content"
      >
        Skip to content
      </a>
      <Show when={showGuestNav()}>
        <nav
          aria-label="Main navigation"
          class="sticky top-0 z-20 shrink-0 border-b border-line bg-surface/90 backdrop-blur-md"
        >
          <div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
            <PracticeBrandLink href={paths()} />
            <AuthNav />
          </div>
        </nav>
      </Show>
      <div
        class={[
          "flex min-h-0 flex-1 flex-col",
          lockViewportHeight() &&
            "min-h-dvh max-h-dvh overflow-hidden max-md:max-h-none max-md:overflow-visible md:h-dvh",
        ]}
      >
        <RouteBoundary>{props.children}</RouteBoundary>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>{(props) => <AppRouterContent>{props.children}</AppRouterContent>}</Router>
    </AuthProvider>
  );
}