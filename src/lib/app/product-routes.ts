export const APP_ROOT = "/app";

export function appHome(): string {
  return APP_ROOT;
}

export function appProfile(): string {
  return `${APP_ROOT}/profile`;
}

export function appTopics(): string {
  return `${APP_ROOT}/topics`;
}

export function appProblems(): string {
  return `${APP_ROOT}/problems`;
}