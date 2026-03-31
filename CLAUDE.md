# CLAUDE.md

이 파일은 Claude Code(claude.ai/code)가 본 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 핵심 규칙 (모든 작업 전 반드시 숙지)

### 구현 시 행동 원칙

- **탐색은 최대 2~3개 파일로 제한**. 탐색·계획에 세션을 소비하지 않는다. 파일 경로와 API 계약을 파악했으면 즉시 코드 작성을 시작한다.
- **API 엔드포인트 조작 금지**. 존재하지 않는 엔드포인트를 임의로 만들지 않는다. 반드시 `src/hooks/queries/`, `src/api/`, `src/api/openapi/` 에서 실제 API를 확인한 뒤 사용한다. 없으면 TODO 플레이스홀더를 남기고 사용자에게 알린다.
- **코드 리뷰·정리 시 한 번에 전부 수정**. 동일 파일에 여러 번 패스하지 않는다. 발견된 모든 이슈를 단일 패스로 처리한다.

### 구현 완료 기준

코드를 작성·수정한 직후, **아래 3가지를 모두 통과해야 완료**로 간주한다:

```bash
yarn lint:fix       # ESLint 자동 수정
yarn prettier:fix   # Prettier 포맷 적용
yarn typecheck      # 타입 에러 없음 확인
```

- 타입 변경이 없는 UI 수정은 `yarn typecheck` 생략 가능
- "prettier 정리", "lint 수정" 단독 커밋은 이 기준을 지키지 않았다는 신호
- 수정 범위가 넓더라도 lint/prettier는 **수정한 파일 범위 내에서만** 실행 (관련 없는 파일 개선 금지 원칙과 충돌하지 않음)

### 코드 컨벤션 (자동 적용)

- `className` 조합은 항상 `cn()` 사용. 템플릿 리터럴 className 금지.
- Tailwind 임의값(`p-[4px]`, `w-[320px]`) 금지. 프로젝트 커스텀 토큰 사용.
- 색상·간격 하드코딩 금지. `global.css`의 `@theme inline` 토큰만 사용.

---

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

## 도메인 혼동 주의: 멘토링 vs 멘토스터디

### 멘토링 (1:1 개인 상담)
- **URL**: `/mentoring`, `/mentoring/[id]`, `/mentoring/[id]/apply`, `/mentoring/become-mentor`
- **피처**: `src/features/mentoring/`
- **API 훅**: `useMentorDirectoryQuery`, `useMentorDetail`, `useMentoringApplyController` 등
- **백엔드 엔드포인트**: `/api/v1/mentors`
- **성격**: 전문 멘토와 학습자의 1:1 상담. 별도 신청·수락 흐름. 과제·멤버 관리 없음.

### 멘토스터디 (그룹 스터디의 프리미엄 유형)
- **URL**: `/premium-study`, `/premium-study/[id]`
- **컴포넌트**: `src/components/pages/premium-study-*.tsx`, `src/app/(service)/premium-study/`
- **API 훅**: `useGetGroupStudyDetail`, `useGetGroupStudyList` (GroupStudy 훅 공용)
- **백엔드 엔드포인트**: `/api/v1/group-studies` (쿼리 파라미터로 MENTOR_STUDY 구분)
- **성격**: 그룹 스터디의 특수 유형(MentorStudy extends GroupStudy). 멤버 관리·과제·평가 포함.

### 핵심 차이 요약

| | 멘토링 | 멘토스터디 |
|---|---|---|
| 참여 형태 | 1:1 | 1:N 그룹 |
| 프론트 URL | `/mentoring/*` | `/premium-study/*` |
| API 경로 | `/api/v1/mentors` | `/api/v1/group-studies` |
| 엔티티 | `Mentor`, `MentoringApplication` | `MentorStudy extends GroupStudy` |
| 과제·평가 | 없음 | 있음 |

---

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

**useMutation 콜백 패턴:**

`onSettled`는 성공/실패 무관하게 항상 실행된다 (`finally` 블록과 동일). 성공 시에만 필요한 동작(페이지 이동, 성공 토스트)은 반드시 `onSuccess`에, 실패 처리는 `onError`에, UI 정리(모달 닫기, 상태 초기화)는 `onSettled`에 배치한다.

```typescript
// 올바른 패턴
mutate(params, {
  onSuccess: () => {
    showToast('완료되었습니다.');
    router.push('/list'); // 성공 시에만 이동
  },
  onError: () => {
    showToast('실패하였습니다.', 'error');
  },
  onSettled: () => {
    setConfirmAction(null); // 항상 UI 초기화
  },
});
```

**queryKey 컨벤션:**

- 단일 리소스: `['mission', missionId]`
- 목록 리소스: `['missions', groupStudyId, page, size]`
- 무효화 시 상위 키 사용: `queryKey: ['missions']` (해당 리소스 전체 무효화)
- mutation이 여러 리소스에 영향을 줄 경우 관련 queryKey를 모두 무효화:

```typescript
onSuccess: async (_, variables) => {
  // 신청자 상태 변경 → 멤버 목록 + 신청자 목록 모두 갱신
  await queryClient.invalidateQueries({ queryKey: ['groupStudyMemberList', variables.groupStudyId] });
  await queryClient.invalidateQueries({ queryKey: ['entryList', variables.groupStudyId] });
},
```

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

### 백엔드 데이터 처리 안전 패턴

빈 배열 안전성은 상위 컴포넌트의 `if (!arr?.length) return null` 가드로 이미 보장되므로 `Math.max` 호출 전 별도 방어 코드는 불필요하다.

#### optional 필드를 React key와 핸들러에서 안전하게 사용하기

백엔드에서 optional(`?`)로 내려오는 ID 필드를 React `key` prop에 직접 사용하면 여러 항목이 `undefined`로 중복되어 React가 잘못된 DOM 재사용을 할 수 있다. `??` 연산자로 `index` 폴백을 둔다.

```typescript
// 잘못된 패턴 — missionId가 undefined이면 모든 항목이 key="undefined"로 중복
{items.map((item) => <div key={item.missionId}>...</div>)}

// 올바른 패턴 — optional 필드 ?? index
{items.map((item, index) => <div key={item.missionId ?? index}>...</div>)}
```

optional 필드를 이벤트 핸들러 내에서 사용할 때도 가드가 필요하다:

```typescript
// 잘못된 패턴 — missionId가 undefined이면 ?missionId=undefined 라우팅
const handleClick = (id: number) => router.push(`...?missionId=${id}`);

// 올바른 패턴 — 복구 가능한 실패는 Toast로 안내
const handleClick = (id: number | undefined) => {
  if (!id) {
    showToast('정보를 불러올 수 없습니다.', 'error');
    return;
  }
  router.push(`...?missionId=${id}`);
};
```

#### enum-like 문자열 타입 단언 안전 가드

백엔드에서 프론트 타입 정의에 없는 값이 올 수 있다. `as StudyType` 같은 단순 타입 단언 대신 `in` 가드 + 폴백을 사용한다. TypeScript `as`는 런타임을 보호하지 않는다.

```typescript
// 잘못된 패턴 — 알 수 없는 값 수신 시 undefined 렌더링 또는 런타임 오류
const studyType = type as StudyType;
<Badge>{STUDY_TYPE_LABELS[studyType]}</Badge>

// 올바른 패턴 — in 가드 후 폴백 처리
const studyType =
  type && type in STUDY_TYPE_LABELS ? (type as StudyType) : undefined;
<Badge>{studyType ? STUDY_TYPE_LABELS[studyType] : '스터디'}</Badge>

// 목록 순회 시
{experienceLevels?.map((level) => (
  <Badge key={level}>
    {level in EXPERIENCE_LEVEL_LABELS
      ? EXPERIENCE_LEVEL_LABELS[level as ExperienceLevel]
      : level}
  </Badge>
))}
```

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

- **커밋 메시지**: `feat :`, `fix :`, `refactor :`, `style :`, `docs :`, `test :`, `chore :` (콜론 앞뒤 공백 포함)
  - 커밋 메시지는 반드시 **한국어**로 작성한다.
  - 최소한 **변경 대상, 핵심 동작 변화, 수정 의도**가 드러나야 한다.
  - `fix: 수정`, `fix: 리뷰 반영`, `refactor: 정리`처럼 모호한 메시지는 금지한다.
  - 좋은 예: `fix : 명예의 전당 MVP 카드에 서버 weekDate 라벨 반영`
  - 좋은 예: `feat : 1대1 리뷰 모달에 대상 주차 정보 표시`
  - 나쁜 예: `fix : 명예의 전당 MVP 주차 라벨 정리`
- **브랜치 전략**: Feature 브랜치 → `develop` (스테이징/QA: test.zeroone.it.kr) → `main` (프로덕션/운영: www.zeroone.it.kr)
- **ESLint 설정**: RushStack 기반, strict TypeScript, React hooks, TanStack Query 플러그인, 임포트 정렬 (알파벳 + 그룹별)
- **Prettier**: 80자 너비, 작은따옴표, trailing comma, 2칸 들여쓰기
- **SVG 처리**: `@svgr/webpack`이 next.config.ts에 설정되어 SVG를 React 컴포넌트로 임포트 가능

## 문서화 규칙

- 기능 개발 또는 버그 수정을 완료한 직후 **자동으로** `/doc` 커맨드를 실행해 `docs/` 폴더에 문서를 생성한다.
- `/doc`는 `.claude/commands/doc.md`에 정의된 **로컬 프로젝트 커맨드**다. `Skill` tool 없이 파일의 지시를 직접 따른다.
- 유형 판별은 브랜치명이 아닌 **커밋 메시지와 코드 패턴**으로만 한다.

### 버그 수정 문서 (`bugfix-*.md`) 필수 서술 흐름

문서는 반드시 아래 3단계 서술 구조를 따른다. "WHAT을 바꿨나"가 아니라 **"WHY → HOW & WHY THIS → RESULT"** 흐름으로 작성한다.

1. **문제 파악** — 어떤 문제가 있었는가
   - 증상: 사용자 관점에서 어떤 상황에서 무슨 문제가 발생했는가
   - 근본 원인: 코드 레벨에서 왜 이 버그가 생겼는가 (문제 코드 + 발생 흐름)
2. **해결 — 어떻게 & 왜 이 방법인가**
   - 선택한 접근법과 그 이유 (수정 전/후 코드)
   - **고려했지만 선택하지 않은 대안**: 다른 해결 방식은 없었는지, 왜 선택하지 않았는지 명시
3. **결과** — 수정 후 무엇이 달라졌는가 (UX 변화, 동작 변화, 재발 방지 포인트)

### 기능 개발 문서 (`feature-*.md`) 필수 서술 흐름

1. **배경 — 왜 필요했나**
   - 이 기능이 없을 때 어떤 불편함·한계가 있었는가. 어떤 사용자 문제를 해결하는가
2. **구현 — 어떻게 & 왜 이 방법인가**
   - 핵심 접근법과 선택 이유 (핵심 코드 + 구현 흐름)
   - **고려한 다른 구현 방식**: 대안이 있었다면 왜 선택하지 않았는지 명시
3. **결과** — 구현 후 무엇이 가능해졌는가 (사용자·개발자 관점 변화)

## Claude 커맨드 & 스킬

### 로컬 커맨드 우선 원칙

이 프로젝트에는 `.claude/commands/`에 프로젝트 특화 커맨드가 정의되어 있다.
**전역 스킬보다 로컬 커맨드를 항상 우선 사용한다.**

| 작업 | 사용할 커맨드 | 사용하지 말 것 |
|------|------------|-------------|
| 코드 리뷰 | `/review` | `coderabbit:review`, `code-review:code-review` |
| 커밋 | `/commit` | `sc:git`, `everything-claude-code:*` |
| PR 생성 | `/pr` | `pr-creator` 에이전트 |
| 문서 생성 | `/doc` | `sc:document` |
| 구현 | `/implement` | `sc:implement`, `everything-claude-code:plan` |
| 개념 설명 | `/explain` | `sc:explain` |
| 신뢰 자료 | `/ref` | (에이전트 직접 호출 불필요) |

`sc:*` 시리즈(SuperClaude)와 `everything-claude-code:go-*`, `everything-claude-code:springboot-*` 등 백엔드·Go 관련 전역 스킬은 **이 프로젝트에서 사용하지 않는다.**

단, 아래 `sc:` 커맨드는 **로컬에 동등한 커맨드가 없으므로 예외적으로 사용 가능**하다:

| `sc:` 커맨드 | 용도 |
|-------------|------|
| `sc:research` | 특정 주제 깊은 웹 리서치 (로컬 `/ref`는 구현 근거 인용 목적, 리서치 목적과 다름) |
| `sc:brainstorm` | 요구사항 탐색·아이디어 발산 대화 |
| `sc:estimate` | 개발 공수 산정 |

### 자주 사용하는 커맨드

```bash
/commit                    # lint:fix → prettier:fix → typecheck → 커밋 메시지 생성 → 커밋 실행
/review                    # 변경 파일 자동 감지 → 8기준 리뷰 + 프로젝트 특화 에이전트 연계
/review-pr <PR번호>        # CodeRabbit 코멘트 수용/기각 + 독립 리뷰 + 수정 계획
/pr                        # develop 대상 GitHub PR 자동 생성
/explain <개념>            # 프레임워크 개념을 프로젝트 코드 예시와 함께 설명
/doc                       # 작업 완료 후 docs/ 문서 자동 생성 (완료 후 /ref 제안)
/ref <작업>                # MDN·OWASP·공식 문서 근거로 작업 수행 또는 인용 첨부
```

### 브라우저 검증 (staging-verify 스킬)

스테이징 환경 URL: `https://test.zeroone.it.kr`

"크롬에서 확인해줘 (스터디 id: XXX)" 형태로 요청하면 Chrome DevTools MCP로 자동 검증.
지원 패턴:

- 그룹스터디 상세: `/group-study/{id}`
- 미션 탭: `/group-study/{id}?tab=mission`
- 평가 탭: `/group-study/{id}?tab=evaluation`

### 커밋 리뷰 (commit-reviewer 에이전트)

"이 커밋 문제 없는지 봐줘", "변경사항 로직 문제 있는지 파악해줘" 등 요청 시 자동 활성화.
프로젝트 컨벤션(OpenAPI 우선, queryKey 패턴, staleTime 60초) 기준으로 검토.

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

---

## 백엔드 계약 검증 규칙

- 프론트에서 API 응답/요청 계약, DTO shape, 서버 검증 규칙, 저장 가능 여부를 판단해야 할 때는 이 저장소 안의 추정만으로 결론내리지 않는다.
- 반드시 sibling 백엔드 저장소 `~/coding_stuffs/study-platform-mvp`를 함께 확인해 현재 실제 DTO, 서비스 검증, 엔티티 저장 구조를 기준으로 판단한다.
- 특히 멘토링처럼 프론트 수제 schema와 백엔드 DTO가 따로 진화할 수 있는 영역은 `src/api/openapi/` 또는 프론트 mapper만 source of truth로 취급하지 않는다.

## 개발 계획 / 백로그 규칙

- 코드 수정, 리팩토링, 설계 변경, API 추가, DDL 변경처럼 실제 개발 작업에 들어가기 전에는 반드시 먼저 백로그 문서를 작성한다.
- 백로그 문서는 항상 `personal_space/YYYY-MM-DD/적당한이름_BACKLOG.md` 경로에 작성한다.
- 이미 같은 주제의 백로그를 완료했다면 기존 파일명에는 `(완)`을 붙여 보관하고, 새 백로그는 숫자를 이어 붙인 새 파일로 만든다.
- 개발 계획은 `차수` 단위 backlog 형식으로 작성한다. 각 차수는 "AI가 한 번의 프롬프트로 끝까지 수행할 수 있는 정도"의 분량으로 자른다.
- 각 차수에는 최소한 `작업내용`, `논의 필요`, `선택지`, `추천`, `사용자 방향` 항목이 있어야 한다.
- `사용자 방향`이 비어 있으면 `추천` 기준으로 진행한다.

## 구현 원칙

- 값이 진실의 원천(source of truth)이 되도록 설계한다. 반복 비교되는 값은 한 곳에서 `const 객체 + literal union`으로 선언하고, 분기와 매핑은 그 값을 기준으로 작성한다.
- raw 문자열을 분기 곳곳에 흩뿌리지 않는다. 같은 의미를 두 번 이상 비교해야 하면 상수 객체로 승격한다. 단, 한 파일 내부에서만 쓰이는 값까지 전부 상수화하지 않는다.
- TypeScript `enum`은 런타임 산출물이 실제로 필요한 경우에만 사용한다. 기본값은 `as const` 객체와 literal union 조합이다.
- Single Responsibility Principle(단일 책임 원칙)을 지킨다. 파일, 함수, 훅, 컴포넌트는 가능한 한 하나의 이유로만 변경되게 유지한다. 정책 선언, 상태 해석, 부수효과 실행, UI 렌더링은 분리한다.
- 조건 분기를 줄인다. 깊은 `if` 중첩보다 의미 있는 상태 변수, 조기 반환, 매핑 테이블, 작은 보조 함수/컴포넌트 분리를 우선한다.
- 주석은 필요한 곳에만 단다. 이름만으로 충분한 타입, 자명한 필드에는 장문 주석을 붙이지 않는다. "무엇인가"보다 "왜 따로 존재하는지", "비슷한 타입과 무엇이 다른지"를 설명할 때만 단다.
- 로그 메시지, 오류 메시지, 실패 이유 문자열은 한국어를 기본으로 한다.

## 코드 리뷰 원칙

- 목표는 "어떤 리뷰가 와도 상태 전이, source of truth, 실패 경계, 사용자 영향까지 근거로 설명하고 방어할 수 있는 코드"를 만드는 것이다.
- 리뷰어가 문제 삼을 수 있는 상태 오염 가능성 자체를 먼저 제거하는 방어적 리팩토링을 우선한다.
- 사용자가 코드리뷰를 요청하면 `critical 3개 이상`, `major 3개 이상`, `minor 3개 이상`의 검토 포인트를 찾는 것을 기본 목표로 삼는다.
- 상태 정합성 중심으로 검토한다. 정상 흐름만 보지 말고 상태가 깨지는 지점을 먼저 의심한다.
- 먼저 source of truth를 식별한다. 원본 상태와 파생 상태를 구분한다.
- `set/save/write/add` 로직을 보면 `delete/clear/remove/reset` 로직도 반드시 함께 확인한다.
- 캐시, 파생값, 메모이즈, 저장소, 폼 상태처럼 원본을 복제하는 구조는 원본 변경 시 함께 갱신되거나 폐기되는지 확인한다.
- 비동기 로직은 항상 순서 뒤집힘과 레이스를 의심한다.
- 리뷰 기준은 "맞아 보이는가"가 아니라 "거짓 상태가 남을 수 있는가"다.
- 리뷰 체크리스트: 이 값의 원본은 무엇인가? 실패하면 이전 상태가 남는가? 로그아웃·만료·예외 시 정리되는가? 서버와 클라이언트 규칙이 같은가? 여러 번 실행해도 상태가 꼬이지 않는가?

## 스타일링 절대 규칙 (강제)

- Tailwind v4 CSS-first 설정(`@theme`, `@utility`, `@plugin`) 사용.
- `@theme inline`에서 `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`를 초기화하고 프로젝트 토큰으로 재정의.
- **사용 금지**: `p-4`, `mt-2`, `text-sm`, `rounded-lg`, `shadow-md`, 기본 팔레트 기반 `bg-*/text-*` 같은 기본 스케일 클래스.
- **사용 가능**: `flex`, `grid`, `hidden`, `absolute`, `items-center`, `justify-between` 같은 구조/레이아웃 유틸리티.
- spacing/radius/shadow/color는 반드시 프로젝트 토큰 스케일(`p-200`, `gap-100`, `rounded-150`, `text-text-*`, `bg-background-*`, `shadow-*`) 또는 공용 유틸리티를 사용.

### 전역 CSS 수정 규칙

- `globals.css` 또는 전역 스타일 파일은 토큰, 최소 reset, 서드파티 에디터 스타일만 다룬다.
- 화면 전용 스타일, 특정 기능 전용 스타일, 임시 수정용 스타일을 전역 CSS에 추가하지 않는다.
- `global.css`에는 도메인 전용 클래스(`mentor-*`, `mentoring-*` 등)를 새로 만들지 않는다. 공용 토큰/공용 유틸리티만 추가한다.

### Tailwind 클래스 작성 규칙

- Tailwind 클래스는 반드시 정적 문자열로 작성한다. 동적 클래스 생성(`p-${size}`, `bg-${color}-500`) 금지.
- Tailwind 임의값 클래스(`w-[240px]`, `mt-[2px]`, `z-[9999]` 등) 사용 금지.
- 필요한 값이 기존 토큰에 없으면 `src/app/global.css`에 재사용 가능한 공용 `@utility` 또는 토큰으로 승격한 뒤 사용.
- 반복되는 스타일 패턴은 `className` 복붙이 아니라 공통 UI 컴포넌트 또는 variant로 승격.

### 스타일 미적용 시 필수 확인 절차

1. DOM에 해당 `className`이 실제로 붙어 있는지 확인
2. 해당 Tailwind 유틸리티 CSS가 실제로 생성되었는지 확인
3. 다른 CSS 선택자 또는 전역 스타일이 덮어쓰는지 확인
4. `padding`/`margin`이 적용되었지만 `height`, `overflow`, `flex`, `box-sizing` 때문에 체감상 안 보이는지 확인
- 위 확인 없이 `!important`, 인라인 스타일, 불필요한 래퍼 추가로 문제를 덮지 않는다.

### 디자인 시스템 우선 규칙

- 버튼, 입력창, 카드, 모달 액션, 필터 버튼, 아이콘 버튼은 새로 만들기 전에 기존 공통 컴포넌트를 먼저 찾는다.
- shadcn 기반 컴포넌트와 프로젝트 디자인 토큰을 우선 사용한다.
- 같은 시각 패턴이 2번 이상 반복되면 공통 컴포넌트화 후보로 본다.

### 스타일 작업 보고 규칙

- 스타일 관련 변경 시 반드시 함께 보고: 왜 수정했는지, 전역 CSS를 건드렸는지, 공통 컴포넌트로 승격했는지, UI 변경 없이 구조만 바뀌었는지, 위험 포인트가 있는지.

## 구조 리팩토링 작업 원칙

- 리팩토링은 기능 추가나 UI 변경이 아니라, 기존 동작과 사용자 경험을 유지한 채 구조를 더 예측 가능하고 일관되게 만드는 것을 목표로 한다.
- 우선순위: 기능 동작 유지 > UI/UX 결과 유지 > 책임 분리 개선 > 공통 패턴 재사용 > 데이터 계약과 타입 구조 명확화 > 파일 구조 정리.

## Next.js App Router 규칙

- `app/` 영역은 라우팅, 서버 경계, 초기 데이터 연결 같은 Next 전용 책임만 가진다.
- 페이지 파일은 가능한 한 얇게 유지한다.
- 실제 화면 로직과 인터랙션은 `app/` 바깥의 클라이언트 컴포넌트로 분리한다.
- 상위 레벨에 광범위하게 `use client`를 추가하지 않는다.

## 화면 구성 규칙

- 큰 화면은 하나의 파일에 몰아넣지 않는다.
- `Header`, `Filters`, `Content`, `ViewMode`, `List`, `Grid` 같은 조립 가능한 단위로 분리한다.
- 정렬, 필터, 뷰모드, 페이지 크기 같은 규칙은 UI 바깥으로 분리한다.

## UI / Hook 책임 분리 규칙

- UI 컴포넌트는 표현과 입력 전달에 집중한다.
- API 선택, 분기 판단, 순서 제어, 부수효과 orchestration은 Hook 또는 model 계층이 맡는다.
- UI가 정책 판단과 데이터 흐름 제어까지 직접 담당하지 않도록 한다.

## 비동기 데이터 처리 규칙

- 서버 상태 관리는 TanStack Query를 우선 사용한다.
- API 함수는 가능한 한 순수한 요청/응답에 집중한다.
- 컴포넌트나 화면 단에서 반복되는 `try/catch + throw` 패턴을 직접 만들지 않는다.
- 조회 훅은 `useXXXQuery`, 변경 훅은 `useXXXMutation` 형태로 네이밍한다.

## 데이터 계약 / 타입 구조 규칙

- API 응답, 폼 입력, 내부 모델 변환은 schema 중심으로 관리한다.
- Zod schema를 데이터 계약의 기준으로 사용한다.
- 공통 도메인 타입, API DTO 타입, schema 추론 타입, UI props 타입을 구분한다.

## PR 작성 규칙

- 리팩토링 PR에는 아래를 반드시 포함한다:
  - 무엇을 왜 바꿨는지
  - 기능/UI 결과 유지 여부
  - 책임 분리 개선 내용
  - 공통 패턴 재사용 또는 승격 여부
  - 전역 CSS / app 경계 / 타입 구조 변경 여부
  - 잠재적인 영향 범위

## Shared 컴포넌트 경계 규칙

- `components/`는 shared UI only. 도메인 의미가 들어가면 shared가 아니다.
- feature 전용 컴포넌트는 반드시 `features/...` 아래에 둔다.
- "app 바깥으로 분리"는 "components로 이동"을 의미하지 않는다.
- 먼저 feature 내부에 두고, 재사용 근거가 생길 때만 shared로 승격한다.
