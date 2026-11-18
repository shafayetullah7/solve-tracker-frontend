export type CompareFocus = "cadence" | "topics";

export type CompareSection = "summary" | "platforms" | "topics" | "insights";

export function compareSectionOrder(focus?: CompareFocus): CompareSection[] {
  const topicsFirst: CompareSection[] = [
    "summary",
    "topics",
    "platforms",
    "insights",
  ];
  const cadenceFirst: CompareSection[] = [
    "summary",
    "platforms",
    "topics",
    "insights",
  ];
  return focus === "topics" ? topicsFirst : cadenceFirst;
}