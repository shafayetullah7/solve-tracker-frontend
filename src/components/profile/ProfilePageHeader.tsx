export function ProfilePageHeader() {
  return (
    <header class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="space-y-2">
        <h1 class="text-page font-semibold tracking-tight">Profile</h1>
        <p class="max-w-xl text-label text-muted">Your identity and account settings.</p>
      </div>
      <p
        class="inline-flex shrink-0 items-center gap-2 text-label text-muted"
        role="status"
      >
        <span class="size-2 rounded-full bg-brand" aria-hidden="true" />
        Design preview
      </p>
    </header>
  );
}