# Auth Proposition 61-90 Audit

현재 워크트리 기준으로 auth 명제 `61~90`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: SSR / hydration, browser snapshot, cleanup / logout / 계정 전환
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

- `준수`: 27개
- `부분 위반`: 3개
- `완전 이탈`: 0개

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 61 | 같은 요청에서 middleware가 refresh에 성공하면 SSR도 그 결과를 즉시 읽어야 한다. | 준수 | 없음 | 정상 동작 | middleware가 request header override를 심고 SSR이 그 값을 같은 요청에서 바로 읽는다. | `src/features/auth/server/middleware/route-actions.ts:117-167`, `src/features/auth/model/server-auth-session.ts:120-129` | override header 경로를 유지한다. | `현 구조 유지` / `cookie round-trip만 신뢰` | `현 구조 유지` |
| 62 | SSR은 override header가 있으면 stale request cookie보다 override를 우선해야 한다. | 준수 | 없음 | 정상 동작 | `readServerAuthSession()`이 cookie fallback보다 override를 먼저 읽는다. | `src/features/auth/model/server-auth-session.ts:120-129`, `src/features/auth/model/server-auth-session-override.ts:38-68` | override 우선순위를 계속 고정한다. | `override 우선` / `cookie 우선` | `override 우선` |
| 63 | hydration 입력은 최소한으로 유지되어야 한다. | 준수 | 없음 | 정상 동작 | hydration context에는 `accessToken`만 전달하고 memberId 등 중복 필드를 싣지 않는다. | `src/features/auth/model/auth-hydration-context.tsx:5-10`, `src/features/auth/model/auth-hydration-session.ts:4-13` | hydration payload를 최소 유지한다. | `accessToken만 전달` / `memberId까지 중복 전달` | `accessToken만 전달` |
| 64 | SSR에서 authenticated로 렌더된 화면이 hydration 직후 anonymous로 뒤집히면 안 된다. | 준수 | 없음 | 정상 동작 | SSR이 넘긴 `initialSession`으로 초기 snapshot을 만들고, hydration 직후에도 같은 token이면 상태를 유지한다. | `src/app/(service)/layout.tsx:32-39`, `src/features/auth/model/use-auth.ts:178-194` | 초기 hydration snapshot을 계속 우선 사용한다. | `initialSession 유지` / `mount 시 즉시 쿠키 재판정만 사용` | `initialSession 유지` |
| 65 | SSR에서 anonymous로 렌더된 화면이 stale cookie만으로 authenticated가 되면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | SSR fallback도 expired token을 recoverable authenticated로 해석해 hydration 이후와 장기 분기되지 않는다. | `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/auth-session.ts`, `src/features/auth/model/server-auth-session.test.ts` | SSR과 브라우저의 expired-token 계약을 같은 util 기준으로 유지한다. | `공통 recoverable 유지` / `strict anonymous 회귀` | `공통 recoverable 유지` |
| 66 | `readServerAuthSession()`은 같은 요청에서 여러 번 호출돼도 같은 결과를 반환해야 한다. | 준수 | 없음 | 정상 동작 | `cache()`로 같은 요청 내 결과를 고정한다. | `src/features/auth/model/server-auth-session.ts:120-131` | `cache()` 기반 단일 계산을 유지한다. | `cache 유지` / `매 호출 재계산` | `cache 유지` |
| 67 | server helper는 auth clear를 직접 수행하면 안 된다. | 준수 | 없음 | 정상 동작 | 현재 서버 프로필 helper는 auth 상태를 정리하지 않고 분류된 실패만 반환한다. | `src/api/endpoints/user/get-user-profile.server.ts:90-123`, `src/features/auth/model/server-route-guard.ts:37-65` | helper를 순수 조회/분류 역할로 유지한다. | `helper 순수 유지` / `helper 안에서 clear redirect` | `helper 순수 유지` |
| 68 | server helper는 `auth error`, `missing data`, `request failure`를 분리해야 한다. | 준수 | 없음 | 정상 동작 | 프로필 helper가 `AUTH_ERROR`, `MISSING_PROFILE`, `REQUEST_FAILED`를 별도 kind로 분리한다. | `src/api/endpoints/user/get-user-profile.server.ts:5-31`, `src/api/endpoints/user/get-user-profile.server.ts:58-121` | 분리된 kind를 계속 유지한다. | `kind 분리` / `예외 하나로 통합` | `kind 분리` |
| 69 | profile 404는 auth logout과 같은 의미가 아니다. | 준수 | 없음 | 정상 동작 | 404는 `missing-profile`로 분리되고 auth clear로 연결되지 않는다. | `src/api/endpoints/user/get-user-profile.server.ts:23-31`, `src/api/endpoints/user/get-user-profile.server.ts:75-80` | 404를 domain miss로 유지한다. | `404=domain miss` / `404=logout` | `404=domain miss` |
| 70 | server route guard는 invalid session과 transient failure를 동일하게 취급하면 안 된다. | 부분 위반 | 중간 | 구조 부채 | route guard는 middleware 이후의 `readServerAuthSession()`만 보고 `!accessToken || !decodedToken`이면 곧바로 clear redirect로 보낸다. transient/recoverable 개념을 직접 가지지 않는다. | `src/features/auth/model/server-route-guard.ts:41-59`, `src/features/auth/model/server-auth-session.ts:100-129` | server route guard에 recoverable/transient 구분을 명시한다. | `guard 단순 유지` / `recoverable 구분 추가` | `recoverable 구분 추가` |
| 71 | 브라우저 snapshot은 최종 auth truth를 새로 만들지 말고 서버 판정과 맞춰야 한다. | 부분 위반 | 높음 | 구조 부채 | 브라우저는 여전히 쿠키와 JWT decode로 자체 snapshot을 만든다. | `src/features/auth/model/use-auth.ts:131-166`, `src/features/auth/model/auth-session.ts:96-166` | 브라우저 snapshot을 server-fed 상태에 더 가깝게 줄인다. | `현 구조 유지` / `브라우저 해석 축소` | `브라우저 해석 축소` |
| 72 | 브라우저 snapshot은 expired token alone으로 anonymous를 만들면 안 된다. | 준수 | 없음 | 정상 동작 | 브라우저는 `allowExpiredTokenRecovery: true`로 expired token을 즉시 anonymous로 내리지 않는다. | `src/features/auth/model/use-auth.ts:136-141`, `src/features/auth/model/auth-session.ts:125-155` | 이 옵션을 유지한다. | `recoverable 유지` / `즉시 anonymous` | `recoverable 유지` |
| 73 | 브라우저 snapshot 갱신은 focus, pageshow, storage 같은 복귀 이벤트에서 다시 동기화되어야 한다. | 준수 | 없음 | 정상 동작 | `focus`, `pageshow`, `storage`, `visibilitychange`에서 snapshot을 다시 읽는다. | `src/features/auth/model/use-auth.ts:208-243` | 복귀 이벤트 동기화를 유지한다. | `이벤트 동기화 유지` / `mount 시 1회만 sync` | `이벤트 동기화 유지` |
| 74 | 같은 탭과 다른 탭의 로그인/로그아웃 상태는 eventual consistency라도 맞아야 한다. | 준수 | 없음 | 정상 동작 | 같은 탭 listener와 `localStorage` 이벤트를 같이 써서 상태를 수렴시킨다. | `src/features/auth/model/client-auth-sync.ts:3-43`, `src/features/auth/model/use-auth.ts:196-243` | same-tab + cross-tab sync를 같이 유지한다. | `listener+storage 유지` / `storage만 사용` | `listener+storage 유지` |
| 75 | 브라우저가 direct refresh owner가 아니라면 `AUTH001`에서 refresh를 직접 호출하면 안 된다. | 준수 | 없음 | 정상 동작 | 인터셉터는 refresh endpoint를 직접 치지 않고 최신 쿠키 재시도 또는 document recovery만 수행한다. | `src/api/client/auth-response-interceptor.ts:62-101`, `src/api/client/auth-session-recovery.ts:32-51` | browser direct refresh를 다시 넣지 않는다. | `document recovery 유지` / `browser direct refresh 복귀` | `document recovery 유지` |
| 76 | 브라우저가 stale request를 재시도한다면, 최신 쿠키 token만 사용해야 한다. | 준수 | 없음 | 정상 동작 | stale request의 Authorization과 최신 cookie token을 비교해 최신 token일 때만 재시도한다. | `src/api/client/auth-response-interceptor.ts:79-90` | 재시도는 최신 쿠키 token으로만 한정한다. | `최신 쿠키 token 재시도` / `원래 token 재시도` | `최신 쿠키 token 재시도` |
| 77 | 브라우저 문서 recovery는 무한 reload loop를 만들면 안 된다. | 준수 | 없음 | 정상 동작 | recovery는 sessionStorage timestamp로 cooldown을 두고 같은 문서 재진입을 막는다. | `src/api/client/auth-session-recovery.ts:1-52` | cooldown guard를 유지한다. | `cooldown 유지` / `guard 없이 reload` | `cooldown 유지` |
| 78 | 문서 recovery cooldown은 짧은 시간 내 중복 재진입을 막아야 한다. | 준수 | 없음 | 정상 동작 | 5초 cooldown이 있어 짧은 시간 내 재진입이 차단된다. | `src/api/client/auth-session-recovery.ts:1-52` | cooldown 상수와 sessionStorage guard를 유지한다. | `5초 cooldown 유지` / `cooldown 제거` | `5초 cooldown 유지` |
| 79 | XHR 하나의 실패가 전체 세션 clear로 곧장 확장되면 안 된다. | 준수 | 없음 | 정상 동작 | 인터셉터는 `AUTH001`에서 즉시 clear하지 않고 재시도 또는 document recovery만 건다. | `src/api/client/auth-response-interceptor.ts:74-95`, `src/features/auth/model/client-auth-cleanup.ts:27-46` | XHR failure에서 direct clear를 계속 금지한다. | `recovery 우선` / `즉시 clear` | `recovery 우선` |
| 80 | request interceptor는 token 부착과 session truth 판정을 혼동하면 안 된다. | 부분 위반 | 낮음 | 구조 부채 | request interceptor 자체는 token만 붙이지만, response interceptor가 cookie 존재를 보고 recovery 여부를 판단해 transport와 truth가 아직 완전히 분리되진 않았다. | `src/api/client/auth-response-interceptor.ts:7-60`, `src/api/client/auth-response-interceptor.ts:62-101` | transport와 auth truth 책임을 더 분리한다. | `현 구조 유지` / `response recovery 분기 축소` | `response recovery 분기 축소` |
| 81 | explicit logout과 forced invalidation은 동일한 cleanup 경로를 타야 한다. | 준수 | 없음 | 정상 동작 | logout mutation과 forced clear가 모두 `clearClientAuthStateAndRedirect()`를 사용한다. | `src/hooks/queries/use-auth-mutation.ts:32-53`, `src/features/auth/model/client-auth-cleanup.ts:27-46` | 공용 cleanup 진입점을 계속 하나로 유지한다. | `공용 cleanup 유지` / `경로 분리` | `공용 cleanup 유지` |
| 82 | cleanup은 쿠키 삭제, persist store reset, query cache clear를 함께 수행해야 한다. | 준수 | 없음 | 정상 동작 | 공용 cleanup이 client cookies, user/phone/mentor 관련 store, query cache를 한 번에 정리한다. | `src/features/auth/model/client-auth-cleanup.ts:14-25` | shared cleanup 범위를 유지한다. | `일괄 cleanup 유지` / `각 경로 개별 정리` | `일괄 cleanup 유지` |
| 83 | cleanup 후 이전 계정의 user profile이 화면이나 store에 남아 있으면 안 된다. | 준수 | 없음 | 정상 동작 | cleanup이 `useUserStore.reset()`과 query cache clear를 함께 수행한다. | `src/features/auth/model/client-auth-cleanup.ts:17-24`, `src/providers/index.tsx:29-37` | user store reset과 cache clear를 같이 유지한다. | `둘 다 유지` / `store만 reset` | `둘 다 유지` |
| 84 | cleanup 후 phone verification cache가 남아 있으면 안 된다. | 준수 | 없음 | 정상 동작 | cleanup이 phone verification store를 reset한다. | `src/features/auth/model/client-auth-cleanup.ts:18-24`, `src/stores/use-phone-verification-store.ts:35-41` | phone verification reset을 shared cleanup에 유지한다. | `shared reset 유지` / `개별 화면 reset` | `shared reset 유지` |
| 85 | cleanup 후 leader, mentor, admin 관련 persist store가 남아 있으면 안 된다. | 준수 | 없음 | 정상 동작 | cleanup이 leader, mentor directory, management, screening, operation store를 모두 reset한다. | `src/features/auth/model/client-auth-cleanup.ts:19-24` | auth-coupled store를 shared cleanup에 계속 편입한다. | `shared reset 유지` / `각 도메인 자율 reset` | `shared reset 유지` |
| 86 | 계정 전환 시 old token, old memberId, old cached profile은 함께 사라져야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 로그인 성공 전에 파생 auth 상태와 query cache를 먼저 비우고, hydration 이후 계정이 바뀌어도 derived state를 다시 정리한다. | `src/features/auth/model/use-oauth-redirect-controller.ts`, `src/features/auth/model/client-auth-cleanup.ts`, `src/providers/index.tsx` | 계정 전환 시 선제 cleanup + hydration 수렴 경로를 유지한다. | `선제 cleanup 유지` / `logout 때만 clear` | `선제 cleanup 유지` |
| 87 | logout API 실패만으로 로컬 cleanup이 생략되면 안 된다. | 준수 | 없음 | 정상 동작 | logout mutation은 success와 error 모두 같은 cleanup으로 끝낸다. | `src/hooks/queries/use-auth-mutation.ts:34-52` | onError에서도 cleanup을 계속 유지한다. | `success/error 모두 cleanup` / `success에서만 cleanup` | `success/error 모두 cleanup` |
| 88 | clear-session redirect는 안전한 내부 경로만 허용해야 한다. | 준수 | 없음 | 정상 동작 | client와 server 모두 `getSafeInternalRedirectPath()`를 통해 내부 경로만 허용한다. | `src/features/auth/model/auth-route.ts:31-54`, `src/app/api/auth/clear-session/route.ts:9-15` | safe redirect guard를 유지한다. | `내부 경로만 허용` / `임의 경로 허용` | `내부 경로만 허용` |
| 89 | cleanup은 여러 번 호출돼도 idempotent해야 한다. | 준수 | 없음 | 정상 동작 | cleanup은 같은 reset/clear를 반복 적용해도 최종 상태가 같다. redirect도 중복 호출을 막는다. | `src/features/auth/model/client-auth-cleanup.ts:12-42`, `src/features/auth/model/client-auth-session.ts:16-21` | idempotent reset과 redirect dedupe를 유지한다. | `현 구조 유지` / `상태별 분기 추가` | `현 구조 유지` |
| 90 | 신규 persist store가 auth identity와 엮이면 shared cleanup에 반드시 편입되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | shared cleanup이 명시적 resetter registry를 단일 source로 갖고 있고, 테스트도 그 경로를 고정한다. | `src/features/auth/model/client-auth-cleanup.ts`, `src/features/auth/model/client-auth-cleanup.test.ts` | auth-coupled store reset registry와 테스트를 함께 유지한다. | `registry 유지` / `분산 reset 회귀` | `registry 유지` |

## 바로 눈에 띄는 핵심 결론

1. `70`이 남은 서버 가드 부채다.
`readServerAuthSession()` 결과는 많이 좋아졌지만, server route guard 자체는 transient/recoverable 이유값을 직접 알지 못한다.

2. `71`은 source of truth 부채가 아직 남아 있음을 보여준다.
브라우저 snapshot이 여전히 서버 판정을 소비하는 수준을 넘어서 자체 해석기로 동작한다.

3. `80`은 transport와 truth 책임이 아직 완전히 분리되진 않았다는 뜻이다.
request layer는 얇아졌지만 response recovery 판단은 여전히 브라우저 쪽에 남아 있다.
