import { useLocation } from "@solidjs/router";
import type { ParentProps } from "solid-js";
import { createEffect, createSignal, onSettled, Show } from "solid-js";
import { IconMenu } from "../../icons";
import { handleDrawerTabKeydown } from "../../lib/app/shell-drawer-a11y";
import { appHome } from "../../lib/app/product-routes";
import { PracticeBrandLink } from "../brand/PracticeBrandLink";
import { AppSidebar } from "./AppSidebar";

const DRAWER_ID = "app-shell-drawer";
const DASHBOARD_PATH = appHome();

export function AppShell(props: ParentProps) {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = createSignal(false);
  let menuButtonRef: HTMLButtonElement | undefined;

  function closeDrawer() {
    setDrawerOpen(false);
    document.body.style.overflow = "";
    queueMicrotask(() => menuButtonRef?.focus());
  }

  function openDrawer() {
    setDrawerOpen(true);
    document.body.style.overflow = "hidden";
  }

  createEffect(
    () => location.pathname,
    () => {
      setDrawerOpen(false);
      document.body.style.overflow = "";
    },
  );

  onSettled(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && drawerOpen()) {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (!drawerOpen()) return;
      const panel = document.getElementById(DRAWER_ID);
      if (panel) handleDrawerTabKeydown(event, panel);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  createEffect(
    () => drawerOpen(),
    (open) => {
      if (!open) return;
      const id = requestAnimationFrame(() => {
        const panel = document.getElementById(DRAWER_ID);
        const focusable = panel?.querySelector<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        focusable?.focus();
      });
      return () => cancelAnimationFrame(id);
    },
  );

  return (
    <div class="flex h-dvh max-h-dvh min-h-0 w-full flex-1 flex-col overflow-hidden bg-canvas md:flex-row">
      <header class="flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-3 md:hidden">
        <PracticeBrandLink href={DASHBOARD_PATH} />
        <button
          ref={menuButtonRef}
          type="button"
          class="flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink hover:bg-surface-muted"
          aria-expanded={drawerOpen() ? "true" : "false"}
          aria-controls={DRAWER_ID}
          aria-label="Open navigation menu"
          onClick={openDrawer}
        >
          <IconMenu class="h-5 w-5" />
        </button>
      </header>

      <aside
        class="sticky top-0 z-10 hidden h-dvh max-h-dvh w-64 shrink-0 flex-col overflow-y-auto overscroll-y-contain border-r border-line bg-surface md:flex"
        aria-label="Sidebar"
      >
        <AppSidebar variant="rail" />
      </aside>

      <Show when={drawerOpen()}>
        <div class="fixed inset-0 z-40 md:hidden" aria-hidden="false">
          <button
            type="button"
            class="absolute inset-0 bg-ink/40"
            aria-label="Close navigation menu"
            onClick={closeDrawer}
          />
          <div
            id={DRAWER_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            class="absolute inset-y-0 left-0 z-50 w-64 bg-surface shadow-panel"
          >
            <AppSidebar variant="drawer" onClose={closeDrawer} />
          </div>
        </div>
      </Show>

      <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <main
          id="main-content"
          tabindex="-1"
          class="min-h-0 flex-1 overflow-y-auto overscroll-y-contain outline-none"
        >
          {props.children}
        </main>
      </div>
    </div>
  );
}