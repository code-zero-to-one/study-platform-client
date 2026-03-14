# 미연결 기능 백엔드 API 명세서

작성일: 2026-03-13

## 1. 목적

이 문서는 현재 프론트엔드에서 실제 서비스 라우트까지 연결되어 있으나,
백엔드 연동이 비어 있거나 로컬 store/mock/fallback으로 대체된 영역을 기준으로
필요한 API를 정리한 문서다.

문서 범위는 아래 2개다.

- 멘토링 신청 이후 전체 플로우
- 관리자 멘토링 운영/심사

`/one-on-one`은 현재 mock 화면이지만, 신규 API를 반드시 만들기보다
기존 `hall-of-fame`, `archive`, `balance-games` API 재사용이 우선이다.

---

## 2. 현재 상태 요약

| 도메인 | 현재 프론트 상태 | 백엔드 상태 | 필요한 조치 |
| --- | --- | --- | --- |
| 멘토링 목록/상세/등록 | 일부 서버 조회 + 404 fallback | 부분 연결 | fallback 제거용 안정화 API 필요 |
| 멘토링 신청 | Zustand `createRequest()` 로컬 생성 | 미연결 | 신청 생성 API 필요, 결제 API는 추후 분리 |
| 나의 멘토링/상세 | store의 `requestsByMentor`, `sessionsByMentor` 조합 | 미연결 | 내 신청 목록/상세 조회 API 필요 |
| 쪽지상담 | `ensureNoteDemoData()`로 demo conversation 삽입 | 미연결 | sent/received note 목록 + 메시지 전송 API 필요 |
| 멘토 운영 관리 | 수락/거절/일정변경/노쇼/완료 모두 local store | 미연결 | mentor command API 필요 |
| 멘토링 후기 | `submitReview()` local store 저장 | 미연결 | 후기 등록/수정 API 필요 |
| 관리자 멘토링 | overview/screening/operation 모두 local store | 미연결 | admin overview + screening/operation update API 필요 |
| `/one-on-one` | page 자체가 mock 데이터 사용 | 재사용 가능 API 이미 존재 | 신규 API 필수 아님 |

### 2.1 API 총 개수 재정리

기준을 섞지 않기 위해 "이미 서버에 존재하는 멘토링 API"와
"이번에 추가로 필요한 API"를 분리해서 센다.

#### 이미 존재하는 멘토링 API: 8개

생성된 OpenAPI 문서 `src/api/openapi/docs/MentoringApi.md` 기준:

- `POST /mentors/me/intro-images/upload-url`
- `GET /mentors/{mentorId}`
- `GET /mentors/onboarding/entry`
- `GET /mentors`
- `GET /mentors/registration/options`
- `GET /mentors/me`
- `POST /mentors/onboarding/entry/seen`
- `PUT /mentors/me`

즉, 현재 서버의 `MentoringApi` 범위는 "멘토 프로필/목록/내 설정/온보딩"까지다.

#### 추가로 필요한 멘토링 관련 API: 15개

- 사용자/멘토 운영 플로우: 12개
- 관리자 멘토링 API: 3개

#### 현재 구현 범위 기준 합계

- 신규 필수 API 총합: 15개
  - 멘토링 15
- Optional API: 1개
  - `GET /one-on-one/dashboard`

#### 결제 API: 추후 범위 2개

- `POST /mentoring/payments/toss/confirm`
- `POST /mentoring/requests/{requestId}/payment-confirmations/manual-transfer`

### 2.2 기존 멘토링 스펙과의 정합성 재점검

기존 생성 스펙을 기준으로 보면 아래 4개는 유지해야 한다.

- 응답 envelope는 `{ statusCode, timestamp, content, message }`를 유지한다.
- 목록 페이지네이션은 `page` 0-based, `size`를 사용한다.
- 멘토 프로필/설정 리소스는 계속 `/mentors/*` 계열을 유지한다.
- 새로 필요한 신청/세션/후기/운영 API는 성격이 다르므로 `/mentors/*`에 억지로 넣지 않고 별도 lifecycle 리소스로 분리한다.

이 문서의 신규 API는 위 기준에 맞춰 `멘토 프로필 API 확장`이 아니라
`멘토링 lifecycle API 추가`로 해석해야 한다.

---

## 3. 공통 규칙

### 3.1 Base URL

- Base path: `/api/v1`

### 3.2 공통 응답 envelope

기존 프론트 패턴에 맞춰 아래 envelope를 유지한다.

```json
{
  "statusCode": 200,
  "timestamp": "2026-03-13T10:15:30Z",
  "content": {},
  "message": "OK"
}
```

### 3.3 페이지네이션

신규 멘토링 API는 `page` 0-based, `size` 사용을 권장한다.

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 120,
  "totalPages": 6,
  "hasNext": true,
  "hasPrevious": false
}
```

### 3.4 날짜/시간

- 날짜만 필요한 경우: `YYYY-MM-DD`
- 시각 포함 값: ISO-8601 UTC 문자열
- 세션 시간, 메시지 생성 시각, 심사/운영 조치 시각은 모두 ISO-8601 UTC로 통일

### 3.5 인증/권한

- 멘티용 API: 로그인 사용자
- 멘토용 API: 로그인 사용자 + 본인 멘토 리소스 접근 가능
- 관리자 API: `ROLE_ADMIN`

### 3.6 권장 enum

현재 프론트 store 기준 enum은 아래다.

- `MentoringRequestStatus`: `PENDING | ACCEPTED | REJECTED`
- `MentoringSessionStatus`: `SCHEDULED | CANCELLED | COMPLETED`
- `MentoringSessionIssueType`: `NONE | MENTOR_CANCELLED | MENTEE_CANCELLED | MENTOR_NO_SHOW | MENTEE_NO_SHOW`

주의:

- 현재 문서의 1차 범위에서는 결제/환불 상태 enum을 다루지 않는다.
- 결제 기능 범위가 열리면 결제 API와 함께 `PaymentMode`, `PaymentStatus`,
  `RefundStatus`를 별도 문서로 다시 정의한다.

---

## 4. 공통 멘토링 리소스

아래 DTO는 여러 API에서 재사용한다.

### 4.1 `MentorSummaryResource`

```json
{
  "id": 101,
  "memberId": 4001,
  "nickname": "민재",
  "title": "백엔드/커리어 전환 실무형 멘토링",
  "role": "백엔드/서버 개발자",
  "imageUrl": "https://..."
}
```

### 4.2 `MentoringConversationMessageResource`

```json
{
  "id": "msg_123",
  "sender": "MENTEE",
  "content": "질문 본문",
  "createdAt": "2026-03-13T10:15:30Z"
}
```

### 4.3 `MentoringRequestResource`

```json
{
  "id": "request_123",
  "mentorId": 101,
  "method": "note",
  "menteeMemberId": 5001,
  "menteeName": "홍길동",
  "menteeRole": "ZERO-ONE 멘티",
  "requestedAt": "2026-03-13T10:15:30Z",
  "preferredDate": "2026-03-17",
  "preferredTime": "20:00",
  "requestTitle": "백엔드 포트폴리오 첨삭 요청",
  "requestMessage": "요청 본문",
  "requestContents": [],
  "attachedFileNames": ["resume.pdf"],
  "referenceLinks": ["https://portfolio.example"],
  "status": "PENDING",
  "decisionNote": null,
  "acceptedAt": null,
  "rejectedAt": null,
  "linkedSessionId": null,
  "conversation": []
}
```

### 4.4 `MentoringSessionResource`

```json
{
  "id": "session_123",
  "mentorId": 101,
  "requestId": "request_123",
  "menteeName": "홍길동",
  "method": "deep",
  "startsAt": "2026-03-17T11:00:00Z",
  "endsAt": "2026-03-17T12:00:00Z",
  "placeNote": "Google Meet 링크 사전 전달",
  "status": "SCHEDULED",
  "issueType": "NONE",
  "operationNote": null,
  "createdAt": "2026-03-13T10:15:30Z",
  "updatedAt": "2026-03-13T10:15:30Z"
}
```

### 4.5 `MentoringReviewResource`

```json
{
  "id": "review_123",
  "mentorId": 101,
  "requestId": "request_123",
  "sessionId": "session_123",
  "menteeMemberId": 5001,
  "menteeName": "홍길동",
  "method": "deep",
  "rating": 5,
  "recommendation": "RECOMMEND",
  "content": "정말 도움이 되었습니다.",
  "createdAt": "2026-03-18T09:00:00Z",
  "updatedAt": "2026-03-18T09:00:00Z"
}
```

---

## 5. 멘토링 API 명세

### 5.0 기존 `MentoringApi`와의 역할 분리

현재 서버의 `MentoringApi`는 멘토 디렉터리/상세/내 설정에 한정된다.

- 프로필/설정 조회/수정: `/mentors`, `/mentors/{mentorId}`, `/mentors/me`
- 온보딩/업로드 URL: `/mentors/onboarding/*`, `/mentors/me/intro-images/upload-url`

반면 이번 문서에서 추가하는 API는 아래 lifecycle 리소스다.

- 신청: `requests`
- 세션: `sessions`
- 후기: `review`
- 쪽지상담: `messages`, `note-consultations`
- 멘토 운영 화면 aggregate: `me/mentor-workspace`

따라서 path prefix는 `/mentoring/*`로 제안한다.
최종 네이밍이 `/mentoring/*`가 아니어도 괜찮지만,
기존 `/mentors/*`가 담당하는 프로필/설정 범위와는 명확히 분리되어야 한다.

### 5.1 `POST /mentoring/requests`

- 목적: 멘티가 멘토링 신청 생성
- 인증: 로그인 사용자
- 사용 화면:
  - `/mentoring/[id]/apply`

Request:

```json
{
  "mentorId": 101,
  "method": "note",
  "preferredDate": "2026-03-17",
  "preferredTime": "20:00",
  "requestTitle": "백엔드 포트폴리오 첨삭 요청",
  "requestMessage": "요청 본문",
  "requestContents": [],
  "attachedFileNames": ["resume.pdf"],
  "referenceLinks": ["https://portfolio.example"]
}
```

Response:

```json
{
  "requestId": "request_123",
  "request": {}
}
```

비고:

- 현재 1차 범위에서는 신청 생성까지만 다루고 결제 확정은 다루지 않는다.
- 결제 연동이 시작되면 신청 생성 응답에 `paymentPreparation` 블록을 다시 확장한다.

### 5.2 결제 API는 추후 범위

- 현재 구현 범위에서는 멘토링 결제 API를 포함하지 않는다.
- 아래 2개 endpoint는 결제 기능 착수 시점에 별도 스펙으로 분리한다.

- `POST /mentoring/payments/toss/confirm`
- `POST /mentoring/requests/{requestId}/payment-confirmations/manual-transfer`

### 5.3 `GET /mentoring/me/dashboard`

- 목적: 멘티 기준 나의 멘토링 허브, 상세, 후기 목록의 단일 읽기 API
- 인증: 로그인 사용자
- 사용 화면:
  - `/my-mentoring`
  - `/my-mentoring/[id]`
  - `/my-study-review`

Query:

- `page?: number`
- `size?: number`
- `status?: REQUESTED|PENDING|CONFIRMED|COMPLETED|NO_SHOW|CANCELLED|REJECTED`
- `method?: note|simple|deep|offline`

Response:

```json
{
  "items": [
    {
      "mentor": {},
      "request": {},
      "session": {},
      "review": {},
      "reviewEligibility": {
        "canReview": true,
        "reason": null,
        "isCompleted": true
      }
    }
  ],
  "summary": {
    "requestedCount": 1,
    "confirmedCount": 2,
    "completedCount": 3,
    "noteWaitingCount": 1
  },
  "page": 0,
  "size": 20,
  "totalElements": 6,
  "totalPages": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

- `confirmedCount`는 결제 확정이 아니라 멘토링 진행 확정 건수 의미로 해석한다.

### 5.4 `GET /mentoring/requests/{requestId}`

- 목적: request 단건 상세 조회
- 인증: 로그인 사용자, 요청 당사자/멘토/관리자만 접근 가능
- 사용 화면:
  - `/my-mentoring/[id]`
  - `/mentoring/[id]/complete`
  - deep-link 상세

Response:

```json
{
  "mentor": {},
  "request": {},
  "session": {},
  "review": {},
  "reviewEligibility": {
    "canReview": false,
    "reason": "상담 종료 후 작성할 수 있습니다.",
    "isCompleted": false
  }
}
```

### 5.5 `GET /mentoring/note-consultations`

- 목적: 쪽지상담 전용 sent/received 목록 제공
- 인증: 로그인 사용자
- 사용 화면:
  - `/note-consultation`
  - `/my-mentoring` 상단 note summary
  - `/mentoring-management` note 탭

Query:

- `requestId?: string`
- `mentorId?: number`

Response 형식은 프론트의 현재 타입과 동일하게 유지한다.

```json
{
  "sentItems": [
    {
      "id": "request_123",
      "request": {},
      "displayName": "민재",
      "displayRole": "시니어 백엔드 엔지니어",
      "channel": "sent",
      "counterpartMemberId": 4001,
      "counterpartProfileImageUrl": "https://...",
      "lastMessageContent": "우선 문장 순서부터 정리해보세요.",
      "lastMessageCreatedAt": "2026-03-13T10:15:30Z",
      "mentorReplyCount": 2
    }
  ],
  "receivedItems": []
}
```

### 5.6 `POST /mentoring/requests/{requestId}/messages`

- 목적: note 대화 메시지 전송
- 인증: 요청 당사자 또는 해당 멘토
- 사용 화면:
  - `/note-consultation`
- 비고:
  - 현재 최소 계약은 `content` 문자열이다.
  - 멘토 답변을 request-side rich block으로 저장하고 파일 첨부까지 지원하려면
    별도 확장 계약이 필요하다.
  - 확장안은 `docs/mentoring/note-consultation-rich-message-api-request.md`
    문서를 기준으로 한다.

Request:

```json
{
  "content": "프로젝트 한 개 문장만 보내주실 수 있나요?"
}
```

Rich message 확장 요청 예시:

```json
{
  "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내세요.",
  "messageContents": [
    {
      "id": "message-block-1",
      "type": "richText",
      "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내세요.</p>"
    },
    {
      "id": "message-block-2",
      "type": "file",
      "fileName": "portfolio-review.pdf",
      "fileSize": 248120
    }
  ],
  "attachedFileNames": ["portfolio-review.pdf"],
  "referenceLinks": ["https://portfolio.example"]
}
```

Response:

```json
{
  "messageId": "msg_123",
  "requestId": "request_123",
  "lastMessageCreatedAt": "2026-03-13T10:15:30Z"
}
```

- 현재 응답은 최소 shape만 가진다.
- 상세 렌더링 source of truth로 `messageContents`를 round-trip 하려면
  conversation message resource 확장도 함께 필요하다.
- 현재 계약에는 `메시지 생성`만 있고 `메시지 수정`은 없다.
- 이미 등록된 멘토 답변을 같은 message 기준으로 수정하려면
  `PATCH /mentoring/requests/{requestId}/messages/{messageId}` 가 추가로 필요하다.
- 상세 스펙은 `docs/mentoring/note-consultation-rich-message-api-request.md`
  문서를 기준으로 한다.

### 5.7 `GET /mentoring/me/mentor-workspace`

- 목적: 멘토 본인의 운영 관리 화면용 composite read
- 인증: 멘토 계정
- 사용 화면:
  - `/mentoring-management`
  - `/mentoring-management/requests`

Response:

```json
{
  "mentor": {},
  "noteRequests": [
    {
      "mentor": {},
      "request": {}
    }
  ],
  "reservationRequests": [
    {
      "mentor": {},
      "request": {},
      "session": {},
      "review": {}
    }
  ],
  "sessions": [],
  "summary": {
    "pendingCount": 3,
    "scheduledCount": 4,
    "doneCount": 8,
    "noteCount": 5
  }
}
```

### 5.8 `POST /mentoring/requests/{requestId}/accept`

- 목적: 멘토가 신청 수락, 예약형이면 동시에 세션 생성
- 인증: 해당 멘토
- 사용 화면:
  - `/mentoring-management`

Request:

```json
{
  "mentorNote": "화면 공유로 진행하겠습니다.",
  "schedule": {
    "startsAt": "2026-03-17T11:00:00Z",
    "endsAt": "2026-03-17T12:00:00Z",
    "placeNote": "Google Meet 링크 사전 전달"
  }
}
```

비고:

- `note` 방식은 `schedule` 없이 허용
- `simple|deep|offline`는 `schedule` 필수

Response:

```json
{
  "requestId": "request_123",
  "status": "ACCEPTED",
  "sessionId": "session_123"
}
```

### 5.9 `POST /mentoring/requests/{requestId}/reject`

- 목적: 멘토가 신청 거절
- 인증: 해당 멘토

Request:

```json
{
  "reason": "현재 요청 시간대에는 상담이 어렵습니다."
}
```

Response:

```json
{
  "requestId": "request_123",
  "status": "REJECTED"
}
```

### 5.10 `PATCH /mentoring/sessions/{sessionId}`

- 목적: 멘토가 일정 재조정
- 인증: 해당 멘토

Request:

```json
{
  "startsAt": "2026-03-18T11:00:00Z",
  "endsAt": "2026-03-18T12:00:00Z",
  "placeNote": "Discord 음성 채널",
  "mentorNote": "하루 뒤 같은 시간으로 변경 부탁드립니다."
}
```

Response:

```json
{
  "sessionId": "session_123",
  "updatedAt": "2026-03-13T10:15:30Z"
}
```

### 5.11 `POST /mentoring/sessions/{sessionId}/cancel`

- 목적: 확정 일정 취소
- 인증: 해당 멘토 또는 관리자

Request:

```json
{
  "issueType": "MENTOR_CANCELLED",
  "reason": "멘토 일정 이슈로 취소가 필요합니다."
}
```

Response:

```json
{
  "sessionId": "session_123",
  "status": "CANCELLED"
}
```

### 5.12 `POST /mentoring/sessions/{sessionId}/outcome`

- 목적: 상담 완료/멘토 노쇼/멘티 노쇼 처리
- 인증: 해당 멘토 또는 관리자

Request:

```json
{
  "outcome": "COMPLETED",
  "note": "상담이 정상 종료되었습니다."
}
```

`outcome` enum:

- `COMPLETED`
- `MENTEE_NO_SHOW`
- `MENTOR_NO_SHOW`

Response:

```json
{
  "sessionId": "session_123",
  "status": "COMPLETED",
  "issueType": "NONE"
}
```

### 5.13 `PUT /mentoring/requests/{requestId}/review`

- 목적: 멘티 후기 등록/수정
- 인증: 해당 멘티
- 사용 화면:
  - `/my-study-review`

Request:

```json
{
  "rating": 5,
  "recommendation": "RECOMMEND",
  "content": "포트폴리오 구조를 바로 고칠 수 있을 정도로 구체적이었습니다."
}
```

Response:

```json
{
  "reviewId": "review_123",
  "updated": false
}
```

---

## 6. 관리자 멘토링 API 명세

현재 관리자 화면은 모두 하나의 overview store에서 파생되므로, 1차 구현은
아래 3개 API만으로 충분하다.

### 6.1 `GET /admin/mentoring/overview`

- 목적: 관리자 대시보드, 심사, 운영, 세션 현황 화면용 단일 조회
- 인증: `ROLE_ADMIN`
- 사용 화면:
  - `/admin/mentoring/dashboard`
  - `/admin/mentoring/mentor-applications`
  - `/admin/mentoring/mentor-operations`
  - `/admin/mentoring/sessions`

Query:

- `mentorId?: number`
- `screeningStatus?: PENDING|IN_REVIEW|APPROVED|REJECTED`
- `operationStatus?: OPEN|REQUESTS_PAUSED|SUSPENDED`

Response:

```json
{
  "metrics": {
    "registeredMentorCount": 10,
    "pendingScreeningCount": 2,
    "inReviewScreeningCount": 1,
    "approvedMentorCount": 6,
    "rejectedMentorCount": 1,
    "pendingRequestCount": 8,
    "scheduledSessionCount": 14,
    "completedReviewCount": 22
  },
  "mentors": [
    {
      "mentor": {},
      "mentorId": 101,
      "memberId": 4001,
      "screening": {
        "status": "APPROVED",
        "note": "기본 심사 통과",
        "startedAt": "2026-03-10T01:00:00Z",
        "reviewedAt": "2026-03-10T03:00:00Z",
        "startedByMemberId": 1,
        "reviewedByMemberId": 1
      },
      "operation": {
        "status": "OPEN",
        "reason": "정상 운영",
        "changedAt": "2026-03-11T01:00:00Z",
        "changedByMemberId": 1,
        "history": []
      },
      "requests": [],
      "sessions": [],
      "reviews": [],
      "counts": {
        "pendingRequests": 2,
        "acceptedRequests": 4,
        "rejectedRequests": 1,
        "scheduledSessions": 3,
        "completedSessions": 5,
        "cancelledSessions": 1,
        "reviews": 6
      }
    }
  ]
}
```

### 6.2 `PATCH /admin/mentoring/mentors/{mentorId}/screening`

- 목적: 심사 상태 변경
- 인증: `ROLE_ADMIN`

Request:

```json
{
  "status": "APPROVED",
  "note": "멘토 등록 기준 충족",
  "startedAt": "2026-03-10T01:00:00Z",
  "reviewedAt": "2026-03-10T03:00:00Z"
}
```

Response:

```json
{
  "mentorId": 101,
  "screening": {
    "status": "APPROVED",
    "note": "멘토 등록 기준 충족"
  }
}
```

### 6.3 `PATCH /admin/mentoring/mentors/{mentorId}/operation`

- 목적: 신규 신청 가능/중지/운영 정지 조치
- 인증: `ROLE_ADMIN`

Request:

```json
{
  "status": "REQUESTS_PAUSED",
  "reason": "일정 과부하로 신규 신청 일시 중지"
}
```

Response:

```json
{
  "mentorId": 101,
  "operation": {
    "status": "REQUESTS_PAUSED",
    "reason": "일정 과부하로 신규 신청 일시 중지"
  }
}
```

---

## 7. `/one-on-one` API 방향

`/one-on-one` 자체는 현재 mock 페이지지만, 신규 필수 API는 아니다.

재사용 가능한 기존 API:

- `GET /hall-of-fame`
- `GET /archive`
- `GET /balance-games`
- `GET /balance-games/{id}`
- `GET /balance-games/{id}/comments`

권장 방향:

1. `/one-on-one`을 기존 home 탭 데이터(`hall-of-fame`, `archive`) 재조합 화면으로 바꾼다.
2. 신규 집계가 꼭 필요할 때만 아래 optional API를 추가한다.

Optional:

- `GET /one-on-one/dashboard`

Response 예시:

```json
{
  "rankings": {},
  "library": {
    "items": [],
    "page": 0,
    "size": 20,
    "totalElements": 120,
    "totalPages": 6
  }
}
```

---

## 8. 구현 우선순위

### P0 (멘토링 사용자/멘토 플로우 12개)

- `POST /mentoring/requests`
- `GET /mentoring/me/dashboard`
- `GET /mentoring/requests/{requestId}`
- `GET /mentoring/note-consultations`
- `POST /mentoring/requests/{requestId}/messages`
- `GET /mentoring/me/mentor-workspace`
- `POST /mentoring/requests/{requestId}/accept`
- `POST /mentoring/requests/{requestId}/reject`
- `PATCH /mentoring/sessions/{sessionId}`
- `POST /mentoring/sessions/{sessionId}/cancel`
- `POST /mentoring/sessions/{sessionId}/outcome`
- `PUT /mentoring/requests/{requestId}/review`

### P1 (관리자 3개)

- `GET /admin/mentoring/overview`
- `PATCH /admin/mentoring/mentors/{mentorId}/screening`
- `PATCH /admin/mentoring/mentors/{mentorId}/operation`

### P2 (선택/정리 항목)

- `/one-on-one` 신규 facade 필요 여부 결정
- 멘토링 결제 API는 후속 범위에서 별도 착수

---

## 9. 결정이 필요한 항목

현재 범위에서 아래 2개는 백엔드 구현 전에 확정이 필요하다.

결제 도메인 편입 여부는 결제 API 범위를 다시 열 때 별도로 결정한다.

1. `GET /mentoring/me/dashboard`를 composite 단일 API로 둘지, list/detail/review를 분리할지
2. 관리자 화면을 `GET /admin/mentoring/overview` 단일 API로 유지할지, dashboard/list/detail로 분리할지
