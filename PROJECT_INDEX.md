# Project Index: study-platform-client (ZERO-ONE)

Generated: 2026-04-18

---

## Project Overview

A 1:1 morning study platform to start every day together.

| | |
|---|---|
| Framework | Next.js 15.2.8 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4 |
| Package Manager | Yarn 1.22+ (Node >= 20) |
| Formatter | Biome 2.4.6 |
| Test Runner | Vitest 3 |

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router (routes)
│   ├── (landing)/          # Public landing page (/)
│   ├── (service)/          # Authenticated service pages
│   │   ├── (my)/           # My-page group (my-page, my-study, payment-management, etc.)
│   │   ├── group-study/    # Group study list & detail
│   │   ├── premium-study/  # MentorStudy (group study variant)
│   │   ├── mentoring/      # 1:1 Mentoring (separate domain)
│   │   ├── payment/        # Payment flow
│   │   ├── inquiry/        # Inquiry (Q&A) detail
│   │   ├── community/      # Community feed + Q&A posts
│   │   ├── insights/       # Blog/insights
│   │   ├── developer-registration/ # Developer profile registration
│   │   ├── one-on-one/     # 1:1 study session page
│   │   └── home/           # Home dashboard
│   ├── (admin)/            # Admin pages (ROLE_ADMIN JWT claim)
│   │   └── admin/          # admin/detail, admin/matching, admin/mentoring, admin/sales-management
│   └── api/                # API routes (clear-session, notify-user-by-email)
│
├── api/                    # API layer
│   ├── client/             # Axios instances + interceptors
│   ├── endpoints/          # Domain-specific API call functions
│   └── openapi/            # ⚠️ AUTO-GENERATED from Swagger — DO NOT MODIFY
│
├── hooks/
│   ├── queries/            # TanStack Query hooks (domain-specific)
│   └── common/             # Shared utility hooks
│
├── components/
│   ├── common/
│   │   ├── ui/             # Design system (Button, Badge, Dialog, Toast, etc.)
│   │   ├── modals/         # Shared modal components
│   │   └── layout/         # Header, AdminSideBar, nav
│   ├── pages/              # Page-level composite components
│   └── [domain]/           # Domain composites (admin, archive, balance-game, calendars, etc.)
│
├── features/               # FSD-style feature modules (coexists with components/)
│   ├── auth/               # OAuth redirect, middleware route decisions, client-auth-sync
│   │   ├── model/          # Auth session, cookie, hydration, route guards
│   │   └── server/middleware/ # route-actions, route-decisions, route-handlers, route-session
│   ├── community/          # Community feed + Q&A (model + ui + api types)
│   ├── developer/          # Developer registration (api + model + ui)
│   ├── home/               # Home page search params
│   ├── mentoring/          # Mentor directory, registration, apply, note-consultation
│   └── admin/
│       ├── matching/       # Admin matching system
│       └── mentoring/      # Admin mentoring management
│
├── stores/                 # Zustand global state
├── config/                 # App constants, query-client, sentry config
├── utils/                  # Utility functions (error-handler, seo, ssr, server-cookie)
└── types/                  # TypeScript types & Zod schemas
```

---

## Entry Points

| File | Purpose |
|------|---------|
| `src/app/(landing)/page.tsx` | Public landing page root |
| `src/app/(service)/home/page.tsx` | Authenticated home |
| `src/app/(admin)/admin/page.tsx` | Admin dashboard |
| `src/middleware.ts` | Auth guard + token refresh (cookie-based) |
| `src/instrumentation.ts` | Sentry server/edge init |

---

## API Layer

### 1. Legacy Axios (custom endpoints)
- Instance: `src/api/client/axios.ts` (baseURL `/api/v1/`)
- Server-side variant: `src/api/client/axios.server.ts`
- V2 instance: `src/api/client/axiosV2.ts`
- Auth interceptor: `src/api/client/auth-response-interceptor.ts` (AUTH001 → refresh queue)
- Error type: `src/api/client/api-error.ts`

### 2. OpenAPI Auto-generated (`src/api/openapi/`) ⚠️ READ ONLY
- Regenerated via backend Swagger: `https://test-api.zeroone.it.kr/v3/api-docs`
- Never manually edit files in this directory
- Referenced by `src/api/client/open-api-instance.ts`

### 3. Domain Endpoints (`src/api/endpoints/`)
Organized by domain: `group-study/`, `auth/`, `archive/`, `balance-game/`, `channel/`, `hall-of-fame/`, `user/`, `review/`, etc.

### 4. TanStack Query Hooks (`src/hooks/queries/`)
| Hook File | Domain |
|-----------|--------|
| `study-query.ts` | Group study core |
| `mission-api.ts` | Mission CRUD |
| `group-study-homework-api.ts` | Homework |
| `evaluation-api.ts` | Evaluations |
| `peer-review-api.ts` | Peer reviews |
| `payment-user-api.ts` | User payments |
| `refund-user-api.ts` | User refunds |
| `settlement-account-api.ts` | Settlement accounts |
| `settlement-user-api.ts` | User settlements |
| `admin-payment-api.ts` | Admin payments |
| `admin-refund-api.ts` | Admin refunds |
| `admin-settlement-api.ts` | Admin settlements |
| `question-api.ts` | Q&A / Inquiry |
| `notification-api.ts` | Notifications |
| `bank-search-api.ts` | Bank search |
| `archive-index.ts` | Archive queries |
| `balance-game-index.ts` | Balance game |
| `one-to-one/use-archive-query.ts` | 1:1 archive |
| `one-to-one/use-balance-game-query.ts` | 1:1 balance game |
| `one-to-one/use-study-query.ts` | 1:1 study session |
| `one-to-one/use-interview-query.ts` | 1:1 interview |
| `one-to-one/use-schedule-query.ts` | 1:1 schedule |
| `one-to-one/use-hall-of-fame-query.ts` | Hall of fame |

---

## State Management

| Layer | Package | Location |
|-------|---------|----------|
| Server state | TanStack Query 5 | `src/hooks/queries/` |
| Global client state | Zustand 5 | `src/stores/` |
| Form state | React Hook Form + Zod | `src/types/schemas/` |

Key Zustand stores: `useUserStore` (persist), `useLeaderStore`, `useToastStore`

Default TanStack Query `staleTime`: 60 seconds

---

## Domain Entities (Critical Distinction)

| | Mentoring | MentorStudy (Premium Study) |
|---|---|---|
| URL | `/mentoring/*` | `/premium-study/*` |
| API | `/api/v1/mentors` | `/api/v1/group-studies` |
| Feature dir | `src/features/mentoring/` | — (shared GroupStudy hooks) |
| Nature | 1:1 consultation | 1:N group study variant |

---

## Error Handling

- Central handler: `src/utils/error-handler.ts` (`analyzeError`, `logError`)
- Global mutation fallback: `src/config/query-client.ts` (MutationCache.onError → Toast + Sentry)
- Error boundaries: `src/app/(service)/error.tsx`, `(landing)/error.tsx`, `(admin)/error.tsx`
- Root boundary: `src/app/global-error.tsx`
- Toast: `useToastStore.showToast()` — never use `alert()`

---

## Styling Conventions

- Tailwind CSS 4 with `@theme inline` in `src/app/global.css`
- **No arbitrary values** (`p-[4px]`, `w-[320px]`)
- **No base Tailwind scale** (`p-4`, `rounded-lg`, `text-sm`) — use project tokens only
- Class composition: always use `cn()` from `src/components/common/ui/(shadcn)/lib/utils.ts`
- SVG: imported as React components via `@svgr/webpack`

---

## Auth Flow

1. OAuth (Kakao/Google) → server issues JWT access + refresh tokens
2. `accessToken` in cookie (JS-accessible), `refresh_token` in httpOnly cookie
3. Interceptor: AUTH001 → token refresh → retry (queue prevents duplicates)
4. Middleware: validates token server-side, redirects `/` if invalid

---

## Key Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| next | 15.2.8 | App Router SSR framework |
| react | 19 | UI layer |
| @tanstack/react-query | 5 | Server state management |
| zustand | 5 | Client state |
| axios | 1.9 | HTTP client |
| react-hook-form | 7 | Form state |
| zod | 4 | Schema validation |
| @sentry/nextjs | 10 | Error monitoring |
| @tiptap/react | 3 | Rich text editor |
| @tosspayments/tosspayments-sdk | 2 | Payment integration |
| framer-motion | 12 | Animations |
| tailwindcss | 4 | Styling |
| @biomejs/biome | 2.4.6 | Format + lint |
| vitest | 3 | Unit testing |

---

## Commands

```bash
yarn dev              # Turbopack dev server
yarn build            # Production build
yarn lint:fix         # ESLint auto-fix
yarn prettier:fix     # Biome format
yarn typecheck        # tsc --noEmit
yarn storybook        # Storybook (port 6006)
yarn generate:api <name>  # Generate API query hook boilerplate
yarn test:unit        # Vitest unit tests
```

**Task completion criteria (all 3 must pass):**
```bash
yarn lint:fix && yarn prettier:fix && yarn typecheck
```


## Environments

| Env | URL |
|-----|-----|
| Staging | `https://test.zeroone.it.kr` |
| Production | `https://www.zeroone.it.kr` |
| Backend Swagger | `https://test-api.zeroone.it.kr/swagger-ui/index.html` |

