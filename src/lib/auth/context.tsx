import { getRequestEvent, isServer } from "@solidjs/web";
import type { ParentProps } from "solid-js";
import {
  createContext,
  createSignal,
  onSettled,
  untrack,
  useContext,
} from "solid-js";
import { ApiError } from "../api/errors";
import type { ApiClient } from "../api/client";
import type {
  createAuthApi,
  LoginInput,
} from "../api/modules/auth.api";
import { createAuthClients } from "./clients";
import type { AuthCoordinator } from "./coordinator";
import { createAuthCrossTab, createTabId, type AuthCrossTab } from "./cross-tab";
import {
  readClientBootstrapFromDom,
  type ServerAuthBootstrap,
} from "./server-session";
import {
  resolveBootstrapSession,
  type AuthUser,
  type BootstrapResult,
} from "./session-state";

export type AuthStatus =
  | "checking"
  | "authenticated"
  | "anonymous"
  | "unavailable";

export type AuthClientsBundle = ReturnType<typeof createAuthClients>;

export type AuthContextValue = {
  status: () => AuthStatus;
  user: () => AuthUser | undefined;
  productClient: ApiClient;
  authApi: ReturnType<typeof createAuthApi>;
  coordinator: AuthCoordinator;
  supportsAutoRecovery: boolean;
  revocationUnconfirmed: () => boolean;
  establishSession: (user: AuthUser) => void;
  clearSession: () => void;
  retryBootstrap: () => Promise<void>;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  retryLogout: () => Promise<void>;
  notifyPeersLoggedOut: () => void;
};

const AuthContext = createContext<AuthContextValue>();

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

/** Test and story overrides without bootstrapping network. */
export function AuthContextOverride(
  props: ParentProps<{ value: AuthContextValue }>,
) {
  return <AuthContext value={props.value}>{props.children}</AuthContext>;
}

function authStatusFromSeed(
  seed: ServerAuthBootstrap | undefined,
): AuthStatus {
  return seed?.kind ?? "checking";
}

/**
 * Same seed on both sides of hydration: the auth gate middleware stores it on
 * the request event for SSR and injects it as JSON for the browser.
 */
function resolveBootstrapSeed(): ServerAuthBootstrap | undefined {
  if (isServer) return getRequestEvent()?.locals?.practiceAuthBootstrap;
  return readClientBootstrapFromDom();
}

function userFromSeed(
  seed: ServerAuthBootstrap | undefined,
): AuthUser | undefined {
  return seed?.kind === "authenticated" ? seed.user : undefined;
}

function applyBootstrapResult(
  result: BootstrapResult,
  setStatus: (value: AuthStatus) => void,
  setUser: (value: AuthUser | undefined) => void,
) {
  switch (result.kind) {
    case "authenticated":
      setUser(result.user);
      setStatus("authenticated");
      break;
    case "anonymous":
      setUser(undefined);
      setStatus("anonymous");
      break;
    case "unavailable":
      setUser(undefined);
      setStatus("unavailable");
      break;
    case "cancelled":
      break;
  }
}

export function AuthProvider(
  props: ParentProps<{
    clients?: AuthClientsBundle;
    /** Test override; the app seeds from the request event / DOM. */
    initialBootstrap?: ServerAuthBootstrap;
  }>,
) {
  const { bundle, hadSeed, seed } = untrack(() => {
    const resolved = props.initialBootstrap ?? resolveBootstrapSeed();
    return {
      bundle: props.clients ?? createAuthClients(),
      hadSeed: resolved !== undefined,
      seed: resolved,
    };
  });

  const [status, setStatus] = createSignal<AuthStatus>(
    authStatusFromSeed(seed),
  );
  const [user, setUser] = createSignal<AuthUser | undefined>(
    userFromSeed(seed),
  );
  const [revocationUnconfirmed, setRevocationUnconfirmed] = createSignal(false);

  let bootstrapGeneration = 0;
  let crossTab: AuthCrossTab | undefined;

  /** Drop in-flight SSR/client session probes so they cannot clobber a fresh login. */
  function invalidateBootstrapProbe() {
    bootstrapGeneration += 1;
  }

  async function runBootstrap(options?: { forceChecking?: boolean }) {
    const generation = ++bootstrapGeneration;
    const soft = hadSeed && !options?.forceChecking;
    if (!soft) {
      setStatus("checking");
      setUser(undefined);
    }
    const result = await resolveBootstrapSession(
      bundle.authApi,
      bundle.coordinator,
      { isAborted: () => generation !== bootstrapGeneration },
    );
    if (generation !== bootstrapGeneration) return;
    applyBootstrapResult(result, setStatus, setUser);
  }

  async function onPeerInvalidate() {
    bootstrapGeneration += 1;
    await runBootstrap({ forceChecking: true });
  }

  async function callServerLogout(): Promise<boolean> {
    try {
      await bundle.coordinator.runWithSessionLock(() =>
        bundle.authApi.logout(),
      );
      setRevocationUnconfirmed(false);
      return true;
    } catch {
      setRevocationUnconfirmed(true);
      return false;
    }
  }

  onSettled(() => {
    if (typeof document === "undefined") return;
    const tabId = createTabId();
    crossTab = createAuthCrossTab({
      tabId,
      broadcast: bundle.broadcast,
      coordinator: bundle.coordinator,
      onInvalidate: onPeerInvalidate,
    });
    const unsubscribe = bundle.broadcast.subscribe((message) =>
      crossTab!.handleMessage(message),
    );
    void runBootstrap();
    return () => {
      bootstrapGeneration += 1;
      unsubscribe();
      crossTab?.close();
      crossTab = undefined;
    };
  });

  const value: AuthContextValue = {
    status,
    user,
    productClient: bundle.productClient,
    authApi: bundle.authApi,
    coordinator: bundle.coordinator,
    supportsAutoRecovery: bundle.coordinator.supportsAutoRecovery,
    revocationUnconfirmed,
    establishSession(sessionUser) {
      invalidateBootstrapProbe();
      setUser(sessionUser);
      setStatus("authenticated");
    },
    clearSession() {
      invalidateBootstrapProbe();
      bundle.coordinator.bumpEpoch();
      setUser(undefined);
      setStatus("anonymous");
    },
    retryBootstrap: () => runBootstrap({ forceChecking: true }),
    notifyPeersLoggedOut() {
      crossTab?.publishLoggedOut();
    },
    async login(input) {
      invalidateBootstrapProbe();
      const startEpoch = bundle.coordinator.getEpoch();
      const session = await bundle.coordinator.runWithSessionLock(() =>
        bundle.authApi.login(input),
      );
      if (bundle.coordinator.getEpoch() !== startEpoch) {
        throw new ApiError(
          "context-changed",
          "Authentication context changed.",
        );
      }
      setUser(session.user);
      setStatus("authenticated");
      setRevocationUnconfirmed(false);
      crossTab?.publishSessionChanged();
    },
    async logout() {
      bundle.coordinator.bumpEpoch();
      setUser(undefined);
      setStatus("anonymous");
      crossTab?.publishLoggedOut();
      await callServerLogout();
    },
    async retryLogout() {
      await callServerLogout();
    },
  };

  return <AuthContext value={value}>{props.children}</AuthContext>;
}