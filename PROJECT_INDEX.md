# Project Index: study-platform-client (ZERO-ONE)

Generated: 2026-05-08

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
| Test Runner | Vitest 3 + Playwright (E2E) |

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (landing)/          # Public landing
│   │   └── class/          # Course landing
│   │       ├── [id]/       # Generic course detail
│   │       └── vibe-intro/ # 바이브 코딩 입문자 코스
│   │           ├── (learning)/
│   │           │   ├── home/         # Journey map page
│   │           │   ├── feed/         # Builder feed list
│   │           │   ├── feed/[id]/    # Feed detail
│   │           │   └── feed/write/   # Feed compose
│   │           ├── lesson/[id]/      # Lesson page (sidebar: Q&A, builder feed preview)
│   │           └── complete/         # Course completion
│   ├── (service)/          # Authenticated pages
│   │   ├── (my)/           # my-page, my-study, payment-management, mentoring-management, …
│   │   ├── group-study/    # Group study list & detail
│   │   ├── premium-study/  # MentorStudy (group study variant)
│   │   ├── mentoring/      # 1:1 Mentoring (separate domain)
│   │   ├── payment/        # Toss payment flow
│   │   ├── community/      # Community feed + Q&A
│   │   ├── insights/       # Blog/insights
│   │   ├── one-on-one/     # 1:1 study session
│   │   └── home/           # Authenticated home
│   ├── (admin)/            # Admin (ROLE_ADMIN JWT claim)
│   │   └── admin/{class,courses,detail,matching,mentoring,sales-management}/
│   └── api/                # API routes (clear-session, notify-user-by-email)
│
├── api/
│   ├── client/             # Axios instances + interceptors
│   ├── endpoints/          # Domain API call functions
│   └── openapi/            # ⚠️ AUTO-GENERATED from Swagger — DO NOT MODIFY
│
├── hooks/
│   ├── queries/            # TanStack Query hooks (domain-specific)
│   │   ├── course/         # Course/Lesson/BuilderFeed/Journey-map (vibe-intro)
│   │   ├── group-study/    # Group study core
│   │   ├── one-to-one/     # 1:1 study session, schedule, history
│   │   ├── admin/          # Admin queries
│   │   ├── auth/, payment/, user/
│   │   └── *.ts            # Shared (mission, evaluation, peer-review, notification, bank-search)
│   └── common/             # Shared utility hooks
│
├── components/
│   ├── common/{ui,layout,modals,cards,seo,analytics}/
│   ├── pages/              # Page-level composites
│   └── {admin,auth,group-study,mentoring,my-page,one-to-one,payment,forms}/
│
├── features/               # FSD-style modules
│   ├── auth/{model,server/middleware,ui}/
│   ├── community/{api,model,ui}/
│   ├── developer/{api,model,ui}/
│   ├── mentoring/{api,const,model,ui}/
│   ├── group-study/{model,ui}/
│   ├── home/{model}/
│   ├── study/one-to-one/
│   └── admin/{course-management,matching,mentoring}/
│
├── stores/                 # Zustand global state
├── config/                 # constants, query-client, sentry
├── utils/                  # error-handler, seo, ssr, server-cookie
└── types/{api,schemas,auth,community,developer,interview,matching,mentoring,one-to-one-study,schedule}/

e2e/                        # Playwright (group-study, support, fixtures)
docs/                       # bugfix-*, feature-*, Figma/, learnings/, fixes/
```

---

## Entry Points

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout (providers, fonts, GTM, Clarity) |
| `src/app/(landing)/page.tsx` | Public landing |
| `src/app/(service)/home/page.tsx` | Authenticated home |
| `src/app/(admin)/admin/page.tsx` | Admin dashboard |
| `src/middleware.ts` | Auth guard + token refresh (cookie) |
| `src/instrumentation.ts` | Sentry server/edge init |

---

## API Layer

### 1. Legacy Axios — `src/api/client/`
- `axios.ts` — baseURL `/api/v1/`, AUTH001 refresh queue
- `axios.server.ts` — server-side variant
- `axiosV2.ts` — V2 instance
- `auth-response-interceptor.ts`, `auth-session-recovery.ts`
- `api-error.ts`

### 2. OpenAPI Auto-generated — `src/api/openapi/` ⚠️ READ-ONLY
- Regenerated from `https://test-api.zeroone.it.kr/v3/api-docs`
- Bound via `src/api/client/open-api-instance.ts`

### 3. Domain Endpoints — `src/api/endpoints/`
`admin/`, `archive/`, `auth/`, `balance-game/`, `channel/`, `group-study/`, `group-study-application/`, `hall-of-fame/`, `interview/`, `participation/`, `review/`, `study-history/`, `user/`

### 4. TanStack Query Hooks — `src/hooks/queries/`

| Folder / File | Domain |
|---|---|
| `course/course-api.ts` | Course detail, curriculum, journey-map, lesson detail, retrospective (mock fallback), Q&A, builder feed (list/detail/preview/comments/like/report), my-feeds, stats |
| `group-study/use-group-study-list-query.ts` | Group study list |
| `study-query.ts`, `mission-api.ts`, `evaluation-api.ts`, `peer-review-api.ts` | Group study core |
| `payment-user-api.ts`, `refund-user-api.ts`, `settlement-*.ts` | Payment domain |
| `admin/admin-course-api.ts`, `admin-payment-api.ts`, `admin-refund-api.ts`, `admin-settlement-api.ts` | Admin |
| `one-to-one/use-*.ts` | 1:1 study (archive, balance-game, study, interview, schedule, hall-of-fame) |
| `auth/`, `user/`, `bank-search-api.ts` | Cross-cutting |

Add new hook scaffold: `yarn generate:api <swagger-api-title-name>`

---

## State Management

| Layer | Package | Location |
|-------|---------|----------|
| Server state | TanStack Query 5 (default `staleTime: 60s`) | `src/hooks/queries/` |
| Global client | Zustand 5 | `src/stores/` |
| Forms | React Hook Form + Zod | `src/types/schemas/` |

Stores: `useUserStore` (persist), `useLeaderStore`, `useToastStore`, `useLoginModalStore`, `usePhoneVerificationStore`, `useMentor*Store` (4 mentor stores)

---

## Types

| Location | Purpose |
|---|---|
| `src/types/api/*.types.ts` | Backend DTO types (course, group-study, mentoring, payment, …) |
| `src/types/schemas/*.schema.ts` | Zod schemas (form validation, must align with DTO — see `.claude/rules/schema-validation.md`) |
| `src/types/auth/domain.ts` | Auth domain types |
| `src/types/{community,developer,interview,matching,mentoring,one-to-one-study,schedule}/` | Domain-scoped types |

Notable: `course.types.ts` (lesson/journey/builder-feed/qna sidebar/stats), `group-study-review.types.ts`, `group-study.types.ts`

---

## Domain Entities (Critical Distinction)

| | Mentoring | MentorStudy (Premium Study) | Course (vibe-intro) |
|---|---|---|---|
| URL | `/mentoring/*` | `/premium-study/*` | `/class/vibe-intro/*` |
| API | `/api/v1/mentors` | `/api/v1/group-studies` | `/api/v1/courses`, `/lessons`, `/builder-feeds` |
| Feature dir | `src/features/mentoring/` | shared GroupStudy hooks | `src/hooks/queries/course/` |
| Nature | 1:1 consultation | 1:N group study variant | Self-paced lessons + builder feed |

---

## Error Handling

- Central: `src/utils/error-handler.ts` (`analyzeError`, `logError`)
- Mutation safety net: `src/config/query-client.ts` MutationCache.onError
  - `statusCode === 401` → `useLoginModalStore.open()` (no toast, no Sentry)
  - Otherwise → Toast + Sentry
- Boundaries: `src/app/(service)/error.tsx`, `(landing)/error.tsx`, `(admin)/error.tsx`, `global-error.tsx`
- Global modals: `<GlobalToast />`, `<GlobalLoginModal />` mounted in `(service)/layout.tsx`
- 401 vs 403 vs 400: AUTH001=401(modal), AUTH002=403(toast), AUTH004=400(refresh path only)

---

## Styling Conventions

- Tailwind CSS 4 with `@theme inline` in `src/app/global.css`
- **No arbitrary values** (`p-[4px]`, `w-[320px]`)
- **No base Tailwind scale** (`p-4`, `rounded-lg`, `text-sm`) — use project tokens (`p-200`, `rounded-150`, `font-designer-16r`)
- Class composition: `cn()` from `src/components/common/ui/(shadcn)/lib/utils.ts`
- SVG: `@svgr/webpack` → React component imports

---

## Auth Flow

1. OAuth (Kakao/Google) → server issues JWT access + refresh tokens
2. `accessToken` cookie (JS-accessible), `refresh_token` httpOnly
3. Interceptor: AUTH001 → refresh → retry (queue prevents duplicates)
4. Middleware validates server-side, redirects `/` if invalid

---

## Testing

- Unit: 22 `*.test.ts(x)` files in `src/`, run via `yarn test:unit` (Vitest)
- E2E: 1 spec under `e2e/group-study/`, Playwright vs staging (`https://test.zeroone.it.kr`)
- Auth-required E2E: tag `@auth`, CI runs `--grep-invert @auth`
- Re-capture auth: `yarn e2e:save-auth` → `e2e/fixtures/auth.json` (not committed)

---

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| next | 15.2.8 | App Router SSR |
| react | 19 | UI |
| @tanstack/react-query | 5 | Server state |
| zustand | 5 | Client state |
| axios | 1.9 | HTTP client |
| react-hook-form | 7 | Forms |
| zod | 4 | Validation |
| @sentry/nextjs | 10 | Error monitoring |
| @tiptap/react | 3 | Rich text editor |
| @tosspayments/tosspayments-sdk | 2 | Payments |
| framer-motion | 12 | Animations |
| tailwindcss | 4 | Styling |
| @biomejs/biome | 2.4.6 | Format + lint |
| vitest | 3 | Unit tests |
| @playwright/test | 1.51+ | E2E |

---

## Commands

```bash
yarn dev              # Turbopack dev server
yarn build            # Production build
yarn lint:fix         # ESLint auto-fix
yarn prettier:fix     # Biome format
yarn typecheck        # tsc --noEmit
yarn storybook        # Storybook (port 6006)
yarn test:unit        # Vitest
yarn e2e              # Playwright (staging)
yarn generate:api <name>  # Create query hook boilerplate
```

**Task completion gate (all 3):**
```bash
yarn lint:fix && yarn prettier:fix && yarn typecheck
```

---

## Environments

| Env | URL |
|-----|-----|
| Staging | `https://test.zeroone.it.kr` |
| Production | `https://www.zeroone.it.kr` |
| Backend Swagger | `https://test-api.zeroone.it.kr/swagger-ui/index.html` |

---

## Required Reading (`.claude/rules/`)

| File | Topic |
|---|---|
| `architecture.md` | Routing, API layer, state, auth flow |
| `domain-entities.md` | Mentoring vs MentorStudy distinction |
| `error-handling.md` | 401 modal, error codes, Sentry |
| `schema-validation.md` | Zod ↔ DTO alignment rules |
| `api-patterns.md` | TanStack Query patterns, query keys |
| `styling.md` | Tailwind tokens, no arbitrary values |
| `e2e-testing.md` | `@auth` tag, helpers, staging target |
| `figma-design.md` | Figma inspection rules |
| `backend-data-safety.md` | Optional fields, enum guards, React keys |
| `documentation-rules.md` | `/doc` invocation, bugfix-*.md / feature-*.md format |
