# 예약상담 자동 완료 서버 반영 요청

작성일: 2026-03-14

## 배경

현재 예약상담(`simple / in_depth / offline`)은 멘토가 수락 후 세션이 확정되면
`SCHEDULED` 상태로 유지된다.

제품 요구는 아래와 같다.

1. 확정된 예약상담 시간이 지나면 별도 수동 조작 없이 자동으로 완료 처리되어야 한다.
2. 멘티는 `나의 멘토링`에서 예약완료가 끝난 뒤 `상담 완료` 상태로 이동한 것을 볼 수 있어야 한다.
3. 멘토도 운영관리에서 지난 예약이 계속 `SCHEDULED` 로 남아 있지 않아야 한다.

## 현재 문제

현재 프론트 일부 화면은 `session.endsAt < now` 를 기준으로 임시로 완료처럼 보이게 처리하고 있다.

이 방식은 아래 문제가 있다.

- 서버 source of truth와 화면 상태가 어긋날 수 있다.
- 관리자/멘토/멘티 화면이 같은 시점에 서로 다른 상태를 볼 수 있다.
- 후기 가능 여부, 완료 집계, 운영 기록이 서버 기준으로 닫히지 않는다.

즉, 자동 완료는 프론트 계산이 아니라 서버 lifecycle 상태 전이로 처리되어야 한다.

## 요청 사항

신규 endpoint 추가보다, 기존 session lifecycle에 `SYSTEM 자동 완료` 규칙을 넣어달라.

### 대상 도메인

- 예약상담 세션 (`simple`, `in_depth`, `offline`)
- 상태: `SCHEDULED -> COMPLETED`

### 서버 규칙

아래 조건을 모두 만족하면 자동 완료 처리:

1. `session.status = SCHEDULED`
2. `session.startsAt`, `session.endsAt` 가 존재
3. 현재 시각이 `endsAt` 이후
4. `issueType` 이 `MENTOR_CANCELLED`, `MENTEE_CANCELLED`, `MENTOR_NO_SHOW`, `MENTEE_NO_SHOW` 가 아님

자동 완료 시:

- `session.status = COMPLETED`
- `issueType = NONE` 유지 또는 명시
- 운영 메모가 필요하면 `SYSTEM_AUTO_COMPLETED` 성격의 내부 기록 남김

## 권장 구현 방식

### 방법 A. 스케줄러/배치

- 1분 또는 5분 주기 scheduler가 `SCHEDULED` 세션 중 `endsAt <= now` 인 건을 찾아 `COMPLETED` 로 전환

장점:

- 구현이 단순하다.
- 조회 endpoint에 부하를 덜 준다.

### 방법 B. 조회 시 보정 + 배치 병행

- 조회 시점에도 `endsAt <= now` 인 `SCHEDULED` 세션을 감지해 보정하고,
- 배치가 최종 상태를 정리

장점:

- 배치 지연이 있어도 사용자가 늦게 보지 않는다.

권장:

- 운영 일관성을 위해 배치 또는 scheduler 기반이 메인이고,
- 필요하면 조회 보정을 보조로 두는 방식이 가장 안전하다.

## 영향 받는 API

아래 응답은 자동 완료가 반영된 상태를 내려야 한다.

- `GET /api/v1/mentoring/me/dashboard`
- `GET /api/v1/mentoring/requests/{requestId}`
- `GET /api/v1/mentoring/me/mentor-workspace`
- `GET /api/v1/admin/mentoring/overview`
- `GET /api/v1/admin/mentoring/mentors`
- `GET /api/v1/admin/mentoring/mentors/{mentorId}`

## 프론트 기대 동작

서버가 자동 완료를 반영하면 프론트는 아래처럼 동작할 수 있다.

1. 멘티 `나의 멘토링`에서 해당 예약형 상담이 `상담 완료` 단계로 이동
2. 후기 작성 가능 여부가 서버 기준으로 `true`
3. 멘토 운영관리에서도 해당 세션이 지난 예약이 아니라 완료 이력로 보임

## 검증 시나리오

1. 멘티가 예약상담 신청
2. 멘토가 수락 후 일정 확정
3. 세션 종료 시각(`endsAt`) 경과
4. 서버가 별도 멘토 액션 없이 `COMPLETED` 로 전환
5. 멘티 대시보드에서 `상담 완료` 상태 확인
6. 후기 작성 가능 여부가 `true`
7. 멘토 운영관리에서도 완료 상태 확인
