export const LANDING_PAGE_TITLE = "Practice — Learn, track, and solve";

/** Document head + structured data for guest `/` (see {@link LandingSeo}). */
export const LANDING_SEO = {
  title: LANDING_PAGE_TITLE,
  description:
    "Private study guides with steps and assessments, plus a coding problem library across LeetCode, Codeforces, and more. Organize topics, mark solves yourself, and track guide progress separately from solve streaks.",
  siteName: "Practice",
  /** Public asset for Open Graph / Twitter (see `public/og-image.jpg`). */
  ogImagePath: "/og-image.jpg",
  ogImageWidth: 1280,
  ogImageHeight: 720,
  ogImageAlt:
    "Practice — study guides and coding problem tracking across competitive programming platforms",
  jsonLd: {
    name: "Practice",
    applicationCategory: "EducationalApplication",
  },
} as const;

export const LANDING_HERO = {
  title: "Learn deeply. Practice deliberately. Track your progress.",
  subtitle:
    "Build private study guides with linked problems and assessments, or save judge URLs in your own topic library. You mark coding problems solved — no automatic judging.",
  registerLabel: "Create account",
  signInLabel: "Sign in",
} as const;

export const LANDING_HOW_IT_WORKS = {
  title: "How it works",
  subtitle: "Guides and coding practice work together, not as one score.",
  steps: [
    {
      title: "Save",
      body: "Add problem URLs from any HTTPS judge, or create a guide and break it into study steps.",
    },
    {
      title: "Organize",
      body: "Tag problems with your topics, or structure a guide tree with required and optional steps.",
    },
    {
      title: "Practice",
      body: "Study content in-app and open linked problems on the platform where they live.",
    },
    {
      title: "Track",
      body: "Guide completion counts required steps; your library tracks solves and streaks separately.",
    },
  ],
} as const;

export const LANDING_FEATURES = {
  title: "Built for daily learning and practice",
  items: [
    {
      title: "Guides",
      description:
        "Create or import study paths, resume where you left off, and archive guides you are done with.",
    },
    {
      title: "Library",
      description:
        "Filter by status, platform, and topic. Search titles and notes in a dense list built for repeated use.",
    },
    {
      title: "Topics",
      description:
        "Create, rename, and remove topic labels. See solved counts and what is left under each topic.",
    },
    {
      title: "Overview",
      description:
        "Continue learning and your practice queue on one dashboard, with separate coding activity charts.",
    },
  ],
} as const;

export const LANDING_PLATFORMS = {
  sectionAriaLabel: "Supported coding judges",
  gridLoadError: "We couldn't load the full list right now.",
} as const;

export const LANDING_PRIVACY = {
  title: "Private workspace",
  bullets: [
    "Your guides, library, and topics are visible only to your account.",
    "You choose when to mark a coding problem solved — no automatic judging.",
    "Guide step progress does not inflate solve streaks or weekly solve charts.",
    "Sign-in uses a secure session on the same origin; credentials stay off the page.",
    "Optional Google sign-in uses Google as an identity provider for name and email only; Google tokens are not stored in your browser.",
  ],
} as const;

export const LANDING_CTA = {
  title: "Start your workspace",
  description:
    "Create a free account, then add a study guide or save your first coding problem.",
  registerLabel: "Create account",
  signInLabel: "Sign in",
} as const;

export const LANDING_PREVIEW_ARIA = "Example library preview";