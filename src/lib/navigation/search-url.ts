/** Build pathname + query after removing ephemeral keys (e.g. one-shot deep links). */
export function pathWithoutSearchKeys(
  pathname: string,
  search: string,
  keys: readonly string[],
): string {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  for (const key of keys) params.delete(key);
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}