export const LANDING_PAGE_TITLE = "Practice — Coding problem tracker";

/** Document head + structured data for guest `/` (see {@link LandingSeo}). */
export const LANDING_SEO = {
  title: LANDING_PAGE_TITLE,
  description:
    "Save coding problem links from LeetCode, Codeforces, and more. Organize with your own topics, track solved progress, and filter your private practice library.",
  siteName: "Practice",
  /** Public asset for Open Graph / Twitter (see `public/og-image.jpg`). */
  ogImagePath: "/og-image.jpg",
  ogImageWidth: 1280,
  ogImageHeight: 720,
  ogImageAlt: "Practice — coding problem tracker across competitive programming platforms",
  jsonLd: {
    name: "Practice",
    applicationCategory: "EducationalApplication",
  },
} as const;

export const LANDING_HERO = {
  title: "Your practice library, across every platform.",
  subtitle:
    "Save problem links from LeetCode, Codeforces, CodeChef, and more. Tag them with your own topics, mark what you have solved, and browse your library with filters — all in one private workspace.",
  registerLabel: "Create account",
  signInLabel: "Sign in",
} as const;

export const LANDING_HOW_IT_WORKS = {
  title: "How it works",
  subtitle: "From spreadsheet to one library.",
  steps: [
    {
      title: "Save",
      body: "Add a title and the original problem URL from any HTTPS judge or practice site.",
    },
    {
      title: "Organize",
      body: "Label problems with topics you create — for example Monotonic Stack or Arrays.",
    },
    {
      title: "Practice",
      body: "Open the link and solve on the platform where the problem lives.",
    },
    {
      title: "Track",
      body: "Mark solved once; progress rolls up across your library and topic views.",
    },
  ],
} as const;

export const LANDING_FEATURES = {
  title: "Built for daily practice",
  items: [
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
      title: "Dashboard",
      description:
        "Overall progress, solve streak, activity charts, and shortcuts to unsolved or untagged problems.",
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
    "Your library and topics are visible only to your account.",
    "You choose when to mark a problem solved — no automatic judging.",
    "Sign-in uses a secure session on the same origin; credentials stay off the page.",
    "Optional Google sign-in uses Google as an identity provider for name and email only; Google tokens are not stored in your browser.",
  ],
} as const;

export const LANDING_CTA = {
  title: "Start your library",
  description: "Create a free account and add your first topic.",
  registerLabel: "Create account",
  signInLabel: "Sign in",
} as const;

export const LANDING_PREVIEW_ARIA = "Example library preview";