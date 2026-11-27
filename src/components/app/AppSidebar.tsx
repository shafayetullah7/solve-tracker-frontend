import { useLocation, useNavigate } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { IconClose, IconLogOut, IconPlus } from "../../icons";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";
import { isLearningGuidesEnabled } from "../../lib/learning/flag";
import { discoverCopy } from "../../lib/discover/copy";
import { resolveSidebarActive } from "../../lib/app/nav-active";
import { buildNavItems } from "../../lib/app/app-sidebar-nav";
import { formatHandleLabel } from "../../lib/auth/user-handle";
import { useAuth } from "../../lib/auth/context";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { PracticeBrandLink } from "../brand/PracticeBrandLink";
import { appHome } from "../../lib/app/product-routes";
import { Button } from "../ui/Button";
import { CreateMenu } from "./CreateMenu";

export type AppSidebarProps = {
  variant: "rail" | "drawer";
  drawerId?: string;
  onClose?: () => void;
};

type SidebarNavLinkProps = {
  href: string;
  label: string;
  active: boolean;
  current?: boolean;
  icon: ReturnType<typeof buildNavItems>[number]["icon"];
  onNavigate?: () => void;
};

function SidebarNavLink(props: SidebarNavLinkProps) {
  return (
    <a
      class={[
        "flex min-h-11 items-center gap-3 rounded-control px-3 text-label font-medium text-ink hover:bg-surface-muted",
        props.active && "bg-brand-soft text-brand",
      ]}
      href={props.href}
      aria-current={props.current ? "page" : undefined}
      onClick={() => props.onNavigate?.()}
    >
      {props.icon({ class: "h-5 w-5 shrink-0" })}
      <span>{props.label}</span>
    </a>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [logoutPending, setLogoutPending] = createSignal(false);

  const navItems = () =>
    buildNavItems(
      {
        learningEnabled: isLearningGuidesEnabled(),
        discoverFullEnabled: isDiscoverFullEnabled(),
      },
      discoverCopy("nav.discover"),
    );

  const active = () => resolveSidebarActive(location.pathname);

  async function onLogout() {
    if (logoutPending()) return;
    setLogoutPending(true);
    try {
      await auth.logout();
      props.onClose?.();
      navigate(paths.login());
    } finally {
      setLogoutPending(false);
    }
  }

  const onNavigate = () => props.onClose?.();

  return (
    <div
      id={props.drawerId}
      class={[
        "flex min-h-0 flex-1 flex-col gap-4 p-4",
        props.variant === "rail" && "h-full w-full",
        props.variant === "drawer" && "h-full",
      ]}
    >
      {props.variant === "rail" ? (
        <div class="border-b border-line pb-3">
          <PracticeBrandLink href={appHome()} size="sidebar" />
        </div>
      ) : null}

      {props.variant === "drawer" ? (
        <div class="flex items-center justify-between gap-2 border-b border-line pb-3">
          <PracticeBrandLink href={appHome()} size="sidebar" class="min-w-0" />
          <button
            type="button"
            class="flex min-h-11 min-w-11 items-center justify-center rounded-control text-ink hover:bg-surface-muted"
            aria-label="Close navigation menu"
            onClick={() => props.onClose?.()}
          >
            <IconClose class="h-5 w-5" />
          </button>
        </div>
      ) : null}

      <nav aria-label="Product" class="flex flex-col gap-1">
        <For each={navItems()}>
          {(item) => (
            <SidebarNavLink
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={active().section === item.key}
              current={
                active().section === item.key &&
                !(item.key === "library" && active().addProblem)
              }
              onNavigate={onNavigate}
            />
          )}
        </For>
      </nav>

      <div class="mt-auto flex flex-col gap-4 border-t border-line pt-4">
        <Show when={auth.user()}>
          {(user) => (
            <div class="min-w-0 px-1 text-left" aria-label="Signed in as">
              <p class="truncate text-sm font-medium text-ink">{user().name}</p>
              <p class="truncate text-xs text-muted tabular-nums">
                {formatHandleLabel(user().handle)}
              </p>
            </div>
          )}
        </Show>
        <CreateMenu
          learningEnabled={isLearningGuidesEnabled()}
          onNavigate={onNavigate}
        />
        <a
          class="ui-button inline-flex w-full items-center justify-center gap-2"
          data-variant="secondary"
          data-active={active().addProblem ? "" : undefined}
          href={problemNewPath()}
          aria-current={active().addProblem ? "page" : undefined}
          onClick={onNavigate}
        >
          <IconPlus class="h-5 w-5 shrink-0" />
          Add problem
        </a>

        <Button
          variant="ghost"
          class="min-h-11 w-full justify-start gap-3 px-3"
          disabled={logoutPending()}
          aria-busy={logoutPending()}
          onClick={() => void onLogout()}
        >
          <IconLogOut class="h-5 w-5 shrink-0" />
          {logoutPending() ? "Signing out…" : "Sign out"}
        </Button>
      </div>
    </div>
  );
}