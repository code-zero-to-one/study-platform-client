# 멘토링 후기 API 요청서

작성일: 2026-03-14

## 배경

현재 프론트는 멘토링 후기와 관련해 아래 두 계약을 이미 전제로 사용하고 있다.

- `PUT /api/v1/mentoring/requests/{requestId}/review`
- `GET /api/v1/admin/mentoring/mentors/{mentorId}` 의 `reviewsPage`

하지만 실제 제품 요구는 여기서 한 단계 더 필요하다.

1. 멘티가 `완료 상세` 화면에서 바로 후기 작성과 기존 후기 조회를 할 수 있어야 한다.
2. 멘토가 본인이 받은 후기 목록을 별도 사용자 API로 조회할 수 있어야 한다.
3. 관리자 상세의 `reviewsPage` 와 사용자/멘토 후기 데이터의 필드 의미가 서로 다르지 않아야 한다.

즉, 지금 필요한 것은 후기 도메인의 읽기/쓰기 계약을 lifecycle 기준으로 다시 명확히 정리하는 것이다.

## 현재 부족한 점

### 1. 후기 쓰기 응답이 너무 얇다

현재 초안 문서의 `PUT /mentoring/requests/{requestId}/review` 응답은 아래 정도만 정의되어 있다.

```json
{
  "reviewId": 301,
  "updated": false
}
```

이 응답만으로는 프론트가 저장 직후 아래를 안정적으로 갱신하기 어렵다.

- 완료 상세의 후기 영역
- 후기 작성 가능 여부
- 멘토가 받은 후기 목록

즉, 저장 성공 후 다시 여러 API를 refetch 하지 않아도 될 정도의 review payload가 필요하다.

### 2. 멘티 완료 상세의 후기 조회 계약이 충분히 명시되어 있지 않다

프론트는 현재 `GET /mentoring/requests/{requestId}` 상세 응답의 `review` 와
`reviewEligibility` 를 사용해 완료 상세에서 후기 쓰기/조회 UI를 전환한다.

따라서 이 endpoint는 단순 request/session 조회가 아니라,
후기 조회의 source of truth 역할도 명확히 해야 한다.

### 3. 멘토용 후기 목록 API가 없다

관리자는 `admin mentor detail`의 `reviewsPage` 로 멘토별 후기 목록을 볼 수 있지만,
멘토 본인이 자기 후기 목록을 보는 사용자 API는 아직 없다.

제품 요구상 멘토는 관리자 페이지가 아니라 본인 멘토링 워크스페이스 또는 별도 후기 화면에서
받은 후기를 조회할 수 있어야 한다.

## 목표

후기 API는 아래 3가지를 만족해야 한다.

1. 멘티 완료 상세는 기존 `GET /mentoring/requests/{requestId}` 하나로 후기 조회 가능
2. 멘티 작성/수정은 기존 `PUT /mentoring/requests/{requestId}/review` 유지
3. 멘토 수신 후기 목록은 신규 `GET /mentoring/me/reviews/received` 로 제공

## 공통 리소스

후기 관련 응답은 아래 공통 리소스를 사용한다.

### `MentoringReviewResource`

```json
{
  "id": 301,
  "mentorId": 9002,
  "requestId": 19,
  "sessionId": 7,
  "menteeMemberId": 2,
  "menteeName": "테스트일반유저",
  "method": "simple",
  "rating": 5,
  "recommendation": "RECOMMEND",
  "content": "실제 포트폴리오 수정 포인트까지 바로 적용할 수 있었습니다.",
  "createdAt": "2026-03-14T04:30:00Z",
  "updatedAt": "2026-03-14T04:30:00Z"
}
```

주의:

- `method` 는 lifecycle 규칙대로 `note | simple | in_depth | offline`
- note 상담 후기는 `sessionId = null` 허용
- 관리자 `reviewsPage.items[]` 도 같은 리소스를 재사용

### `MentoringReviewEligibilityResource`

```json
{
  "canReview": true,
  "reason": null,
  "isCompleted": true
}
```

규칙:

- 예약형: `session.status = COMPLETED` 일 때만 `canReview = true`
- note형: `request.status = CLOSED` 일 때만 `canReview = true`
- 이미 후기가 있으면 `canReview = true` 를 유지할지 `false` 로 닫을지는 서버 정책 선택이 가능하다.

권장:

- upsert 정책을 유지하므로 기존 후기가 있어도 `canReview = true`
- 대신 `reason` 에 `기존 후기를 수정할 수 있습니다.` 같은 문구를 줄 수 있다.

## 요청 사항

### 1. 기존 `GET /mentoring/requests/{requestId}` 후기 읽기 계약 명확화

이 endpoint는 계속 유지하되, 완료 상세에서 후기 조회 source of truth 역할을 명확히 해달라.

### 성공 응답 예시

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T13:00:00Z",
  "message": "OK",
  "content": {
    "mentor": {},
    "request": {},
    "session": {},
    "review": {
      "id": 301,
      "mentorId": 9002,
      "requestId": 19,
      "sessionId": 7,
      "menteeMemberId": 2,
      "menteeName": "테스트일반유저",
      "method": "simple",
      "rating": 5,
      "recommendation": "RECOMMEND",
      "content": "실제 포트폴리오 수정 포인트까지 바로 적용할 수 있었습니다.",
      "createdAt": "2026-03-14T04:30:00Z",
      "updatedAt": "2026-03-14T04:30:00Z"
    },
    "reviewEligibility": {
      "canReview": true,
      "reason": "기존 후기를 수정할 수 있습니다.",
      "isCompleted": true
    }
  }
}
```

필수 규칙:

- 후기 없으면 `review = null`
- 후기 가능 여부는 항상 `reviewEligibility` 로 함께 응답
- 완료되지 않은 request라도 `reviewEligibility` 는 빠지지 않고 내려야 함

### 2. 기존 `PUT /mentoring/requests/{requestId}/review` 쓰기 계약 보강

endpoint 자체는 유지하되, 응답을 더 풍부하게 해달라.

### Request

```json
{
  "rating": 5,
  "recommendation": "RECOMMEND",
  "content": "실제 포트폴리오 수정 포인트까지 바로 적용할 수 있었습니다."
}
```

### 권장 Response

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T13:01:00Z",
  "message": "OK",
  "content": {
    "reviewId": 301,
    "updated": false,
    "review": {
      "id": 301,
      "mentorId": 9002,
      "requestId": 19,
      "sessionId": 7,
      "menteeMemberId": 2,
      "menteeName": "테스트일반유저",
      "method": "simple",
      "rating": 5,
      "recommendation": "RECOMMEND",
      "content": "실제 포트폴리오 수정 포인트까지 바로 적용할 수 있었습니다.",
      "createdAt": "2026-03-14T04:30:00Z",
      "updatedAt": "2026-03-14T04:30:00Z"
    },
    "reviewEligibility": {
      "canReview": true,
      "reason": "기존 후기를 수정할 수 있습니다.",
      "isCompleted": true
    }
  }
}
```

최소 규칙:

- `reviewId`, `updated` 는 유지 가능
- 여기에 `review` 전체 payload와 최신 `reviewEligibility` 를 같이 내려달라
- 저장 직후 `GET /mentoring/requests/{requestId}` 와 의미가 어긋나지 않아야 한다

검증 규칙:

- 해당 request의 멘티 본인만 호출 가능
- 완료 전 request/session 이면 `409 Conflict`
- 멘토 본인, 제3자는 `403 Forbidden`

### 3. 신규 `GET /mentoring/me/reviews/received`

목적:

- 멘토가 본인이 받은 후기 목록을 조회
- 관리자 전용 `reviewsPage` 의 사용자 버전

인증:

- 로그인 사용자
- 본인 mentor 계정 보유 시에만 성공

Query:

- `page?: number` 기본 `0`
- `size?: number` 기본 `20`
- `method?: note | simple | in_depth | offline`
- `recommendation?: RECOMMEND | NOT_RECOMMEND`

### Response

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-14T13:05:00Z",
  "message": "OK",
  "content": {
    "items": [
      {
        "id": 301,
        "mentorId": 9002,
        "requestId": 19,
        "sessionId": 7,
        "menteeMemberId": 2,
        "menteeName": "테스트일반유저",
        "method": "simple",
        "rating": 5,
        "recommendation": "RECOMMEND",
        "content": "실제 포트폴리오 수정 포인트까지 바로 적용할 수 있었습니다.",
        "createdAt": "2026-03-14T04:30:00Z",
        "updatedAt": "2026-03-14T04:30:00Z"
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrevious": false
  }
}
```

정렬 규칙:

- 기본 `createdAt desc`

권장:

- admin detail `reviewsPage.items[]` 와 같은 shape 재사용
- 서버 내부 구현도 `mentoring_review` 기준 query를 공용화

## 관리자 API와의 정합성

현재 존재하는 관리자 상세 응답의 `reviewsPage` 는 아래 원칙으로 맞춰달라.

1. `reviewsPage.items[]` 는 `MentoringReviewResource` 와 동일한 shape
2. `GET /mentoring/me/reviews/received` 와 필드 의미가 다르지 않음
3. 관리자 상세와 멘토 본인 목록이 같은 review를 서로 다른 JSON 구조로 내려주지 않음

즉, 관리자용과 멘토용은 권한만 다르고 resource shape는 같게 유지하는 것이 좋다.

## 권장 에러 규칙

### `PUT /mentoring/requests/{requestId}/review`

- `403 Forbidden`: 해당 멘티 본인이 아님
- `404 Not Found`: request 없음
- `409 Conflict`: 아직 후기 작성 가능 상태가 아님

### `GET /mentoring/me/reviews/received`

- `403 Forbidden`: 멘토 계정이 아님
- `200 OK + empty page`: 받은 후기 없음

## 프론트 기대 동작

### 멘티 완료 상세

1. `GET /mentoring/requests/{requestId}` 호출
2. `review = null`, `reviewEligibility.canReview = true` 면 작성 폼 노출
3. `PUT /mentoring/requests/{requestId}/review` 성공 시 즉시 작성 결과 표시
4. 새로고침 후에도 같은 상세 API에서 동일 review 재조회

### 멘토 후기 목록

1. `GET /mentoring/me/reviews/received` 호출
2. 받은 후기 목록을 최신순으로 노출
3. method/recommendation 필터 가능
4. 관리자 상세의 후기와 같은 필드 의미로 표시

## 검증 시나리오

1. 멘티가 note 또는 예약형 상담 완료
2. `GET /mentoring/requests/{requestId}` 에서 `review = null`, `reviewEligibility.canReview = true` 확인
3. 멘티가 `PUT /mentoring/requests/{requestId}/review` 호출
4. 응답에서 `review` 전체 payload와 `updated` 확인
5. 다시 `GET /mentoring/requests/{requestId}` 호출 시 동일 review 조회
6. 멘토가 `GET /mentoring/me/reviews/received` 호출 시 해당 후기 확인
7. 관리자 `GET /admin/mentoring/mentors/{mentorId}` 의 `reviewsPage.items[]` 와 필드 의미가 동일함 확인
