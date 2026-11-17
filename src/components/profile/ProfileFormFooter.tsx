import type { ParentProps } from "solid-js";
import { Button } from "../ui/Button";

export type ProfileFormFooterProps = ParentProps<{
  submitLabel?: string;
  pendingLabel?: string;
  onCancel: () => void;
  pending?: boolean;
  submitDisabled?: boolean;
}>;

export function ProfileFormFooter(props: ProfileFormFooterProps) {
  const pendingLabel = () => props.pendingLabel ?? "Saving…";
  const submitDisabled = () => props.pending || props.submitDisabled;

  return (
    <div class="flex flex-wrap gap-3 border-t border-line pt-4">
      <Button type="submit" disabled={submitDisabled()}>
        {props.pending ? pendingLabel() : (props.submitLabel ?? "Save")}
      </Button>
      <Button
        type="button"
        variant="secondary"
        disabled={props.pending}
        onClick={() => props.onCancel()}
      >
        Cancel
      </Button>
      {props.children}
    </div>
  );
}