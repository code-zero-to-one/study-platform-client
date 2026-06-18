<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# providers/

## Purpose

Application-level provider initialization and composition. This directory exports the root provider wrapper (`MainProvider`) that enables global features:
- TanStack Query client setup and devtools
- Authentication hydration and session management
- User state initialization and cleanup
- CSP-safe Zod configuration

All route group layouts (`(service)`, `(landing)`, `(admin)`) wrap their children with `<MainProvider>`, making these providers accessible throughout the entire application.

## Key Files

| File | Description |
|------|-------------|
| `index.tsx` | **Root provider composition.** Exports `MainProvider` component that wraps children with `<AuthHydrationProvider>`, `<QueryProvider>`, and `<UserInitializer>`. Handles auth hydration, user fetch on session change, client state cleanup on logout, and React Query devtools. |
| `query-provider.tsx` | **TanStack Query setup.** Wraps children with `QueryClientProvider` using the config from `src/config/query-client.ts`. |

## For AI Agents

### Working In This Directory

**When to modify:**
- Adding a new global provider (e.g., theme provider, feature flag provider) → add to `MainProvider` composition
- Changing TanStack Query client config → update `query-provider.tsx` or `src/config/query-client.ts`
- Modifying auth/user initialization logic → update `UserInitializer` or auth imports

**When NOT to modify:**
- Global UI components (toast, login modal) are mounted in layouts, not here
- API error handling config lives in `src/config/query-client.ts`, not this directory
- Auth token refresh logic lives in `src/api/client/auth-session-recovery.ts`

### Common Patterns

#### Auth Hydration & User Initialization Flow

```typescript
// Flow triggered on mount/session change:
1. AuthHydrationProvider reads initialSession (from middleware)
2. useAuthReady() detects session state and memberId
3. UserInitializer watches for auth changes
4. If memberId changed → fetchAndSetUser() pulls full user profile
5. If logged out → resetClientDerivedAuthState() clears Zustand stores
```

Key refs:
- `useAuthReady()` — hook from `src/features/auth/model/use-auth.ts`
- `resetClientDerivedAuthState()` — cleanup from `src/features/auth/model/client-auth-cleanup.ts`
- `useUserStore` — Zustand store at `src/stores/useUserStore.ts`
- `AUTH_SESSION_STATES` — enum from `src/types/auth/domain.ts` (AUTHENTICATED_MEMBER, GUEST, etc.)

#### Zod JIT Workaround

```typescript
import { z } from 'zod';
z.config({ jitless: true }); // CSP-safe mode (browsers don't execute Function(...) constructor)
```

This must run early (in `index.tsx`) before any Zod schemas are validated. Prevents CSP violations on schema parsing.

#### React Query Devtools

```typescript
{process.env.NODE_ENV === 'development' && (
  <ReactQueryDevtools initialIsOpen={false} />
)}
```

Mounted only in dev; automatically exposes query cache inspector at bottom-right.

#### Session Change Detection & User Refetch

```typescript
// If authenticated memberId differs from stored memberId:
if (memberId !== authMemberId) {
  void fetchAndSetUser(authMemberId);
}

// If session switched from authenticated to guest:
if (previousAuthenticatedMemberId !== undefined &&
    previousAuthenticatedMemberId !== nextAuthenticatedMemberId) {
  resetClientDerivedAuthState(); // Clear user-scoped cache
}
```

This ensures user store stays in sync when:
- User logs in
- User logs out
- User switches accounts (rare, but handled)

#### Security: localStorage Cleanup

```typescript
useEffect(() => {
  localStorage.removeItem('user-info-storage'); // Deprecated storage
}, []);
```

Migrates users from insecure localStorage to sessionStorage. Runs once per mount to clean up legacy data.

## Dependencies

### External

| Package | Usage |
|---------|-------|
| `@tanstack/react-query` | Server state management client |
| `@tanstack/react-query-devtools` | Query cache inspector (dev only) |
| `zod` | Schema validation (CSP-safe mode) |
| `react` | Hooks (useEffect, useLayoutEffect, useRef) |

### Internal

| Module | Purpose |
|--------|---------|
| `@/features/auth/model/auth-hydration-context` | Provides `AuthHydrationProvider` and `AuthHydrationSession` type |
| `@/features/auth/model/use-auth` | Hook `useAuthReady()` — detects auth state, memberId, sessionState |
| `@/features/auth/model/client-auth-cleanup` | Function `resetClientDerivedAuthState()` — clears Zustand stores on logout |
| `@/config/query-client` | Exports `getQueryClient()` — TanStack Query config with MutationCache global error handler |
| `@/stores/useUserStore` | Zustand store with `fetchAndSetUser()` method |
| `@/types/auth/domain` | Enum `AUTH_SESSION_STATES` (AUTHENTICATED_MEMBER, GUEST, etc.) |

### Related Files (DO NOT MODIFY)

- `src/api/openapi/` — Auto-generated API types/services
- `src/api/client/axios.ts` — Axios instance with token refresh interceptor
- `src/api/client/auth-session-recovery.ts` — Handles failed token refresh → login modal

<!-- MANUAL: -->
