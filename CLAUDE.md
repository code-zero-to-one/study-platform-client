# CLAUDE.md

This file is a reference guide for Claude Code (claude.ai/code) when working with this repository.

## Core Rules (Must Review Before All Tasks)

### Implementation Principles

- **Limit exploration to 2–3 files max.** Do not spend the session on exploration or planning. Once you know the file path and API contract, start writing code immediately.
- **Never fabricate API endpoints.** Do not invent endpoints that don't exist. Always verify real APIs in `src/hooks/queries/`, `src/api/`, `src/api/openapi/` before using them. If not found, leave a TODO placeholder and inform the user.
- **Fix all issues in a single pass during code review.** Do not make multiple passes on the same file. Handle all discovered issues in one pass.

### Completion Criteria

After writing or modifying code, **all 3 of the following must pass to consider the task complete**:

```bash
yarn lint:fix       # ESLint auto-fix
yarn prettier:fix   # Prettier format
yarn typecheck      # No type errors
```

- `yarn typecheck` can be skipped for UI-only changes with no type modifications
- Standalone "prettier cleanup" or "lint fix" commits signal this criterion was not met
- Even for broad changes, lint/prettier runs only **within the scope of modified files** (consistent with the no-unrelated-improvements principle)

### Code Conventions (auto-applied)

- Always use `cn()` for `className` composition. No template literal classNames.
- No Tailwind arbitrary values (`p-[4px]`, `w-[320px]`). Use project custom tokens.
- No hardcoded colors/spacing. Use only `@theme inline` tokens from `global.css`.

---

## Project Overview

ZERO-ONE Study Platform — A 1:1 morning study platform to start every day together. Built on Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 4. Package manager: **Yarn 1.22+**, Node.js >=20 required.

## Commands

```bash
yarn dev              # Run Turbopack dev server
yarn build            # Production build
yarn lint             # ESLint check
yarn lint:fix         # ESLint auto-fix
yarn typecheck        # TypeScript type check (tsc --noEmit)
yarn prettier         # Prettier format check
yarn prettier:fix     # Prettier auto-format
yarn storybook        # Storybook dev server (port 6006)
yarn build-storybook  # Storybook build
yarn generate:api <name>  # Generate API query hook boilerplate (e.g., yarn generate:api bank-search-api)
```

CI pipeline: lint → typecheck → prettier → build → build-storybook → security audit.

## Domain Warning: Mentoring vs MentorStudy

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

## Architecture

### Routing (Next.js App Router)

- `src/app/(landing)/` — public landing page (`/`)
- `src/app/(service)/` — authenticated service pages (home, my-page, payment, premium-study, etc.)
- `src/app/(admin)/` — admin pages (protected by `ROLE_ADMIN` claim in JWT)
- `src/middleware.ts` — auth handling: validates accessToken cookie, auto-refreshes via `/api/v1/auth/access-token/refresh`, checks admin permissions for `/admin/*` paths

### API Layer

**Backend API docs (Swagger):**

- Staging: https://test-api.zeroone.it.kr/v3/api-docs
- Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html

Two communication patterns coexist:

1. **Legacy axios** (`src/api/client/axios.ts`): baseURL `/api/v1/`, token refresh queue (triggers on AUTH001 error). Used for custom endpoints.
2. **OpenAPI auto-generated** (`src/api/openapi/`): Types and services auto-generated from backend Swagger. **Never modify files inside `src/api/openapi/`** — they are regenerated. This directory is excluded from ESLint.

How to add a new API hook:

```bash
yarn generate:api <swagger-api-title-name>
# Creates src/hooks/queries/<name>.ts (with createApiInstance boilerplate)
```

Use the generated API instance in the file to write TanStack Query hooks.

#### TanStack Query Hook Patterns

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

### State Management

- **Zustand** (`src/stores/`): Global client state. `useUserStore` (user info persist), `useLeaderStore`.
- **TanStack Query** (`src/hooks/queries/`): Server state. Domain-specific query hooks (study, payment, evaluation, peer-review, settlement, etc.). Default staleTime: 60 seconds.
- **React Hook Form + Zod** (`src/types/schemas/`): Form state + runtime validation.

### Component Structure

- Shared UI is primarily located under `src/components/common/ui/`. Examples: `Button`, `Dialog`, `Toast`, `FloatingInquiryButton`
- Shared layouts are under `src/components/common/layout/`. Examples: `Header`, `AdminSideBar`
- Shared modals are under `src/components/common/modals/`
- Page-level composite components are in `src/components/pages/`; domain composites are spread across `payment/`, `discussion/`, `archive/`, `balance-game/`, `mentoring`-related directories, etc.
- `src/features/`-based structure and traditional `components/`, `hooks/queries/` structure coexist. Do not mix structures within a single PR for new changes.

### Backend Data Safety Patterns

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

### Styling

- Tailwind CSS 4 + `@tailwindcss/postcss` plugin
- Class utilities: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- `prettier-plugin-tailwindcss` for Tailwind class sorting
- Theme managed via CSS variables in `src/app/global.css`
- `@theme inline` in `src/app/global.css` resets base tokens (`--color-*`, `--radius-*`, `--spacing-*`, `--shadow-*`), so base Tailwind scale classes (`p-4`, `rounded-lg`, `shadow-md`, `text-sm`, etc.) are prohibited. Use only project custom tokens (`p-200`, `rounded-150`, `shadow-2`, `font-designer-*`, `text-text-*`)

### Auth Flow

1. OAuth login (Kakao/Google) → server issues JWT access + refresh tokens
2. `accessToken` stored in cookie (JS-accessible), `refresh_token` in httpOnly cookie
3. Axios interceptor detects `AUTH001` error → refreshes token → retries failed request (queue used to prevent duplicate refreshes)
4. Middleware validates token server-side during navigation, redirects to `/` if invalid

### Error Handling

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

### Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Key Conventions

- **Commit messages**: `feat :`, `fix :`, `refactor :`, `style :`, `docs :`, `test :`, `chore :` (spaces around colon). Write in Korean, "WHY"-focused, under 50 characters.
- **Branch strategy**: Feature branch → `develop` (staging: test.zeroone.it.kr) → `main` (production: www.zeroone.it.kr)
- **ESLint config**: RushStack-based, strict TypeScript, React hooks, TanStack Query plugin, import sorting (alphabetical + by group)
- **Prettier**: 80 char width, single quotes, trailing comma, 2-space indent
- **SVG handling**: `@svgr/webpack` configured in next.config.ts — SVGs can be imported as React components

## Documentation Rules

- Immediately after completing a feature or bug fix, **automatically** run the `/doc` command to generate documentation in the `docs/` folder.
- `/doc` is a **local project command** defined in `.claude/commands/doc.md`. Follow the file's instructions directly without the Skill tool.
- Determine the type from **commit messages and code patterns only**, not from branch name.

### Bugfix document (`bugfix-*.md`) required narrative flow

Documents must follow the 3-step narrative structure below. Write as **"WHY → HOW & WHY THIS → RESULT"**, not "WHAT changed."

1. **Problem** — what was the issue
   - Symptom: what situation caused what problem from the user's perspective
   - Root cause: why this bug occurred at the code level (problematic code + occurrence flow)
2. **Solution — how & why this approach**
   - Chosen approach and reasoning (before/after code)
   - **Alternatives considered but not chosen**: were there other solutions, why weren't they chosen
3. **Result** — what changed after the fix (UX changes, behavior changes, prevention points)

### Feature document (`feature-*.md`) required narrative flow

1. **Background — why it was needed**
   - What inconvenience/limitation existed without this feature. What user problem does it solve?
2. **Implementation — how & why this approach**
   - Core approach and reasoning (key code + implementation flow)
   - **Other implementation approaches considered**: if alternatives existed, why weren't they chosen
3. **Result** — what became possible after implementation (changes from user/developer perspective)

## Claude Commands & Skills

### Local Command Priority Principle

This project has project-specific commands defined in `.claude/commands/`.
**Always use local commands over global skills.**

| Task | Use | Do not use |
|------|-----|-----------|
| Code review | `/review` | `coderabbit:review`, `code-review:code-review` |
| Commit | `/commit` | `sc:git`, `everything-claude-code:*` |
| Create PR | `/pr` | `pr-creator` agent |
| Generate docs | `/doc` | `sc:document` |
| Implementation | `/implement` | `sc:implement`, `everything-claude-code:plan` |
| Explain concepts | `/explain` | `sc:explain` |
| Trusted references | `/ref` | (no need to call agent directly) |

The `sc:*` series (SuperClaude) and backend/Go-related global skills like `everything-claude-code:go-*`, `everything-claude-code:springboot-*` **are not used in this project.**

However, the following `sc:` commands are **exceptionally allowed** since there are no equivalent local commands:

| `sc:` command | Purpose |
|--------------|---------|
| `sc:research` | Deep web research on a topic (local `/ref` is for citing implementation references, different purpose) |
| `sc:brainstorm` | Requirements exploration and ideation conversations |
| `sc:estimate` | Development effort estimation |

### Frequently Used Commands

```bash
/commit                    # lint:fix → prettier:fix → typecheck → generate commit message → commit
/review                    # auto-detect changed files → 13-criteria review + project-specific agents
/review-pr <PR number>     # CodeRabbit comment accept/reject + independent review + fix plan
/pr                        # auto-create GitHub PR targeting develop
/explain <concept>         # explain framework concept with project code examples
/doc                       # auto-generate docs/ documentation after task completion (suggests /ref after)
/ref <task>                # perform task or attach citations with MDN/OWASP/official doc references
```

### Browser Verification (staging-verify skill)

Staging URL: `https://test.zeroone.it.kr`

Request "check in Chrome (study id: XXX)" format to auto-verify with Chrome DevTools MCP.
Supported patterns:

- Group study detail: `/group-study/{id}`
- Mission tab: `/group-study/{id}?tab=mission`
- Evaluation tab: `/group-study/{id}?tab=evaluation`

### Commit Review (commit-reviewer agent)

Auto-activated on requests like "check if this commit has issues", "check if changes have logic problems", etc.
Reviews against project conventions (OpenAPI priority, queryKey patterns, staleTime 60s).

## Environment Variables

Key `NEXT_PUBLIC_*` variables needed for development:

- `NEXT_PUBLIC_API_BASE_URL` — backend API endpoint
- `NEXT_PUBLIC_KAKAO_CLIENT_ID` — Kakao OAuth
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — Google OAuth
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` — Toss Payments
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
- `NEXT_PUBLIC_SENTRY_DSN` — Sentry DSN (Sentry disabled if absent)
- `SENTRY_ORG` — Sentry organization (for CI source map upload)
- `SENTRY_PROJECT` — Sentry project (for CI source map upload)
- `SENTRY_AUTH_TOKEN` — Sentry auth token (for CI source map upload)
