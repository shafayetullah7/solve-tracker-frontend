import type { ParentProps } from "solid-js";

/** Former env gate; learning routes always render children. */
export function LearningFeatureGate(props: ParentProps) {
  return <>{props.children}</>;
}