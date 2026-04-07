# Project Index: study-platform-client-v2

Generated: 2026-03-31 | Branch: feat/markdown-editor

## 📋 프로젝트 개요

**ZERO-ONE** — 1:1 기상 스터디 플랫폼 (그룹스터디 + 멘토링)

- **Stack**: Next.js 15.2.8 (App Router), React 19, TypeScript 5, Tailwind CSS 4
- **Package Manager**: Yarn 1.22+, Node.js >=20
- **Backend**: Spring Boot (`/Users/haseung/Documents/Dev/study-platform-mvp/src/`)
- **Staging**: https://test.zeroone.it.kr
- **Production**: https://www.zeroone.it.kr

---

## 📁 디렉토리 구조

```
src/
├── app/                    # Next.js App Router 페이지
│   ├── (landing)/          # 공개 랜딩 (/)
│   ├── (service)/          # 인증 필요 서비스 페이지
│   │   ├── (my)/           # 마이페이지 그룹
│   │   ├── group-study/    # 그룹스터디
│   │   ├── mentoring/      # 멘토링
│   │   ├── premium-study/  # 프리미엄 스터디
│   │   ├── payment/        # 결제
│   │   ├── insights/       # 인사이트 블로그
│   │   └── inquiry/        # 문의
│   ├── (admin)/            # 관리자 (ROLE_ADMIN JWT 클레임)
│   └── api/                # API Routes (auth/clear-session 등)
├── api/
│   ├── client/             # axios 인스턴스, OpenAPI 인스턴스
│   ├── endpoints/          # 수동 axios API 함수 (도메인별)
│   └── openapi/            # 자동생성 타입/서비스 ⚠️ 직접 수정 금지
├── components/
│   └── common/
│       ├── ui/             # 공용 UI 컴포넌트
│       ├── layout/         # Header, AdminSideBar 등
│       ├── modals/         # 공용 모달 (20+)
│       └── cards/          # 카드 컴포넌트
├── features/               # 도메인 기반 기능 모듈
│   ├── auth/               # OAuth, 미들웨어 인증 로직
│   ├── study/one-to-one/   # 1:1 스터디 (schedule, history, discussion)
│   ├── mentoring/          # 멘토링 (directory, management, review)
│   ├── admin/matching/     # 관리자 매칭
│   └── admin/mentoring/    # 관리자 멘토링
├── hooks/queries/          # TanStack Query 훅 (55+)
├── stores/                 # Zustand 전역 상태
├── types/                  # TypeScript 타입 정의
│   ├── api/                # API 요청/응답 타입
│   ├── schemas/            # Zod 폼 스키마
│   └── {domain}/           # 도메인별 타입 (mentoring, matching 등)
├── config/                 # 설정 파일
├── utils/                  # 유틸 함수
└── middleware.ts            # 인증/라우팅 미들웨어
```

---

## 🚀 주요 진입점

| 파일 | 역할 |
|------|------|
| `src/middleware.ts` | accessToken 쿠키 검증, 토큰 갱신, admin 권한 확인 |
| `src/app/(landing)/page.tsx` | 랜딩 홈 (`/`) |
| `src/app/(service)/home/page.tsx` | 서비스 홈 (`/home`) |
| `src/app/(service)/group-study/[id]/page.tsx` | 그룹스터디 상세 |
| `src/app/(admin)/admin/page.tsx` | 관리자 메인 |

---

## 🔌 API 레이어

### 3가지 통신 패턴

| 레이어 | 경로 | 용도 |
|--------|------|------|
| Legacy axios | `src/api/client/axios.ts` | baseURL `/api/v1/`, AUTH001 토큰 갱신 큐 포함 |
| axios V2 | `src/api/client/axiosV2.ts` | 신규 엔드포인트용 |
| OpenAPI 자동생성 | `src/api/openapi/` | Swagger에서 자동생성, **수정 금지** |

### 수동 endpoints 도메인

`src/api/endpoints/` — archive, auth, admin, user, channel, interview, hall-of-fame, balance-game, group-study, group-study-application, participation, review

### 신규 API 훅 생성

```bash
yarn generate:api <swagger-api-이름>
# → src/hooks/queries/<이름>.ts 생성
```

### Swagger

- Staging: https://test-api.zeroone.it.kr/swagger-ui/index.html
- API Docs JSON: https://test-api.zeroone.it.kr/v3/api-docs

---

## 📦 주요 모듈

### 상태 관리

| Store | 파일 | 역할 |
|-------|------|------|
| useUserStore | `src/stores/useUserStore.ts` | 유저 정보 (persist) |
| useLeaderStore | `src/stores/useLeaderStore.ts` | 스터디 리더 상태 |
| useToastStore | `src/stores/use-toast-store.ts` | Toast 알림 |
| useMentoringManagementStore | `src/stores/useMentoringManagementStore.ts` | 멘토링 관리 |

### TanStack Query 훅 (src/hooks/queries/)

주요 훅: `use-group-study-list-query`, `use-study-query`, `mission-api`, `evaluation-api`, `peer-review-api`, `settlement-user-api`, `payment-user-api`, `notification-api`, `group-study-member-api`

**기본 staleTime: 60초**

### 에러 처리

| 파일 | 역할 |
|------|------|
| `src/utils/error-handler.ts` | `analyzeError()`, `logError()`, 40+ 에러 코드 매핑 |
| `src/config/query-client.ts` | MutationCache 글로벌 에러 핸들러 |
| `src/app/(service)/error.tsx` | 서비스 라우트 에러 경계 |
| `src/app/global-error.tsx` | 앱 전체 에러 경계 (Sentry 자동 캡처) |

Toast 사용:
```typescript
// React 내부
const showToast = useToastStore((state) => state.showToast);
// React 외부
useToastStore.getState().showToast(msg, 'error');
```

---

## 🎨 공용 컴포넌트 (src/components/common/)

### UI 컴포넌트

Button, Input, TextArea, Checkbox, Radio, Toggle, Switch, Chip, ChipInput, DatePicker, Pagination, TabMenu, Tooltip, Carousel, Progress, Dropdown, Table, Modal-shell, Toast, Editor (Tiptap), PageContainer, SectionShell, SurfacePanel, MetricCard, StatItem, IconButton, ActionPillButton, InlineSectionHeader, KeyValueRow, FilterSortListTemplate, ListStateBoundary

### 모달 (20+)

StartStudyModal, StudyReadyModal, StudyDoneModal, GroupNoticeModal, ProfileEditModal, PhoneVerificationModal, AddAccountModal, DeleteMissionModal, DeleteHomeworkModal, ConfirmDeleteModal, PeerReviewModals, SettlementModals, VirtualAccountInfoModal, PaymentTermsModal 등

---

## 🔐 인증 플로우

```
OAuth 로그인 (카카오/구글)
  → JWT access + refresh 발급
  → accessToken: 쿠키 (JS 접근 가능)
  → refresh_token: httpOnly 쿠키
  → Axios 인터셉터: AUTH001 감지 → 토큰 갱신 → 재시도
  → middleware.ts: 서버 측 토큰 검증 → 실패 시 `/` 리다이렉트
```

핵심 파일: `src/features/auth/model/`, `src/features/auth/server/middleware/`

---

## 🧪 테스트 & 품질

- **테스팅**: Vitest, Playwright (E2E)
- **컴포넌트 문서화**: Storybook (포트 6006)
- **포맷터**: Biome (`yarn prettier`, `yarn prettier:fix`)
- **린터**: ESLint (RushStack 기반) + TanStack Query 플러그인
- **타입 검사**: `yarn typecheck` (tsc --noEmit)
- **CI**: lint → typecheck → prettier → build → build-storybook → 보안 감사

---

## 🔧 설정 파일

| 파일 | 역할 |
|------|------|
| `src/config/query-client.ts` | TanStack Query 클라이언트 (staleTime 60s) |
| `src/config/sentry.ts` | Sentry 설정 |
| `src/config/constants.ts` | 앱 상수 |
| `sentry.client.config.ts` | Sentry 클라이언트 초기화 |
| `sentry.server.config.ts` | Sentry 서버 초기화 |
| `next.config.ts` | Next.js + Sentry + SVGR 설정 |

---

## 🔗 핵심 의존성

| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 15.2.8 | App Router 프레임워크 |
| react | 19.2.3 | UI 라이브러리 |
| @tanstack/react-query | 5.66 | 서버 상태 관리 |
| zustand | 5.0.3 | 클라이언트 상태 |
| axios | 1.9 | HTTP 클라이언트 |
| @tiptap/react | 3.20 | 리치 텍스트 에디터 |
| zod | 4.0 | 스키마 검증 |
| react-hook-form | 7.62 | 폼 상태 관리 |
| @sentry/nextjs | 10.42 | 에러 모니터링 |
| @tosspayments/tosspayments-sdk | 2.5 | 결제 SDK |
| tailwindcss | 4.0 | 스타일링 |
| framer-motion | 12 | 애니메이션 |

---

## 📚 문서

| 파일 | 내용 |
|------|------|
| `docs/openapi-usage.md` | OpenAPI 자동생성 사용법 |
| `docs/SENTRY_GUIDE.md` | Sentry 설정 및 모니터링 |
| `docs/SEO_GUIDE.md` | SEO 가이드 |
| `docs/REFACTORING_PLAN.md` | 리팩토링 계획 |
| `docs/2026-03-15-login-fail-fix/` | 인증 미들웨어 리팩토링 상세 |
| `docs/2026-03-26-markdown-editor/` | 마크다운 에디터 공통 컴포넌트 사용법 |
| `docs/bundle-metrics.md` | 번들 사이즈 측정 결과 |

---

## 📝 Tailwind CSS 규칙

⚠️ 기본 Tailwind 스케일 **사용 금지** (`p-4`, `rounded-lg`, `text-sm` 등)
✅ 프로젝트 커스텀 토큰만 사용 (`p-200`, `rounded-150`, `font-designer-*`, `text-text-*`)
✅ 임의값 **사용 금지** (`p-[4px]`, `w-[320px]`)
→ `src/app/global.css`의 `@theme inline`에서 기본 스케일을 override함

---

## 🔄 브랜치 전략

```
feature/* → develop (test.zeroone.it.kr) → main (www.zeroone.it.kr)
```

현재 브랜치: `feat/markdown-editor`
메인 브랜치: `develop` (PR 기본 대상)
