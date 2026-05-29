# 요구사항 추적표 규칙 (Traceability Rules)

이 문서는 `docs/product-ssot/<domain>/traceability.md` 표의 **형식·ID 규칙·담당**에 대한 단일 기준(SSOT)입니다.
회고에서 나온 세 가지 문제 — (1) 요구사항↔화면 매칭 안 됨, (2) 피그마 변경이 코드/QA에 안 보임, (3) 문서가 흩어짐 — 를 도메인별 표 한 장으로 묶어 해결합니다.

스킬·검사 스크립트·관련 규칙은 모두 이 문서의 형식을 따릅니다. 형식을 바꾸려면 이 문서를 먼저 고치세요.

---

## REQ ID 규칙

```
REQ-{DOMAIN}-{NNN}
     │         └── 0을 채운 일련번호, 3자리 이상 (007, 042, 128)
     └── 도메인 코드, 대문자/숫자 (AUTH, PAYMENT, GROUPSTUDY)
```

- 정규식: `REQ-[A-Z0-9]+-\d{3,}` (스크립트·테스트 태그 공통)
- 한 요구사항 = 한 줄. 번호는 재사용하지 않습니다(삭제 시 `deprecated` 처리, 재발급 금지).
- 예: `REQ-AUTH-007`, `REQ-PAYMENT-031`

---

## 표 형식 (칸 7개 고정)

| REQ | 화면 | 컴포넌트 | Figma node | 검증 | 엔드포인트 | 상태 |
|---|---|---|---|---|---|---|
| `REQ-AUTH-007` | `/login` (modal) | `login-modal.tsx` | `42:2451` | `auth-session.spec.ts @REQ-AUTH-007` | `POST /api/v1/auth/access-token/refresh` | `active` |

| 칸 | 의미 | 담당 | 비고 |
|---|---|---|---|
| **REQ** | 요구사항 ID (위 규칙) | 도메인 담당 | 1번째 칸 — 스크립트가 ID로 인식 |
| **화면** | 라우트/모달 경로 | FE | 예: `/premium-study/[id]` |
| **컴포넌트** | 핵심 구현 파일 | FE | 파일명 또는 경로 |
| **Figma node** | 읽은 노드 id | FE | `figma-pre-code-gate.md`에서 기록 |
| **검증** | 테스트 파일 + `@REQ-*` 태그 | FE | 5번째 칸 — 스크립트가 태그 추출 |
| **엔드포인트** | 확인한 백엔드 API | FE | `api-live-schema-check.md`에서 기록 |
| **상태** | 아래 상태 값 | 도메인 담당 | 7번째 칸 |

> 도메인 담당이 **요구사항 글과 상태**를 적고, FE가 나머지 5칸(화면·컴포넌트·Figma·검증·엔드포인트)을 채웁니다.

---

## 상태 값

| 상태 | 의미 | 검사 동작 |
|---|---|---|
| `active` | 구현/검증 대상 | 검증 칸이 비면 **gap** 경고 |
| `예정` / `draft` | 아직 시작 안 함 | 검증 칸 비어도 OK |
| `deprecated` | 폐기됨 | 검사에서 완전히 제외 |

---

## 테스트 태그 다는 법

검증 칸에 적은 `@REQ-*`는 실제 테스트 파일에 같은 문자열로 존재해야 합니다(없으면 **broken**).

```typescript
// e2e — describe 제목 끝에 (@auth 태그 옆에)
test.describe('세션 만료 후 로그인 모달 @REQ-AUTH-007', () => { ... });

// unit — describe 제목 끝, 또는 주석
describe('refreshAccessToken @REQ-AUTH-007', () => { ... });
// @REQ-AUTH-007
it('AUTH001이면 큐에 쌓고 재시도한다', () => { ... });
```

검사 대상 파일: `e2e/**/*.spec.ts`, `src/**/*.test.ts` (vitest unit 범위와 동일).

---

## 검사 (`yarn trace:check`)

| 결과 | 뜻 | 해결 |
|---|---|---|
| 🔴 **orphan** | 테스트엔 `@REQ` 태그 있는데 표에 그 줄이 없음 | 표에 줄 추가하거나 태그 오타 수정 |
| 🟠 **broken** | 표가 적은 `@tag`를 가진 테스트가 없음 | 테스트에 태그 달거나 표 수정 |
| 🟡 **gap** | `active` 줄인데 검증 칸이 빔 | 테스트 추가 또는 상태를 `예정`으로 |

- 기본 모드: 보고만 하고 항상 0으로 종료(개발 초기 방해 금지).
- `yarn trace:check --strict`: orphan/broken이 있으면 1로 종료(gap은 경고 유지). 도메인이 안정되면 CI에 추가.

---

## 도메인 추가 방법

1. 도메인 선정 (예: `auth`).
2. 요구사항에서 `REQ-*` 부여 — 예: `docs/auth-proposition/AUTH_LOGICAL_PROPOSITIONS_200.md`의 명제를 줄로 변환.
3. `docs/product-ssot/_template/traceability.md`를 `docs/product-ssot/<domain>/traceability.md`로 복사.
4. 표 줄을 채운다(화면·컴포넌트·Figma·검증·엔드포인트).
5. 관련 테스트에 `@REQ-*` 태그를 단다.
6. `yarn trace:check`로 orphan/broken/gap 확인(경고 단계).
7. 도메인이 안정되면 `--strict`를 CI에 넣어 강제한다.
