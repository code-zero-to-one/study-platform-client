---
name: builder-ticket
status: backlog
created: 2026-06-05T16:50:24Z
progress: 0%
prd: .claude/prds/builder-ticket.md
github: https://github.com/code-zero-to-one/study-platform-client/issues/717
---

# Epic: builder-ticket

## Overview

빌더 티켓(쿠폰) 시스템을 기존 결제·인증·서버상태 인프라 위에 얹는다. 신규 코드는 (1) 티켓 도메인 타입/스키마, (2) 티켓 API 훅, (3) 결제 적용 UI, (4) 마이페이지 보유 목록, (5) 어드민 발급/집계 화면으로 한정한다. 결제 자체는 새로 만들지 않고 **기존 Toss 결제 흐름에 할인 산정 단계만 삽입**한다.

## Architecture Decisions

- **결제 재사용**: 별도 결제 모듈을 만들지 않고 `src/app/(service)/payment` 흐름에 티켓 할인 적용을 끼워넣는다. 티켓은 "최종 결제 금액 산정 직전"에 반영.
- **API 레이어**: 신규 도메인이므로 OpenAPI 자동생성 우선(`yarn generate:api`). 백엔드 스펙 확정 전에는 legacy axios(`/api/v1/`) + 타입 플레이스홀더로 훅을 스캐폴딩하고 **엔드포인트는 날조하지 않고 TODO 표기**.
- **권한**: 어드민 발급/집계는 `(admin)` 라우트 그룹에 두어 기존 `ROLE_ADMIN` 미들웨어 게이트를 그대로 상속(신규 인가 로직 불필요).
- **서버상태**: TanStack Query, queryKey 규약(`['builderTickets', ...]`) 준수. 사용 처리는 mutation + 관련 key invalidate.
- **정합성**: 티켓 사용은 결제 승인과 한 흐름으로 묶고, 멱등 처리로 이중 차감을 방지(중복 USED 전이 무효).

## Technical Approach

### Frontend Components

- **결제 적용 UI**: `(service)/payment` 내 "사용 가능한 빌더 티켓" 선택 영역 + 선택 시 금액 재계산 표시. 만료/대상외/사용완료는 사유와 함께 비활성.
- **마이페이지 보유 목록**: 보유 티켓(상태·유효기간·적용대상) 리스트 컴포넌트.
- **어드민 발급 화면**: `(admin)` 그룹. 할인 유형(FIXED/PERCENT/FREE)·값·유효기간·대상 코스 범위·캠페인명 입력 폼(React Hook Form + Zod).
- **어드민 집계 대시보드**: 캠페인별 발급/사용/전환율 표.
- **공통**: `cn()` className 합성, `@theme inline` 토큰만 사용, 에러는 Toast/inline(에러핸들러 재사용).

### Backend Services

- 신규 빌더 티켓 도메인 엔드포인트(발급/보유조회/적용·사용/캠페인집계) **미존재 → 신규 개발 필요**. 프론트는 확정 전까지 훅 내부에 `// TODO(builder-ticket API)` 플레이스홀더 유지.
- 결제는 기존 Toss 승인 엔드포인트 재사용. 할인 후 금액 검증은 백엔드 권위(프론트 계산은 표시용).

### Infrastructure

- 추가 인프라 없음. 기존 `NEXT_PUBLIC_TOSS_CLIENT_KEY`, axios 인터셉터(AUTH001 refresh), MutationCache 글로벌 에러 처리, 로그인 모달(401) 패턴 그대로 사용.

## Implementation Strategy

1. 타입/스키마(계약) 먼저 고정 → API 훅 스캐폴딩 → 화면(마이페이지/결제/어드민)을 병렬로 진행 → 결제 사용 처리 연동 → 엣지케이스/QA로 마감.
2. 백엔드 스펙 확정 전엔 플레이스홀더로 UI/상태를 완성하고, 스펙 확정 시 훅만 교체(화면 영향 최소화).

## Task Breakdown Preview

> 목표 ≤10개. `[P]` = 다른 태스크와 병렬 가능.

1. **티켓 도메인 타입 + Zod 스키마** — DTO 정렬, `toIssueRequest`/`toApplyRequest` transformer, `src/types/schemas/builder-ticket.schema.ts`. (기반)
2. **티켓 API 훅 스캐폴딩** — 발급/보유조회/적용·사용/집계 훅(`src/hooks/queries/builder-ticket-*.ts`), 백엔드 미정 시 TODO. (1 의존)
3. `[P]` **마이페이지 보유 티켓 목록 UI** — 보유 조회 훅 연결. (2 의존)
4. `[P]` **결제 페이지 티켓 적용 UI** — 적용 가능 필터 + 금액 재계산 표시. (2 의존)
5. **결제 사용 처리 연동** — USED 전이·멱등·실패 원복을 Toss 승인 흐름에 결합. (4 의존)
6. `[P]` **어드민 캠페인 발급 화면** — ROLE_ADMIN 폼. (2 의존)
7. **어드민 캠페인 집계 대시보드** — 발급/사용/전환율. (6 의존)
8. **엣지케이스·QA** — 만료/대상외/이중차감/원복 시나리오 검증. (3–7 통합)

병렬 지점: 1→2 직렬, 이후 **3·4·6 동시 진행 가능**(서로 다른 화면 표면). 5는 4, 7은 6 의존.

## Dependencies

- **백엔드**: 빌더 티켓 엔드포인트(발급/조회/적용/집계) 신규 — 태스크 2의 실제 연결 차단요소.
- **결제**: 기존 Toss 결제 모듈 + `(service)/payment`.
- **권한**: `/admin/*` `ROLE_ADMIN` 미들웨어.
- **추천 시스템**: 자동 발급 트리거(추천 성사 전환 시점 정의) — 본 에픽은 어드민/수동 발급 우선, 자동 발급은 추천 스펙 확정 후.

## Success Criteria (Technical)

- 캠페인별 발급→사용 전환율, 쿠폰 적용 결제 비율을 데이터로 산출 가능.
- 결제 적용 시 금액 재계산이 백엔드 검증과 일치(프론트 표시값 ≠ 승인 금액 불일치 0건).
- 이중 차감/오적용 0건(멱등 보장).
- 신규 코드가 `cn()`/토큰/에러핸들러/쿼리키 규약을 위반하지 않음(lint/typecheck 통과).

## Estimated Effort

- 8 태스크, 그중 3개 병렬 가능. 기반(1–2) 고정 후 화면 3종 병렬이면 캘린더 시간 단축.
- 최대 불확실성은 **백엔드 스펙 확정 시점**(태스크 2의 실연결). UI/상태는 플레이스홀더로 선행 가능.

## Tasks Created
- [ ] 001.md - 티켓 도메인 타입 + Zod 스키마 (parallel: true)
- [ ] 002.md - 티켓 API 훅 스캐폴딩 (parallel: false)
- [ ] 003.md - 마이페이지 보유 티켓 목록 UI (parallel: true)
- [ ] 004.md - 결제 페이지 티켓 적용 UI (parallel: true)
- [ ] 005.md - 결제 사용 처리 연동 (parallel: false)
- [ ] 006.md - 어드민 캠페인 발급 화면 (parallel: true)
- [ ] 007.md - 어드민 캠페인 집계 대시보드 (parallel: true)
- [ ] 008.md - 엣지케이스·QA (parallel: false)

Total tasks: 8
Parallel tasks: 5
Sequential tasks: 3
Estimated total effort: 50 hours
