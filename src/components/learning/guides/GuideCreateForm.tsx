import { createSignal, Show } from "solid-js";
import { Button } from "../../ui/Button";
import { FormField, formFieldControlAttrs } from "../../ui/FormField";
import { FormAlert } from "../../ui/FormAlert";

export type GuideCreateFormProps = {
  pending: boolean;
  error?: string;
  onSubmit: (input: { title: string; description: string }) => void;
};

export function GuideCreateForm(props: GuideCreateFormProps) {
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");

  return (
    <form
      class="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit({ title: title().trim(), description: description().trim() });
      }}
    >
      <Show when={props.error}>
        {(message) => <FormAlert variant="error">{message()}</FormAlert>}
      </Show>
      <FormField id="guide-title" label="Title" required>
        <input
          class="ui-field"
          {...formFieldControlAttrs({ id: "guide-title" })}
          value={title()}
          maxlength={200}
          disabled={props.pending}
          onInput={(event) => setTitle(event.currentTarget.value)}
        />
      </FormField>
      <FormField id="guide-description" label="Description (optional)">
        <textarea
          class="ui-field min-h-[6rem]"
          {...formFieldControlAttrs({ id: "guide-description" })}
          value={description()}
          maxlength={10000}
          disabled={props.pending}
          onInput={(event) => setDescription(event.currentTarget.value)}
        />
      </FormField>
      <Button type="submit" disabled={props.pending || title().trim().length === 0}>
        {props.pending ? "Creating…" : "Create guide"}
      </Button>
    </form>
  );
}