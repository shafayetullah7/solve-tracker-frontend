/** Move focus to the first invalid control inside a form (after validation). */
export function focusFirstInvalid(root: HTMLElement | undefined): void {
  if (!root) return;
  const control = root.querySelector<HTMLElement>('[aria-invalid="true"]');
  if (!control || typeof control.focus !== "function") return;
  const narrow = document.documentElement.clientWidth < 640;
  control.focus({ preventScroll: narrow });
}