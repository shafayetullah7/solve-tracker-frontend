import { Title } from "@solidjs/meta";
import type { RouteDefinition } from "@solidjs/router";
import { httpStatus } from "@solidjs/web";
import { PracticeBrandLink } from "../components/brand/PracticeBrandLink";
import { paths } from "../router";

export const route = {
  preload: () => httpStatus(404),
} satisfies RouteDefinition;

export default function NotFound() {
  return (
    <main class="mx-auto max-w-2xl px-5 py-12 sm:px-8">
      <Title>Page not found — Practice</Title>
      <div class="mb-8">
        <PracticeBrandLink href={paths()} size="sidebar" />
      </div>
      <h1 class="text-page font-semibold tracking-tight">Page not found</h1>
      <p class="mt-3 text-muted">
        That URL does not match anything in your workspace. Head{" "}
        <a class="text-brand underline-offset-4 hover:underline" href={paths()}>
          home
        </a>{" "}
        or open the{" "}
        <a class="text-brand underline-offset-4 hover:underline" href={paths.app()}>
          dashboard
        </a>
        .
      </p>
    </main>
  );
}