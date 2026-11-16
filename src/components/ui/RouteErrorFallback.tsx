import type { Accessor } from "solid-js";
import { Button } from "./Button";

export type RouteErrorFallbackProps = {
  err: Accessor<unknown>;
  reset: () => void;
};

/** App/route boundary fallback — no stack traces or raw error strings in UI. */
export function RouteErrorFallback(props: RouteErrorFallbackProps) {
  return (
    <main id="main-content" class="mx-auto max-w-2xl p-8 sm:p-10" role="alert">
      <h1 class="text-page font-semibold tracking-tight">Something went wrong</h1>
      <p class="mt-3 text-muted">
        This page hit an unexpected problem. Try again or reload the page.
      </p>
      <div class="mt-6 flex flex-wrap gap-3">
        <Button type="button" onClick={() => props.reset()}>
          Try again
        </Button>
        <Button type="button" variant="secondary" onClick={() => globalThis.location.reload()}>
          Reload page
        </Button>
      </div>
    </main>
  );
}