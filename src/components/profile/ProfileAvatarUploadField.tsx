import { createSignal, Show } from "solid-js";
import { AVATAR_ACCEPT, pickFirstImageFile, validateAvatarFile } from "../../lib/profile/profile-avatar-upload";
import { Button } from "../ui/Button";

export type ProfileAvatarUploadFieldProps = {
  disabled?: boolean;
  onFile: (file: File) => void;
  onError: (message: string) => void;
};

export function ProfileAvatarUploadField(props: ProfileAvatarUploadFieldProps) {
  let inputRef: HTMLInputElement | undefined;
  const [dragOver, setDragOver] = createSignal(false);

  function acceptFile(file: File | null) {
    if (!file || props.disabled) return;
    try {
      validateAvatarFile(file);
      props.onFile(file);
    } catch (error) {
      props.onError(error instanceof Error ? error.message : "Could not use that file.");
    }
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    setDragOver(false);
    if (props.disabled) return;
    acceptFile(pickFirstImageFile(event.dataTransfer?.files));
  }

  return (
    <div class="space-y-3">
      <div
        class={`rounded-panel border-2 border-dashed px-5 py-8 text-center transition-colors ${
          dragOver()
            ? "border-brand bg-brand-soft/40"
            : "border-line bg-surface-muted/50"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!props.disabled) setDragOver(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!props.disabled) setDragOver(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (event.currentTarget === event.target) setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <p class="text-body font-medium text-ink">Drag and drop your image here</p>
        <p class="mt-1 text-label text-muted">PNG, JPG, WebP, or GIF · up to 5 MB</p>
        <Button
          type="button"
          variant="secondary"
          class="mt-4"
          disabled={props.disabled}
          onClick={() => inputRef?.click()}
        >
          Choose from device
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={AVATAR_ACCEPT}
          class="sr-only"
          disabled={props.disabled}
          onChange={(event) => {
            const file = pickFirstImageFile(event.currentTarget.files);
            acceptFile(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <Show when={dragOver()}>
        <p class="text-caption text-brand" role="status">
          Release to upload
        </p>
      </Show>
    </div>
  );
}