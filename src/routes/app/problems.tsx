import type { ParentProps } from "solid-js";
import { AppPageContainer } from "../../components/app/AppPageContainer";

export default function ProblemsLayout(props: ParentProps) {
  return <AppPageContainer>{props.children}</AppPageContainer>;
}