# 멘티 예약상담 취소 API 권한 요청서

작성일: 2026-03-14

## 배경

현재 프론트에는 예약상담 세션 취소 API가 이미 연결되어 있다.

- `POST /api/v1/mentoring/sessions/{sessionId}/cancel`

하지만 실제 제품 요구는 아래와 같다.

1. 취소는 `예약형 상담(simple / in_depth / offline)` 에서만 가능
2. `note` 상담은 세션 개념이 없으므로 이 API 대상이 아님
3. 멘토뿐 아니라 멘티 본인도 확정된 예약을 취소할 수 있어야 함
4. 멘티가 취소하면 서버 기록은 항상 `MENTEE_CANCELLED` 로 남아야 함

현재 프론트는 멘티 상세 화면에서 같은 endpoint를 재사용해 취소를 호출하려고 한다.

로컬 검증 결과:

- 검증일: 2026-03-14
- 계정: `memberId=2` (멘티), `mentorId=9002`
- 대상 세션: `requestId=22`, `sessionId=5`
- 실제 응답: `POST /api/v1/mentoring/sessions/5/cancel` -> `403 Forbidden`

추가 검증:

- 같은 세션에 대해 멘토 계정 `memberId=101` 이 `MENTOR_CANCELLED` 로 호출하면 `200 OK`
- 즉, 현재 endpoint 자체는 동작하지만 멘티 actor 권한만 막혀 있다.

즉, 프론트 경로는 이미 연결되어 있지만 현재 백엔드는 멘티 actor를 아직 허용하지 않는다.

## 요청 사항

기존 endpoint를 유지하되, actor 권한과 business rule을 아래처럼 보강해달라.

### 대상 API

- `POST /api/v1/mentoring/sessions/{sessionId}/cancel`

### 멘티 취소 허용 규칙

- 로그인 사용자가 해당 request의 멘티 본인일 때 호출 허용
- 대상 세션이 본인 예약상담 세션일 때만 허용
- 대상 method가 `NOTE` 면 거부
- 이미 `CANCELLED` 또는 `COMPLETED` 상태면 거부

### 서버 저장 규칙

멘티가 호출한 경우:

- request body에 다른 값이 와도 서버는 `issueType = MENTEE_CANCELLED` 로 강제
- reason은 멘티가 입력한 취소 사유로 저장

멘토/관리자 호출 규칙은 기존처럼 유지해도 된다.

## 권장 응답

성공:

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T14:20:00Z",
  "message": "OK",
  "content": {
    "sessionId": 21,
    "status": "CANCELLED",
    "issueType": "MENTEE_CANCELLED"
  }
}
```

실패 예시:

- `409 Conflict`: 이미 종료/취소된 세션
- `403 Forbidden`: 본인 예약이 아님
- `400 Bad Request`: note 상담 등 취소 불가 방식

## 프론트 기대 동작

- 멘티 상세 화면에서 `예약 취소` 버튼 노출
- 사유 입력 후 취소
- 성공 시 나의 멘토링 상세/목록이 `CANCELLED` 로 갱신
- 운영 상태는 `멘티 취소` 로 보임

## 검증 시나리오

1. 멘티가 예약상담 신청
2. 멘토가 수락 후 일정 확정
3. 멘티가 상세 화면에서 취소 사유 입력 후 취소
4. 서버가 `MENTEE_CANCELLED` 로 저장
5. 멘티 상세 화면 상태가 `CANCELLED` 로 변경
