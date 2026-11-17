export type EducationEntry = {
  id: string;
  institution: string;
  program: string;
  endYear?: string;
};

export type WorkEntry = {
  id: string;
  organization: string;
  role: string;
  period?: string;
};

export type ProfileViewModel = {
  displayName: string;
  bio: string;
  avatarUrl?: string;
  avatarInitials: string;
  work: WorkEntry[];
  education: EducationEntry[];
};