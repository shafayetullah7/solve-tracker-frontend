import { useLocation, useNavigate } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { createSignal, For, Show, type ParentProps } from "solid-js";
import type { IconProps } from "../../icons/icon-props";
import {
  IconClose,
  IconDashboard,
  IconLibrary,
  IconLogOut,
  IconPlus,
  IconDiscover,
  IconTopics,
  IconUser,
} from "../../icons";
import { isDiscoverFullEnabled } from "../../lib/discover/flag";
import { discoverForYouPath } from "../../lib/discover/paths";
import { discoverCopy } from "../../lib/discover/copy";
import { resolveSidebarActive, type SidebarSectionKey } from "../../lib/app/nav-active";
import { formatHandleLabel } from "../../lib/auth/user-handle";
import { useAuth } from "../../lib/auth/context";
import { problemNewPath } from "../../lib/problems/paths";
import { paths } from "../../router";
import { PracticeBrandLink } from "../brand/PracticeBrandLink";
import { appHome } from "../../lib/app/product-routes";
import { Button } from "../ui/Button";

export type AppSidebarProps = {
  variant: "rail" | "drawer";
  drawerId?: string;
  onClose?: () => void;
};

type NavItem = {
  key: SidebarSectionKey;
  label: string;
  href: string;
  icon: (props: IconProps) => JSX.Element;
};

const BASE_NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    href: paths.app(),
    icon: IconDashboard,
  },
  {
    key: "library",
    label: "Library",
    href: paths.app.problems(),
    icon: IconLibrary,
  },
  {
    key: "topics",
    label: "Topics",
    href: paths.app.topics(),
    icon: IconTopics,
  },
  {
    key: "profile",
    label: "Profile",
    href: paths.app.profile(),
    icon: IconUser,
  },
];

type SidebarNavLinkProps = ParentProps<{
  href: string;
  label: string;
  active: boolean;
  current?: boolean;
  onNavigate?: () => void;
}>;

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
      {props.children}
      <span>{props.label}</span>
    </a>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [logoutPending, setLogoutPending] = createSignal(false);

  const navItems = (): NavItem[] => {
    const items = [...BASE_NAV_ITEMS];
    if (isDiscoverFullEnabled()) {
      const profileIdx = items.findIndex((i) => i.key === "profile");
      items.splice(profileIdx, 0, {
        key: "discover",
        label: discoverCopy("nav.discover"),
        href: discoverForYouPath(),
        icon: IconDiscover,
      });
    }
    return items;
  };

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
              active={active().section === item.key}
              current={
                active().section === item.key &&
                !(item.key === "library" && active().addProblem)
              }
              onNavigate={onNavigate}
            >
              {item.icon({ class: "h-5 w-5 shrink-0" })}
            </SidebarNavLink>
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
        <a
          class="ui-button inline-flex w-full items-center justify-center gap-2"
          data-variant="primary"
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