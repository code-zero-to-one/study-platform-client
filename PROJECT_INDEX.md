# Project Index: study-platform-client-v2

Generated: 2026-03-26

---

## 📁 Project Structure

```
study-platform-client-v2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (landing)/          # 공개 랜딩 (/)
│   │   ├── (service)/          # 인증 필요 서비스
│   │   │   └── (my)/           # 마이페이지 네스티드 그룹
│   │   ├── (admin)/            # 관리자 (ROLE_ADMIN)
│   │   └── api/                # Next.js API Routes
│   ├── api/
│   │   ├── client/             # Axios 인스턴스, 에러 처리
│   │   ├── endpoints/          # SSR용 서버사이드 API 함수
│   │   ├── openapi/            # Swagger 자동생성 (수정 금지)
│   │   └── strapi/             # Headless CMS 연동
│   ├── components/
│   │   ├── common/ui/          # 기본 UI (Button, Modal, Form 등 40+)
│   │   ├── common/layout/      # Header, Sidebar
│   │   ├── common/modals/      # 공용 모달
│   │   └── pages/              # 페이지 단위 조합
│   ├── features/               # Feature-based 도메인 모듈
│   │   ├── auth/               # 인증 (OAuth, 미들웨어 정책)
│   │   ├── mentoring/          # 멘토링 (가장 큰 도메인)
│   │   ├── admin/              # 관리자 기능
│   │   ├── home/               # 홈
│   │   ├── phone-verification/ # 전화 인증
│   │   └── study/              # 스터디
│   ├── hooks/
│   │   ├── queries/            # TanStack Query 훅 (65개+)
│   │   └── common/             # 공용 커스텀 훅
│   ├── stores/                 # Zustand 전역 상태
│   ├── types/                  # TypeScript 타입
│   │   ├── api/                # API 응답 타입 (13개 도메인)
│   │   ├── schemas/            # Zod 폼 검증 스키마
│   │   └── mentoring/          # 멘토링 전용 (30개+ 파일)
│   ├── utils/                  # 유틸리티 함수
│   ├── config/                 # Query Client 등 설정
│   └── providers/              # React Context & Providers
├── docs/                       # 작업 문서 (bugfix-*, feature-*)
├── .storybook/                 # Storybook 설정
├── next.config.ts
├── tsconfig.json
├── biome.json
└── PROJECT_INDEX.md
```

---

## 🚀 Entry Points

| 파일 | 설명 |
|------|------|
| `src/app/layout.tsx` | Root 레이아웃 (Pretendard 폰트, 메타데이터) |
| `src/app/global.css` | Tailwind CSS 4 + CSS 변수 테마 토큰 |
| `src/app/global-error.tsx` | App-level 에러 경계 (Sentry 자동 캡처) |
| `src/middleware.ts` | 인증 처리, 토큰 갱신, 라우팅 정책 |
| `src/instrumentation.ts` | Sentry 서버/엣지 런타임 초기화 |
| `src/providers/index.tsx` | 전체 Provider 조합 (QueryClient, etc.) |
| `src/config/query-client.ts` | TanStack Query 클라이언트 (MutationCache 글로벌 에러 핸들러) |

---

## 🗺️ Routing Structure

```
/                           → (landing)/page.tsx
/home                       → (service)/home/
/group-study/[id]           → (service)/group-study/[id]/
/inquiry                    → (service)/inquiry/
/payment/[id]               → (service)/payment/[id]/
/premium-study              → (service)/premium-study/
/insights                   → (service)/insights/
/application-list           → (service)/application-list/
/my-study                   → (service)/(my)/my-study/
/my-page                    → (service)/(my)/my-page/
/my-mentoring               → (service)/(my)/my-mentoring/
/my-study-review            → (service)/(my)/my-study-review/
/payment-management         → (service)/(my)/payment-management/
/settlement-management      → (service)/(my)/settlement-management/
/notification               → (service)/(my)/notification/
/admin/*                    → (admin)/admin/  [ROLE_ADMIN 필요]
```

**미들웨어 라우팅 정책:** BYPASS → SIGN_UP → PUBLIC_SESSION → PROTECTED

---

## 📦 Core Modules

### API Client (`src/api/client/`)
- `axios.ts` — 기본 Axios 인스턴스. baseURL `/api/v1/`, AUTH001 에러 시 토큰 갱신 큐
- `axiosV2.ts` — 개선 버전 (멀티파트 지원)
- `open-api-instance.ts` — OpenAPI 자동 생성 클라이언트
- `api-error.ts` — `ApiError` 커스텀 클래스
- `api-logger.ts` — 개발/프로덕션 환경별 API 로깅

### Error Handler (`src/utils/error-handler.ts`)
- `analyzeError()` — AxiosError → ApiError → 일반 Error 순으로 분류
- `logError()` — Sentry 보고 + 한국어 fallback 메시지
- 40개+ 에러 코드-메시지 매핑 (AUTH, CMM, MEM, GSM, HWK, EVL, PAY, FILE)
- AUTH001 (토큰 만료)은 Sentry 보고 제외 (정상 플로우)

### State Management
- **Zustand** `useUserStore.ts` — 유저 정보 persist
- **Zustand** `use-toast-store.ts` — 전역 토스트 알림
- **TanStack Query** — 서버 상태, 기본 staleTime 60초
- **React Hook Form + Zod** — 폼 상태 + 런타임 검증

### Auth Flow (`src/features/auth/`)
1. OAuth (카카오/구글) → JWT access + refresh 발급
2. `accessToken` 쿠키 (JS 접근) + `refresh_token` httpOnly 쿠키
3. Axios 인터셉터 → AUTH001 감지 → 갱신 → 재시도
4. Middleware → 서버사이드 토큰 검증 → 실패 시 `/` 리다이렉트

---

## 🔧 Configuration

| 파일 | 설명 |
|------|------|
| `next.config.ts` | CSP 헤더, 이미지 도메인, SVG 로더(@svgr), Sentry |
| `tsconfig.json` | strict mode, `@/*` → `./src/*` 경로 별칭 |
| `biome.json` | Biome 포맷팅 (80자, 작은따옴표, 2칸 들여쓰기) |
| `.eslintrc.cjs` | RushStack strict + React hooks + TanStack Query 플러그인 |
| `vitest.config.ts` | 단위 테스트 |
| `postcss.config.mjs` | Tailwind CSS 4 PostCSS 플러그인 |
| `sentry.*.config.ts` | Sentry 클라이언트/서버/엣지 설정 |

---

## 🔗 Key Dependencies

| 패키지 | 버전 | 용도 |
|--------|------|------|
| `next` | 15.2.8 | 프레임워크 (App Router, Turbopack) |
| `react` | 19.2.3 | UI 라이브러리 |
| `@tanstack/react-query` | 5.66.0 | 서버 상태 관리 |
| `zustand` | 5.0.3 | 전역 클라이언트 상태 |
| `react-hook-form` | 7.62.0 | 폼 상태 |
| `zod` | 4.0.17 | 런타임 검증 |
| `axios` | 1.9.0 | HTTP 클라이언트 |
| `tailwindcss` | 4.0.6 | 스타일링 |
| `@sentry/nextjs` | 10.42.0 | 에러 모니터링 |
| `@tiptap/react` | 3.20.0 | Rich text editor |
| `@tosspayments/tosspayments-sdk` | 2.5.0 | 결제 |
| `framer-motion` | 12.27.1 | 애니메이션 |
| `date-fns` | 4.1.0 | 날짜 계산 |
| `storybook` | 8.6.12 | 컴포넌트 개발 환경 |
| `vitest` | 3.1.1 | 단위 테스트 |

---

## 📝 Quick Start

```bash
# 개발 서버 (Turbopack)
yarn dev

# 빌드
yarn build

# 린트 + 타입 검사
yarn lint && yarn typecheck

# 새 API 훅 생성 (OpenAPI 기반)
yarn generate:api <swagger-api-이름>

# Storybook
yarn storybook
```

---

## ⚙️ Conventions

### TanStack Query 패턴

```typescript
// useQuery
export const useGetStudy = ({ id }: { id: number }) =>
  useQuery({
    queryKey: ['study', id],
    queryFn: async () => {
      const { data } = await studyApi.getStudy(id);
      return data.content;
    },
    staleTime: 60 * 1000, // 기본 60초
  });

// useMutation
export const useCreateStudy = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params) => { ... },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['studies'] });
    },
  });
};
```

### Toast 사용

```typescript
// 컴포넌트 내
const showToast = useToastStore((state) => state.showToast);
showToast('완료', 'success');

// React 외부
useToastStore.getState().showToast('에러', 'error');
```

### 새 API 추가 흐름

1. Swagger UI에서 API 확인: `https://test-api.zeroone.it.kr/swagger-ui/index.html`
2. `yarn generate:api <api-name>` → `src/hooks/queries/<name>.ts` 생성
3. 생성된 파일에서 TanStack Query 훅 작성

---

## 🌐 Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL          # 백엔드 API 엔드포인트
NEXT_PUBLIC_KAKAO_CLIENT_ID       # 카카오 OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID      # 구글 OAuth
NEXT_PUBLIC_TOSS_CLIENT_KEY       # 토스페이먼츠
NEXT_PUBLIC_SENTRY_DSN            # Sentry (없으면 비활성화)
NEXT_PUBLIC_GTM_ID                # Google Tag Manager
NEXT_PUBLIC_CLARITY_PROJECT_ID    # Microsoft Clarity
SENTRY_ORG / SENTRY_PROJECT / SENTRY_AUTH_TOKEN  # CI 소스맵 업로드
```

---

## 🏗️ Architecture Notes

- **API 이원화**: `src/api/openapi/` (자동생성, 수정 금지) + `src/features/*/api/` (레거시 Axios)
- **컴포넌트 구조 이원화**: `src/features/` (신규) + `src/components/` (기존) 공존
- **Tailwind 4**: `src/app/global.css`의 `@theme inline`으로 기본 스케일 초기화 → 기본 클래스(`p-4`, `rounded-lg`) 사용 불가, 프로젝트 커스텀 토큰만 사용
- **에러 처리**: `error-handler.ts` 중앙화 + `MutationCache` 글로벌 핸들러 + route segment `error.tsx`
- **백엔드 연동**: `/Users/haseung/Documents/Dev/study-platform-mvp/src/` (Spring Boot)
- **스테이징**: `https://test.zeroone.it.kr` / **프로덕션**: `https://www.zeroone.it.kr`
