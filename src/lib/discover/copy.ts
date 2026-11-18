export const DISCOVER_FORBIDDEN_WORDS = [
  "rank",
  "top",
  "beat",
  "better",
  "worse",
  "leaderboard",
  "#1",
  "winner",
  "loser",
] as const;

const COPY = {
  "nav.discover": "Discover",
  "nav.forYou": "For you",
  "nav.people": "People",
  "nav.topics": "Topics",
  "discover.pageTitle": "Discover",
  "discover.pageSubtitle":
    "Find people who practice like you and learn from how they train.",
  "discover.seeAll": "See all",
  "visibility.panelTitle": "Practice visibility",
  "visibility.panelIntro":
    "Choose what other signed-in users can see about your practice.",
  "visibility.optionPrivateTitle": "Only me",
  "visibility.optionPrivateHint": "Nobody can find or view your practice.",
  "visibility.optionSummaryTitle": "Practice summary",
  "visibility.optionSummaryHint":
    "Counts, streak, weekly activity, and platform mix.",
  "visibility.optionTopicsTitle": "Summary + topics",
  "visibility.optionTopicsHint":
    "Also your topic names and progress. Share problem lists per topic on Topics.",
  "visibility.neverShared":
    "Never shared: email, notes, exact solve times, private topics, and who viewed you.",
  "visibility.viewAsOthers": "View as others",
  "visibility.copyLink": "Copy link",
  "visibility.viewAsOthersDisabledPrivate": "Turn on sharing to preview.",
  "visibility.previewLaunchHint": "Available when Discover launches",
  "visibility.systemHandleHint":
    "People will see you as @{{handle}}. Choose a handle in your profile.",
  "visibility.shareStats":
    "This month: profile viewed {{views}}× · your lists copied {{copies}}×",
  "visibility.goalLabel": "Practicing for (optional)",
  "visibility.goalNotSet": "Not set",
  "visibility.save": "Save",
  "visibility.followersCount": "{{count}} people follow your practice",
  "visibility.confirmPrivateWithFollowers":
    "Going private hides your practice from Discover. People who follow you will no longer see updates in their Following list.",
  "visibility.publicWebTitle": "Public web page",
  "visibility.publicWebHint":
    "Anyone with the link can view a read-only summary on /u/your-handle (not indexed in search).",
  "public.signUpToCompare": "Sign up to compare",
  "public.unavailableTitle": "This practice profile isn’t available",
  "public.block": "Block",
  "public.unblock": "Unblock",
  "public.report": "Report",
  "public.reportPlaceholder": "What’s wrong with this profile?",
  "public.reportSubmit": "Send report",
  "topics.sharePublic": "Public",
  "topics.sharePrivate": "Private",
  "topics.shareMenuHint":
    "Public topics show their problem list on your practice profile. Notes stay private.",
  "topics.sharingOffBanner":
    "Topic sharing is off. Change in Profile → Practice visibility.",
  "topics.shareTopicsCta": "Share topics",
  "topics.descriptionLabel": "Description (optional)",
  "topics.descriptionCounter": "{{count}} / 280",
  "topics.communityHint":
    "{{practicers}} people practice {{topicName}} · {{listCount}} public lists",
  "topics.communityHintExplore": "Explore",
  "topics.shareStatsRow": "Viewed {{views}}× · copied {{copies}}× this month",
  "topics.createdHint":
    "{{practicers}} people practice {{topicName}} · {{listCount}} public lists → Explore",
  "rail.peers": "People like you",
  "rail.ahead": "A step ahead",
  "rail.sameGoal": "Same goal",
  "rail.consistent": "Consistent practicers",
  "rail.activeWeek": "Active this week",
  "rail.starterLists": "Starter lists by @starter",
  "rail.similar": "Similar practicers",
  "card.view": "View",
  "card.compare": "Compare",
  "card.starterBadge": "Starter",
  "empty.noSearchMatch": "No practice profile with that handle.",
  "empty.noDiscoverableUsers":
    "No one is sharing practice yet. Be the first — share yours from Profile.",
  "unavailable.profileTitle": "This practice profile isn’t available",
  "unavailable.profileBody": "It may be private or the handle may not exist.",
  "profile.practicingSince": "Practicing since {{monthYear}}",
  "profile.compareWithMe": "Compare with me",
  "profile.follow": "Follow",
  "profile.following": "Following",
  "profile.unfollow": "Unfollow",
  "profile.viewAsBanner": "This is how others see you.",
  "profile.editVisibility": "Edit visibility",
  "profile.publicLists": "Public lists",
  "list.copyTopic": "Copy topic to my library",
  "list.moreLists": "More {{topicName}} lists",
  "list.ownerCompletion": "{{solved}} / {{total}} solved by owner",
  "list.copiedCount": "Copied {{copies}}× this month",
  "row.open": "Open",
  "row.add": "Add",
  "row.added": "Added",
  "row.inLibrary": "In library",
  "row.youColumn": "You",
  "row.ownerColumn": "Owner",
  "activity.showTable": "Show as table",
  "activity.tableCaption": "Weekly activity table",
  "list.emptyProblems": "No problems match these filters.",
  "toast.linkCopied": "Link copied",
  "search.placeholder": "Search by @handle or name",
  "discover.optInBanner":
    "You're browsing privately. Share your practice so people like you can find you.",
  "discover.optInCta": "Share",
  "discover.exploreTopics": "Explore your topics",
  "discover.starterSection": "Starter lists by @starter",
  "onboarding.title": "Discover how others practice",
  "onboarding.step1":
    "See people with similar topics and find great lists. Your library stays private unless you share it.",
  "onboarding.step2Goal": "What are you practicing for? (optional)",
  "onboarding.step3Share": "Share your practice?",
  "onboarding.skip": "Skip",
  "onboarding.start": "Start exploring",
  "people.filters.goal": "Goal",
  "people.filters.platform": "Platform",
  "people.filters.topic": "Topic",
  "people.filters.activeWeek": "Active this week",
  "people.filters.following": "Following",
  "rail.following": "Following",
  "compare.title": "You vs @{{handle}}",
  "compare.vsPeers": "vs people like you",
  "compare.vsPerson": "vs @{{handle}}",
  "compare.window": "Last {{weeks}} weeks",
  "compare.summaryOnlyTopics":
    "@{{handle}} shares only a summary. Topic comparison isn't available.",
  "compare.summaryTable": "Summary",
  "compare.platformMix": "Platform mix",
  "compare.topicFocus": "Topic focus",
  "compare.insights": "Insights",
  "dashboard.benchmarkTitle": "How you compare",
  "dashboard.benchmarkPeers": "people like you",
  "dashboard.benchmarkActiveWeeks": "Active weeks",
  "dashboard.benchmarkSolvesPerWeek": "Solved / week",
  "dashboard.benchmarkTopTopicShare": "Largest topic share",
  "dashboard.benchmarkCompare": "Compare",
  "dashboard.starterNudge": "Explore starter lists while more people share their practice.",
  "toast.copyTopicSuccess":
    "Added {{added}} · {{linked}} already in your library · into your topic {{topicName}}",
  "toast.copyTopicOpen": "Open topic",
  "toast.problemAdded": "Problem added",
  "ideas.panelTitle": "Ideas from the community ({{count}})",
  "community.panelTitle": "In the community",
  "launch.banner":
    "New: Discover how others practice — your library stays private unless you share it.",
  "launch.bannerCta": "Open Discover",
} as const;

export type DiscoverCopyKey = keyof typeof COPY;

export function discoverCopy(
  key: DiscoverCopyKey,
  params?: Record<string, string | number>,
): string {
  let text: string = COPY[key];
  if (!params) return text;
  for (const [name, value] of Object.entries(params)) {
    text = text.replaceAll(`{{${name}}}`, String(value));
  }
  return text;
}

export function allDiscoverCopyStrings(): string[] {
  return Object.values(COPY);
}