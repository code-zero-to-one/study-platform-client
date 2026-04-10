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
│   │   ├── admin-payment-api.ts
│   │   ├── admin-refund-api.ts
│   │   ├── bank-search-api.ts
│   │   └── evaluation-api.ts
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
```

## 🚀 시작하기

### 개발 서버 실행

```bash
yarn run dev
```

### 코드 품질

```bash
# ESLint 검사
yarn run lint

# ESLint 자동 수정
yarn run lint:fix

# Prettier 검사
yarn run prettier

# Prettier 자동 포맷팅
yarn run prettier:fix
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

### OpenAPI 사용 가이드

OpenAPI Generator로 생성된 클라이언트 사용법과 환경변수 설정은 다음 문서를 참고하세요:

- [docs/openapi-usage.md](docs/openapi-usage.md)

### 새로운 API 추가

1. **새 파일 생성**

`src/hooks/queries` 디렉토리에 새로운 파일이 생성되면 자동으로 API 인스턴스 보일러플레이트 코드를 추가하는 코드 제너레이터를 사용해줍니다.

```bash
yarn generate:api bank-search-api
```

swagger에서 api 타이틀 이름이 bank search라면 셸에 위와 같은 명령어를 쳐주세요.

<img width="1452" height="135" alt="스크린샷 2026-01-05 오전 12 47 35" src="https://github.com/user-attachments/assets/4cfba002-ab6b-4b60-b048-554653e6dcc1" />

이 명령어는 `src/hooks/queries/bank-search-api.ts` 파일을 생성하고 자동으로 보일러플레이트 코드를 추가합니다.

```typescript
import { createApiInstance } from '@/api/client/open-api-instance';
import { BankSearchApi } from '@/api/openapi';

const bankSearchApi = createApiInstance(BankSearchApi);
```

여러 파일 동시 생성도 가능합니다.

```bash
yarn generate:api payment-api settlement-api user-api
```

2. **hook 작성**

파일을 만들었다면 hook을 작성해주세요.

```typescript
// src/hooks/queries/bank-search-api.ts
import { useQuery } from '@tanstack/react-query';
import { createApiInstance } from '@/api/client/open-api-instance';
import { BankSearchApi } from '@/api/openapi';

const bankSearchApi = createApiInstance(BankSearchApi);

// 훅 작성
export const useSearchBanks = () => {
  return useQuery({
    queryKey: ['bankSearch'],
    queryFn: async () => {
      const { data } = await bankSearchApi.getBanks();

      return data.content;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
```

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

### 새로운 타입/스키마 추가

1. **Zod 스키마 정의** (`types/schemas/`)

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

## 📚 Storybook

```bash
# 개발 서버
yarn run storybook

# 빌드
yarn run build-storybook

# Chromatic 배포
yarn run chromatic
```

---

## 🔗 주요 리소스 및 링크

### 📌 커뮤니케이션 & 협업

| 플랫폼      | 링크                                                                                                         | 용도                              |
| ----------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------- |
| **Discord** | [온라인 회의 채널](https://discord.com/channels/1139603309246828554/1384082110947655782)                     | 온라인 회의 장소 (전체)           |
| **Slack**   | [초대 링크](https://join.slack.com/t/goodmorning-cs-study/shared_invite/zt-376x9ja4h-Ww6vbT3SfvsEZF~OPynswg) | 커뮤니케이션 전반, 회의 요약 공유 |
| **Jira**    | [작업 관리](https://code-zero-to-one.atlassian.net/jira/software/projects/QNRR/boards/4/timeline)            | 작업 일정 및 이슈 관리            |

### 💻 개발 리소스

| 리소스                  | 링크                                                                                                               | 용도                       |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------ | -------------------------- |
| **Github (프론트엔드)** | [study-platform-client](https://github.com/code-zero-to-one/study-platform-client/discussions)                     | 코드 저장소, PR, 코드리뷰  |
| **Github (백엔드)**     | [study-platform-mvp](https://github.com/code-zero-to-one/study-platform-mvp/discussions)                           | 백엔드 API 저장소          |
| **Notion (설계문서)**   | [기획 & 설계](https://www.notion.so/gaan/13efbb391d7980cea50fc6864d60f4f7?p=1f4fbb391d79803e8ebbf4cc69e676b2&pm=s) | 화면정의, 기능명세, ERD 등 |
| **Backend 개발문서**    | [Notion](https://www.notion.so/gaan/1c8d60669f1a47568edc8f960c6f8ac7?pvs=4)                                        | API 문서 / 개발 가이드     |

### 🎨 디자인 & UI

| 리소스        | 링크                                                                                                                                   | 용도                         |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **Figma**     | [Design System & Ready for Dev](https://www.figma.com/files/team/1484794295279518167/project/355437950/zeros?fuid=1310644189038769508) | 디자인 시스템, 개발용 가이드 |
| **Storybook** | [Chromatic](https://www.chromatic.com/builds?appId=67fe01503649b6b099af8e4e)                                                           | 프론트 컴포넌트 확인 페이지  |

### 🚀 배포 & 테스트 서버

| 환경                       | 링크                                                              | 상태                     |
| -------------------------- | ----------------------------------------------------------------- | ------------------------ |
| **프론트 테스트**          | [test.zeroone.it.kr](https://test.zeroone.it.kr)                  | develop 브랜치 자동 배포 |
| **프론트 운영**            | https://www.zeroone.it.kr                                         | main 브랜치 자동 배포    |
| **백엔드 테스트**          | [test-api.zeroone.it.kr](https://test-api.zeroone.it.kr)          | dev 브랜치 자동 배포     |
| **백엔드 운영**            | https://api.zeroone.it.kr                                         | main 브랜치 자동 배포    |
| **백엔드 테스트 API 문서** | [Swagger UI](http://test-api.zeroone.it.kr/swagger-ui/index.html) | 백엔드 API 명세서        |

