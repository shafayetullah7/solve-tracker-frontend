export type ProfileEditorTarget =
  | { kind: "about-edit" }
  | { kind: "handle-edit" }
  | { kind: "avatar-edit" }
  | { kind: "work-add" }
  | { kind: "work-edit"; id: string }
  | { kind: "education-add" }
  | { kind: "education-edit"; id: string };

export function profileEditorTitle(target: ProfileEditorTarget | null): string {
  if (!target) return "";
  switch (target.kind) {
    case "about-edit":
      return "Edit about you";
    case "handle-edit":
      return "Change handle";
    case "avatar-edit":
      return "Change profile photo";
    case "work-add":
      return "Add work";
    case "work-edit":
      return "Edit work";
    case "education-add":
      return "Add education";
    case "education-edit":
      return "Edit education";
  }
}

export type ProfileEntryEditorTarget = Exclude<
  ProfileEditorTarget,
  { kind: "about-edit" } | { kind: "handle-edit" } | { kind: "avatar-edit" }
>;

export function isProfileEntryEditorTarget(
  target: ProfileEditorTarget | null,
): target is ProfileEntryEditorTarget {
  return (
    target !== null &&
    target.kind !== "about-edit" &&
    target.kind !== "handle-edit" &&
    target.kind !== "avatar-edit"
  );
}

export const MAX_EDUCATION_ENTRIES = 2;