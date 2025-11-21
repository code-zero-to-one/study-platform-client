# ZERO-ONE 스터디 플랫폼

매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼

## 📁 프로젝트 구조

```
src/
├── app/                      # Next.js App Router
│   ├── (landing)/           # 랜딩 페이지
│   ├── (service)/           # 서비스 페이지
│   ├── (admin)/             # 관리자 페이지
│   └── api/                 # API Routes
│
├── api/                      # 서버 통신 레이어
│   ├── client/              # axios instance, fetcher
│   │   ├── axios.ts
│   │   ├── axios.server.ts
│   │   └── cookie.ts
│   │
│   ├── openapi/             # OpenAPI Generator 자동 생성 (추후)
│   │   ├── models/          # API 타입 정의
│   │   └── services/        # API 클라이언트 함수
│   │
│   └── endpoints/           # 커스텀 API 래퍼 (현재, 추후 openapi 대체 예정)
│       ├── user.api.ts      # 사용자 API
│       ├── study.api.ts     # 스터디 API
│       ├── review.api.ts    # 리뷰 API
│       └── admin.api.ts     # 관리자 API
│
├── stores/                   # 전역 상태 관리 (Zustand)
│   ├── user.store.ts        # 사용자 상태
│   ├── theme.store.ts       # 테마 설정
│   └── modal.store.ts       # 모달 상태
│
├── hooks/                    # React Hooks
│   ├── queries/             # TanStack Query 훅
│   │   ├── use-user-queries.ts
│   │   ├── use-study-queries.ts
│   │   ├── use-review-queries.ts
│   │   └── use-admin-queries.ts
│   │
│   └── common/              # 공통 커스텀 훅
│       ├── use-intersection-observer.ts
│       ├── use-debounce.ts
│       └── use-reminder-review.ts
│
├── components/               # UI 컴포넌트
│   ├── ui/                  # shadcn/ui 기반 Atomic 컴포넌트
│   │   ├── button/
│   │   ├── input/
│   │   ├── badge/
│   │   ├── avatar/
│   │   ├── modal/
│   │   └── ... (21개 shadcn 컴포넌트)
│   │
│   ├── layout/              # 레이아웃 컴포넌트
│   │   ├── header.tsx
│   │   ├── sidebar/
│   │   │   ├── home-sidebar.tsx
│   │   │   ├── my-page-sidebar.tsx
│   │   │   └── admin-sidebar.tsx
│   │   └── footer.tsx
│   │
│   ├── cards/               # 카드 컴포넌트
│   │   ├── profile-card.tsx
│   │   ├── study-card.tsx
│   │   ├── banner-card.tsx
│   │   └── feedback-card.tsx
│   │
│   ├── modals/              # 모달 컴포넌트
│   │   ├── study-review-modal.tsx
│   │   ├── user-profile-modal.tsx
│   │   ├── start-study-modal.tsx
│   │   └── keyword-review-modal.tsx
│   │
│   ├── forms/               # 폼 컴포넌트
│   │   └── landing-form.tsx
│   │
│   ├── lists/               # 리스트 컴포넌트
│   │   ├── study-list.tsx
│   │   ├── study-list-table.tsx
│   │   └── todo-list.tsx
│   │
│   ├── calendars/           # 캘린더 컴포넌트
│   │   └── calendar.tsx
│   │
│   └── admin/               # 관리자 전용 컴포넌트
│       ├── admin-sidebar.tsx
│       └── member-table.tsx
│
├── utils/                    # 순수 유틸리티 함수
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   ├── hash.ts
│   └── time.ts
│
├── config/                   # 설정 파일
│   ├── constants.ts         # 상수 정의
│   ├── env.ts               # 환경변수
│   ├── presets.ts           # 프리셋 설정
│   └── query-client.ts      # React Query 설정
│
├── providers/                # Context Providers
│   ├── index.tsx
│   └── query-provider.tsx
│
├── styles/                   # 스타일
│   └── globals.css
│
└── types/                    # 타입 정의
    ├── global.d.ts          # 글로벌 타입
    ├── ui.ts                # UI 관련 타입
    ├── form.ts              # Form 관련 타입
    │
    ├── schemas/             # Zod 스키마 (폼 검증용)
    │   ├── user.ts          # User Zod 스키마
    │   ├── study.ts         # Study Zod 스키마
    │   ├── review.ts        # Review Zod 스키마
    │   └── admin.ts         # Admin Zod 스키마
    │
    └── api/                 # API 응답 타입 (OpenAPI 생성될 때까지)
        ├── user.types.ts
        ├── study.types.ts
        └── review.types.ts
```

## 🚀 시작하기

### 개발 서버 실행

```bash
npm run dev
```

### 백엔드 API 서버 (Docker)

```bash
# API 서버 시작
npm run api:on

# API 서버 종료
npm run api:off

# 로그 확인
npm run api:logs
```

### 코드 품질

```bash
# ESLint 검사
npm run lint

# ESLint 자동 수정
npm run lint:fix

# Prettier 검사
npm run prettier

# Prettier 자동 포맷팅
npm run prettier:fix
```

## 📦 주요 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form**: React Hook Form + Zod
- **UI Components**: Radix UI + shadcn/ui

## 🔧 개발 가이드

### 새로운 컴포넌트 추가

1. **적절한 분류 선택** (ui / layout / common / features / admin)
2. **컴포넌트 파일 생성**:

   ```bash
   # features 컴포넌트 예시
   touch src/components/features/study-list.tsx

   # common 컴포넌트 예시
   mkdir -p src/components/common/profile-card
   touch src/components/common/profile-card/index.tsx
   ```

3. **컴포넌트 구현**:

   ```tsx
   // components/features/study-list.tsx
   'use client';

   import { useStudyQueries } from '@/hooks/queries/use-study-queries';
   import StudyCard from '@/components/common/study-card';

   export default function StudyList() {
     const { data } = useStudyQueries.useInfiniteList();

     return (
       <div>
         {data?.pages.map((page) =>
           page.items.map((study) => (
             <StudyCard key={study.id} study={study} />
           )),
         )}
       </div>
     );
   }
   ```

### 새로운 API 추가

1. **API 함수 작성** (`api/endpoints/`)

   ```typescript
   // api/endpoints/study.api.ts
   import { axiosInstance } from '@/api/client/axios';
   import type { Study } from '@/models/study.model';

   export const StudyAPI = {
     getList: async (): Promise<Study[]> => {
       const res = await axiosInstance.get('/studies');
       return res.data.content;
     },
   };
   ```

2. **Query Hook 추가** (`hooks/queries/`)

   ```typescript
   // hooks/queries/use-study-queries.ts
   import { useQuery } from '@tanstack/react-query';
   import { StudyAPI } from '@/api/endpoints/study.api';

   export const useStudyQueries = {
     useList: () =>
       useQuery({
         queryKey: ['study', 'list'],
         queryFn: StudyAPI.getList,
       }),
   };
   ```

3. **컴포넌트에서 사용**

   ```tsx
   import { useStudyQueries } from '@/hooks/queries/use-study-queries';

   export default function StudyList() {
     const { data: studies } = useStudyQueries.useList();
     return <div>{/* ... */}</div>;
   }
   ```

### 새로운 타입/스키마 추가

1. **API 응답 타입 정의** (`types/api/`)

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

2. **Zod 스키마 정의** (`types/schemas/`)

   ```typescript
   // types/schemas/study.ts
   import { z } from 'zod';

   // Zod 스키마 (폼 검증용)
   export const StudyFormSchema = z.object({
     title: z.string().min(5, '제목은 5자 이상'),
     summary: z.string().max(200, '요약은 200자 이하'),
     maxMembersCount: z.number().min(2).max(10),
   });

   export type StudyFormData = z.infer<typeof StudyFormSchema>;
   ```

### OpenAPI Generator 설정 (추후)

1. **패키지 설치**

   ```bash
   npm install --save-dev openapi-typescript-codegen
   ```

2. **package.json에 스크립트 추가**

   ```json
   {
     "scripts": {
       "generate:api": "openapi --input ./openapi.yaml --output ./src/api/openapi --client axios"
     }
   }
   ```

3. **타입 자동 생성**
   ```bash
   npm run generate:api
   ```

### 타입 정의 규칙

| 타입 종류          | 위치                   | 설명                 | 예시                       |
| ------------------ | ---------------------- | -------------------- | -------------------------- |
| **API 응답 타입**  | `types/api/*.types.ts` | 백엔드 API 응답 구조 | GetUserProfileResponse     |
| **도메인 타입**    | `types/domains/*.ts`   | 비즈니스 도메인 타입 | User, Study                |
| **Zod 스키마**     | `types/domains/*.ts`   | 폼 검증 스키마       | UserFormSchema             |
| **UI 타입**        | `types/ui.ts`          | UI 상태, Props 타입  | ButtonVariant, ModalState  |
| **Form 타입**      | `types/form.ts`        | 폼 관련 타입         | FormState, ValidationError |
| **컴포넌트 Props** | 컴포넌트 파일 내부     | 컴포넌트별 Props     | ProfileCardProps           |

**추후 OpenAPI 도입 시**:

- API 응답 타입: `api/openapi/models/` (자동 생성으로 대체)
- Zod 스키마: `types/schemas/` (수동 관리 유지)

### Import 경로 규칙

```typescript
// ✅ 올바른 import
import { Button } from '@/components/ui/button';
import { ProfileCard } from '@/components/common/profile-card';
import { StudyList } from '@/components/features/study-list';
import { useUserQueries } from '@/hooks/queries/use-user-queries';
import { UserAPI } from '@/api/endpoints/user.api';
import type { GetUserProfileResponse } from '@/types/api/user.types';
import { UserFormSchema } from '@/types/schemas/user';

// ❌ 잘못된 import (상대 경로 사용 금지)
import { Button } from '../../components/ui/button';
```

## 📝 커밋 컨벤션

```
feat: 새로운 기능 추가
fix: 버그 수정
refactor: 코드 리팩토링
style: 코드 포맷팅, 세미콜론 누락 등
docs: 문서 수정
test: 테스트 코드
chore: 빌드 업무 수정, 패키지 매니저 수정
```

## 🧪 테스트

```bash
# 단위 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

## 📚 Storybook

```bash
# 개발 서버
npm run storybook

# 빌드
npm run build-storybook

# Chromatic 배포
npm run chromatic
```
