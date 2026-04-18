<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# api/

## Purpose

Central API layer integrating two coexisting patterns:

1. **Legacy Axios** (`client/axios.ts`) — Direct HTTP calls with token refresh queue, AUTH001 error handling, used for custom endpoints
2. **OpenAPI Auto-Generated** (`openapi/`) — Type-safe auto-generated client from backend Swagger, preferred for new APIs

The directory orchestrates all backend communication: auth interceptors, request/response transformation, error handling, and domain-specific endpoint functions.

---

## Key Files (client/)

| File | Description |
|------|-------------|
| `axios.ts` | Main Axios instance (baseURL `/api/v1/`, 60s timeout, JSON + multipart variants, logging + auth interceptors attached) |
| `axiosV2.ts` | Secondary Axios instance (rarely used, similar setup) |
| `open-api-instance.ts` | **Client-side** OpenAPI Configuration wrapper; creates typed API service instances via `createApiInstance(ApiClass)` |
| `open-api-instance.server.ts` | **Server-side** variant for RSC/SSR data fetching |
| `auth-response-interceptor.ts` | Handles AUTH001 (token expired) errors; attempts retry with refreshed token; calls `requestDocumentAuthRecovery()` if refresh fails |
| `auth-session-refresh.ts` | Token refresh queue (prevents duplicate refresh calls during concurrent failures) |
| `auth-session-recovery.ts` | Called when token refresh fails; should open login modal in-place |
| `api-error.ts` | Custom `ApiError` class; `isApiError()` type guard for error classification |
| `api-logger.ts` | Request/response logging interceptor (dev/prod modes) |
| `cookie.ts` | Utilities for reading/writing auth cookies (`ACCESS_TOKEN`, `REFRESH_TOKEN`) |
| `google-sheets.ts` | Google Sheets API integration (optional, specific use case) |

---

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `endpoints/` | **Axios-based endpoint functions**, organized by domain (13 subdirs, ~66 files) — legacy pattern for custom APIs |
| `openapi/` | **AUTO-GENERATED** from backend Swagger (432 docs + 388 models) — **NEVER modify** |
| `strapi/` | Strapi CMS integration (optional) |

### endpoints/ Domains

Organized by feature/resource:

- **admin/** — Admin dashboard data (member list, sincerity temperature history, account history)
- **archive/** — Study session archive retrieval, search, bookmarks, visibility
- **auth/** — Login, OAuth flow, token management
- **balance-game/** — Balance game API queries
- **channel/** — Discussion threads, comments, reactions
- **group-study/** — Study creation, listing, detail retrieval, deletion
- **group-study-application/** — Study join applications, applicant management
- **hall-of-fame/** — Hall of fame rankings
- **interview/** — Interview data fetching
- **participation/** — Participation tracking
- **review/** — Evaluation/review submission and retrieval
- **study-history/** — User's past study sessions

---

## For AI Agents

### Working In This Directory

#### Critical Rules

- **NEVER modify `src/api/openapi/`** — files are auto-generated from backend Swagger. Any edits will be overwritten.
- **Always verify endpoints exist before using** — check backend Swagger at https://test-api.zeroone.it.kr/swagger-ui/index.html
- **Never fabricate API endpoints** — if an endpoint is not found in `openapi/` or `endpoints/`, leave a TODO and inform the user

#### API Patterns

**Legacy Axios (custom endpoint):**

```typescript
// src/api/endpoints/<domain>/<endpoint-name>.ts
import { axiosInstance } from '@/api/client/axios';

export const getArchive = async (params: GetArchiveParams) => {
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    { params },
  );
  return data.content;
};
```

**OpenAPI Auto-Generated (preferred for new APIs):**

1. Identify the backend Swagger API title (e.g., "GroupStudyManagement")
2. Use `yarn generate:api <name>` to scaffold a query hook file
3. In the generated file, use `createApiInstance()` to instantiate the typed service:

```typescript
// src/hooks/queries/get-group-study-detail.ts
import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';

export const useGetGroupStudyDetail = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId],
    queryFn: async () => {
      const api = createApiInstance(GroupStudyManagementApi);
      const { data } = await api.getGroupStudy(groupStudyId);
      return data.content; // extract from response wrapper
    },
    enabled: !!groupStudyId,
  });
};
```

#### Server-Side API Calls (SSR/RSC)

For `src/app/` Server Components, use `open-api-instance.server.ts`:

```typescript
// src/api/endpoints/group-study/get-group-study-detail.server.ts
import { createApiServerInstance } from '@/api/client/open-api-instance.server';
import { GroupStudyManagementApi } from '@/api/openapi/api/group-study-management-api';

export const getGroupStudyDetailInServer = async (groupStudyId: number) => {
  const api = createApiServerInstance(GroupStudyManagementApi);
  const { data } = await api.getGroupStudy(groupStudyId);
  return data.content;
};
```

**Error handling:**

```typescript
import { isAxiosError } from 'axios';
import { notFound } from 'next/navigation';
import { isApiError } from '@/api/client/api-error';

try {
  const data = await getGroupStudyDetailInServer(id);
  return data;
} catch (error: unknown) {
  // Handle 404 (GSM001 = study not found)
  if (
    isAxiosError(error) &&
    error.response &&
    isApiError(error.response.data) &&
    error.response.data.errorCode === 'GSM001'
  ) {
    notFound();
  }
  throw error; // Re-throw other errors to error.tsx
}
```

#### TanStack Query Hook Pattern (Client-Side)

See `@.claude/rules/api-patterns.md` for full details:

- **Query**: `queryKey: ['resource', ...params]`
- **Mutation**: `onSuccess` for cache invalidation
- **Stale time**: Default 60 seconds (override as needed)

#### Token Refresh & Auth Flow

When a request fails with `AUTH001` (expired token):

1. `auth-response-interceptor.ts` intercepts the error
2. Attempts to refresh the token via `auth-session-refresh.ts` (queues concurrent requests)
3. If refresh succeeds, retries the original request
4. If refresh fails (e.g., 400), calls `requestDocumentAuthRecovery()` → **opens login modal in-place**

**Do NOT redirect to login page** — the modal preserves page context so the user can re-authenticate and continue their action.

#### File Upload (multipart)

For multipart requests (file uploads), use `axiosInstanceForMultipart` instead of `axiosInstance`:

```typescript
import { axiosInstanceForMultipart } from '@/api/client/axios';

const formData = new FormData();
formData.append('file', file);

await axiosInstanceForMultipart.post('/upload', formData);
// Note: Do NOT set Content-Type header — browser auto-detects + sets boundary
```

#### Logging & Debugging

Attach request/response logging via `api-logger.ts`:

```typescript
// Already attached to axiosInstance in axios.ts
// Check browser DevTools Console or server logs for:
// - Request method, URL, headers, body
// - Response status, headers, body
// - Timing information
```

### Common Workflows

#### Adding a New API Endpoint

1. **Check backend Swagger** at https://test-api.zeroone.it.kr/swagger-ui/index.html
2. **If OpenAPI endpoint exists:**
   - Run `yarn generate:api <api-title>` to scaffold hook
   - Use `createApiInstance(ApiClass)` to instantiate the typed service
3. **If custom Axios endpoint:**
   - Create `src/api/endpoints/<domain>/<endpoint-name>.ts`
   - Follow legacy pattern (import `axiosInstance`, call `.get()` / `.post()` / etc.)
4. **Server-side (RSC/SSR):**
   - Create parallel `.server.ts` file
   - Use `createApiServerInstance()` for OpenAPI or `axiosInstance` for legacy

#### Debugging API Errors

1. **Check error code** in `src/utils/error-handler.ts` → `codeMessages` mapping
2. **Classify error** via `analyzeError()` → returns `ErrorInfo` (code, userMessage, statusCode, etc.)
3. **Log to Sentry** via `logError(error)` (auto-called by `MutationCache.onError` for mutations without `onError`)
4. **Show user message** via Toast: `useToastStore.getState().showToast(errorInfo.userMessage, 'error')`

#### Token Refresh Failures

When `auth-session-recovery.ts` is called (token refresh failed):

- **Current behavior**: Logs error
- **Target behavior**: Opens login modal via `useLoginModalStore.getState().open()`
- **Infrastructure**: `src/stores/use-login-modal-store.ts` + `<GlobalLoginModal />` in layouts

---

## Dependencies

- **axios** — HTTP client with request/response interceptors
- **@tanstack/react-query** — Server state caching (used in `src/hooks/queries/`)
- **@sentry/nextjs** — Error monitoring (auto-called by `logError()`)
- **openapi-generator** — Backend Swagger auto-generation (CI: regenerate on backend changes)

### Environment Variables

- `NEXT_PUBLIC_API_BASE_URL` — Backend API root (e.g., `https://test-api.zeroone.it.kr`)
- Cookies: `accessToken`, `refresh_token` (httpOnly) — set by backend OAuth/login endpoints

---

## Error Classification

`src/utils/error-handler.ts` → `analyzeError()` checks in order:

```
1. AxiosError        → isAxiosError()     ✅ Extract HTTP status
2. ApiError          → isApiError()       ✅ Preserve errorCode/statusCode
3. Generic Error     → instanceof Error   ⚠️ UNKNOWN type
4. unknown           → String(error)      ⚠️ Fallback
```

Error codes organized by prefix (AUTH, CMM, MEM, GSM, PAY, FILE, etc.) — see CLAUDE.md for full mapping.

---

## Regenerating OpenAPI Client

When backend Swagger changes (CI automatically runs):

```bash
# Locally (if needed):
# Schema is in backend repo at study-platform-mvp/
# Generation defined in next.config.ts or separate script
```

Result: New files in `src/api/openapi/` (docs/ + models/ + api/)

**Note:** All 876 auto-generated files in `openapi/` should be `.gitignore`'d or committed as-is. Do not manually edit.

---

## Architecture Notes

### Request Flow (Client-Side)

```
React Component
  ↓ (useQuery / useMutation)
src/hooks/queries/*.ts (hook layer)
  ↓
src/api/openapi/api/*.ts (auto-generated service)
  ↓ (createApiInstance)
src/api/client/open-api-instance.ts (Configuration + axiosV2)
  ↓
src/api/client/axiosV2.ts (Axios instance)
  ↓ (interceptor)
src/api/client/auth-response-interceptor.ts
  ↓ (token refresh or recovery)
src/api/client/auth-session-refresh.ts / auth-session-recovery.ts
  ↓
Backend (https://test-api.zeroone.it.kr/api/v1/...)
```

### Request Flow (Server-Side / RSC)

```
src/app/(service)/[page]/page.tsx (Server Component)
  ↓
src/api/endpoints/<domain>/*.server.ts
  ↓ (createApiServerInstance)
src/api/client/open-api-instance.server.ts
  ↓
src/api/client/axios.server.ts (server Axios)
  ↓
Backend
```

### Auth Lifecycle

```
Initial Login
  ↓
Backend issues: accessToken (cookie) + refresh_token (httpOnly cookie)
  ↓
axiosInstance request interceptor attaches `Authorization: Bearer <accessToken>`
  ↓
[If 401 AUTH001 on response]
  ↓
auth-response-interceptor.ts → auth-session-refresh.ts (queue + refresh)
  ↓
[If refresh succeeds]
  ↓
Retry original request with new token
  ↓
[If refresh fails (400)]
  ↓
auth-session-recovery.ts → requestDocumentAuthRecovery() → open login modal
```

---

<!-- MANUAL: -->
