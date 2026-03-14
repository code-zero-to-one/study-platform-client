# 멘토 공개 가능 시간 API 요청서

작성일: 2026-03-14

## 배경

현재 멘토링 신청 화면에서 멘티가 보는 시간 선택지는
멘토가 등록한 주간 가능 시간만 기준으로 계산한다.

하지만 이미 예약이 확정된 상담 시간(`SCHEDULED`)은 공개 apply 화면에서
제외되지 않고, 멘토가 수락/일정 확정 단계에서만 충돌을 막고 있다.

이 구조는 멘티 입장에서 잘못된 시간도 선택 가능하게 만들어 UX가 좋지 않다.

프론트는 아래 정책으로 바꾸려 한다.

1. 멘티는 멘토가 열어둔 시간만 선택할 수 있어야 한다.
2. 그중 이미 예약된 시간은 처음부터 선택지에 나오면 안 된다.
3. 공개 신청 화면은 멘토 내부 워크스페이스 API를 사용하지 않는다.

즉, 멘티 공개 apply 화면용 availability API가 별도로 필요하다.

## 요청 API

### `GET /api/v1/mentors/{mentorId}/availability`

역할:

- 공개 멘토 상세/신청 화면에서 특정 날짜의 실제 예약 가능 시간을 조회한다.
- 멘토가 설정한 주간 가능 시간과 기존 예약 세션을 서버에서 함께 계산한다.

Query:

- `method`: `simple | in_depth | offline`
- `date`: `YYYY-MM-DD`

주의:

- `note`는 일정 선택이 없는 방식이므로 이 API 대상이 아니다.
- 프론트 내부 method는 `deep`를 쓰지만, 서버 query param 계약은
  기존 v2 spec과 맞춰 `in_depth`를 사용한다.

## 서버 계산 규칙

응답 슬롯은 아래 조건을 모두 만족한 시간만 내려야 한다.

1. 멘토의 해당 요일 주간 가능 시간에 포함될 것
2. 해당 상담 방식의 duration 규칙에 맞을 것
3. 같은 멘토의 기존 `SCHEDULED` 세션과 겹치지 않을 것
4. 과거 시간이 아닐 것
5. 신청 가능 최소 리드타임 정책이 있다면 그 정책도 반영할 것

세션 충돌 기준:

- 같은 멘토의 예약형 세션(`simple`, `in_depth`, `offline`) 중
  `status = SCHEDULED` 인 세션만 막는다.
- `CANCELLED`, `COMPLETED` 세션은 막지 않는다.

## 응답 예시

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T12:05:00Z",
  "message": "OK",
  "content": {
    "mentorId": 9002,
    "date": "2026-03-20",
    "method": "simple",
    "timezone": "Asia/Seoul",
    "durationMinutes": 15,
    "slots": [
      {
        "startTime": "19:00",
        "endTime": "19:15",
        "label": "19:00~19:15"
      },
      {
        "startTime": "19:30",
        "endTime": "19:45",
        "label": "19:30~19:45"
      }
    ]
  }
}
```

## 응답 필드 의미

- `mentorId`: 조회 대상 멘토 ID
- `date`: 조회 기준 날짜
- `method`: 조회한 상담 방식
- `timezone`: 계산 기준 timezone
- `durationMinutes`: 해당 방식의 실제 상담 길이
- `slots[]`: 멘티가 지금 바로 선택 가능한 시간

## 오류 처리 권장

### 잘못된 방식

- `method = note`
- 지원하지 않는 method 문자열

권장:

- `400 Bad Request`

### 멘토를 찾을 수 없음

권장:

- `404 Not Found`

## 프론트 기대 동작

프론트는 날짜를 선택하면 이 API만 기준으로 시간 버튼을 그린다.

- `slots.length > 0`: 버튼 목록 노출
- `slots.length = 0`: `선택한 날짜에 가능한 시간이 없습니다.` 노출
- 오류: `가능 시간을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.` 노출

즉, 기존의 로컬 계산 fallback 대신 서버 계산 결과를 source of truth로 사용한다.

## 검증 시나리오

1. 멘토가 목요일 `19:00`, `19:30`, `20:00` 슬롯을 열어둔다.
2. 기존 예약 세션 하나가 `2026-03-20 19:30~19:45` 로 존재한다.
3. `GET /api/v1/mentors/9002/availability?method=simple&date=2026-03-20`
4. 응답에는 `19:30~19:45` 가 없어야 한다.
5. 멘티 신청 화면에서도 같은 슬롯이 보이지 않아야 한다.
