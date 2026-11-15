export const AUTH_SESSION_LOCK = "practice:auth-session";

export interface LockAdapter {
  isSupported(): boolean;
  request<T>(name: string, callback: () => Promise<T>): Promise<T>;
}

export function createMemoryLockAdapter(): LockAdapter {
  let chain: Promise<unknown> = Promise.resolve();
  return {
    isSupported: () => true,
    request(_name, callback) {
      const result = chain.then(callback, callback);
      chain = result.then(
        () => undefined,
        () => undefined,
      );
      return result;
    },
  };
}

export function createBrowserLockAdapter(): LockAdapter {
  return {
    isSupported() {
      const locks = globalThis.navigator?.locks;
      return typeof locks?.request === "function";
    },
    request(name, callback) {
      const locks = globalThis.navigator?.locks;
      if (typeof locks?.request !== "function")
        return Promise.reject(new Error("Web Locks are unavailable."));
      return locks.request(name, callback);
    },
  };
}