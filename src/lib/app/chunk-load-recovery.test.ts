import { describe, expect, test, vi } from "vitest";
import { installChunkLoadRecovery, showChunkLoadBanner } from "./chunk-load-recovery";

describe("chunk-load-recovery", () => {
  test("showChunkLoadBanner is idempotent and wires reload", () => {
    const doc = document.implementation.createHTMLDocument("test");
    const reload = vi.fn();
    showChunkLoadBanner(doc, reload);
    showChunkLoadBanner(doc, reload);
    const banner = doc.getElementById("practice-chunk-load-banner");
    expect(banner).toBeTruthy();
    expect(banner?.getAttribute("role")).toBe("alert");
    expect(doc.querySelectorAll("#practice-chunk-load-banner")).toHaveLength(1);
    const button = doc.querySelector("button");
    button?.click();
    expect(reload).toHaveBeenCalledOnce();
  });

  test("installChunkLoadRecovery listens for vite:preloadError", () => {
    const listeners = new Map<string, EventListener>();
    const win = {
      addEventListener: (type: string, listener: EventListener) => {
        listeners.set(type, listener);
      },
      document,
    } as unknown as Window;
    installChunkLoadRecovery(win);
    const handler = listeners.get("vite:preloadError");
    expect(handler).toBeTypeOf("function");
    handler?.(new Event("vite:preloadError"));
    expect(document.getElementById("practice-chunk-load-banner")).toBeTruthy();
    document.getElementById("practice-chunk-load-banner")?.remove();
  });
});