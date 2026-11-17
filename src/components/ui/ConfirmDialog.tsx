import { createEffect } from "solid-js";
import { Button } from "./Button";

export type ConfirmDialogProps = {
  open: boolean;
  titleId?: string;
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** When true, the cancel action uses primary styling (safe default). */
  emphasizeCancel?: boolean;
  confirmTone?: "default" | "danger";
  pending?: boolean;
  pendingLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog(props: ConfirmDialogProps) {
  let dialogRef: HTMLDialogElement | undefined;
  const titleId = () => props.titleId ?? "confirm-dialog-title";

  createEffect(
    () => props.open,
    (open) => {
      const dialog = dialogRef;
      if (!dialog) return;
      if (open && !dialog.open) dialog.showModal();
      else if (!open && dialog.open) dialog.close();
    },
  );

  const confirmVariant = () => {
    if (props.emphasizeCancel) return "secondary" as const;
    return props.confirmTone === "danger" ? "danger" : "primary";
  };

  const cancelVariant = () => (props.emphasizeCancel ? "primary" : "secondary");

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId()}
      aria-busy={props.pending ? "true" : undefined}
      class="ui-dialog ui-dialog-md z-50 w-full rounded-panel border border-line bg-surface p-6 shadow-panel backdrop:bg-ink/55"
      onCancel={(event) => {
        event.preventDefault();
        if (props.pending) return;
        props.onCancel();
      }}
      onClose={() => {
        if (props.pending) return;
        if (!props.open) return;
        props.onCancel();
      }}
    >
      <h2 id={titleId()} class="text-section font-semibold tracking-tight">
        {props.title}
      </h2>
      {props.description ? <p class="mt-2 text-label text-muted">{props.description}</p> : null}
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <Button
          variant={cancelVariant()}
          disabled={props.pending}
          onClick={() => props.onCancel()}
        >
          {props.cancelLabel ?? "Cancel"}
        </Button>
        <Button
          variant={confirmVariant()}
          disabled={props.pending}
          aria-busy={props.pending}
          onClick={() => props.onConfirm()}
        >
          {props.pending && props.pendingLabel ? props.pendingLabel : props.confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}