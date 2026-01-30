# 백엔드 API 명세 변경 요청서

## 요청 일자
2024년 (작성 시점 기준)

## 요청 항목
1대1 스터디 기록 조회 API (`GET /api/v1/study/daily/history`) 관련 명세 확인 및 변경 요청

---

## 1. 변경 배경

프론트엔드에서 "나의 1대1 스터디 기록" 페이지의 UI 개선을 위해 다음 변경이 필요합니다:
- 테이블 컬럼명 변경: "출석" → "역할수행여부"
- 테이블에 "진행상태" 컬럼 추가

---

## 2. 현재 API 사용 현황

### 2.1 API 엔드포인트
```
GET /api/v1/study/daily/history
```

### 2.2 요청 파라미터
```typescript
{
  page?: number;        // 페이지 번호 (0부터 시작)
  size?: number;        // 페이지 크기
  startDate?: string;   // 시작 날짜 (YYYY-MM-DD)
  endDate?: string;     // 종료 날짜 (YYYY-MM-DD)
  sort?: string;        // 정렬 기준 (예: "createdAt,desc")
}
```

### 2.3 현재 응답 구조 (프론트엔드 기대값)

```typescript
{
  statusCode: number;
  timestamp: string;
  content: {
    content: StudyHistoryContent[];
    totalElements: number;
    totalPages: number;
    // ... 기타 페이지네이션 정보
  };
  message: string;
}

interface StudyHistoryContent {
  studyId: number;
  title: string;
  scheduledAt: string;  // ISO Date String
  status: 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';  // 스터디 진행 상태
  studyLink: string | null;
  participation: {
    role: 'INTERVIEWER' | 'INTERVIEWEE';  // 내 역할
    attendance: 'PRESENT' | 'PENDING' | 'ABSENT';  // 역할 수행 여부
  };
  partner: {
    memberId: number;
    nickname: string;
    profileImageUrl: string | null;
  };
}
```

---

## 3. 요청 사항

### 3.1 필드명 및 값 정의 확인 요청

현재 프론트엔드에서 사용 중인 필드들의 명확한 정의를 확인하고 싶습니다:

#### 3.1.1 `participation.attendance` 필드
- **현재 사용 값**: `PRESENT`, `PENDING`, `ABSENT`
- **요청 사항**: 
  - 각 값의 정확한 의미 확인
  - `PRESENT`: 역할을 수행했는지 여부를 나타내는가?
  - `PENDING`: 아직 진행 전인 상태인가?
  - `ABSENT`: 불참 상태인가?
- **프론트엔드 표시**: 
  - `PRESENT` → "역할수행" (성공 아이콘)
  - `PENDING` 또는 `ABSENT` → "미진행" (경고 아이콘)

#### 3.1.2 `status` 필드
- **현재 사용 값**: `COMPLETE`, `IN_PROGRESS`, `PENDING`
- **요청 사항**:
  - 각 값의 정확한 의미 확인
  - `COMPLETE`: 스터디가 완전히 종료된 상태인가?
  - `IN_PROGRESS`: 스터디가 진행 중인 상태인가?
  - `PENDING`: 스터디가 아직 시작되지 않은 상태인가?
- **프론트엔드 표시**:
  - `COMPLETE` → "완료" (성공 아이콘)
  - `IN_PROGRESS` → "진행중" (로딩 아이콘)
  - `PENDING` → "대기중" (시계 아이콘) - 필요시 추가

### 3.2 API 명세 문서화 요청

현재 `GET /api/v1/study/daily/history` API가 OpenAPI 스펙에 포함되어 있지 않은 것으로 보입니다. 
다음 내용을 포함한 명세 문서화를 요청합니다:

1. **엔드포인트 정보**
   - 경로: `/api/v1/study/daily/history`
   - 메서드: `GET`
   - 인증: Bearer Token 필요

2. **요청 파라미터 상세**
   - 각 파라미터의 타입, 필수 여부, 설명
   - 기본값 (있는 경우)

3. **응답 스키마 상세**
   - 각 필드의 타입 및 설명
   - Enum 값들의 의미
   - 예시 응답

4. **에러 응답**
   - 가능한 에러 코드 및 메시지

---

## 4. 프론트엔드 변경 사항

### 4.1 UI 변경
- ✅ 테이블 헤더: "출석" → "역할수행여부"
- ✅ 테이블 행: "출석" 텍스트 → "역할수행" 텍스트
- ✅ 테이블에 "진행상태" 컬럼 추가

### 4.2 데이터 매핑
```typescript
// API 응답 → UI 표시
attendance: 'PRESENT' → "역할수행" (성공 아이콘)
attendance: 'PENDING' | 'ABSENT' → "미진행" (경고 아이콘)

status: 'COMPLETE' → "완료" (성공 아이콘)
status: 'IN_PROGRESS' → "진행중" (로딩 아이콘)
status: 'PENDING' → "대기중" (시계 아이콘) - 필요시
```

---

## 5. 확인 필요 사항

1. **`attendance`와 `status`의 차이점**
   - `attendance`: 사용자가 자신의 역할을 수행했는지 여부
   - `status`: 스터디 전체의 진행 상태
   - 이 이해가 맞는지 확인 필요

2. **값의 일관성**
   - `attendance`의 `PENDING`과 `status`의 `PENDING`이 같은 의미인지?
   - 각 필드가 언제 어떤 값으로 설정되는지?

3. **추가 필드 필요 여부**
   - 현재 응답 구조로 UI 요구사항을 충족할 수 있는지 확인
   - 추가로 필요한 필드가 있는지 검토

---

## 6. 예상 일정

- 프론트엔드 UI 변경: ✅ 완료
- 백엔드 API 명세 확인 및 문서화: 백엔드 팀 협의 필요
- 통합 테스트: API 명세 확인 후 진행

---

## 7. 문의 사항

백엔드 팀에 다음 사항을 확인 요청드립니다:

1. `GET /api/v1/study/daily/history` API의 정확한 명세서 제공
2. `attendance`와 `status` 필드의 값 및 의미 명확화
3. OpenAPI 스펙에 해당 API 추가 여부
4. 추가로 필요한 필드나 변경 사항이 있는지 확인

---

## 8. 참고 자료

### 프론트엔드 파일 위치
- 컴포넌트: `src/components/study-history/study-history-row.tsx`
- 탭 컴포넌트: `src/components/home/tabs/study-history-tab.tsx`
- 타입 정의: `src/types/study-history.ts`
- API 호출: `src/features/study/history/api/get-my-study-history.ts`

### 현재 사용 중인 타입 정의
```typescript
// src/types/study-history.ts
export type StudyRole = 'INTERVIEWER' | 'INTERVIEWEE';
export type AttendanceStatus = 'PRESENT' | 'PENDING' | 'ABSENT';
export type StudyStatus = 'COMPLETE' | 'IN_PROGRESS' | 'PENDING';
```

---

## 작성자
프론트엔드 개발팀

