# 멘토링 라이프사이클 DDL 명세서

작성일: 2026-03-13

## 1. 목적

이 문서는 이미 존재하는 멘토 프로필/등록 테이블을 기준으로,
멘토링 신청 이후 라이프사이클을 서버 단일 소스로 옮기기 위해
추가로 필요한 테이블만 정리한 DDL 명세서다.

범위:

- 멘토링 신청
- 쪽지상담 메시지
- 예약 세션
- 후기
- 관리자 심사/운영 이력

범위 제외:

- 문의
- 미션
- 결제/환불
- 정산 계좌/멘토 정산
- `/one-on-one`

---

## 2. 기존 테이블 재사용

아래 테이블은 그대로 재사용한다.

- `member`
- `member_profile`
- `image`
- `mentor`
- `mentor_settings`
- `mentor_method_config`
- `mentor_intro_image_ref`
- `mentor_weekly_slot`
- `mentor_core_keyword`

특히 아래 컬럼은 신규 테이블에서 그대로 참조한다.

- `mentor.mentor_id`
- `mentor.member_id`
- `mentor.operation_status`
- `mentor.screening_status`
- `member.member_id`
- `member_profile.email`

---

## 3. 추가로 필요한 테이블

### 3.1 1차 필수 테이블 6개

1. `mentoring_request`
2. `mentoring_request_message`
3. `mentoring_session`
4. `mentoring_review`
5. `mentor_screening_history`
6. `mentor_operation_history`

현재 결제 기능은 후순위이므로, 이번 DDL 명세에는 결제/환불/결제이력 테이블을 포함하지 않는다.

---

## 4. 설계 원칙

### 4.1 ID 타입

- 신규 PK는 모두 `BIGINT AUTO_INCREMENT`
- 프론트 mock의 `request_123`, `session_123`, `review_123` 같은 문자열 ID는
  실제 DB에서는 `BIGINT`로 치환한다.

### 4.2 상담 방식 enum

프론트 값:

- `note`
- `simple`
- `deep`
- `offline`

DB 저장 값:

- `NOTE`
- `SIMPLE`
- `IN_DEPTH`
- `OFFLINE`

즉, 프론트의 `deep`는 DB에서 `IN_DEPTH`로 저장한다.
이건 기존 `mentor_method_config.method_type`와 맞춘다.

### 4.3 요청 본문 저장 방식

현재 프론트의 요청 본문은 rich text 블록 배열이다.

- `requestMessage`
- `requestContents`
- `attachedFileNames`
- `referenceLinks`

이 필드는 검색 대상이 아니고 현재도 editor payload 자체가 중요하므로,
1차는 정규화 테이블로 쪼개지 않고 `LONGTEXT JSON` 문자열로 저장한다.

즉, 아래 3개 컬럼은 JSON 직렬화 문자열을 담는다.

- `request_contents_json`
- `attached_file_names_json`
- `reference_links_json`

### 4.4 현재 상태와 이력 분리

`mentor` 테이블에는 이미 현재 상태가 있다.

- `operation_status`
- `screening_status`

따라서 현재 상태는 계속 `mentor`에 두고,
상세 note/reason/시각/담당자 정보는 이력 테이블로 분리한다.

## 5. ER 요약

- `mentor 1 : N mentoring_request`
- `member 1 : N mentoring_request` (`mentee_member_id`)
- `mentoring_request 1 : N mentoring_request_message`
- `mentoring_request 1 : 0..1 mentoring_session`
- `mentoring_request 1 : 0..1 mentoring_review`
- `mentor 1 : N mentor_screening_history`
- `mentor 1 : N mentor_operation_history`

---

## 6. 1차 필수 DDL

### 6.1 `mentoring_request`

```sql
CREATE TABLE IF NOT EXISTS mentoring_request (
    mentoring_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    mentee_member_id BIGINT NOT NULL,
    method_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    preferred_date DATE NULL,
    preferred_time TIME NULL,
    request_title VARCHAR(120) NULL,
    request_message LONGTEXT NOT NULL,
    request_contents_json LONGTEXT NULL,
    attached_file_names_json LONGTEXT NULL,
    reference_links_json LONGTEXT NULL,
    decision_note VARCHAR(1000) NULL,
    accepted_at TIMESTAMP NULL,
    rejected_at TIMESTAMP NULL,
    last_message_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_mentoring_request_mentor FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    CONSTRAINT fk_mentoring_request_mentee FOREIGN KEY (mentee_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentoring_request_method_type CHECK (
        method_type IN ('NOTE', 'SIMPLE', 'IN_DEPTH', 'OFFLINE')
    ),
    CONSTRAINT ck_mentoring_request_status CHECK (
        status IN ('PENDING', 'ACCEPTED', 'REJECTED')
    )
);

CREATE INDEX idx_mentoring_request_mentor_status
    ON mentoring_request (mentor_id, status, created_at);

CREATE INDEX idx_mentoring_request_mentee_status
    ON mentoring_request (mentee_member_id, status, created_at);

CREATE INDEX idx_mentoring_request_note_last_message_by_mentor
    ON mentoring_request (mentor_id, method_type, last_message_at);

CREATE INDEX idx_mentoring_request_note_last_message_by_mentee
    ON mentoring_request (mentee_member_id, method_type, last_message_at);
```

의도:

- `mentoring_request`가 신청의 루트 엔티티다.
- note 상담과 예약 상담을 둘 다 이 테이블에 담는다.
- `last_message_at`은 쪽지상담 목록 정렬용 denormalized 컬럼이다.
- 결제 snapshot 컬럼은 결제 기능 범위가 열릴 때 별도 테이블과 함께 추가한다.

### 6.2 `mentoring_request_message`

```sql
CREATE TABLE IF NOT EXISTS mentoring_request_message (
    mentoring_request_message_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentoring_request_id BIGINT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    actor_member_id BIGINT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_mentoring_request_message_request FOREIGN KEY (mentoring_request_id) REFERENCES mentoring_request(mentoring_request_id),
    CONSTRAINT fk_mentoring_request_message_actor FOREIGN KEY (actor_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentoring_request_message_sender CHECK (
        sender_type IN ('MENTEE', 'MENTOR', 'SYSTEM')
    )
);

CREATE INDEX idx_mentoring_request_message_request
    ON mentoring_request_message (mentoring_request_id, created_at);

CREATE INDEX idx_mentoring_request_message_actor
    ON mentoring_request_message (actor_member_id, created_at);
```

의도:

- 신청 이후 모든 타임라인 메시지를 저장한다.
- `SYSTEM` 메시지도 같은 테이블에 저장해 프론트 대화 타임라인을 그대로 재현한다.

### 6.3 `mentoring_session`

```sql
CREATE TABLE IF NOT EXISTS mentoring_session (
    mentoring_session_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentoring_request_id BIGINT NOT NULL,
    mentor_id BIGINT NOT NULL,
    mentee_member_id BIGINT NOT NULL,
    method_type VARCHAR(20) NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    place_note VARCHAR(1000) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    issue_type VARCHAR(30) NOT NULL DEFAULT 'NONE',
    operation_note VARCHAR(1000) NULL,
    canceled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT uk_mentoring_session_request UNIQUE (mentoring_request_id),
    CONSTRAINT fk_mentoring_session_request FOREIGN KEY (mentoring_request_id) REFERENCES mentoring_request(mentoring_request_id),
    CONSTRAINT fk_mentoring_session_mentor FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    CONSTRAINT fk_mentoring_session_mentee FOREIGN KEY (mentee_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentoring_session_method_type CHECK (
        method_type IN ('SIMPLE', 'IN_DEPTH', 'OFFLINE')
    ),
    CONSTRAINT ck_mentoring_session_status CHECK (
        status IN ('SCHEDULED', 'CANCELLED', 'COMPLETED')
    ),
    CONSTRAINT ck_mentoring_session_issue_type CHECK (
        issue_type IN ('NONE', 'MENTOR_CANCELLED', 'MENTEE_CANCELLED', 'MENTOR_NO_SHOW', 'MENTEE_NO_SHOW')
    ),
    CONSTRAINT ck_mentoring_session_schedule CHECK (
        starts_at < ends_at
    )
);

CREATE INDEX idx_mentoring_session_mentor_schedule
    ON mentoring_session (mentor_id, status, starts_at);

CREATE INDEX idx_mentoring_session_mentee_schedule
    ON mentoring_session (mentee_member_id, status, starts_at);

CREATE INDEX idx_mentoring_session_status
    ON mentoring_session (status, starts_at);
```

의도:

- 예약형 상담만 저장한다.
- `NOTE`는 세션이 없으므로 `method_type`에서 제외한다.
- request와 1:1 관계를 강제한다.

### 6.4 `mentoring_review`

```sql
CREATE TABLE IF NOT EXISTS mentoring_review (
    mentoring_review_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    mentoring_request_id BIGINT NOT NULL,
    mentoring_session_id BIGINT NULL,
    mentee_member_id BIGINT NOT NULL,
    rating TINYINT NOT NULL,
    recommendation VARCHAR(20) NOT NULL,
    content VARCHAR(3000) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT uk_mentoring_review_request UNIQUE (mentoring_request_id),
    CONSTRAINT fk_mentoring_review_mentor FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    CONSTRAINT fk_mentoring_review_request FOREIGN KEY (mentoring_request_id) REFERENCES mentoring_request(mentoring_request_id),
    CONSTRAINT fk_mentoring_review_session FOREIGN KEY (mentoring_session_id) REFERENCES mentoring_session(mentoring_session_id),
    CONSTRAINT fk_mentoring_review_mentee FOREIGN KEY (mentee_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentoring_review_rating CHECK (
        rating BETWEEN 1 AND 5
    ),
    CONSTRAINT ck_mentoring_review_recommendation CHECK (
        recommendation IN ('RECOMMEND', 'NOT_RECOMMEND')
    )
);

CREATE INDEX idx_mentoring_review_mentor
    ON mentoring_review (mentor_id, created_at);

CREATE INDEX idx_mentoring_review_mentee
    ON mentoring_review (mentee_member_id, created_at);
```

의도:

- request당 후기 1개만 허용한다.
- note 상담은 `mentoring_session_id`가 `NULL`일 수 있다.

### 6.5 `mentor_screening_history`

```sql
CREATE TABLE IF NOT EXISTS mentor_screening_history (
    mentor_screening_history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    from_status VARCHAR(30) NULL,
    to_status VARCHAR(30) NOT NULL,
    note VARCHAR(1000) NULL,
    started_at TIMESTAMP NULL,
    started_by_member_id BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    reviewed_by_member_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_mentor_screening_history_mentor FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    CONSTRAINT fk_mentor_screening_history_started_by FOREIGN KEY (started_by_member_id) REFERENCES member(member_id),
    CONSTRAINT fk_mentor_screening_history_reviewed_by FOREIGN KEY (reviewed_by_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentor_screening_history_from_status CHECK (
        from_status IS NULL OR from_status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED')
    ),
    CONSTRAINT ck_mentor_screening_history_to_status CHECK (
        to_status IN ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED')
    )
);

CREATE INDEX idx_mentor_screening_history_mentor
    ON mentor_screening_history (mentor_id, created_at);

CREATE INDEX idx_mentor_screening_history_reviewed
    ON mentor_screening_history (reviewed_at);
```

의도:

- 현재 상태는 `mentor.screening_status`를 사용한다.
- note, started/reviewed 시각, 담당자 정보는 이력으로 남긴다.

### 6.6 `mentor_operation_history`

```sql
CREATE TABLE IF NOT EXISTS mentor_operation_history (
    mentor_operation_history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mentor_id BIGINT NOT NULL,
    from_status VARCHAR(30) NULL,
    to_status VARCHAR(30) NOT NULL,
    reason VARCHAR(1000) NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    changed_by_member_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    CONSTRAINT fk_mentor_operation_history_mentor FOREIGN KEY (mentor_id) REFERENCES mentor(mentor_id),
    CONSTRAINT fk_mentor_operation_history_changed_by FOREIGN KEY (changed_by_member_id) REFERENCES member(member_id),
    CONSTRAINT ck_mentor_operation_history_from_status CHECK (
        from_status IS NULL OR from_status IN ('OPEN', 'REQUESTS_PAUSED', 'SUSPENDED')
    ),
    CONSTRAINT ck_mentor_operation_history_to_status CHECK (
        to_status IN ('OPEN', 'REQUESTS_PAUSED', 'SUSPENDED')
    )
);

CREATE INDEX idx_mentor_operation_history_mentor
    ON mentor_operation_history (mentor_id, changed_at);
```

의도:

- 현재 상태는 `mentor.operation_status`를 사용한다.
- 운영 중지/신청 중지 이력은 별도 history로 남긴다.

---

## 7. 구현 메모

### 7.1 바로 써도 되는 조합

현재 API 범위만 기준으로 하면 아래 조합이 1차 구현 최소치다.

- `mentoring_request`
- `mentoring_request_message`
- `mentoring_session`
- `mentoring_review`
- `mentor_screening_history`
- `mentor_operation_history`

### 7.2 지금 만들지 않은 테이블

아래는 일부러 1차에서 제외했다.

- 요청 첨부파일 정규화 테이블
- 요청 링크 정규화 테이블
- 결제/환불/결제이력 테이블
- 멘토 정산 테이블
- 멘토 정산 계좌 테이블

이유:

- 현재 프론트 request editor payload는 JSON 보관으로 충분하다.
- 결제 기능은 후속 단계에서 별도 설계하기로 했다.
- 정산 정보는 프론트에서도 아직 `추후 제공` 상태다.

### 7.3 API와의 매핑 포인트

- `POST /mentoring/requests`
  - `mentoring_request`
- `POST /mentoring/requests/{requestId}/messages`
  - `mentoring_request_message`
- `POST /mentoring/requests/{requestId}/accept`
  - `mentoring_request.status = ACCEPTED`
  - 예약형이면 `mentoring_session` 생성
- `POST /mentoring/requests/{requestId}/reject`
  - `mentoring_request.status = REJECTED`
- `PATCH /mentoring/sessions/{sessionId}`
  - `mentoring_session` 수정
- `POST /mentoring/sessions/{sessionId}/cancel`
  - `mentoring_session.status = CANCELLED`
- `PUT /mentoring/requests/{requestId}/review`
  - `mentoring_review` upsert
- `PATCH /admin/mentoring/mentors/{mentorId}/screening`
  - `mentor.screening_status` 갱신 + `mentor_screening_history` insert
- `PATCH /admin/mentoring/mentors/{mentorId}/operation`
  - `mentor.operation_status` 갱신 + `mentor_operation_history` insert
