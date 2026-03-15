# 인증 리팩토링 PR 개요

## 1. PR 목적

이 PR은 운영 환경에서 발생한 소셜 로그인 회귀를 단일 버그 수정으로 덮지 않고, 프론트엔드 인증 흐름 전체를 다시 정리하기 위한 리팩토링이다.

이번 변경의 목표는 아래 다섯 가지다.

1. 백엔드 OAuth redirect 계약을 프론트 코드에 명시적으로 반영한다.
2. 로그인 직후 정상 bootstrap 상태를 미들웨어가 파손 세션으로 오판하지 않게 한다.
3. 세션 생성, 세션 검증, 경로 보호, UI 로그인 판정의 기준을 하나로 맞춘다.
4. 보호 정책 소유권을 `middleware.ts`의 수동 목록 중심 구조에서 각 라우트 경계로 분산한다.
5. 이후 같은 회귀가 다시 생겨도 원인과 책임 경계를 빠르게 추적할 수 있게 구조와 문서를 정리한다.

## 2. 배경 문제

운영 이슈의 핵심은 아래 두 축이 겹친 것이었다.

1. OAuth 성공 결과를 `/redirection`에서 해석하는 규칙이 타입과 파서로 고정되어 있지 않았다.
2. 미들웨어, Provider, 헤더, 페이지가 각각 다른 기준으로 "로그인됨"을 판단하고 있었다.

그 결과 실제 운영에서는 아래와 같은 증상이 가능했다.

- 백엔드는 정상적으로 `access-token`, `refresh_token`을 발급했는데 프론트가 redirect 결과를 잘못 해석한다.
- 프론트가 `accessToken` 쿠키를 막 저장한 직후, 미들웨어가 이를 덜 형성된 세션으로 보고 바로 정리한다.
- 기존 회원과 신규 회원의 성공 조건이 다른데, 일부 레이어는 `memberId` 부재를 곧바로 실패로 본다.
- 보호 경로 정책이 `middleware.ts` 수동 목록에 묶여 있어, 경로 추가 시 보호 누락 가능성이 있었다.

## 3. 이번 PR에서 한 일

### 3.1 OAuth redirect 계약을 코드로 고정

백엔드 `/redirection` query 계약을 프론트 타입과 파서로 승격했다.

- [src/types/auth/domain.ts](../../src/types/auth/domain.ts)
- [src/features/auth/model/oauth-redirect-contract.ts](../../src/features/auth/model/oauth-redirect-contract.ts)
- [src/features/auth/model/parse-oauth-redirect-result.ts](../../src/features/auth/model/parse-oauth-redirect-result.ts)

정리된 계약은 아래와 같다.

1. `is-success=false` 이면 실패다.
2. `is-success=true && is-guest=false` 이면 기존 회원 성공이다.
3. `is-success=true && is-guest=true` 이면 신규 회원 성공이다.
4. 기존 회원 성공에는 `member-id`가 필요하다.
5. 신규 회원 성공에는 `member-id`가 없어도 된다.

이제 `/redirection`은 query를 직접 if 체인으로 읽지 않고, 계약 파서를 통해 `failure`, `new-member-success`, `existing-member-success`로 분기한다.

### 3.2 클라이언트 세션 모델을 auth feature 아래로 통합

인증 상태 해석과 클라이언트 세션 기록 규칙을 auth feature로 모았다.

- [src/features/auth/model/auth-cookie.ts](../../src/features/auth/model/auth-cookie.ts)
- [src/features/auth/model/auth-session.ts](../../src/features/auth/model/auth-session.ts)
- [src/features/auth/model/client-auth-session.ts](../../src/features/auth/model/client-auth-session.ts)
- [src/features/auth/model/use-auth.ts](../../src/features/auth/model/use-auth.ts)
- [src/features/auth/model/auth-hydration-context.tsx](../../src/features/auth/model/auth-hydration-context.tsx)

핵심 정리는 이렇다.

1. 쿠키 이름을 공용 상수로 관리한다.
2. 세션 상태를 `anonymous`, `pending-signup`, `authenticated-member`로 일관되게 해석한다.
3. 기존 회원 세션 기록과 신규 회원 세션 기록을 다른 함수로 분리한다.
4. 로그아웃과 세션 정리도 공용 함수로 묶는다.

이제 redirect, 로그인, 로그아웃, refresh, 서버 세션 읽기가 각자 쿠키를 제각각 다루지 않는다.

### 3.3 `/redirection`을 페이지가 아니라 인증 경계로 재구성

`/redirection` 경로의 책임을 parser, controller, client page로 분리했다.

- [src/features/auth/model/use-oauth-redirect-controller.ts](../../src/features/auth/model/use-oauth-redirect-controller.ts)
- [src/features/auth/ui/oauth-redirect-page-client.tsx](../../src/features/auth/ui/oauth-redirect-page-client.tsx)
- [src/app/(service)/redirection/page.tsx](../../src/app/(service)/redirection/page.tsx)

리다이렉트 후처리 흐름은 아래처럼 정리됐다.

1. 실패면 세션을 정리하고 `/login`으로 이동
2. 신규 회원이면 guest 세션을 기록하고 `/sign-up`으로 이동
3. 기존 회원이면 완성된 회원 세션을 기록하고 `/home`으로 이동

즉 `/redirection`은 더 이상 거대한 `useEffect` 파일이 아니라, OAuth 결과를 해석하는 전용 경계가 됐다.

### 3.4 미들웨어를 세션 인프라 레이어로 분해

기존 `middleware.ts` 한 파일에 섞여 있던 정책 선언, 세션 해석, 토큰 검증, 응답 적용을 나눴다.

- [src/middleware.ts](../../src/middleware.ts)
- [src/features/auth/server/middleware/route-policy.ts](../../src/features/auth/server/middleware/route-policy.ts)
- [src/features/auth/server/middleware/auth-context.ts](../../src/features/auth/server/middleware/auth-context.ts)
- [src/features/auth/server/middleware/access-token-session.ts](../../src/features/auth/server/middleware/access-token-session.ts)
- [src/features/auth/server/middleware/route-session.ts](../../src/features/auth/server/middleware/route-session.ts)
- [src/features/auth/server/middleware/route-decisions.ts](../../src/features/auth/server/middleware/route-decisions.ts)
- [src/features/auth/server/middleware/route-actions.ts](../../src/features/auth/server/middleware/route-actions.ts)
- [src/features/auth/server/middleware/route-handlers.ts](../../src/features/auth/server/middleware/route-handlers.ts)
- [src/features/auth/server/middleware/auth-cookies.ts](../../src/features/auth/server/middleware/auth-cookies.ts)
- [src/features/auth/server/middleware/route-reasons.ts](../../src/features/auth/server/middleware/route-reasons.ts)

이제 역할은 아래처럼 나뉜다.

1. `route-policy`: 경로 정책 선언
2. `auth-context`: 현재 요청의 인증 컨텍스트 해석
3. `access-token-session`: access token 검증/재발급 엔진
4. `route-session`: 현재 요청을 anonymous/pending-signup/authenticated/invalid로 정규화
5. `route-decisions`: 각 정책에서 어떤 응답을 할지 결정
6. `route-actions`: redirect/next/clear-cookie 같은 부수효과 적용
7. `route-handlers`: resolve -> decide -> apply 연결

이번 분해의 핵심은 "세션을 어떻게 검증하는가"와 "이 경로에서 무엇을 허용하는가"를 분리한 것이다.

### 3.5 보호 정책 소유권을 레이아웃으로 이동

보호 경로를 `middleware.ts` 목록에만 의존하지 않도록 서버 가드와 레이아웃 경계를 추가했다.

- [src/features/auth/model/server-auth-session.ts](../../src/features/auth/model/server-auth-session.ts)
- [src/features/auth/model/server-route-guard.ts](../../src/features/auth/model/server-route-guard.ts)
- [src/app/(service)/(my)/layout.tsx](../../src/app/(service)/(my)/layout.tsx)
- [src/app/(admin)/layout.tsx](../../src/app/(admin)/layout.tsx)
- [src/app/(service)/application-list/layout.tsx](../../src/app/(service)/application-list/layout.tsx)
- [src/app/(service)/payment/[id]/layout.tsx](../../src/app/(service)/payment/[id]/layout.tsx)
- [src/app/(service)/mentoring/become-mentor/layout.tsx](../../src/app/(service)/mentoring/become-mentor/layout.tsx)
- [src/app/(service)/mentoring/[id]/apply/layout.tsx](../../src/app/(service)/mentoring/[id]/apply/layout.tsx)

이 구조로 바뀌면서 새 보호 페이지는 route group 또는 layout 경계에 붙는 방식으로 관리할 수 있게 됐다.

즉 "새 페이지 만들 때마다 `middleware.ts`를 수정해야 하는 구조"에서 조금 더 벗어났다.

### 3.6 로그인 상태 소비처를 같은 규칙으로 정렬

헤더, Provider, 홈 페이지, 탭 노출 조건이 같은 세션 판정을 쓰도록 맞췄다.

- [src/providers/index.tsx](../../src/providers/index.tsx)
- [src/components/common/layout/home-header.tsx](../../src/components/common/layout/home-header.tsx)
- [src/components/pages/home-page-server-content.tsx](../../src/components/pages/home-page-server-content.tsx)
- [src/components/home/tab-navigation.tsx](../../src/components/home/tab-navigation.tsx)
- [src/app/(service)/home/page.tsx](../../src/app/(service)/home/page.tsx)

이전에는 어떤 곳은 `accessToken`만 보고, 어떤 곳은 `memberId`만 보고, 어떤 곳은 decode 결과와 쿠키를 따로 봤다.

지금은 "완성된 회원 세션"과 "회원가입 대기 세션"을 분리해서 같은 규칙으로 해석한다.

### 3.7 쿠키/refresh 흐름을 공용 경로로 정리

refresh 이후 `accessToken`, `memberId` 동기화 규칙을 클라이언트 전반에 맞췄다.

- [src/api/client/axios.ts](../../src/api/client/axios.ts)
- [src/api/client/axiosV2.ts](../../src/api/client/axiosV2.ts)
- [src/api/client/open-api-instance.ts](../../src/api/client/open-api-instance.ts)
- [src/api/client/cookie.ts](../../src/api/client/cookie.ts)
- [src/hooks/queries/use-auth-mutation.ts](../../src/hooks/queries/use-auth-mutation.ts)
- [src/components/common/modals/login-modal.tsx](../../src/components/common/modals/login-modal.tsx)
- [src/components/common/modals/sign-up-modal.tsx](../../src/components/common/modals/sign-up-modal.tsx)

핵심은 아래 두 가지다.

1. access token 갱신 시 memberId 쿠키도 같이 정규화
2. refresh_token은 백엔드 `Set-Cookie` 책임으로 두고, 프론트 JS가 직접 쓰지 않음

### 3.8 Hydration 및 전환 UX 문제 보정

인증 리팩토링 과정에서 함께 드러난 layout/hydration 문제와 마이페이지 전환 병목도 정리했다.

- [src/app/layout.tsx](../../src/app/layout.tsx)
- [src/app/(landing)/layout.tsx](../../src/app/(landing)/layout.tsx)
- [src/app/(service)/layout.tsx](../../src/app/(service)/layout.tsx)
- [src/app/(admin)/layout.tsx](../../src/app/(admin)/layout.tsx)
- [src/components/home/start-study-button.tsx](../../src/components/home/start-study-button.tsx)
- [src/components/common/layout/header-user-dropdown.tsx](../../src/components/common/layout/header-user-dropdown.tsx)
- [src/components/common/layout/sidebar/my-page-sidebar.tsx](../../src/components/common/layout/sidebar/my-page-sidebar.tsx)

주요 수정은 아래와 같다.

1. 하위 layout에서 중첩 `<html>/<body>`를 만들지 않도록 정리
2. hydration mismatch를 만들던 일부 클라이언트 렌더 차이를 완화
3. 마이페이지 진입 시 prefetch와 중복 프로필 조회 축소로 전환 체감 개선

### 3.9 문서와 팀 가이드 보강

인증 구조를 설명하는 문서와 작업 원칙도 같이 추가했다.

- [docs/2026-03-15-login-fail-fix/FRONTEND_OAUTH_REDIRECTION_CONTRACT.md](../../docs/2026-03-15-login-fail-fix/FRONTEND_OAUTH_REDIRECTION_CONTRACT.md)
- [docs/2026-03-15-login-fail-fix/SOCIAL_LOGIN_REFACTORING_PLAN.md](../../docs/2026-03-15-login-fail-fix/SOCIAL_LOGIN_REFACTORING_PLAN.md)
- [docs/2026-03-15-login-fail-fix/MIDDLEWARE_ROUTE_POLICY_GUIDE.md](../../docs/2026-03-15-login-fail-fix/MIDDLEWARE_ROUTE_POLICY_GUIDE.md)
- [docs/2026-03-15-login-fail-fix/MIDDLEWARE_AUTH_REFACTORING_NEXT_STEPS.md](../../docs/2026-03-15-login-fail-fix/MIDDLEWARE_AUTH_REFACTORING_NEXT_STEPS.md)
- [docs/2026-03-15-login-fail-fix/BACKEND_LOCAL_SOCIAL_LOGIN_COOKIE_CHANGE_REQUEST.md](../../docs/2026-03-15-login-fail-fix/BACKEND_LOCAL_SOCIAL_LOGIN_COOKIE_CHANGE_REQUEST.md)
- [docs/2026-03-15-login-fail-fix/AUTH_STAGED_CHANGE_BREAKDOWN.md](../../docs/2026-03-15-login-fail-fix/AUTH_STAGED_CHANGE_BREAKDOWN.md)
- [AGENTS.md](../../AGENTS.md)

추가된 가이드의 핵심은 아래와 같다.

1. 값이 진실의 원천이 되게 설계
2. raw 문자열 남발 금지
3. `const 객체 + union` 우선
4. 단일 책임 원칙 유지
5. 조건 분기 축소
6. 주석은 헷갈리는 경계에만 선택적으로 추가

## 4. 설계상 달라진 점

### 4.1 이전 구조

이전 구조는 아래 문제가 있었다.

1. `/redirection`에서 query 해석, 쿠키 쓰기, 라우팅, 분석 이벤트가 한 파일에 섞여 있었다.
2. 미들웨어가 세션 정책과 토큰 엔진을 동시에 품고 있었다.
3. 보호 정책이 `middleware.ts` 경로 목록에 과도하게 의존했다.
4. UI 소비처가 각자 다른 기준으로 로그인 여부를 계산했다.

### 4.2 현재 구조

현재는 아래처럼 경계를 나눴다.

1. OAuth 결과 해석: `types/auth` + redirect parser
2. 클라이언트 세션 기록: `client-auth-session`
3. 서버 세션 해석: `server-auth-session`, `auth-context`, `route-session`
4. 경로 정책 판단: `route-policy`, `route-decisions`
5. 응답 부수효과: `route-actions`, `auth-cookies`
6. 라우트 보호 소유권: layout + server-route-guard

즉 이번 PR의 본질은 "버그 한 줄 수정"이 아니라, 인증 흐름의 source of truth를 다시 세운 것이다.

## 5. 주의해서 봐야 할 변경 포인트

리뷰 시 아래 포인트를 특히 보면 된다.

1. 신규 회원 세션을 `pending-signup`으로 해석하는 기준이 백엔드 contract와 충돌하지 않는지
2. `/redirection` 계약 위반을 예외로 분리한 방식이 적절한지
3. 미들웨어가 여전히 정상 bootstrap 상태를 너무 공격적으로 지우지 않는지
4. layout 기반 보호와 middleware 정책이 서로 충돌하지 않는지
5. 헤더, Provider, 홈 페이지가 동일한 세션 규칙을 공유하는지

## 6. 테스트 및 검증

이번 PR에서 수행한 검증은 아래와 같다.

1. `yarn typecheck`

추가로 로컬 E2E 관점에서 확인해야 하는 시나리오는 아래다.

1. 기존 회원 OAuth 성공 후 `/home` 진입
2. 신규 회원 OAuth 성공 후 `/sign-up` 진입
3. 실패 redirect 후 `/login` 진입
4. 보호 경로 접근 시 익명 / 신규 회원 / 정회원 각각의 라우팅
5. refresh token 재발급 이후 memberId 쿠키 정규화

다만 로컬에서 실제 카카오 OAuth 전체 플로우를 끝까지 검증하려면 백엔드의 local cookie 정책이 함께 맞아야 한다. 관련 요청은 [BACKEND_LOCAL_SOCIAL_LOGIN_COOKIE_CHANGE_REQUEST.md](../../docs/2026-03-15-login-fail-fix/BACKEND_LOCAL_SOCIAL_LOGIN_COOKIE_CHANGE_REQUEST.md)에 정리했다.

## 7. 남은 후속 작업

이번 PR은 구조를 정리한 1차 리팩토링이다. 후속으로 남은 일은 아래다.

1. 로컬/운영 E2E 자동화 시나리오 추가
2. route policy와 access matrix 테스트 보강
3. `pending-signup` 상태 이름/정의가 백엔드 guest contract와 완전히 일치하는지 추가 정리
4. 인증 관련 레거시 유틸 완전 이관
5. 헤더/사이드바 프로필 fetch 최적화 추가 정리

## 8. 한 줄 요약

이 PR은 소셜 로그인 회귀를 계기로, `OAuth redirect -> client session bootstrap -> middleware session verification -> route protection -> UI login state` 전체를 하나의 일관된 인증 구조로 다시 정리한 리팩토링이다.

## 9. 추가 보완: OAuth 실패 Redirect 세션 정리

로컬 E2E에서 OAuth 실패 redirect 뒤에 `/login` 본문은 뜨지만 이전 인증 헤더가 남는 문제가 확인됐다. 원인은 클라이언트 쿠키만 삭제한 채 같은 서비스 레이아웃 안에서 `router.replace('/login')`만 수행해, 서버가 보는 쿠키와 공유 레이아웃 상태가 즉시 정리되지 않은 데 있었다.

이를 해결하기 위해 OAuth 실패와 계약 위반 케이스는 `/api/auth/clear-session?redirect=/login`을 경유하도록 수정했다. 이 route handler가 서버/클라이언트 세션을 함께 정리하고 로그인 페이지로 이동시킨다.

다시 정리하면, 이번 PR은 OAuth 성공 경계뿐 아니라 OAuth 실패 경계까지 "완전한 세션 정리 후 로그인 이동"으로 닫는다.
