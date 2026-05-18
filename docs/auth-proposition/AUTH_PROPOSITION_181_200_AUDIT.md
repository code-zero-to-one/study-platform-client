# Auth Proposition 181-200 Audit

현재 워크트리 기준으로 auth 명제 `181~200`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: 부분 장애 / degraded backend, 관찰 가능성 / 테스트 매트릭스 / 유지보수성
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

- `준수`: 17개
- `부분 위반`: 3개
- `완전 이탈`: 0개

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 181 | `/auth/me`만 불안정하고 refresh는 정상인 상황을 구분할 수 있어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | verify가 `UNKNOWN_ERROR`여도 middleware가 보조 refresh를 시도하고, 성공 시 세션을 복구한다. | `src/features/auth/server/middleware/access-token-session.ts`, `src/features/auth/server/middleware/access-token-session.test.ts` | verify-only degraded fallback refresh를 유지한다. | `보조 refresh 유지` / `즉시 transient 종료` | `보조 refresh 유지` |
| 182 | refresh endpoint만 불안정하고 기존 세션은 아직 유효한 상황을 과도하게 invalid로 만들면 안 된다. | 준수 | 없음 | 정상 동작 | refresh request 실패는 invalid가 아니라 transient request-failed로 분류된다. | `src/features/auth/server/middleware/access-token-session.ts:202-216`, `src/features/auth/server/middleware/access-token-session.ts:270-279` | transient 분류를 유지한다. | `현 구조 유지` / `invalid로 승격` | `현 구조 유지` |
| 183 | backend 응답 body 파싱 실패는 token invalid와 구분되어야 한다. | 준수 | 없음 | 정상 동작 | verify/refresh 모두 JSON parse 실패 시 unknown/request-failed로 분리한다. | `src/features/auth/server/middleware/access-token-session.ts:154-168`, `src/features/auth/server/middleware/access-token-session.ts:202-216` | parse failure 분리를 유지한다. | `분리 유지` / `invalid 통합` | `분리 유지` |
| 184 | HTML 에러 페이지나 프록시 에러 응답이 와도 곧바로 logout으로 이어지면 안 된다. | 부분 위반 | 중간 | 운영 리스크 | parse failure는 transient로 분리되지만 protected route는 최종적으로 landing redirect를 탈 수 있어 체감상 로그아웃처럼 보인다. | `src/features/auth/server/middleware/access-token-session.ts:154-168`, `src/features/auth/server/middleware/route-decisions.ts:118-125` | protected degraded fallback UX를 더 완만하게 바꾼다. | `현 구조 유지` / `동일 경로 유지+배너` | `동일 경로 유지+배너` |
| 185 | 일시적 5xx는 invalid refresh와 구분되어야 한다. | 준수 | 없음 | 정상 동작 | refresh 응답이 `AUTH004`가 아니면 request-failed로 분류된다. | `src/features/auth/server/middleware/access-token-session.ts:202-216` | 5xx와 invalid refresh 분리를 유지한다. | `분리 유지` / `AUTH004와 통합` | `분리 유지` |
| 186 | 네트워크 timeout은 confirmed invalid 근거가 아니다. | 준수 | 없음 | 정상 동작 | fetch throw는 verify/refresh 모두 transient request failure로 분류된다. | `src/features/auth/server/middleware/access-token-session.ts:175-177`, `src/features/auth/server/middleware/access-token-session.ts:232-233` | timeout을 transient로 유지한다. | `현 구조 유지` / `invalid로 승격` | `현 구조 유지` |
| 187 | degraded backend 상태에서 public route는 가능한 한 세션을 보수적으로 유지해야 한다. | 준수 | 없음 | 정상 동작 | public route는 transient verify/refresh failure를 clear하지 않고 next 처리한다. | `src/features/auth/server/middleware/route-decisions.ts:65-72` | public route 보수 정책을 유지한다. | `현 구조 유지` / `공격적 clear` | `현 구조 유지` |
| 188 | degraded backend 상태에서 protected route는 confirmed invalid와 부분 장애를 구분하는 복구 또는 재시도 정책이 있어야 한다. | 준수 | 없음 | 정상 동작 | protected route는 transient failure에 retry marker를 주고 invalid failure와 다른 정책을 사용한다. | `src/features/auth/server/middleware/route-handlers.ts:52-85`, `src/features/auth/server/middleware/route-decisions.ts:118-130` | retry 정책을 유지한다. | `현 구조 유지` / `invalid와 통합` | `현 구조 유지` |
| 189 | 부분 장애 시 user-facing message는 confirmed invalid로 오해하게 만들면 안 되며, 일시적 인증 확인 실패임을 드러내야 한다. | 부분 위반 | 중간 | 운영 리스크 | API 에러 메시지는 transient/invald를 나눴지만, protected transient fallback redirect 자체는 여전히 로그아웃처럼 보일 여지가 남는다. | `src/utils/error-handler.ts`, `src/features/auth/server/middleware/route-decisions.ts` | 메시지는 분리하되, 남은 UX 부채는 protected fallback 정책에서 계속 줄인다. | `메시지 분리만 유지` / `fallback UX까지 재설계` | `fallback UX까지 재설계` |
| 190 | backend 부분 장애에서도 cleanup은 정말 필요한 경우에만 실행되어야 한다. | 준수 | 없음 | 정상 동작 | transient verify/refresh failure는 public/login/sign-up에서 clear되지 않고 protected도 non-clear redirect가 우선이다. | `src/features/auth/server/middleware/route-decisions.ts:39-47`, `src/features/auth/server/middleware/route-decisions.ts:65-72`, `src/features/auth/server/middleware/route-decisions.ts:118-125` | 부분 장애 non-clear 정책을 유지한다. | `현 구조 유지` / `부분 장애도 clear` | `현 구조 유지` |
| 191 | auth bug를 재현하려면 layer, route, reason, token 상태를 함께 기록할 수 있어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 공용 auth debug log가 layer, route, reason, verify/refresh state, token presence를 한 payload로 남긴다. | `src/features/auth/model/auth-debug-log.ts`, `src/features/auth/server/middleware/access-token-session.ts`, `src/features/auth/server/middleware/auth-cookies.ts`, `src/features/auth/model/client-auth-session.ts`, `src/features/auth/model/use-oauth-redirect-controller.ts` | 구조화 auth debug log를 유지한다. | `구조화 로그 유지` / `분산 로그 회귀` | `구조화 로그 유지` |
| 192 | 로그에는 `AUTH001`, `AUTH004`, verify failed, refresh failed, clear reason이 구분되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | middleware/session clear 경로가 verifyState, refreshState, clear reason을 구조화 payload로 구분해 남긴다. | `src/features/auth/server/middleware/access-token-session.ts`, `src/features/auth/server/middleware/auth-cookies.ts`, `src/features/auth/server/middleware/route-reasons.ts` | auth 이벤트 로그 포맷을 공통으로 유지한다. | `공통 포맷 유지` / `계층별 제각각` | `공통 포맷 유지` |
| 193 | 운영에서 "갑자기 로그아웃됨" 제보가 오면 route policy와 failure reason을 연결해 볼 수 있어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | clear reason 문자열 자체에 route policy 맥락이 들어 있고, 구조화 auth log가 route/path/layer/reason을 같이 남겨 운영 제보를 더 좁혀 볼 수 있다. | `src/features/auth/server/middleware/auth-cookies.ts`, `src/features/auth/model/auth-debug-log.ts`, `src/features/auth/server/middleware/route-reasons.ts` | route policy가 드러나는 clear reason + 구조화 로그를 유지한다. | `현재 포맷 유지` / `분리 로그 회귀` | `현재 포맷 유지` |
| 194 | 테스트는 expired-but-refreshable, invalid-refresh, transient-failure를 각각 분리해야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | expired recovery, invalid refresh, transient verify failure가 각각 별도 테스트 케이스로 분리돼 있다. | `src/features/auth/model/auth-session.test.ts`, `src/features/auth/server/middleware/route-decisions.test.ts`, `src/features/auth/server/middleware/access-token-session.test.ts` | 상태별 분리 테스트를 유지한다. | `분리 테스트 유지` / `행복 경로만 테스트` | `분리 테스트 유지` |
| 195 | 테스트는 same-request SSR override와 stale cookie fallback을 따로 검증해야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | `readServerAuthSession()` 테스트가 override 우선 경로와 stale expired cookie fallback 경로를 별도로 고정한다. | `src/features/auth/model/server-auth-session.test.ts` | override/fallback 비교 테스트를 유지한다. | `비교 테스트 유지` / `header test만 유지` | `비교 테스트 유지` |
| 196 | 테스트는 public route, protected route, login route, sign-up route의 정책 차이를 모두 덮어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | route decision 테스트가 public/protected/login/sign-up 경로의 transient/invalid/anonymous 분기를 모두 덮는다. | `src/features/auth/server/middleware/route-decisions.test.ts` | route policy 전체 테스트를 유지한다. | `전체 커버 유지` / `일부 경로만 테스트` | `전체 커버 유지` |
| 197 | auth 테스트 범위에는 멀티탭 sync와 cleanup idempotency도 단계적으로 포함되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | cleanup idempotency 테스트와 client auth sync 테스트가 모두 추가돼 멀티탭/cleanup 회귀를 같이 본다. | `src/features/auth/model/client-auth-cleanup.test.ts`, `src/features/auth/model/client-auth-sync.test.ts` | 멀티탭 sync + cleanup 회귀 테스트를 유지한다. | `현재 테스트 유지` / `테스트 축소` | `현재 테스트 유지` |
| 198 | auth 명제 문서는 리팩토링 시 임의 삭제하지 말고, 변경 근거와 함께 수정되어야 한다. | 준수 | 없음 | 정상 동작 | 현재 명제 문서와 감사 문서가 별도 파일로 유지되고 있다. | `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`, `docs/2026-04-01-refactoring/AUTH_PROPOSITION_61_90_AUDIT.md` | 문서 기반 변경 이력을 유지한다. | `현 구조 유지` / `문서 생략` | `현 구조 유지` |
| 199 | 명제가 많아질수록 서로 모순되지 않도록 source of truth 기준으로 정렬되어야 한다. | 준수 | 없음 | 정상 동작 | 현재 명제 문서는 source of truth, 상태 모델, route, browser, cleanup, 테스트 순으로 정렬돼 있다. | `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md` | source-of-truth 기준 정렬을 유지한다. | `현 구조 유지` / `무순서 추가` | `현 구조 유지` |
| 200 | auth 설계의 최종 목표는 "토큰을 어디에 저장하느냐"보다 "거짓 상태를 얼마나 덜 남기느냐"여야 한다. | 부분 위반 | 낮음 | 구조 부채 | 최근 방향은 false logout 감소에 맞지만, 코드에는 아직 token transport와 local truth 해석 부채가 남아 있다. | `src/features/auth/model/use-auth.ts:131-166`, `src/features/auth/model/server-auth-session.ts:100-129`, `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md` | 남은 설계 부채도 false state 제거 기준으로 우선순위를 잡는다. | `저장 위치 중심 개선` / `false state 중심 개선` | `false state 중심 개선` |

## 바로 눈에 띄는 핵심 결론

1. `184`와 `189`는 degraded backend UX의 남은 핵심 부채다.
부분 장애를 분리하고 메시지도 나눴지만, protected transient fallback 자체는 여전히 로그인 풀림처럼 보일 여지가 남는다.

2. `200`은 남은 설계 우선순위 기준을 보여준다.
이번 수정은 false state를 많이 줄였지만, 브라우저 로컬 snapshot 해석 부채까지 완전히 사라진 건 아니다.

3. 관찰 가능성과 테스트 기본 매트릭스는 이번 수정으로 메인 경로 기준 정리됐다.
