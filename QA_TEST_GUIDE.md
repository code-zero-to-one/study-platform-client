# 미션/숙제 기능 QA 테스트 가이드

## 개요
백엔드 API 오류로 인해 Mock 데이터를 사용하여 미션/숙제 관련 기능을 테스트할 수 있도록 설정했습니다.

## Mock 모드 설정

현재 다음 파일들에서 `USE_MOCK = true` 로 설정되어 있습니다:

1. `src/hooks/queries/group-study-homework-api.ts`
2. `src/hooks/queries/peer-review-api.ts`
3. `src/hooks/queries/evaluation-api.ts`
4. `src/hooks/queries/mission-api.ts`

**백엔드 API를 다시 사용하려면**: 각 파일의 `USE_MOCK` 값을 `false`로 변경하고 주석 처리된 API 호출 코드의 주석을 해제하면 됩니다.

## 구현된 기능

### 1. 미션 목록 및 상세
- ✅ 미션 목록 조회 (진행중/완료 필터링)
- ✅ 미션 상세 정보 조회
- ✅ 미션 생성 모달 (리더 전용)
- ✅ 미션 수정/삭제 모달 (리더 전용)

### 2. 숙제 제출
- ✅ 숙제 제출 모달
  - 텍스트 내용 (최소 100자)
  - 첨부 링크 (선택사항)
- ✅ 숙제 수정 모달 (평가 전까지만 가능)
- ✅ 숙제 삭제 모달 (평가 전까지만 가능)

### 3. 리더 평가
- ✅ 평가 생성 모달 (리더 전용)
  - 등급 선택 (A+, A-, B+, B-, C+, C-, F)
  - 정성 코멘트 입력
- ✅ 평가 후에는 숙제 수정/삭제 불가능

### 4. 피어 리뷰
- ✅ 피어 리뷰 작성 (본인 과제와 리더는 작성 불가)
- ✅ 피어 리뷰 수정/삭제 (본인 리뷰만 가능)
- ✅ 리뷰 작성자 정보 표시
- ✅ 수정 여부 표시

## 테스트 시나리오

### 시나리오 1: 미션 조회 및 숙제 제출 (일반 멤버)
1. 미션 목록 페이지 접근
2. 진행 중인 미션 선택 (예: "React Hooks 학습")
3. 미션 상세 정보 확인
4. "과제 제출하기" 버튼 클릭
5. 과제 상세 내용 입력 (100자 이상)
6. 첨부 링크 입력 (선택사항)
7. "제출하기" 버튼 클릭
8. 제출 완료 확인

### 시나리오 2: 숙제 수정/삭제 (본인 과제)
1. 제출한 과제 상세 페이지 이동
2. "수정하기" 버튼으로 과제 내용 수정
3. "삭제하기" 버튼으로 과제 삭제 (확인 모달)
4. ⚠️ 평가가 완료된 과제는 수정/삭제 불가

### 시나리오 3: 리더 평가 (리더 역할)
1. 멤버가 제출한 과제 상세 페이지 접근
2. "리더 평가" 섹션에서 "과제 평가하기" 버튼 클릭
3. 평가 등급 선택 (A+~F)
4. 정성 코멘트 작성
5. "평가 완료" 버튼 클릭
6. 평가 결과 확인

### 시나리오 4: 피어 리뷰 작성 (일반 멤버)
1. 다른 멤버의 과제 상세 페이지 접근
2. "피어 리뷰" 섹션 하단의 입력창에 리뷰 작성
3. "등록" 버튼 클릭
4. 작성한 리뷰 확인
5. 본인 리뷰의 "..." 메뉴에서 수정/삭제 가능

### 시나리오 5: 피어 리뷰 제한 확인
1. ❌ 본인의 과제에서는 피어 리뷰 작성 불가
2. ❌ 리더는 피어 리뷰 작성 불가
3. ✅ 일반 멤버만 다른 멤버의 과제에 피어 리뷰 가능

## Mock 데이터 구조

### Mock 사용자 정보
- **현재 사용자 ID**: 1
- **리더 여부**: `useLeaderStore`와 `useUserStore`에서 확인
- 테스트 시 리더/멤버 권한에 따라 다른 기능 접근 가능

### Mock 미션 데이터
- 미션 ID: 1 - "React Hooks 학습" (진행중)
- 미션 ID: 2 - "TypeScript 기초" (시작 전)
- 미션 ID: 3 - "JavaScript ES6+ 복습" (완료)

### Mock 숙제 데이터
- Homework ID: 1 (제출 완료 상태)
- 피어 리뷰 2개 포함
- 평가는 초기에 없음 (리더가 평가 가능)

### Mock 평가 등급
- A+ (95점)
- A- (90점)
- B+ (85점)
- B- (80점)
- C+ (75점)
- C- (70점)
- F (0점)

## 데이터 저장 방식

Mock 데이터는 **localStorage**에 저장됩니다:
- `homework_{homeworkId}`: 숙제 상세 정보
- `peerReviews_{homeworkId}`: 해당 숙제의 피어 리뷰 목록

### 데이터 초기화
브라우저의 localStorage를 비우면 Mock 데이터가 초기화됩니다:
```javascript
localStorage.clear(); // 개발자 도구 콘솔에서 실행
```

## 주요 파일 위치

### 컴포넌트
- `src/components/section/mission-section.tsx` - 미션 목록/상세 페이지
- `src/components/contents/mission-detail-content.tsx` - 미션 상세 컨텐츠
- `src/components/contents/homework-detail-content.tsx` - 숙제 상세 컨텐츠

### 모달
- `src/components/modals/submit-homework-modal.tsx` - 숙제 제출
- `src/components/modals/edit-homework-modal.tsx` - 숙제 수정
- `src/components/modals/delete-homework-modal.tsx` - 숙제 삭제
- `src/components/modals/create-evaluation-modal.tsx` - 평가 생성

### API 훅
- `src/hooks/queries/group-study-homework-api.ts` - 숙제 관련 API
- `src/hooks/queries/peer-review-api.ts` - 피어 리뷰 API
- `src/hooks/queries/evaluation-api.ts` - 평가 API
- `src/hooks/queries/mission-api.ts` - 미션 API

### Mock 데이터
- `src/mocks/homework-mock-data.ts` - 모든 Mock 데이터 정의

## 알려진 제한사항

1. **사용자 권한**: Mock 데이터에서는 현재 사용자 ID가 고정(1)되어 있습니다.
2. **미션 생성/수정/삭제**: Mock 모드에서 실제로 동작하지 않습니다 (실제 API 필요).
3. **이미지 업로드**: 프로필 이미지는 기본 이미지(`/profile-default.svg`)만 사용됩니다.
4. **페이지네이션**: Mock 데이터는 전체 목록만 반환합니다.

## 백엔드 복구 후 작업

백엔드 API가 정상화되면:

1. 각 API 훅 파일에서 `USE_MOCK = false` 로 변경
2. 주석 처리된 API 호출 코드 활성화
3. Mock import 문 제거 (선택사항)
4. localStorage 초기화

```typescript
// 예시: src/hooks/queries/group-study-homework-api.ts
const USE_MOCK = false; // true → false 로 변경
```

## 문의사항

QA 테스트 중 문제가 발생하거나 질문이 있으시면 개발팀에 문의해 주세요.
