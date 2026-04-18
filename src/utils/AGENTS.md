<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# utils/

## Purpose

Centralized utility module providing cross-cutting concerns: error handling, data formatting, validation, markdown processing, SSR/server utilities, and miscellaneous helpers. This is the **single source of truth** for error classification, Korean message mapping, and Sentry integration.

---

## Key Files

| File | Purpose | Critical? |
|------|---------|-----------|
| `error-handler.ts` | **CRITICAL**: Central error classification (`analyzeError()`, `logError()`), ~40 error codes, Korean fallback messages, Sentry reporting. Handles AxiosError → `isAxiosError()`, ApiError → `isApiError()`, generic Error. | ✅ YES |
| `error.ts` | DEPRECATED: backwards-compatibility wrapper. Do NOT use for new code — use `error-handler.ts` instead. | ❌ NO |
| `format.ts` | Number/date formatting utilities (commas, Korean currency, etc.) | — |
| `time.ts` | Time formatting with dayjs (elapsed time, date ranges, etc.) | — |
| `validation.ts` | Shared validation predicates (email, phone, password strength, etc.) | — |
| `seo.ts` | SEO metadata generation for Open Graph, structured data | — |
| `jwt.ts` | JWT token parsing (extract claims without verification) | — |
| `hash.ts` | hashids encoding/decoding for obfuscating IDs | — |
| `markdown-content.ts` | Markdown processing orchestrator | — |
| `markdown-content-images.ts` | Extract image URLs from markdown | — |
| `markdown-content-text.ts` | Extract plain text from markdown | — |
| `markdown-content-normalize.ts` | Normalize/sanitize markdown | — |
| `markdown-content-shared.ts` | Shared markdown helpers | — |
| `safe-server-prefetch.ts` | Safe SSR data fetching wrapper (error boundaries) | — |
| `ssr.ts` | SSR-only helpers (hydration, environment checks) | — |
| `server-cookie.ts` | Server-side cookie access (for RSC/API routes) | — |
| `url-to-file.ts` | Convert URL to File object (upload flows) | — |
| `study-history-utils.ts` | Study history calculations (duration, streaks, etc.) | — |
| `attribution-tracker.ts` | Marketing attribution tracking integration | — |
| `voting-id.ts` | Voting ID encoding (for surveys/polls) | — |

---

## For AI Agents

### Working In This Directory

#### Error Handling is Centralized—Do Not Create Parallel Systems

**There is exactly ONE error handler:** `error-handler.ts`.

- Never create alternative error utilities (`errors.ts`, `exception-handler.ts`, `custom-error.ts`).
- Never duplicate the ~40 error code-to-message mappings elsewhere.
- All error flows → `analyzeError()` → returns `ErrorInfo` with `type`, `userMessage`, `technicalMessage`, `errorCode`, `statusCode`, `digest`.
- If a new error code needs to be mapped, add it to the `codeMessages` object in `error-handler.ts`.

**In components/queries/mutations:**
```typescript
// Inside React component
const showToast = useToastStore((state) => state.showToast);
showToast(errorInfo.userMessage, 'error');

// Outside React (Zustand getState)
useToastStore.getState().showToast(errorInfo.userMessage, 'error');
```

**In API routes (server-side error handling):**
- If critical data fails → re-throw to propagate to `error.tsx`.
- For resource-not-found → use `notFound()`.
- For recoverable errors → return appropriate HTTP status.
- Never expose `stack`, raw messages, or sensitive details in production (`NODE_ENV !== 'development'`).

#### Error Classification Order (From `analyzeError()`)

1. **AxiosError** (`isAxiosError()` guard) → extract HTTP status + error response body
2. **ApiError** (`isApiError()` guard, custom type from `src/api/client/api-error.ts`) → preserve `errorCode`, `statusCode` set by interceptor
3. **Generic Error / unknown** → fallback classification

#### Error Code Prefixes (Organized by Domain)

| Prefix | Domain | Examples |
|--------|--------|----------|
| AUTH | Authentication | AUTH001 (token expired), AUTH002 (unauthorized), AUTH003 (OAuth), AUTH004 (refresh invalid) |
| CMM | Common | CMM001 (invalid input), CMM006 (access denied) |
| MEM | Member | MEM002 (not found), MEM003 (duplicate signup) |
| GSM / GSA | Study management / application | GSM001 (study not found), GSA003 (capacity exceeded) |
| HWK / EVL | Assignment / evaluation | HWK003 (submission expired), EVL002 (duplicate eval) |
| PAY 2xx | Payment | PAY202 (duplicate approval), PAY207 (amount mismatch) |
| PAY 3xx | Refund | PAY302 (duplicate refund), PAY307 (non-refundable) |
| FILE | File operations | FILE001 (upload failed), FILE002 (unsupported format) |

For unmapped codes, if the backend `message` is Korean (regex `/[가-힣]/`), it is used as-is. **Error codes are never exposed directly to users.**

#### 401 Unauthenticated—Login Modal Pattern

When a 401 response occurs, show the login modal **in-place** instead of redirecting. This preserves page context.

**Two interception points:**

1. **Session expiry (AUTH001)** — `src/api/client/auth-session-recovery.ts`
   - When access token refresh fails, call `useLoginModalStore.getState().open()` instead of `window.location.replace()`.
   - Flag: `hasPendingDocumentAuthRecovery` prevents duplicate opens from concurrent requests. Reset when modal closes.

2. **Guest actions (unauthenticated mutation)** — `src/config/query-client.ts` MutationCache.onError
   - Check `statusCode === 401` before generic toast:
   ```typescript
   const errorInfo = analyzeError(error);
   if (errorInfo.statusCode === 401) {
     useLoginModalStore.getState().open();
     return; // no Sentry — expected flow
   }
   // ... show toast + report to Sentry
   ```

**Login modal infrastructure:**
- Store: `src/stores/use-login-modal-store.ts` (Zustand, callable via `.getState()` outside React)
- Global mount: `<GlobalLoginModal />` in `(service)/layout.tsx`
- Component: `src/components/auth/modals/login-modal.tsx`

**401 vs 403 vs 400 (backend-verified):**

| Error Code | HTTP Status | Cause | Frontend Response |
|-----------|------------|-------|------------------|
| AUTH001 | 401 | Missing / expired / invalid access token | Login modal |
| AUTH002 | 403 | Authenticated but insufficient role | Toast |
| AUTH003 | 401 | Unsupported OAuth code | Login modal |
| AUTH004 | **400** | Refresh token invalid/expired | Handled only by auth-session-recovery.ts |

- **Never show login modal for 403**—the user is authenticated, just lacks permission.
- AUTH004 returns 400, so it bypasses the `statusCode === 401` gate and is only handled by auth-session-recovery.

---

### Common Patterns

#### 1. Error Handling in Components

**Mutation with error callback:**
```typescript
const { mutate } = useSomeAction();

mutate(payload, {
  onSuccess: () => {
    showToast('성공했습니다.', 'success');
    router.push('/next-page'); // only on success
  },
  onError: (error) => {
    const errorInfo = analyzeError(error);
    showToast(errorInfo.userMessage, 'error');
  },
  onSettled: () => {
    setIsLoading(false); // always clean up UI
  },
});
```

**Query with error boundary:**
```typescript
const { data, isLoading, error } = useGetData();

if (error) {
  const errorInfo = analyzeError(error);
  return <ErrorFallback message={errorInfo.userMessage} />;
}
```

#### 2. Optional Fields in React Keys & Event Handlers

**Safe key pattern (optional ID fields):**
```typescript
// ❌ Wrong — if missionId is undefined, all items get key="undefined"
{items.map((item) => <div key={item.missionId}>...</div>)}

// ✅ Correct
{items.map((item, index) => <div key={item.missionId ?? index}>...</div>)}
```

**Safe handler pattern (optional fields in navigation):**
```typescript
// ❌ Wrong — routes to ?missionId=undefined if field missing
const handleClick = (id: number) => router.push(`...?missionId=${id}`);

// ✅ Correct — guard with Toast fallback
const handleClick = (id: number | undefined) => {
  if (!id) {
    showToast('정보를 불러올 수 없습니다.', 'error');
    return;
  }
  router.push(`...?missionId=${id}`);
};
```

#### 3. Safe Guards for Enum-like String Type Assertions

Backend may send values not in frontend type definition. Use `in` guard + fallback instead of bare `as` assertion.

```typescript
// ❌ Wrong — undefined rendering or runtime error on unknown value
const studyType = type as StudyType;
<Badge>{STUDY_TYPE_LABELS[studyType]}</Badge>

// ✅ Correct — in guard with fallback
const studyType =
  type && type in STUDY_TYPE_LABELS ? (type as StudyType) : undefined;
<Badge>{studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}</Badge>

// When iterating lists
{experienceLevels?.map((level) => (
  <Badge key={level}>
    {level in EXPERIENCE_LEVEL_LABELS
      ? EXPERIENCE_LEVEL_LABELS[level as ExperienceLevel]
      : level}
  </Badge>
))}
```

#### 4. SSR Data Fetching

**For Server Components (RSC):**
- Use `fetchQuery()` / `prefetchQuery()` from TanStack Query in server context.
- If critical data fails → re-throw to propagate to `error.tsx`.
- For 404 → use `notFound()`.
- For other errors → `throw error`.
- **queryFn must never return `undefined`** — it must either return data or throw/notFound.

```typescript
// ❌ Wrong — swallows errors, returns undefined
async function getData() {
  try {
    return await fetchData();
  } catch {
    return undefined; // ← loses error context
  }
}

// ✅ Correct — propagates to error.tsx
async function getData() {
  return await fetchData(); // throws on error
}
```

**Use `safe-server-prefetch.ts` for additional boundaries if needed.**

#### 5. Markdown Processing

Use the `markdown-content-*` family for all markdown transformations:
- `markdown-content.ts` — main orchestrator
- `markdown-content-text.ts` — extract plain text (for previews, word counts)
- `markdown-content-images.ts` — extract image URLs (for OG image selection)
- `markdown-content-normalize.ts` — sanitize/normalize HTML output
- `markdown-content-shared.ts` — common helpers (DOM parsing, etc.)

Example:
```typescript
import { extractMarkdownText } from '@/utils/markdown-content-text';
import { extractMarkdownImages } from '@/utils/markdown-content-images';

const preview = extractMarkdownText(content, { maxLength: 200 });
const ogImage = extractMarkdownImages(content)[0];
```

#### 6. Server-Side Utilities

**JWT parsing (extract claims):**
```typescript
import { parseJwt } from '@/utils/jwt';

const token = req.cookies.get('accessToken')?.value;
const claims = parseJwt(token);
```

**Server-side cookie access (RSC/API routes):**
```typescript
import { getServerCookie } from '@/utils/server-cookie';

const token = getServerCookie('accessToken');
```

**SSR checks:**
```typescript
import { isServerSide } from '@/utils/ssr';

if (isServerSide()) {
  // fetch data server-side
}
```

#### 7. Sentry Integration

Errors are auto-reported via `logError()` → `Sentry.captureException()`. Config files:
- `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (project root)
- `src/instrumentation.ts` — runtime init
- `next.config.ts` — wrapped with `withSentryConfig()`

**AUTH001 (token expired) is filtered** — not reported (normal flow). All other unhandled errors auto-report.

---

## Common Gotchas

1. **Never use `error.ts`** — it's deprecated. Always use `error-handler.ts`.
2. **Empty array safety** — parent guards with `if (!arr?.length)` already handle this. No extra defensive code needed before `Math.max()`.
3. **Error codes are never exposed to users** — only `userMessage`. Error codes are for debugging/logging.
4. **Production security** — never expose `stack`, raw server messages, or internal paths in production. Use `process.env.NODE_ENV === 'development'` gates.
5. **Toast, not alert()** — never use browser `alert()`. Always use `useToastStore().showToast()` or `useToastStore.getState().showToast()`.

---

<!-- MANUAL: -->
