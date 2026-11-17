import { dynamic } from "@solidjs/web";
import { PracticeMark } from "../brand/PracticeMark";

export type RouteLoadingScreenProps = {
  class?: string;
  /** When true, sets id="main-content" for skip-link and shell parity. */
  mainContent?: boolean;
};

/** Full-route wait: centered enlarged brand mark, no skeleton or visible text. */
export function RouteLoadingScreen(props: RouteLoadingScreenProps) {
  const ownsMain = () => props.mainContent !== false;
  const Root = dynamic(() => (ownsMain() ? "main" : "div"));
  return (
    <Root
      id={ownsMain() ? "main-content" : undefined}
      class={["flex min-h-0 flex-1 items-center justify-center", props.class]}
      role="status"
      aria-label="Loading"
    >
      <PracticeMark class="h-44 w-44 text-brand opacity-[0.18] sm:h-60 sm:w-60" />
    </Root>
  );
}
