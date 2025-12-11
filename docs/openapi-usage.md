# OpenAPI Generated API 사용 가이드

이 문서는 `src/api/openapi`에 생성된 OpenAPI 클라이언트를 프로젝트에서 일관되게 사용하는 방법을 설명합니다.

## 기본 원칙

- Axios 인스턴스(`src/api/client/axios.ts`)를 주입해 공통 `baseURL`, 인증 헤더, 에러 처리 로직을 재사용합니다.
- `Configuration`으로 `basePath`를 지정하고, 각 API 클래스 생성자에 `axiosInstance`를 전달합니다.
- 응답은 OpenAPI 타입(예: `BaseResponseVoid`, `PageResponseGroupStudyResponse`)을 따릅니다.

## 공통 설정

```ts
import { axiosInstance } from '@/api/client/axios';
import { Configuration } from '@/api/openapi/configuration';

const config = new Configuration({
  // 환경변수를 우선 사용하며, 미설정 시 base.ts의 기본값으로 동작합니다.
  basePath: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

## AuthApi 예시 (로그아웃)

```ts
import { AuthApi } from '@/api/openapi/api/auth-api';

const authApi = new AuthApi(config, config.basePath, axiosInstance);
const { status } = await authApi.logout();
```

- 성공 시 `status`가 200 입니다.
- 후속 처리: 쿠키 삭제, Query 캐시 초기화, 리다이렉트 등은 호출 측에서 수행합니다.

## GroupStudyManagementApi 예시 (목록 조회)

```ts
import {
  GroupStudyManagementApi,
  GetGroupStudiesGroupStudyStatusEnum,
} from '@/api/openapi/api/group-study-management-api';

const studyApi = new GroupStudyManagementApi(
  config,
  config.basePath,
  axiosInstance,
);
const page = 0;
const pageSize = 10;
const status = GetGroupStudiesGroupStudyStatusEnum.Recruiting;

const res = await studyApi.getGroupStudies(page, pageSize, status);
// res.data.content 등 응답 구조는 생성된 타입 문서를 참조하세요.
```

## 에러 처리

- OpenAPI 클라이언트는 Axios를 사용하므로 기존 인터셉터의 에러 처리 흐름을 그대로 따릅니다.
- 개별 호출에서 추가 옵션이 필요한 경우, 두 번째 인자로 Axios 옵션을 전달할 수 있습니다.

```ts
await authApi.logout(undefined, { headers: { Referer: '/home' } });
```

## 테스트 및 디버깅 팁

- 404 등 백엔드 스펙 불일치가 보이면, `src/api/openapi/docs`의 각 API 문서를 확인하고, 실제 서버 스펙과 파라미터/경로를 비교하세요.
- 임시로 기존 axios 엔드포인트를 유지하면서 OpenAPI 전환을 단계적으로 진행할 수 있습니다.

### 환경변수 확인

Next.js 환경에서 개발/배포 시 `NEXT_PUBLIC_API_BASE_URL`이 설정되어야 올바른 엔드포인트로 요청합니다.

```bash
export NEXT_PUBLIC_API_BASE_URL=https://test-api.zeroone.it.kr
npm run dev
```

환경변수가 누락되면 base.ts의 기본값(`https://test-api.zeroone.it.kr`)으로 동작합니다.

## 참고 문서

- `src/api/openapi/docs/` 하위의 각 API별 사용 설명
- `src/api/openapi/docs/API_INDEX.md`: 모듈별 개요와 샘플 사용법
