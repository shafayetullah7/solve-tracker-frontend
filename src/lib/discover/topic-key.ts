const TOPIC_KEY_MAX = 100;

export function encodeTopicKey(normalizedName: string): string {
  return encodeURIComponent(normalizedName.trim());
}

export function decodeTopicKey(rawKey: string): string | undefined {
  try {
    const decoded = decodeURIComponent(rawKey.trim());
    if (!decoded || [...decoded].length > TOPIC_KEY_MAX) return undefined;
    return decoded.toLocaleLowerCase("en-US");
  } catch {
    return undefined;
  }
}

export function discoverTopicHubPath(topicKey: string): string {
  return `/app/discover/topics/${topicKey}`;
}

export function discoverTopicsDirectoryPath(): string {
  return "/app/discover/topics";
}