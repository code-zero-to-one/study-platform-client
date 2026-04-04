# Project Index: ZERO-ONE Study Platform

Generated: 2026-04-04

## Overview

A 1:1 morning study platform to start every day together.
**Stack**: Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4
**Package Manager**: Yarn 1.22+ · Node.js >=20

---

## Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (landing)/              # Public landing page (/)
│   ├── (service)/              # Authenticated service pages
│   │   ├── (my)/               # My-page group
│   │   │   ├── my-page/        # My page main
│   │   │   ├── my-study/       # My studies (completed/not-completed)
│   │   │   ├── my-study-review/ # Review tabs (group/mentor/one-to-one)
│   │   │   ├── payment-management/
│   │   │   ├── settlement-management/
│   │   │   ├── mentoring-management/
│   │   │   └── notification/
│   │   ├── group-study/[id]/   # Group study detail
│   │   ├── premium-study/[id]/ # Mentor study detail
│   │   ├── mentoring/[id]/     # Mentoring detail
│   │   ├── insights/           # Blog / insights
│   │   ├── payment/[id]/       # Payment
│   │   └── application-list/[studyId]/
│   ├── (admin)/admin/          # Admin pages (ROLE_ADMIN)
│   └── api/                    # API Routes
│       ├── auth/clear-session/ # Session clear
│       └── notify-user-by-email/
├── api/
│   ├── client/                 # axios instances (axios.ts, axiosV2.ts, cookie.ts)
│   ├── endpoints/              # Domain API functions (group-study, archive, channel, ...)
│   └── openapi/                # Swagger auto-generated — DO NOT modify
├── components/
│   ├── common/
│   │   ├── ui/                 # Button, Modal, Avatar, Tabs, StarRatingInput, ...
│   │   ├── layout/             # Header, HomeHeader, MobileMenuDrawer, MySidebar
│   │   └── modals/             # GroupStudyReviewModal, GroupStudyFormModal, ...
│   ├── forms/                  # Form components (group-study-form, group-study-steps/*, sign-up-steps/*)
│   ├── pages/                  # Page-level composite components
│   └── [domain]/               # archive/, balance-game/, card/, section/, ...
├── features/                   # Domain feature modules (new pattern)
│   ├── auth/                   # Auth (model, server/middleware, ui)
│   ├── group-study/            # Group study markdown model + editor UI (added 2026-04)
│   ├── mentoring/              # Mentoring domain
│   ├── admin/                  # Admin (matching, mentoring)
│   ├── study/one-to-one/       # 1:1 study (schedule, history, discussion)
│   └── home/                   # Home search params
├── hooks/
│   ├── queries/                # TanStack Query hooks (per domain)
│   └── common/                 # Shared hooks (use-auth, use-group-study-review-form, ...)
├── stores/                     # Zustand global state
├── types/
│   ├── api/                    # API response types (*.types.ts)
│   ├── schemas/                # Zod form schemas
│   ├── auth/                   # Auth domain types
│   └── mentoring/              # Mentoring domain types
├── config/                     # Constants and config (query-client, sentry, *-const)
├── utils/                      # Utilities (error-handler, format, time, jwt, seo, markdown-content, ...)
└── middleware.ts               # Auth middleware (token validation + redirect)
```

---

## Entry Points

| Path | Role |
|---|---|
| `src/app/layout.tsx` | Root layout (Provider, Sentry init) |
| `src/middleware.ts` | Auth handling (accessToken validation, refresh, `/admin/*` guard) |
| `src/providers/index.tsx` | QueryClient, Zustand hydration, Toast |
| `src/instrumentation.ts` | Sentry server/edge initialization |

---

## Core Modules

### API Layer

| File | Role |
|---|---|
| `src/api/client/axios.ts` | Legacy axios (baseURL `/api/v1/`, AUTH001 refresh queue) |
| `src/api/client/axiosV2.ts` | V2 axios client |
| `src/api/endpoints/group-study/` | Group study CRUD endpoints (create, update, detail, list, apply, ...) |
| `src/api/openapi/` | Swagger auto-generated types/services — **DO NOT modify** |

### TanStack Query Hooks (`src/hooks/queries/`)

| File | Domain |
|---|---|
| `study-query.ts` | Base study queries |
| `group-study-review-api.ts` | Group study review CRUD + statistics |
| `group-study-member-api.ts` | Study member management |
| `group-study-homework-api.ts` | Study homework |
| `use-group-study-list-query.ts` | Group study list |
| `use-group-study-mutation.ts` | Group study create/update mutations |
| `use-group-study-notice-query.ts` | Group study notices |
| `mission-api.ts` | Mission create/read/submit |
| `evaluation-api.ts` | Evaluation |
| `peer-review-api.ts` | Peer review |
| `payment-user-api.ts` | Payment |
| `refund-user-api.ts` | Refund |
| `settlement-user-api.ts` | Settlement |
| `notification-api.ts` | Notifications |
| `use-auth.ts`, `use-auth-mutation.ts` | Auth queries/mutations |

### Group Study Feature (`src/features/group-study/`) — added 2026-04

| Path | Role |
|---|---|
| `model/group-study-markdown.ts` | Markdown image serialization (objectUrl → `@@filename@@` macro substitution) |
| `model/group-study-markdown.test.ts` | Unit tests for markdown model |
| `ui/group-study-markdown-editor.tsx` | Markdown editor UI for group study description |

### Global State (`src/stores/`)

| File | Role |
|---|---|
| `useUserStore.ts` | User info (persisted) |
| `useLeaderStore.ts` | Leader status |
| `use-toast-store.ts` | Toast global notifications |
| `use-phone-verification-store.ts` | Phone verification state |

### Auth Feature (`src/features/auth/`)

| Path | Role |
|---|---|
| `model/client-auth-sync.ts` | Client-side auth sync |
| `model/oauth-redirect-contract.ts` | OAuth redirect contract |
| `model/parse-oauth-redirect-result.ts` | OAuth redirect result parsing |
| `server/middleware/route-policy.ts` | Middleware route policy (refactored) |
| `ui/oauth-redirect-page-client.tsx` | OAuth redirect client UI |

### Error Handling

| File | Role |
|---|---|
| `src/utils/error-handler.ts` | `analyzeError()`, `logError()`, error code→message mapping (~40 codes) |
| `src/config/query-client.ts` | MutationCache global error handler |
| `src/config/sentry.ts` | Sentry config (DSN, environment detection, AUTH001 exclusion) |

### Markdown Utilities (`src/utils/markdown-content.ts`) — updated 2026-04

Includes `extractHtmlImageUrls`, `getFileExtension`, `normalizeMarkdownContent`.

---

## Configuration

| File | Purpose |
|---|---|
| `next.config.ts` | SVGR, Sentry, Bundle Analyzer |
| `tsconfig.json` | `@/*` → `./src/*` alias |
| `src/app/global.css` | `@theme inline` — project design tokens |
| `src/config/query-client.ts` | TanStack Query config (staleTime 60s) |
| `.env` | `NEXT_PUBLIC_API_BASE_URL`, OAuth keys, Toss, Sentry DSN |

---

## Documentation

| File | Content |
|---|---|
| `CLAUDE.md` | Full Claude Code guide (API patterns, conventions, error handling) |
| `docs/SENTRY_GUIDE.md` | Sentry integration guide |
| `docs/openapi-usage.md` | OpenAPI auto-generation usage |
| `docs/2026-03-26-markdown-editor/COMMON_MARKDOWN_EDITOR_USAGE.md` | Common markdown editor usage |
| `docs/2026-04-01-refactoring/` | AUTH middleware refactoring audit (200 propositions) |
| `docs/2026-03-15-login-fail-fix/` | OAuth redirect + middleware refactoring docs |

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | 15 | Framework |
| `react` | 19 | UI |
| `@tanstack/react-query` | - | Server state management |
| `zustand` | - | Global client state |
| `axios` | ^1.9 | HTTP client |
| `react-hook-form` + `zod` | - | Form state + validation |
| `@radix-ui/*` | - | UI primitives (Modal, Dialog, ...) |
| `@sentry/nextjs` | ^10 | Error monitoring |
| `@tosspayments/tosspayments-sdk` | - | Payments |
| `canvas-confetti` | ^1.9 | Study completion modal effect |
| `date-fns`, `dayjs` | - | Date handling |
| `@tiptap/react` | ^3 | Rich text / markdown editor |
| `class-variance-authority` | - | CVA component variants |

---

## Quick Start

```bash
yarn install          # Install dependencies
yarn dev              # Turbopack dev server
yarn build            # Production build
yarn typecheck        # TypeScript type check
yarn lint:fix         # ESLint auto-fix
yarn generate:api <name>  # Generate API hook boilerplate
```

---

## Constraints

- Never modify files under `src/api/openapi/` (auto-regenerated from Swagger)
- No Tailwind arbitrary values (`p-[4px]`) — use custom tokens from `global.css`
- Never fabricate API endpoints that don't exist
- No `alert()` — use `useToastStore`
- Never expose stack traces to users in production
- `features/`-based and `components/`/`hooks/queries/` structures coexist — do not mix within a single PR
