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

@.claude/rules/domain-entities.md

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

@.claude/rules/api-patterns.md

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

@.claude/rules/backend-data-safety.md

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

@.claude/rules/error-handling.md

### 경로 별칭

`@/*`는 `./src/*`에 매핑됨 (tsconfig.json에서 설정)

## 주요 컨벤션

- **커밋 메시지**: `feat :`, `fix :`, `refactor :`, `style :`, `docs :`, `test :`, `chore :` (콜론 앞뒤 공백 포함)
- **브랜치 전략**: Feature 브랜치 → `develop` (스테이징: test.zeroone.it.kr) → `main` (프로덕션: www.zeroone.it.kr)
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
