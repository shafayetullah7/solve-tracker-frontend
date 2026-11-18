import { createSignal, Show } from "solid-js";
import { discoverCopy } from "../../lib/discover/copy";
import { Button } from "../ui/Button";
import { FormAlert } from "../ui/FormAlert";

export type PeopleSafetyMenuProps = {
  onBlock: () => Promise<void>;
  onReport: (reason: string) => Promise<void>;
};

export function PeopleSafetyMenu(props: PeopleSafetyMenuProps) {
  const [blocked, setBlocked] = createSignal(false);
  const [pending, setPending] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();
  const [reportOpen, setReportOpen] = createSignal(false);
  const [reason, setReason] = createSignal("");

  async function toggleBlock() {
    setPending(true);
    setError(undefined);
    try {
      await props.onBlock();
      setBlocked(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not update block.");
    } finally {
      setPending(false);
    }
  }

  async function submitReport() {
    setPending(true);
    setError(undefined);
    try {
      await props.onReport(reason().trim());
      setReportOpen(false);
      setReason("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not send report.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div class="flex flex-col items-start gap-2">
      <div class="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={pending() || blocked()}
          onClick={() => void toggleBlock()}
        >
          {discoverCopy("public.block")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={pending()}
          onClick={() => setReportOpen((v) => !v)}
        >
          {discoverCopy("public.report")}
        </Button>
      </div>
      <Show when={reportOpen()}>
        <div class="flex w-full max-w-md flex-col gap-2">
          <textarea
            class="min-h-24 rounded-control border border-line bg-surface px-3 py-2 text-sm"
            value={reason()}
            onInput={(e) => setReason(e.currentTarget.value)}
            placeholder={discoverCopy("public.reportPlaceholder")}
          />
          <Button
            type="button"
            disabled={pending() || !reason().trim()}
            onClick={() => void submitReport()}
          >
            {discoverCopy("public.reportSubmit")}
          </Button>
        </div>
      </Show>
      <Show when={error()}>
        <FormAlert variant="error" class="text-sm">
          {error()}
        </FormAlert>
      </Show>
    </div>
  );
}