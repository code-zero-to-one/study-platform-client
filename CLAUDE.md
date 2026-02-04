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
export const useGetMissions = ({ groupStudyId, page = 1 }: GetMissionsParams) => {
  return useQuery({
    queryKey: ['missions', groupStudyId, page],  // 리소스명 + 파라미터
    queryFn: async () => {
      const { data } = await missionApi.getMissions(groupStudyId, page);
      return data.content;  // content 추출
    },
    enabled: !!groupStudyId,  // 조건부 실행 (선택)
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
        queryKey: ['missions', variables.groupStudyId],  // 관련 쿼리 무효화
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
  const { data } = await axiosInstance.get<{ content: ArchiveResponse }>('/archive', { params });
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

## 환경 변수

개발에 필요한 주요 `NEXT_PUBLIC_*` 변수:

- `NEXT_PUBLIC_API_BASE_URL` — 백엔드 API 엔드포인트
- `NEXT_PUBLIC_KAKAO_CLIENT_ID` — 카카오 OAuth
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — 구글 OAuth
- `NEXT_PUBLIC_TOSS_CLIENT_KEY` — 토스페이먼츠
- `NEXT_PUBLIC_CLARITY_PROJECT_ID` — Microsoft Clarity
- `NEXT_PUBLIC_GTM_ID` — Google Tag Manager
