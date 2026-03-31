# Auth Proposition 91-120 Audit

현재 워크트리 기준으로 auth 명제 `91~120`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: 에러 처리 / 테스트, 멀티탭, 브라우저 라이프사이클 / BFCache / 복귀
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

- `준수`: 22개
- `부분 위반`: 8개
- `완전 이탈`: 0개

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 91 | auth invalid와 network glitch는 같은 메시지로 뭉개지면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | `AUTH001`은 일시적 인증 확인 실패 톤으로, `AUTH004`는 세션 만료 톤으로 분리돼 사용자 메시지가 갈린다. | `src/utils/error-handler.ts` | invalid와 transient 메시지 taxonomy를 계속 분리한다. | `분리 유지` / `다시 통합` | `분리 유지` |
| 92 | recoverable failure는 "다시 로그인"보다 "복구 시도"를 우선해야 한다. | 부분 위반 | 중간 | 잠재적 버그 | client `AUTH001`은 recovery를 우선하지만, refresh-token-only gap과 일부 protected fallback은 복구 전에 사용자 이탈을 만든다. | `src/api/client/auth-response-interceptor.ts:74-95`, `src/features/auth/server/middleware/route-decisions.ts:118-125`, `src/features/auth/model/auth-session.ts:114-123` | recoverable failure를 공통 상태로 올리고 복구 우선 정책을 넓힌다. | `현재 부분 복구 유지` / `recoverable 공통화` | `recoverable 공통화` |
| 93 | confirmed invalid session만 로그인 화면 유도 또는 clear-session으로 이어져야 한다. | 부분 위반 | 중간 | 구조 부채 | 미들웨어는 대체로 지키지만, server route guard와 일부 불완전 세션 경로는 confirmed invalid와 비슷하게 clear redirect를 탄다. | `src/features/auth/model/server-route-guard.ts:49-59`, `src/features/auth/server/middleware/route-decisions.ts:44-47`, `src/features/auth/server/middleware/route-decisions.ts:127-130` | clear/login 유도 조건을 confirmed invalid 중심으로 더 좁힌다. | `현재 조건 유지` / `confirmed invalid만 허용` | `confirmed invalid만 허용` |
| 94 | public route에서 session validation 실패를 과도하게 clear하면 "갑자기 로그아웃됨" 체감을 만든다. | 준수 | 없음 | 정상 동작 | public route는 transient verify/refresh failure를 clear하지 않고 통과시킨다. | `src/features/auth/server/middleware/route-decisions.ts:51-73`, `src/features/auth/server/middleware/route-reasons.ts:65-69` | public route 보수 정책을 유지한다. | `보수 유지` / `공격적 clear` | `보수 유지` |
| 95 | protected route에서 transient failure를 과도하게 redirect하면 "권한이 사라짐" 체감을 만든다. | 부분 위반 | 중간 | 운영 리스크 | protected route는 1회 retry는 주지만 그 이후엔 landing redirect라 체감상 권한 소실처럼 보일 수 있다. | `src/features/auth/server/middleware/route-decisions.ts:118-125`, `src/features/auth/server/middleware/route-handlers.ts:52-85` | protected transient fallback UX를 더 완만하게 만든다. | `1회 retry 후 landing` / `동일 경로 유지+배너` / `재시도 횟수 조정` | `동일 경로 유지+배너` |
| 96 | `AUTH001`, `AUTH004`, verify request failed, refresh request failed는 구분해서 측정되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | middleware/session clear 경로가 구조화 auth log로 verifyState, refreshState, reason, token presence를 함께 남긴다. | `src/features/auth/server/middleware/access-token-session.ts`, `src/features/auth/server/middleware/auth-cookies.ts`, `src/features/auth/model/auth-debug-log.ts` | auth failure 로그 포맷을 계속 공통으로 유지한다. | `구조화 로그 유지` / `분산 로그 회귀` | `구조화 로그 유지` |
| 97 | expired-but-refreshable session은 anonymous가 되지 않는 테스트가 있어야 한다. | 준수 | 없음 | 정상 동작 | 단위 테스트가 expired token recovery를 직접 검증한다. | `src/features/auth/model/auth-session.test.ts:36-55` | 테스트를 유지한다. | `현 테스트 유지` / `테스트 제거` | `현 테스트 유지` |
| 98 | invalid refresh만 최종 logout으로 이어지는 테스트가 있어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | route policy 테스트가 invalid refresh와 transient failure를 분리하고, invalid refresh만 clear/logout 쪽 정책으로 보낸다. | `src/features/auth/server/middleware/route-decisions.test.ts` | invalid refresh 전용 회귀 테스트를 유지한다. | `테스트 유지` / `테스트 제거` | `테스트 유지` |
| 99 | same-request refresh 후 SSR override를 읽는 테스트가 있어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | `readServerAuthSession()`이 same-request override를 stale cookie보다 우선하는 통합 테스트가 추가됐다. | `src/features/auth/model/server-auth-session.test.ts` | SSR read path 테스트를 유지한다. | `통합 테스트 유지` / `header test만 유지` | `통합 테스트 유지` |
| 100 | auth 리팩토링의 완료 기준은 "성공 경로가 더 짧아짐"이 아니라 "거짓 상태가 덜 남음"이어야 한다. | 부분 위반 | 낮음 | 구조 부채 | 최근 구조는 그 방향이지만, 브라우저 local truth와 refresh-token-only gap이 남아 있어 아직 완료 기준에 도달하지 못했다. | `src/features/auth/model/use-auth.ts:131-166`, `src/features/auth/model/auth-session.ts:114-165` | false state를 기준으로 남은 부채를 계속 줄인다. | `성공 경로 단순화 우선` / `false state 제거 우선` | `false state 제거 우선` |
| 101 | 한 탭에서 로그아웃하면 다른 탭도 합리적인 시간 안에 동일 상태로 수렴해야 한다. | 준수 | 없음 | 정상 동작 | logout/clear가 localStorage 신호를 쏘고 다른 탭 `storage` listener가 snapshot을 다시 읽는다. | `src/features/auth/model/client-auth-sync.ts:14-31`, `src/features/auth/model/use-auth.ts:224-243`, `src/features/auth/model/client-auth-session.ts:16-21` | cross-tab sync를 유지한다. | `storage sync 유지` / `쿠키만 의존` | `storage sync 유지` |
| 102 | 한 탭에서 로그인하면 다른 탭의 stale anonymous UI가 영구히 남아 있으면 안 된다. | 준수 | 없음 | 정상 동작 | 로그인 쿠키 저장 시 auth change를 브로드캐스트하고 다른 탭이 snapshot을 갱신한다. | `src/features/auth/model/client-auth-session.ts:68-76`, `src/features/auth/model/client-auth-sync.ts:14-31`, `src/features/auth/model/use-auth.ts:224-243` | 로그인 시 auth change broadcast를 계속 유지한다. | `broadcast 유지` / `탭별 독립 유지` | `broadcast 유지` |
| 103 | 다른 탭에서 계정이 바뀌었으면 현재 탭의 user cache도 그 계정에 맞게 갱신되거나 폐기되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | auth snapshot이 바뀌면 `UserInitializer`가 derived auth state와 query cache를 다시 비워 이전 계정 데이터를 남기지 않는다. | `src/providers/index.tsx`, `src/features/auth/model/client-auth-cleanup.ts`, `src/features/auth/model/client-auth-sync.ts` | 계정 전환 시 derived-state reset 경로를 유지한다. | `공용 reset 유지` / `user store만 갱신` | `공용 reset 유지` |
| 104 | storage event가 오지 않는 브라우저 상황에서도 focus/pageshow 기반 보정이 가능해야 한다. | 준수 | 없음 | 정상 동작 | `focus`, `pageshow`, `visibilitychange`가 storage 부재를 보완한다. | `src/features/auth/model/use-auth.ts:208-243` | 다중 이벤트 보정을 유지한다. | `focus/pageshow 유지` / `storage만 사용` | `focus/pageshow 유지` |
| 105 | 탭 A의 recoverable session과 탭 B의 confirmed invalid session이 장시간 공존하면 안 된다. | 준수 | 없음 | 정상 동작 | clear/logout이 쿠키와 storage 신호를 같이 바꾸므로 장시간 공존 구조는 약하다. | `src/features/auth/model/client-auth-session.ts:16-21`, `src/features/auth/model/use-auth.ts:224-243` | cross-tab convergence 경로를 유지한다. | `현 구조 유지` / `추가 브로드캐스트` | `현 구조 유지` |
| 106 | 멀티탭 환경에서 clear-session redirect가 여러 번 폭발적으로 중복 실행되면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 같은 탭 dedupe에 더해 localStorage 기반 cross-tab redirect marker가 생겨 짧은 시간의 중복 clear redirect를 막는다. | `src/features/auth/model/client-auth-cleanup.ts`, `src/features/auth/model/client-auth-cleanup.test.ts` | same-tab + cross-tab redirect dedupe를 유지한다. | `cross-tab dedupe 유지` / `탭별 dedupe만 유지` | `cross-tab dedupe 유지` |
| 107 | 한 탭에서 refresh로 갱신한 accessToken은 다른 탭에서도 결국 읽혀야 한다. | 준수 | 없음 | 정상 동작 | refresh가 쿠키를 갱신하면 다른 탭도 focus/pageshow 또는 storage sync 시 새 쿠키를 읽는다. | `src/features/auth/server/middleware/auth-cookies.ts:172-195`, `src/features/auth/model/use-auth.ts:208-243` | 쿠키 기반 eventual sync를 유지한다. | `현 구조 유지` / `별도 토큰 브로드캐스트` | `현 구조 유지` |
| 108 | 계정 전환 직후 다른 탭에서 이전 계정의 persist store가 살아남으면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 다른 탭에서도 auth snapshot 변화가 감지되면 `UserInitializer`가 auth-coupled persist store와 query cache를 함께 reset한다. | `src/providers/index.tsx`, `src/features/auth/model/client-auth-cleanup.ts`, `src/features/auth/model/use-auth.ts` | 계정 전환 시 공용 derived-state reset을 유지한다. | `공용 reset 유지` / `로그아웃 때만 reset` | `공용 reset 유지` |
| 109 | 멀티탭 상태 동기화는 최종 auth truth를 맞추는 방향으로만 작동해야 한다. | 부분 위반 | 중간 | 구조 부채 | 현재 동기화는 최종 server truth가 아니라 쿠키/JWT decode snapshot을 다시 계산하는 방식이다. | `src/features/auth/model/use-auth.ts:163-243`, `src/features/auth/model/auth-session.ts:96-166` | 브라우저 sync를 server-fed 상태 쪽으로 얇게 만든다. | `쿠키 decode sync 유지` / `server-fed sync 강화` | `server-fed sync 강화` |
| 110 | 탭 간 auth 동기화는 토큰 문자열보다 최종 세션 상태 수렴을 우선 목표로 해야 한다. | 부분 위반 | 중간 | 구조 부채 | 현재 동기화는 토큰 문자열이 바뀌면 snapshot을 다시 만든다는 구조에 더 가깝다. | `src/features/auth/model/client-auth-sync.ts:14-31`, `src/features/auth/model/use-auth.ts:169-243` | 상태 수렴 중심 이벤트 모델로 옮긴다. | `토큰 문자열 중심` / `세션 상태 중심` | `세션 상태 중심` |
| 111 | 브라우저 뒤로가기 복원(BFCache) 후에도 auth 상태는 다시 동기화되어야 한다. | 준수 | 없음 | 정상 동작 | `pageshow` listener가 BFCache 복귀 시 snapshot을 다시 읽는다. | `src/features/auth/model/use-auth.ts:230-239` | `pageshow` 기반 sync를 유지한다. | `pageshow 유지` / `focus만 사용` | `pageshow 유지` |
| 112 | 오랜 시간 백그라운드에 있던 탭이 복귀했을 때 만료 토큰을 그대로 진실처럼 그리면 안 된다. | 부분 위반 | 중간 | 잠재적 버그 | 복귀 시 snapshot을 다시 계산하지만, 브라우저는 expired token을 recoverable authenticated로 유지할 수 있다. | `src/features/auth/model/use-auth.ts:136-166`, `src/features/auth/model/use-auth.ts:208-243` | 복귀 시 recoverable과 authenticated를 UI에서 구분할 수 있게 만든다. | `지금처럼 authenticated 취급` / `recoverable 상태 노출` | `recoverable 상태 노출` |
| 113 | 페이지 복귀 시점에 서버에서 세션이 이미 정리되었으면 UI도 결국 그 상태로 수렴해야 한다. | 준수 | 없음 | 정상 동작 | 복귀 이벤트 sync가 쿠키를 다시 읽고, accessToken이 없으면 anonymous로 수렴한다. | `src/features/auth/model/use-auth.ts:163-166`, `src/features/auth/model/use-auth.ts:208-243` | 복귀 시 쿠키 재읽기 경로를 유지한다. | `현 구조 유지` / `복귀 sync 제거` | `현 구조 유지` |
| 114 | 페이지 복귀 시점에 refresh로 복구 가능한 세션이면 즉시 로그아웃처럼 보이면 안 된다. | 준수 | 없음 | 정상 동작 | 브라우저는 expired token alone으로 anonymous로 내리지 않는다. | `src/features/auth/model/use-auth.ts:136-160`, `src/features/auth/model/auth-session.ts:125-155` | recoverable 해석을 유지한다. | `recoverable 유지` / `즉시 anonymous` | `recoverable 유지` |
| 115 | visibilitychange, focus, pageshow 중 일부가 누락돼도 auth sync가 영구히 멈추면 안 된다. | 준수 | 없음 | 정상 동작 | auth sync가 네 이벤트에 분산돼 있어 하나가 빠져도 전부 멈추진 않는다. | `src/features/auth/model/use-auth.ts:219-241` | 다중 이벤트 구성을 유지한다. | `복수 이벤트 유지` / `단일 이벤트 의존` | `복수 이벤트 유지` |
| 116 | 새로고침, 강력 새로고침, 탭 복제 각각에서 auth 상태가 완전히 다른 결과를 내면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | SSR fallback과 브라우저 snapshot이 모두 expired token recovery를 같은 기준으로 해석해 진입 방식별 분기가 줄었다. | `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/auth-session.ts`, `src/features/auth/model/use-auth.ts` | SSR·브라우저 공통 recoverable 해석을 유지한다. | `공통 recoverable 유지` / `계약 재분기` | `공통 recoverable 유지` |
| 117 | 브라우저 복귀 이벤트에서 무한 recovery loop가 생기면 안 된다. | 준수 | 없음 | 정상 동작 | 복귀 이벤트는 snapshot sync만 하고 reload는 하지 않는다. recovery reload도 cooldown이 있다. | `src/features/auth/model/use-auth.ts:208-243`, `src/api/client/auth-session-recovery.ts:32-51` | 현재 분리를 유지한다. | `sync만 수행` / `복귀 이벤트에서 reload` | `sync만 수행` |
| 118 | 복귀 이벤트는 UI만 갱신하고 서버 truth와 충돌하는 새로운 로컬 truth를 만들면 안 된다. | 부분 위반 | 높음 | 구조 부채 | 복귀 이벤트가 결국 JWT decode 기반 browser snapshot을 재생성하므로 로컬 truth를 다시 만든다. | `src/features/auth/model/use-auth.ts:163-166`, `src/features/auth/model/use-auth.ts:208-243`, `src/features/auth/model/auth-session.ts:96-166` | lifecycle sync를 server-fed session 소비 쪽으로 더 얇게 만든다. | `로컬 decode 유지` / `server-fed sync 강화` | `server-fed sync 강화` |
| 119 | hydration 이전과 이후의 auth 상태 차이는 일시적이어야 하며 영구 분기되면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | SSR과 브라우저가 expired token-backed session을 같은 recoverable contract로 읽어 hydration 분기가 장기화되지 않는다. | `src/features/auth/model/server-auth-session.ts`, `src/features/auth/model/use-auth.ts`, `src/features/auth/model/server-auth-session.test.ts` | hydration 전후 공통 recoverable 계약을 유지한다. | `공통 recoverable 유지` / `계약 재분기` | `공통 recoverable 유지` |
| 120 | 브라우저 lifecycle 이벤트는 auth 오류를 숨기기보다 state reconciliation에만 사용되어야 한다. | 준수 | 없음 | 정상 동작 | lifecycle 이벤트는 snapshot sync만 수행하고 오류를 삼켜서 별도 state를 덮지는 않는다. | `src/features/auth/model/use-auth.ts:208-243` | lifecycle 이벤트를 reconciliation 역할에만 유지한다. | `현 구조 유지` / `이벤트에서 별도 recovery 실행` | `현 구조 유지` |

## 바로 눈에 띄는 핵심 결론

1. `92`, `93`, `95`는 아직 recoverable/transient와 confirmed invalid의 정책 경계가 남아 있다는 뜻이다.
특히 protected route fallback과 server route guard는 완전한 이유값 중심 모델이 아니다.

2. `109`, `110`, `118`은 멀티탭과 lifecycle에서 남은 source-of-truth 부채다.
브라우저가 여전히 server-fed state 소비자만은 아니고 로컬 snapshot 해석기를 겸한다.

3. `112`와 `100`은 공용 `recoverable` 상태를 아직 UI state로 승격하지 않았다는 한계를 보여준다.
거짓 로그아웃은 많이 줄었지만, 브라우저가 recoverable과 authenticated를 같은 화면 상태로 취급하는 면적은 남아 있다.
