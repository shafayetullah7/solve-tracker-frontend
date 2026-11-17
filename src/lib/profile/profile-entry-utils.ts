import type { EducationEntry, WorkEntry } from "./profile-view.types";

export function findWorkEntry(list: WorkEntry[], id: string): WorkEntry | undefined {
  return list.find((item) => item.id === id);
}

export function findEducationEntry(
  list: EducationEntry[],
  id: string,
): EducationEntry | undefined {
  return list.find((item) => item.id === id);
}