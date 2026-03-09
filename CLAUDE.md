# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 본 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트 개요

ZERO-ONE 스터디 플랫폼 — 매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼. Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4 기반. 패키지 매니저는 **Yarn 1.22+**, Node.js >=20 필요.

## 명령어

```bash
yarn dev              # Turbopack 개발 서버 실행
yarn build            # 프로덕션 빌드
yarn lint             # ESLint 검사
yarn lint:fix         # ESLint 자동 수정
yarn typecheck        # TypeScript 타입 검사 (tsc --noEmit)
yarn prettier         # Prettier 포맷 검사
yarn prettier:fix     # Prettier 자동 포맷팅
yarn storybook        # Storybook 개발 서버 (포트 6006)
yarn build-storybook  # Storybook 빌드
yarn generate:api <이름>  # API 쿼리 훅 보일러플레이트 생성 (예: yarn generate:api bank-search-api)
```

CI 파이프라인: lint → typecheck → prettier → build → build-storybook → 보안 감사.

## 아키텍처

### 라우팅 (Next.js App Router)

- `src/app/(landing)/` — 공개 랜딩 페이지 (`/`)
- `src/app/(service)/` — 인증 필요 서비스 페이지 (home, my-page, payment, premium-study 등)
- `src/app/(admin)/` — 관리자 페이지 (JWT의 `ROLE_ADMIN` 클레임으로 권한 보호)
- `src/middleware.ts` — 인증 처리: accessToken 쿠키 검증, `/api/v1/auth/access-token/refresh`로 자동 갱신, `/admin/*` 경로 관리자 권한 확인

### API 레이어

**백엔드 API 문서 (Swagger):**

- 스테이징: https://test-api.zeroone.it.kr/v3/api-docs
- Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html

두 가지 통신 패턴이 공존:

1. **레거시 axios** (`src/api/client/axios.ts`): baseURL `/api/v1/`, 토큰 갱신 큐 구현 (AUTH001 에러 시 갱신 트리거). 커스텀 엔드포인트에 사용.
2. **OpenAPI 자동 생성** (`src/api/openapi/`): 백엔드 Swagger에서 자동 생성된 타입과 서비스. **`src/api/openapi/` 내 파일을 직접 수정 금지** — 재생성됨. ESLint에서 이 디렉토리 제외됨.

새 API 훅 추가 방법:

```bash
yarn generate:api <swagger-api-타이틀-이름>
# src/hooks/queries/<이름>.ts 파일 생성 (createApiInstance 보일러플레이트 포함)
```

생성된 파일에서 API 인스턴스를 사용해 TanStack Query 훅을 작성.

#### TanStack Query 훅 작성 패턴

**useQuery (조회):**

```typescript
export const useGetMissions = ({
  groupStudyId,
  page = 1,
}: GetMissionsParams) => {
  return useQuery({
    queryKey: ['missions', groupStudyId, page], // 리소스명 + 파라미터
    queryFn: async () => {
      const { data } = await missionApi.getMissions(groupStudyId, page);
      return data.content; // content 추출
    },
    enabled: !!groupStudyId, // 조건부 실행 (선택)
  });
};
```

**useMutation (생성/수정/삭제):**

```typescript
export const useCreateMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupStudyId, request }: CreateMissionParams) => {
      const { data } = await missionApi.createMission(groupStudyId, request);
      return data.content;
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['missions', variables.groupStudyId], // 관련 쿼리 무효화
      });
    },
  });
};
```

**queryKey 컨벤션:**

- 단일 리소스: `['mission', missionId]`
- 목록 리소스: `['missions', groupStudyId, page, size]`
- 무효화 시 상위 키 사용: `queryKey: ['missions']` (해당 리소스 전체 무효화)

#### 레거시 방식 (features 내부 API)

`src/features/<도메인>/api/` 디렉토리에 직접 axios 함수 작성:

```typescript
import { axiosInstance } from '@/api/client/axios';

export const getArchive = async (params: GetArchiveParams) => {
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>(
    '/archive',
    { params },
  );
  return data.content;
};
```

레거시 방식은 기존 코드 유지보수용. 신규 API는 OpenAPI 방식 권장.

### 상태 관리

- **Zustand** (`src/stores/`): 전역 클라이언트 상태. `useUserStore` (유저 정보 persist), `useLeaderStore`.
- **TanStack Query** (`src/hooks/queries/`): 서버 상태. 도메인별 쿼리 훅 (study, payment, evaluation, peer-review, settlement 등). 기본 staleTime: 60초.
- **React Hook Form + Zod** (`src/types/schemas/`): 폼 상태 + 런타임 유효성 검증.

### 컴포넌트 구성

- 공용 UI는 주로 `src/components/common/ui/` 아래에 위치한다. 예: `Button`, `Dialog`, `Toast`, `FloatingInquiryButton`
- 공용 레이아웃은 `src/components/common/layout/` 아래에 위치한다. 예: `Header`, `AdminSideBar`
- 공용 모달은 `src/components/common/modals/` 아래에 위치한다
- 페이지 단위 조합 컴포넌트는 `src/components/pages/`, 도메인별 조합은 `payment/`, `discussion/`, `archive/`, `balance-game/`, `mentoring` 관련 디렉토리 등으로 분산되어 있다
- `src/features/` 기반 구조와 전통적인 `components/`, `hooks/queries/` 구조가 공존한다. 신규 변경 시 xkdl 한 PR 안에서 구조를 섞어 바꾸지 않는다

### 스타일링

- Tailwind CSS 4 + `@tailwindcss/postcss` 플러그인
- 클래스 유틸리티: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- `prettier-plugin-tailwindcss`로 Tailwind 클래스 정렬
- `src/app/global.css`에서 CSS 변수로 테마 관리
- `src/app/global.css`의 `@theme inline`에서 기본 토큰(`--color-*`, `--radius-*`, `--spacing-*`, `--shadow-*`)을 초기화하므로 기본 Tailwind 스케일 클래스(`p-4`, `rounded-lg`, `shadow-md`, `text-sm` 등) 사용 금지. 프로젝트 커스텀 토큰(`p-200`, `rounded-150`, `shadow-2`, `font-designer-*`, `text-text-*`)만 사용

### 인증 플로우

1. OAuth 로그인 (카카오/구글) → 서버에서 JWT access + refresh 토큰 발급
2. `accessToken`은 쿠키에 저장 (JS 접근 가능), `refresh_token`은 httpOnly 쿠키에 저장
3. Axios 인터셉터가 `AUTH001` 에러 감지 → 토큰 갱신 → 실패한 요청 재시도 (중복 갱신 방지를 위한 큐 사용)
4. 미들웨어가 서버 측에서 네비게이션 시 토큰 검증, 유효하지 않으면 `/`로 리다이렉트

### 에러 핸들링

에러 처리는 `src/utils/error-handler.ts`를 중심으로 중앙 집중식 관리한다. `src/utils/error.ts`는 `extractErrorCode()` 하위 호환성용 deprecated 래퍼다.

#### 핵심 파일

- `src/utils/error-handler.ts` — `analyzeError()`, `logError()`, `ErrorType`, `ErrorInfo`. 에러 코드-메시지 매핑(~40개), 한국어 fallback, Sentry 보고를 모두 담당
- `src/config/query-client.ts` — `MutationCache` 글로벌 에러 핸들러. `onError`가 없는 mutation 실패 시 자동으로 에러 toast + Sentry 보고
- `src/app/(service)/error.tsx`, `(landing)/error.tsx`, `(admin)/error.tsx` — route segment 에러 경계
- `src/app/global-error.tsx` — root 에러 경계 (Sentry 자동 캡처)
- `src/app/not-found.tsx` 및 각 route group의 `not-found.tsx`

#### 에러 분류 체계

`analyzeError()`는 3가지 에러 타입을 순서대로 분류한다:

1. **AxiosError** — `isAxiosError()` 통과. HTTP 상태 코드 + API 에러 응답 추출
2. **ApiError** — axios 인터셉터가 변환한 커스텀 에러. `isApiError()` 타입 가드로 `errorCode`, `statusCode` 보존
3. **일반 Error / unknown** — fallback 처리

```
AxiosError → isAxiosError() ✅ → HTTP 상태/에러 코드 추출
ApiError   → isApiError() ✅   → errorCode/statusCode 보존 (인터셉터 변환 에러)
Error      → instanceof Error  → UNKNOWN 타입
unknown    → String(error)     → 기본 메시지
```

#### 에러 코드-메시지 매핑

`error-handler.ts`의 `codeMessages` 객체에서 중앙 관리. 에러 코드 prefix별 분류:

| Prefix | 도메인 | 예시 |
|--------|--------|------|
| AUTH | 인증 | AUTH001(토큰 만료), AUTH002(권한 없음) |
| CMM | 공통 | CMM001(입력값 오류), CMM006(접근 권한) |
| MEM | 회원 | MEM002(회원 미존재), MEM003(중복 가입) |
| GSM/GSA | 스터디 관리/신청 | GSM001(스터디 미존재), GSA003(정원 초과) |
| HWK/EVL | 과제/평가 | HWK003(제출 기간 만료), EVL002(중복 평가) |
| PAY 2xx | 결제 | PAY202(중복 승인), PAY207(금액 불일치) |
| PAY 3xx | 환불 | PAY302(중복 환불), PAY307(환불 불가) |
| FILE | 파일 | FILE001(업로드 실패), FILE002(형식 미지원) |

매핑에 없는 코드는 백엔드 `message`가 한국어이면 그대로 사용(`/[가-힣]/` 정규식). 에러 코드를 사용자에게 직접 노출하지 않는다.

#### Mutation 에러 글로벌 핸들러

`query-client.ts`의 `MutationCache.onError`가 안전망 역할:

- `onError` 핸들러가 없는 mutation 실패 시 자동으로 에러 toast 표시 + Sentry 보고
- 개별 `onError`가 있으면 글로벌 핸들러 스킵 (중복 방지)
- Query 에러는 글로벌 핸들러 미적용 (다중 동시 실패 시 toast 폭주 방지)

#### 클라이언트 에러 처리 원칙

- 복구 가능한 실패 (`recoverable`): 사용자 흐름을 유지한다. Inline error를 우선하고, Toast를 보조적으로 사용한다. **브라우저 시스템 `alert()`는 사용하지 않는다** — Toast(`useToastStore`)를 사용한다
- 사용자 판단이 필요한 실패 (`action required`): 다음 행동을 선택해야 할 때 Modal 또는 앱 내 확인 UI를 사용한다. 브라우저 시스템 `alert()`는 사용하지 않으며 기존의 디자인 시스템을 활용한다
- 치명적 실패 (`fatal`, page-level): 특정 화면이 더 이상 정상 동작할 수 없을 때 route segment의 `error.tsx` 또는 client error boundary를 사용한다
- 애플리케이션 전체 실패 (`critical`, app-level): hydration mismatch, 인증 컨텍스트 붕괴, 전역 provider 오류처럼 앱 전체에 영향을 주는 경우 `global-error.tsx`가 잡고 Sentry로 자동 보고

Toast 사용 패턴:

```typescript
// 컴포넌트 내부 (React hook 사용)
const showToast = useToastStore((state) => state.showToast);
showToast('환불 요청이 접수되었습니다.', 'success');

// Hook / React 외부 (getState 사용)
useToastStore.getState().showToast(errorInfo.userMessage, 'error');
```

`<GlobalToast />`는 `(service)`, `(landing)`, `(admin)` 세 레이아웃 모두에 마운트되어 있다.

#### 서버 에러 처리 원칙

- SSR/Server Component에서 필수 데이터 로딩에 실패해 페이지가 성립하지 않으면 예외를 다시 던져 `error.tsx`로 보낸다
- 리소스가 존재하지 않는 케이스는 `notFound()`로 분기한다
- `fetchQuery()` / `prefetchQuery()`의 `queryFn`은 `undefined`를 반환하면 안 된다. 404는 `notFound()`, 그 외는 반드시 `throw error`

예: `src/api/endpoints/group-study/get-group-study-detail.server.ts`는 `GSM001`이면 `notFound()`, 나머지 에러는 `throw error` 한다

```typescript
export default async function Page() {
  const data = await fetchData();
  return <PageView data={data} />;
}
```

불필요한 `try/catch`로 에러를 삼켜 `undefined`를 반환하지 않는다.

#### 운영 보안 원칙

- Production에서는 `stack trace`, 원문 서버 메시지, 내부 경로, 민감한 백엔드 응답을 사용자 화면에 직접 노출하지 않는다
- 3개 `error.tsx` 모두 `process.env.NODE_ENV === 'development'` 게이팅 적용: technicalMessage, error.message, error.stack은 개발 환경에서만 표시
- 사용자 화면에는 일반화된 `userMessage`, 필요 시 `errorCode`, `statusCode`, `digest` 정도만 노출한다
- `digest`는 서버 로그 또는 Sentry에서 원인을 찾기 위한 추적용 식별자로 사용한다
- API route에서도 production 응답에는 상세 `details`를 그대로 넣지 않는 방향을 기본 원칙으로 삼는다

#### 성공 페이지 원칙

- 스터디 생성, 스터디 참여, 결제 완료 같은 주요 성공 이벤트는 별도 success page 또는 완료 화면으로 사용자의 다음 행동을 명확히 안내한다
- 브랜딩 요소는 환영 문구, 운영팀 메시지, 후속 행동 CTA 중심으로 넣고, 정보량이 많은 경우에도 핵심 CTA를 먼저 보이게 한다

#### 모니터링 (Sentry)

`@sentry/nextjs`가 통합되어 있다. 에러는 `logError()` → `Sentry.captureException()` 경로로 자동 보고된다.

- **SDK 설정 파일**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` (프로젝트 루트)
- **Next.js instrumentation**: `src/instrumentation.ts` — 서버/엣지 런타임 초기화 + `onRequestError` 자동 캡처
- **next.config.ts**: `withSentryConfig()` 래핑 — 소스맵 업로드, 트리셰이킹
- **환경 변수**: `NEXT_PUBLIC_SENTRY_DSN` (런타임), `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` (CI 소스맵 업로드)
- **환경 감지**: `NEXT_PUBLIC_API_BASE_URL` 기반으로 `production` / `staging` / `development` 자동 분류
- **필터링**: AUTH001(토큰 만료)은 정상 플로우이므로 `beforeSend`에서 Sentry 보고 제외
- **성능**: `tracesSampleRate: 0.1` (10%), Session Replay는 에러 시에만 기록 (`replaysOnErrorSampleRate: 1.0`)
- DSN이 없으면 Sentry가 초기화되지 않으므로, 로컬 개발에서는 환경 변수 없이도 정상 동작한다
- 운영 단계에서는 Slack 즉시 알림을 연동할 수 있지만, 노이즈를 줄이기 위해 임계치와 대상 에러 범위를 먼저 정의한다

### 경로 별칭

`@/*`는 `./src/*`에 매핑됨 (tsconfig.json에서 설정)

## 주요 컨벤션

- **커밋 메시지**: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`, `chore:`
- **브랜치 전략**: Feature 브랜치 → `develop` (스테이징: test.zeroone.it.kr) → `main` (프로덕션: www.zeroone.it.kr)
- **ESLint 설정**: RushStack 기반, strict TypeScript, React hooks, TanStack Query 플러그인, 임포트 정렬 (알파벳 + 그룹별)
- **Prettier**: 80자 너비, 작은따옴표, trailing comma, 2칸 들여쓰기
- **SVG 처리**: `@svgr/webpack`이 next.config.ts에 설정되어 SVG를 React 컴포넌트로 임포트 가능

## 문서화 규칙

- 기능 개발 또는 버그 수정을 완료한 직후 **자동으로** `/doc` 커맨드를 실행해 `docs/` 폴더에 문서를 생성한다.
- `/doc`는 `.claude/commands/doc.md`에 정의된 **로컬 프로젝트 커맨드**다. `Skill` tool 없이 파일의 지시를 직접 따른다.
- 유형 판별은 브랜치명이 아닌 **커밋 메시지와 코드 패턴**으로만 한다.

## 환경 변수

개발에 필요한 주요 `NEXT_PUBLIC_*` 변수:

- `NEXT_PUBLIC_API_BASE_URL` — 백엔드 API 엔드포인트
- `NEXT_PUBLIC_KAKAO_CLIENT_ID` — 카카오 OAuth
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — 구글 OAuth
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` — 토스페이먼츠
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN (없으면 Sentry 비활성화)
- `SENTRY_ORG` — Sentry 조직 (CI 소스맵 업로드용)
- `SENTRY_PROJECT` — Sentry 프로젝트 (CI 소스맵 업로드용)
- `SENTRY_AUTH_TOKEN` — Sentry 인증 토큰 (CI 소스맵 업로드용)
