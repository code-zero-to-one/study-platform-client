# Project Index: ZERO-ONE 스터디 플랫폼

Generated: 2026-03-19

## 📋 Overview

매일 아침 함께 시작하는 1:1 기상 스터디 플랫폼.
**Stack**: Next.js 15 (App Router) · React 19 · TypeScript 5 · Tailwind CSS 4
**Package Manager**: Yarn 1.22+ · Node.js >=20

---

## 📁 Directory Structure

```
src/
├── app/                        # Next.js App Router
│   ├── (landing)/              # 공개 랜딩 (/)
│   ├── (service)/              # 서비스 (인증 필요)
│   │   ├── (my)/               # 마이페이지 그룹
│   │   │   ├── my-page/        # 마이페이지 메인
│   │   │   ├── my-study/       # 내 스터디 (completed/not-completed)
│   │   │   ├── my-study-review/ # 후기 탭 (group/mentor/one-to-one)
│   │   │   ├── payment-management/
│   │   │   ├── settlement-management/
│   │   │   ├── mentoring-management/
│   │   │   └── notification/
│   │   ├── group-study/[id]/   # 그룹스터디 상세
│   │   ├── premium-study/[id]/ # 멘토스터디 상세
│   │   ├── mentoring/[id]/     # 멘토링 상세
│   │   ├── insights/           # 블로그/인사이트
│   │   ├── payment/[id]/       # 결제
│   │   └── application-list/[studyId]/
│   ├── (admin)/admin/          # 관리자 (ROLE_ADMIN)
│   └── api/                    # API Routes
│       ├── auth/clear-session/ # 세션 초기화
│       └── notify-user-by-email/
├── api/
│   ├── client/                 # axios 인스턴스 (axios.ts, axiosV2.ts, cookie.ts)
│   └── openapi/                # Swagger 자동생성 — 직접 수정 금지
├── components/
│   ├── common/
│   │   ├── ui/                 # Button, Modal, Avatar, Tabs, StarRatingInput, ...
│   │   ├── layout/             # Header, HomeHeader, MobileMenuDrawer, MySidebar
│   │   └── modals/             # GroupStudyReviewModal, StudyCompletionModal, ...
│   ├── pages/                  # 페이지 조합 컴포넌트
│   └── [도메인]/               # archive/, balance-game/, card/, section/, ...
├── features/                   # 도메인 피처 모듈 (신규 패턴)
│   ├── auth/                   # 인증 전체 (model, server/middleware, ui)
│   ├── mentoring/              # 멘토링 도메인
│   ├── admin/                  # 어드민 (matching, mentoring)
│   ├── study/one-to-one/       # 1:1 스터디 (schedule, history, discussion)
│   └── home/                   # 홈 검색 파라미터
├── hooks/
│   ├── queries/                # TanStack Query 훅 (도메인별)
│   └── common/                 # 공용 훅 (use-auth, use-group-study-review-form, ...)
├── stores/                     # Zustand 전역 상태
├── types/
│   ├── api/                    # API 응답 타입 (*.types.ts)
│   ├── schemas/                # Zod 폼 스키마
│   ├── auth/                   # 인증 도메인 타입
│   └── mentoring/              # 멘토링 도메인 타입
├── config/                     # 상수 및 설정 (query-client, sentry, *-const)
├── utils/                      # 유틸 (error-handler, format, time, jwt, seo, ...)
└── middleware.ts               # 인증 미들웨어 (토큰 검증 + 리다이렉트)
```

---

## 🚀 Entry Points

| 경로 | 역할 |
|---|---|
| `src/app/layout.tsx` | 루트 레이아웃 (Provider, Sentry init) |
| `src/middleware.ts` | 인증 처리 (accessToken 검증, 갱신, `/admin/*` 권한) |
| `src/providers/index.tsx` | QueryClient, Zustand hydration, Toast |
| `src/instrumentation.ts` | Sentry 서버/엣지 초기화 |

---

## 📦 Core Modules

### API 레이어

| 파일 | 역할 |
|---|---|
| `src/api/client/axios.ts` | 레거시 axios (baseURL `/api/v1/`, AUTH001 갱신 큐) |
| `src/api/client/axiosV2.ts` | V2 axios 클라이언트 |
| `src/api/openapi/` | Swagger 자동생성 타입·서비스 — **수정 금지** |

### TanStack Query 훅 (`src/hooks/queries/`)

| 파일 | 도메인 |
|---|---|
| `study-query.ts` | 스터디 기본 쿼리 |
| `group-study-review-api.ts` | 그룹스터디 리뷰 CRUD + 통계 |
| `group-study-member-api.ts` | 스터디 멤버 관리 |
| `mission-api.ts` | 미션 생성/조회/제출 |
| `evaluation-api.ts` | 평가 |
| `peer-review-api.ts` | 동료 평가 |
| `payment-user-api.ts` | 결제 |
| `refund-user-api.ts` | 환불 |
| `settlement-user-api.ts` | 정산 |
| `notification-api.ts` | 알림 |
| `use-auth.ts`, `use-auth-mutation.ts` | 인증 쿼리/뮤테이션 |

### 전역 상태 (`src/stores/`)

| 파일 | 역할 |
|---|---|
| `useUserStore.ts` | 유저 정보 (persist) |
| `useLeaderStore.ts` | 리더 여부 |
| `use-toast-store.ts` | Toast 전역 알림 |
| `use-phone-verification-store.ts` | 본인인증 상태 |

### 인증 피처 (`src/features/auth/`)

| 경로 | 역할 |
|---|---|
| `model/use-auth.ts` | 클라이언트 인증 훅 |
| `model/auth-session.ts` | 세션 도메인 로직 |
| `server/middleware/` | 미들웨어 분리 모듈 (route-policy, access-token-session, ...) |
| `model/parse-oauth-redirect-result.ts` | OAuth 리다이렉트 파싱 |

### 에러 핸들링

| 파일 | 역할 |
|---|---|
| `src/utils/error-handler.ts` | `analyzeError()`, `logError()`, 코드→메시지 매핑 (~40개) |
| `src/config/query-client.ts` | MutationCache 글로벌 에러 핸들러 |
| `src/config/sentry.ts` | Sentry 설정 (DSN, 환경 감지, AUTH001 제외) |

---

## 🔧 Configuration

| 파일 | 목적 |
|---|---|
| `next.config.ts` | SVGR, Sentry, Bundle Analyzer |
| `tsconfig.json` | `@/*` → `./src/*` 별칭 |
| `src/app/global.css` | `@theme inline` — 프로젝트 디자인 토큰 정의 |
| `src/config/query-client.ts` | TanStack Query 설정 (staleTime 60s) |
| `.env` | `NEXT_PUBLIC_API_BASE_URL`, OAuth 키, Toss, Sentry DSN |

---

## 📚 Documentation

| 파일 | 내용 |
|---|---|
| `CLAUDE.md` | Claude Code 전체 가이드 (API 패턴, 컨벤션, 에러 처리) |
| `docs/SENTRY_GUIDE.md` | Sentry 통합 가이드 |
| `docs/CODEMAPS/` | 인증 리팩토링 상세 문서 |

---

## 🔗 Key Dependencies

| 패키지 | 버전 | 용도 |
|---|---|---|
| `next` | 15 | 프레임워크 |
| `react` | 19 | UI |
| `@tanstack/react-query` | - | 서버 상태 관리 |
| `zustand` | - | 전역 클라이언트 상태 |
| `axios` | ^1.9 | HTTP 클라이언트 |
| `react-hook-form` + `zod` | - | 폼 상태 + 유효성 |
| `@radix-ui/*` | - | UI 프리미티브 (Modal, Dialog, ...) |
| `@sentry/nextjs` | ^10 | 에러 모니터링 |
| `@tosspayments/tosspayments-sdk` | - | 결제 |
| `canvas-confetti` | ^1.9 | 완주 모달 효과 |
| `date-fns`, `dayjs` | - | 날짜 처리 |
| `@tiptap/react` | ^3 | 리치 텍스트 에디터 |
| `class-variance-authority` | - | CVA 컴포넌트 변형 |

---

## 📝 Quick Start

```bash
yarn install          # 의존성 설치
yarn dev              # Turbopack 개발 서버
yarn build            # 프로덕션 빌드
yarn typecheck        # 타입 검사
yarn lint:fix         # ESLint 자동 수정
yarn generate:api <이름>  # API 훅 보일러플레이트 생성
```

---

## ⚠️ 중요 제약사항

- `src/api/openapi/` 파일 직접 수정 금지 (Swagger 재생성됨)
- Tailwind 임의값(`p-[4px]`) 금지 → `global.css` 커스텀 토큰 사용
- 존재하지 않는 API 엔드포인트 임의 생성 금지
- `alert()` 금지 → `useToastStore` 사용
- Production에서 stack trace 사용자 노출 금지
