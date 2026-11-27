import { cleanup, render, screen } from "@solidjs/testing-library";
import { flush } from "solid-js";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { AuthContextValue } from "../../lib/auth/context";
import { AuthContextOverride } from "../../lib/auth/context";
import { AppSidebar } from "./AppSidebar";

const navigate = vi.fn();

vi.mock("@solidjs/router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@solidjs/router")>();
  return {
    ...actual,
    useNavigate: () => navigate,
    useLocation: () => ({
      pathname: "/app",
      search: "",
      hash: "",
      state: {},
      query: {},
      key: "",
    }),
  };
});

vi.mock("../../lib/discover/flag", () => ({
  isDiscoverFullEnabled: () => false,
}));

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
    logout: vi.fn().mockResolvedValue(undefined),
    revocationUnconfirmed: () => false,
    retryLogout: vi.fn(),
    notifyPeersLoggedOut: vi.fn(),
  };
}

afterEach(cleanup);

describe("AppSidebar learning nav", () => {
  test("shows Study guides and guide create items", async () => {
    render(() => (
      <AuthContextOverride value={authValue()}>
        <AppSidebar variant="rail" />
      </AuthContextOverride>
    ));
    await flush();
    expect(screen.getByRole("link", { name: "Study guides" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "New guide" })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Import guide" })).toBeInTheDocument();
  });
});