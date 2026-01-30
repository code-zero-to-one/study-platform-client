# Type-based 정리 계획 (밸런스게임/나의스터디기록/명예의전당/아카이브)

작성일: 2026-01-30

## 0. 현재 코드 상태 요약 (다른 팀원 코드 패턴)

- 타입베이스드로 이미 쓰는 패턴
  - `src/components/home/tabs/archive-tab.tsx` → `src/types/archive`
  - `src/components/home/tabs/study-history-tab.tsx` → `src/types/study-history`
- 아직 feature 타입을 쓰는 패턴
  - `src/components/home/tabs/community-tab.tsx` → `src/features/balance-game/types`
  - `src/components/home/tabs/hall-of-fame-tab.tsx` → `src/features/hall-of-fame/types`

즉, **팀 코드도 현재 혼재 상태**이며, 타입베이스드 기준으로는 Balance Game + Hall of Fame 쪽이 정리 대상임.

## 1. 목표

- 홈 탭 관련 주요 도메인에서 **타입 정의를 `src/types`로 통일**
- 동일 의미 타입의 중복 정의 제거
- import 경로 일관화

## 2. 범위

- 밸런스게임 (`home?tab=community`, `insights/weekly` 포함)
- 나의 스터디 기록 (`home?tab=history`)
- 명예의 전당 (`home?tab=hall-of-fame`)
- 아카이브 (`home?tab=archive`)

## 3. 작업 원칙

- 타입은 기능 폴더가 아닌 **프로젝트 공용 타입으로 취급**
- UI/Model/API 어디서든 동일 타입 재사용
- 타입명 충돌 시 **의미 중심 명명**으로 통일

## 4. 세부 작업 계획

### A. Balance Game 타입 정리

현재:

- `src/features/balance-game/types.ts`
- `src/types/voting.ts` (투표 관련 타입 존재)

선택지 (둘 중 하나 결정 필요):

1. `src/types/balance-game.ts` 신설 및 이동
   - 기존 `src/features/balance-game/types.ts` 내용을 복사/이동
   - 기존 `src/types/voting.ts`는 유지 (단, 의미 분리)
2. `src/types/voting.ts`로 통합
   - Balance Game 타입을 voting 기준으로 통합
   - 중복/이름 불일치 정리 필요

**추천:** 1)로 분리하여 명확히 구분 (BalanceGame vs Voting 개념 혼재 방지)

작업 항목:

- `src/features/balance-game/types.ts` → `src/types/balance-game.ts`
- 아래 사용처 import 변경
  - `src/components/home/tabs/community-tab.tsx`
  - `src/app/(service)/insights/weekly/page.tsx`
  - `src/components/card/voting-card.tsx`
  - `src/components/voting/voting-edit-modal.tsx`
  - `src/components/voting/voting-detail-view.tsx`
  - `src/components/discussion/comment-list.tsx` (BalanceGameComment 사용 시)
- `src/features/balance-game/api/balance-game-api.ts` 내부 타입 import도 변경
- 기존 feature 타입 파일 삭제

### B. Hall of Fame 타입 정리

현재:

- `src/features/hall-of-fame/types.ts`

작업 항목:

- `src/features/hall-of-fame/types.ts` → `src/types/hall-of-fame.ts`
- 사용처 import 변경
  - `src/components/home/tabs/hall-of-fame-tab.tsx`
  - `src/features/hall-of-fame/api/hall-of-fame-api.ts`
  - `src/features/hall-of-fame/model/use-hall-of-fame-query.ts`
- 기존 feature 타입 파일 삭제

### C. Study History / Archive 확인

- 이미 `src/types` 사용 중
- 변경 필요 없음
- 단, 신규 타입이 생길 때는 `src/types`로 합류하는지 체크

## 5. 검증 체크리스트

- `rg "features/(balance-game|hall-of-fame)/types" src` 결과 0건
- `rg "@/types/(balance-game|hall-of-fame)" src` 사용처 정상
- 빌드/타입체크 통과
- 홈 탭 화면 동작 확인
  - community (밸런스게임 생성/리스트)
  - history (기록 리스트/캘린더)
  - hall-of-fame (랭킹/팀)
  - archive (리스트/북마크/좋아요)

## 6. 위험 요소 / 주의사항

- BalanceGame vs Voting 네이밍 혼재
  - 이미 `src/types/voting.ts`가 있음 → 통합 여부 결정 필요
- 타입 중복 정의로 인해 API 응답 형태가 달라 보일 수 있음
  - `ApiResponse` 같은 래퍼 타입은 한 곳에서만 관리 권장

## 7. 예상 작업 순서

1. Balance Game 타입 이동 + import 정리
2. Hall of Fame 타입 이동 + import 정리
3. `rg`로 feature 타입 잔존 여부 확인
4. 기본 화면 동작 수동 확인

---

필요하면 위 계획을 기준으로 바로 작업 진행 가능합니다.
