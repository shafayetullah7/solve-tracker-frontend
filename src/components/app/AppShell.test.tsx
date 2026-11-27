import { cleanup, fireEvent, render, screen, within } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { AuthContextValue } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";
import { AppShell } from "./AppShell";

const navigate = vi.fn();
const logout = vi.fn();

const [pathname, setPathname] = createSignal("/app/problems");

vi.mock("@solidjs/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@solidjs/router")>();
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({
      get pathname() {
        return pathname();
      },
      search: "",
      hash: "",
      state: {},
      query: {},
      key: "",
    }),
  };
});

const user = { id: "u1", name: "Test", email: "t@example.test", handle: "test_user" };

function authValue(): AuthContextValue {
  return {
    status: () => "authenticated",
    user: () => user,
    account: () => undefined,
    productClient: { request: vi.fn() } as AuthContextValue["productClient"],
    authApi: {} as AuthContextValue["authApi"],
    coordinator: {} as AuthContextValue["coordinator"],
    supportsAutoRecovery: true,
    establishSession: vi.fn(),
    clearSession: vi.fn(),
    retryBootstrap: async () => {},
    reloadSession: async () => {},
    login: vi.fn(),
    logout,
    revocationUnconfirmed: () => false,
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
  };
}

function renderShell() {
  return render(() => (
    <AuthContextOverride value={authValue()}>
      <AppShell>
        <p>Outlet content</p>
      </AppShell>
    </AuthContextOverride>
  ));
}

afterEach(cleanup);

beforeEach(() => {
  setPathname("/app/problems");
  navigate.mockReset();
  logout.mockReset();
  logout.mockResolvedValue(undefined);
});

describe("AppShell", () => {
  test("exposes skip target main and outlet", () => {
    const view = renderShell();
    const main = view.container.querySelector("#main-content");
    expect(main).toBeTruthy();
    expect(view.getByText("Outlet content")).toBeInTheDocument();
  });

  test("marks Problems as current on /app/problems", () => {
    setPathname("/app/problems");
    renderShell();
    const problems = screen.getByRole("link", { name: "Problems" });
    expect(problems).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("highlights Problems and marks Add problem current on /app/problems/new", () => {
    setPathname("/app/problems/new");
    renderShell();
    const problems = screen.getByRole("link", { name: "Problems" });
    expect(problems).not.toHaveAttribute("aria-current");
    expect(problems.className).toContain("bg-brand-soft");
    const add = screen.getAllByRole("link", { name: /^Add problem$/i })[0]!;
    expect(add).toHaveAttribute("aria-current", "page");
    expect(add).toHaveAttribute("data-active");
  });

  test("exposes Create menu with problem and topic entries", () => {
    renderShell();
    expect(screen.getAllByText("Create").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("menuitem", { name: "Add problem" }).length).toBeGreaterThan(
      0,
    );
    expect(screen.getAllByRole("menuitem", { name: "New topic" }).length).toBeGreaterThan(0);
  });

  test("traps Tab focus inside open drawer", async () => {
    renderShell();
    fireEvent.click(screen.getByRole("button", { name: "Open navigation menu" }));
    await flush();
    const dialog = screen.getByRole("dialog", { name: "Navigation menu" });
    const signOut = within(dialog).getByRole("button", { name: "Sign out" });
    signOut.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    await flush();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(signOut);
  });

  test("opens and closes mobile drawer with Escape", async () => {
    renderShell();
    const menu = screen.getByRole("button", { name: "Open navigation menu" });
    fireEvent.click(menu);
    await flush();
    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    await flush();
    expect(
      screen.queryByRole("dialog", { name: "Navigation menu" }),
    ).not.toBeInTheDocument();
    expect(menu).toHaveFocus();
  });

  test("sign out calls auth logout", async () => {
    renderShell();
    fireEvent.click(screen.getAllByRole("button", { name: "Sign out" })[0]!);
    await flush();
    expect(logout).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/login");
  });
});