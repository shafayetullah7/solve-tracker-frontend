export type ProgressBarProps = {
  value: number;
  label: string;
  class?: string;
};

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function ProgressBar(props: ProgressBarProps) {
  const percent = () => clampPercent(props.value);

  return (
    <div
      class={["h-2 w-full overflow-hidden rounded-full bg-surface-muted", props.class]}
      role="progressbar"
      aria-valuenow={percent()}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={props.label}
    >
      <div
        class="h-full rounded-full bg-brand transition-[width] duration-300 ease-out"
        style={{ width: `${percent()}%` }}
      />
    </div>
  );
}