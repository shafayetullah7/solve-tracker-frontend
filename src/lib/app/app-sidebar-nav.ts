import type { JSX } from "@solidjs/web";
import type { IconProps } from "../../icons/icon-props";
import {
  IconDashboard,
  IconDiscover,
  IconGuides,
  IconLibrary,
  IconTopics,
  IconUser,
} from "../../icons";
import { discoverForYouPath } from "../discover/paths";
import { learningLibraryPath } from "../learning/paths";
import { paths } from "../../router";
import type { SidebarSectionKey } from "./nav-active";

export const SIDEBAR_LABELS = {
  overview: "Overview",
  myGuides: "My guides",
  problems: "Problems",
  topics: "Topics",
  profile: "Profile",
} as const;

export type SidebarNavItem = {
  key: SidebarSectionKey;
  label: string;
  href: string;
  icon: (props: IconProps) => JSX.Element;
};

export type SidebarNavFlags = {
  learningEnabled: boolean;
  discoverFullEnabled: boolean;
};

export function buildNavItems(
  flags: SidebarNavFlags,
  discoverNavLabel: string,
): SidebarNavItem[] {
  const items: SidebarNavItem[] = [
    {
      key: "dashboard",
      label: SIDEBAR_LABELS.overview,
      href: paths.app(),
      icon: IconDashboard,
    },
  ];
  if (flags.learningEnabled) {
    items.push({
      key: "learning",
      label: SIDEBAR_LABELS.myGuides,
      href: learningLibraryPath(),
      icon: IconGuides,
    });
  }
  items.push(
    {
      key: "library",
      label: SIDEBAR_LABELS.problems,
      href: paths.app.problems(),
      icon: IconLibrary,
    },
    {
      key: "topics",
      label: SIDEBAR_LABELS.topics,
      href: paths.app.topics(),
      icon: IconTopics,
    },
  );
  if (flags.discoverFullEnabled) {
    items.push({
      key: "discover",
      label: discoverNavLabel,
      href: discoverForYouPath(),
      icon: IconDiscover,
    });
  }
  items.push({
    key: "profile",
    label: SIDEBAR_LABELS.profile,
    href: paths.app.profile(),
    icon: IconUser,
  });
  return items;
}