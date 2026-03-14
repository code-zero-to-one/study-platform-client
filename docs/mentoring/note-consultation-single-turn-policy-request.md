# 쪽지상담 단건 응답 정책 서버 반영 요청

작성일: 2026-03-14

## 배경

현재 쪽지상담 정책은 다음 기준으로 정리됐다.

- 결제 1회당 쪽지상담 1건 생성
- 멘티의 최초 질문은 `POST /api/v1/mentoring/requests` 에서 생성
- 이후 같은 요청(`requestId`) 안에서는 멘토 답변 1회만 허용
- 추가 질문이 필요하면 새 쪽지상담을 다시 결제해서 새 `requestId`를 생성

프론트는 이미 이 정책에 맞춰 멘티 추가 질문 composer를 제거했고,
멘토 답변 도착 후에는 `추가 질문은 새 쪽지상담 결제가 필요합니다.` 안내를 노출한다.

## 현재 서버 동작 문제

2026-03-14 로컬 검증에서 아래 요청이 `200 OK`로 성공했다.

- `POST /api/v1/mentoring/requests/{requestId}/messages`
- actor: 멘티
- request.method: `NOTE`
- 조건: 이미 멘토 답변이 1회 등록된 상태

이 상태는 현재 제품 정책과 맞지 않는다.

## 요청 사항

신규 endpoint 추가가 아니라, 기존 endpoint의 business rule을 강화해야 한다.

### 대상 API

- `POST /api/v1/mentoring/requests/{requestId}/messages`

### 서버 규칙

`request.method = NOTE` 인 경우:

1. 멘티는 이 endpoint로 메시지를 추가 생성할 수 없다.
2. note 상담의 멘티 질문은 오직 `POST /api/v1/mentoring/requests` 생성 시점에만 허용한다.
3. 멘토만 답변 생성이 가능하다.
4. `request.status IN (CLOSED, REJECTED)` 인 경우에는 멘토도 새 메시지를 생성할 수 없다.

### 수정 API 규칙

- `PATCH /api/v1/mentoring/requests/{requestId}/messages/{messageId}`
- 멘토 본인의 기존 답변 수정만 허용한다.
- 멘티 수정은 허용하지 않는다.
- `CLOSED`, `REJECTED` 상태에서는 수정도 막는다.

## 권장 응답

멘티가 추가 질문을 시도하면 `409 Conflict`를 권장한다.

예시:

```json
{
  "statusCode": 409,
  "timestamp": "2026-03-14T04:38:41Z",
  "message": "추가 질문은 새 쪽지상담 결제가 필요합니다."
}
```

`400 Bad Request`도 가능하지만, 이미 생성된 request의 현재 상태/정책과 충돌하는 요청이라는 점에서 `409`가 더 읽힌다.

## 프론트 기대 동작

서버가 위 정책으로 막히면 프론트는 기존 toast/error boundary로 바로 처리 가능하다.

- 멘티 UI: 이미 composer 제거 완료
- 비정상 호출/API 재시도: 서버 message를 그대로 toast로 노출

## 검증 시나리오

1. 멘티가 note request 생성
2. 멘토가 첫 답변 1회 등록
3. 멘티가 `POST /messages` 재시도
4. 서버가 `409` 반환
5. 멘토가 `POST /requests/{requestId}/close` 호출
6. 이후 멘토 `POST /messages` 및 `PATCH /messages/{messageId}` 도 모두 거부
