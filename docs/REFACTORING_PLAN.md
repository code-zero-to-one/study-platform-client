# 🔄 Type-based 리팩토링 계획

## 🎯 설계 원칙

### 1. Type-based 구조

**핵심 개념**: 기능(feature/domain)이 아닌 **타입(역할)**을 기준으로 폴더 구조 구성

#### ✅ FSD에서 Type-based로의 변화

**Before (FSD - Feature-Sliced Design):**

```
entities/user/
  ├── api/           # 사용자 API
  ├── model/         # 사용자 쿼리
  └── ui/            # 사용자 UI

features/study/
  ├── group/
  ├── interview/
  └── participation/

widgets/home/        # 홈 위젯들
```

**After (Type-based):**

```
api/endpoints/       # 모든 API (open api로 관리 예정)
types/              # 모든 도메인 스키마, 모델, 타입
hooks/queries/       # 모든 쿼리 훅
components/          # 모든 컴포넌트 (UI 타입별 분류)
utils/               # 모든 유틸리티
```

#### 📌 Type-based의 장점

1. **직관적인 탐색**: "컴포넌트 찾기" → `components/` 폴더만 보면 됨
2. **낮은 진입장벽**: 신규 개발자도 빠르게 적응
3. **OpenAPI 통합 용이**: API 레이어가 독립적으로 관리됨
4. **Import 경로 단순화**: `@/components/...` 형태로 일관성
5. **도메인 경계 제거**: 도메인 간 컴포넌트 재사용이 자유로움

#### 🔑 핵심 규칙

1. **API는 도메인별로 통합** (`api/endpoints/user.api.ts`)
2. **타입은 types 폴더에서 관리**
   - Zod 스키마: `types/schemas/*.ts` (폼 검증용)
   - API 응답 타입: `types/api/*.types.ts` (추후 OpenAPI로 대체)
   - UI/Form 타입: `types/ui.ts`, `types/form.ts`
3. **Hooks는 도메인별로 하나의 파일에 관리** (`hooks/queries/use-user-queries.ts`)
4. **Components는 UI 타입별로 분류** (`ui/`, `layout/`, `cards/`, `modals/`, `forms/`, `lists/`, `calendars/`, `admin/`)
5. **Utils는 기능별로 분류** (`utils/date.ts`, `utils/validation.ts`)

### 2. 타입 관리 전략

#### 현재: 수동 타입 관리

```typescript
// types/api/user.types.ts - API 응답 타입
export interface GetUserProfileResponse {
  id: number;
  name: string;
  email: string;
  sincerityTemp: number;
}

// types/schemas/user.ts - Zod 스키마 (폼 검증용)
import { z } from 'zod';

export const UserFormSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  email: z.string().email('올바른 이메일'),
  phoneNumber: z.string().regex(/^\d{3}-\d{4}-\d{4}$/),
});

export type UserFormData = z.infer<typeof UserFormSchema>;

// api/endpoints/user.api.ts - API 함수
import { axiosInstance } from '@/api/client/axios';
import type { GetUserProfileResponse } from '@/types/api/user.types';

export const UserAPI = {
  getProfile: async (memberId: number): Promise<GetUserProfileResponse> => {
    const res = await axiosInstance.get(`/members/${memberId}/profile`);
    return res.data.content;
  },
};
```

#### 추후: OpenAPI 자동 생성

```typescript
// api/openapi/models/User.ts (자동 생성)
export interface User {
  id: number;
  name: string;
  email: string;
}

// api/openapi/services/UserService.ts (자동 생성)
export const UserService = {
  getUser: (id: number) => request<User>({ url: `/users/${id}` }),
};

// types/schemas/user.ts - Zod 스키마는 수동 관리
import { z } from 'zod';
import type { User } from '@/api/openapi/models/User';

export const UserFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});
```

**핵심**: OpenAPI는 타입만 생성, Zod 스키마는 별도 관리 필요

### 3. 컴포넌트 UI 타입별 분류

컴포넌트를 **UI 타입**에 따라 직관적으로 분류합니다.

#### 🎨 ui/ - Atomic 컴포넌트 (shadcn/ui 기반)

**역할**: 더 이상 분리할 수 없는 최소 단위 컴포넌트

**특징**:

- Button, Input, Badge, Avatar 등 기본 UI
- Props만 받아서 렌더링
- 비즈니스 로직 없음
- shadcn/ui 기반

**마이그레이션**: `shared/ui/*` → `components/ui/*`

**예시**:

```tsx
<Button variant="primary" size="lg">
  클릭
</Button>
<Avatar src="/profile.jpg" size={64} />
<Badge variant="success">제로원 스터디</Badge>
```

#### 🏗️ layout/ - 레이아웃 컴포넌트

**역할**: 페이지 레이아웃 구조를 담당하는 컴포넌트

**특징**:

- Header, Sidebar, Footer
- 페이지 전체 구조 정의
- 여러 컴포넌트를 배치

**마이그레이션**:

- `widgets/home/header.tsx` → `components/layout/header.tsx`
- `widgets/home/sidebar.tsx` → `components/layout/sidebar/home-sidebar.tsx`

**예시**:

```tsx
// layout/header.tsx
export default function Header() {
  return <header>{/* 헤더 내용 */}</header>;
}

// layout/sidebar/home-sidebar.tsx
export default function HomeSidebar() {
  return <aside>{/* 사이드바 내용 */}</aside>;
}
```

#### 🎴 cards/ - 카드 컴포넌트

**역할**: 카드 형태의 UI 컴포넌트

**특징**:

- 정보를 카드 형태로 표시
- Props로 데이터를 받아서 렌더링
- 재사용 가능한 독립적인 UI 블록

**마이그레이션**:

- `entities/user/ui/profile-info-card.tsx` → `components/cards/profile-card.tsx`
- `widgets/my-study/my-study-card.tsx` → `components/cards/study-card.tsx`
- `widgets/home/banner.tsx` → `components/cards/banner-card.tsx`

**예시**:

```tsx
// cards/profile-card.tsx
interface ProfileCardProps {
  name: string;
  imageUrl: string;
  sincerityTemp: number;
}

export default function ProfileCard({
  name,
  imageUrl,
  sincerityTemp,
}: ProfileCardProps) {
  return (
    <div>
      <Avatar src={imageUrl} />
      <span>{name}</span>
      <Badge>{sincerityTemp}°C</Badge>
    </div>
  );
}
```

#### 🪟 modals/ - 모달 컴포넌트

**역할**: 모달/다이얼로그 컴포넌트

**특징**:

- 오버레이 형태의 UI
- API 호출 포함 가능
- 사용자 인터랙션 처리

**마이그레이션**:

- `entities/review/ui/study-review-modal.tsx` → `components/modals/study-review-modal.tsx`
- `entities/user/ui/user-profile-modal.tsx` → `components/modals/user-profile-modal.tsx`
- `features/study/participation/ui/start-study-modal.tsx` → `components/modals/start-study-modal.tsx`

**예시**:

```tsx
// modals/study-review-modal.tsx
export default function StudyReviewModal({ studyId }: { studyId: number }) {
  const { mutate: submitReview } = useReviewQueries.useCreate();

  return <Modal>{/* 리뷰 작성 폼 */}</Modal>;
}
```

#### 📝 forms/ - 폼 컴포넌트

**역할**: 폼 입력 컴포넌트

**특징**:

- 사용자 입력 처리
- 폼 검증 로직 포함
- API 호출 포함 가능

**마이그레이션**:

- `widgets/landing/form.tsx` → `components/forms/landing-form.tsx`

**예시**:

```tsx
// forms/landing-form.tsx
export default function LandingForm() {
  const { mutate: subscribe } = useMutation(...);

  return (
    <form onSubmit={handleSubmit}>
      {/* 폼 필드 */}
    </form>
  );
}
```

#### 📋 lists/ - 리스트 컴포넌트

**역할**: 목록 표시 컴포넌트

**특징**:

- 데이터 목록을 표시
- API 호출 포함 가능
- 페이지네이션, 무한 스크롤 등

**마이그레이션**:

- `features/study/group/ui/group-study-list.tsx` → `components/lists/study-list.tsx`
- `widgets/home/study-list-table.tsx` → `components/lists/study-list-table.tsx`
- `widgets/home/todo-list.tsx` → `components/lists/todo-list.tsx`

**예시**:

```tsx
// lists/study-list.tsx
export default function StudyList() {
  const { data, fetchNextPage } = useStudyQueries.useInfiniteList();

  return (
    <div>
      {data?.pages.map((page) =>
        page.items.map((study) => <StudyCard study={study} />),
      )}
    </div>
  );
}
```

#### 📅 calendars/ - 캘린더 컴포넌트

**역할**: 캘린더/일정 관련 컴포넌트

**특징**:

- 일정 표시 및 관리
- 복잡한 날짜 로직
- API 호출 포함

**마이그레이션**:

- `widgets/home/calendar.tsx` → `components/calendars/calendar.tsx`

**예시**:

```tsx
// calendars/calendar.tsx
export default function Calendar() {
  const { data: schedules } = useStudyQueries.useSchedules();

  return <div>{/* 캘린더 UI */}</div>;
}
```

#### 📊 컴포넌트 분류 기준표

| 분류           | 위치                    | 역할          | API 호출 | 예시                               |
| -------------- | ----------------------- | ------------- | -------- | ---------------------------------- |
| **ui/**        | `components/ui/`        | 기본 UI       | ❌       | Button, Input, Badge, Modal        |
| **layout/**    | `components/layout/`    | 레이아웃 구조 | ❌       | Header, Sidebar, Footer            |
| **cards/**     | `components/cards/`     | 카드 UI       | ❌       | ProfileCard, StudyCard, BannerCard |
| **modals/**    | `components/modals/`    | 모달 UI       | ✅ 가능  | ReviewModal, UserProfileModal      |
| **forms/**     | `components/forms/`     | 폼 입력       | ✅ 가능  | LandingForm, StudyForm             |
| **lists/**     | `components/lists/`     | 리스트 표시   | ✅ 가능  | StudyList, TodoList, MemberTable   |
| **calendars/** | `components/calendars/` | 캘린더        | ✅ 가능  | Calendar, ScheduleCalendar         |
| **admin/**     | `components/admin/`     | 관리자 전용   | ✅ 가능  | AdminSidebar, AdminMemberTable     |

#### 🤔 컴포넌트 분류 판단 기준

**컴포넌트를 어디에 둘지 고민될 때:**

1. **UI 형태 먼저 판단**
   - 카드 형태? → `cards/`
   - 모달/다이얼로그? → `modals/`
   - 폼 입력? → `forms/`
   - 목록 표시? → `lists/`
   - 캘린더? → `calendars/`

2. **특수한 경우**
   - shadcn 기본 컴포넌트? → `ui/`
   - 레이아웃 구조? → `layout/`
   - 관리자 전용? → `admin/`

3. **API 호출 여부는 중요하지 않음**
   - 같은 타입의 컴포넌트는 같은 폴더에
   - 예: ReviewModal은 API 호출하지만 `modals/`에 위치

**예시:**

- `ProfileCard` → 카드 형태 → `cards/profile-card.tsx`
- `StudyReviewModal` → 모달 형태 → `modals/study-review-modal.tsx`
- `LandingForm` → 폼 형태 → `forms/landing-form.tsx`
- `StudyList` → 리스트 형태 → `lists/study-list.tsx`

### 4. 데이터 흐름

**Type-based 구조의 데이터 흐름:**

```
1. API Layer (api/endpoints/)
   ↓ API 호출
2. Hooks Layer (hooks/queries/)
   ↓ TanStack Query로 데이터 관리
3. Components Layer (components/)
   ↓ 비즈니스 로직 + UI
4. Page Layer (app/)
   ↓ 페이지 구성
```

**예시:**

```typescript
// 1. api/endpoints/user.api.ts
export const UserAPI = {
  getProfile: async (memberId: number) => {
    const res = await axiosInstance.get(`/members/${memberId}/profile`);
    return res.data.content;
  },
};

// 2. hooks/queries/use-user-queries.ts
export const useUserQueries = {
  useProfile: (memberId: number) => {
    return useQuery({
      queryKey: ['user', 'profile', memberId],
      queryFn: () => UserAPI.getProfile(memberId),
    });
  },
};

// 3. components/cards/profile-card.tsx
export default function ProfileCard({ memberId }: { memberId: number }) {
  const { data: user } = useUserQueries.useProfile(memberId);
  return <div>{user.name}</div>;
}

// 4. app/(service)/home/page.tsx
export default function HomePage() {
  return (
    <div>
      <ProfileCard memberId={1} />
    </div>
  );
}
```

### 5. Hooks 관리 전략

#### 도메인별 통합 관리

- **도메인별로 하나의 파일**에 모든 쿼리 관리
- 사용 빈도와 관계없이 같은 도메인이면 함께 관리
- import 복잡성 감소 및 코로케이션 원칙 준수

**예시:**

```typescript
// hooks/queries/use-user-queries.ts
export const useUserQueries = {
  // 프로필 조회
  useProfile: (memberId: number) =>
    useQuery({
      queryKey: ['user', 'profile', memberId],
      queryFn: () => UserAPI.getProfile(memberId),
    }),

  // 프로필 업데이트
  useUpdateProfile: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (params: { memberId: number; data: UpdateUserDto }) =>
        UserAPI.updateProfile(params.memberId, params.data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['user', 'profile', variables.memberId],
        });
      },
    });
  },

  // 자동매칭 토글
  useToggleAutoMatching: () =>
    useMutation({
      mutationFn: (params: { memberId: number; autoMatching: boolean }) =>
        UserAPI.patchAutoMatching(params.memberId, params.autoMatching),
    }),
};
```

#### 사용 방법

```tsx
// 컴포넌트에서 사용
import { useUserQueries } from '@/hooks/queries/use-user-queries';

export default function ProfileCard({ memberId }: { memberId: number }) {
  const { data: user } = useUserQueries.useProfile(memberId);
  const updateProfile = useUserQueries.useUpdateProfile();

  return <div>{user?.name}</div>;
}
```

---

## 📋 목표 구조

```
src/
├── app/                      # Next.js App Router (변경 없음)
│   ├── (landing)/
│   ├── (service)/
│   ├── (admin)/
│   └── layout.tsx
│
├── api/                      # 서버 통신 레이어
│   ├── client/              # axios instance, fetcher
│   │   ├── axios.ts
│   │   ├── axios.server.ts
│   │   └── cookie.ts
│   │
│   ├── openapi/             # OpenAPI Generator 자동 생성 (추후)
│   │   ├── models/          # API 타입 자동 생성
│   │   └── services/        # API 클라이언트 함수
│   │
│   └── endpoints/           # 커스텀 API 래퍼 (현재)
│       ├── user.api.ts
│       ├── study.api.ts
│       ├── review.api.ts
│       └── admin.api.ts
│
├── stores/                  # 전역 상태 관리 (Zustand)
│   ├── user.store.ts        # 사용자 상태
│   ├── theme.store.ts       # 테마 설정
│   └── modal.store.ts       # 모달 상태
│
├── hooks/                   # ViewModel Hooks (UI 로직)
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
├── components/              # UI 컴포넌트
│   ├── ui/                  # shadcn/ui 기반 Atomic 컴포넌트
│   │   ├── button/
│   │   ├── input/
│   │   ├── badge/
│   │   ├── avatar/
│   │   └── ...
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
├── utils/                   # 순수 유틸리티 함수
│   ├── date.ts
│   ├── format.ts
│   ├── validation.ts
│   ├── hash.ts
│   └── time.ts
│
├── config/                  # 설정 파일
│   ├── constants.ts         # 상수
│   ├── env.ts              # 환경변수
│   └── query-client.ts     # React Query 설정
│
├── providers/               # Context Providers
│   ├── index.tsx
│   └── query-provider.tsx
│
├── styles/                  # 스타일
│   └── globals.css
│
└── types/                   # 타입 정의
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
    └── api/                 # API 응답 타입 (OpenAPI 전까지)
        ├── user.types.ts
        ├── study.types.ts
        ├── review.types.ts
        └── admin.types.ts
```

---

## 📊 마이그레이션 매핑 가이드

| 현재 위치 (FSD)                             | 이동 위치 (Type-based)                       | 분류        |
| ------------------------------------------- | -------------------------------------------- | ----------- |
| **API 레이어**                              |                                              |             |
| `entities/*/api/*`                          | `api/endpoints/*.api.ts`                     | API 통합    |
| `features/*/api/*`                          | `api/endpoints/*.api.ts`                     | API 통합    |
| `shared/tanstack-query/axios.ts`            | `api/client/axios.ts`                        | API Client  |
| **타입 & 모델**                             |                                              |             |
| `entities/*/api/types.ts`                   | `types/api/*.types.ts`                       | API Types   |
| `features/*/api/types.ts`                   | `types/api/*.types.ts`                       | API Types   |
| **Hooks**                                   |                                              |             |
| `entities/*/model/*`                        | `hooks/queries/use-*-queries.ts`             | Query Hooks |
| `features/*/model/*`                        | `hooks/queries/use-*-queries.ts`             | Query Hooks |
| `shared/lib/intersection-observer.ts`       | `hooks/common/use-intersection-observer.ts`  | Common Hook |
| `entities/review/lib/*`                     | `hooks/common/use-reminder-review.ts`        | Common Hook |
| **컴포넌트**                                |                                              |             |
| `shared/ui/*`                               | `components/ui/*`                            | UI          |
| `widgets/home/header.tsx`                   | `components/layout/header.tsx`               | Layout      |
| `widgets/home/sidebar.tsx`                  | `components/layout/sidebar/home-sidebar.tsx` | Layout      |
| `entities/user/ui/profile-card.tsx`         | `components/cards/profile-card.tsx`          | Cards       |
| `widgets/my-study/my-study-card.tsx`        | `components/cards/study-card.tsx`            | Cards       |
| `widgets/home/banner.tsx`                   | `components/cards/banner-card.tsx`           | Cards       |
| `entities/review/ui/study-review-modal.tsx` | `components/modals/study-review-modal.tsx`   | Modals      |
| `entities/user/ui/user-profile-modal.tsx`   | `components/modals/user-profile-modal.tsx`   | Modals      |
| `widgets/landing/form.tsx`                  | `components/forms/landing-form.tsx`          | Forms       |
| `features/study/group/ui/*`                 | `components/lists/study-list.tsx`            | Lists       |
| `widgets/home/study-list-table.tsx`         | `components/lists/study-list-table.tsx`      | Lists       |
| `widgets/home/todo-list.tsx`                | `components/lists/todo-list.tsx`             | Lists       |
| `widgets/home/calendar.tsx`                 | `components/calendars/calendar.tsx`          | Calendars   |
| `widgets/admin/ui/*`                        | `components/admin/*`                         | Admin       |
| **유틸리티**                                |                                              |             |
| `shared/lib/time.ts`                        | `utils/date.ts`                              | Utils       |
| `shared/lib/hash.ts`                        | `utils/hash.ts`                              | Utils       |
| `shared/lib/validation.ts`                  | `utils/validation.ts`                        | Utils       |
| **설정**                                    |                                              |             |
| `shared/config/*`                           | `config/presets.ts`                          | Config      |
| `features/*/const/*`                        | `config/constants.ts`                        | Config      |
| `shared/tanstack-query/query-client.ts`     | `config/query-client.ts`                     | Config      |
| **Providers**                               |                                              |             |
| `app/provider/*`                            | `providers/*`                                | Provider    |

---

## 📋 목표 구조

---

## 📦 상세 마이그레이션 가이드

---

### 1️⃣ **api/** - API 레이어 통합

```
entities/user/api/
  ├── get-user-profile.ts
  ├── get-user-profile.server.ts
  └── types.ts

features/admin/api/
  ├── member-list.ts
  ├── member-list.server.ts
  └── types.ts

shared/tanstack-query/
  ├── axios.ts
  ├── axios.server.ts
  └── cookie.ts
```

#### **새로운 구조 (Type-based)**

```
api/
├── client/
│   ├── axios.ts                 ← shared/tanstack-query/axios.ts
│   ├── axios.server.ts          ← shared/tanstack-query/axios.server.ts
│   └── cookie.ts                ← shared/tanstack-query/cookie.ts
│
├── openapi/                     ← 🆕 OpenAPI Generator 출력
│   ├── models/
│   │   ├── User.ts
│   │   ├── Study.ts
│   │   └── Review.ts
│   └── services/
│       ├── UserService.ts
│       ├── StudyService.ts
│       └── ReviewService.ts
│
└── endpoints/                   ← 🆕 커스텀 API (OpenAPI 없는 경우만)
    ├── user.api.ts              ← entities/user/api/* 통합
    ├── study.api.ts             ← features/study/*/api/* 통합
    ├── review.api.ts            ← entities/review/api/* 통합
    └── admin.api.ts             ← features/admin/api/* 통합
```

#### **마이그레이션 작업**

```bash
# 1. api/client/ 생성 및 이동
mkdir -p src/api/client
mv src/shared/tanstack-query/axios.ts src/api/client/
mv src/shared/tanstack-query/axios.server.ts src/api/client/
mv src/shared/tanstack-query/cookie.ts src/api/client/

# 2. api/endpoints/ 생성
mkdir -p src/api/endpoints

# 3. 각 도메인별 API 통합 (수동 작업 필요)
# entities/user/api/* → api/endpoints/user.api.ts
# features/study/*/api/* → api/endpoints/study.api.ts
```

#### **예시: api/endpoints/user.api.ts**

```typescript
import { axiosInstance } from '@/api/client/axios';
import type { User, UpdateUserDto } from '@/models/user.model';

// ✅ 모든 User 관련 API를 하나의 파일에 통합
export const UserAPI = {
  // 프로필 조회
  getProfile: async (memberId: number): Promise<User> => {
    const res = await axiosInstance.get(`/members/${memberId}/profile`);
    return res.data.content;
  },

  // 자동매칭 설정
  patchAutoMatching: async (
    memberId: number,
    autoMatching: boolean,
  ): Promise<void> => {
    await axiosInstance.patch(`/members/${memberId}/auto-matching`, undefined, {
      params: { 'auto-matching': autoMatching },
    });
  },

  // 프로필 업데이트
  updateProfile: async (
    memberId: number,
    data: UpdateUserDto,
  ): Promise<User> => {
    const res = await axiosInstance.patch(`/members/${memberId}/profile`, data);
    return res.data.content;
  },
};
```

---

### 2️⃣ **types/** - 타입 정의

#### **현재 구조**

```
entities/user/api/types.ts       # 사용자 타입
features/admin/api/types.ts      # 관리자 타입
features/study/group/api/group-study-types.ts
```

#### **새로운 구조**

```
types/
├── api/                         # API 응답 타입
│   ├── user.types.ts           ← entities/user/api/types.ts
│   ├── study.types.ts          ← features/study/*/api/*-types.ts
│   ├── review.types.ts         ← entities/review/api/review-types.ts
│   └── admin.types.ts          ← features/admin/api/types.ts
│
└── domains/                     # 도메인 타입 + Zod 스키마
    ├── user.ts
    ├── study.ts
    ├── review.ts
    └── admin.ts
```

#### **예시: types/api/user.types.ts**

```typescript
// ✅ API 응답 타입만 정의
export interface GetUserProfileResponse {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  sincerityTemp: number;
  autoMatching: boolean;
  profileImageUrl: string;
}

export interface PatchAutoMatchingParams {
  memberId: number;
  autoMatching: boolean;
}
```

#### **예시: types/schemas/user.ts**

```typescript
import { z } from 'zod';

// ✅ Zod 스키마 (폼 검증용)
export const UserFormSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상'),
  email: z.string().email('올바른 이메일'),
  phoneNumber: z.string().regex(/^\d{3}-\d{4}-\d{4}$/),
});

export type UserFormData = z.infer<typeof UserFormSchema>;
```

---

### 3️⃣ **stores/** - 전역 상태 관리

#### **현재 상태**

- 현재 프로젝트에는 명시적인 Zustand 스토어가 없음
- 필요시 추가

#### **예시: stores/user.store.ts**

```typescript
import { create } from 'zustand';
import type { User } from '@/models/user.model';

interface UserStore {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoggedIn: boolean;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  isLoggedIn: false,
  setCurrentUser: (user) =>
    set({
      currentUser: user,
      isLoggedIn: !!user,
    }),
}));
```

---

### 4️⃣ **hooks/** - ViewModel Hooks

#### **현재 구조**

```
entities/user/model/use-user-profile-query.ts
entities/review/model/use-review-query.ts
features/study/group/model/use-group-study-list-query.ts
entities/review/lib/use-reminder-review.tsx
```

#### **새로운 구조**

```
hooks/
├── queries/                           # TanStack Query 훅
│   ├── use-user-queries.ts           ← entities/user/model/*
│   ├── use-study-queries.ts          ← features/study/*/model/*
│   ├── use-review-queries.ts         ← entities/review/model/*
│   └── use-admin-queries.ts          ← features/admin/model/*
│
└── common/                            # 공통 훅
    ├── use-intersection-observer.ts  ← shared/lib/intersection-observer.ts
    ├── use-debounce.ts               ← shared/lib/debounce.ts
    └── use-reminder-review.ts        ← entities/review/lib/*
```

#### **예시: hooks/queries/use-user-queries.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAPI } from '@/api/endpoints/user.api';
import type { UpdateUserDto } from '@/models/user.model';

// ✅ User 관련 모든 쿼리를 하나의 객체로 export
export const useUserQueries = {
  // 프로필 조회
  useProfile: (memberId: number) => {
    return useQuery({
      queryKey: ['user', 'profile', memberId],
      queryFn: () => UserAPI.getProfile(memberId),
      staleTime: 5 * 60 * 1000, // 5분
    });
  },

  // 프로필 업데이트
  useUpdateProfile: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        memberId,
        data,
      }: {
        memberId: number;
        data: UpdateUserDto;
      }) => UserAPI.updateProfile(memberId, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['user', 'profile', variables.memberId],
        });
      },
    });
  },

  // 자동매칭 토글
  useToggleAutoMatching: () => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        memberId,
        autoMatching,
      }: {
        memberId: number;
        autoMatching: boolean;
      }) => UserAPI.patchAutoMatching(memberId, autoMatching),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['user', 'profile', variables.memberId],
        });
      },
    });
  },
};
```

---

### 5️⃣ **components/** - UI 컴포넌트 재구성

#### **현재 구조 문제점**

```
shared/ui/          # shadcn 컴포넌트들
entities/*/ui/      # 도메인 UI 컴포넌트
features/*/ui/      # 기능 UI 컴포넌트
widgets/            # 페이지 위젯
```

- 컴포넌트가 도메인별로 흔어져 있음
- UI 타입으로 분류하면 찾기 쉬움

#### **새로운 구조 (UI 타입별 분류)**

```
components/
├── ui/                          # ⚛️ Atomic 컴포넌트 (shadcn 기반)
│   ├── button/
│   ├── input/
│   ├── badge/
│   ├── avatar/
│   ├── modal/
│   └── ... (21개 shadcn 컴포넌트)
│
├── layout/                      # 🏗️ 레이아웃 컴포넌트
│   ├── header.tsx              ← widgets/home/header.tsx
│   ├── sidebar/
│   │   ├── home-sidebar.tsx    ← widgets/home/sidebar.tsx
│   │   ├── my-page-sidebar.tsx ← widgets/my-page/sidebar.tsx
│   │   └── admin-sidebar.tsx   ← widgets/admin/ui/admin-side-bar.tsx
│   └── footer.tsx
│
├── common/                      # 🔄 공통 재사용 컴포넌트
│   ├── profile-card.tsx        ← entities/user/ui/profile-info-card.tsx
│   ├── my-profile-card.tsx     ← entities/user/ui/my-profile-card.tsx
│   ├── study-card.tsx          ← widgets/my-study/my-study-card.tsx
│   ├── keyword-review.tsx      ← entities/user/ui/keyword-review.tsx
│   ├── banner.tsx              ← widgets/home/banner.tsx
│   └── feedback-link.tsx       ← widgets/home/feedback-link.tsx
│
├── features/                    # 🎯 기능별 복합 컴포넌트 (비즈니스 로직 포함)
│   ├── study-list.tsx          ← features/study/group/ui/group-study-list.tsx
│   ├── study-list-table.tsx    ← widgets/home/study-list-table.tsx
│   ├── calendar.tsx            ← widgets/home/calendar.tsx
│   ├── todo-list.tsx           ← widgets/home/todo-list.tsx
│   ├── study-review-modal.tsx  ← entities/review/ui/study-review-modal.tsx
│   ├── user-profile-modal.tsx  ← entities/user/ui/user-profile-modal.tsx
│   └── start-study-modal.tsx   ← features/study/participation/ui/start-study-modal.tsx
│
└── admin/                       # 👤 관리자 전용 컴포넌트
    ├── admin-detail-sidebar.tsx
    └── member-table.tsx
```

#### **컴포넌트 분류 기준**

| 분류           | 목적                           | 특징                                | 예시                               |
| -------------- | ------------------------------ | ----------------------------------- | ---------------------------------- |
| **ui/**        | shadcn/ui 기반 Atomic 컴포넌트 | Props만 받음, 스타일링 중심         | Button, Input, Badge, Modal        |
| **layout/**    | 레이아웃 구조 컴포넌트         | 페이지 레이아웃 구성                | Header, Sidebar, Footer            |
| **cards/**     | 카드 형태 UI                   | 정보를 카드 형태로 표시             | ProfileCard, StudyCard, BannerCard |
| **modals/**    | 모달/다이얼로그                | 오버레이 UI, API 호출 가능          | ReviewModal, UserProfileModal      |
| **forms/**     | 폼 입력                        | 사용자 입력 처리, 폼 검증, API 호출 | LandingForm, StudyForm             |
| **lists/**     | 리스트 표시                    | 데이터 목록 표시, API 호출 가능     | StudyList, TodoList, MemberTable   |
| **calendars/** | 캘린더/일정                    | 일정 표시, 복잡한 날짜 로직         | Calendar, ScheduleCalendar         |
| **admin/**     | 관리자 전용                    | 관리자 페이지에서만 사용            | AdminSidebar, AdminMemberTable     |

#### **마이그레이션 예시**

**Before:**

```tsx
// features/study/group/ui/group-study-list.tsx
import { useGroupStudyListQuery } from '../model/use-group-study-list-query';
```

**After:**

```tsx
// components/lists/study-list.tsx
import { useStudyQueries } from '@/hooks/queries/use-study-queries';

export default function StudyList() {
  const { data } = useStudyQueries.useInfiniteList();
  // ...
}
```

---

### 6️⃣ **utils/** - 유틸리티 함수

#### **현재 구조**

```
shared/lib/
  ├── debounce.ts
  ├── hash.ts
  ├── time.ts
  ├── validation.ts
  ├── jwt.ts
  └── server-cookie.ts
```

#### **새로운 구조**

```
utils/
├── date.ts                  ← shared/lib/time.ts
├── format.ts                ← 새로 추가 (formatting 로직)
├── validation.ts            ← shared/lib/validation.ts
├── hash.ts                  ← shared/lib/hash.ts
└── auth.ts                  ← shared/lib/jwt.ts + server-cookie.ts
```

---

### 7️⃣ **config/** - 설정 파일

#### **현재 구조**

```
shared/
├── config/sincerity-temp-presets.tsx
└── tanstack-query/query-client.ts
```

#### **새로운 구조**

```
config/
├── constants.ts             ← features/*/const/* 통합
├── env.ts                   ← 새로 추가 (환경변수)
├── presets.ts               ← shared/config/sincerity-temp-presets.tsx
└── query-client.ts          ← shared/tanstack-query/query-client.ts
```

#### **예시: config/constants.ts**

```typescript
// ✅ 모든 상수를 하나의 파일에 통합
export const STUDY_CONSTANTS = {
  TYPE_LABELS: {
    PROJECT: '프로젝트',
    READING: '독서',
    // ...
  },
  ROLE_LABELS: {
    FRONTEND: '프론트엔드',
    BACKEND: '백엔드',
    // ...
  },
  // features/study/group/const/group-study-const.ts 내용
};

export const MEMBER_CONSTANTS = {
  STATUS_LABELS: {
    ACTIVE: '활성',
    INACTIVE: '비활성',
  },
  // features/admin/const/member.ts 내용
};
```

---

### 8️⃣ **providers/** - Context Providers

#### **현재 구조**

```
app/provider/
  ├── index.tsx
  └── query-provider.tsx
```

#### **새로운 구조**

```
providers/
├── index.tsx              ← app/provider/index.tsx
└── query-provider.tsx     ← app/provider/query-provider.tsx
```

---

## 🚀 마이그레이션 실행 전략

### 📌 브랜치 전략

```bash
# 1. refactoring 브랜치 생성
git checkout -b refactoring

# 2. 페이지별 작업 후 각각 커밋
git add .
git commit -m "refactor: Landing 페이지 Type-based 구조로 전환"

# 3. 최종 PR 전략
# - PR #1: 기존 feature 작업용 (develop → main)
# - PR #2: 리팩토링 작업용 (refactoring → develop)
```

### 🎯 페이지별 점진적 마이그레이션

#### **Phase 0: 준비 작업 (0.5일)**

```bash
# refactoring 브랜치 생성
git checkout -b refactoring

# 기본 폴더 구조만 먼저 생성
mkdir -p src/{api/client,api/endpoints,types/{api,schemas},hooks/{queries,common},components/{ui,layout,cards,modals,forms,lists,calendars,admin},utils,config,providers}

git add .
git commit -m "chore: Type-based 폴더 구조 생성"
```

#### **Phase 1: Landing 페이지 (1일)**

**목표**: `/app/(landing)/page.tsx` 완전 전환

```bash
# 1. Landing 페이지에서 사용하는 컴포넌트만 이동
mkdir -p src/components/{ui,cards,forms}

# Badge, Button → components/ui/
cp src/shared/ui/badge/index.tsx src/components/ui/badge.tsx
cp src/shared/ui/button/index.tsx src/components/ui/button.tsx

# Banner → components/cards/
# (Landing에서는 사용 안 하지만 구조상 이동)

# LandingForm → components/forms/
cp src/widgets/landing/form.tsx src/components/forms/landing-form.tsx

# 2. Landing 페이지 import 경로 수정
# app/(landing)/page.tsx 파일 수정
# - @/shared/ui/badge → @/components/ui/badge
# - @/shared/ui/button → @/components/ui/button
# - @/widgets/landing/form → @/components/forms/landing-form

# 3. 테스트 및 커밋
npm run dev  # 개발 서버 확인
git add .
git commit -m "refactor(landing): Type-based 구조로 전환"
```

**체크리스트**:

- [ ] Badge, Button 컴포넌트 이동
- [ ] LandingForm 컴포넌트 이동
- [ ] Landing 페이지 import 경로 수정
- [ ] 개발 서버 정상 동작 확인
- [ ] 빌드 테스트 (`npm run build`)

#### **Phase 2: Home 페이지 (2일)**

**목표**: `/app/(service)/home/page.tsx` 완전 전환

```bash
# 1. Home 페이지 관련 컴포넌트 이동

# Layout 컴포넌트
mkdir -p src/components/layout/sidebar
cp src/widgets/home/header.tsx src/components/layout/header.tsx
cp src/widgets/home/sidebar.tsx src/components/layout/sidebar/home-sidebar.tsx

# Cards 컴포넌트
cp src/widgets/home/banner.tsx src/components/cards/banner-card.tsx

# Lists 컴포넌트
mkdir -p src/components/lists
cp src/widgets/home/study-list-table.tsx src/components/lists/study-list-table.tsx
cp src/widgets/home/todo-list.tsx src/components/lists/todo-list.tsx

# Calendars 컴포넌트
mkdir -p src/components/calendars
cp src/widgets/home/calendar.tsx src/components/calendars/calendar.tsx

# 2. API & Hooks 이동 (Home에서 사용하는 것만)
mkdir -p src/api/{client,endpoints}
mkdir -p src/hooks/queries

# API Client
cp src/shared/tanstack-query/axios.ts src/api/client/
cp src/shared/tanstack-query/cookie.ts src/api/client/

# Study API (study-list-table에서 사용)
# entities/user/api/* + features/study/*/api/* 통합
# → src/api/endpoints/study.api.ts 생성

# Study Hooks (study-list-table, calendar에서 사용)
# features/study/*/model/* 통합
# → src/hooks/queries/use-study-queries.ts 생성

# 3. Types 정의
mkdir -p src/types/{api,schemas}
# Study 관련 타입만 먼저 이동
# features/study/*/api/*-types.ts → types/api/study.types.ts

# 4. Home 페이지 및 관련 컴포넌트 import 경로 수정

# 5. 테스트 및 커밋
npm run dev
git add .
git commit -m "refactor(home): Type-based 구조로 전환"
```

**체크리스트**:

- [ ] Layout 컴포넌트 이동 (Header, Sidebar)
- [ ] Cards 컴포넌트 이동 (Banner)
- [ ] Lists 컴포넌트 이동 (StudyListTable, TodoList)
- [ ] Calendar 컴포넌트 이동
- [ ] Study API 통합
- [ ] Study Hooks 통합
- [ ] Study Types 정의
- [ ] Home 페이지 import 경로 수정
- [ ] 개발 서버 정상 동작 확인
- [ ] 빌드 테스트

#### **Phase 3: My 페이지들 (2일)**

**목표**: My 관련 페이지들 전환 (my-page, my-study, my-activity, my-study-review)

```bash
# 1. My 페이지 관련 컴포넌트 이동

# Layout
cp src/widgets/my-page/sidebar.tsx src/components/layout/sidebar/my-page-sidebar.tsx

# Cards
cp src/entities/user/ui/profile-info-card.tsx src/components/cards/profile-card.tsx
cp src/entities/user/ui/my-profile-card.tsx src/components/cards/my-profile-card.tsx
cp src/widgets/my-study/my-study-card.tsx src/components/cards/study-card.tsx

# Modals
mkdir -p src/components/modals
cp src/entities/user/ui/user-profile-modal.tsx src/components/modals/user-profile-modal.tsx
cp src/entities/review/ui/study-review-modal.tsx src/components/modals/study-review-modal.tsx

# 2. API & Hooks 이동

# User API
# entities/user/api/* → src/api/endpoints/user.api.ts
# Review API
# entities/review/api/* → src/api/endpoints/review.api.ts

# User Hooks
# entities/user/model/* → src/hooks/queries/use-user-queries.ts
# Review Hooks
# entities/review/model/* → src/hooks/queries/use-review-queries.ts

# 3. Types 정의
# User, Review 타입 이동
# entities/user/api/types.ts → types/api/user.types.ts
# entities/review/api/types.ts → types/api/review.types.ts

# 4. My 페이지들 import 경로 수정

# 5. 테스트 및 커밋
npm run dev
git add .
git commit -m "refactor(my-pages): Type-based 구조로 전환"
```

**체크리스트**:

- [ ] My Layout 컴포넌트 이동
- [ ] Profile Cards 이동
- [ ] User/Review Modals 이동
- [ ] User API 통합
- [ ] Review API 통합
- [ ] User Hooks 통합
- [ ] Review Hooks 통합
- [ ] User/Review Types 정의
- [ ] My 페이지들 import 경로 수정
- [ ] 개발 서버 정상 동작 확인

#### **Phase 4: Study 상세 페이지 (1.5일)**

**목표**: Study 관련 상세 페이지들 전환

```bash
# 1. Study 관련 추가 컴포넌트 이동

# Modals
cp src/features/study/participation/ui/start-study-modal.tsx src/components/modals/start-study-modal.tsx

# Lists
cp src/features/study/group/ui/group-study-list.tsx src/components/lists/study-list.tsx

# 2. 남은 Study API & Hooks 통합
# features/study/interview/api/* → api/endpoints/study.api.ts에 추가
# features/study/participation/api/* → api/endpoints/study.api.ts에 추가

# 3. Study Types 통합
# features/study/*/api/*-types.ts → types/api/study.types.ts에 통합

# 4. Study Zod 스키마 생성
mkdir -p src/types/schemas
# features/study/interview/model/interview.schema.ts 참고
# → types/schemas/study.ts 생성

# 5. Study 페이지들 import 경로 수정

# 6. 테스트 및 커밋
npm run dev
git add .
git commit -m "refactor(study): Type-based 구조로 전환"
```

**체크리스트**:

- [ ] Study Modals 이동
- [ ] Study Lists 이동
- [ ] Study API 완전 통합
- [ ] Study Hooks 완전 통합
- [ ] Study Types 완전 통합
- [ ] Study Zod 스키마 생성
- [ ] Study 페이지들 import 경로 수정
- [ ] 개발 서버 정상 동작 확인

#### **Phase 5: Admin 페이지 (1일)**

**목표**: Admin 페이지 전환

```bash
# 1. Admin 컴포넌트 이동
mkdir -p src/components/admin
cp src/widgets/admin/ui/admin-side-bar.tsx src/components/admin/admin-sidebar.tsx
cp src/widgets/admin/ui/admin-detail-side-bar.tsx src/components/admin/admin-detail-sidebar.tsx
# 기타 admin UI 컴포넌트들

# 2. Admin API & Hooks
# features/admin/api/* → api/endpoints/admin.api.ts
# features/admin/model/* → hooks/queries/use-admin-queries.ts

# 3. Admin Types
# features/admin/api/types.ts → types/api/admin.types.ts
# features/admin/const/* → config/constants.ts에 통합

# 4. Admin 페이지 import 경로 수정

# 5. 테스트 및 커밋
npm run dev
git add .
git commit -m "refactor(admin): Type-based 구조로 전환"
```

**체크리스트**:

- [ ] Admin 컴포넌트 이동
- [ ] Admin API 통합
- [ ] Admin Hooks 통합
- [ ] Admin Types 정의
- [ ] Admin 상수 통합
- [ ] Admin 페이지 import 경로 수정
- [ ] 개발 서버 정상 동작 확인

#### **Phase 6: 공통 인프라 정리 (1일)**

**목표**: 남은 공통 부분 정리 및 최적화

```bash
# 1. 남은 shadcn 컴포넌트 모두 이동
cp -r src/shared/ui/* src/components/ui/

# 2. Utils 정리
mkdir -p src/utils
cp src/shared/lib/time.ts src/utils/date.ts
cp src/shared/lib/validation.ts src/utils/validation.ts
cp src/shared/lib/hash.ts src/utils/hash.ts
# jwt.ts + server-cookie.ts → utils/auth.ts 통합

# 3. Config 정리
mkdir -p src/config
cp src/shared/config/sincerity-temp-presets.tsx src/config/presets.ts
cp src/shared/tanstack-query/query-client.ts src/config/query-client.ts
# features/*/const/* → config/constants.ts 통합

# 4. Providers 이동
mkdir -p src/providers
cp src/app/provider/index.tsx src/providers/
cp src/app/provider/query-provider.tsx src/providers/

# 5. 공통 Hooks 이동
mkdir -p src/hooks/common
cp src/shared/lib/intersection-observer.ts src/hooks/common/use-intersection-observer.ts
cp src/shared/lib/debounce.ts src/hooks/common/use-debounce.ts
cp src/entities/review/lib/use-reminder-review.tsx src/hooks/common/use-reminder-review.ts

# 6. 전역 import 경로 일괄 수정 (남은 것들)

# 7. 테스트 및 커밋
npm run dev
npm run build
git add .
git commit -m "refactor(common): 공통 인프라 정리"
```

**체크리스트**:

- [ ] 모든 shadcn 컴포넌트 이동
- [ ] Utils 완전 이동 및 정리
- [ ] Config 완전 이동 및 정리
- [ ] Providers 이동
- [ ] 공통 Hooks 이동
- [ ] 전역 import 경로 수정
- [ ] TypeScript 컴파일 에러 없음
- [ ] 빌드 성공

#### **Phase 7: 구조 정리 및 최종 검증 (0.5일)**

```bash
# 1. 기존 폴더 삭제
rm -rf src/entities
rm -rf src/features
rm -rf src/widgets
rm -rf src/shared

# 2. TypeScript Path Alias 업데이트
# tsconfig.json 수정

# 3. package.json scripts 확인

# 4. 최종 테스트
npm run lint
npm run build
npm run dev

# 5. 문서 업데이트
# README.md에 새 구조 반영 확인

# 6. 최종 커밋
git add .
git commit -m "refactor: Type-based 구조 전환 완료"

# 7. PR 생성
git push origin refactoring
# GitHub에서 PR 생성: refactoring → develop
```

**최종 체크리스트**:

- [ ] 기존 FSD 폴더 완전 삭제
- [ ] TypeScript 설정 업데이트
- [ ] ESLint 통과
- [ ] 빌드 성공
- [ ] 모든 페이지 정상 동작
- [ ] Storybook 정상 동작
- [ ] 문서 업데이트
- [ ] PR 생성 및 리뷰 요청

---

## ✅ 마이그레이션 체크리스트

### 브랜치 전략

- [ ] `refactoring` 브랜치 생성
- [ ] 페이지별 작업 후 개별 커밋

### 페이지별 진행 상황

- [ ] **Phase 0**: 준비 작업 (폴더 구조 생성)
- [ ] **Phase 1**: Landing 페이지 전환
  - [ ] UI 컴포넌트 이동
  - [ ] Forms 컴포넌트 이동
  - [ ] Import 경로 수정
  - [ ] 개발 서버 확인
- [ ] **Phase 2**: Home 페이지 전환
  - [ ] Layout 컴포넌트 이동
  - [ ] Cards/Lists/Calendars 이동
  - [ ] Study API & Hooks 통합
  - [ ] Import 경로 수정
- [ ] **Phase 3**: My 페이지들 전환
  - [ ] Cards/Modals 이동
  - [ ] User/Review API & Hooks 통합
  - [ ] Import 경로 수정
- [ ] **Phase 4**: Study 상세 페이지 전환
  - [ ] Study 관련 컴포넌트 완전 이동
  - [ ] Study 스키마 생성
  - [ ] Import 경로 수정
- [ ] **Phase 5**: Admin 페이지 전환
  - [ ] Admin 컴포넌트 이동
  - [ ] Admin API & Hooks 통합
  - [ ] Import 경로 수정
- [ ] **Phase 6**: 공통 인프라 정리
  - [ ] 모든 shadcn 컴포넌트 이동
  - [ ] Utils/Config/Providers 이동
  - [ ] 공통 Hooks 이동
- [ ] **Phase 7**: 최종 정리
  - [ ] 기존 FSD 폴더 삭제
  - [ ] TypeScript 설정 업데이트
  - [ ] 최종 테스트
  - [ ] PR 생성

### 최종 검증

- [ ] TypeScript 컴파일 에러 없음
- [ ] ESLint 통과
- [ ] 빌드 성공 (`npm run build`)
- [ ] 모든 페이지 정상 동작
- [ ] Storybook 정상 동작 (옵션)

### PR 전략

- [ ] PR #1: 기존 feature 작업 (develop → main)
- [ ] PR #2: Refactoring 작업 (refactoring → develop)

---

## 💡 추가 제안

### 1. **components/ui/ 개선 제안**

현재 `shared/ui/`에 있는 shadcn 컴포넌트들이 많습니다. 더 나은 관리를 위해:

```
components/ui/
├── primitives/        # shadcn 원본 (수정 금지)
│   ├── button.tsx
│   ├── input.tsx
│   └── ...
│
└── custom/            # shadcn 커스터마이징 버전
    ├── primary-button.tsx
    ├── search-input.tsx
    └── ...
```

### 2. **TypeScript Path Alias 업데이트**

`tsconfig.json`에 새로운 경로 추가:

```json
{
  "compilerOptions": {
    "paths": {
      "@/api/*": ["./src/api/*"],
      "@/types/*": ["./src/types/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/components/*": ["./src/components/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/config/*": ["./src/config/*"],
      "@/providers/*": ["./src/providers/*"],
      "@/stores/*": ["./src/stores/*"]
    }
  }
}
```

### 3. **OpenAPI Generator 설정**

추후 OpenAPI 통합 시 `openapi-typescript-codegen` 사용:

```bash
npm install --save-dev openapi-typescript-codegen

# package.json에 스크립트 추가
"scripts": {
  "generate:api": "openapi --input ./openapi.yaml --output ./src/api/openapi --client axios"
}
```

### 4. **Barrel Exports 활용**

각 폴더에 `index.ts`를 추가하여 import 간소화:

```typescript
// types/schemas/index.ts
export * from './user';
export * from './study';
export * from './review';

// types/api/index.ts
export * from './user.types';
export * from './study.types';
export * from './review.types';

// 사용:
import { UserFormSchema } from '@/types/schemas';
import type { GetUserProfileResponse } from '@/types/api';
```

---

## 📊 예상 소요 시간

| Phase    | 작업 내용         | 소요 시간 | 누적 시간 |
| -------- | ----------------- | --------- | --------- |
| Phase 0  | 준비 작업         | 0.5일     | 0.5일     |
| Phase 1  | Landing 페이지    | 1일       | 1.5일     |
| Phase 2  | Home 페이지       | 2일       | 3.5일     |
| Phase 3  | My 페이지들       | 2일       | 5.5일     |
| Phase 4  | Study 상세 페이지 | 1.5일     | 7일       |
| Phase 5  | Admin 페이지      | 1일       | 8일       |
| Phase 6  | 공통 인프라 정리  | 1일       | 9일       |
| Phase 7  | 최종 정리 및 검증 | 0.5일     | 9.5일     |
| **총합** |                   |           | **~10일** |

**권장 일정**:

- 1주차: Phase 0-3 (Landing, Home, My 페이지)
- 2주차: Phase 4-7 (Study, Admin, 정리)
- 각 Phase 완료 후 즉시 커밋하여 진행 상황 추적

---

## 🎯 마이그레이션 후 장점

1. **직관적인 탐색**: 타입별로 명확히 분리되어 파일 찾기 쉬움
2. **낮은 학습 곡선**: 신규 개발자도 구조 이해 빠름
3. **OpenAPI 통합 용이**: API 레이어가 독립적으로 관리됨
4. **Import 경로 단순화**: `@/components/`, `@/hooks/` 등 일관된 경로
5. **재사용성 향상**: 도메인 경계 없이 자유로운 컴포넌트 재사용
6. **유지보수 효율**: 관련 코드가 타입별로 모여 있어 수정 편리
