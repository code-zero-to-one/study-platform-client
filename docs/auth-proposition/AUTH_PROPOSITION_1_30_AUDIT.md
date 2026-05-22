# Auth Proposition 1-30 Audit

현재 워크트리 기준으로 auth 명제 `1~30`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: source of truth, 상태 모델, 토큰 / 쿠키 의미
- 판정 기준
  - `준수`: 현재 메인 경로에서 명제와 직접 충돌하지 않음
  - `부분 위반`: 일부 레이어는 맞지만 다른 레이어/보조 경로가 명제를 깨뜨림
  - `완전 이탈`: 현재 메인 경로가 명제를 수행하지 못하거나 반대로 동작함
- 위험도 기준
  - `없음`: 현재 감사 기준으로 눈에 띄는 위험 없음
  - `낮음`: 구조상 아쉬움은 있으나 직접 사용자 문제로 번질 가능성은 낮음
  - `중간`: 특정 조건에서 사용자 체감 문제나 stale state를 만들 수 있음
  - `높음`: false logout, 복구 실패, partial session 같은 직접적인 auth 오류로 이어질 수 있음
- 특성 기준
  - `정상 동작`: 현재 감사 기준으로 명제와 직접 충돌하지 않음
  - `실제 버그`: 이미 메인 경로나 높은 확률의 경계 조건에서 사용자 버그로 드러날 수 있음
  - `잠재적 버그`: 특정 타이밍, 만료 경계, 계정 전환, 멀티탭 등에서 버그로 번질 수 있음
  - `구조 부채`: source of truth, 상태 모델, 책임 분리가 아직 깔끔하지 않음
  - `운영 리스크`: 장애/부분 장애/UX fallback 상황에서 운영 체감 문제를 만들 수 있음
  - `환경/배포 리스크`: 도메인, 프로토콜, 프록시, 쿠키 정책 같은 배포 환경에 민감함
  - `관찰 가능성 부채`: 운영에서 원인 추적, 로그 상관분석, 계층별 진단이 어려움
  - `테스트 부채`: 회귀 방지용 자동 테스트 범위가 부족함

## 요약

- `준수`: 20개
- `부분 위반`: 10개
- `완전 이탈`: 0개

완전 이탈 명제:

- 없음

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | access token의 유효/무효 최종 판정은 Spring이 한다. | 부분 위반 | 높음 | 구조 부채 | middleware는 Spring `/auth/me`를 쓰지만 browser/SSR fallback은 여전히 JWT decode로 자체 판정한다. | `src/features/auth/server/middleware/access-token-session.ts:140-177`, `src/features/auth/model/use-auth.ts:131-166`, `src/features/auth/model/server-auth-session.ts:100-117` | browser/SSR의 로컬 판정을 더 줄인다. | `현 구조 유지` / `browser 축소` / `browser+SSR 축소` | `browser+SSR 축소` |
| 2 | refresh 가능 여부의 최종 판정은 Spring이 한다. | 부분 위반 | 높음 | 구조 부채 | refresh invalid는 Spring이 판정하지만 accessToken이 아예 없으면 Spring에 묻지 않고 anonymous로 접는다. | `src/features/auth/server/middleware/access-token-session.ts:180-234`, `src/features/auth/model/auth-session.ts:114-123`, `src/features/auth/server/middleware/route-session.ts:162-164` | refresh-token-only recoverable 판단 경로를 추가한다. | `현 구조 유지` / `refresh-token-only recoverable 추가` | `refresh-token-only recoverable 추가` |
| 3 | 브라우저는 auth truth를 창조하는 주체가 아니라 소비하는 주체여야 한다. | 부분 위반 | 높음 | 구조 부채 | 브라우저가 쿠키/JWT를 다시 읽어 자체 snapshot을 계속 만든다. | `src/features/auth/model/use-auth.ts:163-243`, `src/features/auth/model/auth-hydration-context.tsx:13-30` | browser snapshot을 server-fed 상태 소비 쪽으로 얇게 만든다. | `현 구조 유지` / `browser 해석 축소` | `browser 해석 축소` |
| 4 | middleware는 새로운 auth truth가 아니라 요청 단위 adapter여야 한다. | 준수 | 없음 | 정상 동작 | middleware는 요청마다 `/auth/me`와 refresh를 호출해 route session으로만 번역한다. | `src/features/auth/server/middleware/access-token-session.ts:237-308`, `src/features/auth/server/middleware/route-session.ts:158-209` | 요청 단위 adapter 역할을 유지한다. | `현 구조 유지` / `middleware 장기 state 보관` | `현 구조 유지` |
| 5 | SSR은 같은 요청에서 middleware가 이미 정한 auth 결과를 다시 뒤집으면 안 된다. | 준수 | 없음 | 정상 동작 | override header를 통해 SSR이 middleware 결과를 같은 요청에서 우선 읽는다. | `src/features/auth/server/middleware/route-actions.ts:117-167`, `src/features/auth/model/server-auth-session.ts:120-129` | override 우선 구조를 유지한다. | `현 구조 유지` / `cookie fallback 우선` | `현 구조 유지` |
| 6 | 브라우저, middleware, SSR이 같은 세션을 다르게 해석하면 그 자체가 버그다. | 부분 위반 | 높음 | 구조 부채 | same-request drift는 줄었지만 expired token의 SSR/browser 해석 차이는 여전히 남아 있다. | `src/features/auth/model/use-auth.ts:136-160`, `src/features/auth/model/server-auth-session.ts:100-117`, `src/features/auth/model/auth-session.ts:125-165` | expired-token 공통 상태 모델을 도입한다. | `현 구조 유지` / `공통 recoverable 도입` | `공통 recoverable 도입` |
| 7 | `memberId` 쿠키는 auth source of truth가 아니라 파생 캐시다. | 준수 | 없음 | 정상 동작 | authenticated 판정은 decoded memberId 기준이고 cookie memberId는 보조값으로만 쓴다. | `src/features/auth/model/auth-session.ts:107-108`, `src/features/auth/model/auth-session.ts:147-155`, `src/features/auth/server/middleware/auth-context.ts:21-35` | 파생 캐시 역할을 유지한다. | `현 구조 유지` / `memberId를 truth로 승격` | `현 구조 유지` |
| 8 | `accessToken` 문자열 존재만으로 authenticated를 확정하면 안 된다. | 준수 | 없음 | 정상 동작 | guest 여부와 decoded memberId까지 함께 봐야 authenticated가 된다. | `src/features/auth/model/auth-session.ts:114-165` | token-only 판정을 금지한다. | `현 구조 유지` / `token 존재만으로 로그인` | `현 구조 유지` |
| 9 | `refresh_token` 존재만으로 authenticated를 확정하면 안 된다. | 준수 | 없음 | 정상 동작 | refresh token은 refresh 경로에서만 쓰고 화면 authenticated 근거로 쓰지 않는다. | `src/features/auth/server/middleware/access-token-session.ts:180-234`, `src/features/auth/server/middleware/auth-cookies.ts:132-149` | refresh 권한과 UI 상태를 계속 분리한다. | `분리 유지` / `refresh_token 기반 로그인 표시` | `분리 유지` |
| 10 | "현재 로그인한 사용자"의 최종 identity는 Spring이 검증한 token 정보에서만 와야 한다. | 부분 위반 | 높음 | 구조 부채 | middleware는 Spring `/auth/me` 기준이지만 browser/SSR은 decoded JWT에서 직접 memberId를 읽는다. | `src/features/auth/server/middleware/access-token-session.ts:171-175`, `src/features/auth/model/use-auth.ts:147-160`, `src/features/auth/model/server-auth-session.ts:60-71` | browser/SSR identity 해석을 더 얇게 만든다. | `현 구조 유지` / `server-fed identity 강화` | `server-fed identity 강화` |
| 11 | auth 상태는 최소한 `anonymous`, `pending-signup`, `authenticated`, `recoverable`, `invalid`를 구분할 수 있어야 한다. | 부분 위반 | 중간 | 구조 부채 | 현재 공용 auth 상태는 3개뿐이고 recoverable/invalid는 레이어별 reason에 흩어져 있다. | `src/types/auth/domain.ts:30-43`, `src/features/auth/server/middleware/route-session.ts:27-32`, `src/features/auth/server/middleware/access-token-session.ts:30-45` | recoverable/invalid를 공용 모델로 승격한다. | `현재 3상태 유지` / `recoverable·invalid 공용화` | `recoverable·invalid 공용화` |
| 12 | accessToken이 없고 refresh_token도 없으면 anonymous다. | 준수 | 없음 | 정상 동작 | 현재 구현은 이 경우 일관되게 anonymous로 본다. | `src/features/auth/model/auth-session.ts:114-123`, `src/features/auth/server/middleware/access-token-session.ts:184-190` | 현재 규칙을 유지한다. | `현 구조 유지` / `다른 상태 도입` | `현 구조 유지` |
| 13 | accessToken이 없어도 refresh_token이 살아 있으면 recoverable session일 수 있다. | 완전 이탈 -> 준수 | 없음 | 정상 동작 | 미들웨어가 `refresh_token` 존재를 별도 컨텍스트로 읽고, `accessToken` 없이도 먼저 refresh 복구를 시도한다. | `src/features/auth/server/middleware/auth-context.ts`, `src/features/auth/server/middleware/route-session.ts`, `src/features/auth/server/middleware/access-token-session.ts` | refresh-token-only 복구 경로를 유지한다. | `익명으로 즉시 접기` / `refresh 후 재판정` | `refresh 후 재판정` |
| 14 | refresh_token이 살아 있는데 accessToken이 없으면 복구 가능한 세션으로 보아야 한다. | 완전 이탈 -> 준수 | 없음 | 정상 동작 | `hasRefreshToken` 컨텍스트와 `resolveRefreshTokenOnlyRouteSession()`이 `refresh_token only` 상태를 anonymous가 아니라 복구 후보로 처리한다. | `src/features/auth/server/middleware/auth-context.ts`, `src/features/auth/server/middleware/route-session.ts` | refresh-token-only 평가 경로를 유지한다. | `anonymous 처리` / `복구 후보 처리` | `복구 후보 처리` |
| 15 | accessToken이 있고 guest claim이면 pending-signup으로 보아야 한다. | 준수 | 없음 | 정상 동작 | guest claim이면 pending-signup으로 해석한다. | `src/features/auth/model/auth-session.ts:136-145`, `src/features/auth/server/middleware/route-session.ts:166-183` | guest->pending-signup 해석을 유지한다. | `현 구조 유지` / `authenticated 승격` | `현 구조 유지` |
| 16 | guest claim이 없더라도 identity를 확정할 수 없으면 authenticated로 승격하면 안 되며, recoverable인지 invalid인지 별도 판정해야 한다. | 부분 위반 | 중간 | 구조 부채 | authenticated로 승격하진 않지만 anonymous/invalid로 흩어지고 recoverable/invalid 분리를 공용 모델로 못 한다. | `src/features/auth/model/auth-session.ts:147-165`, `src/features/auth/server/middleware/route-session.ts:166-178` | identity 미확정 non-guest 상태를 더 세밀하게 분기한다. | `현 구조 유지` / `recoverable·invalid 분리` | `recoverable·invalid 분리` |
| 17 | expired accessToken alone으로 anonymous를 확정하면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 브라우저, SSR, 미들웨어 모두 expired token을 즉시 anonymous로 내리지 않고 복구 가능한 member session 후보로 유지한다. | `src/features/auth/model/auth-session.ts`, `src/features/auth/model/use-auth.ts`, `src/features/auth/model/server-auth-session.ts`, `src/features/auth/server/middleware/auth-context.ts` | expired-token recoverable 해석을 유지한다. | `strict anonymous` / `recoverable 유지` | `recoverable 유지` |
| 18 | recoverable 상태와 confirmed invalid 상태는 정책이 달라야 한다. | 부분 위반 | 중간 | 구조 부채 | route decision에서는 다르지만 recoverable 상태가 공용 모델에 없어 일부 케이스를 표현하지 못한다. | `src/features/auth/server/middleware/route-decisions.ts:39-47`, `src/features/auth/server/middleware/route-decisions.ts:65-72`, `src/features/auth/server/middleware/route-reasons.ts:65-69` | 공용 recoverable 상태를 추가한다. | `reason 기반 유지` / `공용 상태 모델 추가` | `공용 상태 모델 추가` |
| 19 | invalid session과 transient failure는 같은 상태로 뭉개면 안 된다. | 준수 | 없음 | 정상 동작 | invalid와 transient는 reason과 state로 분리돼 있다. | `src/features/auth/server/middleware/access-token-session.ts:30-45`, `src/features/auth/server/middleware/route-reasons.ts:65-69` | 분리 구조를 유지한다. | `분리 유지` / `한 상태로 통합` | `분리 유지` |
| 20 | 한 요청 안에서 auth 상태는 하나여야 한다. | 준수 | 없음 | 정상 동작 | route session과 SSR cache/override로 같은 요청 안 결과를 하나로 고정한다. | `src/features/auth/server/middleware/route-session.ts:158-209`, `src/features/auth/model/server-auth-session.ts:120-131` | request 단위 일관성을 유지한다. | `현 구조 유지` / `레이어별 재판정` | `현 구조 유지` |
| 21 | accessToken은 요청 인증 재료이지 로그인 UI 상태 그 자체는 아니다. | 부분 위반 | 중간 | 구조 부채 | 브라우저 `useAuth()`가 accessToken과 decode claim으로 UI sessionState를 직접 만든다. | `src/features/auth/model/use-auth.ts:131-160`, `src/api/client/auth-response-interceptor.ts:50-60` | accessToken transport와 UI auth 상태를 더 분리한다. | `현 구조 유지` / `UI state 분리` | `UI state 분리` |
| 22 | refresh_token은 복구 권한이지 화면에서 authenticated를 바로 그려도 되는 근거는 아니다. | 준수 | 없음 | 정상 동작 | refresh token은 refresh 경로와 cookie 복사에만 쓰인다. | `src/features/auth/server/middleware/access-token-session.ts:184-199`, `src/features/auth/server/middleware/auth-cookies.ts:132-149` | 현재 역할 분리를 유지한다. | `현 구조 유지` / `refresh_token으로 UI 로그인 판정` | `현 구조 유지` |
| 23 | accessToken 쿠키 max-age는 backend access token TTL보다 길면 안 된다. | 준수 | 없음 | 정상 동작 | 프론트 max-age와 backend TTL이 모두 1시간이다. | `src/features/auth/model/auth-cookie.ts:8`, `/home/osuma/coding_stuffs/study-platform-mvp/src/main/resources/application.yml:25-28` | TTL 정합성을 유지한다. | `현 구조 유지` / `쿠키 TTL 재확대` | `현 구조 유지` |
| 24 | refresh_token 회전 결과를 프론트가 버리면 안 된다. | 준수 | 없음 | 정상 동작 | 미들웨어가 backend refresh `set-cookie`를 읽고 다시 브라우저 응답에 복사한다. | `src/features/auth/server/middleware/access-token-session.ts:293-300`, `src/features/auth/server/middleware/auth-cookies.ts:132-149` | refresh token 회전 복사를 유지한다. | `복사 유지` / `무시` | `복사 유지` |
| 25 | token claim의 memberId와 별도 memberId가 다르면 세션 저장을 중단해야 한다. | 준수 | 없음 | 정상 동작 | existing-member 세션 저장 시 memberId mismatch면 저장을 중단하고 clear한다. | `src/features/auth/model/client-auth-session.ts:36-55` | mismatch 차단을 유지한다. | `현 구조 유지` / `query memberId 신뢰` | `현 구조 유지` |
| 26 | 로그아웃 시 accessToken, memberId, refresh_token 파생 상태는 함께 정리되어야 한다. | 준수 | 없음 | 정상 동작 | client cleanup과 server clear가 auth cookies와 파생 상태를 같이 정리한다. | `src/hooks/queries/use-auth-mutation.ts:32-53`, `src/features/auth/model/client-auth-cleanup.ts:14-25`, `src/features/auth/server/middleware/auth-cookies.ts:96-111` | full cleanup을 유지한다. | `현 구조 유지` / `부분 정리` | `현 구조 유지` |
| 27 | 한 계정의 파생 쿠키가 다른 계정 로그인 후 남아 있으면 안 된다. | 준수 | 없음 | 정상 동작 | existing-member 세션 저장은 token-backed cookies를 덮고 mismatch면 clear한다. | `src/features/auth/model/client-auth-session.ts:27-77` | overwrite-or-clear 정책을 유지한다. | `현 구조 유지` / `기존 쿠키 보존` | `현 구조 유지` |
| 28 | `socialImageURL` 같은 가입 보조 쿠키도 세션 종료 시 정리되어야 한다. | 준수 | 없음 | 정상 동작 | client clear와 server clear 모두 socialImageURL을 삭제한다. | `src/features/auth/model/client-auth-session.ts:16-21`, `src/features/auth/server/middleware/auth-cookies.ts:96-111` | 보조 쿠키 cleanup을 유지한다. | `현 구조 유지` / `보조 쿠키 보존` | `현 구조 유지` |
| 29 | 쿠키 이름과 auth query param은 단일 상수 집합으로 관리되어야 한다. | 부분 위반 | 낮음 | 구조 부채 | 값들은 상수화됐지만 쿠키명, route query param, OAuth query param이 파일 단위로 나뉘어 있다. | `src/features/auth/model/auth-cookie.ts:1-21`, `src/features/auth/model/auth-route.ts:14-17`, `src/features/auth/model/oauth-redirect-contract.ts:7-25` | auth constants index를 도입해 논리 집합을 더 모은다. | `현 분산 유지` / `공용 constants index` | `공용 constants index` |
| 30 | 파생 쿠키가 원본보다 오래 살아남으면 stale state 버그다. | 완전 이탈 -> 준수 | 없음 | 정상 동작 | `socialImageURL`도 `accessToken/memberId`와 같은 token-backed cookie 옵션을 써서 TTL이 1시간으로 맞춰졌다. | `src/features/auth/model/client-auth-session.ts`, `src/features/auth/model/auth-cookie.ts` | token-backed 쿠키 TTL 정합성을 유지한다. | `기본 1일 유지` / `token-backed TTL 정렬` | `token-backed TTL 정렬` |

## 바로 눈에 띄는 핵심 결론

1. `1`, `2`, `3`, `10`이 남은 핵심 source-of-truth 부채다.
Spring 원본 위에 브라우저와 SSR이 여전히 일부 로컬 판정을 겹쳐 하고 있다.

2. `11`, `16`, `18`은 공용 상태 모델 부채다.
recoverable/invalid를 공용 상태로 완전히 끌어올리진 못해 일부 레이어별 reason에 의존한다.

3. refresh-token-only와 token-backed cookie TTL 관련 실제 구멍은 이번 수정으로 메인 경로 기준 정리됐다.
