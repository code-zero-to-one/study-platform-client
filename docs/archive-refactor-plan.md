# 아카이브 리팩토링 계획 (Admin 구조 기준 반성 포인트 정리)

작성일: 2026-01-30

## 배경
Admin 영역은 **서버/클라이언트 경계**, **API 분리**, **모델/타입/상수 정리**가 비교적 명확함.
반면 아카이브는 기능/데이터/상태가 한 파일에 뭉쳐 있고, 서버 프리패치와 클라이언트 상호작용의 경계도 흐림.

이 문서는 **Admin 구조를 기준으로 아카이브에서 반성할 포인트**를 추리고, 구체적인 리팩토링 계획을 정의한다.

---

## 1. Admin 구조에서 배워야 할 기준 (반성 포인트)

### A. 서버/클라이언트 분리 원칙
- Admin은 `*.server.ts` API와 클라이언트 API가 분리되어 있음.
- 아카이브도 `get-archive.server.ts`가 있지만, **UI/모델에서 초기 데이터 주입 전략이 불명확**함.

### B. 모델 레이어의 역할 분리
- Admin은 Query/Mutation 훅이 **목적별 파일**로 분리되어 있음.
- 아카이브는 목록/북마크/좋아요/조회수가 각각 흩어져 있고, **UI에서 직접 조합하는 책임이 과도**함.

### C. 상수/타입 분리
- Admin은 `const/member.ts`로 옵션/매핑을 분리.
- 아카이브는 옵션/필터 값, 정렬 타입, UI 상태 등이 **컴포넌트 내부에 고정**됨.

### D. 컴포넌트 분해 수준
- Admin은 테이블/모달/필터 UI가 **작게 분해**되어 있음.
- 아카이브는 `archive-tab-client.tsx` 단일 파일에 UI/상태/이벤트/데이터 로직이 함께 있음.

---

## 2. 현재 아카이브 문제점 (구체)

### 1) UI + 데이터 + 상태가 단일 파일에 집중
- `src/features/archive/ui/archive-tab-client.tsx`가
  - 필터/검색/정렬 상태
  - API 훅 호출
  - 테이블/카드 뷰 렌더
  - 이벤트 처리 로직
  모두 포함하고 있음.

### 2) 서버 프리패치가 구조적으로 반영되지 않음
- 서버 래퍼에서 initialData를 주입은 했지만
  - 조건 분기 로직이 컴포넌트 내부에 단편적으로 흩어져 있음
  - 향후 param 증가 시 유지보수 어려움

### 3) 도메인 규칙이 하드코딩됨
- 정렬 옵션, 페이지 크기, UI 문구가 직접 박혀 있어
  - 변경 시 여러 위치 수정 필요
  - 테스트/재사용 어려움

---

## 3. 리팩토링 목표

1. **Admin 수준의 구조 분리 달성**
2. **서버-클라이언트 경계 명확화**
3. **도메인 규칙(옵션/상수) 분리**
4. **UI 컴포넌트 재사용 가능 단위로 분해**

---

## 4. 리팩토링 상세 계획

### Step 1) UI 구조 분리
- `archive-tab-client.tsx`를 아래 구성으로 분해

```
features/archive/ui/
  archive-tab-client.tsx      // 컨테이너 (상태/데이터/조합)
  archive-header.tsx          // 상단 타이틀/관리자 토글
  archive-filters.tsx         // 필터/검색/정렬 UI
  archive-grid.tsx            // 카드 뷰
  archive-list.tsx            // 리스트 뷰
```

### Step 2) 상수/옵션 분리
- `features/archive/const/archive.ts` 신설
  - 정렬 옵션 리스트
  - 기본 page size
  - UI 텍스트 상수

### Step 3) 모델 레이어 정리
- `use-archive-query.ts`는 유지하되
  - 파라미터 생성 로직을 **hooks/util로 분리**
- Mutations도 목적별로 **use-xxx-mutation.ts**에 명확한 책임 유지

### Step 4) 서버 프리패치 표준화
- 서버 래퍼에서 `initialParams` 계산/보존
- 클라이언트는 `params` 변경 시에만 재조회하도록
  - 비교 함수를 util로 분리

### Step 5) 타입베이스드 정리
- 현재 `src/types/archive.ts`가 존재하므로
  - Archive 전용 타입은 여기로 유지
  - API layer에서는 `ArchiveResponse`만 사용

---

## 5. 체크리스트
- [ ] `archive-tab-client.tsx` 분해 완료
- [ ] `features/archive/const/archive.ts` 추가
- [ ] 서버 초기 데이터 주입 흐름 문서화
- [ ] UI/데이터 로직 분리된 상태 확인

---

## 6. 결과 기대 효과
- 변경 범위가 줄어듦 (UI/데이터 분리)
- 유지보수 용이
- 서버 프리패치 일관성 확보
- Admin과 유사한 코드 품질 체계 확보

---

필요하면 위 계획에 맞춰 바로 리팩토링 진행 가능.
