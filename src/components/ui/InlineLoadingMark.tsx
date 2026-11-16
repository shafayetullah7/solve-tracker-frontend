import { PracticeMark } from "../brand/PracticeMark";

/** In-page wait (inside an existing main): centered faded mark, no extra landmark. */
export function InlineLoadingMark() {
  return (
    <div
      class="flex min-h-[min(24rem,50vh)] items-center justify-center"
      role="status"
      aria-label="Loading"
    >
      <PracticeMark class="h-36 w-36 text-brand opacity-[0.18] sm:h-44 sm:w-44" />
    </div>
  );
}