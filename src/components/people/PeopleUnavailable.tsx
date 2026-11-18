import { discoverCopy } from "../../lib/discover/copy";

export function PeopleUnavailable() {
  return (
    <div class="mx-auto max-w-lg py-16 text-center">
      <h1 class="text-page font-semibold">{discoverCopy("unavailable.profileTitle")}</h1>
      <p class="mt-3 text-muted">{discoverCopy("unavailable.profileBody")}</p>
    </div>
  );
}