# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZERO-ONE은 매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼입니다.

## Development Commands

### Running the Application

```bash
yarn dev              # Start Next.js dev server with Turbopack
yarn build            # Production build
```

### Backend API Server (Docker)

```bash
yarn api:on           # Start backend API server
yarn api:off          # Stop backend API server
yarn api:logs         # View API server logs
```

### Code Quality

```bash
yarn lint             # Run ESLint check
yarn lint:fix         # Auto-fix ESLint issues
yarn prettier         # Run Prettier check
yarn prettier:fix     # Auto-format with Prettier
```

### Storybook

```bash
yarn storybook        # Start Storybook dev server (port 6006)
yarn build-storybook  # Build Storybook
yarn chromatic        # Deploy to Chromatic
```

### Testing

```bash
yarn test             # Run unit tests
yarn test:e2e         # Run E2E tests
```

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (landing)/           # Landing page
│   ├── (service)/           # Service pages
│   ├── (admin)/             # Admin pages
│   └── api/                 # API Routes
│
├── api/                      # Server communication layer
│   ├── client/              # axios instance, fetcher
│   │   ├── axios.ts
│   │   ├── axios.server.ts
│   │   └── cookie.ts
│   │
│   ├── openapi/             # OpenAPI Generator (future)
│   │   ├── models/          # API type definitions
│   │   └── services/        # API client functions
│   │
│   └── endpoints/           # Custom API wrappers (current)
│       ├── user.api.ts
│       ├── study.api.ts
│       ├── review.api.ts
│       └── admin.api.ts
│
├── stores/                   # Global state (Zustand)
│   ├── user.store.ts
│   ├── theme.store.ts
│   └── modal.store.ts
│
├── hooks/                    # React Hooks
│   ├── queries/             # TanStack Query hooks
│   │   ├── use-user-queries.ts
│   │   ├── use-study-queries.ts
│   │   ├── use-review-queries.ts
│   │   └── use-admin-queries.ts
│   │
│   └── common/              # Common custom hooks
│       ├── use-intersection-observer.ts
│       ├── use-debounce.ts
│       └── use-reminder-review.ts
│
├── components/               # UI components
│   ├── ui/                  # shadcn/ui atomic components (21+)
│   ├── layout/              # Layout components
│   │   ├── header.tsx
│   │   ├── sidebar/
│   │   └── footer.tsx
│   ├── cards/               # Card components
│   ├── modals/              # Modal components
│   ├── forms/               # Form components
│   ├── lists/               # List components
│   ├── calendars/           # Calendar components
│   └── admin/               # Admin-only components
│
├── utils/                    # Pure utility functions
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   ├── hash.ts
│   └── time.ts
│
├── config/                   # Configuration files
│   ├── constants.ts
│   ├── env.ts
│   ├── presets.ts
│   └── query-client.ts
│
├── providers/                # Context Providers
│   ├── index.tsx
│   └── query-provider.tsx
│
├── styles/                   # Styles
│   └── globals.css
│
└── types/                    # Type definitions
    ├── global.d.ts
    ├── ui.ts
    ├── form.ts
    │
    ├── schemas/             # Zod schemas (form validation)
    │   ├── user.ts
    │   ├── study.ts
    │   ├── review.ts
    │   └── admin.ts
    │
    └── api/                 # API response types
        ├── user.types.ts
        ├── study.types.ts
        └── review.types.ts
```

### Key Architectural Patterns

**Authentication Flow:**

- Token-based auth with access tokens (stored in cookies) and refresh tokens
- Middleware (`middleware.ts`) handles authentication for all routes except landing page (`/`)
- Access token validation and automatic refresh using refresh tokens
- Admin route protection via JWT role validation (`ROLE_ADMIN`)
- Failed requests are queued during token refresh to prevent race conditions

**API Layer:**

- Two axios instances: `axiosInstance` (JSON) and `axiosInstanceForMultipart` (file uploads)
- Both instances share interceptors for automatic token refresh on AUTH001 errors
- Token refresh queue prevents concurrent refresh attempts
- Base URL from `NEXT_PUBLIC_API_BASE_URL` environment variable

**Data Fetching:**

- TanStack Query (React Query) for server state management
- Query client configured in `src/config/query-client.ts` with 60s staleTime
- Separate query clients for server vs browser (SSR-safe)

**Routing:**

- Next.js 15 App Router with route groups:
  - `(landing)/` - Landing page (public)
  - `(service)/` - Main authenticated service pages
  - `(admin)/` - Admin-only pages
- Middleware protects all routes except `/` and handles redirect logic

## Import Path Conventions

Always use absolute imports with the `@/` alias (never relative paths):

```typescript
// ✅ Correct
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/cards/profile-card';
import { StudyList } from '@/components/lists/study-list';
import { useUserQueries } from '@/hooks/queries/use-user-queries';
import { UserAPI } from '@/api/endpoints/user.api';
import type { GetUserProfileResponse } from '@/types/api/user.types';
import { UserFormSchema } from '@/types/schemas/user';

// ❌ Wrong - never use relative paths
import { Button } from '../../components/ui/button';
```

## Type Management Strategy

**Type Definition Rules:**

| Type Category | Location | Description | Example |
|--------------|----------|-------------|---------|
| **API Response Types** | `types/api/*.types.ts` | Backend API response structure | GetUserProfileResponse |
| **Domain Types** | `types/domains/*.ts` | Business domain types | User, Study |
| **Zod Schemas** | `types/domains/*.ts` | Form validation schemas | UserFormSchema |
| **UI Types** | `types/ui.ts` | UI state, Props types | ButtonVariant, ModalState |
| **Form Types** | `types/form.ts` | Form-related types | FormState, ValidationError |
| **Component Props** | Component file internal | Component-specific Props | ProfileCardProps |

**Future Migration Plan:**
- API response types will be replaced by OpenAPI Generator (`api/openapi/models/`)
- Zod schemas will remain manually maintained for form validation

## Code Style & Linting

**ESLint Configuration:**

- Based on `@rushstack/eslint-config` with React profile
- TanStack Query rules enabled
- Import ordering enforced (external → internal → parent/sibling)
- Alphabetical import sorting (case-insensitive)
- Blank line required before return statements
- React version: 19

**Key Disabled Rules:**

- `@rushstack/typedef-var` - Variable type definitions not required
- `@typescript-eslint/naming-convention` - Naming patterns flexible
- `@typescript-eslint/typedef` - Type annotations not mandatory
- `@typescript-eslint/explicit-function-return-type` - Return types optional

**TypeScript Settings:**

- Strict mode enabled
- `strictNullChecks` and `strictFunctionTypes` disabled
- Path alias: `@/*` → `./src/*`
- Target: ES5, Module: ESNext

## State Management

**Zustand Stores** (`src/stores/`):

- Lightweight state management for global app state
- Separate stores per domain (user, theme, modal, etc.)

**TanStack Query:**

- Server state and data fetching
- Configured for SSR with separate browser/server clients
- Default staleTime: 60 seconds

## Adding New Features

### 1. Adding a New Component

Choose appropriate category (ui / layout / cards / modals / forms / lists / calendars / admin):

```bash
# Example: Add a new card component
touch src/components/cards/study-card.tsx
```

```tsx
// components/cards/study-card.tsx
'use client';

import { useStudyQueries } from '@/hooks/queries/use-study-queries';

export default function StudyCard() {
  const { data } = useStudyQueries.useInfiniteList();

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
}
```

### 2. Adding New API Hooks

Use the API code generator to create boilerplate:

```bash
# Generate API instance file
yarn generate:api bank-search-api

# This creates src/hooks/queries/bank-search-api.ts with:
# import { createApiInstance } from '@/api/client/open-api-instance';
# import { BankSearchApi } from '@/api/openapi';
# const bankSearchApi = createApiInstance(BankSearchApi);
```

Then add your query hooks:

```typescript
// src/hooks/queries/new-api.ts
import { createApiInstance } from '@/api/client/open-api-instance';
import { NewApi } from '@/api/openapi';

const newApi = createApiInstance(NewApi); // Auto-generated

export const useGetData = () => {
  return useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      const { data } = await newApi.getData();
      return data.content;
    },
  });
};
```

### 3. Adding New Types/Schemas

**API Response Types:**

```typescript
// types/api/study.types.ts
export interface GetStudyListResponse {
  content: Study[];
  totalPages: number;
  totalElements: number;
}

export interface Study {
  id: number;
  title: string;
  summary: string;
  maxMembersCount: number;
}
```

**Zod Schemas:**

```typescript
// types/schemas/study.ts
import { z } from 'zod';

export const StudyFormSchema = z.object({
  title: z.string().min(5, '제목은 5자 이상'),
  summary: z.string().max(200, '요약은 200자 이하'),
  maxMembersCount: z.number().min(2).max(10),
});

export type StudyFormData = z.infer<typeof StudyFormSchema>;
```

## Key Development Notes

1. **Backend API runs in Docker** - Must be in sibling directory `../study-platform-mvp/`
2. **Component Library** - Uses shadcn/ui (Radix UI primitives) with Tailwind CSS 4
3. **Turbopack** - Dev server uses Next.js Turbopack for faster builds
4. **Korean Language** - All user-facing content, comments, and commit messages are in Korean
5. **Git Branch** - Main branch is `develop` (not `main`), current work branch is `refactor/mission`
6. **OpenAPI Usage** - See `docs/openapi-usage.md` for detailed API client and environment setup

## Commit Convention

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 포맷팅, 세미콜론 누락 등
docs: 문서 수정
test: 테스트 코드
chore: 빌드 업무 수정, 패키지 매니저 수정
```

## Environment Configuration

Required environment variables (`.env`):

- `NEXT_PUBLIC_API_BASE_URL` - Backend API base URL

## Important Resources

### Communication & Collaboration
- **Discord**: [Online meeting channel](https://discord.com/channels/1139603309246828554/1384082110947655782)
- **Slack**: [Invitation link](https://join.slack.com/t/goodmorning-cs-study/shared_invite/zt-376x9ja4h-Ww6vbT3SfvsEZF~OPynswg)
- **Jira**: [Task management](https://code-zero-to-one.atlassian.net/jira/software/projects/QNRR/boards/4/timeline)

### Development Resources
- **GitHub (Frontend)**: [study-platform-client](https://github.com/code-zero-to-one/study-platform-client)
- **GitHub (Backend)**: [study-platform-mvp](https://github.com/code-zero-to-one/study-platform-mvp)
- **Notion (Design Docs)**: [Planning & Design](https://www.notion.so/gaan/13efbb391d7980cea50fc6864d60f4f7?p=1f4fbb391d79803e8ebbf4cc69e676b2&pm=s)
- **Backend Docs**: [API Documentation](https://www.notion.so/gaan/1c8d60669f1a47568edc8f960c6f8ac7?pvs=4)

### Design & UI
- **Figma**: [Design System & Ready for Dev](https://www.figma.com/files/team/1484794295279518167/project/355437950/zeros?fuid=1310644189038769508)
- **Storybook**: [Chromatic](https://www.chromatic.com/builds?appId=67fe01503649b6b099af8e4e)

### Deployment & Test Servers
- **Frontend Test**: [test.zeroone.it.kr](https://test.zeroone.it.kr) (develop branch auto-deploy)
- **Frontend Production**: https://www.zeroone.it.kr (planned)
- **Backend Test**: [test-api.zeroone.it.kr](https://test-api.zeroone.it.kr) (dev branch auto-deploy)
- **Backend Production**: https://api.zeroone.it.kr (main branch auto-deploy)
- **API Documentation**: [Swagger UI](http://test-api.zeroone.it.kr/swagger-ui/index.html)
