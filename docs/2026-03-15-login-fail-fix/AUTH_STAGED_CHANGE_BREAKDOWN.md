# 인증 스테이징 변경 상세 설명

## 1. 문서 목적

이 문서는 현재 스테이징된 인증 관련 변경을 파일 단위로 설명하기 위해 작성한다. 목표는 세 가지다. 첫째, 각 파일이 무엇을 바꿨는지 기록한다. 둘째, 왜 그 변경이 필요한지 논리적으로 설명한다. 셋째, 특히 `src/middleware.ts`처럼 변경량이 큰 파일은 함수 단위로 더 잘게 쪼개서 이해 가능한 형태로 정리한다.

이 문서는 구현 계획 문서가 아니라 "현재 staged diff가 정확히 무엇을 의미하는가"를 설명하는 해설 문서다.

## 2. 전체 요약

이번 스테이징은 한 문장으로 요약하면 다음과 같다.

`OAuth redirect 결과를 타입/파서/컨트롤러로 분리하고, 세션 생성과 로그인 판정을 공용 규칙으로 통일해서, 미들웨어가 bootstrap 상태를 너무 공격적으로 깨지 못하게 만든 변경`

다시 정리하면, 로그인 결과를 해석하는 기준과 쿠키를 쓰는 규칙을 한곳으로 모으고, 로그인 직후의 정상적인 전이 상태를 미들웨어가 실패로 오해하지 않게 만든 수정이다.

## 3. 문서

### 3.1 `docs/FRONTEND_OAUTH_REDIRECTION_CONTRACT.md`

이 문서는 백엔드 `/redirection` query 계약을 프론트 구현 규칙으로 번역한 문서다.

이 문서가 하는 일은 다음과 같다.

- 기존 회원 성공 케이스를 어떻게 판단해야 하는지 정의한다.
- 신규 회원 성공 케이스를 어떻게 판단해야 하는지 정의한다.
- 실패 케이스를 어떻게 분리해야 하는지 정의한다.
- 프론트가 `member-id`만 보고 성공/실패를 판단하면 안 된다는 점을 문서화한다.

이 문서가 필요한 이유는, 로그인 버그의 핵심이 "백엔드 계약을 프론트가 어떻게 읽어야 하는가"에 있기 때문이다.

다시 정리하면, 이 문서는 "프론트가 `/redirection`을 읽는 정답표"다.

### 3.2 `docs/SOCIAL_LOGIN_REFACTORING_PLAN.md`

이 문서는 운영 로그인 회귀를 단순 커밋 문제가 아니라 구조 문제로 분석한 문서다.

이 문서가 하는 일은 다음과 같다.

- 현재 로그인 흐름을 프론트/백엔드/브라우저 쿠키 관점에서 다시 정리한다.
- 왜 `/auth/me`보다 `/redirection -> session bootstrap` 경계가 더 중요한지 설명한다.
- 어떤 순서로 리팩토링해야 회귀를 줄일 수 있는지 우선순위를 제시한다.

이 문서가 필요한 이유는, 단순히 특정 커밋을 의심하는 수준으로는 구조적 문제를 해결할 수 없기 때문이다.

다시 정리하면, 이 문서는 "왜 이 버그가 반복되기 쉬운 구조였는지"를 설명하는 설계 문서다.

## 4. 인증 도메인 모델

### 4.1 `src/types/auth/domain.ts`

이 파일은 인증 세션 상태와 OAuth redirect 결과 타입을 새로 정의한 파일이다.

추가된 핵심 타입은 다음과 같다.

- `AuthSessionLike`
- `AuthSessionState`
- `OAuthRedirectParamSnapshot`
- `ExistingMemberOAuthRedirectResult`
- `NewMemberOAuthRedirectResult`
- `OAuthRedirectFailureResult`
- `OAuthRedirectResult`

이 파일이 하는 일은 다음과 같다.

- 세션을 `anonymous`, `pending-signup`, `authenticated-member` 상태로 나눈다.
- OAuth redirect 결과를 `existing-member-success`, `new-member-success`, `failure`로 나눈다.
- 계약 위반 시 로깅할 스냅샷 구조를 정의한다.

이 파일이 필요한 이유는, 지금까지 로그인 규칙이 코드 여러 곳에 암묵적으로 퍼져 있었기 때문이다.

다시 정리하면, 이 파일은 "인증에서 어떤 상태와 어떤 결과가 존재하는지"를 이름 붙여서 고정한 정의서다.

### 4.2 `src/features/auth/model/auth-session.ts`

이 파일은 세션 판정 규칙을 공용 함수로 묶은 파일이다.

핵심 함수는 다음과 같다.

- `hasAccessToken`
- `normalizeMemberId`
- `getAuthSessionState`
- `isAuthenticatedMemberSession`
- `isPendingSignupSession`
- `toNumberMemberId`

이 파일이 하는 일은 다음과 같다.

- `memberId`가 실제로 유효한 숫자형 문자열인지 정규화한다.
- access token 존재 여부를 판정한다.
- 현재 세션이 익명인지, 회원가입 진행 중인지, 완성된 회원 세션인지 계산한다.
- 다른 파일들이 같은 기준으로 로그인 여부를 판정하게 만든다.

이 파일이 필요한 이유는, 헤더, Provider, 미들웨어, 홈 페이지가 각자 다른 기준으로 로그인 여부를 계산하던 문제를 없애기 위해서다.

다시 정리하면, 이 파일은 "로그인됨 / 회원가입 진행 중 / 비로그인"을 앱 전체가 같은 기준으로 말하게 만드는 공통 규칙 모음이다.

### 4.3 `src/features/auth/model/client-auth-session.ts`

이 파일은 클라이언트 쿠키 쓰기 규칙을 공용화한 파일이다.

핵심 함수는 다음과 같다.

- `clearClientSession`
- `writeExistingMemberSession`
- `writeNewMemberSession`
- `writeAccessTokenSession`

이 파일이 하는 일은 다음과 같다.

- 기존 회원 로그인 성공 시 `accessToken + memberId`를 함께 기록한다.
- 신규 회원 로그인 성공 시 `accessToken`은 기록하되 `memberId`는 제거한다.
- 세션 초기화 시 `accessToken`, `memberId`, `socialImageURL`을 일괄 정리한다.
- refresh로 새 access token을 받은 경우 토큰 안의 `memberId`까지 함께 맞춘다.

이 파일이 필요한 이유는, redirect/login/signup/logout/refresh가 제각각 쿠키를 다루지 않게 하려는 것이기 때문이다.

다시 정리하면, 이 파일은 "쿠키를 어떻게 써야 정상 세션인지"를 한 군데로 모아놓은 파일이다.

### 4.4 `src/features/auth/model/parse-oauth-redirect-result.ts`

이 파일은 `searchParams`를 백엔드 계약대로 파싱하는 경계 함수다.

핵심 구성은 다음과 같다.

- `OAuthRedirectContractError`
- `getOAuthRedirectParamSnapshot`
- `parseOAuthRedirectResult`

이 파일이 하는 일은 다음과 같다.

- `type`, `is-success`, `is-guest`, `access-token`, `member-id`를 조합해 케이스를 해석한다.
- 실패면 `failure` 타입을 반환한다.
- 기존 회원 성공이면 `existing-member-success`를 반환한다.
- 신규 회원 성공이면 `new-member-success`를 반환한다.
- 계약 위반이면 스냅샷과 이유를 담아 `OAuthRedirectContractError`를 던진다.

이 파일이 필요한 이유는 `/redirection`에서 암묵적 분기를 없애기 위해서다.

다시 정리하면, 이 파일은 "쿼리스트링을 읽고 지금이 어떤 로그인 결과인지 판정하는 판독기"다.

### 4.5 `src/features/auth/model/use-oauth-redirect-controller.ts`

이 파일은 `/redirection`의 실제 브라우저 부수효과를 모은 controller다.

이 파일이 하는 일은 다음과 같다.

- parser를 호출해 로그인 결과를 해석한다.
- 실패 시 세션을 정리하고 `/login`으로 보낸다.
- 신규 회원이면 pending signup 세션을 기록하고 `/sign-up`으로 보낸다.
- 기존 회원이면 완성 세션을 기록하고 GTM 이벤트를 발송한 뒤 `/home`으로 보낸다.
- 계약 위반이나 예외 발생 시 로그를 남긴다.

이 파일이 필요한 이유는 query 해석과 쿠키 쓰기와 라우팅을 UI 파일에 섞지 않기 위해서다.

다시 정리하면, 이 파일은 "해석된 로그인 결과를 실제 브라우저 동작으로 바꾸는 지휘자"다.

### 4.6 `src/features/auth/ui/oauth-redirect-page-client.tsx`

이 파일은 `useSearchParams`와 controller를 묶는 얇은 UI 파일이다.

이 파일이 하는 일은 다음과 같다.

- `useSearchParams`를 통해 URL query를 읽는다.
- controller를 호출한다.
- `Suspense` 경계 안에서 최소 UI 역할만 수행한다.

이 파일이 필요한 이유는 Next.js page 파일에서 비즈니스 로직을 빼고 `Suspense` 경계만 남기기 위해서다.

다시 정리하면, 이 파일은 `/redirection` 페이지의 얇은 클라이언트 껍데기다.

## 5. 리다이렉트와 미들웨어

### 5.1 `src/app/(service)/redirection/page.tsx`

이 파일은 예전의 거대한 `useEffect` 파일을 지우고 새 client page 컴포넌트만 렌더하는 엔트리로 축소했다.

이 파일이 하는 일은 이제 단 하나다.

- `OAuthRedirectPageClient`를 렌더한다.

이 파일이 필요한 이유는 query 해석, 쿠키 쓰기, GTM, 라우팅을 page에 섞어두지 않기 위해서다.

다시 정리하면, page는 이제 로그인 판단을 하지 않고 입구 역할만 한다.

### 5.2 `src/middleware.ts`

이 파일은 이번 staged 변경의 핵심이다.

큰 방향의 변경은 다음과 같다.

- `refresh_token`을 `getServerCookie`가 아니라 실제 `request.cookies`에서 읽게 했다.
- access token `secure` 옵션을 요청 프로토콜 기준으로 계산하게 했다.
- 라우트를 공개/보호/우회 prefix로 나눴다.
- `AuthContext`에 `sessionState`, `decodedMemberId`, `isGuestToken`을 넣었다.
- `pending-signup` 상태를 정상 bootstrap 상태로 취급하게 했다.
- 쿠키 삭제 시 이유 로그를 남기게 했다.

이 파일이 필요한 이유는 로그인 직후의 정상 전이 상태를 파손 세션으로 오판해서 쿠키를 바로 지우는 문제를 줄이기 위해서다.

다시 정리하면, 이번 미들웨어 수정의 목적은 "세션이 완전히 깨졌을 때만 정리하고, 아직 로그인 만드는 중인 상태는 살려두자"이다.

## 6. 로그인 상태 소비처 정렬

### 6.1 `src/providers/index.tsx`

이 파일은 user store 초기화 기준을 공용 세션 판정으로 바꿨다.

예전에는 `accessToken` 유무나 숫자 변환만 봤지만, 지금은 `isAuthenticatedMemberSession`과 `toNumberMemberId`를 사용한다.

이 파일이 하는 일은 다음과 같다.

- 완성된 세션일 때만 유저 정보를 유지한다.
- `memberId`가 실제로 맞지 않으면 store를 초기화한다.

이 파일이 필요한 이유는 Provider가 redirect/bootstrap 도중 세션을 너무 빨리 초기화하지 않게 하려는 것이다.

다시 정리하면, 이제 Provider는 "쿠키가 조금 생겼다"가 아니라 "정상 로그인 세션이 완성됐다"를 보고 유저 상태를 유지한다.

### 6.2 `src/components/common/layout/home-header.tsx`

이 파일은 헤더의 로그인 판정을 공용 규칙으로 바꿨다.

이 파일이 하는 일은 다음과 같다.

- `accessToken`만 있으면 일부 UI를 노출하던 동작을 없앤다.
- 완성된 회원 세션일 때만 프로필 fetch, 알림, 토글, 유저 드롭다운을 노출한다.

이 파일이 필요한 이유는 헤더 내부에서조차 로그인 기준이 갈라져 있던 문제를 없애기 위해서다.

다시 정리하면, 이제 헤더는 애매한 세션을 로그인으로 보지 않는다.

### 6.3 `src/app/(service)/home/page.tsx`

이 파일은 서버에서 `memberId`를 넘길 때도 `memberId` 문자열만 보지 않고 `accessToken + memberId`가 완성된 세션인지 확인한 뒤 숫자로 변환하도록 바꿨다.

이 파일이 필요한 이유는 홈 페이지가 불완전 세션을 정상 로그인처럼 해석하지 않게 하기 위해서다.

다시 정리하면, 홈 페이지 진입 시점에도 "정상 로그인 세션인지"를 한 번 더 같은 기준으로 확인한다.

### 6.4 `src/components/pages/home-page-server-content.tsx`

이 파일은 히스토리 탭 노출 조건을 `memberId` 단독 체크에서 완성 세션 체크로 바꿨다.

이 파일이 필요한 이유는 쿠키 하나만 남은 상태에서 "나의 스터디 기록"이 열리는 오판을 막기 위해서다.

다시 정리하면, `memberId`만 남아 있다고 히스토리 탭을 보여주지 않는다.

### 6.5 `src/components/home/tab-navigation.tsx`

이 파일은 클라이언트 탭 노출 조건도 같은 공용 세션 판정으로 맞췄다.

이 파일이 필요한 이유는 서버 쪽 홈 페이지 판정과 클라이언트 탭 네비게이션 판정이 다르면 hydration 후 UI가 뒤집히기 때문이다.

다시 정리하면, 서버와 클라이언트가 탭 노출 조건을 똑같이 보게 만든 수정이다.

## 7. 쿠키 쓰기 호출부 정리

### 7.1 `src/api/client/axios.ts`

이 파일은 refresh 성공 시 `setCookie('accessToken')`만 하던 코드를 `writeAccessTokenSession()`으로 바꿨다.

이 파일이 하는 일은 다음과 같다.

- 새 access token을 저장한다.
- 토큰 안의 `memberId`도 같이 맞춘다.
- 토큰에는 `memberId`가 없는데 쿠키에 남아 있던 stale `memberId`는 지운다.

이 파일이 필요한 이유는 refresh 이후 `accessToken`과 `memberId`가 서로 다른 상태로 남지 않게 하기 위해서다.

다시 정리하면, 토큰 갱신 뒤에도 세션 조각들이 서로 안 어긋나게 만든 수정이다.

### 7.2 `src/api/client/axiosV2.ts`

이 파일은 위와 같은 이유로 openapi용 axios refresh 경로도 동일하게 맞췄다.

다시 정리하면, 레거시 axios와 openapi axios가 refresh 이후 서로 다른 세션 규칙을 쓰지 않게 통일했다.

### 7.3 `src/api/client/cookie.ts`

이 파일은 두 가지가 바뀌었다.

첫째, `secure`를 무조건 `true`로 쓰지 않고 브라우저 프로토콜이나 서버 환경에 따라 계산하도록 바꿨다.

둘째, `clearUserSession`이 실제 프로젝트에서 쓰는 `socialImageURL`을 지우도록 정리했고, 예전의 `userName/profileImage` 같은 현재 세션 모델과 안 맞는 쿠키 이름은 제거했다.

이 파일이 필요한 이유는 로컬 HTTP나 환경 차이에서 쿠키 기록이 막히지 않게 하고, 실제 세션 모델과 안 맞는 정리 로직을 바로잡기 위해서다.

다시 정리하면, 쿠키를 더 현실적인 환경 기준으로 쓰고 지우게 만든 수정이다.

### 7.4 `src/components/common/modals/login-modal.tsx`

이 파일은 개발용 테스트 로그인 성공 시 쿠키를 직접 세 줄 쓰던 코드를 `writeExistingMemberSession()` 호출로 바꿨다.

이 파일이 필요한 이유는 테스트 로그인도 운영 로그인과 같은 세션 기록 규칙을 따르도록 맞추기 위해서다.

다시 정리하면, 테스트 로그인만 따로 이상한 방식으로 쿠키를 쓰지 않게 했다.

### 7.5 `src/components/common/modals/sign-up-modal.tsx`

이 파일은 회원가입 성공 후 `memberId/accessToken/refresh_token`을 직접 쓰던 코드를 `writeExistingMemberSession()`으로 바꾸고, JS로 `refresh_token`을 쓰는 코드를 제거했다.

이 파일이 필요한 이유는 `refresh_token`은 백엔드 `Set-Cookie` 책임이지 프론트 JS 책임이 아니고, 프론트가 직접 쓰면 계약이 꼬이기 때문이다.

다시 정리하면, 회원가입 성공 후에도 프론트가 손대야 할 쿠키와 백엔드가 책임져야 할 쿠키를 분리한 수정이다.

### 7.6 `src/hooks/queries/use-auth-mutation.ts`

이 파일은 로그아웃 시 쿠키 3개를 개별 삭제하던 코드를 `clearClientSession()`으로 바꿨다.

이 파일이 필요한 이유는 세션 정리 규칙도 한 함수로 모아서 logout과 other failure path가 같은 방식으로 세션을 지우게 하려는 것이다.

다시 정리하면, 로그아웃도 세션 정리 공용 규칙을 사용하도록 통일했다.

## 8. `src/middleware.ts` 상세 설명

이 섹션은 `middleware.ts`를 함수 단위로 잘게 쪼개서 설명한다.

### 8.1 import와 shared auth model 연결

파일 상단에서 새로 들어온 핵심 import는 다음과 같다.

- `getAuthSessionState`
- `isAuthenticatedMemberSession`
- `isPendingSignupSession`
- `normalizeMemberId`
- `AuthSessionState`

이 변화가 의미하는 바는, 미들웨어가 더 이상 자체 기준으로 로그인 상태를 판단하지 않고 공용 세션 모델을 쓰게 됐다는 점이다.

예전 문제는 미들웨어 안에서만 따로 `hasAccessToken`, `hasMemberId` 같은 조건을 만들어 쓰던 것이고, 그 기준이 헤더나 Provider와 달랐다는 점이다.

이제는 미들웨어도 같은 도메인 함수를 쓰므로, 적어도 "현재 세션이 anonymous인지 pending-signup인지 authenticated-member인지"를 앱 전체와 같은 언어로 말할 수 있게 됐다.

다시 정리하면, 미들웨어도 이제 혼자 다른 기준을 쓰지 않고 공용 로그인 규칙을 쓰기 시작했다.

### 8.2 `getAccessTokenCookieOptions(request)`

이 함수는 access token 쿠키를 다시 쓸 때 `secure` 옵션을 요청 프로토콜 기준으로 계산한다.

바뀐 점은 다음과 같다.

- 예전: `secure: true` 고정
- 지금: `request.nextUrl.protocol === 'https:'` 또는 `x-forwarded-proto === 'https'`일 때만 `secure: true`

이 변경이 필요한 이유는, 로컬 HTTP나 프록시 환경에서 무조건 secure 쿠키를 쓰면 브라우저가 쿠키를 받지 않을 수 있기 때문이다.

이 함수는 특히 refresh 이후 access token을 다시 기록할 때 사용된다.

다시 정리하면, 환경이 HTTP인데도 HTTPS 전용 쿠키처럼 써버려서 access token이 사라지는 일을 줄이려는 함수다.

### 8.3 라우트 분리: `PUBLIC_SESSION_ROUTE_PREFIXES`, `PROTECTED_ROUTE_PREFIXES`, `AUTH_BYPASS_ROUTE_PREFIXES`

이번 변경에서는 라우트를 세 그룹으로 나눴다.

- 공개 서비스 경로
- 보호 경로
- 인증 검사 우회 경로

각 그룹의 의미는 다음과 같다.

- 공개 서비스 경로: 비회원도 들어갈 수 있지만, 로그인 상태면 세션 정규화나 토큰 refresh를 해줄 수 있는 경로
- 보호 경로: 정상 회원 세션이 아니면 접근시키면 안 되는 경로
- 우회 경로: `/redirection`처럼 로그인 bootstrap이 진행 중이므로 일반 인증 검사 기준을 바로 적용하면 안 되는 경로

이 변경이 필요한 이유는, 모든 경로를 같은 방식으로 처리하면 `/redirection` 같은 특수 경로를 정상적으로 다룰 수 없기 때문이다.

다시 정리하면, "다 같은 페이지가 아니다"를 코드로 명시한 것이다.

### 8.4 `verifyAccessToken(accessToken)`

이 함수는 `/api/v1/auth/me`를 호출해 access token 유효성을 확인한다.

이 함수가 하는 일은 다음과 같다.

- `AUTH001`이면 `invalid`
- 200 응답이면 `valid`와 서버가 확인한 `memberId`
- 그 외 에러면 `unknownError`

이 함수의 중요한 역할은 단순히 토큰이 있는지 확인하는 것이 아니라, 서버 기준으로 그 토큰이 아직 쓸 수 있는지와 어떤 `memberId`에 속하는지를 다시 확인하는 것이다.

이 값은 뒤에서 `memberId` 쿠키를 정규화할 때도 사용된다.

다시 정리하면, 브라우저 쿠키를 믿지 말고 서버한테 "이 토큰 진짜 유효해?"를 묻는 함수다.

### 8.5 `refreshAccessToken(request)`

이번 변경에서 가장 중요한 수정 중 하나다.

예전에는 `getServerCookie('refresh_token')`를 통해 refresh token을 읽었다. 지금은 `request.cookies.get('refresh_token')?.value`를 사용한다.

이 차이가 중요한 이유는 다음과 같다.

- 미들웨어는 현재 요청을 기준으로 판단해야 한다.
- `request.cookies`는 지금 들어온 브라우저 요청의 실제 쿠키다.
- `getServerCookie()`는 Next 서버 환경 쿠키 접근 유틸이지만, 미들웨어에서는 현재 요청 컨텍스트를 직접 보는 것이 더 맞다.

이 함수는 refresh token이 없으면 바로 `null`을 반환하고, 있으면 refresh API를 호출한 뒤 새 access token을 반환한다.

다시 정리하면, "지금 이 요청이 실제로 들고 온 refresh token"을 써서 갱신하게 만든 수정이다.

### 8.6 `setMemberIdCookie()`와 `applyNewToken()`

이 두 함수는 refresh 이후 세션을 다시 맞추는 역할을 한다.

`setMemberIdCookie()`는 말 그대로 `memberId` 쿠키를 쓰는 작은 헬퍼다.

`applyNewToken()`은 다음을 한 번에 수행한다.

- 새 `accessToken`을 쿠키에 기록한다.
- 토큰을 decode한다.
- 토큰 안의 `memberId`를 정규화한다.
- 유효한 `memberId`가 있으면 그 값으로 `memberId` 쿠키도 맞춘다.

이 함수가 필요한 이유는, access token만 새로 쓰고 `memberId`는 예전 값을 남겨두면 세션 조각들이 서로 다른 상태가 될 수 있기 때문이다.

다시 정리하면, 새 토큰을 받았으면 그 토큰 기준으로 세션 전체를 다시 맞추는 함수다.

### 8.7 `clearAuthCookies(response, reason, pathname)`

예전에는 그냥 쿠키를 지웠다. 지금은 이유와 경로를 함께 로그로 남긴다.

이 함수가 하는 일은 다음과 같다.

- `console.warn`으로 삭제 이유를 기록한다.
- `accessToken`, `memberId`, `socialImageURL`을 삭제한다.

이 함수가 필요한 이유는, 운영에서 "왜 쿠키가 사라졌는지"를 추측이 아니라 로그로 증명할 수 있어야 하기 때문이다.

`reason` 값은 이후에 `"public-route-refresh-failed"`, `"protected-route-refresh-failed"` 같은 분석 단서로 쓰인다.

다시 정리하면, 이제는 쿠키를 지울 때 "왜 지웠는지" 흔적을 남긴다.

### 8.8 `AuthContext`와 `getAuthContext(request)`

이번 staged diff에서 가장 중요한 구조 변화 중 하나다.

새 `AuthContext`는 다음 필드를 가진다.

- `accessToken`
- `memberId`
- `decodedMemberId`
- `isGuestToken`
- `sessionState`

`getAuthContext()`는 브라우저가 보낸 현재 쿠키와 토큰 decode 결과를 바탕으로 이 값을 만든다.

이 구조가 필요한 이유는 다음과 같다.

- `memberId` 쿠키만 있는지
- access token은 있는데 `memberId`가 없는지
- 토큰 안 role이 guest인지
- 현재 세션이 완성된 회원 세션인지, 회원가입 대기 세션인지

를 다음 분기에서 바로 쓸 수 있기 때문이다.

예전처럼 `hasAccessToken`과 `hasMemberId`만 보면 `pending-signup`과 `broken-session`을 구분하기 어렵다.

다시 정리하면, 미들웨어가 지금 세션 상태를 더 풍부하게 이해할 수 있게 만든 컨텍스트다.

### 8.9 `handleSignUp(request, ctx)`

이 함수는 `/sign-up` 경로 전용 처리다.

동작은 다음과 같다.

1. 이미 완성된 회원 세션이면 `/home`으로 보낸다.
2. 완전히 익명 세션이면 `/`로 보낸다.
3. 그 외, 즉 `pending-signup`이면 그대로 통과시킨다.

이 함수가 필요한 이유는, 신규 회원이 `memberId` 없이 `/sign-up`으로 들어오는 상태를 정상으로 취급해야 하기 때문이다.

다시 정리하면, 회원가입 페이지는 "memberId 없는 로그인 중간 상태"를 정상으로 받아줘야 한다.

### 8.10 `handlePublicSessionRoute(request, ctx)`

이 함수는 공개 서비스 경로에서 세션을 어떻게 다룰지 결정한다.

동작을 순서대로 보면 다음과 같다.

1. `anonymous`면 통과시킨다.
2. 이때 `memberId`만 남아 있으면 위조되거나 stale한 identity 조각일 수 있으므로 정리한다.
3. `pending-signup`이면 세션 형성 중 상태로 보고 통과시킨다.
4. 단, guest가 아닌데 토큰 안 `memberId`가 있으면 `memberId`를 다시 맞춰준다.
5. 완성된 회원 세션이면 `/auth/me`로 검증한다.
6. 토큰이 invalid면 refresh를 시도한다.
7. refresh도 실패하면 쿠키를 정리한다.
8. 검증 성공이면 서버가 확인한 `memberId`로 쿠키를 정규화한다.

이 함수가 중요한 이유는, 공개 경로에서는 비회원도 접근 가능하지만 로그인 세션이 있으면 가능한 한 복구하거나 정리해줘야 하기 때문이다.

이번 변경의 핵심은 `pending-signup`을 여기서 곧바로 깨진 세션으로 지우지 않게 했다는 점이다.

다시 정리하면, 공개 페이지에서는 "로그인 중간 상태"를 살려두고, "정말 깨진 세션"만 정리하게 바꾼 것이다.

### 8.11 `handleLogin(request, ctx)`

이 함수는 `/login` 경로 처리다.

동작은 다음과 같다.

1. `pending-signup`이면서 guest 토큰이면 `/sign-up`으로 보낸다.
2. 완성된 회원 세션이 아니면 로그인 페이지를 그대로 보여준다.
3. 완성된 회원 세션이면 `/auth/me`로 검증한다.
4. 유효하면 `/home`으로 보낸다.
5. invalid면 refresh를 시도한다.
6. refresh 성공이면 `/home`으로 보내고 세션을 다시 기록한다.
7. 그것도 안 되면 쿠키를 정리하고 로그인 페이지를 보여준다.

이 함수가 필요한 이유는, 이미 로그인된 사용자가 `/login`에 다시 들어오거나, 유효하지 않은 세션이 로그인 페이지에 남아 있는 상황을 정리해야 하기 때문이다.

다시 정리하면, 로그인 페이지는 "이미 로그인된 사람"은 홈으로 보내고, "깨진 세션"만 정리한다.

### 8.12 `handleProtected(request, ctx)`

이 함수는 보호 경로의 핵심 로직이다.

동작은 다음과 같다.

1. `anonymous`면 랜딩으로 보낸다.
2. `pending-signup`이면 guest는 `/sign-up`, 그 외는 깨진 세션으로 보고 정리 후 랜딩으로 보낸다.
3. access token이 없으면 랜딩으로 보낸다.
4. access token이 있으면 `/auth/me`로 검증한다.
5. invalid면 refresh를 시도한다.
6. refresh 실패면 세션 정리 후 랜딩으로 보낸다.
7. refresh 성공이면 새 토큰으로 다시 검증한다.
8. 그래도 `valid`가 아니면 세션 정리 후 랜딩으로 보낸다.
9. `valid`면 서버가 확인한 `memberId`로 쿠키를 맞춘다.
10. `/admin` 경로면 토큰 안 `ROLE_ADMIN`도 확인한다.

이 함수가 필요한 이유는, 보호 경로에서는 "정상 회원 세션"만 허용해야 하기 때문이다.

공개 경로와의 차이는, 보호 경로에서는 복구 실패 시 비회원처럼 그냥 통과시키지 않고 아예 접근을 막는다는 점이다.

다시 정리하면, 보호 페이지는 끝까지 세션을 검증하고 복구를 시도하되, 그래도 안 되면 들여보내지 않는다.

### 8.13 `middleware(request)` dispatcher

마지막 `middleware()` 함수는 실제 라우팅 분배기다.

동작 순서는 다음과 같다.

1. `/`는 그대로 통과
2. 우회 경로면 그대로 통과
3. `/sign-up`이면 `handleSignUp`
4. `/login`이면 `handleLogin`
5. 공개 서비스 경로면 `handlePublicSessionRoute`
6. 보호 경로면 `handleProtected`
7. 나머지는 그대로 통과

이 구조가 필요한 이유는, 경로 종류에 따라 인증 정책이 다르기 때문이다.

다시 정리하면, 마지막 함수는 "이 경로는 어느 규칙으로 검사할지"를 고르는 분배기다.

### 8.14 `config.matcher`

예전에는 일부 경로만 명시적으로 걸었다. 지금은 정적 리소스와 API를 제외한 거의 전체 앱 경로를 대상으로 미들웨어를 적용한다.

이 변경이 필요한 이유는, 공개 서비스 경로와 보호 경로를 prefix 기준으로 내부 분기하기 시작했기 때문이다.

다시 정리하면, 이제 matcher는 넓게 잡고, 실제 정책 분기는 미들웨어 내부에서 하도록 구조를 바꾼 것이다.

## 9. 결론

이번 staged 변경을 문서 한 줄로 다시 요약하면 다음과 같다.

`OAuth redirect 해석 규칙을 타입/파서/컨트롤러로 분리하고, 세션 생성/정리/판정을 공용화해, 미들웨어가 로그인 직후의 정상 bootstrap 상태를 과도하게 파손 세션으로 처리하지 않도록 만든 변경`

다시 정리하면, 로그인 결과를 읽는 규칙과 세션을 다루는 규칙을 한 군데로 모아서, 로그인 직후 쿠키가 바로 지워지는 회귀를 줄이기 위한 정리다.

## 10. 추가 보완: 실패 Redirect 세션 초기화

- [use-oauth-redirect-controller.ts](../../src/features/auth/model/use-oauth-redirect-controller.ts)는 OAuth 실패 또는 계약 위반 시 `clearClientSession()` 뒤에 곧바로 `/login`으로만 보내지 않도록 수정했다.
- 대신 [auth-route.ts](../../src/features/auth/model/auth-route.ts)의 `getClearSessionRedirectUrl()`을 통해 `/api/auth/clear-session?redirect=/login`으로 이동한다.
- 이유는 같은 서비스 레이아웃 안에서 클라이언트 전환만 하면 서버가 보는 쿠키와 공유 레이아웃 상태가 즉시 초기화되지 않아, 로그인 페이지 본문 위에 인증 헤더가 남는 버그가 있었기 때문이다.

다시 정리하면, OAuth 실패는 이제 “클라이언트 쿠키 삭제 + 서버 쿠키 삭제 + 로그인 페이지 재진입”으로 처리된다.
