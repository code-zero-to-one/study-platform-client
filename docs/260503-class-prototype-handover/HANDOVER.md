# 260503 — 클래스 프로토타입 인수인계

`feat/dj/class-prototype` 브랜치에서 진행된 한 터미널 세션의 작업 기록 + 다음 담당자 인수인계용. 본 문서는 코드 변경의 **WHY** 와 **prototype 한정 결정** 을 명시해, 정식 머지 또는 다음 라운드 작업 시 안전한 의사결정을 돕는 것이 목적이다.

---

## 1. 세션 컨텍스트

- 브랜치: `feat/dj/class-prototype`
- 작업 시작 시점 origin HEAD: `2e3476ec` (`feat : 클래스 코스 상세 및 커뮤니티 컴포넌트 업데이트`)
- 작업 종료 시점 origin HEAD: `4ae47255`
- 본 세션 신규 커밋 3개:
  - `b6f6472d` `feat : 레슨 상세 + 마이페이지 + 완주 축하 페이지` (21 files / +4,922 / −48)
  - `d799d686` `feat : 데모 리모콘 + 라우팅 가드 + dead code 정리` (10 files / +295 / −539)
  - `4ae47255` `fix : Vercel preview 빌드에서 Sentry 소스맵 업로드 스킵` (1 file / +6 / −1)

세션 흐름: 레슨 상세 페이지 탭바·드로어 재구성 → Cursor 가 다듬어둔 변경 검수 → Phase 6 일괄 커밋 → 사용자 보고 4가지 이슈(드롭다운/라우팅/상태/리모콘) 수정 → Vercel preview 빌드 OOM·timeout 두 차례 분석 후 Sentry 분기로 해결.

---

## 2. 레슨 상세 페이지 탭바·드로어 재구성

`/class/[courseSlug]/[lessonNum]` 의 좌측 sticky 커리큘럼 사이드바를 제거하고 **상단 탭바 + 우측 슬라이드 드로어** 로 정보 구조를 바꿈.

### 변경 파일

| 파일 | 종류 | 핵심 |
|---|---|---|
| `_components/lesson-curriculum-drawer.tsx` | 신규 | 우측 fixed slide-in panel, 챕터 expand · 진행률 바 · ESC/backdrop/X 닫기 |
| `_components/lesson-detail-page.tsx` | 재작성 | 좌측 컬럼 제거, 상단 탭바(따라해보기 / 돌아보기 / 커리큘럼) sticky top 64, 단일 page-scroll, scroll-position 기반 active tab tracking |
| `_components/lesson-right-sidebar.tsx` | 보정 | sticky `top: 88 → 128`, `maxHeight: 104 → 144` (탭바 높이 보정) |
| `_components/lesson-curriculum-sidebar.tsx` | 삭제 | 좌측 사이드바 — `lesson-curriculum-drawer` 로 대체 |

### 작동 원칙

- **`scrollIntoView` 대신 `window.scrollTo({ top: rect.top + scrollY − 172 })`** — sticky 탭바(64+52=116px) + 여유 56px 확보. 추가로 각 섹션에 `scrollMarginTop: 120` 보험.
- **active tab 결정 임계값**: `reflectionRef.getBoundingClientRect().top < window.innerHeight × 0.5` 면 돌아보기 active. 0.5(뷰포트 절반) 가 click intent 와 가장 자연스럽게 맞음.
- **드로어가 `transform: translateX(100%)` 로만 닫힘** — DOM 에 그대로 남아 expand 상태 등 내부 state 유지. 다음 열기 시 사용자가 마지막에 펼쳐둔 챕터 그대로.

---

## 3. Cursor 가 별도 다듬은 변경의 일괄 커밋 (`b6f6472d`)

Phase 6 종료 후 Cursor 에서 추가로 손본 변경들이 작업 트리에 쌓여 있었음. 본 세션에서 한 번에 정리해 커밋.

### 신규 (16개)
- `_components/lesson-content.tsx`, `lesson-curriculum-drawer.tsx`, `lesson-detail-page.tsx`, `lesson-feedback-form.tsx`, `lesson-right-sidebar.tsx`, `qna-detail-modal.tsx` (Cursor 추가 — 질문 카드 클릭 시 풀 디테일 모달)
- `_components/celebrate-page.tsx` (마스코트 SVG + 컨페티 + 통계 + CTA)
- `_components/lesson-curriculum-sidebar.tsx` (Cursor 가 임시 부활시킨 dead code — 후속 커밋에서 제거)
- `pages/mypage/_components/my-class-dashboard.tsx`, `notification-time-page.tsx`, `my-builder-feed-page.tsx`
- `app/class/[courseSlug]/[lessonNum]/page.tsx`, `app/class/[courseSlug]/celebrate/page.tsx`
- `app/(service)/(my)/my-class/page.tsx`, `notification-time/page.tsx`, `my-builder-feed/page.tsx`

### 수정 (5개) — Cursor 의 미세 보정 포함
- `class-gnb.tsx` — 사용자 pill 클릭 시 dropdown menu (마이페이지 / 로그아웃)
- `course-progress-page.tsx` — HUD 단순화: 진행 중 배지 텍스트 `"${num}번째 레슨 진행중" → "Lesson ${num} 진행 중"`, 카운트 옆 "레슨" 접미 라벨 제거, 아이콘은 완주 시에만 노출
- `lead-capture-modal.tsx`, `lead-capture-schema.ts` — `name` 필드 전면 삭제 (전화·이메일만 수집), 토스트 카피·약관 안내 카피도 동기화
- `my-page-sidebar.tsx` — '나의 클래스' expandable LNB 추가 (스터디 후기 ↔ 결제 관리 사이)

### 인수인계 doc 의 미해결 후속 (Cursor 가 명시했지만 본 세션에서도 미수행)
- `vibe-intro` 하드코딩 → `[courseSlug]` 동적 치환 (다코스 대비)
- `PROTOTYPE_LESSON_STATUS` 같은 고정 배열 → 사용자 진행도 API 로 교체 — **본 세션에서 일부 진행 (4번 항목 참고)**
- 레슨/돌아보기 폼 등 실 API 훅 연결
- 인라인 스타일 → `cn()` + 토큰 점진 이전

---

## 4. 사용자 보고 4가지 이슈 일괄 해결 (`d799d686`)

### 4-1. GNB 드롭다운에 '나의 클래스' 항목 제거
- 사용자 의도: 나의 클래스는 **마이페이지 LNB 안에서만** 노출. 드롭다운엔 마이페이지 / 로그아웃 만.
- `class-gnb.tsx` `LoggedInControls` 의 dropdown 메뉴에서 "나의 클래스" `DropdownItem` 제거.

### 4-2. `/my-page`, `/my-class` 라우팅 가드 우회 (prototype 한정)
**증상**: 비로그인 상태로 마이페이지/나의 클래스 클릭 시 `/`(랜딩)으로 redirect.

**원인 두 단계**:
1. `middleware.ts` 가 라우트 정책에 없는 path 를 PROTECTED 로 처리 → 비로그인 redirect.
2. `(my)/layout.tsx` 가 `requireAuthenticatedMemberRoute()` 를 호출 → 또 한 번 redirect.

**수정**:
- `src/features/auth/server/middleware/route-policy.ts` — `/my-page`, `/my-class` 두 prefix 를 `PUBLIC_SESSION` 으로 등록.
- `src/app/(service)/(my)/layout.tsx` — `requireAuthenticatedMemberRoute()` 호출 임시 제거. 코드 내 코멘트로 **정식 머지 전 복구 필요** 명시.

⚠️ **prototype 한정 변경**: 이 우회는 `(my)` 그룹 내 모든 라우트 (/my-activity, /my-study, /my-study-review, /payment-management 등) 도 비로그인 접근 가능하게 만들었음. 다음 사람은 develop·main 머지 전에 반드시 가드 복원해야 함.

### 4-3. 진행 상태 zustand store 도입
**증상**: 돌아보기 폼 제출해도 다음 레슨 해금 안 됨. 완주 페이지 도달 불가.

**원인**: `course-progress-page.tsx`, `lesson-detail-page.tsx` 가 모듈 레벨 `const PROTOTYPE_LESSON_STATUS` 하드코딩 (불변). 폼 submit 으로 상태가 바뀔 곳이 없음.

**수정**: `_data/use-class-prototype-store.ts` 신규 (zustand).

```ts
{
  lessonStatus: LessonStatus[],   // 기본 [done×2, current, locked×7]
  isLoggedIn: boolean,            // 기본 true
  reset: () => void,              // 기본 상태 복원
  markAllDone: () => void,        // 전부 done
  completeLesson: (num: number) => void,
                                  // num 을 done 으로, num+1 이 locked 면 current 로 전이
  setLoggedIn: (value: boolean) => void,
}
```

연결:
- `course-progress-page.tsx`, `lesson-detail-page.tsx` 의 `PROTOTYPE_LESSON_STATUS` 참조를 `useClassPrototypeStore((s) => s.lessonStatus)` 로 교체.
- `lesson-feedback-form.tsx` 의 submit 분기에 `completeLesson(lessonNum)` 호출 추가. 이제 폼 valid → 제출 → 다음 레슨이 학습 여정 지도에서 즉시 `current` 로 보임.

⚠️ **휘발성**: zustand 인메모리 store 라 새로고침 시 기본 상태 복원. 데모 시나리오 일관성에는 도움 (`DemoControls` 의 "진행 상태 리셋" 도 동일 효과). 영구 저장이 필요하면 `persist` middleware 추가.

### 4-4. DemoControls 플로팅 리모콘
**요청**: 디자인 원본의 우측 하단 컴파스 버튼처럼, 데모용 페이지 점프 + 상태 토글 패널.

**구현**: `_components/demo-controls.tsx`
- 닫힘: 우측 하단 `bottom: 24, right: 24` 검정 원형 52×52 + `explore` 아이콘
- 열림: 256px 패널
  - **DEMO NAV** 헤더 + 닫기 X
  - 페이지 점프 8개: 클래스 메인 / 코스 상세 / 학습 여정 지도 / 레슨 3 (현재) / 완주 축하 페이지 / 빌더 피드 / 마이페이지 / 나의 클래스 — 현재 path 는 `#FFE4E8` 배경 + 분홍 텍스트로 자동 highlight
  - 구분선
  - 상태 액션 3개: **로그아웃 시뮬** (store toggle) / **진행 상태 리셋** / **완주 상태로**

마운트: `src/app/layout.tsx` (root layout) 의 `<body>` 안에 `<DemoControls />`. 모든 페이지에서 노출.

⚠️ **prototype 한정 변경**: production 빌드에 그대로 들어가면 사용자가 보게 됨. 정식 머지 시점엔 `process.env.NEXT_PUBLIC_PROTOTYPE === 'true'` 같은 환경변수 분기로 감싸거나 root mount 자체 제거 필요.

### 4-5. dead code 제거
- `lesson-curriculum-sidebar.tsx` (497줄, import 0건) `git rm`. 2번 항목의 `b6f6472d` 가 Cursor 가 임시 부활시킨 파일을 그대로 포함했었음 → `d799d686` 에서 정리.

---

## 5. Vercel preview 빌드 OOM / timeout 디버깅 (`4ae47255`)

### 증상 시퀀스
1. **`b6f6472d` push 후 1차 빌드 (~05:12)**: compile 3분 통과 → "Linting and checking validity of types ..." 진입 후 ~2분 만에 **OOM SIGKILL** (Vercel "Out of Memory" 명시 보고).
2. **`d799d686` push 후 2차 빌드 (~05:12)**: 동일 단계 진입 후 ~40분간 출력 없이 **45분 timeout**.

### 사용자 제약
- 우회 옵션 (`typescript.ignoreBuildErrors`, `eslint.ignoreDuringBuilds`) 사용 금지
- `NODE_OPTIONS=--max-old-space-size=*` 같은 빌드 메모리 확장 금지
- 즉 코드/설정 차원의 진짜 원인 해결 필요

### 진단 데이터
- 로컬 `yarn typecheck` (= `tsc --noEmit`) **11초** 클린 통과 — 타입 자체는 멀쩡
- 로컬 `yarn build` (= `next build`) **3:30** 통과 — `next build` 자체도 정상
- Vercel 무료 플랜 **8 GB / 2 코어 / 45분** 한도 — 환경 한정 제약
- Vercel "Linting and checking validity of types ..." 라벨 출력 후 침묵 → log 의 "active step" 라벨은 그 시점의 가장 최근 메시지를 보여주는 것뿐, 실제로는 **백그라운드 Sentry 소스맵 업로드** 가 진행 중일 가능성

### 핵심 단서: 로컬 vs Vercel 비대칭의 출처
- **로컬에는 `SENTRY_AUTH_TOKEN` 환경변수 없음** → `withSentryConfig` 의 `silent: !process.env.SENTRY_AUTH_TOKEN` 분기로 업로드 자동 스킵 → 3:30 빌드.
- **Vercel 에는 토큰 세팅 있음** → Sentry 가 sourcemap 을 sentry.io 로 실제 업로드 → 무료 플랜 8GB / 2코어 환경에서 ~12,000줄 분량 prototype 코드의 sourcemap 을 모두 올리느라 40+분 소요.
- Sentry 옵션 `widenClientFileUpload: true` 가 client bundle 전반의 sourcemap 까지 업로드 대상으로 잡고 있어서 코드 양 증가가 업로드 시간으로 직격됨.

### 적용한 수정 (`4ae47255`)
`next.config.ts` 마지막에 `VERCEL_ENV === 'preview'` 분기 추가:

```ts
const sentryConfig = withSentryConfig(nextConfig, { ... });

const isVercelPreview = process.env.VERCEL_ENV === 'preview';
const baseConfig = isVercelPreview ? nextConfig : sentryConfig;

export default withBundleAnalyzer(baseConfig);
```

영향:
- **로컬 yarn build**: 토큰 없어 원래도 silent → 동작 변화 없음 (3:30 유지)
- **Vercel preview** (`VERCEL_ENV=preview`): Sentry 래핑 자체 건너뜀 → sourcemap 업로드 비활성 → 빌드 시간 폭 감소 기대
- **Vercel production** (`VERCEL_ENV=production`): 기존 동작 유지 → Sentry 정상 작동, sourcemap 업로드 활성

⚠️ **prototype 한정 정당화**: 이 분기는 preview 환경에서만 Sentry 를 끈다. prototype 브랜치는 production 으로 머지될 일이 없으므로 production 모니터링에 영향 없음. 다른 브랜치의 preview 빌드도 영향을 받지만, 이는 모든 미발행 코드의 sourcemap 을 굳이 매 preview 마다 sentry.io 에 올리지 않는 합리적 default 로도 해석 가능. 정식 머지 시 검토 권장.

---

## 6. prototype 한정 변경 — 정식 머지 전 복원 체크리스트

| 위치 | 변경 | 복원 방법 |
|---|---|---|
| `src/app/(service)/(my)/layout.tsx` | `requireAuthenticatedMemberRoute()` 호출 제거 | 호출 라인 + import 복구 |
| `src/features/auth/server/middleware/route-policy.ts` | `/my-page`, `/my-class` PUBLIC_SESSION 등록 | 두 entry 삭제. `/my-class` 가 정식 운영 라우트가 되면 별도 정책 결정 필요 |
| `src/app/layout.tsx` | `<DemoControls />` root mount | 마운트 제거 또는 `process.env.NEXT_PUBLIC_PROTOTYPE === 'true'` 환경변수 가드로 감싸기 |
| `src/components/pages/class/_components/demo-controls.tsx` | 데모 페이지 점프·상태 토글 패널 | production 에서 노출되면 안 됨. mount 가드로 충분하지만 컴포넌트 자체를 prototype-only 디렉터리로 옮기는 것도 옵션 |
| `src/components/pages/class/_data/use-class-prototype-store.ts` | 인메모리 진행 상태 store | 실 사용자 진행도 API + zustand persist 또는 server state 로 교체 |
| `src/components/pages/class/_components/course-progress-page.tsx`, `lesson-detail-page.tsx` | store 에서 `lessonStatus` 읽기 | API 데이터 source 로 교체 (구조는 그대로 사용 가능) |
| `src/components/pages/class/_components/lesson-feedback-form.tsx` | submit 시 `completeLesson()` 호출 | 실 API mutation hook 으로 교체 |
| `next.config.ts` | `VERCEL_ENV === 'preview'` 시 Sentry 스킵 | preview 에서도 Sentry 가 필요해지면 분기 제거 또는 더 좁은 조건(예: 특정 브랜치 한정) |

---

## 7. 보존된 사용자 컨벤션 / 미해결 리스크

### 보존
- 인라인 스타일 + 토큰값 hex 직접 사용 패턴 (디자인 fidelity 우선 — 사용자 명시 지시)
- 하드코딩된 `vibe-intro` 코스 slug 다수
- 8GB Vercel 컨테이너 한도 — 본 세션은 Sentry 우회로만 대응했고, 코드 양이 더 늘면 같은 문제 재발 가능

### 리스크
- prototype 한정 가드 제거가 develop 머지 시 보안 가드 누락으로 이어질 수 있음 — 6번 체크리스트로 검증 필수.
- `(my)` 그룹의 다른 페이지들(`/my-activity` 등)은 비로그인 데모 환경에서 user data fetch 실패로 화면이 깨질 수 있음. 이번 사용자가 보려던 건 `/my-page` (placeholder) + `/my-class` (정적 UI) 두 곳이라 그 외는 데모 시 피하는 것을 권장.
- Vercel 프리뷰의 Sentry 비활성화로, preview 환경 에러 모니터링은 해당 분기 동안 누락된다.

---

## 8. 다음 작업 후보 (우선순위 순)

1. **Vercel preview 빌드 결과 확인** — `4ae47255` 의 Sentry 분기로 빌드 통과 시 그대로 데모 가능. 또 timeout 나면 추가 진단 필요 (예: `widenClientFileUpload: false` 만 분기 적용해 부분 비활성화).
2. **dead code · prototype 한정 변경 점진 정리** — 6번 체크리스트의 핵심 항목(/my layout 가드, DemoControls 환경변수 가드)부터.
3. **하드코딩 `vibe-intro` → `[courseSlug]` 치환** — 다코스 대비. 컴포넌트 props 통한 slug 전파 + 데이터 소스 동적화.
4. **인라인 스타일 → 디자인 토큰** — 점진. 가장 자주 손대는 컴포넌트(레슨 상세, 빌더 피드)부터.
5. **실 API 연결** — 진행 상태, 빌더 피드, Q&A — `hooks/queries/` 패턴으로 TanStack Query 훅 작성.
6. **회원가입 온보딩 카피 / 경험치·등업 이펙트 / 커뮤니티 규정 모달** 등 v0.2 스펙의 polish 잔여 항목.

---

## 9. 빠른 git 참조

```text
4ae47255  fix : Vercel preview 빌드에서 Sentry 소스맵 업로드 스킵       (next.config.ts +6/-1)
d799d686  feat : 데모 리모콘 + 라우팅 가드 + dead code 정리             (10 files +295/-539)
b6f6472d  feat : 레슨 상세 + 마이페이지 + 완주 축하 페이지              (21 files +4922/-48)
2e3476ec  feat : 클래스 코스 상세 및 커뮤니티 컴포넌트 업데이트          (← 세션 시작 시점)
```
