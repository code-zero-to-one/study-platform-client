# 소셜 로그인 흐름 분석과 리팩토링 계획

## 1. 문서 목적

이 문서는 운영 환경에서 발생한 소셜 로그인 회귀를 단순히 "어느 커밋이 문제인가"로 환원하지 않고, 프론트엔드와 백엔드가 함께 구성하는 인증 흐름 전체를 계약 단위로 다시 설명하기 위해 작성한다. 목표는 두 가지다. 첫째, 현재 로그인 흐름의 논리적 전제를 명시한다. 둘째, 어떤 리팩토링이 필요한지 우선순위와 책임 경계까지 포함해 정리한다.

이 문서는 핫픽스 제안서가 아니라 구조 개선 문서다. 즉, 지금 당장 무엇을 되돌릴지보다, 왜 현재 구조가 회귀에 취약한지와 어떤 방향으로 재설계해야 같은 문제가 반복되지 않는지를 다룬다.

## 2. 현재 로그인 계약

현재 소셜 로그인 흐름은 프론트엔드, 백엔드, 브라우저 쿠키 저장 위치가 세 갈래로 나뉘어 있다. 이를 논리식으로 정리하면 다음과 같다.

### 2.1 백엔드 OAuth 성공 계약

다음 명제는 현재 백엔드 코드 기준 사실이다.

- P1. 프론트가 소셜 로그인 버튼을 누르면 브라우저는 백엔드 `/api/v1/auth/{vendor}/redirect-uri`로 이동한다.
- P2. 백엔드가 OAuth 로그인을 성공시키면 `refresh_token`은 `Set-Cookie`로 응답 헤더에 기록한다.
- P3. 백엔드는 브라우저를 `{clientOrigin}/redirection?...` 으로 308 리다이렉트한다.
- P4. 기존 회원 로그인 성공이면 리다이렉트 URL에는 `access-token`, `is-guest=false`, `member-id`, `auth-vendor`가 포함된다.
- P5. 신규 회원 로그인 성공이면 리다이렉트 URL에는 `access-token`, `is-guest=true`, `user-name`, `profile-image-url`, `auth-vendor`가 포함되고, `member-id`는 없다.
- P6. 로그인 실패이면 리다이렉트 URL에는 `is-success=false`가 포함된다.

즉, `existing-member-success -> member-id exists` 이고, `new-member-success -> member-id absent` 이다. 이 명제가 깨지면 프론트는 잘못된 계약 위에서 동작하게 된다.

다시 정리하면, 백엔드는 기존 회원과 신규 회원을 아예 다른 모양으로 보내고 있고, 프론트는 그 차이를 정확히 알아야 한다.

### 2.2 프론트 세션 형성 계약

프론트 코드는 `/redirection` 페이지에서 query string을 읽고 `document.cookie`로 `accessToken`, `memberId`, `socialImageURL`을 기록한다. 이때 중요한 사실은 다음과 같다.

- P7. `accessToken`은 서버가 `Set-Cookie`로 내려주는 값이 아니라, 프론트가 `document.cookie`로 쓰는 값이다.
- P8. 따라서 Network 탭에서 `accessToken`의 `Set-Cookie`가 보이지 않는 것은 이상 징후가 아닐 수 있다.
- P9. 반면 `refresh_token`은 서버가 `Set-Cookie`로 내려주는 값이므로, Network 탭에서 확인 가능한 서버 쿠키다.

다시 정리하면, `accessToken`은 네트워크 탭의 서버 쿠키가 아니라 프론트가 나중에 심는 값이고, `refresh_token`만 서버 쿠키다.

### 2.3 로그인 상태 판정 계약

현재 화면은 단순히 `accessToken`만 있다고 로그인 상태로 보지 않는다.

- P10. 서버 컴포넌트 헤더는 `accessToken`과 숫자형 `memberId`가 모두 있어야 로그인 상태라고 판단한다.
- P11. 클라이언트 Provider도 토큰의 `memberId`와 쿠키 `memberId`가 맞지 않으면 사용자 상태를 초기화한다.
- P12. 따라서 "기존 회원 로그인"의 성공 조건은 `accessToken cookie exists AND memberId cookie exists` 이다.
- P13. 반대로 "신규 회원 로그인"의 성공 조건은 `accessToken cookie exists AND sign-up route continues` 이며, 이 단계에서 `memberId`는 없어도 정상이다.

이 구조 때문에 기존 회원과 신규 회원은 같은 OAuth 진입점에서 시작하지만, 프론트가 받아야 하는 성공 조건은 동일하지 않다.

다시 정리하면, 기존 회원은 `accessToken + memberId`가 다 있어야 로그인 완료지만, 신규 회원은 `accessToken`만 들고 회원가입 단계로 가는 게 정상이다.

## 3. 현재 구조의 문제

현재 구조는 기능 자체보다 계약의 위치가 흩어져 있다는 점이 문제다. 세션 생성, 계약 해석, 로그인 상태 판정, 토큰 갱신이 서로 다른 파일에 분산되어 있고, 각 레이어가 상대 레이어의 전제를 암묵적으로 가정한다.

### 3.1 `/redirection` 페이지가 너무 많은 책임을 가진다

현재 `/redirection` 페이지는 다음 책임을 한 파일 안에서 동시에 수행한다.

1. OAuth 성공/실패 결과 해석
2. 기존 회원/신규 회원 분기
3. 브라우저 쿠키 쓰기
4. GTM 이벤트 발송
5. 최종 라우팅 결정

문제는 이 다섯 가지가 서로 다른 실패 조건을 가진다는 점이다. 예를 들어 `is-success=false`는 실패 처리 대상이고, `member-id` 부재는 신규 회원일 때는 정상 처리 대상이다. 그런데 이 두 조건을 하나의 if 문 체계 안에서 다루면 계약 위반과 정상 분기를 쉽게 혼동하게 된다.

다시 정리하면, `/redirection` 한 파일이 너무 많은 결정을 떠안아서 조건 하나만 틀려도 전체 로그인 흐름이 깨진다.

### 3.2 프론트와 백엔드의 계약이 코드에만 존재하고 타입으로 존재하지 않는다

백엔드는 `existing-member-success`와 `new-member-success`를 서로 다른 query shape로 내려준다. 그러나 프론트에는 이를 나타내는 명시적인 타입이 없다. 그 결과, 프론트는 "소셜 로그인 성공이면 member-id가 있어야 한다" 같은 잘못된 일반화를 도입하기 쉽다.

즉, 현재 상태는 아래와 같다.

- 백엔드에는 성공 응답의 분기 규칙이 있다.
- 프론트에는 그 분기 규칙을 표현하는 union type이 없다.
- 따라서 계약이 문서가 아니라 암묵적 구현 세부사항으로 남아 있다.

이 구조에서는 회귀가 생겼을 때 "계약이 바뀐 것인지", "구현이 잘못 이해한 것인지"를 빠르게 구분하기 어렵다.

다시 정리하면, 백엔드 계약을 타입으로 박아두지 않아서 사람이 머리로만 기억하다가 실수하기 쉬운 구조다.

### 3.3 세션의 source of truth가 둘로 나뉘어 있다

현재 세션은 두 방식으로 만들어진다.

- `refresh_token`은 서버가 심는다.
- `accessToken`과 `memberId`는 프론트가 심는다.

이 구조는 성립 자체는 가능하지만, 문제는 정규화 타이밍이 다르다는 점이다. 서버는 `refresh_token`만 아는 상태에서 움직이고, 프론트는 `accessToken`과 `memberId`를 써야 다음 화면이 로그인 상태로 보인다. 그 사이에 어느 하나라도 빠지면 사용자는 "로그인에 성공한 것 같지만 비로그인처럼 보이는" 상태를 경험한다.

다시 정리하면, 서버와 프론트가 세션의 다른 조각을 따로 만들고 있어서 타이밍이 어긋나면 로그인한 것처럼 보였다가 바로 아닌 것처럼 보일 수 있다.

### 3.4 로그인 상태 판정 로직이 여러 군데 중복되어 있다

현재 로그인 관련 판정은 최소 네 군데에 흩어져 있다.

1. `/redirection` 페이지의 query 해석
2. `middleware.ts`의 보호 경로 처리
3. 서버 컴포넌트 헤더의 `isLoggedIn` 계산
4. 클라이언트 Provider의 user store 초기화 조건

같은 시스템에서 "로그인됨"이라는 개념이 네 번 정의되면, 회귀는 한 번의 잘못된 수정이 아니라 네 정의 사이의 불일치로 발생한다. 실제로도 기존 회원과 신규 회원, 서버 렌더와 클라이언트 hydration, 브라우저 쿠키와 refresh token이 서로 다른 속도로 맞물리면서 문제를 만들고 있다.

다시 정리하면, 같은 "로그인"을 여러 파일이 다르게 정의하고 있어서 서로 충돌하고 있다.

### 3.5 방어 로직이 세션 bootstrap 단계까지 침범한다

현재 미들웨어와 일부 클라이언트 로직은 다음 전제를 가진다.

- P14. `accessToken`이 유효하지 않으면 해당 세션은 즉시 폐기해야 한다.
- P15. `accessToken`은 있는데 `memberId`가 없거나 검증되지 않으면 해당 세션은 불완전하므로 폐기해야 한다.
- P16. 로그인 페이지에 들어온 세션이 invalid 하면 루프 방지를 위해 쿠키를 정리해야 한다.

이 전제 자체는 "이미 형성된 세션"에 대해서는 타당할 수 있다. 문제는 이 전제가 OAuth 직후의 bootstrap 단계까지 그대로 적용된다는 점이다.

OAuth 직후에는 다음 현상이 정상적으로 발생할 수 있다.

- 브라우저가 `/redirection`에서 방금 `accessToken`을 쓴 직후라 서버와 클라이언트의 쿠키 가시성이 완전히 동기화되지 않았을 수 있다.
- `refresh_token`은 서버가 심고, `accessToken`은 프론트가 심기 때문에 두 토큰의 저장 타이밍이 다를 수 있다.
- 신규 회원은 계약상 `member-id`가 없는 상태로 `/sign-up`에 진입하는 것이 정상이다.

그런데 bootstrap 단계에서 이 상태를 "위조 또는 파손된 세션"으로 취급하면, 구조는 정상 경로와 실패 경로를 구분하지 못한다. 그 결과 사용자는 "로그인 성공 직후 accessToken이 생겼다가 바로 사라지는" 현상을 겪게 된다.

따라서 현재 제거해야 하는 것은 "방어" 그 자체가 아니라, 아래와 같은 과도한 적용 방식이다.

- OAuth 결과를 아직 해석 중인 단계에서 세션 파손 판정을 먼저 내리는 방식
- 신규 회원의 정상 상태를 기존 회원 기준으로 검사하는 방식
- `refresh_token` 정착 전의 짧은 불일치 구간까지 즉시 세션 폐기로 연결하는 방식

즉, 방어 로직은 유지하되 적용 범위를 줄여야 한다. 인증 시스템은 정상적인 bootstrap 상태를 허용한 뒤, 세션이 완전히 형성된 이후에만 강한 정합성 검사를 수행해야 한다.

다시 정리하면, 지금 핵심 위험은 "아직 로그인 만드는 중인 상태"를 미들웨어가 "이미 고장난 로그인"으로 오해하는 것이다.

## 4. 이미 확인된 사실

이번 분석에서 확인된 사실은 다음과 같다.

### 4.1 `/api/v1/auth/me` 응답 shape

`/api/v1/auth/me`는 현재 QA 백엔드에서 실제로 아래 형태를 반환한다.

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-15T12:09:26.175682297",
  "content": {
    "memberId": 1,
    "roleId": "ROLE_MEMBER"
  },
  "message": null
}
```

따라서 아래 파싱 자체는 현재 계약과 일치한다.

```ts
const data: { content: { memberId: number; roleId: string } } =
  await response.json();

return { state: 'valid', memberId: data.content.memberId };
```

즉, 이번 구조 개선에서 `/auth/me` shape 파싱은 1차 리팩토링 대상이 아니다.

다시 정리하면, `/auth/me` 파싱은 현재 기준 맞기 때문에 가장 먼저 의심해야 할 지점은 아니다.

### 4.2 문제의 핵심은 `/auth/me`보다 `/redirection` 계약에 더 가깝다

운영 증상이 "OAuth는 끝난 것 같은데 로그인 상태가 잡히지 않는다"라면, 구조적으로 먼저 의심해야 하는 것은 다음 두 지점이다.

1. 백엔드가 `/redirection`으로 어떤 query를 보내는가
2. 프론트가 그 query를 기존 회원/신규 회원/실패 케이스로 올바르게 해석하는가

즉, 현재 리팩토링의 중심축은 `verifyAccessToken`의 응답 shape가 아니라 `OAuth result -> session bootstrap` 경계다.

다시 정리하면, 지금 먼저 고쳐야 할 곳은 토큰 검증 함수보다 `/redirection` 결과 해석기다.

## 5. 필요한 리팩토링

리팩토링은 한 번에 하지 말고, 계약 안정화와 구조 분리를 순차적으로 해야 한다.

### 5.1 1단계: OAuth 리다이렉트 계약을 타입으로 승격

첫 번째 리팩토링은 "백엔드가 무엇을 보낼 수 있는가"를 프론트 타입으로 고정하는 일이다.

필요한 작업은 다음과 같다.

1. `src/types/auth/` 아래에 OAuth 리다이렉트 전용 타입을 만든다.
2. 성공 케이스를 `ExistingMemberOAuthRedirectResult`와 `NewMemberOAuthRedirectResult`로 분리한다.
3. 실패 케이스를 `OAuthRedirectFailureResult`로 별도 분리한다.
4. `/redirection` 페이지는 `URLSearchParams`를 직접 해석하지 말고, `parseOAuthRedirectResult(searchParams)` 같은 단일 파서 함수를 거치게 만든다.

이렇게 해야 다음 논리가 코드에 드러난다.

- `is-success=false -> failure branch`
- `is-guest=true -> new member branch`
- `is-guest=false -> existing member branch`

이 단계의 목적은 기능 추가가 아니라 계약 오해를 불가능하게 만드는 것이다.

다시 정리하면, 먼저 백엔드가 보내는 경우의 수를 프론트 타입으로 못 박아야 다음 단계가 안전해진다.

### 5.2 2단계: `/redirection`의 책임을 controller로 분리

두 번째 리팩토링은 `/redirection` 파일에서 계약 해석과 부수효과를 분리하는 일이다.

권장 구조는 다음과 같다.

- `src/features/auth/model/parse-oauth-redirect-result.ts`
- `src/features/auth/model/use-oauth-redirect-controller.ts`
- `src/features/auth/ui/oauth-redirect-page-client.tsx`
- `src/app/(service)/redirection/page.tsx`

이 구조에서 각 책임은 다음처럼 나뉜다.

- parser: query string을 타입 안전한 결과로 변환
- controller: 쿠키 쓰기, 토스트, GTM, 라우팅 순서 제어
- UI: 렌더링만 담당
- app page: 엔트리 역할만 담당

이 분리의 이점은 "계약 해석 실패"와 "쿠키 쓰기 실패"를 다른 레이어에서 다루게 된다는 점이다.

다시 정리하면, `/redirection` 페이지는 얇게 두고 실제 로그인 처리 절차는 controller로 빼야 문제 원인을 분리해서 볼 수 있다.

### 5.3 3단계: 세션 쓰기와 로그인 판정을 공용 모듈로 통합

세 번째 리팩토링은 세션 조작을 헬퍼 수준에서 통합하는 일이다.

현재는 `setCookie('accessToken', ...)`, `setCookie('memberId', ...)`, 헤더의 `isLoggedIn`, Provider의 `reset()` 조건이 서로 다른 파일에서 각각 정의된다. 이 구조를 아래처럼 정리해야 한다.

- `writeClientSessionForExistingMember`
- `writeClientSessionForNewMember`
- `clearClientSession`
- `isCompleteAuthenticatedSession`
- `isSignupPendingSession`

이 모듈이 생기면 "기존 회원은 accessToken + memberId가 있어야 한다", "신규 회원은 accessToken만 있어도 sign-up까지는 정상이다"라는 규칙이 한 곳에 모인다.

다시 정리하면, 쿠키를 쓰는 규칙과 로그인 판정 규칙을 한 군데로 모아야 같은 세션을 다르게 해석하지 않게 된다.

### 5.4 4단계: `middleware.ts`를 세션 복구 레이어로 한정

네 번째 리팩토링은 미들웨어의 책임을 줄이는 것이다.

미들웨어는 다음 역할까지만 가져야 한다.

1. 보호 경로 접근 통제
2. 이미 존재하는 세션의 서버측 검증
3. 만료된 access token의 refresh 시도
4. 서버가 확인한 `memberId` 정규화

반대로 미들웨어가 가져서는 안 되는 책임은 다음과 같다.

1. OAuth 성공 여부 해석
2. 신규 회원/기존 회원 분기
3. `/redirection` 단계의 불완전한 세션을 일반 보호 경로와 같은 기준으로 평가하는 일

즉, 미들웨어는 "이미 세션이 형성된 이후"를 다루는 레이어여야 한다. "세션이 막 형성되는 중"인 `/redirection` 단계까지 같은 기준으로 다루면 회귀 위험이 커진다.

여기서 중요한 점은 "쿠키 삭제 방어를 없앤다"가 아니라 "삭제 조건을 세션 안정화 이후로 늦춘다"는 것이다. 미들웨어가 즉시 세션을 지워야 하는 경우는 다음처럼 좁혀야 한다.

1. 보호 경로에서 access token 검증과 refresh가 모두 실패한 경우
2. 서버가 이미 형성된 세션의 memberId 불일치를 반복적으로 확인한 경우
3. 명시적 로그아웃 또는 세션 만료가 확정된 경우

반대로 아래 상황은 즉시 쿠키 삭제 사유로 취급하면 안 된다.

1. `/redirection` 직후 아직 클라이언트가 세션을 기록하는 중인 상태
2. 신규 회원이 `member-id` 없이 `/sign-up`으로 이동하는 정상 상태
3. `refresh_token` 저장과 `accessToken` 저장이 서로 다른 응답 단계에 있는 짧은 전이 상태

이 경계가 정리되지 않으면 시스템은 보안 방어를 수행하는 대신 정상 로그인 플로우를 스스로 파괴하게 된다.

다시 정리하면, 미들웨어는 로그인 생성 단계까지 간섭하지 말고 완성된 세션만 관리해야 한다.

### 5.5 5단계: 관측 가능성 추가

지금 구조는 실패 원인을 추론하게 만들고, 증명하게 만들지 않는다. 따라서 리팩토링과 함께 로그와 테스트를 추가해야 한다.

필수 항목은 다음과 같다.

1. `/redirection` parser 실패 시 query snapshot 로깅
2. 기존 회원 성공, 신규 회원 성공, 실패 redirect를 각각 검증하는 테스트
3. `refresh_token exists + accessToken absent`, `accessToken exists + memberId absent` 같은 불완전 세션 상태를 명시적으로 기록하는 로그
4. Playwright 또는 E2E 수준에서 기존 회원 로그인과 신규 회원 로그인 둘 다 재현 가능한 시나리오 추가

이 단계가 없으면 구조를 개선해도 다음 회귀 때 다시 같은 방식으로 추론부터 시작하게 된다.

다시 정리하면, 로그와 테스트가 없으면 다음에도 또 "감"으로 원인을 찾게 된다.

## 6. 우선순위

현재 상황에서 우선순위는 다음과 같다.

1. `/redirection` 계약 타입화
2. `/redirection` parser와 controller 분리
3. 세션 쓰기/판정 공용화
4. 미들웨어 책임 축소
5. 로깅 및 E2E 시나리오 추가

이 순서를 뒤집으면 안 된다. 특히 미들웨어만 먼저 고치면, 초기 OAuth 결과 해석이 계속 암묵적이기 때문에 구조 문제는 남는다.

## 7. 결론

현재 로그인 회귀는 단일 if 문 하나의 버그라기보다, "OAuth 결과 해석", "세션 생성", "로그인 상태 판정", "서버측 세션 복구"가 각각 다른 위치에서 중복 정의된 구조의 결과다. 따라서 필요한 리팩토링은 특정 커밋을 되돌리는 작업이 아니라, 인증 흐름의 계약을 명시하고 책임 경계를 다시 그리는 작업이다.

핵심 결론은 다음과 같다.

- `/auth/me`의 `content.memberId` 파싱은 현재 계약과 일치한다.
- 구조적으로 더 위험한 지점은 `/redirection` query 계약과 그 해석 로직이다.
- 따라서 리팩토링의 중심은 `verifyAccessToken`이 아니라 `OAuth redirect result -> client session bootstrap` 이어야 한다.

이 문서의 방향대로 정리하면, 이후에는 "어떤 케이스가 정상이고 무엇이 계약 위반인지"를 코드와 문서에서 동시에 설명할 수 있게 된다.

## 8. 추가 보완: OAuth 실패 후 잔존 세션 제거

리팩토링 이후 로컬 E2E에서 확인한 추가 문제는, OAuth 실패 redirect가 `/login`으로 이동하더라도 공유 서비스 레이아웃과 서버 쿠키 관점에서는 이전 인증 상태가 잠시 남을 수 있다는 점이었다. 원인은 클라이언트 쿠키만 지우고 같은 레이아웃 안에서 `router.replace('/login')`만 수행하면, 서버가 보는 `refresh_token`과 기존 레이아웃 상태가 즉시 정리되지 않을 수 있기 때문이다.

이를 보완하기 위해 실패 redirect와 계약 위반 redirect는 `/api/auth/clear-session?redirect=/login`을 경유하도록 수정했다. 이 route handler는 서버가 보는 인증 쿠키와 `refresh_token`까지 함께 삭제하고, 그 뒤 로그인 페이지로 이동시킨다.

다시 정리하면, 실패 redirect는 이제 "화면 이동"이 아니라 "세션 정리 + 로그인 이동"으로 처리한다.
