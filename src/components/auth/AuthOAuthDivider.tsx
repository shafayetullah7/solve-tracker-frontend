export function AuthOAuthDivider() {
  return (
    <div class="relative my-6" role="separator" aria-label="or">
      <div class="absolute inset-0 flex items-center" aria-hidden="true">
        <div class="w-full border-t border-border" />
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="bg-surface px-3 text-muted">or</span>
      </div>
    </div>
  );
}