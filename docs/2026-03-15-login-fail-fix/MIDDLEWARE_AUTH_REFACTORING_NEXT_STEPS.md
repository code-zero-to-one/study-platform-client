# 미들웨어 인증 후속 리팩토링 계획

## 1. 문서 목적

이 문서는 현재 `middleware.ts` 구조를 기준으로, 다음 단계에서 어떤 리팩토링이 필요한지 정리하기 위해 작성한다. 목표는 두 가지다. 첫째, 지금 구조가 해결한 문제와 아직 남은 문제를 분리한다. 둘째, 다음 리팩토링을 어디부터 어떤 순서로 해야 하는지 작업 단위로 정리한다.

이 문서는 "지금 구조가 틀렸다"는 문서가 아니라, "지금 구조가 중간 상태라면 다음에 무엇을 해야 하는가"를 기록하는 문서다.

## 2. 현재 구조에서 이미 개선된 점

현재 구조는 이전보다 다음 점에서 나아졌다.

- route policy 선언을 `src/features/auth/server/middleware/route-policy.ts`로 분리했다.
- 보호 경로를 모두 수동 나열하지 않고, 특수 경로만 policy로 분리한다.
- `/redirection`은 bypass로 통과시키고, `/login`, `/sign-up`, 공개 세션 경로는 각각 다른 handler로 처리한다.
- `pending-signup`을 정상 bootstrap 상태로 인식한다.
- 기본 정책을 보호 경로로 두어 누락 위험을 줄인다.

즉, 현재 구조는 "모든 경로를 같은 인증 규칙으로 처리하던 문제"를 일부 해소했다.

다시 정리하면, 지금 미들웨어는 예전보다 의도는 더 분명하고 안전장치도 더 많아졌다.

## 3. 여전히 남아 있는 구조 문제

### 3.1 정책 정의는 분리됐지만, 실행 계층 안의 책임이 아직 크다

초기 구조에서는 `middleware.ts`가 다음을 모두 한 파일에서 처리했다.

1. route policy 선언
2. access token 검증
3. refresh 요청
4. 쿠키 쓰기/삭제
5. guest token 판별
6. 관리자 권한 판별

현재는 route policy가 `src/features/auth/server/middleware/route-policy.ts`로 분리되어 이 문제를 1차 해소했다. 다만 `route-session`, `route-decisions`, `route-actions`, `route-handlers` 쪽 실행 계층 안에는 여전히 "세션 해석", "정책 판단", "부수효과 적용"이 촘촘하게 연결되어 있어 읽기 비용이 남아 있다.

다시 정리하면, policy 표 자체는 분리됐지만 실행 계층 내부를 더 잘게 읽을 여지는 아직 남아 있다.

### 3.2 handler가 세션 갱신 로직을 반복한다

`handlePublicSessionRoute`, `handleLogin`, `handleProtected`는 모두 아래 흐름을 부분적으로 반복한다.

1. access token 확인
2. `/auth/me` 검증
3. invalid면 refresh 시도
4. 새 토큰 저장
5. `memberId` 정규화
6. 실패 시 쿠키 정리

문제는 로직이 같은데 경로마다 조금씩 다르게 복사되어 있다는 점이다.

다시 정리하면, 현재 구조는 handler는 나뉘었지만 세션 검증 엔진은 아직 공용 함수로 추출되지 않았다.

### 3.3 `public-session`이 너무 넓다

현재 `public-session`은 공개 접근 허용이라는 공통점만 갖고 여러 도메인을 한데 묶는다.

- `/home`
- `/mentoring`
- `/insights`
- `/premium-study`
- `/group-study`

문제는 이 경로들 사이에도 인증 요구 수준이 완전히 같지는 않다는 점이다.

- 어떤 페이지는 익명에게 완전히 공개된다.
- 어떤 페이지는 공개지만 로그인 사용자에게 더 많은 기능이 열린다.
- 어떤 경로는 장기적으로 route layout guard와 더 가까운 책임을 가져야 할 수도 있다.

다시 정리하면, `public-session`은 현재는 실용적이지만, 장기적으로는 범주가 다소 넓고 뭉뚱그려져 있다.

### 3.4 관리자 권한 판정이 handler 내부 문자열 체크에 남아 있다

현재 `/admin` 판정은 `handleProtected()` 내부에서 `pathname.startsWith('/admin')`와 `ROLE_ADMIN` 체크로 처리한다.

문제는 관리자 권한 정책이 route policy 표 밖에서 별도 하드코딩으로 남아 있다는 점이다.

다시 정리하면, 지금은 "보호 경로"와 "관리자 경로"가 같은 handler 안에서 뒤늦게 갈라진다.

### 3.5 route policy 테스트가 없다

현재는 사람이 `ROUTE_POLICIES`와 handler 흐름을 읽고 올바른지 판단해야 한다.

문제는 다음과 같다.

- 새 경로가 추가될 때 policy가 올바른지 자동으로 검증되지 않는다.
- `/login`, `/sign-up`, `/redirection`, `/admin`, 공개 페이지의 기대 동작이 테스트로 고정되어 있지 않다.

다시 정리하면, 지금 구조는 설명은 가능하지만 테스트로 잠가놓지는 못한 상태다.

## 4. 다음 리팩토링 방향

### 4.1 적용 완료: route policy 선언 분리

이 단계는 2026-03-15 인증 리팩토링에서 이미 반영됐다.

- 완료 위치: `src/features/auth/server/middleware/route-policy.ts`
- 연결 위치: `src/middleware.ts`

정책 표를 먼저 읽고 구조를 이해할 수 있게 만들고, policy 수정과 세션 엔진 수정이 같은 diff에 섞이지 않게 한 것이 이 단계의 목적이었다.

다시 정리하면, route policy 분리는 이제 "다음 작업"이 아니라 "완료된 기반 작업"이다.

### 4.2 다음 단계 1: 세션 검증/refresh 엔진 공용화

두 번째 단계는 아래 공통 흐름을 helper로 추출하는 일이다.

1. 현재 token 검증
2. invalid 시 refresh
3. 새 token 적용
4. server verified memberId 동기화
5. 최종 상태 반환

예를 들면 아래 같은 함수가 가능하다.

- `resolveServerSession(request, ctx)`
- `ensureVerifiedSession(request, ctx)`
- `syncVerifiedSession(response, result)`

이 작업이 필요한 이유는 다음과 같다.

- public/login/protected handler가 같은 인증 엔진을 공유하게 만들 수 있다.
- refresh와 memberId 정규화 버그를 한 군데서 고칠 수 있다.

다시 정리하면, 두 번째 단계는 handler별 분기와 세션 유지 엔진을 분리하는 것이다.

### 4.3 다음 단계 2: route policy를 access matrix로 승격

세 번째 단계는 단순 enum 대신 정책 속성 기반 테이블로 바꾸는 일이다.

예를 들면 아래 축을 가질 수 있다.

- `allowAnonymous`
- `allowPendingSignup`
- `refreshSession`
- `redirectAuthenticatedTo`
- `requiredRole`
- `clearBrokenSession`

이 작업이 필요한 이유는 다음과 같다.

- `login`, `sign-up`, `public-session`, `admin`이 사실상 서로 다른 boolean 조합임을 드러낼 수 있다.
- 문자열 enum 분기보다 정책 자체가 데이터로 표현된다.

다시 정리하면, 세 번째 단계는 handler 이름 중심 구조를 "정책 데이터" 중심 구조로 바꾸는 것이다.

### 4.4 다음 단계 3: 관리자 정책 분리

관리자 경로는 일반 보호 경로와 다른 권한 정책을 가진다.

그래서 장기적으로는 아래처럼 분리하는 것이 좋다.

- policy 표에서 `requiredRole: 'ROLE_ADMIN'`
- 또는 `admin` 전용 handler

이 작업이 필요한 이유는 다음과 같다.

- `/admin`만 문자열 prefix로 따로 체크하는 구조를 제거할 수 있다.
- 일반 인증 검증과 권한 검증을 별도 레이어로 나눌 수 있다.

다시 정리하면, 관리자 체크는 "보호 경로 안의 예외"가 아니라 "별도 권한 정책"으로 승격하는 것이 맞다.

### 4.5 다음 단계 4: route layout guard와 middleware 책임 재정리

현재는 미들웨어와 `app`의 layout guard가 함께 인증을 다룬다.

장기적으로는 책임을 이렇게 분리하는 것이 좋다.

- middleware: 세션 유지, refresh, 쿠키 정리, 특수 진입점 처리
- layout/page guard: 이 라우트가 로그인 필요인지, 관리자 필요인지 선언

이 작업이 필요한 이유는 다음과 같다.

- 새 페이지 추가 시 `middleware.ts` 수정보다 route 근처에서 정책을 선언하는 편이 자연스럽다.
- "세션 엔진"과 "라우트 접근 제어"가 분리된다.

다시 정리하면, 미들웨어는 인프라에 가깝고, 접근 권한 선언은 route 경계가 소유하는 쪽이 더 맞다.

### 4.6 다음 단계 5: 정책 테스트 추가

리팩토링 이후에는 최소 아래 케이스를 테스트로 잠가야 한다.

1. `/redirection`은 bypass
2. `/login`은 valid session이면 `/home`
3. `/sign-up`은 pending-signup만 통과
4. 공개 세션 경로는 익명 통과, broken session 정리
5. 보호 경로는 익명 차단
6. `/admin`은 admin role만 통과

이 작업이 필요한 이유는 다음과 같다.

- 구조를 바꿔도 기대 동작이 유지되는지 확인할 수 있다.
- 다음 리팩토링 때 다시 추론부터 시작하지 않아도 된다.

다시 정리하면, 마지막 단계는 설계를 문서에서 코드 테스트로 고정하는 작업이다.

## 5. 권장 우선순위

현재 우선순위는 아래처럼 잡는 것이 좋다.

1. 세션 검증/refresh 엔진 공용화
2. 관리자 정책 분리
3. access matrix 도입
4. layout guard와 middleware 책임 재정리
5. 테스트 추가

이 순서를 권장하는 이유는, route policy 분리가 이미 끝난 상태에서 이제는 실행 엔진 중복과 권한 모델을 먼저 정리해야 이후의 정책 모델링이 쉬워지기 때문이다.

다시 정리하면, 당장 policy enum을 복잡하게 늘리기보다 먼저 중복 로직과 파일 책임부터 분리하는 것이 맞다.

## 6. 결론

현재 `middleware.ts`는 이전보다 의도가 더 분명한 중간 상태다. 하지만 아직 다음 문제가 남아 있다.

- policy 선언과 실행 엔진이 한 파일에 섞여 있다.
- handler들 사이에 세션 검증/refresh 로직이 중복된다.
- 관리자 정책이 별도 권한 모델이 아니라 문자열 prefix 조건으로 남아 있다.
- 테스트가 없어 구조를 코드로 잠그지 못했다.

따라서 다음 단계의 핵심 방향은 아래 한 줄로 정리할 수 있다.

`정책 선언`, `세션 유지 엔진`, `라우트 권한 선언`, `테스트`를 서로 다른 층으로 나누는 방향으로 미들웨어 인증 구조를 더 잘게 분해해야 한다.

다시 정리하면, 지금의 다음 리팩토링은 "미들웨어를 없애는 것"이 아니라, 미들웨어 안에 섞인 여러 책임을 분리하는 작업이다.

## 7. 반영 완료된 보완 사항

초기 계획 단계 이후, OAuth 실패 redirect가 로그인 페이지에서 이전 인증 헤더를 남기는 문제가 확인되었다. 이 항목은 후속 작업으로 미루지 않고 바로 반영했다. 현재는 실패 redirect가 `/api/auth/clear-session?redirect=/login`을 먼저 거쳐 서버/클라이언트 세션을 함께 정리한 뒤 로그인 페이지로 이동한다.

다시 정리하면, 실패 redirect의 세션 정리는 더 이상 미해결 과제가 아니고, 이번 수정 범위 안에서 이미 반영된 항목이다.
