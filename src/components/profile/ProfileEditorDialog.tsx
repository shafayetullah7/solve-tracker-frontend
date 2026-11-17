import { createEffect, type ParentProps } from "solid-js";

export type ProfileEditorDialogProps = ParentProps<{
  open: boolean;
  titleId: string;
  title: string;
  description?: string;
  size?: "md" | "lg";
  closeBlocked?: boolean;
  onClose: () => void;
  onRequestClose?: () => void;
}>;

export function ProfileEditorDialog(props: ProfileEditorDialogProps) {
  let dialogRef: HTMLDialogElement | undefined;

  const requestClose = () => (props.onRequestClose ?? props.onClose)();

  createEffect(
    () => props.open,
    (open) => {
      const dialog = dialogRef;
      if (!dialog) return;
      if (open) {
        if (typeof dialog.showModal === "function" && !dialog.open) {
          dialog.showModal();
        }
      } else if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      }
    },
  );

  const sizeClass = () => (props.size === "lg" ? "ui-dialog-lg" : "ui-dialog-md");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={props.titleId}
      aria-busy={props.closeBlocked ? "true" : undefined}
      class={`ui-dialog ${sizeClass()} w-full rounded-panel border border-line bg-surface p-6 shadow-panel backdrop:bg-ink/40`}
      onCancel={(event) => {
        event.preventDefault();
        if (props.closeBlocked) return;
        requestClose();
      }}
      onClose={() => {
        if (props.closeBlocked) return;
        props.onClose();
      }}
    >
      <h2 id={props.titleId} class="text-section font-semibold tracking-tight">
        {props.title}
      </h2>
      {props.description ? <p class="mt-2 text-label text-muted">{props.description}</p> : null}
      <div class="mt-5">{props.children}</div>
    </dialog>
  );
}