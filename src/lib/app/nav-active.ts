export type SidebarSectionKey =
  | "dashboard"
  | "library"
  | "topics"
  | "learning"
  | "profile"
  | "discover";

export type SidebarActiveState = {
  section: SidebarSectionKey | null;
  addProblem: boolean;
};

export function normalizePathname(pathname: string): string {
  if (pathname === "/") return pathname;
  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function resolveSidebarActive(pathname: string): SidebarActiveState {
  const path = normalizePathname(pathname);

  if (path === "/app") {
    return { section: "dashboard", addProblem: false };
  }

  if (path === "/app/profile" || path.startsWith("/app/profile/")) {
    return { section: "profile", addProblem: false };
  }

  if (path === "/app/topics" || path.startsWith("/app/topics/")) {
    return { section: "topics", addProblem: false };
  }

  if (path === "/app/learning" || path.startsWith("/app/learning/")) {
    return { section: "learning", addProblem: false };
  }

  if (path === "/app/problems/new") {
    return { section: "library", addProblem: true };
  }

  if (path === "/app/problems" || path.startsWith("/app/problems/")) {
    return { section: "library", addProblem: false };
  }

  if (path === "/app/discover" || path.startsWith("/app/discover/")) {
    return { section: "discover", addProblem: false };
  }

  if (path === "/app/u" || path.startsWith("/app/u/")) {
    return { section: "discover", addProblem: false };
  }

  return { section: null, addProblem: false };
}

export function isSidebarSectionActive(
  section: SidebarSectionKey,
  pathname: string,
): boolean {
  return resolveSidebarActive(pathname).section === section;
}