import { createEffect, createSignal, Show } from "solid-js";
import { applyProfileApiError } from "../../lib/forms/apply-profile-api-error";
import { fieldErrorsFromApiError } from "../../lib/forms/enrich-field-errors";
import { HANDLE_FIELD_HINT, validateUserHandle } from "../../lib/auth/user-handle";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { FormAlert } from "../ui/FormAlert";
import { FormField, formFieldControlAttrs } from "../ui/FormField";
import { ProfileEditorDialog } from "./ProfileEditorDialog";
import { ProfileFormFooter } from "./ProfileFormFooter";

const TITLE_ID = "profile-handle-editor-title";
const FIELD_ID = "profile-handle-editor-field";

export type ProfileHandleEditorDialogProps = {
  open: boolean;
  currentHandle: string;
  onClose: () => void;
  onSave: (handle: string) => Promise<void>;
};

export function ProfileHandleEditorDialog(props: ProfileHandleEditorDialogProps) {
  const [handle, setHandle] = createSignal("");
  const [seed, setSeed] = createSignal("");
  const [formError, setFormError] = createSignal<string | undefined>();
  const [fieldError, setFieldError] = createSignal<string | undefined>();
  const [pending, setPending] = createSignal(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = createSignal(false);

  let seededForSession = false;

  createEffect(
    () => props.open,
    (open) => {
      if (!open) {
        seededForSession = false;
        return;
      }
      if (!seededForSession && !pending()) {
        setHandle(props.currentHandle);
        setSeed(props.currentHandle);
        setFormError(undefined);
        setFieldError(undefined);
        seededForSession = true;
      }
    },
  );

  const isDirty = () => handle() !== seed();

  function requestClose() {
    if (pending()) return;
    if (isDirty()) {
      setDiscardConfirmOpen(true);
      return;
    }
    props.onClose();
  }

  async function save(event: Event) {
    event.preventDefault();
    if (pending()) return;
    const next = handle().trim();
    const clientErr = validateUserHandle(next);
    if (clientErr) {
      setFieldError(clientErr);
      return;
    }
    if (next === props.currentHandle) {
      props.onClose();
      return;
    }
    setPending(true);
    setFormError(undefined);
    setFieldError(undefined);
    try {
      await props.onSave(next);
      props.onClose();
    } catch (error) {
      const applied = applyProfileApiError(error);
      setFormError(applied.banner);
      const fields = fieldErrorsFromApiError(error);
      if (fields.handle) setFieldError(fields.handle);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <ProfileEditorDialog
        open={props.open}
        titleId={TITLE_ID}
        title="Change handle"
        description="Your handle is a unique public id in Practice. You can change it at most once every 30 days."
        closeBlocked={pending() || discardConfirmOpen()}
        onClose={() => props.onClose()}
        onRequestClose={requestClose}
      >
        <form class="space-y-4" onSubmit={(event) => void save(event)} aria-busy={pending() ? "true" : undefined}>
          <FormField
            id={FIELD_ID}
            label="Handle"
            hint={HANDLE_FIELD_HINT}
            error={fieldError()}
          >
            <input
              class="ui-field"
              autocomplete="off"
              spellcheck={false}
              disabled={pending()}
              {...formFieldControlAttrs({
                id: FIELD_ID,
                hint: HANDLE_FIELD_HINT,
                error: fieldError(),
              })}
              value={handle()}
              onInput={(event) => {
                setHandle(event.currentTarget.value);
                setFieldError(undefined);
                setFormError(undefined);
              }}
            />
          </FormField>
          <Show when={formError()}>
            <FormAlert variant="error" retryAfter={undefined}>
              {formError()}
            </FormAlert>
          </Show>
          <ProfileFormFooter
            submitLabel="Save handle"
            pending={pending()}
            onCancel={requestClose}
          />
        </form>
      </ProfileEditorDialog>
      <ConfirmDialog
        open={discardConfirmOpen()}
        titleId="profile-handle-discard-title"
        title="Discard unsaved changes?"
        description="Your handle edit will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard"
        emphasizeCancel
        onConfirm={() => {
          setDiscardConfirmOpen(false);
          props.onClose();
        }}
        onCancel={() => setDiscardConfirmOpen(false)}
      />
    </>
  );
}