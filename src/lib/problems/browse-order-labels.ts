import type { ListProblemsQuery } from "../api/modules/problems.api";

type SortField = NonNullable<ListProblemsQuery["sort"]>;
type OrderField = NonNullable<ListProblemsQuery["order"]>;

export function browseOrderOptionLabel(
  sort: SortField,
  order: OrderField,
): string {
  if (sort === "title") {
    return order === "asc" ? "A → Z" : "Z → A";
  }
  return order === "asc" ? "Oldest first" : "Newest first";
}

export function browseOrderOptions(sort: SortField): {
  asc: string;
  desc: string;
} {
  if (sort === "title") {
    return { asc: "A → Z", desc: "Z → A" };
  }
  return { asc: "Oldest first", desc: "Newest first" };
}