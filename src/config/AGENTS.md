<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# config/

## Purpose

Central configuration hub for application-wide settings: TanStack Query client (with global error handling via `MutationCache`), Sentry monitoring (environment detection, error filtering, performance sampling), UI constants (study types, statuses, tags, tutorial steps), and domain-specific enums (admin roles, participation states, hall-of-fame tiers).

The directory splits into three categories:

1. **Query & Error** — `query-client.ts` (TanStack Query setup with global mutation error handler and 401 login modal logic)
2. **Monitoring** — `sentry.ts`, `sentry-instrumentation*.ts` (unified Sentry config for all runtimes)
3. **Constants & UI** — remaining `.ts` and `.tsx` files (domain enums, labels, presets, mock data for UI rendering)

## Key Files

| File | Description |
|------|-------------|
| `query-client.ts` | TanStack Query client factory with `MutationCache` global error handler. **Critical**: Shows error toast + Sentry on unhandled mutation failures. Opens login modal (not toast) for `statusCode === 401`. Skips global handler if individual `onError` is present. |
| `sentry.ts` | Unified Sentry initialization (all runtimes). Auto-detects environment (production/staging/dev) from `NEXT_PUBLIC_API_BASE_URL`. Filters AUTH001 (token expired) from Sentry. Exports `initClientSentry()`, `initServerSentry()`, `initEdgeSentry()`. |
| `sentry-instrumentation.ts` | Server/edge runtime Sentry init hook (thin wrapper, delegates to `sentry.ts`). |
| `sentry-instrumentation-client.ts` | Client runtime Sentry init hook (thin wrapper, delegates to `sentry.ts`). |
| `constants.ts` | General app constants (page counts, URLs, feature flags). |
| `group-study-const.ts` | Study-related enums: `StudyType` (REGULAR, MENTOR_STUDY, CHALLENGE), `StudyStatus` (RECRUITING, IN_PROGRESS, COMPLETED, CLOSED), label maps. |
| `admin-member.ts` | Admin member role constants and status labels. |
| `archive-const.ts` | Archive domain constants and labels. |
| `balance-game-tags.ts` | Balance game tag categories and colors. |
| `hall-of-fame-constants.ts` | Hall of fame tier levels and styling. |
| `interview-const.ts` | Interview step definitions and UI config. |
| `my-page-const.ts` | My page section labels and navigation structure. |
| `participation-const.ts` | Participation mode constants and status labels. |
| `study-tutorial-steps.ts` | Tutorial step definitions (text, icons, actions). |
| `sincerity-temp-presets.tsx` | React component with preset sincerity rating options. |
| `tutorial-mock.ts` | Mock tutorial data for storybook and local dev. |

## For AI Agents

### Working In This Directory

1. **Query Client Changes**
   - `query-client.ts` is the single source of truth for TanStack Query defaults (staleTime: 60s, gcTime: 5min)
   - When modifying `MutationCache.onError`, verify the logic path:
     - If individual `onError` exists → skip global handler (line 20)
     - If `statusCode === 401` → open login modal (not shown in base file, handled by calling code)
     - Otherwise → show error toast + Sentry
   - Never remove the `isServer` check on line 22; server mutations should not show toast

2. **Sentry Configuration**
   - `sentry.ts` centralizes all Sentry logic; `sentry-instrumentation*.ts` are thin wrappers
   - Environment detection (line 23–29) depends on `NEXT_PUBLIC_API_BASE_URL`:
     - Contains `api.zeroone.it.kr` (not test) → production
     - Contains `test-api` → staging
     - Otherwise → development
   - `beforeSend` hook (line 53–76) filters AUTH001 and enhances Slack notifications with `[ErrorType]` prefix
   - Never disable `beforeSend` filtering for AUTH001 — it's a normal session recovery flow, not an error

3. **Constants & Enums**
   - Label maps must mirror backend enum values exactly (verified during code review)
   - Use `in` guard + fallback pattern when rendering unknown enum values from backend
   - Never use hardcoded strings for study types, statuses, or roles — import from this directory
   - When adding a new enum, immediately create a label map and add to appropriate constant file

4. **Import Convention**
   - Always import from `@/config/*` using path alias, never relative paths
   - Constants are meant to be lightweight — no heavy computations or async operations
   - Re-exports from this directory are allowed to group related types

### Common Patterns

#### 401 Login Modal (Error Handling)

When a mutation returns `statusCode === 401` (unauthenticated):

**❌ Wrong** — show toast like other errors:
```typescript
const errorInfo = analyzeError(error);
useToastStore.getState().showToast(errorInfo.userMessage, 'error');
```

**✅ Correct** — open login modal instead:
```typescript
const errorInfo = analyzeError(error);
if (errorInfo.statusCode === 401) {
  useLoginModalStore.getState().open();
  return; // no toast, no Sentry
}
useToastStore.getState().showToast(errorInfo.userMessage, 'error');
sendErrorToSentry(errorInfo, { source: 'MutationCache.onError' });
```

This preserves page context so user can log back in and retry the action.

#### Enum Labels with Fallback

When rendering enum-like strings from backend that may be unknown:

**❌ Wrong** — direct `as` assertion fails at runtime:
```typescript
const studyType = data.type as StudyType;
<span>{STUDY_TYPE_LABELS[studyType]}</span>
```

**✅ Correct** — `in` guard with fallback:
```typescript
const studyType = 
  data.type && data.type in STUDY_TYPE_LABELS 
    ? (data.type as StudyType) 
    : undefined;
<span>{studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}</span>
```

#### Global Mutation Error Handler

Query hooks with individual `onError` bypass the global handler:

```typescript
// Individual onError → global handler is skipped
useMutation({
  mutationFn: async (params) => { /* ... */ },
  onError: (error) => {
    showToast('Custom error message', 'error');
    // No double-toast from MutationCache.onError
  },
});

// No individual onError → global handler fires
useMutation({
  mutationFn: async (params) => { /* ... */ },
  // MutationCache.onError shows toast + Sentry automatically
});
```

### Environment Detection via NEXT_PUBLIC_API_BASE_URL

| `NEXT_PUBLIC_API_BASE_URL` | Detected Env | Sentry tracesSampleRate |
|---------------------------|-------------|------------------------|
| `https://api.zeroone.it.kr/...` | `production` | 0.1 (10%) |
| `https://test-api.zeroone.it.kr/...` | `staging` | 0.1 (10%) |
| `http://localhost:8080/...` or undefined | `development` | 0.1 (10%) |

Sentry is **disabled** (no-op) if `NEXT_PUBLIC_SENTRY_DSN` is absent — safe for local dev.

### Query Client Defaults

```typescript
{
  staleTime: 60 * 1000,           // 60 seconds before refetch
  gcTime: 5 * 60 * 1000,          // Keep unused queries 5 min
  refetchOnWindowFocus: false,    // No auto-refetch on tab focus
  retry: 1,                       // Retry failed queries once
}
```

Modify these only if changing behavior site-wide. For single-hook customization, pass `staleTime`/`gcTime` directly to `useQuery`.

### Sentry AUTH001 Filtering

AUTH001 (token expired) is normal session recovery, not an error. The `beforeSend` hook filters it:

```typescript
if (errorCode === 'AUTH001') return null; // don't send to Sentry
```

**Never add other error codes to this filter without explicit approval** — they should be monitored.

### Constants vs Hooks

- **Constants** → static enums, labels, config values (this directory)
- **Hooks** → API calls, data fetching, query logic (`src/hooks/queries/`)
- **Stores** → global client state (`src/stores/`)

Do not mix fetching logic into constants; keep this directory pure.

<!-- MANUAL: -->
