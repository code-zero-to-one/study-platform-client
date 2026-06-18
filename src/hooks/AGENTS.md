<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-06-06 -->

# hooks/

## Purpose

Central repository for **React hooks** and **TanStack Query** state management. Organized by concern:

- **Root level**: Utility hooks for debouncing, DOM scroll, URL params, and current time
- **`common/`**: General-purpose hooks for auth, filtering, infinite scroll, lazy mounting, and form logic
- **`queries/`**: Domain-specific TanStack Query hooks (useQuery/useMutation) organized by feature

This directory implements the project's server state management layer and provides reusable client-side hook utilities for components across all feature areas.

## Key Files

| File | Description |
|------|---|
| `use-debounce.ts` | Generic debounce hook with configurable delay |
| `use-discussion-params.ts` | URL param management for discussion threads |
| `use-now.ts` | Current time hook, updates on interval |
| `use-scroll-to-home-content.ts` | Scroll utility targeting home content |
| `use-scroll-to-next-field.ts` | Form field auto-scroll for better UX |

## Subdirectories

| Directory | Purpose | File Count |
|-----------|---------|-----------|
| `common/` | General-purpose hooks: auth, filtering, scroll, mounting, forms | 13 files |
| `queries/admin/` | Admin panel query hooks | 4 files |
| `queries/auth/` | Authentication & signup flows | 6 files |
| `queries/group-study/` | Group study operations, missions, reviews, evaluations | 14 files |
| `queries/one-to-one/` | 1:1 study modes: archive, balance game, interview | 23 files |
| `queries/payment/` | Payment & settlement queries | 4 files |
| `queries/user/` | User profile & member list queries | 5 files |
| `queries/__tests__/` | Unit tests for query hooks | - |

## For AI Agents

### Working In This Directory

**Adding a new query hook:**

1. Use `yarn generate:api <swagger-api-title-name>` to scaffold boilerplate in `src/hooks/queries/<domain>/`
2. Implement `useQuery` or `useMutation` following the patterns below
3. Run `yarn typecheck` to validate
4. Export from `index.ts` if required by consumers

**This directory is the target structure for all new hooks.** Do not add new hooks under `src/features/<domain>/model/` — `features/` is frozen legacy, migrated here one domain per PR. File naming: `use-<x>-query.ts` for single-hook files, `<domain>-queries.ts` for multi-hook files.

**Anatomy of a query hook file:**

- Import TanStack Query and API instance at the top
- Group related queries and mutations (e.g., all "study" operations in one file)
- Each hook is a named export
- Query hooks return data via `data.content` (extract from API response)
- Mutation hooks invalidate related `queryKey` prefixes on success

### Common Patterns

#### useQuery (Read Operations)

```typescript
export const useGroupStudyDetailQuery = (groupStudyId: number) => {
  return useQuery({
    queryKey: ['groupStudyDetail', groupStudyId], // resource + params
    queryFn: async () => {
      const api = createApiInstance(GroupStudyManagementApi);
      const { data } = await api.getGroupStudy(groupStudyId);
      return data.content; // extract nested content
    },
    enabled: !!groupStudyId, // conditional execution
  });
};
```

**queryKey convention:**
- Single resource: `['mission', missionId]`
- List resource: `['missions', groupStudyId, page, size]`
- Nested: `['groupStudyDetail', groupStudyId]`
- Invalidation uses parent key: `queryKey: ['missions']` invalidates all mission variants

**staleTime default:** 60 seconds (defined in `src/config/query-client.ts`)

#### useMutation (Write Operations)

```typescript
export const useCreateMissionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupStudyId, request }: CreateMissionParams) => {
      const api = createApiInstance(MissionApi);
      const { data } = await api.createMission(groupStudyId, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      // Invalidate related queries after write succeeds
      await queryClient.invalidateQueries({
        queryKey: ['missions', variables.groupStudyId],
      });
    },
  });
};
```

**onSuccess / onError / onSettled callback pattern:**

- **onSuccess**: Page navigation, success toast, refresh sibling lists — **only runs on success**
- **onError**: Error toast, user notification — **only runs on failure**
- **onSettled**: Modal close, state reset — **always runs (finally block)**

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
    setConfirmAction(null); // always clean up
  },
});
```

#### useQuery with Multiple Invalidations

When a mutation affects multiple resource lists:

```typescript
onSuccess: async (_, variables) => {
  // Applicant status change → refresh both member and applicant lists
  await queryClient.invalidateQueries({
    queryKey: ['groupStudyMemberList', variables.groupStudyId],
  });
  await queryClient.invalidateQueries({
    queryKey: ['entryList', variables.groupStudyId],
  });
},
```

### Domain Organization

**`queries/auth/`** — User authentication (sign up, login, logout, phone verification)
- `use-auth-mutation.ts` — signup, logout, profile image upload
- `use-auth.ts` — auth context re-export
- `use-phone-auth-mutation.ts` — phone verification flow
- `use-nickname-check.ts` — nickname validation

**`queries/group-study/`** — 1:N group studies (regular & mentor-led)
- `use-group-study-list-query.ts` — fetch groups with filtering
- `use-group-study-mutation.ts` — create, update, delete group studies
- `mission-api.ts` — mission CRUD
- `evaluation-api.ts` — evaluation operations
- `peer-review-api.ts` — peer review submissions
- `question-api.ts` — Q&A threads

**`queries/one-to-one/`** — 1:1 study modes (not group studies)
- `use-study-query.ts` — fetch single study detail
- `use-archive-query.ts` — archive entries
- `use-balance-game-query.ts` — balance game questions
- `use-interview-query.ts` — interview sessions
- `archive-keys.ts`, `balance-game-keys.ts` — query key constants

**`queries/user/`** — User profile, member lists
- `use-user-profile-query.ts` — current user info
- `use-member-study-list-query.ts` — user's enrolled studies
- `use-member-list-query.ts` — study member list

**`queries/payment/`** — Payment & settlement
- `payment-user-api.ts` — payment processing
- `refund-user-api.ts` — refund requests
- `settlement-user-api.ts`, `settlement-account-api.ts` — settlement queries

**`queries/admin/`** — Admin operations
- `admin-payment-api.ts`, `admin-refund-api.ts` — payment management
- `admin-settlement-api.ts` — settlement reconciliation
- `admin-matching-api.ts` — user/study matching

### Common/ Hooks

**Auth & Permissions:**
- `auth-hydration-context.tsx` — hydration context for auth state
- `use-auth.ts` — re-export from features/auth (auth context hook)

**Filtering & State:**
- `use-archive-filters.ts` — archive list filter state (category, tag, sort)
- `use-balance-game-filters.ts` — balance game filter state
- `use-study-list-filter.ts` — group study list filter state

**DOM & Scroll:**
- `use-debounce.ts` — debounce any value with delay
- `use-infinite-scroll.ts` — infinite scroll pagination handler
- `use-intersection-observer.ts` — viewport visibility detection
- `use-lazy-mount.ts` — defer component mount until visible

**Forms & Reminders:**
- `use-group-study-review-form.ts` — review form state & validation
- `use-group-study-review-reminder.ts` — prompt user to review
- `use-reminder-review.tsx` — general review reminder logic
- `reaction-logic.ts` — like/bookmark reaction handlers

## Dependencies

- **@tanstack/react-query** — server state management (useQuery, useMutation, useQueryClient)
- **@/api/client/open-api-instance** — OpenAPI client factory
- **@/api/openapi/*** — Auto-generated API types & services (DO NOT EDIT)
- **@/features/auth/model/** — Auth context & utilities
- **@/stores/** — Zustand global stores (toast, login modal, etc.)
- **react** — React hooks (useEffect, useState, useCallback)

### Anti-Patterns

❌ **Do not:**
- Manually edit files in `src/api/openapi/` (auto-generated)
- Create query hooks outside their domain directory
- Use `staleTime: 0` without a specific reason
- Call mutations without `onSuccess`/`onError` handlers in consuming components
- Return `undefined` from `queryFn` (use `notFound()` for 404s)
- Put business logic in API instance factories — keep them thin

<!-- MANUAL: -->
