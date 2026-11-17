import { dynamic } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { Button } from "./Button";

export type RouteErrorFallbackProps = {
  err: Accessor<unknown>;
  reset: () => void;
  /** When false, render inside existing `#main-content` (AppShell). */
  mainContent?: boolean;
};

/**
 * App/route boundary fallback — no stack traces or raw error strings in UI.
 * Caught errors are reported through `configureClientErrors` in `client-setup.ts`.
 */
export function RouteErrorFallback(props: RouteErrorFallbackProps) {
  const ownsMain = () => props.mainContent !== false;
  const Root = dynamic(() => (ownsMain() ? "main" : "div"));

  return (
    <Root
      id={ownsMain() ? "main-content" : undefined}
      class="mx-auto max-w-2xl p-8 sm:p-10"
      role="alert"
    >
      <h1 class="text-page font-semibold tracking-tight">Something went wrong</h1>
      <p class="mt-3 text-muted">
        This page hit an unexpected problem. Try again or reload the page.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => props.reset()}>
          Try again
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => globalThis.location.reload()}
        >
          Reload page
        </Button>
      </div>
    </Root>
  );
}
