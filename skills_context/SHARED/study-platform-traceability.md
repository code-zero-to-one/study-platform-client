# 요구사항 추적표 Agent Skill SSOT

기획/디자인 요구사항을 화면·컴포넌트·Figma·테스트·백엔드 엔드포인트와 `REQ-*` ID로 묶어 추적할 때 사용합니다.
Claude/Codex 래퍼는 얇게 유지하고 이 문서를 가리킵니다.

## 형식 기준 (먼저 읽기)

표 형식·ID 규칙·담당·상태 값·검사 의미는 모두 여기서 정의됩니다:

- `docs/product-ssot/_shared/traceability-rules.md` — **단일 기준 문서**. 형식 관련 질문은 항상 이 파일로.
- `docs/product-ssot/_template/traceability.md` — 도메인 추가 시 복사할 빈 표.
- `scripts/trace-check.mjs` (`yarn trace:check`) — 표와 테스트 태그의 일관성 검사.

## 작업 시작 시 (요구사항이 있는 작업)

1. 작업이 속한 도메인의 `docs/product-ssot/<domain>/traceability.md`를 연다.
2. 관련 `REQ-*` 줄을 찾아 사용자에게 **화면 / 컴포넌트 / Figma node / 검증 테스트 / 엔드포인트**를 보여준다.
3. 표에 줄이 없으면 새 `REQ-*` ID를 제안한다(규칙: `docs/product-ssot/_shared/traceability-rules.md`).
4. 표가 없는 도메인이면 템플릿 복사부터 안내한다.

## 작업 완료 시

1. 바뀐 화면·컴포넌트·Figma node·엔드포인트를 해당 `REQ-*` 줄에 반영한다.
2. 추가/수정한 테스트의 `describe` 제목 끝(또는 주석)에 `@REQ-*` 태그가 있는지 확인한다.
3. `yarn trace:check`를 실행해 orphan/broken/gap이 없는지 확인하고 결과를 보고한다.
4. 도메인이 안정되어 있으면 `yarn trace:check --strict`로 강제 검사한다.

## 비협상 규칙

- 표 형식을 이 스킬 안에서 재정의하지 않는다. 항상 `_shared/traceability-rules.md`를 인용한다.
- 끊긴 링크 금지: 표의 `컴포넌트`/`검증`/`엔드포인트` 칸에는 **실제 존재하는** 파일/태그/엔드포인트만 적는다. 미구현이면 상태를 `예정`으로 두고 칸을 비운다.
- 도메인 줄(`<domain>/traceability.md`)은 해당 작업의 일부로만 커밋한다. 뼈대 PR에는 도메인 줄을 넣지 않는다.
- 백엔드 저장소를 수정하지 않는다. 엔드포인트는 확인만 해서 기록한다.
