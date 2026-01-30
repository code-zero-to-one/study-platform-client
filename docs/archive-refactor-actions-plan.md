# 아카이브 리팩토링 계획 (행동 단위 훅 도입)

작성일: 2026-01-30

## 목표

- UI가 “행동 판단/순서/부수효과”를 직접 처리하지 않도록 분리
- Admin처럼 **의미 있는 행동 단위 훅**으로 책임 이동

## 문제점 (현재)

- UI에서 직접 API 훅 호출 + 순서 결정
  - 예: 링크 열기 → 조회수 기록
- UI가 도메인 행동의 오케스트레이션까지 담당

## 계획

### 1) 행동 훅 추가

- `features/archive/model/use-archive-actions.ts`
- 제공 기능
  - `toggleLike(id)`
  - `toggleBookmark(id)`
  - `openAndRecordView(item)` (window.open + view 기록)
  - (옵션) `hide(item)`는 TODO 자리 유지

### 2) UI 수정

- `archive-tab-client.tsx`에서 개별 mutation 훅 제거
- 대신 `useArchiveActions`로 통합

### 3) 책임 정리

- UI는 이벤트 발생만 전달
- 순서/부수효과/실패 처리 정책은 훅 내부

## 완료 기준

- UI에서 `useToggleArchiveLike/Bookmark/useRecordArchiveView` 직접 호출 제거
- 행동 훅을 통한 단일 인터페이스 사용
