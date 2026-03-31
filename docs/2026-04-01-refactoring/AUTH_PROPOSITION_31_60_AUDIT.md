# Auth Proposition 31-60 Audit

현재 워크트리 기준으로 auth 명제 `31~60`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: 로그인 성공 계약, refresh / 복구, middleware / route policy
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

- `준수`: 29개
- `부분 위반`: 1개
- `완전 이탈`: 0개

완전 이탈 명제:

- 없음

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 31 | OAuth redirect 성공 시 프론트는 contract 검증 후에만 세션을 저장해야 한다. | 준수 | 없음 | 정상 동작 | redirect 결과는 parser 검증을 통과한 뒤에만 세션 저장으로 들어간다. | `src/features/auth/model/parse-oauth-redirect-result.ts:86-164`, `src/features/auth/model/use-oauth-redirect-controller.ts:73-109` | strict contract parse를 유지한다. | `현 구조 유지` / `query 직접 저장` | `현 구조 유지` |
| 32 | OAuth redirect contract가 깨졌으면 부분 세션을 남기지 말고 바로 정리해야 한다. | 준수 | 없음 | 정상 동작 | contract mismatch나 OAuth 실패는 바로 clear-session cleanup 경로를 탄다. | `src/features/auth/model/use-oauth-redirect-controller.ts:76-82`, `src/features/auth/model/use-oauth-redirect-controller.ts:111-126`, `src/features/auth/model/client-auth-cleanup.ts:27-46` | 실패 시 공용 cleanup을 유지한다. | `공용 cleanup 유지` / `부분 정리` | `공용 cleanup 유지` |
| 33 | 기존 회원 로그인 성공 직후 첫 `/home` 진입에서 middleware와 hydration은 같은 member identity를 봐야 한다. | 준수 | 없음 | 정상 동작 | memberId mismatch를 막고 hydration도 같은 accessToken 기준으로 시작한다. | `src/features/auth/model/client-auth-session.ts:36-66`, `src/features/auth/model/use-oauth-redirect-controller.ts:96-110`, `src/app/(service)/layout.tsx:32-39` | 첫 진입 identity 정합성을 유지한다. | `현 구조 유지` / `identity 중복 저장` | `현 구조 유지` |
| 34 | 신규 회원 로그인 성공 직후 guest token 상태는 pending-signup으로 일관되게 유지되어야 한다. | 준수 | 없음 | 정상 동작 | 신규 회원은 memberId 없이 guest token만 저장하고 pending-signup으로 해석된다. | `src/features/auth/model/client-auth-session.ts:79-102`, `src/features/auth/model/use-oauth-redirect-controller.ts:85-92`, `src/features/auth/model/auth-session.ts:136-145` | guest->pending-signup 계약을 유지한다. | `현 구조 유지` / `authenticated 승격` | `현 구조 유지` |
| 35 | 로그인 성공 직후 profile API 실패만으로 auth 세션이 지워지면 안 된다. | 준수 | 없음 | 정상 동작 | 프로필 helper는 auth clear를 직접 하지 않고 error kind를 분리한다. | `src/api/endpoints/user/get-user-profile.server.ts:5-31`, `src/api/endpoints/user/get-user-profile.server.ts:58-121` | profile/auth 분리를 유지한다. | `분리 유지` / `profile 실패=logout` | `분리 유지` |
| 36 | 로그인 성공 직후 network error 한 번으로 clear-session이 실행되면 안 된다. | 준수 | 없음 | 정상 동작 | transient failure는 대체로 유지/재시도 정책으로 처리한다. | `src/features/auth/server/middleware/route-decisions.ts:40-42`, `src/features/auth/server/middleware/route-decisions.ts:66-68`, `src/api/client/auth-response-interceptor.ts:74-95` | transient non-clear 정책을 유지한다. | `현 구조 유지` / `즉시 clear` | `현 구조 유지` |
| 37 | 로그인 성공 직후 브라우저가 JWT exp만 보고 anonymous로 떨어지면 안 된다. | 준수 | 없음 | 정상 동작 | 브라우저는 expired token alone으로 anonymous로 떨어지지 않는다. | `src/features/auth/model/use-auth.ts:136-141` | recoverable 해석을 유지한다. | `현 구조 유지` / `즉시 anonymous` | `현 구조 유지` |
| 38 | 로그인 성공 직후 store reset이 auth final state보다 먼저 일어나면 안 된다. | 준수 | 없음 | 정상 동작 | `UserInitializer`는 최종 sessionState를 본 뒤에만 reset/fetch를 결정한다. | `src/providers/index.tsx:23-59` | final session 기반 초기화를 유지한다. | `현 구조 유지` / `raw exp 기반 reset` | `현 구조 유지` |
| 39 | 로그인 성공 직후 query cache가 이전 계정 데이터를 보여주면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 로그인 성공 직전 `resetClientDerivedAuthState()`가 query cache와 auth-coupled store를 함께 비워 cross-account 잔존 데이터를 지운다. | `src/features/auth/model/client-auth-cleanup.ts`, `src/features/auth/model/use-oauth-redirect-controller.ts`, `src/components/common/modals/sign-up-modal.tsx`, `src/components/common/modals/login-modal.tsx` | 로그인 성공 전 derived state reset을 유지한다. | `로그아웃 때만 clear` / `로그인 직전도 clear` | `로그인 직전도 clear` |
| 40 | 로그인 성공 직후 실패 경로에서도 partial login state가 남으면 안 된다. | 완전 이탈 -> 준수 | 없음 | 정상 동작 | 기존 회원 OAuth 저장 실패와 회원가입 세션 저장 실패는 성공 흐름을 중단하고 즉시 clear/login 경로로 수렴한다. | `src/features/auth/model/client-auth-session.ts`, `src/features/auth/model/use-oauth-redirect-controller.ts`, `src/components/common/modals/sign-up-modal.tsx` | 세션 저장 실패 시 성공 흐름 중단을 유지한다. | `계속 진행` / `즉시 중단` | `즉시 중단` |
| 41 | refresh owner는 한 번의 맥락에서 하나여야 한다. | 준수 | 없음 | 정상 동작 | 브라우저 direct refresh는 제거됐고 refresh owner는 document 요청 middleware 쪽으로 사실상 수렴했다. | `src/api/client/auth-response-interceptor.ts:74-95`, `src/api/client/auth-session-recovery.ts:32-51`, `src/features/auth/server/middleware/access-token-session.ts:180-234` | single refresh owner 구조를 유지한다. | `현 구조 유지` / `browser direct refresh 복귀` | `현 구조 유지` |
| 42 | 같은 레이어에서 concurrent `AUTH001`이 여러 개 와도 refresh 요청은 하나만 나가야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 미들웨어 refresh는 refresh token 값 기준 module-level single-flight로 묶여 같은 프로세스 안의 동시 refresh가 하나로 합쳐진다. | `src/features/auth/server/middleware/access-token-session.ts`, `src/features/auth/server/middleware/access-token-session.test.ts` | document refresh single-flight를 유지한다. | `중복 refresh 허용` / `single-flight` | `single-flight` |
| 43 | refresh 성공 후 원래 요청이 재시도된다면 새 token만 사용해야 한다. | 준수 | 없음 | 정상 동작 | stale request 재시도는 최신 cookie token으로만 Authorization을 덮어쓴다. | `src/api/client/auth-response-interceptor.ts:79-90` | 최신 token 재시도 정책을 유지한다. | `현 구조 유지` / `원래 token 재시도` | `현 구조 유지` |
| 44 | invalid refresh만 최종 로그아웃 근거가 되어야 한다. | 부분 위반 | 중간 | 구조 부채 | invalid refresh 외에도 `memberId 없는 non-guest` 같은 불완전 세션 reason이 clear 근거가 된다. | `src/features/auth/server/middleware/route-session.ts:117-122`, `src/features/auth/server/middleware/route-decisions.ts:44-47`, `src/features/auth/server/middleware/route-decisions.ts:127-130` | confirmed invalid와 malformed session clear 근거를 더 명시적으로 분리한다. | `현 구조 유지` / `clear reason 재분류` | `clear reason 재분류` |
| 45 | refresh request 네트워크 실패는 즉시 로그아웃 근거가 되면 안 된다. | 준수 | 없음 | 정상 동작 | refresh request failure는 transient로 분류되고 public/login/sign-up에서 즉시 clear되지 않는다. | `src/features/auth/server/middleware/access-token-session.ts:270-279`, `src/features/auth/server/middleware/route-decisions.ts:40-42`, `src/features/auth/server/middleware/route-decisions.ts:119-125` | transient 분류를 유지한다. | `현 구조 유지` / `즉시 clear` | `현 구조 유지` |
| 46 | verify request 네트워크 실패는 즉시 로그아웃 근거가 되면 안 된다. | 준수 | 없음 | 정상 동작 | verify request failure도 transient reason으로 분리된다. | `src/features/auth/server/middleware/access-token-session.ts:252-258`, `src/features/auth/server/middleware/route-reasons.ts:65-69` | verify transient 분리를 유지한다. | `현 구조 유지` / `즉시 clear` | `현 구조 유지` |
| 47 | recoverable auth failure에서는 세션 복구 시도가 cleanup보다 먼저여야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | `refresh_token only`와 expired token 모두 cleanup보다 refresh 복구가 먼저 실행되도록 미들웨어 경로가 정리됐다. | `src/features/auth/server/middleware/route-session.ts`, `src/features/auth/server/middleware/access-token-session.ts` | recoverable 우선 복구 정책을 유지한다. | `즉시 cleanup` / `복구 우선` | `복구 우선` |
| 48 | refresh 성공 후 새 refresh_token이 내려오면 쿠키도 함께 동기화되어야 한다. | 준수 | 없음 | 정상 동작 | refresh 성공 시 backend `set-cookie`를 다시 브라우저 response에 심는다. | `src/features/auth/server/middleware/access-token-session.ts:295-300`, `src/features/auth/server/middleware/auth-cookies.ts:132-149` | refresh cookie 동기화를 유지한다. | `현 구조 유지` / `set-cookie 무시` | `현 구조 유지` |
| 49 | refresh 이후 재검증 실패도 invalid와 transient를 구분해야 한다. | 준수 | 없음 | 정상 동작 | refresh 뒤 `/auth/me` 재검증 실패는 verify state에 따라 invalid/unknown을 구분한다. | `src/features/auth/server/middleware/access-token-session.ts:281-290`, `src/features/auth/server/middleware/access-token-session.ts:131-138` | 재검증 failure 분리를 유지한다. | `현 구조 유지` / `한 실패로 통합` | `현 구조 유지` |
| 50 | refresh owner가 여러 군데라면 loser가 곧바로 logout을 실행하면 안 된다. | 준수 | 없음 | 정상 동작 | browser direct refresh owner가 제거되어 예전 loser-logout 경로는 메인 흐름에서 사라졌다. | `src/api/client/auth-response-interceptor.ts:74-95`, `src/api/client/auth-session-recovery.ts:32-51` | single owner 구조를 유지한다. | `현 구조 유지` / `다중 owner 복귀` | `현 구조 유지` |
| 51 | route policy는 공개 경로와 보호 경로의 차이를 명확히 표현해야 한다. | 준수 | 없음 | 정상 동작 | `BYPASS`, `LOGIN`, `PUBLIC_SESSION`, `SIGN_UP`, default protected 흐름으로 정책이 나뉜다. | `src/features/auth/server/middleware/route-policy.ts:13-21`, `src/features/auth/server/middleware/route-policy.ts:42-121` | route policy 구분을 유지한다. | `현 구조 유지` / `경로별 하드코딩` | `현 구조 유지` |
| 52 | `PUBLIC_SESSION` 경로는 recoverable session을 최대한 살려야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | public route도 `refresh_token only` 세션을 먼저 복구한 뒤 authenticated/pending-signup/invalid를 다시 판정한다. | `src/features/auth/server/middleware/route-session.ts`, `src/features/auth/server/middleware/route-decisions.ts` | public-route recoverable 복구 경로를 유지한다. | `익명으로 즉시 통과` / `복구 후 재판정` | `복구 후 재판정` |
| 53 | public route에서 identity cookie만 남고 accessToken이 없으면 stray identity로 정리되어야 한다. | 준수 | 없음 | 정상 동작 | identity cookie만 남은 경우 clear-and-next로 정리한다. | `src/features/auth/server/middleware/route-decisions.ts:55-60`, `src/features/auth/server/middleware/route-reasons.ts:21-24` | stray identity cleanup을 유지한다. | `현 구조 유지` / `identity cookie 보존` | `현 구조 유지` |
| 54 | `PROTECTED` 경로는 truly anonymous와 invalid session을 구분해야 한다. | 준수 | 없음 | 정상 동작 | protected route switch가 anonymous와 invalid를 분리한다. | `src/features/auth/server/middleware/route-decisions.ts:108-130` | 분기 분리를 유지한다. | `현 구조 유지` / `하나로 통합` | `현 구조 유지` |
| 55 | protected route의 transient auth failure는 confirmed invalid와 같은 redirect 정책으로 단순 취급하면 안 된다. | 준수 | 없음 | 정상 동작 | protected route는 transient failure에 1회 retry 또는 non-clear redirect를 사용한다. | `src/features/auth/server/middleware/route-decisions.ts:118-125`, `src/features/auth/server/middleware/route-handlers.ts:58-82` | transient retry 정책을 유지한다. | `현 구조 유지` / `invalid와 동일 취급` | `현 구조 유지` |
| 56 | protected route retry를 도입했다면 무한 retry는 절대 일어나면 안 된다. | 준수 | 없음 | 정상 동작 | `__authRetry=1` marker가 있으면 다시 retry marker를 붙이지 않는다. | `src/features/auth/model/auth-route.ts:102-107`, `src/features/auth/server/middleware/route-handlers.ts:54-66` | retry marker guard를 유지한다. | `현 구조 유지` / `marker 없이 retry` | `현 구조 유지` |
| 57 | protected route retry marker는 회복 후 clean URL로 제거되어야 한다. | 준수 | 없음 | 정상 동작 | 회복되면 clean path redirect로 retry marker를 URL에서 제거한다. | `src/features/auth/model/auth-route.ts:83-100`, `src/features/auth/server/middleware/route-handlers.ts:68-82` | clean redirect를 유지한다. | `현 구조 유지` / `marker 유지` | `현 구조 유지` |
| 58 | pending-signup 세션은 sign-up 경로에서는 허용되고 일반 protected 경로에서는 가입 흐름으로 보내져야 한다. | 준수 | 없음 | 정상 동작 | sign-up route는 허용하고 protected route는 `/sign-up`으로 보낸다. | `src/features/auth/server/middleware/route-decisions.ts:29-49`, `src/features/auth/server/middleware/route-decisions.ts:111-117` | pending-signup route 정책을 유지한다. | `현 구조 유지` / `landing 일괄 처리` | `현 구조 유지` |
| 59 | unauthorized admin access는 logout이 아니라 권한 부족 redirect여야 한다. | 준수 | 없음 | 정상 동작 | admin 권한이 없으면 `/home` redirect를 탄다. | `src/features/auth/server/middleware/route-decisions.ts:131-137` | unauthorized redirect를 유지한다. | `현 구조 유지` / `logout 처리` | `현 구조 유지` |
| 60 | route decision은 페이지 이동과 쿠키 정리를 독립적으로 제어할 수 있어야 한다. | 준수 | 없음 | 정상 동작 | `next`, `redirect`, `clear-and-next`, `clear-and-redirect`로 이동과 clear를 분리한다. | `src/features/auth/server/middleware/route-actions.ts:23-47`, `src/features/auth/server/middleware/route-actions.ts:200-223` | action 타입 분리를 유지한다. | `현 구조 유지` / `이동·정리 결합` | `현 구조 유지` |

## 바로 눈에 띄는 핵심 결론

1. `44`가 남은 clear-policy 세부 부채다.
invalid refresh 외의 malformed session clear reason도 아직 같은 층위에서 다뤄지고 있다.

2. 로그인 성공/복구 우선/refresh single-flight 관련 실제 메인 경로 버그는 이번 수정으로 대부분 정리됐다.

3. route policy 자체는 많이 안정화됐고, 남은 차이는 malformed session과 confirmed invalid를 얼마나 더 세밀하게 분리할지에 가깝다.
