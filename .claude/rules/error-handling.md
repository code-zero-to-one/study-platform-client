# Error Handling

Error handling is centralized around `src/utils/error-handler.ts`. `src/utils/error.ts` is a deprecated backwards-compatibility wrapper for `extractErrorCode()`.

## Core Files

- `src/utils/error-handler.ts` — `analyzeError()`, `logError()`, `ErrorType`, `ErrorInfo`. Handles error code-to-message mapping (~40 codes), Korean fallback messages, and Sentry reporting.
- `src/config/query-client.ts` — `MutationCache` global error handler. Automatically shows error toast + Sentry report when a mutation with no `onError` fails.
- `src/app/(service)/error.tsx`, `(landing)/error.tsx`, `(admin)/error.tsx` — route segment error boundaries
- `src/app/global-error.tsx` — root error boundary (auto-captures to Sentry)
- `src/app/not-found.tsx` and each route group's `not-found.tsx`

## Error Classification

`analyzeError()` classifies errors in order:

1. **AxiosError** — passes `isAxiosError()`. Extracts HTTP status code + API error response.
2. **ApiError** — custom error transformed by axios interceptor. `isApiError()` type guard preserves `errorCode`, `statusCode`.
3. **Generic Error / unknown** — fallback handling.

```
AxiosError → isAxiosError() ✅ → extract HTTP status/error code
ApiError   → isApiError() ✅   → preserve errorCode/statusCode (interceptor-transformed)
Error      → instanceof Error  → UNKNOWN type
unknown    → String(error)     → default message
```

## Error Code-to-Message Mapping

Centrally managed in `codeMessages` object in `error-handler.ts`. Organized by error code prefix:

| Prefix | Domain | Examples |
|--------|--------|---------|
| AUTH | Authentication | AUTH001 (token expired), AUTH002 (unauthorized) |
| CMM | Common | CMM001 (invalid input), CMM006 (access denied) |
| MEM | Member | MEM002 (member not found), MEM003 (duplicate signup) |
| GSM/GSA | Study management/application | GSM001 (study not found), GSA003 (capacity exceeded) |
| HWK/EVL | Assignment/evaluation | HWK003 (submission period expired), EVL002 (duplicate evaluation) |
| PAY 2xx | Payment | PAY202 (duplicate approval), PAY207 (amount mismatch) |
| PAY 3xx | Refund | PAY302 (duplicate refund), PAY307 (non-refundable) |
| FILE | File | FILE001 (upload failed), FILE002 (unsupported format) |

For unmapped codes, if the backend `message` is Korean (matched by `/[가-힣]/` regex), it is used as-is. Error codes are never exposed directly to the user.

## Mutation Error Global Handler

`MutationCache.onError` in `query-client.ts` acts as a safety net:

- Automatically shows error toast + Sentry report when a mutation without `onError` fails.
- Skips global handler if individual `onError` is present (prevents double-handling).
- Not applied to query errors (prevents toast flooding on simultaneous failures).

## 401 Unauthenticated — Login Modal Pattern

When a 401 response occurs, **show the login modal in-place** instead of redirecting or showing a toast. This preserves page context so the user can log back in and continue the action.

### Two interception points

**1. Session expiry (AUTH001 flow) — `src/api/client/auth-session-recovery.ts`**

`requestDocumentAuthRecovery()` is called when the access token refresh fails. Instead of `window.location.replace()`, open the login modal:

```typescript
// ❌ Current (loses page context)
window.location.replace(nextUrl);

// ✅ Target
useLoginModalStore.getState().open();
```

The `hasPendingDocumentAuthRecovery` flag still prevents duplicate modal opens from concurrent failing requests. Reset it when the modal closes.

**2. Guest actions (unauthenticated mutation) — `src/config/query-client.ts`**

In `MutationCache.onError`, check `statusCode === 401` before the generic toast path:

```typescript
const errorInfo = analyzeError(error);

if (errorInfo.statusCode === 401) {
  useLoginModalStore.getState().open();
  return; // no Sentry — expected flow, same as AUTH001
}

useToastStore.getState().showToast(errorInfo.userMessage, 'error');
sendErrorToSentry(errorInfo, { source: 'MutationCache.onError' });
```

### Login modal infrastructure

- **Store**: `src/stores/use-login-modal-store.ts` — Zustand store with `isOpen`, `open()`, `close()`, callable outside React via `.getState()`
- **Global mount**: `<GlobalLoginModal />` in `(service)/layout.tsx` inside `<MainProvider>`, alongside `<GlobalToast />`
- **Component**: `src/components/auth/modals/login-modal.tsx` accepts optional `open?: boolean` + `onOpenChange?` for controlled mode (existing `openTrigger` usages unchanged)

### 401 vs 403 vs 400 (backend-verified)

Backend `SecurityErrorCode` definitions (cross-validated against `study-platform-mvp`):

| Error Code | HTTP Status | Cause | Frontend Response |
|-----------|------------|-------|------------------|
| AUTH001 | 401 | Missing / expired / invalid access token | Login modal |
| AUTH002 | 403 | Authenticated but insufficient role | Toast |
| AUTH003 | 401 | Unsupported OAuth code (OAuth flow only) | Login modal |
| AUTH004 | **400** | Refresh token invalid/expired | **Not a 401** — handled only by `auth-session-recovery.ts`, never reaches `query-client.ts` |

- Never show the login modal for 403 — the user is already logged in, just lacks permission.
- AUTH004 returns 400 so it bypasses the `statusCode === 401` gate in `query-client.ts`. The auth-session-recovery path already opens the modal for this case.
- When AUTH001 fires, both `auth-session-recovery.ts` and `MutationCache.onError` may open the modal — this is idempotent (no-op if already open).

## Client Error Handling Principles

- **Recoverable failure**: Preserve user flow. Prefer inline error first, use Toast as secondary. **Never use browser `alert()`** — use Toast (`useToastStore`).
- **Action required failure**: When the user must choose a next action, use Modal or in-app confirmation UI. No browser `alert()` — use existing design system.
- **Fatal failure** (page-level): When a specific page can no longer function, use the route segment's `error.tsx` or client error boundary.
- **Critical failure** (app-level): For hydration mismatches, auth context collapse, global provider errors — `global-error.tsx` catches and auto-reports to Sentry.

Toast usage pattern:

```typescript
// Inside a component (using React hook)
const showToast = useToastStore((state) => state.showToast);
showToast('환불 요청이 접수되었습니다.', 'success');

// Outside React (using getState)
useToastStore.getState().showToast(errorInfo.userMessage, 'error');
```

`<GlobalToast />` is mounted in all three layouts: `(service)`, `(landing)`, `(admin)`.

## Server Error Handling Principles

- In SSR/Server Components, if critical data loading fails and the page cannot be rendered, re-throw the exception to propagate to `error.tsx`.
- For resource-not-found cases, use `notFound()`.
- `queryFn` in `fetchQuery()` / `prefetchQuery()` must never return `undefined`. Use `notFound()` for 404, and `throw error` for everything else.

Example: `src/api/endpoints/group-study/get-group-study-detail.server.ts` calls `notFound()` for `GSM001`, and `throw error` for other errors.

```typescript
export default async function Page() {
  const data = await fetchData();
  return <PageView data={data} />;
}
```

Do not swallow errors with unnecessary `try/catch` that returns `undefined`.

## Production Security Principles

- Never expose `stack trace`, raw server messages, internal paths, or sensitive backend responses to the user in production.
- All 3 `error.tsx` files gate behind `process.env.NODE_ENV === 'development'`: `technicalMessage`, `error.message`, `error.stack` are only shown in development.
- Only expose generalized `userMessage`, and optionally `errorCode`, `statusCode`, `digest` to the user.
- `digest` is a trace identifier for finding the cause in server logs or Sentry.
- API routes should also avoid including detailed `details` in production responses.

## Success Page Principles

- Major success events (study creation, study join, payment complete) should have a dedicated success page or completion screen that clearly guides the user's next action.
- Branding elements should center on welcome copy, team message, and follow-up CTA. Even with high information density, the primary CTA should be visible first.

## Monitoring (Sentry)

`@sentry/nextjs` is integrated. Errors are auto-reported via `logError()` → `Sentry.captureException()`.

- **SDK config files**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (project root)
- **Next.js instrumentation**: `src/instrumentation.ts` — server/edge runtime init + `onRequestError` auto-capture
- **next.config.ts**: wrapped with `withSentryConfig()` — source map upload, tree-shaking
- **Env vars**: `NEXT_PUBLIC_SENTRY_DSN` (runtime), `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` (CI source map upload)
- **Environment detection**: auto-classifies `production` / `staging` / `development` based on `NEXT_PUBLIC_API_BASE_URL`
- **Filtering**: AUTH001 (token expired) is a normal flow — excluded from Sentry reporting via `beforeSend`
- **Performance**: `tracesSampleRate: 0.1` (10%), Session Replay only on errors (`replaysOnErrorSampleRate: 1.0`)
- Without DSN, Sentry does not initialize, so local development works without env vars.
- In production, Slack instant alerts can be integrated, but define thresholds and error scope first to reduce noise.
