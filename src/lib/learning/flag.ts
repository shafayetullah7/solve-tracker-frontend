export function isLearningGuidesEnabled(): boolean {
  return import.meta.env.VITE_LEARNING_GUIDES_ENABLED === "true";
}