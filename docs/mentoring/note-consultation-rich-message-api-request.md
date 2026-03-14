# 쪽지상담 Rich Message API 요청서

작성일: 2026-03-14

## 0. 현재 결론

현재 프론트 기준으로 상태를 먼저 정리하면 아래와 같다.

- 멘토 답변 editor 자체는 이미 `MentoringMarkdownEditor` 기반이라
  마크다운/HTML rich text 작성이 가능하다.
- 인라인 이미지는 현재 editor가 가진 업로드 흐름을 통해 삽입 가능하다.
- 멘티가 요청서를 보낼 때 고르는 `첨부파일` 은 현재 실제 업로드가 아니라
  `fileName` 만 저장하는 구조라, 멘토가 다운로드할 대상이 없다.
- 하지만 note 상담 메시지 API는 아직 `content` 문자열만 계약으로 사용하므로,
  rich block 구조 보존은 end-to-end라고 보기 어렵다.
- 첨부파일은 editor block으로 고를 수는 있어도,
  note 상담 전용 업로드/다운로드 API가 없어서 실제 파일 첨부 기능은 아직 완성되지 않았다.

즉, 현재는 `멘토 답변의 rich text 작성은 가능`, `멘티 요청 첨부파일/멘토 답변 첨부파일의 실제 다운로드는 불가` 상태다.

추가로 현재 기준에서 확인된 API 존재 여부는 아래와 같다.

- `POST /api/v1/mentoring/requests/{requestId}/messages`
  - 존재함
  - 멘토 답변 생성, 멘티 후속 질문 생성에 사용 중
- `PATCH /api/v1/mentoring/requests/{requestId}/messages/{messageId}`
  - 존재하지 않음
  - 그래서 이미 등록된 멘토 답변을 같은 message 기준으로 수정 저장할 수 없다

추가로, 2026-03-14 로컬 검증 기준으로 구현 mismatch도 확인됐다.

- `POST /api/v1/mentoring/requests/{requestId}/messages` 에
  `messageContents`, `attachedFileNames`, `referenceLinks` 를 보내면
  백엔드는 `400 Invalid Parameters` 와
  `Unrecognized field "messageContents"` 로 거절한다.
- 그래서 현재 프론트는 `content` 만 보내는 fallback 으로 재시도한다.
- 이 fallback 으로도 멘토 답변 자체는 저장되며,
  본문에는 HTML과 인라인 이미지 URL, `[첨부파일] 파일명` 라벨까지 들어간다.
- 하지만 `GET /api/v1/mentoring/requests/{requestId}` 는 실제 저장된 답변이 있어도
  `conversation: []` 로 내려오는 케이스가 확인됐다.
- 반면 `GET /api/v1/mentoring/note-consultations` 의
  `lastMessageContent`, `mentorReplyCount` 는 정상 반영된다.

즉, 백엔드에는 최소 두 가지가 필요하다.

1. rich message 필드 수용
2. detail API 와 list API 의 conversation 계약 일치

## 1. 배경

현재 `POST /api/v1/mentoring/requests` 는 request body에
`requestContents`, `attachedFileNames` 를 보내지만, 첨부파일 실체를 업로드하는 단계가 없다.

```json
{
  "mentorId": 9002,
  "method": "note",
  "requestMessage": "포트폴리오 첨삭 부탁드립니다.",
  "attachedFileNames": ["resume.pdf"]
}
```

이 구조에서는 멘토 화면에 파일명을 보여줄 수는 있어도,
실제 다운로드 링크를 만들 수 없다.

현재 `POST /api/v1/mentoring/requests/{requestId}/messages` 는 `content` 문자열만 받는다.

```json
{
  "content": "프로젝트 한 개 문장만 보내주실 수 있나요?"
}
```

이 계약들로는 아래 요구를 안정적으로 처리할 수 없다.

- 멘티가 요청서에 올린 첨부파일을 멘토가 다운로드
- 멘토/멘티가 마크다운 형태로 답변 작성
- 인라인 이미지 업로드 후 메시지 본문에 삽입
- 문서 파일 직접 첨부
- 대화 상세/목록에서 rich content를 구조적으로 렌더링

프론트는 현재 `MentoringMarkdownEditor` 로 마크다운/이미지 편집이 가능하지만,
파일 첨부와 메시지 구조 보존은 백엔드 계약 확장이 필요하다.

## 2. 현재 한계

### 현재 send-message 계약

- Request: `content: string`
- Response: `messageId`, `requestId`, `lastMessageCreatedAt`
- Detail/List 응답의 conversation message도 `content: string` 만 가진다.

### 부족한 점

- 요청서 생성 시점에 첨부파일 업로드/식별자 발급 단계가 없다.
- `content` 문자열만으로는 파일 첨부 메타데이터를 안정적으로 round-trip 할 수 없다.
- 이미지 업로드용 전용 endpoint가 없다.
- 파일 업로드용 presigned URL endpoint가 없다.
- 목록 preview를 plain text로 만들더라도, 상세 렌더링에 필요한 구조형 데이터가 없다.
- detail API 와 list API 의 답변 반영 결과가 서로 다를 수 있다.

## 3. 요청서 첨부파일 확장안

### `POST /api/v1/mentoring/requests`

Request:

```json
{
  "mentorId": 9002,
  "method": "note",
  "requestTitle": "포트폴리오 첨삭 요청",
  "requestMessage": "프로젝트 두 개를 중심으로 피드백 부탁드립니다.",
  "requestContents": [
    {
      "id": "block-1",
      "type": "richText",
      "document": "<p>프로젝트 두 개를 중심으로 피드백 부탁드립니다.</p>"
    }
  ],
  "attachmentFileKeys": [
    "mentoring-request-file-123"
  ]
}
```

Response:

```json
{
  "requestId": 123,
  "request": {
    "id": 123,
    "attachedFiles": [
      {
        "fileKey": "mentoring-request-file-123",
        "fileName": "resume.pdf",
        "fileSize": 248120,
        "mimeType": "application/pdf",
        "downloadUrl": "https://cdn.zeroone.it.kr/.../resume.pdf"
      }
    ]
  }
}
```

규칙:

- `attachedFileNames` 는 제거하거나 fallback 용으로만 유지한다.
- 다운로드 가능한 요청 첨부파일은 반드시 `attachedFiles[].downloadUrl` 로 내려준다.
- 멘토/멘티 상세 화면은 파일명 텍스트가 아니라 `downloadUrl` 링크를 렌더링한다.

## 4. 최소 요구 변경안

### 4.1 Message Resource 확장

기존 `MentoringConversationMessageResource` 를 아래처럼 확장한다.

```json
{
  "id": 701,
  "sender": "MENTOR",
  "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내세요.",
  "contentFormat": "HTML",
  "messageContents": [
    {
      "id": "message-block-1",
      "type": "richText",
      "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내세요.</p><p><img src=\"https://cdn.zeroone.it.kr/.../reply-image.png\" width=\"200\"></p>"
    }
  ],
  "attachedFiles": [
    {
      "fileKey": "mentoring-message-file-123",
      "fileName": "portfolio-review.pdf",
      "fileSize": 248120,
      "mimeType": "application/pdf",
      "downloadUrl": "https://cdn.zeroone.it.kr/.../portfolio-review.pdf"
    }
  ],
  "createdAt": "2026-03-14T03:10:00Z"
}
```

### 필드 규칙

- `content`
  - 목록 preview, 검색, 알림용 plain text fallback
- `contentFormat`
  - `PLAIN_TEXT | HTML`
- `messageContents`
  - 프론트 request editor와 동일하게 `MentoringRequestContentBlock[]` 재사용
  - rich text / image / file / link block 포함 가능
- `attachedFiles`
  - 실제 업로드된 파일 메타데이터

## 5. 메시지 전송 API 확장안

### `POST /api/v1/mentoring/requests/{requestId}/messages`

Request:

```json
{
  "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내세요.",
  "contentFormat": "HTML",
  "messageContents": [
    {
      "id": "message-block-1",
      "type": "richText",
      "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내세요.</p>"
    }
  ],
  "attachmentFileKeys": [
    "mentoring-message-file-123"
  ]
}
```

Response:

```json
{
  "messageId": 701,
  "requestId": 123,
  "lastMessageCreatedAt": "2026-03-14T03:10:00Z",
  "message": {
    "id": 701,
    "sender": "MENTOR",
    "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내세요.",
    "contentFormat": "HTML",
    "messageContents": [
      {
        "id": "message-block-1",
        "type": "richText",
        "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내세요.</p>"
      }
    ],
    "attachedFiles": [
      {
        "fileKey": "mentoring-message-file-123",
        "fileName": "portfolio-review.pdf",
        "fileSize": 248120,
        "mimeType": "application/pdf",
        "downloadUrl": "https://cdn.zeroone.it.kr/.../portfolio-review.pdf"
      }
    ],
    "createdAt": "2026-03-14T03:10:00Z"
  }
}
```

### 서버 처리 규칙

- `content` 는 preview용 plain text fallback 으로 저장
- `messageContents` 가 있으면 상세 화면 렌더링 source of truth 로 사용
- `attachmentFileKeys` 는 업로드 완료된 파일만 허용
- rich field 가 없는 fallback 저장이라도
  `GET /mentoring/requests/{requestId}` 와 `GET /mentoring/note-consultations`
  둘 다 같은 메시지 결과를 반영해야 한다
- 권한은 기존과 동일:
  - 해당 request의 멘토
  - 해당 request의 멘티
  - 관리자

### `PATCH /api/v1/mentoring/requests/{requestId}/messages/{messageId}`

목적:

- 이미 등록된 멘토 답변을 같은 message row 기준으로 수정한다.
- 프론트의 `답변 수정` 버튼과 1:1로 대응한다.

인증:

- 해당 request의 멘토
- 관리자

Request:

```json
{
  "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내고, 성과 수치는 표로 분리하세요.",
  "contentFormat": "HTML",
  "messageContents": [
    {
      "id": "message-block-1",
      "type": "richText",
      "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내고, 성과 수치는 표로 분리하세요.</p>"
    }
  ],
  "attachmentFileKeys": [
    "mentoring-message-file-123"
  ]
}
```

Response:

```json
{
  "messageId": 701,
  "requestId": 123,
  "updatedAt": "2026-03-14T04:00:00Z",
  "message": {
    "id": 701,
    "sender": "MENTOR",
    "content": "포트폴리오는 문제 정의와 성과 수치를 먼저 드러내고, 성과 수치는 표로 분리하세요.",
    "contentFormat": "HTML",
    "messageContents": [
      {
        "id": "message-block-1",
        "type": "richText",
        "document": "<p>포트폴리오는 <strong>문제 정의</strong>와 성과 수치를 먼저 드러내고, 성과 수치는 표로 분리하세요.</p>"
      }
    ],
    "attachedFiles": [
      {
        "fileKey": "mentoring-message-file-123",
        "fileName": "portfolio-review.pdf",
        "fileSize": 248120,
        "mimeType": "application/pdf",
        "downloadUrl": "https://cdn.zeroone.it.kr/.../portfolio-review.pdf"
      }
    ],
    "createdAt": "2026-03-14T03:10:00Z",
    "updatedAt": "2026-03-14T04:00:00Z"
  }
}
```

서버 처리 규칙:

- message author가 멘토인지 검증해야 한다.
- `messageId`는 해당 `requestId`의 conversation에 속해야 한다.
- 수정은 append가 아니라 overwrite다.
- 수정 후 아래 조회 API가 같은 결과를 봐야 한다.
  - `GET /api/v1/mentoring/requests/{requestId}`
  - `GET /api/v1/mentoring/note-consultations`
- 목록 preview용 `lastMessageContent`가 수정 대상 message를 가리키는 경우 함께 갱신한다.

## 6. 업로드 API 추가안

요청서 첨부파일과 답변 첨부파일, 인라인 이미지를 하나의 presign endpoint로 처리한다.

### `POST /api/v1/mentoring/messages/attachments/upload-ticket`

Request:

```json
{
  "fileName": "portfolio-review.pdf",
  "fileSize": 248120,
  "mimeType": "application/pdf",
  "attachmentType": "FILE"
}
```

또는

```json
{
  "fileName": "reply-image.png",
  "fileSize": 182344,
  "mimeType": "image/png",
  "attachmentType": "INLINE_IMAGE"
}
```

Response:

```json
{
  "fileKey": "mentoring-message-file-123",
  "uploadUrl": "https://presigned-upload-url",
  "publicUrl": "https://cdn.zeroone.it.kr/.../portfolio-review.pdf",
  "expiresAt": "2026-03-14T03:20:00Z"
}
```

### 규칙

- `INLINE_IMAGE`
  - 이미지 확장자 및 파일 크기 제한 적용
  - 업로드 후 `messageContents.richText.document` 의 `img src` 에 `publicUrl` 사용
- `FILE`
  - 문서/압축 파일 등 허용 확장자 whitelist 필요
  - 메시지 전송 시 `attachmentFileKeys` 로 연결

## 7. 조회 API 영향 범위

아래 API는 요청 첨부파일과 답변 첨부파일을 다운로드 가능한 형태로 내려야 한다.

- `GET /api/v1/mentoring/requests/{requestId}`
- `GET /api/v1/mentoring/note-consultations`
- `GET /api/v1/mentoring/me/dashboard`
- `GET /api/v1/mentoring/me/mentor-workspace`
- `GET /api/v1/admin/mentoring/mentors/{mentorId}`

세부 규칙:

- 요청서 첨부파일: `request.attachedFiles[]`
- 메시지 첨부파일: `conversation[].attachedFiles[]`
- 최소 필드: `fileName`, `fileSize`, `mimeType`, `downloadUrl`

그리고 아래 API의 `conversation[]` message resource 는 확장된 형태를 내려야 한다.

목록 API는 무거워지지 않게 아래 원칙을 권장한다.

- `lastMessageContent` 는 계속 plain text preview 유지
- `conversation` 전체는 상세 API 우선
- 목록 API에서 `conversation` 을 내려야 한다면 최근 N개 또는 lightweight shape 유지

## 8. 프론트 적용 순서

### 프론트만으로 즉시 가능

- 답변 composer를 plain textarea 에서 markdown editor로 전환
- 메시지 렌더링을 markdown/html 지원 방식으로 전환
- 인라인 이미지 preview/삽입 지원

### 백엔드 추가 후 마무리 가능

- 실제 파일 업로드
- `messageContents`/`attachedFiles` 구조 보존
- 상세/목록에서 파일 다운로드 링크 노출

## 9. 결정 필요 사항

1. `messageContents` 를 `MentoringRequestContentBlock[]` 로 request/reply 공용화할지
2. 파일 첨부 whitelist를 어디까지 열지
3. 업로드 endpoint 를 mentoring 전용으로 둘지, 공용 file 서비스로 분리할지
4. 목록 API에 `conversation` 전체를 계속 포함할지, 상세 API 전용으로 줄일지
