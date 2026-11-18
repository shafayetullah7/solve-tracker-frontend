import type { DiscoverRailKind } from "../api/modules/discover.api";

export type ForYouRailSlot = {
  kind: DiscoverRailKind;
  peopleCount: number;
};

export type ForYouSection =
  | { type: "rail"; kind: DiscoverRailKind }
  | { type: "goalPattern" }
  | { type: "yourTopics" }
  | { type: "starterLists" };

const DEFAULT_RAIL_ORDER: DiscoverRailKind[] = [
  "peers",
  "ahead",
  "same_goal",
  "consistent",
  "active_week",
];

export function buildForYouSections(input: {
  rails: ForYouRailSlot[];
  viewerHasGoal: boolean;
  goalPatternItems: number;
  yourTopicsCount: number;
  starterListsCount: number;
}): ForYouSection[] {
  const railByKind = new Map(input.rails.map((r) => [r.kind, r]));
  const visibleRails = DEFAULT_RAIL_ORDER.filter((kind) => {
    const rail = railByKind.get(kind);
    return rail && rail.peopleCount >= 3;
  });

  if (input.viewerHasGoal) {
    const idx = visibleRails.indexOf("same_goal");
    if (idx > 0) {
      const [sameGoal] = visibleRails.splice(idx, 1);
      visibleRails.unshift(sameGoal!);
    }
  }

  const sections: ForYouSection[] = visibleRails.map((kind) => ({
    type: "rail",
    kind,
  }));

  if (input.goalPatternItems > 0) {
    sections.push({ type: "goalPattern" });
  }

  if (input.yourTopicsCount > 0) {
    sections.push({ type: "yourTopics" });
  }
  if (input.starterListsCount > 0) {
    sections.push({ type: "starterLists" });
  }

  return sections;
}