const BANNER_ID = "practice-chunk-load-banner";

const BANNER_CLASS =
  "fixed inset-x-0 top-0 z-[100] border-b border-line bg-surface px-5 py-4 shadow-panel sm:px-8";

const INNER_CLASS =
  "mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between";

const MESSAGE_CLASS = "text-sm text-ink";

const BUTTON_CLASS =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-control bg-brand px-4 text-sm font-medium text-on-brand hover:opacity-90";

export function showChunkLoadBanner(
  doc: Document,
  onReload: () => void = () => globalThis.location.reload(),
): void {
  if (doc.getElementById(BANNER_ID)) return;

  const banner = doc.createElement("div");
  banner.id = BANNER_ID;
  banner.setAttribute("role", "alert");
  banner.className = BANNER_CLASS;

  const inner = doc.createElement("div");
  inner.className = INNER_CLASS;

  const message = doc.createElement("p");
  message.className = MESSAGE_CLASS;
  message.textContent =
    "Part of this page failed to load—often after a deploy. Reload to get the latest version.";

  const button = doc.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  button.textContent = "Reload page";
  button.addEventListener("click", onReload);

  inner.append(message, button);
  banner.append(inner);
  doc.body.prepend(banner);
}

/** Vite lazy-chunk failures — show recovery UI instead of a blank route. */
export function installChunkLoadRecovery(win: Window = globalThis.window): void {
  if (!win?.addEventListener) return;
  win.addEventListener("vite:preloadError", () => {
    showChunkLoadBanner(win.document);
  });
}