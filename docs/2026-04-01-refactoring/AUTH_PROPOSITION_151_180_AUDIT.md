# Auth Proposition 151-180 Audit

현재 워크트리 기준으로 auth 명제 `151~180`을 코드와 대조한 정적 점검 결과다.

- 기준 문서: `docs/2026-04-01-refactoring/AUTH_LOGICAL_PROPOSITIONS_200.md`
- 범위: 요청 순서 / race / idempotency, redirect / UX signaling, authentication vs authorization
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

- `준수`: 25개
- `부분 위반`: 5개
- `완전 이탈`: 0개

## 판정표

| No | 명제 | 판정 | 위험도 | 특성 | 근거 요약 | 코드 근거 | 해결책 요약 | 선택지 | 추천 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 151 | 늦게 도착한 이전 요청 결과가 최신 auth 상태를 덮어쓰면 안 된다. | 준수 | 없음 | 정상 동작 | user store는 fetch 완료 시점에 현재 memberId를 다시 비교해 오래된 응답을 버린다. | `src/stores/useUserStore.ts:38-75`, `src/providers/index.tsx:45-59` | memberId guard를 유지한다. | `guard 유지` / `응답 순서 신뢰` | `guard 유지` |
| 152 | 동일 endpoint에 대한 중복 재시도는 idempotent한 정리 경로를 가져야 한다. | 준수 | 없음 | 정상 동작 | cleanup은 반복 호출돼도 같은 최종 상태로 수렴하고 redirect도 dedupe한다. | `src/features/auth/model/client-auth-cleanup.ts:12-42`, `src/features/auth/model/client-auth-cleanup.test.ts:102-144` | idempotent cleanup을 유지한다. | `현 구조 유지` / `상태별 분기 확대` | `현 구조 유지` |
| 153 | stale Authorization 헤더를 가진 요청이 새 쿠키 token을 영구히 되돌리면 안 된다. | 준수 | 없음 | 정상 동작 | stale request는 최신 cookie token과 다를 때만 최신 token으로 재시도한다. | `src/api/client/auth-response-interceptor.ts:79-90` | stale header overwrite 방지를 유지한다. | `현 구조 유지` / `원래 header 재사용` | `현 구조 유지` |
| 154 | recoverable failure 이후 retry 요청이 성공하면 이전 실패 UI는 폐기되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | browser document recovery 직전에 기존 토스트를 숨겨 stale auth-failure UI가 재진입 뒤에 남지 않게 했다. | `src/api/client/auth-session-recovery.ts`, `src/api/client/auth-session-recovery.test.ts` | recovery 직전 stale toast 정리 규칙을 유지한다. | `toast 정리 유지` / `그대로 재진입` | `toast 정리 유지` |
| 155 | clear-session과 logout이 동시에 들어와도 cleanup 결과는 한 가지로 수렴해야 한다. | 준수 | 없음 | 정상 동작 | client cleanup과 server clear 모두 idempotent하고 redirect dedupe도 있다. | `src/hooks/queries/use-auth-mutation.ts:32-53`, `src/features/auth/model/client-auth-cleanup.ts:27-46`, `src/app/api/auth/clear-session/route.ts:8-37` | 한 경로로 수렴하는 cleanup을 유지한다. | `현 구조 유지` / `별도 결과 허용` | `현 구조 유지` |
| 156 | middleware retry와 browser recovery가 동시에 발생해도 무한 redirect가 나면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | browser recovery가 `__authRetry=1` marker가 있을 때는 아예 시작하지 않고, 별도 cooldown도 있어 교차 loop가 막힌다. | `src/api/client/auth-session-recovery.ts`, `src/features/auth/server/middleware/route-handlers.ts`, `src/api/client/auth-session-recovery.test.ts` | retry marker + cooldown guard를 유지한다. | `guard 유지` / `병렬 recovery 허용` | `guard 유지` |
| 157 | pending-signup 세션과 authenticated 세션 전환 중에는 두 상태가 장시간 섞여 보이면 안 된다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | signup 완료는 정식 세션 저장 성공 이후에만 success step으로 가고, auth member 전환 시 derived state도 함께 정리된다. | `src/components/common/modals/sign-up-modal.tsx`, `src/features/auth/model/client-auth-session.ts`, `src/providers/index.tsx` | signup 완료와 authenticated 전환을 계속 원자적으로 유지한다. | `원자적 전환 유지` / `부분 성공 허용` | `원자적 전환 유지` |
| 158 | 여러 API 응답이 순서 뒤집혀 도착해도 user store가 더 오래된 계정으로 롤백되면 안 된다. | 준수 | 없음 | 정상 동작 | `useUserStore.fetchAndSetUser()`가 최신 memberId와 다르면 늦은 응답을 폐기한다. | `src/stores/useUserStore.ts:42-75` | memberId guard를 유지한다. | `guard 유지` / `응답 순서 신뢰` | `guard 유지` |
| 159 | retry marker cleanup redirect는 본래 도메인 작업을 중복 실행시키면 안 된다. | 준수 | 없음 | 정상 동작 | retry marker는 GET navigation path만 정리하고 domain mutation 재실행 로직은 없다. | `src/features/auth/model/auth-route.ts:64-100`, `src/features/auth/server/middleware/route-handlers.ts:68-82` | clean redirect를 현재처럼 navigation 범위에만 유지한다. | `현 구조 유지` / `도메인 action까지 다시 실행` | `현 구조 유지` |
| 160 | race 완화 로직은 문제를 숨기기보다 최종 state convergence를 보장해야 한다. | 부분 위반 | 중간 | 구조 부채 | 현재는 cooldown/retry로 급한 루프만 막지만, refresh-token-only나 SSR/browser drift까지 수렴시키진 못한다. | `src/api/client/auth-session-recovery.ts:1-52`, `src/features/auth/model/server-auth-session.ts:100-129`, `src/features/auth/model/use-auth.ts:131-166` | 임시 guard를 넘어서 공통 state convergence 모델을 추가한다. | `guard 중심 유지` / `공통 state 모델 추가` | `공통 state 모델 추가` |
| 161 | auth redirect는 사용자를 외부 URL로 보내면 안 된다. | 준수 | 없음 | 정상 동작 | clear-session API와 middleware redirect 모두 내부 안전 경로만 허용한다. | `src/features/auth/model/auth-route.ts:31-54`, `src/features/auth/server/middleware/route-actions.ts:168-176` | safe internal redirect를 유지한다. | `현 구조 유지` / `외부 URL 허용` | `현 구조 유지` |
| 162 | clear-session redirect path는 내부 안전 경로가 아니면 fallback으로 교체되어야 한다. | 준수 | 없음 | 정상 동작 | client helper와 server route가 모두 unsafe path를 fallback으로 치환한다. | `src/features/auth/model/auth-route.ts:42-54`, `src/app/api/auth/clear-session/route.ts:9-15` | fallback 치환을 유지한다. | `fallback 유지` / `원본 path 신뢰` | `fallback 유지` |
| 163 | recoverable auth failure를 redirect로 처리한다면, 가능한 한 사용자의 기존 작업 문맥을 잃지 않게 해야 한다. | 부분 위반 | 중간 | 운영 리스크 | browser recovery는 현재 URL을 그대로 reload하지만, protected transient fallback은 최종적으로 landing으로 보낼 수 있다. | `src/api/client/auth-session-recovery.ts:32-51`, `src/features/auth/server/middleware/route-decisions.ts:118-125` | recoverable failure fallback도 가능하면 원래 경로 문맥을 더 오래 유지한다. | `landing fallback 유지` / `동일 경로 유지+상태 배너` | `동일 경로 유지+상태 배너` |
| 164 | 로그인 풀림처럼 보이는 UX를 만들 수 있는 redirect는 최소화해야 한다. | 부분 위반 | 중간 | 운영 리스크 | protected transient failure는 1회 retry 후 landing redirect라 체감상 로그아웃처럼 보일 수 있다. | `src/features/auth/server/middleware/route-decisions.ts:118-125`, `src/features/auth/server/middleware/route-handlers.ts:58-82` | transient fallback redirect를 더 보수적으로 줄인다. | `현 구조 유지` / `동일 경로 유지` | `동일 경로 유지` |
| 165 | protected retry query param이 사용자의 북마크에 영구히 남으면 안 된다. | 부분 위반 | 낮음 | 구조 부채 | 회복되면 clean path로 제거하지만, 실패한 채 사용자가 북마크하면 남을 수 있다. | `src/features/auth/model/auth-route.ts:64-100`, `src/features/auth/server/middleware/route-handlers.ts:68-82` | retry param을 URL 대신 ephemeral storage로 옮기거나 제거 redirect를 강화한다. | `query param 유지` / `ephemeral storage 전환` | `ephemeral storage 전환` |
| 166 | history stack이 recovery redirect 때문에 비정상적으로 오염되면 안 된다. | 준수 | 없음 | 정상 동작 | browser recovery는 `window.location.replace()`를 써서 history 추가를 피한다. | `src/api/client/auth-session-recovery.ts:48-50` | `replace()` 기반 recovery를 유지한다. | `replace 유지` / `assign 사용` | `replace 유지` |
| 167 | 로그인 필요와 권한 부족은 다른 redirect/메시지로 구분되어야 한다. | 준수 | 없음 | 정상 동작 | anonymous는 landing/login 쪽으로, admin unauthorized는 home으로 보내며 메시지도 auth/권한 부족이 분리돼 있다. | `src/features/auth/server/middleware/route-decisions.ts:109-137`, `src/utils/error-handler.ts:369-372` | auth/authz 분리를 유지한다. | `분리 유지` / `하나로 통합` | `분리 유지` |
| 168 | pending-signup 사용자를 landing으로 보내는 것과 sign-up으로 보내는 것은 다른 정책으로 다뤄야 한다. | 준수 | 없음 | 정상 동작 | sign-up route는 허용하고 protected route는 `/sign-up`으로 보내는 등 정책이 나뉜다. | `src/features/auth/server/middleware/route-decisions.ts:29-49`, `src/features/auth/server/middleware/route-decisions.ts:111-117` | pending-signup 정책 분리를 유지한다. | `분리 유지` / `landing 일괄 처리` | `분리 유지` |
| 169 | 사용자가 이미 로그인 중인데 `/login`에 들어가면 authenticated state에 맞는 redirect가 필요하다. | 준수 | 없음 | 정상 동작 | login route는 authenticated면 `/home`, pending-signup이면 `/sign-up`으로 보낸다. | `src/features/auth/server/middleware/route-decisions.ts:76-98` | login route redirect를 유지한다. | `현 구조 유지` / `login 접근 허용` | `현 구조 유지` |
| 170 | redirect는 UX 신호이자 state transition이므로, "보내기만 하면 된다"는 식이면 안 된다. | 부분 위반 | 낮음 | 구조 부채 | route action 타입과 clear reason은 잘 나뉘었지만, 일부 transient fallback은 UX 신호 설계보다 이동 자체에 치우쳐 있다. | `src/features/auth/server/middleware/route-actions.ts:23-47`, `src/features/auth/server/middleware/route-decisions.ts:118-125` | redirect에 맞는 사용자 신호와 상태 설명을 추가한다. | `이동만 유지` / `UX 신호 보강` | `UX 신호 보강` |
| 171 | 인증 실패와 인가 실패는 같은 오류로 취급하면 안 된다. | 준수 | 없음 | 정상 동작 | auth failure와 admin unauthorized를 다른 redirect/분기로 처리한다. | `src/features/auth/server/middleware/route-decisions.ts:109-137`, `src/features/auth/model/server-route-guard.ts:68-84` | auth/authz 분리를 유지한다. | `분리 유지` / `통합 처리` | `분리 유지` |
| 172 | admin 권한 부족은 세션 invalid가 아니라 unauthorized다. | 준수 | 없음 | 정상 동작 | admin role이 없으면 logout이 아니라 `/home` redirect다. | `src/features/auth/server/middleware/route-decisions.ts:131-137`, `src/features/auth/model/server-route-guard.ts:80-82` | unauthorized redirect 정책을 유지한다. | `현 구조 유지` / `logout 처리` | `현 구조 유지` |
| 173 | authenticated user가 접근 불가한 화면에 간 경우에는 logout보다 적절한 redirect가 우선이다. | 준수 | 없음 | 정상 동작 | admin unauthorized는 clear가 아니라 redirect를 우선한다. | `src/features/auth/server/middleware/route-decisions.ts:131-137` | unauthorized redirect를 유지한다. | `redirect 유지` / `cleanup 우선` | `redirect 유지` |
| 174 | role claim 해석 실패는 권한 부족과 token invalid를 구분해서 처리해야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 정식 회원 token인데 `roleIds` claim을 해석할 수 없으면 별도 invalid reason으로 분리해 unauthorized와 구분한다. | `src/features/auth/server/middleware/route-session.ts`, `src/features/auth/server/middleware/route-reasons.ts`, `src/features/auth/server/middleware/route-session.test.ts` | role claim failure 전용 invalid reason을 유지한다. | `분리 유지` / `unauthorized에 흡수` | `분리 유지` |
| 175 | pending-signup은 인증 성공이지만 서비스 권한 미완료 상태로 볼 수 있어야 한다. | 준수 | 없음 | 정상 동작 | pending-signup을 별도 session kind로 유지하고 route 정책도 분리한다. | `src/types/auth/domain.ts:36-43`, `src/features/auth/server/middleware/route-session.ts:43-47` | 별도 kind를 유지한다. | `kind 유지` / `anonymous/authenticated에 흡수` | `kind 유지` |
| 176 | guest claim 제거 시점은 가입 완료와 일관되어야 한다. | 부분 위반 -> 준수 | 없음 | 정상 동작 | 가입 완료 UI는 guest가 아닌 정식 세션 저장이 끝난 뒤에만 노출돼 guest claim 제거와 완료 UX가 같은 시점에 수렴한다. | `src/components/common/modals/sign-up-modal.tsx`, `src/features/auth/model/client-auth-session.ts` | guest claim 제거와 완료 UI를 같은 성공 경계에 계속 묶는다. | `원자적 완료 유지` / `부분 성공 허용` | `원자적 완료 유지` |
| 177 | member profile이 없어도 authentication 자체가 무효라고 단정하면 안 된다. | 준수 | 없음 | 정상 동작 | 프로필 404는 auth invalid가 아니라 missing profile로 분리한다. | `src/api/endpoints/user/get-user-profile.server.ts:23-31`, `src/api/endpoints/user/get-user-profile.server.ts:75-80` | profile/auth 분리를 유지한다. | `분리 유지` / `profile 없음=logout` | `분리 유지` |
| 178 | `/auth/me`와 도메인 API의 403은 같은 의미가 아니다. | 준수 | 없음 | 정상 동작 | `/auth/me` 검증은 token verify 단계 reason으로, 도메인 API 403은 server helper의 `AUTH_ERROR`로 분리된다. | `src/features/auth/server/middleware/access-token-session.ts:154-177`, `src/api/endpoints/user/get-user-profile.server.ts:67-73` | verify 403과 domain 403 분리를 유지한다. | `분리 유지` / `같은 auth 오류로 통합` | `분리 유지` |
| 179 | admin path 판정은 pathname prefix와 role check가 모두 일관되어야 한다. | 준수 | 없음 | 정상 동작 | admin prefix 상수와 role check가 middleware/guard 양쪽에서 일관되게 사용된다. | `src/features/auth/model/auth-route.ts:21-25`, `src/features/auth/server/middleware/route-decisions.ts:26-27`, `src/features/auth/model/server-route-guard.ts:68-84` | prefix + role check 조합을 유지한다. | `현 구조 유지` / `하드코딩 분산` | `현 구조 유지` |
| 180 | authorization 실패는 auth cleanup을 촉발하는 근거가 아니어야 한다. | 준수 | 없음 | 정상 동작 | admin unauthorized는 cleanup 없이 redirect만 수행한다. | `src/features/auth/server/middleware/route-decisions.ts:131-137`, `src/features/auth/model/server-route-guard.ts:80-82` | authz 실패 non-cleanup 정책을 유지한다. | `redirect 유지` / `cleanup 유도` | `redirect 유지` |

## 바로 눈에 띄는 핵심 결론

1. `160`이 남은 race/convergence 부채다.
guard와 retry는 많이 좋아졌지만, 브라우저와 서버의 최종 state convergence 모델을 완전히 공용화한 상태는 아니다.

2. `163`, `164`, `165`, `170`은 redirect UX 신호 설계가 아직 남아 있다는 뜻이다.
특히 protected transient fallback은 여전히 landing redirect를 써 체감상 로그인 풀림처럼 보일 여지가 남는다.

3. 회원가입 완료 전환과 role claim 분기 자체는 이번 수정으로 메인 경로 기준 정리됐다.
