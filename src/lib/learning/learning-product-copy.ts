/** In-app product copy for learning + practice (Phase 6E). */

export const LEARNING_LIBRARY_PAGE_TITLE = "Study guides";

/** Sidebar nav label (paired with Problems for coding library). */
export const LEARNING_LIBRARY_NAV_LABEL = LEARNING_LIBRARY_PAGE_TITLE;

export const LIBRARY_PAGE_SUBTITLE =
  "Structured paths with steps, quizzes, and links to problems in your library.";

export const STUDY_LINKED_PROBLEMS_HINT =
  "Solve on the judge, then mark the problem solved in your library. Required-step progress does not use your weekly solve chart.";

export const WELCOME_BANNER_STORAGE_KEY = "learning.welcome.v1";

export const WELCOME_BANNER_TITLE = "Learn and practice in one workspace";

export const WELCOME_BANNER_BODY =
  "Build study guides or track coding problems — pick a starting point below. You can use both anytime; nothing is locked in.";

export const GUIDE_EXPORT_SCOPE_HINT =
  "Exports include authored structure only — not your notes, attempts, progress, or media bytes.";

/** Optional `VITE_BETA_FEEDBACK_URL` (https or mailto) for learning beta feedback. */
export function learningBetaFeedbackHref(): string | undefined {
  const raw = import.meta.env.VITE_BETA_FEEDBACK_URL;
  if (typeof raw !== "string") return undefined;
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith("mailto:") || trimmed.startsWith("https://")) return trimmed;
  return undefined;
}

export const LEARNING_BETA_FEEDBACK_LABEL = "Beta feedback";