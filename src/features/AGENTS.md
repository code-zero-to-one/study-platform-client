<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-06-06 -->

# features/

## Purpose

Container for **feature modules** — self-contained domain bundles that group related API, business logic (models), and UI components together.

Each feature encapsulates a distinct business domain (auth, mentoring, group study, developer registration, etc.) with a **layered architecture** that separates concerns: API communication, query/mutation hooks (TanStack Query), controller logic, and UI rendering.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `admin/` | Admin-only features (matching, mentoring admin panels) |
| `auth/` | Authentication & OAuth handling (login, redirect, session management) |
| `community/` | Community discussion & forum features |
| `developer/` | Developer registration & profile management |
| `group-study/` | Group study listing, detail, and metadata |
| `home/` | Home page & landing page features |
| `mentoring/` | 1:1 mentoring (apply, directory, profile) |
| `study/` | 1:1 individual study features (one-to-one: schedule, history, discussions) |

## Architecture Layers

Each feature uses a **layered architecture** with these optional subdirectories:

### `api/` — API Communication Layer
- **Legacy axios pattern**: Direct axios function calls to backend endpoints using `axiosInstance`
- File naming: `{domain}-api.ts` (client-side) and `{domain}-api.server.ts` (server-side)
- Responsibility: HTTP requests, response parsing (Zod schemas), and type transformation
- Example: `mentoring/api/`, `developer/api/`, `community/api/`

```typescript
// Sample: developer/api/developer-registration-api.ts
import { axiosInstance } from '@/api/client/axios';

export const getMyDeveloperRegistration = async () => {
  const response = await axiosInstance.get('/developers/me');
  return parseDeveloperRegistrationResponse(response.data);
};
```

### `model/` — Business Logic Layer
- **TanStack Query hooks**: `useQuery()` for reads, `useMutation()` for writes
- **Controller hooks**: App-specific orchestration logic (`use*Controller.ts`)
- **Search params**: Route-level state management (`*-search-params.ts`)
- File naming: `use-{domain}-query.ts`, `use-{domain}-controller.ts`
- Responsibility: Query key definitions, data fetching, state mutations, validation
- Example: `mentoring/model/`, `developer/model/`, `home/model/`

```typescript
// Sample: developer/model/use-developer-registration-query.ts
export const developerRegistrationQueryKeys = {
  all: ['developer-registration'] as const,
  me: () => [...developerRegistrationQueryKeys.all, 'me'] as const,
};

export const useMyDeveloperRegistrationQuery = () => {
  return useQuery({
    queryKey: developerRegistrationQueryKeys.me(),
    queryFn: getMyDeveloperRegistration,
    staleTime: 60_000,
  });
};
```

### `ui/` — UI/Presentation Layer
- **Page components** (`*-page.tsx`): Orchestrate hooks, compose child components
- **View components** (`*-page-view.tsx`): Pure presentation (props-driven, no hooks)
- **Subcomponents** (`*.tsx`): Domain-specific UI (modals, cards, forms)
- **Route-level components** (`*-route.tsx`, `*-route-client.tsx`): Route segment wrappers
- File naming follows domain structure under `ui/{domain}/`
- Responsibility: UI rendering, event handlers, user interactions
- Example: `mentoring/ui/apply/`, `developer/ui/registration/`

```typescript
// Sample: mentoring/ui/apply/mentoring-apply-page.tsx (container)
'use client';
export default function MentoringApplyPage({ mentor, selectedMethod }) {
  const controller = useMentoringApplyController({ mentor, selectedMethod });
  return <MentoringApplyPageView controller={controller} />;
}

// Sample: mentoring/ui/apply/mentoring-apply-page-view.tsx (view)
export default function MentoringApplyPageView({ controller, ... }) {
  // Pure presentation, no hooks
  return <form>{/* render UI */}</form>;
}
```

### `server/` — Server-Side Logic Layer
- **Middleware**: Auth validation, session management (`middleware/`)
- **Server components**: Data fetching, pre-rendering (`pages/`)
- **API routes**: Server actions, RPC handlers (`routes/`)
- File naming: `*.test.ts` for tests, `route-actions.ts`, `route-handlers.ts`
- Responsibility: Server-only operations, security validation, SSR data fetching
- Example: `auth/server/`

```typescript
// Sample: auth/server/middleware/route-actions.ts
// Handles auth header sanitization, token validation
```

### `const/` — Constants & Configuration
- **Domain-specific enums and constants** (labels, dropdown options, etc.)
- File naming: `*.const.ts`
- Responsibility: Reusable constant definitions for a feature
- Example: `mentoring/const/`

### Other Subdirectories (Feature-Specific)
- `admin/{matching,mentoring}/` — Admin-only sub-features
- `study/one-to-one/` — Nested 1:1 study sub-features

---

## For AI Agents

### Working In This Directory

1. **`features/` is frozen legacy — do NOT add new files here**
   - New code goes in the type-based layers: `components/<domain>/`, `hooks/queries/<domain>/`, `types/<domain>/`, `api/endpoints/<domain>/`
   - Existing `features/` code is migrated incrementally, one domain per PR
   - Never mix migration and feature work in the same PR; never move code between structures without user approval

2. **File naming conventions**
   - API: `{domain}-api.ts` (client), `{domain}-api.server.ts` (server)
   - Queries/mutations: `use-{domain}-query.ts`
   - Controllers: `use-{domain}-controller.ts`
   - Pages: `{domain}-page.tsx` (container), `{domain}-page-view.tsx` (view)
   - Views: `{domain}-{variant}.tsx`

3. **Import paths**
   - From api layer: `@/features/{feature}/api/`
   - From model layer: `@/features/{feature}/model/`
   - From ui layer: `@/features/{feature}/ui/`
   - Use the `@/*` alias (maps to `./src/*`)

4. **Layer responsibilities are strict**
   - **api/**: HTTP only. No business logic, no React hooks.
   - **model/**: TanStack Query hooks + controller logic. No UI/JSX.
   - **ui/**: React components only. Import from model/ for state.
   - **server/**: Next.js server-side code only. No client-side hooks.

5. **Legacy axios pattern** (for existing code only)
   - New API integrations should use OpenAPI generation (`yarn generate:api`)
   - For custom endpoints only: write axios functions in `features/<domain>/api/`
   - Always export async functions (not hooks) from api layer

### Common Patterns

#### Feature Module Layout (legacy reference — do NOT create new feature modules)

```
features/my-feature/
  api/
    my-feature-api.ts         # axios functions
    my-feature-api.server.ts  # SSR data loading
  model/
    use-my-feature-query.ts   # TanStack Query hooks
    use-my-feature-controller.ts  # business logic
  ui/
    my-feature-page.tsx       # container (with hooks)
    my-feature-page-view.tsx  # view (pure presentation)
    components/
      my-feature-card.tsx     # subcomponent
      my-feature-modal.tsx    # modal variant
  const/
    my-feature.const.ts       # domain constants
```

#### Minimal Feature (UI + Model Only)

```
features/simple-feature/
  model/
    use-simple-feature-query.ts  # hooks only
  ui/
    simple-feature-page.tsx
    simple-feature-page-view.tsx
```

#### Using Feature APIs in Components

```typescript
// components/pages/my-page.tsx (outside features)
'use client';

import { useMyFeatureQuery } from '@/features/my-feature/model/use-my-feature-query';
import MyFeatureSection from '@/features/my-feature/ui/my-feature-section';

export default function MyPage() {
  const { data } = useMyFeatureQuery();
  return <MyFeatureSection data={data} />;
}
```

#### Query Key Strategy (Mandatory)

```typescript
// model/use-mentoring-query.ts
export const mentoringQueryKeys = {
  all: ['mentoring'] as const,
  directory: () => [...mentoringQueryKeys.all, 'directory'] as const,
  directoryFiltered: (filters: FilterParams) => [
    ...mentoringQueryKeys.directory(),
    filters,
  ] as const,
  detail: (id: number) => [...mentoringQueryKeys.all, 'detail', id] as const,
  myApplications: () => [...mentoringQueryKeys.all, 'my-applications'] as const,
};

// Always invalidate parent keys on mutations
onSuccess: async (_, variables) => {
  await queryClient.invalidateQueries({
    queryKey: mentoringQueryKeys.directory(),
  });
},
```

#### Server-Side Data Loading

```typescript
// api/my-feature-api.server.ts
export const getMyFeatureDetail = async (id: number) => {
  const response = await fetch(`/api/v1/my-feature/${id}`);
  // or axiosInstance.get() if using legacy axios
  return parseResponse(response.data);
};

// app/(service)/my-feature/[id]/page.tsx (Server Component)
import { getMyFeatureDetail } from '@/features/my-feature/api/my-feature-api.server';

export default async function Page({ params }) {
  const data = await getMyFeatureDetail(params.id);
  return <MyFeaturePageView data={data} />;
}
```

---

## Dependencies

### Internal Dependencies
- Query hooks depend on API functions (`model/ → api/`)
- UI components depend on query hooks (`ui/ → model/`)
- Server code is independent but may call api/ functions

### External Dependencies
- `@tanstack/react-query` — query/mutation state management
- `@/api/client/axios` — legacy HTTP client (for api/ layer)
- `@/types/` — shared domain types (across all features)
- `@/stores/` — Zustand global state (when needed)
- `@/utils/error-handler.ts` — centralized error handling
- `react-hook-form` + `zod` — form validation (in model/ controllers)

### No Cross-Feature Dependencies
- Features should NOT import from other features
- Share types via `@/types/` instead
- Share utilities via `@/utils/` instead

---

## Migration to Type-Based Structure

The target architecture is the **type-based structure** (`src/components/`, `src/hooks/queries/`, `src/types/`, `src/api/`). `features/` is **frozen legacy** and is dismantled incrementally, one domain at a time.

- **New code**: Use type-based layers — `components/<domain>/`, `hooks/queries/<domain>/`, `types/<domain>/`, `api/endpoints/<domain>/`
- **Legacy code**: Remains in `features/` until its domain is migrated (do not add new files)
- **Mixing**: Never in the same PR — migrate exactly one domain per PR
- **Migration example** (`features/home`, 2026-06): pure utils in `model/` → `src/utils/`, hooks → `src/hooks/`, UI → `src/components/<domain>/`

---

<!-- MANUAL: -->
