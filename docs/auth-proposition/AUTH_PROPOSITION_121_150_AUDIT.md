# Auth Proposition 121-150 Audit

현재 워크트리 기준으로 auth 명제 `121~150`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: OAuth redirect / 회원가입 경계, 쿠키 transport, 시간 / 만료 / clock skew
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


| No  | 명제                                                                                         | 판정    | 위험도 | 근거 요약                                                                                            | 코드 근거                                                                                                                                                                                                               | 해결책 요약                                                  | 선택지                                      | 추천                        |
| --- | ------------------------------------------------------------------------------------------ | ----- | --- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- | ------------------------- |
| 121 | OAuth redirect 결과에 accessToken이 없으면 성공 플로우로 진입하면 안 된다. | 준수 | 없음 | 정상 동작 | redirect parser가 accessToken 누락 시 즉시 contract error를 던진다. | `src/features/auth/model/parse-oauth-redirect-result.ts:118-125` | strict contract parse를 유지한다. | `strict parse 유지` / `누락 허용` | `strict parse 유지` |
| 122 | OAuth redirect 결과에 memberId가 필요한 경로에서는 memberId 누락을 성공으로 취급하면 안 된다. | 준수 | 없음 | 정상 동작 | 기존 회원 success shape는 memberId가 없으면 계약 오류로 막힌다. | `src/features/auth/model/parse-oauth-redirect-result.ts:138-149` | existing-member path에 memberId 필수를 유지한다. | `필수 유지` / `옵셔널 허용` | `필수 유지` |
| 123 | 신규 회원과 기존 회원의 redirect 결과 shape는 명시적으로 구분되어야 한다. | 준수 | 없음 | 정상 동작 | parser가 `NEW_MEMBER_SUCCESS`와 `EXISTING_MEMBER_SUCCESS`를 명시적으로 나눈다. | `src/features/auth/model/parse-oauth-redirect-result.ts:127-156`, `src/types/auth/domain.ts:62-94` | kind 분리를 유지한다. | `kind 분리 유지` / `shape 추론` | `kind 분리 유지` |
| 124 | guest token을 가진 신규 회원이 `/home`으로 바로 가도 정식 authenticated처럼 보이면 안 된다. | 준수 | 없음 | 정상 동작 | guest token은 pending-signup으로 해석되고 protected route에서 `/sign-up`으로 보낸다. | `src/features/auth/model/auth-session.ts:136-145`, `src/features/auth/server/middleware/route-decisions.ts:111-117` | pending-signup 정책을 유지한다. | `pending-signup 유지` / `authenticated 승격` | `pending-signup 유지` |
| 125 | sign-up 중간에 탭을 닫았다 돌아와도 pending-signup과 authenticated를 혼동하면 안 된다. | 준수 | 없음 | 정상 동작 | guest token은 계속 pending-signup으로, non-guest + memberId 없음은 invalid로 분리한다. | `src/features/auth/server/middleware/route-session.ts:166-183`, `src/features/auth/model/auth-session.ts:136-165` | guest/non-guest 분기를 유지한다. | `현 구조 유지` / `단순 accessToken 기준` | `현 구조 유지` |
| 126 | 가입 완료 직후 guest token이 남아 있으면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | signup 성공은 정식 `memberId/accessToken`이 있고 세션 저장까지 성공했을 때만 완료 step으로 간다. | `src/components/common/modals/sign-up-modal.tsx`, `src/features/auth/model/client-auth-session.ts` | 가입 완료와 정식 세션 저장을 계속 원자적으로 유지한다. | `원자적 완료 유지` / `토큰 없이 success 허용` | `원자적 완료 유지` |
| 127 | guest가 아닌 token인데 sign-up에 머물면 안 된다. | 준수 | 없음 | 정상 동작 | sign-up route에서 authenticated session은 `/home`으로 보낸다. | `src/features/auth/server/middleware/route-decisions.ts:29-49` | sign-up route redirect 정책을 유지한다. | `현 구조 유지` / `sign-up 잔류 허용` | `현 구조 유지` |
| 128 | OAuth 실패/거부/계약 불일치 시 파생 세션 일부만 남기면 안 된다. | 준수 | 없음 | 정상 동작 | 실패/contract mismatch 시 공용 cleanup으로 로그인 상태를 정리하고 로그인으로 보낸다. | `src/features/auth/model/use-oauth-redirect-controller.ts:76-82`, `src/features/auth/model/use-oauth-redirect-controller.ts:111-126`, `src/features/auth/model/client-auth-cleanup.ts:27-46` | 실패 경로 cleanup을 유지한다. | `공용 cleanup 유지` / `부분 정리` | `공용 cleanup 유지` |
| 129 | redirect query param이 변조돼도 세션이 저장되면 안 된다. | 준수 | 없음 | 정상 동작 | parser가 필수 파라미터를 검증하고, 기존 회원은 token memberId mismatch도 추가로 막는다. | `src/features/auth/model/parse-oauth-redirect-result.ts:86-164`, `src/features/auth/model/client-auth-session.ts:36-55` | parser + token cross-check를 유지한다. | `두 단계 검증 유지` / `query만 신뢰` | `두 단계 검증 유지` |
| 130 | OAuth 직후 첫 화면 진입은 redirect 처리, cookie 저장, hydration 순서가 어긋나더라도 거짓 상태를 남기면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | OAuth redirect와 signup 성공 경로 모두 세션 저장 실패를 성공으로 넘기지 않고 즉시 cleanup 후 재로그인 상태로 복귀시킨다. | `src/features/auth/model/use-oauth-redirect-controller.ts`, `src/components/common/modals/sign-up-modal.tsx`, `src/features/auth/model/client-auth-session.ts` | 성공 경로 진입 전 세션 저장 성공을 계속 강제한다. | `저장 성공 강제 유지` / `실패 허용` | `저장 성공 강제 유지` |
| 131 | 운영 도메인에서 refresh_token 쿠키 domain이 잘못되어 서버에 안 붙는 상태가 생기면 안 된다. | 부분 위반 | 중간 | 환경/배포 리스크 | 프론트 미들웨어는 `zeroone.it.kr`를 하드코딩하고, 백엔드는 환경변수 기반이라 양쪽 정책이 완전히 하나로 묶여 있진 않다. | `src/features/auth/server/middleware/auth-cookies.ts:23-44`, `/home/osuma/coding_stuffs/study-platform-mvp/src/main/resources/application.yml:62-66` | frontend/backend cookie domain source를 하나로 맞춘다. | `프론트 하드코딩 유지` / `환경변수/공용 설정 통일` | `환경변수/공용 설정 통일` |
| 132 | HTTPS 환경에서 secure cookie가 누락되면 안 된다. | 준수 | 없음 | 정상 동작 | access token cookie와 strict refresh token cookie 모두 HTTPS에서 secure를 건다. | `src/features/auth/server/middleware/auth-cookies.ts:14-21`, `src/features/auth/server/middleware/auth-cookies.ts:37-43`, `src/api/client/cookie.ts:14-24` | secure 결정 로직을 유지한다. | `secure 유지` / `항상 false` | `secure 유지` |
| 133 | 로컬 개발 환경에서 운영 전용 cookie 정책을 강제로 적용하면 안 된다. | 준수 | 없음 | 정상 동작 | localhost 등 strict domain이 아니면 refresh token cookie에 운영용 domain/sameSite/secure를 강제하지 않는다. | `src/features/auth/server/middleware/auth-cookies.ts:25-44` | 환경별 분기 정책을 유지한다. | `환경별 분기 유지` / `운영 정책 강제` | `환경별 분기 유지` |
| 134 | sameSite 정책 때문에 정상 refresh 요청에서 refresh_token이 누락되면 안 된다. | 준수 | 없음 | 정상 동작 | 운영에서는 `SameSite=None; Secure`, 미들웨어 refresh는 request cookie를 직접 전달한다. | `src/features/auth/server/middleware/auth-cookies.ts:29-44`, `src/features/auth/server/middleware/access-token-session.ts:180-199` | refresh token transport를 현재처럼 유지한다. | `현 정책 유지` / `Lax/Strict 변경` | `현 정책 유지` |
| 135 | middleware가 backend `set-cookie`를 전달받고도 브라우저 응답에 복사하지 않으면 안 된다. | 준수 | 없음 | 정상 동작 | refresh 성공 시 backend `set-cookie`를 읽어 브라우저 응답에 다시 심는다. | `src/features/auth/server/middleware/access-token-session.ts:293-300`, `src/features/auth/server/middleware/auth-cookies.ts:132-149` | `set-cookie` 복사를 유지한다. | `복사 유지` / `무시` | `복사 유지` |
| 136 | clearAuthCookies는 client auth 쿠키와 refresh_token을 함께 정리해야 한다. | 준수 | 없음 | 정상 동작 | server clear가 client auth 쿠키와 refresh token을 모두 삭제한다. | `src/features/auth/server/middleware/auth-cookies.ts:96-111`, `src/features/auth/model/auth-cookie.ts:13-21` | full-cookie cleanup을 유지한다. | `전부 삭제` / `일부 삭제` | `전부 삭제` |
| 137 | refresh_token만 정리되고 accessToken이 남는 partial logout은 허용하면 안 된다. | 준수 | 없음 | 정상 동작 | server clear와 backend logout이 access/member/refresh를 함께 정리한다. | `src/features/auth/server/middleware/auth-cookies.ts:96-111`, `/home/osuma/coding_stuffs/study-platform-mvp/src/main/java/com/codezerotoone/mvp/domain/member/auth/adapter/WebBasedAuthServiceAdapter.java:129-143` | partial logout을 계속 금지한다. | `전체 삭제` / `refresh만 삭제` | `전체 삭제` |
| 138 | accessToken만 정리되고 refresh_token이 남았을 때는 recoverable session인지 truly invalid인지 다시 평가되어야 한다. | 완전 이탈 -> 준수 | 없음 | 정상 동작 | 미들웨어가 `refresh_token only` 상태를 따로 잡아 먼저 refresh를 시도하고, 그 결과를 authenticated / pending-signup / invalid로 다시 판정한다. | `src/features/auth/server/middleware/auth-context.ts`, `src/features/auth/server/middleware/route-session.ts`, `src/features/auth/server/middleware/access-token-session.ts` | refresh-token-only recoverable 경로를 유지한다. | `recoverable 유지` / `즉시 anonymous 회귀` | `recoverable 유지` |
| 139 | 쿠키 옵션 차이 때문에 같은 세션이 서브도메인마다 다르게 보이면 안 된다. | 부분 위반 | 높음 | 환경/배포 리스크 | refresh token은 domain cookie인데 access/member는 host-only라, 서브도메인 구성에 따라 세션 체감이 달라질 수 있다. | `src/features/auth/server/middleware/auth-cookies.ts:23-44`, `src/api/client/cookie.ts:32-52` | token-backed cookie domain 정책을 재정렬한다. | `현 구조 유지` / `서브도메인 공통 domain 적용` | `서브도메인 공통 domain 적용` |
| 140 | request protocol과 deployed domain 정책 차이로 auth가 환경마다 임의로 달라지면 안 된다. | 부분 위반 | 중간 | 환경/배포 리스크 | secure/domain 분기가 hostname과 forwarded proto에 의존해 배포 환경 헤더 품질에 민감하다. | `src/features/auth/server/middleware/auth-cookies.ts:14-44`, `src/app/api/auth/clear-session/route.ts:16-31` | 환경별 cookie transport 정책을 중앙 설정으로 고정한다. | `헤더 추론 유지` / `명시 설정 강화` | `명시 설정 강화` |
| 141 | 클라이언트 시계가 약간 틀어져도 즉시 로그아웃처럼 보이면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | exp 해석에 30초 clock skew buffer를 넣어 경계 시간대의 조기 로그아웃 체감을 줄였다. | `src/features/auth/model/auth-session.ts` | 공통 skew buffer 정책을 유지한다. | `skew buffer 유지` / `strict exp 회귀` | `skew buffer 유지` |
| 142 | exp 판정은 서버와 클라이언트의 clock skew를 고려해 보수적으로 사용되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 서버/브라우저 공통 util이 같은 skew buffer를 써 exp를 보수적으로 해석한다. | `src/features/auth/model/auth-session.ts`, `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/use-auth.ts` | 공통 exp skew 정책을 유지한다. | `공통 skew 유지` / `strict exp 회귀` | `공통 skew 유지` |
| 143 | 만료 경계 직전과 직후에 요청이 몰려도 상태가 랜덤하게 갈리면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | expired-token contract를 SSR/브라우저가 맞추고, middleware refresh도 single-flight로 묶어 경계 시간대 랜덤 분기를 줄였다. | `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/use-auth.ts`, `src/features/auth/server/middleware/access-token-session.ts` | 공통 recoverable 계약과 middleware single-flight를 유지한다. | `현 구조 유지` / `다중 refresh 회귀` | `현 구조 유지` |
| 144 | access token TTL과 cookie TTL을 다르게 둘 경우, 그 차이로 생기는 stale window를 고려한 복구 또는 정리 정책이 있어야 한다. | 준수 | 없음 | 정상 동작 | token-backed auth cookies TTL은 backend access token TTL과 1시간으로 맞춰져 있다. | `src/features/auth/model/auth-cookie.ts:8`, `/home/osuma/coding_stuffs/study-platform-mvp/src/main/resources/application.yml:25-28` | TTL 정합성을 유지한다. | `TTL 정합 유지` / `다시 벌리기` | `TTL 정합 유지` |
| 145 | refresh token TTL 만료 직전에는 invalid refresh와 transient failure를 혼동하면 안 된다. | 준수 | 없음 | 정상 동작 | refresh 응답은 `AUTH004` invalid와 request failed를 구분한다. | `src/features/auth/server/middleware/access-token-session.ts:202-216`, `src/features/auth/server/middleware/route-reasons.ts:65-69` | invalid와 transient 구분을 유지한다. | `현재 구분 유지` / `실패 하나로 통합` | `현재 구분 유지` |
| 146 | 서버와 클라이언트의 시간 차이 때문에 pending-signup이 authenticated로 보이면 안 된다. | 준수 | 없음 | 정상 동작 | pending-signup은 guest claim 기준이라 시간 차이와 직접 결합되지 않는다. | `src/features/auth/model/auth-session.ts:109-145`, `src/features/auth/server/middleware/route-session.ts:166-183` | guest claim 기반 판정을 유지한다. | `guest claim 유지` / `exp 기반 섞기` | `guest claim 유지` |
| 147 | 1시간 경계에서 리로드했을 때 anonymous와 recoverable이 랜덤하게 바뀌면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | SSR fallback도 expired token-backed session을 recoverable authenticated로 유지해 1시간 경계 reload 결과를 통일했다. | `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/use-auth.ts`, `src/features/auth/model/server-auth-session.test.ts` | SSR·브라우저 공통 recoverable 해석을 유지한다. | `공통 recoverable 유지` / `strict anonymous 회귀` | `공통 recoverable 유지` |
| 148 | 브라우저가 오래 잠들어 있다 깨어난 뒤 stale exp 계산만으로 상태를 확정하면 안 된다. | 준수 | 없음 | 정상 동작 | 브라우저는 expired token alone으로 anonymous로 확정하지 않는다. | `src/features/auth/model/use-auth.ts:136-160`, `src/features/auth/model/auth-session.ts:125-155` | recoverable 해석을 유지한다. | `현 구조 유지` / `즉시 anonymous` | `현 구조 유지` |
| 149 | time-based retry guard를 둔다면, 세션 복구 경로를 영구 차단하는 방식이면 안 된다. | 준수 | 없음 | 정상 동작 | document auth recovery는 URL marker 기반 1회 재시도라 반복 루프를 막으면서도 영구 차단으로 굳지 않는다. | `src/api/client/auth-session-recovery.ts`, `src/features/auth/model/auth-route.ts`, `src/features/auth/server/middleware/route-handlers.ts` | reload 뒤에도 남는 1회 recovery marker 계약을 유지한다. | `URL marker 기반 1회 재시도` / `sessionStorage cooldown` / `영구 잠금` | `URL marker 기반 1회 재시도` |
| 150 | 시간 기반 방어 로직은 사용자 세션을 과도하게 줄이는 방향이면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | clock skew buffer와 공통 recoverable 해석으로 시간 기반 방어 로직이 세션을 과도하게 짧게 보이게 만들지 않는다. | `src/features/auth/model/auth-session.ts`, `src/features/auth/model/server-auth-session.ts` | 시간 기반 방어는 보수적 recoverable 쪽으로 유지한다. | `보수적 recoverable 유지` / `strict exp 회귀` | `보수적 recoverable 유지` |


## 바로 눈에 띄는 핵심 결론

1. `131`, `139`, `140`만 남은 배포/환경 경계다.
쿠키 domain, host-only vs domain cookie, forwarded proto 의존성은 프론트 코드만으로 완전히 닫을 수 없다.

2. OAuth/signup 경계와 시간 기반 false logout 문제는 이번 수정으로 메인 경로에서 정리됐다.
정식 세션 저장 실패나 refresh-token-only 세션 누락으로 바로 거짓 상태를 남기던 흐름은 현재 코드 기준으로 막혀 있다.

3. `141`, `142`, `143`, `147`, `150`은 사실상 한 묶음이다.
과거에는 시간 경계에서 SSR과 브라우저가 만료를 다르게 해석해 체감 랜덤성을 만들었지만, 현재는 clock skew buffer와 공통 recoverable 해석으로 메인 경로에서 정리됐다.
