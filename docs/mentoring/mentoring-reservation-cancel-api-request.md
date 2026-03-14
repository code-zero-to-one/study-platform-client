# 멘토링 예약 취소 API 보강 요청서

작성일: 2026-03-14

## 배경

현재 예약 취소 API 자체는 이미 존재한다.

- `POST /api/v1/mentoring/sessions/{sessionId}/cancel`

프론트도 이 endpoint를 호출하는 mutation은 이미 갖고 있다.
하지만 실제 제품 요구 기준으로는 두 가지가 비어 있다.

1. 멘티 본인이 자신의 예약상담을 취소할 수 있어야 한다.
2. 예약 취소는 `session` 이 있는 예약상담(`simple`, `in_depth`, `offline`)에만 허용되어야 한다.

쪽지상담은 session 기반이 아니므로 취소 대상이 아니다.

## 요청 사항

신규 endpoint 추가보다, 기존 cancel endpoint의 권한/비즈니스 규칙을 아래처럼 명확히 해주면 된다.

### 대상 API

- `POST /api/v1/mentoring/sessions/{sessionId}/cancel`

### 허용 actor

- 해당 멘토
- 해당 멘티
- 관리자

### 허용 대상

- `session.method IN (SIMPLE, IN_DEPTH, OFFLINE)`
- `session.status = SCHEDULED`

### 비허용 대상

- `request.method = NOTE`
- 이미 `CANCELLED`
- 이미 `COMPLETED`

## 요청 body

멘티가 취소할 때는 아래처럼 호출한다.

```json
{
  "issueType": "MENTEE_CANCELLED",
  "reason": "개인 일정 변경으로 예약 시간을 맞추기 어려워졌습니다."
}
```

멘토가 취소할 때는 기존처럼:

```json
{
  "issueType": "MENTOR_CANCELLED",
  "reason": "멘토 개인 사정으로 해당 시간 진행이 어렵습니다."
}
```

## 응답 예시

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T16:20:00Z",
  "message": "OK",
  "content": {
    "sessionId": 42,
    "status": "CANCELLED",
    "issueType": "MENTEE_CANCELLED",
    "updatedAt": "2026-03-14T16:20:00Z"
  }
}
```

## 서버 규칙

1. 멘티가 취소하는 경우 `issueType` 은 `MENTEE_CANCELLED` 로 고정하거나, 다른 값이 오면 거부한다.
2. 멘토가 취소하는 경우 `issueType` 은 `MENTOR_CANCELLED` 이어야 한다.
3. note 상담은 session 이 없으므로 이 API 대상이 아니다.
4. 취소 후 `GET /mentoring/me/dashboard`, `GET /mentoring/requests/{requestId}`, `GET /mentoring/me/mentor-workspace` 에 모두 취소 상태가 반영되어야 한다.

## 프론트 기대 동작

- 멘티 상세 화면: `CONFIRMED` 예약상담에만 `예약 취소` 버튼 노출
- 멘토 상세 화면: `SCHEDULED` 예약상담에만 `일정 취소` 버튼 노출
- note 상담: 취소 버튼 없음

## 검증 시나리오

1. 멘티가 예약상담을 신청하고 멘토가 일정을 확정한다.
2. 멘티가 `POST /sessions/{sessionId}/cancel` with `MENTEE_CANCELLED` 호출
3. 서버가 `200` 과 `CANCELLED` 반환
4. 멘티 상세/목록에서 상태가 `CANCELLED` 로 보인다.
5. 멘토 워크스페이스에서도 같은 세션이 취소 상태로 보인다.
