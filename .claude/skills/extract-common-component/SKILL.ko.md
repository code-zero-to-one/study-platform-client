---
name: extract-common-component
description: '2개 이상의 페이지 인라인 JSX에서 공통 컴포넌트를 추출한다. 두 모드: Discovery(코드베이스 자동 탐색)와 Direct(사용자가 직접 지정). Figma 발산 검사, 컴포넌트 + 필수 Storybook 스토리 생성, 인라인 중복 전체 교체. 트리거: "공통 컴포넌트로 빼줘", "공통화해줘", "여러 페이지에서 쓰이는", "재사용 컴포넌트", "공통 컴포넌트 만들어줘", "extract common", "common component", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘", "자동으로 찾아줘", "중복 찾아줘". 사용자 확인 후 커밋; /pr은 사용자가 직접 실행.'
---

# extract-common-component

## 목적

2개 이상의 페이지 파일에 인라인으로 반복된 UI 패턴을 찾아, Figma(URL 제공 시) 또는 코드베이스 분석으로 시각적 동일성을 확인하고, `src/components/common/` 아래에 공통 컴포넌트를 생성하며, 필수 Storybook 스토리를 작성하고, 모든 인라인 중복을 교체한다. 커밋 전 사용자 확인을 위해 일시 중지한다.

`design-to-dev`와의 핵심 차이점 세 가지:
- Storybook은 **항상** 생성한다 (선택적 아님)
- 기존 페이지 파일을 **수정**한다 (인라인 JSX를 import로 교체)
- 발산 검사는 **필수** — 구조적으로 다를 경우 중단

## 모드

| 모드 | 진입 조건 | 첫 단계 |
|------|----------|---------|
| **Discovery** | 사용자가 특정 컴포넌트를 지정하지 않음 ("자동으로 찾아줘", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘") | 0단계 |
| **Direct** | 사용자가 컴포넌트 이름 또는 패턴을 직접 명시 | 1단계 |

## 사용 시점

- 사용자가 "공통 컴포넌트로 빼줘", "공통화해줘", "여러 페이지에서 쓰이는", "재사용 컴포넌트", "공통 컴포넌트 만들어줘", "extract common", "common component" 라고 말할 때
- 사용자가 "자동으로 찾아줘", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘", "중복 찾아줘" 라고 말할 때 (→ Discovery 모드)
- UI 패턴이 2개 이상의 페이지 파일에 동일하게 또는 prop 수준의 변형으로 존재할 때
- 출력이 `src/components/common/` 아래에 위치해야 할 때

## 사용하지 않을 시점

- 발생 위치가 1개뿐일 때 → `design-to-dev` 사용
- 인라인 구현 없이 새 컴포넌트를 만들 때 → `design-to-dev` 사용
- 사용자가 도메인 전용(공유 아님) 컴포넌트를 원할 때 → 인라인으로 처리
- 디자인이 구조적으로 발산(레이아웃 차이 >30%)할 때 → 중단 후 사용자에게 보고

## 입력

- 컴포넌트 이름 또는 설명 (Discovery 모드에서는 선택적 — 스킬이 후보를 자동 탐색)
- 각 발생 위치의 Figma URL (선택 — 발산 검사 활성화)
- 인라인으로 나타나는 페이지 파일 목록 (선택 — 미제공 시 grep으로 탐색)

---

## 단계

### 0단계. Discovery 모드 (Direct 모드 시 건너뜀)

**목표:** 중복 가치 기준으로 상위 5–10개 추출 후보를 제시하고, 사용자가 하나를 선택하도록 한다.

#### 0a. 구조적 패턴 탐색 (AST grep)

`mcp__plugin_oh-my-claudecode_t__ast_grep_search`를 사용해 여러 파일에서 반복되는 JSX 패턴을 탐색. 다음 쿼리를 병렬 실행:

```
# 카드형 패턴: 여러 자식을 가진 className div
pattern: <div className="$CLASS">$$$CHILDREN</div>
files: src/app/**/*.tsx, src/components/pages/**/*.tsx

# 섹션/배너 패턴
pattern: <section className="$CLASS">$$$CHILDREN</section>

# map 안에서 반복되는 리스트 아이템 패턴
pattern: {$LIST.map(($ITEM) => (<$TAG className="$CLASS">$$$BODY</$TAG>))}
```

각 매치에 대해 기록:
- 파일 경로
- 줄 범위 (시작–끝)
- JSX 블록 크기 (줄 수)
- `className` 지문 (className 값의 앞 60자)

#### 0b. className 지문 탐색 (grep)

```bash
# 페이지 파일에서 30자 이상의 className 문자열 추출
grep -rh 'className="[^"]\{30,\}"' src/app/ src/components/pages/ --include="*.tsx" \
  | sed 's/.*className="\([^"]*\)".*/\1/' \
  | sort | uniq -d -c | sort -rn | head -20
```

교차 검증: 2개 이상의 파일에서 나타나는 `className` 문자열이 후보 지문.

#### 0c. 후보 랭킹

각 후보에 점수 부여:

```
점수 = 파일 수 × 블록 줄 수
```

중복 제거 (AST와 className 결과가 겹칠 수 있음). 상위 10개 유지.

#### 0d. 후보 테이블 제시

랭킹 테이블을 출력한다. **사용자 선택 대기.**

```
중복 UI 패턴 발견 — 추출할 항목을 선택하세요:

 #  패턴                              파일  줄수  제안 이름
 1  EmptyState (아이콘 + 텍스트 + CTA)   4    18  EmptyState
 2  SectionHeader (제목 + 부제목)         3    12  SectionHeader
 3  StudyCard 썸네일 행                   3    24  StudyCardThumbnail
 4  Badge + 레이블 스택                   2     8  BadgeLabel
 5  페이지네이션 컨트롤                   2    14  Pagination
 ...

번호로 답하세요 (예: "2"). 취소하려면 "없음".
```

- 사용자가 번호로 답하면 → 해당 행의 `{컴포넌트패턴}`과 제안 이름 설정 → 1단계로 진행
- 사용자가 "없음"으로 답하면 → 중단, "추출이 수행되지 않았습니다." 출력
- 사용자가 목록에 없는 다른 컴포넌트를 지명하면 → Direct 모드로 처리, 해당 입력으로 1단계 진행

---

### 1단계. 인라인 발생 위치 찾기

사용자가 파일 목록을 제공하지 않으면 코드베이스를 grep:

```bash
grep -r "{컴포넌트패턴}" src/app/ src/components/pages/ --include="*.tsx" -l
```

`{컴포넌트패턴}`을 컴포넌트 이름, 설명의 특징적인 JSX 스니펫, 또는 Discovery 0b단계의 className 지문으로 교체.

찾은 파일 전체 목록 출력.

**차단 S1:** 위치가 2개 미만 → **중단**. 보고: "발생 위치가 1개뿐입니다. `design-to-dev`를 사용하세요."

### 2단계. Figma 발산 검사 (URL 제공 시)

**각** Figma URL에 대해 병렬 실행:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)`

`.claude/rules/figma-design.md`를 철저히 따를 것 — **모든** 속성 읽기 (회전, 그라디언트, 이펙트, 계층 구조). 스크린샷만으로 구현 금지.

모든 발생 위치에 대해 분류:

| 결과 | 정의 | 조치 |
|------|------|------|
| **동일** | 시각적 차이 없음 | 단일 컴포넌트, variant prop 없음 |
| **Prop 변형** | 동일 구조, 다른 색상/텍스트/상태 | typed `variant` prop이 있는 단일 컴포넌트 |
| **구조적 발산** | 레이아웃 차이 >30% (그리드, 요소 수, 중첩 구조 다름) | **중단 S2** — 차이점을 사용자에게 보고 |

Figma URL 없이: 파일 간 JSX 구조를 코드베이스만으로 분석 진행.

**차단 S2:** 디자인 구조적 발산 → **중단**. 정확한 차이 보고: 어떤 노드가 다른지, 어떤 레이아웃 속성이 충돌하는지.

### 3단계. 에셋 다운로드 (Figma 이미지 에셋 발견 시)

`figma-fetch` 규칙 준수:
- 디자인에서 참조된 모든 이미지 에셋을 `/public/{route-slug}/`에 다운로드
- **절대** 컴포넌트 소스에 Figma MCP URL 하드코딩 금지 — 항상 로컬 `/public/` 경로 사용

### 4단계. 토큰 매핑

모든 Figma 변수(또는 기존 코드의 인라인 Tailwind 클래스)를 `src/app/global.css` `@theme inline` 토큰으로 매핑:

| 매치 | 조치 |
|------|------|
| ✅ 정확 | 프로젝트 토큰 사용 (`p-200`, `rounded-150`) |
| ⚠️ 근접 | **가장 가까운** 프로젝트 토큰 사용 — 커밋 본문에 편차 기록 |
| ❌ 없음 | 가장 가까운 것 사용 — **절대** 임의값(`p-[4px]`) 또는 기본 Tailwind 스케일(`p-4`) 사용 금지 |

기본 Tailwind 스케일은 **금지** — 프로젝트의 `@theme inline` 리셋 후 `undefined`로 해석됨.

### 5단계. 컴포넌트 위치 결정

| 컴포넌트 성격 | 위치 |
|------------|------|
| 순수 UI (도메인 데이터 없음, API 없음) | `src/components/common/ui/{컴포넌트명}.tsx` |
| 도메인 컨텍스트 또는 레이아웃 포함 | `src/components/common/{컴포넌트명}.tsx` |

### 6단계. 컴포넌트 생성

5단계에서 결정한 위치에 작성.

요구사항:
- 모든 `className` 조합에 `cn()` 사용 — 템플릿 리터럴 금지
- 커스텀 프로젝트 토큰만 사용 — 임의값, 기본 Tailwind 스케일 금지
- TypeScript `Props` 인터페이스 필수 (exported)
- 디자인 차이 있을 경우 `variant` 또는 `type` 필드로 typed variant props
- 선택적 백엔드 필드 → `.claude/rules/backend-data-safety.md`에 따라 `?` + safe guards

작성 후:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

**차단 S3:** `yarn typecheck` 실패 → **중단**. 정확한 TypeScript 에러 보고.

### 7단계. Storybook 스토리 생성 (항상 — 선택 아님)

컴포넌트와 같은 디렉토리에 `{컴포넌트명}.stories.tsx` 작성:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {컴포넌트명} } from './{컴포넌트명}';

const meta = {
  title: 'Components/{컴포넌트명}',
  component: {컴포넌트명},
} satisfies Meta<typeof {컴포넌트명}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* 첫 번째 Figma 발생 또는 주요 사용처에 맞는 props */ },
};

// Figma 또는 코드베이스에서 발견된 각 변형별 스토리
export const {변형명}: Story = {
  args: { /* 변형별 props */ },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { /* Default와 동일 */ },
};
```

**저하 S4:** 스토리 생성 실패(컴파일 에러, args 누락) → 컴포넌트만 계속 진행 + 경고 출력. **중단 금지**.

### 8단계. 인라인 중복 교체

1단계에서 찾은 **각** 파일에 대해:

1. 파일 상단에 import 추가:
   ```typescript
   import { {컴포넌트명} } from '@/components/common/{경로}';
   ```
2. 인라인 JSX 블록을 교체:
   ```tsx
   <{컴포넌트명} {...기존Props} />
   ```
3. 기존 prop 값을 정확히 보존 — 로직 변경 없이 JSX 구조만 수정

모든 교체 후:

```bash
yarn typecheck
```

**차단 S3 (반복):** `yarn typecheck` 실패 → 중단. 에러 보고.

### 9단계. 검증 게이트

**일시 중지.** 커밋 전 사용자 확인을 위해 요약 출력 후 대기:

```
✓ 컴포넌트:    src/components/common/{경로}/{컴포넌트명}.tsx
✓ 스토리:      src/components/common/{경로}/{컴포넌트명}.stories.tsx
✓ 교체됨:      {N}개 페이지 파일 업데이트
  - src/app/(landing)/{page1}/page.tsx
  - src/components/pages/{page2}.tsx
✓ 타입체크:    통과

토큰 편차 (있는 경우):
  - {Figma 토큰} → 근접: {프로젝트 토큰} (차이: {값})

TODOs (있는 경우):
  - [ ] {보류 항목}

OK라고 답하면 커밋합니다. 수정할 사항이 있으면 알려주세요.
```

사용자가 "OK" 또는 동등한 확인을 답하기 전까지 **커밋하지 않는다**.

### 10단계. 커밋

사용자 확인 후:

```bash
git add src/components/common/{경로}/{컴포넌트명}.tsx \
        src/components/common/{경로}/{컴포넌트명}.stories.tsx \
        {모든 수정된 페이지 파일}

git commit -m "feat : {컴포넌트명} 공통 컴포넌트 추출"
```

커밋 본문에 반드시 포함:
- 교체된 페이지 파일 목록
- 4단계에서 기록한 토큰 편차
- 다음에 처리할 보류 TODOs

### 11단계. 종료

출력: `develop에 PR을 열려면 /pr을 실행하세요.`

자동으로 push하거나 PR을 열지 않는다.

---

## 차단 참조

| ID | 조건 | 조치 |
|----|------|------|
| **S1** | 발생 위치 2개 미만 | 중단 — `design-to-dev` 안내 |
| **S2** | Figma 디자인 구조적 발산 (레이아웃 차이 >30%) | 중단 — 정확한 차이를 사용자에게 보고 |
| **S3** | `yarn typecheck` 실패 (컴포넌트 작성 후 또는 교체 후) | 중단 — TypeScript 에러 보고 |
| **S4** | Storybook 스토리 실패 (컴파일 에러) | 경고 후 계속 — 중단 금지 |

---

## `design-to-dev`와의 핵심 차이

| 항목 | design-to-dev | extract-common-component |
|------|--------------|--------------------------|
| Storybook | 선택적 (사용자 요청 시) | **항상 생성** |
| 기존 페이지 파일 | 건드리지 않음 | **모든 인라인 중복 교체** |
| 입력 | 단일 Figma URL | 2개 이상 URL 또는 코드베이스 grep |
| 컴포넌트 위치 | `src/components/...` (유연) | `src/components/common/` (고정) |
| 발산 검사 | 해당 없음 | **필수** — 디자인 차이 시 중단 |
| 트리거 | 만들 단일 컴포넌트 | 통합할 기존 중복 |
| Discovery | 해당 없음 | **자동 탐색** (컴포넌트 미지정 시) |

---

## 최종 체크리스트

- [ ] 모드 결정: Discovery (0단계) 또는 Direct (1단계)
- [ ] **Discovery 전용:** 후보 테이블 제시, 사용자가 선택
- [ ] 발생 위치 2개 이상 확인 (1단계)
- [ ] Figma 디자인 분류: 동일 / prop 변형 / 발산 (2단계)
- [ ] 발산 → 보고 후 중단 (S2)
- [ ] 모든 Figma 이미지 에셋 `/public/`에 다운로드 (3단계)
- [ ] 토큰 매핑 테이블 작성 (4단계)
- [ ] 컴포넌트: `cn()`, 커스텀 토큰만, TypeScript `Props` 인터페이스 (6단계)
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` 통과 (6단계)
- [ ] Storybook 스토리 생성: Default + 변형 스토리 + Mobile 스토리 (7단계)
- [ ] 모든 인라인 중복을 `import` + `<컴포넌트명 />` 으로 교체 (8단계)
- [ ] 교체 후 `yarn typecheck` 통과 (8단계)
- [ ] 커밋 전 사용자 확인 (9단계)
- [ ] 단일 커밋 — 컴포넌트 + 스토리 + 모든 수정된 페이지 (10단계)
