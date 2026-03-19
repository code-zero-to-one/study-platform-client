# Project Index: study-platform-client

Generated: 2026-03-17

## Overview

ZERO-ONE 스터디 플랫폼 — 매일 아침 1:1 기상 스터디 플랫폼.
Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4 · Yarn 1.22+

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (landing)/          # 공개 랜딩 (/)
│   ├── (service)/          # 인증 서비스 페이지
│   │   ├── (my)/           # My 페이지 그룹 (사이드바 공유)
│   │   ├── group-study/    # 그룹 스터디 목록·상세
│   │   ├── mentoring/      # 멘토링 목록·상세·신청
│   │   ├── payment/        # 결제 플로우
│   │   ├── insights/       # 인사이트 목록·상세
│   │   ├── home/           # 홈
│   │   └── ...
│   ├── (admin)/            # 관리자 (ROLE_ADMIN JWT)
│   │   └── admin/          # 매칭·멘토링·매출관리·회원상세
│   └── api/                # Route Handlers
├── api/
│   ├── client/axios.ts     # 레거시 axios (AUTH001 갱신 큐)
│   ├── endpoints/          # 도메인별 서버 fetch 함수
│   ├── openapi/            # ⚠️ 자동 생성 — 직접 수정 금지
│   │   ├── api/            # 45개 API 클래스
│   │   └── models/         # 388개 DTO 타입
│   └── strapi/             # CMS API
├── components/
│   ├── common/
│   │   ├── ui/             # 공용 UI 원자: Button, Badge, Avatar,
│   │   │                   #   Carousel, Chip, DatePicker, Dropdown,
│   │   │                   #   Editor(Tiptap), Modal, Pagination,
│   │   │                   #   Table, Tabs, Tooltip, ...
│   │   ├── layout/         # Header, AdminSideBar, sidebar
│   │   └── modals/         # 공용 모달
│   └── [domain]/           # 레거시 도메인 컴포넌트(~266 tsx)
├── features/               # FSD 구조 (신규 코드 우선)
│   ├── auth/               # OAuth, 회원가입, 미들웨어 헬퍼
│   ├── study/
│   │   ├── group/          # 그룹 스터디 생성·운영·채널·신청
│   │   ├── one-to-one/     # 1:1 스터디 일정·기록·아카이브·밸런스게임
│   │   ├── interview/      # 인터뷰
│   │   └── participation/  # 참여 관련
│   ├── mentoring/          # 멘토링 신청·관리·노트·리뷰·디렉토리
│   ├── my-page/            # 마이페이지 프로필·설정
│   ├── home/               # 홈 모델
│   ├── phone-verification/ # 핸드폰 인증
│   └── admin/              # 관리자 매칭·멘토링
├── hooks/
│   ├── queries/            # TanStack Query 훅 (56개)
│   └── common/             # 범용 훅 (debounce, intersection, infinite-scroll, auth, ...)
├── stores/                 # Zustand 전역 상태
│   ├── useLeaderStore
│   ├── use-toast-store
│   ├── use-phone-verification-store
│   └── useMentor* (screening, directory, management, operation)
├── config/                 # 설정 및 상수
│   ├── query-client.ts     # TanStack QueryClient + MutationCache 글로벌 에러 핸들러
│   ├── sentry.ts           # Sentry 환경 분류
│   └── [domain]-const.ts   # 도메인별 상수
├── providers/
│   └── query-provider.tsx  # ReactQueryDevtools 포함
├── types/                  # 도메인 타입 정의
│   └── schemas/            # Zod 스키마 (React Hook Form 연동)
├── utils/                  # 유틸리티
│   ├── error-handler.ts    # ★ 핵심: analyzeError(), logError(), ~40개 에러코드 매핑
│   ├── jwt.ts
│   ├── format.ts
│   ├── server-cookie.ts
│   └── ...
├── lib/
│   └── countdown.ts
└── middleware.ts            # accessToken 검증, 갱신, /admin 권한 가드
```

## Entry Points

| 파일 | 역할 |
|------|------|
| `src/middleware.ts` | 모든 요청 인터셉트: 토큰 검증 → 갱신 → admin 권한 확인 |
| `src/app/layout.tsx` | Root layout (Sentry, GTM, Clarity 초기화) |
| `src/app/(landing)/layout.tsx` | 랜딩 레이아웃 |
| `src/app/(service)/layout.tsx` | 서비스 레이아웃 (GlobalToast 마운트) |
| `src/app/(admin)/layout.tsx` | 관리자 레이아웃 |
| `src/app/global-error.tsx` | Root 에러 경계 (Sentry 자동 캡처) |

## Key Routes

### 서비스 (인증 필요)

| 경로 | 설명 |
|------|------|
| `/` | 랜딩 페이지 |
| `/home` | 홈 (참여 스터디 대시보드) |
| `/group-study` | 그룹 스터디 목록 |
| `/group-study/[id]` | 그룹 스터디 상세 (mission/evaluation 탭) |
| `/mentoring` | 멘토링 목록 |
| `/mentoring/[id]` | 멘토링 상세 |
| `/mentoring/become-mentor` | 멘토 등록 |
| `/payment/[id]` | 결제 |
| `/insights` | 인사이트 목록 |
| `/one-on-one` | 1:1 스터디 |
| `/my-page` | 마이페이지 |
| `/my-study` | 마이스터디 (참여 중·종료 미리보기) |
| `/my-study/not-completed` | 참여 중인 스터디 전체 + 페이지네이션 |
| `/my-study/completed` | 종료된 스터디 전체 + 페이지네이션 |
| `/my-mentoring/[id]` | 내 멘토링 상세 |
| `/my-activity` | 내 활동 |
| `/my-study-review` | 스터디 리뷰 |
| `/note-consultation` | 노트 상담 |
| `/payment-management` | 결제 내역 (my) |
| `/settlement-management` | 정산 관리 (my) |
| `/notification` | 알림 목록 |
| `/mentoring-management` | 멘토 운영 관리 |

### 관리자

| 경로 | 설명 |
|------|------|
| `/admin` | 어드민 홈 |
| `/admin/matching` | 매칭 관리 |
| `/admin/mentoring` | 멘토링 관리 |
| `/admin/sales-management/payment-refund` | 결제·환불 관리 |
| `/admin/sales-management/settlement` | 정산 관리 |

## API Layer

### 두 가지 패턴 공존

**1. OpenAPI 자동 생성** (권장, 신규 API용)
```bash
yarn generate:api <swagger-api-title>
# → src/hooks/queries/<name>.ts 생성 (TanStack Query 훅 보일러플레이트)
```
- 타입: `src/api/openapi/models/` (388개)
- API 클래스: `src/api/openapi/api/` (45개)
- Swagger: https://test-api.zeroone.it.kr/swagger-ui/index.html

**2. 레거시 axios** (`src/api/client/axios.ts`)
- baseURL: `/api/v1/`
- AUTH001 에러 시 자동 갱신 + 큐잉
- 커스텀/레거시 엔드포인트용

### TanStack Query 훅 (src/hooks/queries/)

| 파일 | 도메인 |
|------|--------|
| `use-group-study-list-query.ts` | 그룹 스터디 목록 |
| `mission-api.ts` | 미션 CRUD |
| `evaluation-api.ts` | 평가 |
| `peer-review-api.ts` | 동료 평가 |
| `payment-user-api.ts` | 결제 (사용자) |
| `refund-user-api.ts` | 환불 (사용자) |
| `settlement-user-api.ts` | 정산 (사용자) |
| `notification-api.ts` | 알림 |
| `group-study-member-api.ts` | 스터디 멤버 |
| `bank-search-api.ts` | 은행 검색 |

## State Management

| 스토어 | 용도 |
|--------|------|
| `useLeaderStore` | 리더 정보 |
| `use-toast-store` | 전역 토스트 (GlobalToast 연동) |
| `use-phone-verification-store` | 휴대폰 인증 상태 |
| `useMentor*` | 멘토 스크리닝·디렉토리·운영 |

- 기본 staleTime: 60초
- QueryClient: `src/config/query-client.ts` — MutationCache 글로벌 onError

## Error Handling

```
AxiosError  → isAxiosError()  → HTTP 코드/에러 코드 추출
ApiError    → isApiError()    → errorCode/statusCode 보존
Error       → instanceof      → UNKNOWN 타입
```

- 핵심: `src/utils/error-handler.ts` — `analyzeError()`, `logError()`
- Sentry: AUTH001 제외, replaysOnErrorSampleRate: 1.0
- 브라우저 alert() 사용 금지 → `useToastStore.showToast()`

## Styling

- Tailwind CSS 4 + `@tailwindcss/postcss`
- 기본 Tailwind 스케일(`p-4`, `rounded-lg` 등) **사용 금지** → 프로젝트 커스텀 토큰만
- 토큰 정의: `src/app/global.css` (`@theme inline`)
- 클래스 유틸: `clsx`, `tailwind-merge`, CVA

## Key Dependencies

| 패키지 | 용도 |
|--------|------|
| `next@15.2.8` | App Router, Turbopack |
| `@tanstack/react-query@^5` | 서버 상태 |
| `zustand@^5` | 클라이언트 상태 |
| `react-hook-form + zod` | 폼 + 유효성 |
| `@tiptap/*` | 리치 텍스트 에디터 |
| `@tosspayments/tosspayments-sdk` | 결제 |
| `@sentry/nextjs@^10` | 에러 모니터링 |
| `framer-motion` | 애니메이션 |
| `@radix-ui/*` | 접근성 UI primitives |
| `@svgr/webpack` | SVG → React 컴포넌트 |

## Quick Start

```bash
yarn          # 의존성 설치
yarn dev      # Turbopack 개발 서버
yarn build    # 프로덕션 빌드
yarn lint     # ESLint
yarn typecheck  # TypeScript 검사
yarn storybook  # 컴포넌트 개발 (포트 6006)
yarn generate:api <name>  # API 훅 보일러플레이트 생성
```

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL       # 백엔드 API
NEXT_PUBLIC_KAKAO_CLIENT_ID    # 카카오 OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID   # 구글 OAuth
NEXT_PUBLIC_TOSS_CLIENT_KEY    # 토스페이먼츠
NEXT_PUBLIC_SENTRY_DSN         # Sentry (없으면 비활성화)
NEXT_PUBLIC_GTM_ID             # Google Tag Manager
NEXT_PUBLIC_CLARITY_PROJECT_ID # Microsoft Clarity
```

## CI Pipeline

lint → typecheck → prettier → build → build-storybook → 보안 감사

## Branch Strategy

feature → `develop` (스테이징: test.zeroone.it.kr) → `main` (프로덕션: www.zeroone.it.kr)

## Notes

- `src/api/openapi/` 파일 직접 수정 금지 (재생성됨)
- `src/components/` + `src/features/` 혼합 구조 — PR 내에서 구조 혼용 금지
- Tailwind 임의값(`p-[4px]`) 사용 금지 — 프로젝트 커스텀 토큰 사용
