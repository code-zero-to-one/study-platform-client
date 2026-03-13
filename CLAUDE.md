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

- `src/components/ui/` — shadcn/ui 기본 컴포넌트 (Button, Input, Dialog 등). 스타일: `new-york`. `components.json`에서 설정.
- `src/components/layout/` — Header, Sidebar, Footer
- `src/components/modals/`, `cards/`, `lists/`, `payment/`, `premium/` — 도메인별 그룹화된 컴포넌트
- `src/features/`, `src/entities/`, `src/widgets/` — 부분적 FSD (Feature-Sliced Design) 구조, 향후 타입 기반 구조로 통합 예정

### 스타일링

- Tailwind CSS 4 + `@tailwindcss/postcss` 플러그인
- 클래스 유틸리티: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)
- `prettier-plugin-tailwindcss`로 Tailwind 클래스 정렬
- `src/app/global.css`에서 CSS 변수로 테마 관리

### 인증 플로우

1. OAuth 로그인 (카카오/구글) → 서버에서 JWT access + refresh 토큰 발급
2. `accessToken`은 쿠키에 저장 (JS 접근 가능), `refresh_token`은 httpOnly 쿠키에 저장
3. Axios 인터셉터가 `AUTH001` 에러 감지 → 토큰 갱신 → 실패한 요청 재시도 (중복 갱신 방지를 위한 큐 사용)
4. 미들웨어가 서버 측에서 네비게이션 시 토큰 검증, 유효하지 않으면 `/`로 리다이렉트

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

### 자주 사용하는 커맨드

```bash
/commit-title              # 현재 변경사항으로 커밋 메시지 자동 생성
/commit-title <설명>       # 설명 기반으로 커밋 메시지 생성
/explain <개념>            # 프레임워크 개념을 프로젝트 코드 예시와 함께 설명
/doc                       # 작업 완료 후 docs/ 문서 자동 생성
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
