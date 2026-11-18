import type { ProfileViewModel } from "./profile-view.types";

/** Static design preview — not loaded from the API. */
export const SAMPLE_PROFILE: ProfileViewModel = {
  displayName: "Alex Rivera",
  handle: "alex_rivera",
  avatarUrl: "/profile-mockup-avatar.svg",
  avatarInitials: "AR",
  bio: "Preparing for technical interviews while keeping a steady LeetCode and Codeforces rhythm. I use Practice to queue weak topics, log solves, and avoid losing good problems in browser tabs.",
  work: [
    {
      id: "work-1",
      organization: "State University",
      role: "Teaching assistant · Algorithms",
      period: "2025 – present",
    },
    {
      id: "work-2",
      organization: "Campus ICPC team",
      role: "Contestant",
      period: "2023 – 2025",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "State University",
      program: "BSc Computer Science",
      endYear: "2026",
    },
    {
      id: "edu-2",
      institution: "Nightly Algorithms Lab",
      program: "Advanced data structures certificate",
      endYear: "2024",
    },
  ],
};