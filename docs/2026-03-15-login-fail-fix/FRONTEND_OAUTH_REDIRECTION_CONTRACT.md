# 프론트엔드 OAuth Redirection 계약과 작업 계획

## 1. 문서 목적

이 문서는 백엔드가 `/redirection`으로 보내는 OAuth 결과 계약을 프론트엔드가 어떻게 해석하고 처리해야 하는지를 명확히 적기 위해 작성한다. 목표는 두 가지다. 첫째, 백엔드 계약을 프론트 구현 규칙으로 번역한다. 둘째, 지금 프론트가 무엇을 수정해야 하는지와 왜 수정해야 하는지를 작업 단위로 정리한다.

이 문서는 "소셜 로그인 버그가 왜 생겼는가"를 넘어서, "프론트가 어떤 책임을 가져야 하는가"를 규정하는 문서다. 따라서 특정 커밋 하나를 탓하기보다, 현재 프론트 구조가 어떤 계약을 놓치고 있었는지를 설명한다.

## 2. 백엔드 계약

백엔드 코드를 기준으로 `/redirection`의 입력 계약은 이미 정해져 있다. 성공/실패와 무관하게 OAuth 리다이렉트 결과에는 `type=oauth2`가 포함되어야 하며, 프론트 parser는 이 값을 계약 식별자로 먼저 검증해야 한다.

### 2.1 성공 계약

- B1. 기존 회원 로그인 성공이면 `/redirection` query에는 `type=oauth2`, `access-token`, `is-success=true`, `is-guest=false`, `member-id`, `auth-vendor`가 포함된다.
- B2. 신규 회원 로그인 성공이면 `/redirection` query에는 `type=oauth2`, `access-token`, `is-success=true`, `is-guest=true`, `auth-vendor`가 포함된다.
- B3. 신규 회원 로그인 성공 시 `user-name`, `profile-image-url`은 있을 수 있지만, `member-id`는 없다.

즉, `existing-member-success -> member-id exists` 이고, `new-member-success -> member-id absent` 이다.

다시 정리하면, 기존 회원은 `member-id`까지 와야 로그인 완료이고, 신규 회원은 `member-id` 없이 회원가입 단계로 넘어가는 재료만 오면 된다.

### 2.2 실패 계약

- B4. 로그인 실패이면 `/redirection` query에는 `type=oauth2`, `is-success=false`가 포함된다.
- B5. 실패 시 백엔드는 `/login`으로 직접 보내지 않고, `/redirection?type=oauth2&is-success=false`로 보낸다.

즉, `oauth-failure -> redirection page handles failure` 이다.

다시 정리하면, 로그인 실패도 `/redirection`이 받기 때문에 이 페이지가 실패 처리 책임까지 가져야 한다.

### 2.3 세션 저장 계약

- B6. `refresh_token`은 백엔드가 `Set-Cookie`로 저장한다.
- B7. `access-token`은 백엔드가 query string으로 전달한다.
- B8. 따라서 프론트는 `access-token`을 받아 클라이언트 쿠키 또는 세션 상태로 저장해야 한다.

즉, 백엔드는 "최종 로그인 결과"를 넘기고, 프론트는 "브라우저 세션 완성"을 담당한다.

다시 정리하면, 서버는 결과를 보내고 `refresh_token`을 심고, 프론트는 그 결과를 받아 `accessToken` 세션을 완성한다.

## 3. 프론트가 반드시 가져야 하는 해석 규칙

백엔드 계약이 위와 같다면, 프론트는 다음 명제를 구현해야 한다.

- F1. `type=oauth2`가 아니면 이 요청은 OAuth redirect 계약 위반으로 처리해야 한다.
- F2. `is-success=false` 이면 이 요청은 실패이며, 로그인 성공 로직을 실행하면 안 된다.
- F3. `is-success=true AND is-guest=false` 이면 기존 회원 성공 케이스로 처리해야 한다.
- F4. `is-success=true AND is-guest=true` 이면 신규 회원 성공 케이스로 처리해야 한다.
- F5. 기존 회원 성공 케이스에서는 `access-token`과 `member-id`가 모두 필요하다.
- F6. 신규 회원 성공 케이스에서는 `access-token`은 필요하지만 `member-id`는 필요하지 않다.
- F7. `member-id` 부재는 기존 회원 케이스에서는 계약 위반이지만, 신규 회원 케이스에서는 정상이다.
- F8. 프론트는 `member-id` 유무만 보고 성공/실패를 판단하면 안 되고, 반드시 `type`, `is-success`, `is-guest`와 함께 판단해야 한다.

이 규칙이 빠지면 프론트는 신규 회원 정상 케이스를 실패처럼 오해하거나, 실패 케이스를 성공처럼 처리하게 된다.

## 4. 현재 프론트가 놓친 핵심

현재 프론트 문제는 "백엔드가 이상한 값을 보낸다"가 아니라, "프론트가 백엔드 계약을 타입과 분기 구조로 고정하지 않았다"는 데 있다.

### 4.1 `/redirection`이 계약 해석기 역할을 제대로 분리하지 않았다

현재 `/redirection` 페이지는 한 파일 안에서 다음을 동시에 수행한다.

1. query string 읽기
2. 성공/실패 판단
3. 기존 회원/신규 회원 판단
4. 쿠키 쓰기
5. GTM 발송
6. 최종 라우팅

문제는 이 여섯 가지가 서로 다른 전제를 가진다는 점이다. 예를 들어 `is-success=false`는 즉시 실패 분기여야 하지만, `member-id` 부재는 신규 회원일 때는 정상이다. 그런데 이 둘을 같은 수준의 `if` 로직으로 섞으면, 계약 오해가 곧 로그인 장애로 이어진다.

다시 정리하면, 한 파일이 너무 많은 결정을 동시에 하고 있어서 조건 하나만 잘못 써도 로그인 전체가 깨진다.

### 4.2 프론트는 "성공 응답의 모양"을 명시적으로 소유하지 않았다

지금 프론트에는 아래 타입이 없다.

- 기존 회원 OAuth 성공 결과
- 신규 회원 OAuth 성공 결과
- OAuth 실패 결과

이 타입이 없으면 구현은 반드시 다음 실수를 하게 된다.

- `member-id`가 없으면 실패라고 일반화한다.
- `is-success=false`를 별도 실패 타입으로 다루지 않는다.
- query 파라미터 해석 규칙이 파일마다 흩어진다.

즉, 현재 버그의 본질은 로직 실수 이전에 계약 모델 부재다.

다시 정리하면, 프론트가 "성공 응답이 어떻게 생겼는지"를 자료형으로 못 박아두지 않아서 신규 회원을 실패로 착각하기 쉬운 상태다.

### 4.3 세션 생성 책임이 프론트 안에서도 분리되어 있다

현재 프론트는 OAuth 직후 `accessToken`과 `memberId`를 쓰지만, 로그인 상태 판단은 다른 파일들이 따로 한다. 그 결과 다음 현상이 발생한다.

- `/redirection`은 "성공 처리"라고 생각한다.
- Provider는 `memberId`가 맞지 않으면 유저 상태를 초기화한다.
- Header는 `accessToken + memberId` 둘 다 있어야 로그인으로 본다.
- middleware는 세션이 덜 만들어진 상태를 파손 세션으로 오판할 수 있다.

즉, 현재 프론트는 세션을 쓰는 레이어와 세션을 검증하는 레이어가 서로 다른 언어를 쓰고 있다.

다시 정리하면, 쿠키를 만드는 쪽과 로그인 여부를 판단하는 쪽이 서로 다른 기준을 쓰고 있어서 충돌이 난다.

## 5. 프론트가 진행해야 하는 작업

아래 작업은 "있으면 좋은 개선"이 아니라, 백엔드 계약을 제대로 소비하기 위해 프론트가 반드시 해야 하는 일이다.

### 5.1 작업 1: OAuth redirect 결과를 타입으로 정의

첫 번째 작업은 `/redirection`의 query 결과를 타입으로 고정하는 일이다.

필요한 타입은 최소 아래 세 가지다.

- `ExistingMemberOAuthRedirectResult`
- `NewMemberOAuthRedirectResult`
- `OAuthRedirectFailureResult`

이 작업이 필요한 이유는 다음과 같다.

- W1. 프론트는 기존 회원 성공과 신규 회원 성공을 서로 다른 shape로 다뤄야 한다.
- W2. 이 차이를 타입으로 고정하지 않으면 구현자는 `member-id`를 항상 기대하게 된다.
- W3. 타입이 생기면 "정상 부재"와 "계약 위반 부재"를 구분할 수 있다.

즉, 타입 정의는 문서화를 위한 것이 아니라 회귀 방지를 위한 실행 규칙이다.

다시 정리하면, 먼저 "어떤 성공이 어떤 성공인지"를 코드 타입으로 못 박아야 같은 실수를 반복하지 않는다.

### 5.2 작업 2: `parseOAuthRedirectResult(searchParams)`를 경계 함수로 도입

두 번째 작업은 query string 해석을 단일 함수로 모으는 일이다.

이 함수는 아래 순서로 동작해야 한다.

1. `type=oauth2`인지 먼저 검증
2. `is-success=false`이면 실패 타입 반환
3. `is-success=true AND is-guest=true`이면 신규 회원 성공 타입 반환
4. `is-success=true AND is-guest=false`이면 기존 회원 성공 타입 반환
5. 그 외는 계약 위반 에러 반환

이 작업이 필요한 이유는 다음과 같다.

- W4. query 해석 규칙이 UI 파일 곳곳에 흩어지면 같은 계약이 여러 번 중복 구현된다.
- W5. parser가 없으면 실패 케이스와 신규 회원 케이스가 쉽게 섞인다.
- W6. parser가 있으면 계약 위반을 "로그인 실패"가 아니라 "백엔드/프론트 계약 불일치"로 별도 기록할 수 있다.

즉, parser는 편의 함수가 아니라 계약 경계다.

다시 정리하면, query 해석은 여기저기서 하지 말고 한 함수만 믿게 만들어야 한다.

### 5.3 작업 3: `/redirection` 페이지를 controller 중심 구조로 분리

세 번째 작업은 `/redirection`을 현재의 거대한 effect 파일에서 분리하는 일이다.

권장 구조는 아래와 같다.

- `src/types/auth/`
- `src/features/auth/model/parse-oauth-redirect-result.ts`
- `src/features/auth/model/use-oauth-redirect-controller.ts`
- `src/features/auth/ui/oauth-redirect-page-client.tsx`
- `src/app/(service)/redirection/page.tsx`

각 파일의 책임은 다음과 같다.

- type: 계약 표현
- parser: query 해석
- controller: 쿠키 쓰기, GTM, 라우팅, 에러 처리
- ui: 렌더링
- app page: 진입점

이 작업이 필요한 이유는 다음과 같다.

- W7. 현재 `/redirection`은 계약 해석과 부수효과가 한 파일에 섞여 있다.
- W8. 계약 판단은 model 레이어, 브라우저 액션은 controller 레이어에 있어야 테스트가 가능하다.
- W9. app page는 Next.js 경계만 담당해야 하고, 브라우저 로직을 품으면 안 된다.

즉, 이 작업은 단순 파일 분리가 아니라 책임 분리다.

다시 정리하면, page는 입구만 맡고 실제 판단과 동작은 parser와 controller로 내려야 안전하다.

### 5.4 작업 4: 세션 쓰기 로직을 공용 함수로 통합

네 번째 작업은 기존 회원과 신규 회원의 세션 기록 함수를 분리하는 일이다.

필요한 함수는 아래 정도가 적절하다.

- `writeExistingMemberSession`
- `writeNewMemberSession`
- `clearClientSession`
- `isExistingMemberSessionComplete`
- `isNewMemberSignupSession`

이 작업이 필요한 이유는 다음과 같다.

- W10. 기존 회원은 `accessToken + memberId`가 있어야 세션이 완성된다.
- W11. 신규 회원은 `accessToken`만으로도 `/sign-up`까지는 정상이다.
- W12. 이 차이를 공용 함수로 표현하지 않으면, 미들웨어/헤더/provider가 다시 제각각 판정하게 된다.

즉, 세션은 "쿠키 몇 개를 쓴다"가 아니라 "어떤 상태가 정상인가"를 표현하는 규칙이어야 한다.

다시 정리하면, 기존 회원 세션과 신규 회원 세션은 정상 상태가 다르므로 기록 함수도 분리해야 한다.

### 5.5 작업 5: 미들웨어가 bootstrap 세션을 지우지 못하게 경계 재설정

다섯 번째 작업은 미들웨어의 삭제 조건을 축소하는 일이다.

미들웨어는 아래 단계까지만 다뤄야 한다.

1. 이미 완성된 세션 검증
2. 만료된 access token refresh
3. 보호 경로 접근 통제
4. 서버가 확인한 `memberId` 정규화

반대로 아래 상태는 미들웨어가 즉시 삭제하면 안 된다.

1. `/redirection` 직후 세션이 아직 형성 중인 상태
2. 신규 회원이 `member-id` 없이 `/sign-up`으로 가는 상태
3. `refresh_token`과 `accessToken`의 저장 타이밍이 아직 완전히 맞물리지 않은 상태

이 작업이 필요한 이유는 다음과 같다.

- W13. 지금 구조에서는 로그인 직후의 정상 전이 상태가 파손 세션으로 오판될 수 있다.
- W14. bootstrap 단계는 인증 실패가 아니라 세션 형성 단계다.
- W15. 세션 형성 단계와 세션 유지 단계를 같은 기준으로 검사하면, 시스템이 정상 로그인 플로우를 스스로 지운다.

즉, 미들웨어는 로그인 생성기가 아니라 세션 유지 장치여야 한다.

다시 정리하면, 미들웨어는 로그인 만드는 곳이 아니라 로그인 이후 상태를 검사하고 유지하는 곳이어야 한다.

### 5.6 작업 6: 로그인 판정 기준을 한 곳으로 모으기

여섯 번째 작업은 Header, Provider, middleware, page가 쓰는 로그인 기준을 통합하는 일이다.

필요한 공용 판정은 최소 아래 두 가지다.

- `isAuthenticatedMemberSession`
- `isPendingSignupSession`

이 작업이 필요한 이유는 다음과 같다.

- W16. 같은 앱 안에서 로그인 기준이 여러 개면 한 레이어는 성공, 다른 레이어는 실패로 본다.
- W17. 특히 기존 회원과 신규 회원의 정상 조건이 다른데, 현재 구조는 이를 명시적으로 분리하지 않는다.
- W18. 로그인 판정이 공용화되면 Header, Provider, middleware가 같은 세션 모델을 사용하게 된다.

즉, "로그인됨"은 UI별 판단이 아니라 도메인 규칙이어야 한다.

다시 정리하면, 앱 전체가 같은 기준으로만 "로그인됨"을 말해야 화면이 서로 다른 말을 하지 않는다.

### 5.7 작업 7: 실패 원인과 계약 위반을 로그로 남기기

일곱 번째 작업은 추론 대신 증명을 가능하게 만드는 것이다.

필수 로그는 아래와 같다.

- parser가 어떤 이유로 실패했는지
- 기존 회원 성공인데 `member-id`가 비어 있었는지
- 신규 회원 성공인데 `access-token`이 비어 있었는지
- 미들웨어가 왜 세션을 삭제했는지

로그를 남길 때는 아래 원칙도 같이 고정해야 한다.

- `access-token`, `refresh_token` 원문은 로그에 남기지 않는다.
- `member-id`, `user-name`, `profile-image-url`도 원문 전체를 그대로 남기지 않는다.
- 파라미터 스냅샷은 "존재 여부", "계약 위반 종류", "마스킹된 식별자" 수준까지만 기록한다.

이 작업이 필요한 이유는 다음과 같다.

- W19. 지금은 "쿠키가 왜 사라졌는지"를 코드 추적으로만 추론해야 한다.
- W20. 계약 위반과 운영 설정 문제를 나누려면, 삭제 사유와 파라미터 스냅샷이 필요하다.

즉, 로그는 부가 기능이 아니라 운영 복구 도구다.

다시 정리하면, 왜 실패했는지 기록이 없으면 다음 장애 때도 또 코드만 뒤져가며 추측해야 한다.

## 6. 프론트 구현 우선순위

현재 우선순위는 아래처럼 잡아야 한다.

1. OAuth redirect 타입 정의
2. redirect parser 도입
3. `/redirection` controller 분리
4. 세션 기록 공용화
5. 미들웨어 삭제 조건 축소
6. 로그인 판정 공용화
7. 로그 및 E2E 추가

이 순서를 바꾸면 안 된다. 특히 미들웨어만 먼저 건드리면, `/redirection` 해석 규칙이 계속 암묵적인 상태로 남아서 같은 회귀가 반복된다.

## 7. 결론

백엔드 계약 기준으로 보면, 프론트가 해야 하는 일은 단순히 `access-token`을 쿠키에 쓰는 것이 아니다. 프론트는 `/redirection`을 OAuth 결과 해석 경계로 소유해야 하고, 그 결과를 기존 회원 성공, 신규 회원 성공, 실패로 정확히 분리해야 한다.

핵심 결론은 다음과 같다.

- 프론트는 `member-id` 유무만으로 성공을 판단하면 안 된다.
- 프론트는 `is-success`, `is-guest`, `access-token`, `member-id`의 조합을 계약으로 해석해야 한다.
- 프론트는 bootstrap 세션과 완성된 세션을 같은 기준으로 검사하면 안 된다.
- 프론트는 로그인 판정 규칙을 여러 파일에 중복 정의하면 안 된다.

따라서 지금 필요한 작업은 "로그인 페이지를 조금 고친다"가 아니라, `/redirection -> session bootstrap -> authenticated session` 흐름을 프론트 도메인 규칙으로 다시 세우는 일이다.

## 8. 추가 보완: 실패 Redirect 세션 정리

로컬 E2E에서 확인한 추가 문제는, OAuth 실패 redirect가 `/login`으로 이동하더라도 이전 인증 헤더가 잠시 남을 수 있다는 점이었다. 원인은 클라이언트 쿠키만 지운 뒤 같은 서비스 레이아웃 안에서 `router.replace('/login')`만 수행하면, 서버가 보는 인증 쿠키와 공유 레이아웃 상태가 즉시 정리되지 않을 수 있기 때문이다.

그래서 실패 redirect와 계약 위반 redirect는 이제 `/api/auth/clear-session?redirect=/login`을 경유한다. 이 route handler가 서버와 브라우저가 보는 인증 쿠키를 함께 정리한 뒤 로그인 페이지로 이동시킨다.

다시 정리하면, OAuth 실패는 이제 "로그인 페이지로 화면만 전환"이 아니라 "서버/클라이언트 세션 전체 정리 후 로그인 페이지로 이동"으로 처리한다.
