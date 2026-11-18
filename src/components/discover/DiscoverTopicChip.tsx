import { discoverTopicHubPath, encodeTopicKey } from "../../lib/discover/topic-key";

export function DiscoverTopicChip(props: {
  name: string;
  normalizedName: string;
  listCount: number;
}) {
  return (
    <a
      class="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-3 text-label text-ink hover:border-brand"
      href={discoverTopicHubPath(encodeTopicKey(props.normalizedName))}
    >
      {props.name}
      {props.listCount > 0 ? ` · ${props.listCount} lists` : ""}
    </a>
  );
}