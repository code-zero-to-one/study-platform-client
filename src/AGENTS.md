<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-06-06 -->

# src/

## Purpose
All application source code for the ZERO-ONE study platform. Organized into 14 modules. Target architecture is the **type-based structure** (`components/`, `hooks/`, `types/`, `api/`); `features/` is frozen legacy being migrated incrementally per domain. The two patterns must not be mixed within a single PR.

## Key Files

| File | Description |
|------|-------------|
| `middleware.ts` | Auth middleware — validates `accessToken` cookie, auto-refreshes via `/api/v1/auth/access-token/refresh`, redirects to `/` on failure, blocks `/admin/*` for non-admins |
| `middleware.test.ts` | Unit tests for middleware auth logic |
| `instrumentation.ts` | Next.js instrumentation hook — initializes Sentry for server and edge runtimes |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `api/` | API client layer: Axios instances, auth interceptors, OpenAPI auto-generated types, endpoint functions (see `api/AGENTS.md`) |
| `app/` | Next.js App Router — route groups `(admin)/`, `(landing)/`, `(service)/`, root layouts, global CSS, error/not-found boundaries (see `app/AGENTS.md`) |
| `components/` | React components — `common/ui/` (30+ shadcn-based), domain-specific by feature (see `components/AGENTS.md`) |
| `features/` | Feature modules with layered architecture: `api/`, `model/`, `ui/`, `server/` per feature (see `features/AGENTS.md`) |
| `types/` | TypeScript type definitions organized by domain — never auto-modified (see `types/AGENTS.md`) |
| `hooks/` | Custom React hooks — `common/` (13 general), `queries/` (TanStack Query per domain) (see `hooks/AGENTS.md`) |
| `config/` | App-wide constants, feature flags, Sentry init, TanStack Query client config (see `config/AGENTS.md`) |
| `utils/` | Pure utility functions — error handling, formatting, SEO, time, markdown processing (see `utils/AGENTS.md`) |
| `stores/` | Zustand global state stores — user, toast, leader, mentoring management (see `stores/AGENTS.md`) |
| `providers/` | React context providers — main app provider, TanStack Query provider (see `providers/AGENTS.md`) |
| `lib/` | Rich text editor utilities, countdown logic |
| `mocks/` | Mock data for development and testing |
| `test/` | Shared test utilities and setup |
| `stories/` | Storybook component stories |

## For AI Agents

### Working In This Directory
- **Two API patterns coexist**: Legacy Axios (`api/client/axios.ts`) for custom endpoints; OpenAPI auto-generated (`api/openapi/`) for typed services. Never modify `api/openapi/` files.
- **Verify endpoints before using**: Check `hooks/queries/` and `api/endpoints/` — never fabricate API calls
- **Import alias**: Always use `@/*` (e.g., `@/components/common/ui/button`) — never relative `../../`
- **Features vs Components**: New code goes in type-based layers — `components/<domain>/`, `hooks/queries/<domain>/`, `types/<domain>/`, `api/endpoints/<domain>/`. `features/` is frozen legacy: no new files, migrate one domain per PR. Shared UI goes in `components/common/`. Don't mix structures in a single PR.

### Testing Requirements
```bash
yarn lint:fix && yarn prettier:fix && yarn typecheck
```

### Common Patterns
- Server Components in `app/` route segments fetch data directly via `api/endpoints/*.server.ts`
- Client Components use TanStack Query hooks from `hooks/queries/`
- All errors handled via `utils/error-handler.ts` — never `alert()`, always `useToastStore`
- Global error boundaries: `app/(service)/error.tsx`, `app/(landing)/error.tsx`, `app/(admin)/error.tsx`

## Dependencies

### Internal
- All modules cross-reference — `components/` use `hooks/`, `utils/`, `stores/`, `config/`

### External
- `@tanstack/react-query` — server state
- `zustand` — client state
- `axios` — HTTP
- `tailwindcss` — styling
- `zod` + `react-hook-form` — form validation

<!-- MANUAL: -->
