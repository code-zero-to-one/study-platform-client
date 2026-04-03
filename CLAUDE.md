# CLAUDE.md

This file is a reference guide for Claude Code (claude.ai/code) when working with this repository.

## Core Rules (Must Review Before All Tasks)

### Implementation Principles

- **Limit exploration to 2–3 files max.** Do not spend the session on exploration or planning. Once you know the file path and API contract, start writing code immediately.
- **Never fabricate API endpoints.** Do not invent endpoints that don't exist. Always verify real APIs in `src/hooks/queries/`, `src/api/`, `src/api/openapi/` before using them. If not found, leave a TODO placeholder and inform the user.
- **Fix all issues in a single pass during code review.** Do not make multiple passes on the same file. Handle all discovered issues in one pass.

### Completion Criteria

After writing or modifying code, **all 3 of the following must pass to consider the task complete**:

```bash
yarn lint:fix       # ESLint auto-fix
yarn prettier:fix   # Prettier format
yarn typecheck      # No type errors
```

- `yarn typecheck` can be skipped for UI-only changes with no type modifications
- Standalone "prettier cleanup" or "lint fix" commits signal this criterion was not met
- Even for broad changes, lint/prettier runs only **within the scope of modified files** (consistent with the no-unrelated-improvements principle)

### Code Conventions (auto-applied)

- Always use `cn()` for `className` composition. No template literal classNames.
- No Tailwind arbitrary values (`p-[4px]`, `w-[320px]`). Use project custom tokens.
- No hardcoded colors/spacing. Use only `@theme inline` tokens from `global.css`.

---

## Project Overview

ZERO-ONE Study Platform — A 1:1 morning study platform to start every day together. Built on Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4. Package manager: **Yarn 1.22+**, Node.js >=20 required.

## Commands

```bash
yarn dev              # Run Turbopack dev server
yarn build            # Production build
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn typecheck        # TypeScript type check (tsc --noEmit)
yarn prettier         # Prettier format check
yarn prettier:fix     # Prettier auto-format
yarn storybook        # Storybook dev server (port 6006)
yarn build-storybook  # Storybook build
yarn generate:api <name>  # Generate API query hook boilerplate (e.g., yarn generate:api bank-search-api)
```

CI pipeline: lint → typecheck → prettier → build → build-storybook → security audit.

## Domain Warning: Mentoring vs MentorStudy

### Mentoring (1:1 individual consultation)
- **URL**: `/mentoring`, `/mentoring/[id]`, `/mentoring/[id]/apply`, `/mentoring/become-mentor`
- **Feature**: `src/features/mentoring/`
- **API hooks**: `useMentorDirectoryQuery`, `useMentorDetail`, `useMentoringApplyController`, etc.
- **Backend endpoint**: `/api/v1/mentors`
- **Nature**: 1:1 consultation between a professional mentor and a learner. Separate application/acceptance flow. No assignments or member management.

### MentorStudy (premium type of group study)
- **URL**: `/premium-study`, `/premium-study/[id]`
- **Components**: `src/components/pages/premium-study-*.tsx`, `src/app/(service)/premium-study/`
- **API hooks**: `useGetGroupStudyDetail`, `useGetGroupStudyList` (shared GroupStudy hooks)
- **Backend endpoint**: `/api/v1/group-studies` (MENTOR_STUDY distinguished by query parameter)
- **Nature**: Special type of group study (MentorStudy extends GroupStudy). Includes member management, assignments, and evaluations.

### Key Differences

| | Mentoring | MentorStudy |
|---|---|---|
| Participation | 1:1 | 1:N group |
| Frontend URL | `/mentoring/*` | `/premium-study/*` |
| API path | `/api/v1/mentors` | `/api/v1/group-studies` |
| Entity | `Mentor`, `MentoringApplication` | `MentorStudy extends GroupStudy` |
| Assignments & Evaluations | No | Yes |

---

## Architecture

### Routing (Next.js App Router)

- `src/app/(landing)/` — public landing page (`/`)
- `src/app/(service)/` — authenticated service pages (home, my-page, payment, premium-study, etc.)
- `src/app/(admin)/` — admin pages (protected by `ROLE_ADMIN` claim in JWT)
- `src/middleware.ts` — auth handling: validates accessToken cookie, auto-refreshes via `/api/v1/auth/access-token/refresh`, checks admin permissions for `/admin/*` paths

### API Layer

**Backend API docs (Swagger):**

- Staging: https://test-api.zeroone.it.kr/v3/api-docs
- Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html

Two communication patterns coexist:

1. **Legacy axios** (`src/api/client/axios.ts`): baseURL `/api/v1/`, token refresh queue (triggers on AUTH001 error). Used for custom endpoints.
2. **OpenAPI auto-generated** (`src/api/openapi/`): Types and services auto-generated from backend Swagger. **Never modify files inside `src/api/openapi/`** — they are regenerated. This directory is excluded from ESLint.

How to add a new API hook:

```bash
yarn generate:api <swagger-api-title-name>
# Creates src/hooks/queries/<name>.ts (with createApiInstance boilerplate)
```

Use the generated API instance in the file to write TanStack Query hooks.

#### TanStack Query Hook Patterns

**useQuery (read):**

```typescript
export const useGetMissions = ({
  groupStudyId,
  page = 1,
}: GetMissionsParams) => {
  return useQuery({
    queryKey: ['missions', groupStudyId, page], // resource name + params
    queryFn: async () => {
      const { data } = await missionApi.getMissions(groupStudyId, page);
      return data.content; // extract content
    },
    enabled: !!groupStudyId, // conditional execution (optional)
  });
};
```

**useMutation (create/update/delete):**

```typescript
export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupStudyId, request }: CreateMissionParams) => {
      const { data } = await missionApi.createMission(groupStudyId, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['missions', variables.groupStudyId], // invalidate related queries
      });
    },
  });
};
```

**useMutation callback pattern:**

`onSettled` always runs regardless of success/failure (equivalent to a `finally` block). Actions needed only on success (page navigation, success toast) must go in `onSuccess`; failure handling in `onError`; UI cleanup (closing modals, resetting state) in `onSettled`.

```typescript
// Correct pattern
mutate(params, {
  onSuccess: () => {
    showToast('완료되었습니다.');
    router.push('/list'); // only on success
  },
  onError: () => {
    showToast('실패하였습니다.', 'error');
  },
  onSettled: () => {
    setConfirmAction(null); // always clean up UI
  },
});
```

**queryKey convention:**

- Single resource: `['mission', missionId]`
- List resource: `['missions', groupStudyId, page, size]`
- Invalidation uses parent key: `queryKey: ['missions']` (invalidates entire resource)
- When a mutation affects multiple resources, invalidate all related queryKeys:

```typescript
onSuccess: async (_, variables) => {
  // Applicant status change → refresh both member list and applicant list
  await queryClient.invalidateQueries({ queryKey: ['groupStudyMemberList', variables.groupStudyId] });
  await queryClient.invalidateQueries({ queryKey: ['entryList', variables.groupStudyId] });
},
```

#### Legacy Pattern (API inside features)

Write axios functions directly in `src/features/<domain>/api/`:

```typescript
import { axiosInstance } from '@/api/client/axios';

export const getArchive = async (params: GetArchiveParams) => {
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    { params },
  );
  return data.content;
};
```

Legacy pattern is for maintaining existing code only. New APIs should use the OpenAPI approach.

### State Management

- **Zustand** (`src/stores/`): Global client state. `useUserStore` (user info persist), `useLeaderStore`.
- **TanStack Query** (`src/hooks/queries/`): Server state. Domain-specific query hooks (study, payment, evaluation, peer-review, settlement, etc.). Default staleTime: 60 seconds.
- **React Hook Form + Zod** (`src/types/schemas/`): Form state + runtime validation.

### Component Structure

- Shared UI is primarily located under `src/components/common/ui/`. Examples: `Button`, `Dialog`, `Toast`, `FloatingInquiryButton`
- Shared layouts are under `src/components/common/layout/`. Examples: `Header`, `AdminSideBar`
- Shared modals are under `src/components/common/modals/`
- Page-level composite components are in `src/components/pages/`; domain composites are spread across `payment/`, `discussion/`, `archive/`, `balance-game/`, `mentoring`-related directories, etc.
- `src/features/`-based structure and traditional `components/`, `hooks/queries/` structure coexist. Do not mix structures within a single PR for new changes.

### Backend Data Safety Patterns

Empty array safety is already guaranteed by parent component `if (!arr?.length) return null` guards, so no additional defensive code before `Math.max` calls is needed.

#### Using Optional Fields Safely in React keys and Handlers

Using optional (`?`) ID fields from the backend directly as React `key` props can cause multiple items to have `key="undefined"`, leading to incorrect DOM reuse by React. Use `??` operator with `index` fallback.

```typescript
// Wrong pattern — if missionId is undefined, all items get key="undefined"
{items.map((item) => <div key={item.missionId}>...</div>)}

// Correct pattern — optional field ?? index
{items.map((item, index) => <div key={item.missionId ?? index}>...</div>)}
```

Optional fields used inside event handlers also need guards:

```typescript
// Wrong pattern — if missionId is undefined, routes to ?missionId=undefined
const handleClick = (id: number) => router.push(`...?missionId=${id}`);

// Correct pattern — recoverable failures notify via Toast
const handleClick = (id: number | undefined) => {
  if (!id) {
    showToast('정보를 불러올 수 없습니다.', 'error');
    return;
  }
  router.push(`...?missionId=${id}`);
};
```

#### Safe Guards for enum-like String Type Assertions

The backend may send values not present in the frontend type definition. Use `in` guard + fallback instead of a simple `as StudyType` assertion. TypeScript `as` does not protect at runtime.

```typescript
// Wrong pattern — undefined rendering or runtime error when unknown value received
const studyType = type as StudyType;
<Badge>{STUDY_TYPE_LABELS[studyType]}</Badge>

// Correct pattern — in guard with fallback
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

### Styling

- Tailwind CSS 4 + `@tailwindcss/postcss` plugin
- Class utilities: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- `prettier-plugin-tailwindcss` for Tailwind class sorting
- Theme managed via CSS variables in `src/app/global.css`
- `@theme inline` in `src/app/global.css` resets base tokens (`--color-*`, `--radius-*`, `--spacing-*`, `--shadow-*`), so base Tailwind scale classes (`p-4`, `rounded-lg`, `shadow-md`, `text-sm`, etc.) are prohibited. Use only project custom tokens (`p-200`, `rounded-150`, `shadow-2`, `font-designer-*`, `text-text-*`)

### Auth Flow

1. OAuth login (Kakao/Google) → server issues JWT access + refresh tokens
2. `accessToken` stored in cookie (JS-accessible), `refresh_token` in httpOnly cookie
3. Axios interceptor detects `AUTH001` error → refreshes token → retries failed request (queue used to prevent duplicate refreshes)
4. Middleware validates token server-side during navigation, redirects to `/` if invalid

### Error Handling

Error handling is centralized around `src/utils/error-handler.ts`. `src/utils/error.ts` is a deprecated backwards-compatibility wrapper for `extractErrorCode()`.

#### Core Files

- `src/utils/error-handler.ts` — `analyzeError()`, `logError()`, `ErrorType`, `ErrorInfo`. Handles error code-to-message mapping (~40 codes), Korean fallback messages, and Sentry reporting.
- `src/config/query-client.ts` — `MutationCache` global error handler. Automatically shows error toast + Sentry report when a mutation with no `onError` fails.
- `src/app/(service)/error.tsx`, `(landing)/error.tsx`, `(admin)/error.tsx` — route segment error boundaries
- `src/app/global-error.tsx` — root error boundary (auto-captures to Sentry)
- `src/app/not-found.tsx` and each route group's `not-found.tsx`

#### Error Classification

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

#### Error Code-to-Message Mapping

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

#### Mutation Error Global Handler

`MutationCache.onError` in `query-client.ts` acts as a safety net:

- Automatically shows error toast + Sentry report when a mutation without `onError` fails.
- Skips global handler if individual `onError` is present (prevents double-handling).
- Not applied to query errors (prevents toast flooding on simultaneous failures).

#### Client Error Handling Principles

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

#### Server Error Handling Principles

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

#### Production Security Principles

- Never expose `stack trace`, raw server messages, internal paths, or sensitive backend responses to the user in production.
- All 3 `error.tsx` files gate behind `process.env.NODE_ENV === 'development'`: `technicalMessage`, `error.message`, `error.stack` are only shown in development.
- Only expose generalized `userMessage`, and optionally `errorCode`, `statusCode`, `digest` to the user.
- `digest` is a trace identifier for finding the cause in server logs or Sentry.
- API routes should also avoid including detailed `details` in production responses.

#### Success Page Principles

- Major success events (study creation, study join, payment complete) should have a dedicated success page or completion screen that clearly guides the user's next action.
- Branding elements should center on welcome copy, team message, and follow-up CTA. Even with high information density, the primary CTA should be visible first.

#### Monitoring (Sentry)

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

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Key Conventions

- **Commit messages**: `feat :`, `fix :`, `refactor :`, `style :`, `docs :`, `test :`, `chore :` (spaces around colon). Write in Korean, "WHY"-focused, under 50 characters.
- **Branch strategy**: Feature branch → `develop` (staging: test.zeroone.it.kr) → `main` (production: www.zeroone.it.kr)
- **ESLint config**: RushStack-based, strict TypeScript, React hooks, TanStack Query plugin, import sorting (alphabetical + by group)
- **Prettier**: 80 char width, single quotes, trailing comma, 2-space indent
- **SVG handling**: `@svgr/webpack` configured in next.config.ts — SVGs can be imported as React components

## Documentation Rules

- Immediately after completing a feature or bug fix, **automatically** run the `/doc` command to generate documentation in the `docs/` folder.
- `/doc` is a **local project command** defined in `.claude/commands/doc.md`. Follow the file's instructions directly without the Skill tool.
- Determine the type from **commit messages and code patterns only**, not from branch name.

### Bugfix document (`bugfix-*.md`) required narrative flow

Documents must follow the 3-step narrative structure below. Write as **"WHY → HOW & WHY THIS → RESULT"**, not "WHAT changed."

1. **Problem** — what was the issue
   - Symptom: what situation caused what problem from the user's perspective
   - Root cause: why this bug occurred at the code level (problematic code + occurrence flow)
2. **Solution — how & why this approach**
   - Chosen approach and reasoning (before/after code)
   - **Alternatives considered but not chosen**: were there other solutions, why weren't they chosen
3. **Result** — what changed after the fix (UX changes, behavior changes, prevention points)

### Feature document (`feature-*.md`) required narrative flow

1. **Background — why it was needed**
   - What inconvenience/limitation existed without this feature. What user problem does it solve?
2. **Implementation — how & why this approach**
   - Core approach and reasoning (key code + implementation flow)
   - **Other implementation approaches considered**: if alternatives existed, why weren't they chosen
3. **Result** — what became possible after implementation (changes from user/developer perspective)

## Claude Commands & Skills

### Local Command Priority Principle

This project has project-specific commands defined in `.claude/commands/`.
**Always use local commands over global skills.**

| Task | Use | Do not use |
|------|-----|-----------|
| Code review | `/review` | `coderabbit:review`, `code-review:code-review` |
| Commit | `/commit` | `sc:git`, `everything-claude-code:*` |
| Create PR | `/pr` | `pr-creator` agent |
| Generate docs | `/doc` | `sc:document` |
| Implementation | `/implement` | `sc:implement`, `everything-claude-code:plan` |
| Explain concepts | `/explain` | `sc:explain` |
| Trusted references | `/ref` | (no need to call agent directly) |

The `sc:*` series (SuperClaude) and backend/Go-related global skills like `everything-claude-code:go-*`, `everything-claude-code:springboot-*` **are not used in this project.**

However, the following `sc:` commands are **exceptionally allowed** since there are no equivalent local commands:

| `sc:` command | Purpose |
|--------------|---------|
| `sc:research` | Deep web research on a topic (local `/ref` is for citing implementation references, different purpose) |
| `sc:brainstorm` | Requirements exploration and ideation conversations |
| `sc:estimate` | Development effort estimation |

### Frequently Used Commands

```bash
/commit                    # lint:fix → prettier:fix → typecheck → generate commit message → commit
/review                    # auto-detect changed files → 13-criteria review + project-specific agents
/review-pr <PR number>     # CodeRabbit comment accept/reject + independent review + fix plan
/pr                        # auto-create GitHub PR targeting develop
/explain <concept>         # explain framework concept with project code examples
/doc                       # auto-generate docs/ documentation after task completion (suggests /ref after)
/ref <task>                # perform task or attach citations with MDN/OWASP/official doc references
```

### Browser Verification (staging-verify skill)

Staging URL: `https://test.zeroone.it.kr`

Request "check in Chrome (study id: XXX)" format to auto-verify with Chrome DevTools MCP.
Supported patterns:

- Group study detail: `/group-study/{id}`
- Mission tab: `/group-study/{id}?tab=mission`
- Evaluation tab: `/group-study/{id}?tab=evaluation`

### Commit Review (commit-reviewer agent)

Auto-activated on requests like "check if this commit has issues", "check if changes have logic problems", etc.
Reviews against project conventions (OpenAPI priority, queryKey patterns, staleTime 60s).

## Environment Variables

Key `NEXT_PUBLIC_*` variables needed for development:

- `NEXT_PUBLIC_API_BASE_URL` — backend API endpoint
- `NEXT_PUBLIC_KAKAO_CLIENT_ID` — Kakao OAuth
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` — Toss Payments
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN (Sentry disabled if absent)
- `SENTRY_ORG` — Sentry organization (for CI source map upload)
- `SENTRY_PROJECT` — Sentry project (for CI source map upload)
- `SENTRY_AUTH_TOKEN` — Sentry auth token (for CI source map upload)
