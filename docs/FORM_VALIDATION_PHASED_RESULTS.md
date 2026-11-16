# Form validation phased results

Plan: [FORM_VALIDATION_PHASED_PLAN.md](FORM_VALIDATION_PHASED_PLAN.md).

## FORM-1 — API error mapping (2026-11-16)

**Delivered:** `src/lib/forms/` — `mapApiFieldErrors`, `enrichFieldErrorsFromError`, `fieldErrorsFromApiError`, `resolveFormBanner`; `mapAuthFieldErrors` deprecated alias; `problemFieldErrors` / `topicFieldErrors` use `mapApiFieldErrors`.

**Verification:**

```bash
cd cp-frontend && pnpm exec tsc --noEmit && pnpm test --run src/lib/forms src/lib/auth/forms.test.ts src/lib/problems/messages.test.ts src/lib/topics/messages.test.ts
```

**Note:** Routes still call `mapAuthFieldErrors` directly; pipe-shaped auth validation now maps to field keys via the alias. `resolveFormBanner` is tested but not wired until FORM-3.

## FORM-2 — Presentation primitives (2026-11-16)

**Delivered:** `FormField`, `FormAlert`, `formFieldControlAttrs`, `formatRetryAfterHint`, `auth-field-copy`; register + reset hint wiring; FRONTEND_CONVENTIONS §8.1 updated.

**Verification:**

```bash
cd cp-frontend && pnpm exec tsc --noEmit && pnpm test --run \
  src/lib/forms/form-field-control-attrs.test.ts \
  src/lib/forms/format-retry-after.test.ts \
  src/components/ui/FormField.test.tsx \
  src/components/ui/FormAlert.test.tsx
```

## FORM-3 — Auth routes (2026-11-16)

**Delivered:** `validate-auth.ts`, `apply-auth-api-error.ts`, `unicode.ts`; login/register/forgot/reset refactored to `FormField` / `FormAlert`, `novalidate`, client preflight; register no longer clears password on API validation failure.

**Verification:**

```bash
cd cp-frontend && pnpm exec tsc --noEmit && pnpm test --run src/lib/forms
# optional: pnpm test:e2e e2e/auth-flow.spec.ts e2e/auth-a11y-smoke.spec.ts
```

**Manual checklist**

- [ ] Register with &lt;15 char password → `password` field error without API call.
- [ ] Register duplicate email → `email` field message from `EMAIL_IN_USE`.
- [ ] Login wrong password → banner only (`Invalid email or password.`).
- [ ] Forgot invalid email → visible field error under email.
- [ ] Reset confirm mismatch → `confirm` field error.

## FORM-4 — Product forms (problems & topics) (2026-11-16)

**Delivered:** `validate-problem.ts`, `validate-topic.ts`, `form-client-banner.ts`, `apply-product-api-error.ts`, `focus-first-invalid.ts`; enrichment for `PROBLEM_URL_IN_USE` / `TOPIC_NAME_IN_USE`; `ProblemFormFields` on `FormField` / `FormAlert`; problem new/edit and topic create/rename use client preflight + unified API pipeline.

**Verification:**

```bash
cd cp-frontend && pnpm exec tsc --noEmit && pnpm test --run src/lib/forms
```

**Manual checklist**

- [ ] Create problem with empty URL → `url` field error, no API call.
- [ ] Invalid scheme (`ftp://…`) → client or server `url` message, no duplicate generic banner.
- [ ] Duplicate URL → `url` field + banner + link to existing problem.
- [ ] Topic create/rename duplicate name → `name` field + banner.

## FORM-5 — Ergonomics & polish (2026-11-16)

**Delivered:** [`create-form-state.ts`](../src/lib/forms/create-form-state.ts), [`clear-field-error.ts`](../src/lib/forms/clear-field-error.ts), [`PasswordCodePointMeter`](../src/components/ui/PasswordCodePointMeter.tsx); all six form routes migrated; auth `focusFirstInvalid`; product title/url/topic name clear-on-input. **Rate-limit UX (§5.3)** was already in place via API client + `FormAlert`.

**Verification:**

```bash
cd cp-frontend && pnpm exec tsc --noEmit && pnpm test --run src/lib/forms src/components/ui/PasswordCodePointMeter.test.tsx
```

**Manual checklist**

- [ ] Register password: meter appears after blur or failed submit, not on first keystroke.
- [ ] Fix a field error by typing → inline error clears for that field.
- [ ] Rate-limited auth call shows “Try again in about N minutes.” under `FormAlert`.