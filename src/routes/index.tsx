import { Title } from "@solidjs/meta";
import { createSignal, Show } from "solid-js";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Panel } from "../components/ui/Panel";
export default function Home() {
  const [showDetails, setShowDetails] = createSignal(false);
  return (
    <main class="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Title>UI foundation — Practice</Title>
      <header class="mb-10 max-w-2xl">
        <Badge tone="brand">UI foundation</Badge>
        <h1 class="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
          A little structure.
          <br />A clearer practice.
        </h1>
        <p class="mt-4 max-w-xl text-base leading-7 text-muted">
          A calm, focused workspace for your problem-solving journey. This page
          previews the visual system; your problem library comes next.
        </p>
      </header>
      <div class="grid items-start gap-6 lg:grid-cols-2">
        <Panel
          title="Actions & hierarchy"
          description="One clear primary action, with quieter alternatives."
        >
          <div class="flex flex-wrap gap-3">
            <Button
              onClick={() => setShowDetails((value) => !value)}
              aria-pressed={showDetails()}
            >
              Toggle preview
            </Button>
            <Button variant="secondary" disabled>
              Disabled action
            </Button>
            <a class="ui-button" data-variant="ghost" href="#input-preview">
              View inputs ↓
            </a>
          </div>
          <div
            class="mt-5 min-h-12 text-sm leading-6 text-muted"
            aria-live="polite"
          >
            <Show
              when={showDetails()}
              fallback={
                <p>Use the primary button to reveal a contextual message.</p>
              }
            >
              <p class="rounded-lg bg-brand-soft p-3 text-brand">
                A contextual message, revealed when you need it.
              </p>
            </Show>
          </div>
        </Panel>
        <Panel
          title="Tags & status"
          description="Compact labels that stay readable in a problem list."
          actions={<Badge>Preview</Badge>}
        >
          <div class="flex flex-wrap gap-2">
            <Badge tone="brand">Monotonic stack</Badge>
            <Badge>Arrays</Badge>
            <Badge>Greedy</Badge>
          </div>
          <div class="mt-5 flex flex-wrap gap-2">
            <Badge tone="success">Solved</Badge>
            <Badge>Unsolved</Badge>
            <Badge tone="warning">Notice</Badge>
            <Badge tone="danger">Error</Badge>
          </div>
          <p class="mt-4 text-sm text-muted">
            Always pair status colors with a text label.
          </p>
        </Panel>
        <div id="input-preview" class="scroll-mt-6">
          <Panel
            title="Inputs"
            description="Visible labels, useful hints, and generous focus targets."
          >
            <label class="mb-2 block text-sm font-medium" for="preview-title">
              Problem title
            </label>
            <input
              class="ui-field"
              id="preview-title"
              placeholder="e.g. Daily Temperatures"
              aria-describedby="preview-title-hint"
            />
            <p id="preview-title-hint" class="mt-2 text-sm text-muted">
              Style preview only. This input does not save a problem.
            </p>
          </Panel>
        </div>
        <Panel
          title="Palette & surfaces"
          description="Soft neutrals, deep teal, and restrained elevation."
        >
          <div class="grid grid-cols-3 gap-3">
            <div>
              <div class="h-16 rounded-lg bg-brand" />
              <p class="mt-2 text-xs text-muted">Brand</p>
            </div>
            <div>
              <div class="h-16 rounded-lg border border-line bg-canvas" />
              <p class="mt-2 text-xs text-muted">Canvas</p>
            </div>
            <div>
              <div class="h-16 rounded-lg bg-ink" />
              <p class="mt-2 text-xs text-muted">Ink</p>
            </div>
          </div>
        </Panel>
      </div>
    </main>
  );
}
