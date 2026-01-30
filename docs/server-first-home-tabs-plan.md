# 서버 우선 렌더링 전환 계획 (홈 탭: 밸런스게임/나의스터디기록/명예의전당/아카이브)

작성일: 2026-01-30

## 목표
- **데이터 fetch·계산·조합은 서버에서 완료**
- 브라우저에는 **UI 껍데기 + 인터랙션만** 전달
- App Router의 서버 경계를 명확히 유지 (`page.tsx`는 서버 컴포넌트)

## 현재 문제 요약
- `app` 영역에서 `use client`가 상위에 위치해 **서버 컴포넌트 이점 상실**
- 홈 탭(밸런스게임/나의스터디기록/명예의전당/아카이브)의 데이터 fetch가 **클라이언트 훅 중심**
- 결과적으로 SSR/SEO/초기 로딩 이점이 약화

## 변경 방향
1. **`app` 영역은 서버 컴포넌트 유지**
2. **클라이언트 컴포넌트는 UI/인터랙션 전용**
3. **서버에서 초기 데이터 fetch 후 props로 전달**
4. 클라이언트는 **상호작용(필터, 무한스크롤)만 담당**

## 단계별 작업 계획

### 1) 홈 탭 렌더 경계 정리 (완료)
- `src/app/(service)/home/page.tsx`에서 `searchParams`로 activeTab 결정
- `src/app/(service)/home/home-content.tsx`를 서버 컴포넌트로 변경
- 클라이언트 로직은 `TabNavigation` 등 UI로 제한

### 2) 밸런스게임(community) 서버 프리패치 구조로 전환
- **서버 컴포넌트**: 초기 목록 fetch
- **클라이언트 컴포넌트**: 필터/무한스크롤/모달/작성 동작 담당
- 작업 항목
  - 서버용 API 함수 분리 (`features/balance-game/api/*.server.ts`)
  - `BalanceGamePage`에 `initialData` props 적용
  - `useBalanceGameListQuery`에 `initialData` 주입

### 3) 나의 스터디 기록(server first)
- 서버에서 조회 후 리스트/캘린더 초기 데이터 렌더
- 클라이언트는 viewMode/페이지 변경만 처리
- 작업 항목
  - `features/study/history/api/*.server.ts`
  - `StudyHistoryTab`를 서버 wrapper + client view로 분리

### 4) 명예의 전당(server first)
- 서버에서 랭킹 데이터 fetch
- 클라이언트는 탭/필터 전환만 담당
- 작업 항목
  - `features/hall-of-fame/api/*.server.ts`
  - `HallOfFameTab` 분리 (Server wrapper + Client view)

### 5) 아카이브(server first)
- 서버에서 초기 리스트 fetch
- 클라이언트는 정렬/검색/북마크/좋아요 인터랙션 담당
- 작업 항목
  - `features/archive/api/*.server.ts`
  - `ArchiveTab` 분리 (Server wrapper + Client view)

## 완료 기준
- `app` 내부 페이지에 `use client` 없음
- 초기 렌더에 필요한 데이터는 서버에서 준비
- 클라이언트 fetch는 **추가 상호작용에 한정**

## 체크리스트
- [ ] `rg "use client" src/app` 에서 해당 섹션 page.tsx 제거 확인
- [ ] 홈 탭 첫 진입 시 SSR 데이터 렌더 확인
- [ ] 탭 전환/필터/무한스크롤 정상 동작
- [ ] 네트워크 탭에서 초기 fetch가 서버에서 수행되는지 확인

## 참고 파일(현재 구조)
- `src/app/(service)/home/page.tsx`
- `src/app/(service)/home/home-content.tsx`
- `src/components/home/tabs/community-tab.tsx`
- `src/components/home/tabs/study-history-tab.tsx`
- `src/components/home/tabs/hall-of-fame-tab.tsx`
- `src/components/home/tabs/archive-tab.tsx`
