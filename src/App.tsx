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
  return (
    <>
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
          class="border-b border-line bg-surface px-5 py-4 sm:px-8"
        >
          <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <PracticeBrandLink href={paths()} />
            <AuthNav />
          </div>
        </nav>
      </Show>
      <div class="flex min-h-dvh min-h-0 flex-1 flex-col max-h-dvh overflow-hidden max-md:max-h-none max-md:overflow-visible md:h-dvh">
        <RouteBoundary>{props.children}</RouteBoundary>
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