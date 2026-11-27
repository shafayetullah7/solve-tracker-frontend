import { render } from "@solidjs/testing-library";
import { describe, expect, test, vi } from "vitest";
import type { ServerAuthBootstrap } from "./server-session";

const requestEvent = vi.hoisted(() => ({
  locals: {} as { practiceAuthBootstrap?: ServerAuthBootstrap },
}));

vi.mock("@solidjs/web", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@solidjs/web")>()),
  isServer: true,
  getRequestEvent: () => requestEvent,
}));

import { createAuthCoordinator } from "./coordinator";
import { createMemoryBroadcastHub } from "./broadcast";
import { AuthProvider, useAuth, type AuthClientsBundle } from "./context";
import { createMemoryLockAdapter } from "./locks";

const user = { id: "u1", name: "Ada", email: "ada@example.test", handle: "ada_writer" };

function Status() {
  const auth = useAuth();
  return <p data-testid="status">{auth.status()}</p>;
}

function clients(): AuthClientsBundle {
  const authApi = { getSession: vi.fn(() => new Promise(() => {})), refresh: vi.fn() };
  return {
    authApi: authApi as unknown as AuthClientsBundle["authApi"],
    coordinator: createAuthCoordinator({
      authApi: authApi as Parameters<typeof createAuthCoordinator>[0]["authApi"],
      locks: createMemoryLockAdapter(),
    }),
    productClient: { request: vi.fn() } as AuthClientsBundle["productClient"],
    rawClient: { request: vi.fn() } as AuthClientsBundle["rawClient"],
    broadcast: createMemoryBroadcastHub(),
  };
}

describe("AuthProvider session-neutral initialization", () => {
  test("ignores request-local identity during initialization", () => {
    requestEvent.locals.practiceAuthBootstrap = { kind: "authenticated", user };
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients()}>
        <Status />
      </AuthProvider>
    ));
    expect(getByTestId("status")).toHaveTextContent("checking");
  });

  test("falls back to checking without a snapshot", () => {
    requestEvent.locals = {};
    const { getByTestId } = render(() => (
      <AuthProvider clients={clients()}>
        <Status />
      </AuthProvider>
    ));
    expect(getByTestId("status")).toHaveTextContent("checking");
  });
});
