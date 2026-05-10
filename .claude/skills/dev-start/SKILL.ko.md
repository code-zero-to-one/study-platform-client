---
name: dev-start
description: 'Figma 페이지/라우트 노드 하나를 받아 실제 API와 연결된 Next.js App Router 페이지로 변환합니다. "페이지 구현해줘", "페이지 만들어줘", "Figma 페이지", "라우트 구현", "페이지 시작" 키워드로 활성화. 커밋까지 진행하며 PR 생성은 포함되지 않습니다.'
---

# dev-start (한국어 참조 문서)

> 이 파일은 `SKILL.md`의 한국어 번역본입니다. 스킬 실행 엔진은 `SKILL.md`를 읽습니다.
> 코드 블록과 기술 식별자는 영어 원형을 유지합니다.

---

## 목적

Figma 페이지/라우트 노드 하나를 받아서:
1. 디자인 컨텍스트를 `docs/Figma/`에 저장
2. 라우트 + API 매핑 결정
3. `../study-platform-mvp/` 백엔드 저장소 갱신 + DTO 교차 검증
4. 실제 훅과 연결된 Next.js 페이지 생성
5. Chrome ↔ Figma 반복 시각 검증 (불일치 제로 달성까지 반복)
6. 사용자 확인 후 현재 브랜치에 커밋

PR 생성은 이 스킬 범위 밖입니다 — 완료 후 사용자가 `/pr`을 직접 실행합니다.

---

## 실행 조건

- 사용자가 "페이지 구현해줘", "페이지 만들어줘", "Figma 페이지", "라우트 구현", "페이지 시작" 등을 말할 때
- Figma URL이 공유되고 대상 노드가 **페이지 레벨 프레임** (전체 라우트, 여러 섹션, 데이터 영역 포함)일 때
- 결과물: `src/app/(landing|service|admin)/.../page.tsx` 하나 + 필요한 헬퍼 컴포넌트

## 실행 제외 조건

- Figma 노드가 단일 컴포넌트 → `design-to-dev` 스킬 사용
- 디자인 토큰 추출만 필요하고 API 연결 불필요 → 인라인 처리
- `../study-platform-mvp/`가 없음 → 조기 중단 (S3)
- Figma URL 없음 → 사용자에게 먼저 요청

---

## 입력

- `node-id` 쿼리 파라미터가 포함된 Figma URL (페이지/프레임 노드)
- (선택) 대상 라우트 경로 (예: `/premium-study/[id]`). 생략 시 Figma 프레임 이름 + 프로젝트 라우팅 규칙에서 추론.

---

## 단계

### 1–2단계. Figma 수집 + 에셋 수명주기 + 섹션 드릴

→ **전체 프로토콜:** `.claude/skills/dev-start/rules/figma-fetch.md`
→ **한국어 참조:** `.claude/skills/dev-start/rules/figma-fetch.ko.md`

요약:
- 4개 Figma MCP 호출 병렬 실행 (`get_design_context`, `get_variable_defs`, `get_screenshot`, `get_metadata`)

> "The best way to ensure your images are always available is to download them to your codebase and reference those local files instead." — Figma official

- 이미지 에셋은 즉시 `/public/{route-slug}/`에 다운로드 — Figma MCP URL을 소스 코드에 하드코딩 금지
- 수제 SVG, HTML 텍스트 문자, CSS로 에셋 대체 절대 금지 — 실제 파일 다운로드
- 모든 Level-1 섹션 개별 드릴; 모든 variant 셀 샘플링; 정확한 회전각 기록

### 3단계. 토큰 매핑

1단계 `get_variable_defs` 결과의 각 Figma 변수를 프로젝트 토큰에 매핑:

1. `src/app/global.css` 읽기 → `@theme inline` 토큰 이름 전체 추출
   - 패턴: `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`
2. 각 Figma 변수 매핑:

| 결과 | 처리 |
|------|------|
| ✅ 완전 일치 | 프로젝트 토큰 사용 (`bg-gray-900`, `text-primary-500`) |
| ⚠️ 근사 일치 | 가장 가까운 프로젝트 토큰 사용. 편차 기록. |
| ❌ 매칭 없음 | 가장 가까운 토큰 사용. **임의값 (`p-[4px]`) 및 기본 Tailwind 스케일 (`p-4`) 절대 금지.** 편차 기록. |

3. 매핑 테이블 작성 → 5단계 스펙 문서에 저장.

토큰 참조: `bg-gray-{0…1000}`, `p-{token}` / `gap-{token}` (커스텀 스케일), `rounded-{token}` (커스텀).

> **⚠️ 기본 Tailwind 색상 클래스도 undefined.** `@theme inline`은 `--color-*` 전체(기본 포함)를 리셋. `bg-white` → `var(--color-white)` → undefined → **투명 렌더링** (lint 에러 없음, type 에러 없음). 반드시 프로젝트 토큰 사용: 흰색 = `bg-gray-0`, `bg-white` 금지.

### 4단계. 컴포넌트 재사용 확인

코드 작성 전, Figma 섹션 중 이미 구현된 컴포넌트 파악.

`get_metadata`에서 `type === "INSTANCE"` 노드 수집. 각 노드에 대해:

```bash
grep -r "{ComponentName}" src/components/ --include="*.tsx" -l
```

| 결과 | 처리 |
|------|------|
| `src/components/`에서 발견 | import 경로 기록. 8단계에서 사용. 재구현 금지. |
| 미발견 | TODO 표시. `design-to-dev` 스킬 별도 실행 안내. |

출력: 컴포넌트 재사용 맵 (Figma 인스턴스 → 코드베이스 경로 → 상태).

### 5단계. `docs/Figma/` 스펙 문서 저장

`docs/Figma/{page-slug}.md` 생성:

```markdown
# {RouteName}

## Source
- File: {fileKey} | Node: {nodeId} | URL: {Figma URL} | Captured: {YYYY-MM-DD}

## Route
- Target path: src/app/(service)/.../page.tsx
- Layout group: (landing|service|admin) | Auth required: yes/no

## Sections
| 섹션 | 유형 | 데이터 소스 | 비고 |

## Component Reuse
| Figma 인스턴스 | 코드베이스 경로 | 상태 |

## Token Mapping
| Figma Variable | 프로젝트 토큰 | 상태 |

## Token Deviations
## Transforms
| 노드 | 회전각 | 스케일 | 비고 |

## API Mapping
| 영역 | 훅 | DTO 타입 | 파일 |

## 컴포넌트–API 맵
| 컴포넌트 | 렌더링 필드 | 훅 | DTO 타입 | 비고 |

## Notes
```

### 6단계. 코드 매핑 (라우트 + API)

#### 6a. 라우트 매핑

| Figma 프레임 이름 패턴 | 프로젝트 라우트 그룹 |
|------------------------|---------------------|
| 공개/랜딩/마케팅 | `src/app/(landing)/.../page.tsx` |
| 인증된 사용자 페이지 | `src/app/(service)/.../page.tsx` |
| 어드민 페이지 | `src/app/(admin)/.../page.tsx` |

#### 6b. API 매핑 (컴포넌트별)

4단계 재사용 맵의 모든 컴포넌트 AND 새로 작성할 모든 컴포넌트에 대해:

1. 해당 컴포넌트가 렌더링하는 데이터 필드 파악 (Figma 텍스트 노드, 목록, 배지 기준)
2. `src/hooks/queries/`, `src/api/`, `src/api/openapi/`에서 매칭 훅 검색
3. 컴포넌트–API 맵 테이블에 기록 (5단계 스펙 문서에 저장):

| 컴포넌트 | 렌더링 필드 | 훅 | DTO 필드 | 상태 |
|---------|-----------|-----|---------|------|
| ClassCard | title, thumbnailUrl, memberCount | useGetClassList | ClassListItem.title/thumbnail/memberCount | ✅ |
| SomeWidget | price | — | — | TODO: 훅 없음 |

**존재하지 않는 엔드포인트 절대 조작 금지.** 훅 없음 → 컴포넌트 props에 `// TODO: API not found - <ComponentName>` 플레이스홀더.

#### 6c. 미들웨어 라우트 등록

**항상 실행.** 미등록 경로는 `/`로 리다이렉트됨.

```bash
grep -n "'/path'" src/features/auth/server/middleware/route-policy.ts
```

| 라우트 그룹 | 필요 정책 |
|-------------|----------|
| `(landing)` | `PUBLIC_SESSION` |
| `(service)` | 기본 보호 (별도 등록 불필요) |
| `(admin)` | 기본 보호 (별도 등록 불필요) |

`(landing)` 경로 미등록 시, `route-policy.ts`의 `ROUTE_POLICIES`에 추가:

```typescript
{
  kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
  path: '/{route-path}',
  match: ROUTE_MATCH_TYPES.PREFIX,
},
```

### 7단계. 백엔드 저장소 갱신 + DTO 교차 검증

```bash
test -d ../study-platform-mvp || { echo "Backend repo missing"; exit 1; }
cd ../study-platform-mvp && git pull origin dev
```

6b단계에서 사용된 각 훅에 대해 백엔드 DTO 교차 검증:
- 엔드포인트 경로 + HTTP 메서드
- 쿼리/경로 파라미터 이름 + 타입
- 응답 필드 이름, 타입, 선택성
- 열거형(enum) 값

**불일치 → 중단 (S2).** 필드 레벨 차이 보고.

```
QA Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html
QA API base:   https://test-api.zeroone.it.kr
```

### 8단계. 페이지 생성

6a단계 경로에 `page.tsx` 작성. 아래 규칙 적용:

- 4단계 컴포넌트 재사용 맵 — 기존 컴포넌트 import. 재구현 금지.
- 3단계 토큰 매핑 — 프로젝트 토큰만 사용. 임의값 금지.
- 모든 `className`에 `cn()` 사용.
- 6b단계의 TanStack Query 훅.
- 백엔드 선택적 필드: `??` null 처리, enum은 `in` 가드.
- 누락된 API/컴포넌트는 TODO 플레이스홀더.

작성 후 **순서대로** 실행:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

`yarn typecheck` 실패 → **중단 (S4)**. 오류 보고.

### 8b단계. Chrome ↔ Figma 시각 검증

→ **전체 프로토콜:** `.claude/skills/dev-start/rules/visual-verify.md`
→ **한국어 참조:** `.claude/skills/dev-start/rules/visual-verify.ko.md`

요약:
- Chrome 스크린샷 촬영 → 모든 검사 항목을 Figma 기준으로 비교 → ❌ 항목 전체 수정 → 반복
- 모든 ❌ 항목이 동시에 해소될 때만 종료 — 불일치를 사용자에게 넘기지 말 것
- 최대 2회 반복; 수렴 안 될 경우 → 남은 ❌ 항목을 9단계 요약에 기록하고 사용자에게 인계

### 9단계. 검증 게이트

**여기서 일시 중지.** 아래 메시지 출력:

```
✓ 페이지:     src/app/.../page.tsx
✓ 스펙:       docs/Figma/{slug}.md
✓ DTO 검증:   통과
✓ 시각 검증:  Chrome ↔ Figma — 모든 검사 통과 (N회 반복)
✓ 참조 이미지: {1단계 get_screenshot URL}
{누락된 API 또는 컴포넌트 TODO 목록}

OK 입력 시 커밋, 또는 불일치 항목 설명.
```

사용자 OK 전까지 대기.

### 10단계. 커밋

```bash
git add src/app/.../page.tsx \
        docs/Figma/{slug}.md \
        {생성된 헬퍼 컴포넌트 또는 문제 문서}
git commit -m "feat : {RouteName} 페이지 구현"
```

한국어 커밋 메시지, `feat : <제목>` 형식, ≤50자. TODO 및 토큰 편차는 커밋 본문에 포함.

### 11단계. 종료

```
/pr 실행하여 develop에 PR을 생성하세요.
```

**PR 자동 생성 금지.**

---

## 중단 조건 (Blockers)

| ID | 조건 | 처리 |
|----|------|------|
| S1 | API 훅 미발견 | `// TODO: API not found` 플레이스홀더로 계속 진행, 요약에 기록 |
| S2 | 백엔드 DTO 불일치 | **중단**, 필드 레벨 차이 보고, 결정 대기 |
| S3 | `../study-platform-mvp/` 없음 | **중단**, 클론 안내 |
| S4 | `yarn typecheck` 실패 | **중단**, 오류 보고 |
| S5 | 서브섹션 `get_design_context` 재호출 후도 잘림 | partial로 기록하고 최선의 결과로 계속, 스펙 Notes에 표시 |
| S6 | Chrome ↔ Figma 2회 반복 후도 수렴 안 됨 | 남은 ❌ 항목을 9단계 요약에 기록하고 사용자에게 인계 |

## 도구 목록

- `mcp__claude_ai_Figma__get_design_context` — 페이지 + 각 서브섹션 (병렬)
- `mcp__claude_ai_Figma__get_variable_defs` — 토큰 추출
- `mcp__claude_ai_Figma__get_screenshot` — 시각 참조
- `mcp__claude_ai_Figma__get_metadata` — 자식 트리 열거
- `Bash` — grep, global.css 토큰 읽기, git pull, yarn, git add/commit
- `Read` — 훅, DTO, global.css, 백엔드 클래스 검사
- `Grep` — 훅 후보 및 컴포넌트 파일 검색
- `Write` — page.tsx, 헬퍼 컴포넌트, 스펙 문서, 문제 문서
- `mcp__chrome-devtools__navigate_page` — 라우트 로드/리로드
- `mcp__chrome-devtools__take_screenshot` — 각 반복마다 Chrome 상태 캡처
- `mcp__chrome-devtools__hover` / `mcp__chrome-devtools__click` — 인터랙티브 상태 활성화
- `mcp__chrome-devtools__take_snapshot` — hover/click 대상 UID 조회

## 최종 체크리스트

- [ ] 모든 Figma 이미지 에셋 `/public/{route-slug}/`에 다운로드 — 소스에 Figma MCP URL 없음 (1b단계)
- [ ] 에셋을 HTML 텍스트 문자, 인라인 SVG, CSS로 대체하지 않음 — `const imgX` 수와 다운로드 파일 수 일치 (1b단계)
- [ ] 크로스 세션 플랜 실행 시: `get_design_context` 재호출로 에셋 URL 갱신 (1b단계)
- [ ] Figma MCP 4개 호출 병렬 실행 (1단계)
- [ ] 모든 Level-1 섹션 개별 드릴 완료 (2단계)
- [ ] 모든 variant 셀 샘플링 완료 (2b단계)
- [ ] 모든 변환값 정확한 소수점 단위로 기록 (2c단계)
- [ ] 시각 콘텐츠 크기를 컨테이너 서브 노드 호출로 측정 (페이지 레벨 아님) (2e단계)
- [ ] global.css `@theme inline` 대비 토큰 매핑 테이블 완성 (3단계)
- [ ] 임의값 및 기본 Tailwind 스케일 사용 없음
- [ ] 기본 Tailwind 색상 클래스(`bg-white`, `text-white`, `bg-black`) 사용 없음 — `@theme inline`이 undefined 처리; 흰색은 `bg-gray-0` 사용
- [ ] 컴포넌트 재사용 맵 완성 — 기존 컴포넌트 식별 및 import (4단계)
- [ ] 모든 테이블 포함한 `docs/Figma/{slug}.md` 완성 (5단계)
- [ ] 올바른 라우트 그룹 (landing/service/admin)
- [ ] `(landing)` 라우트를 `route-policy.ts`에 `PUBLIC_SESSION`으로 등록 (6c단계)
- [ ] 2f단계 완전성 감사 출력: "Components found: N (Level-1: A, Nested: B, Variant: C)"
- [ ] 발견된 컴포넌트 수와 4단계 재사용 맵 항목 수 일치
- [ ] API 매핑이 DTO 필드명 포함 컴포넌트별로 완성 (6b단계)
- [ ] `docs/Figma/{slug}.md`에 컴포넌트–API 맵 테이블 포함 (5단계)
- [ ] 모든 컴포넌트 훅 매핑 또는 TODO 표시
- [ ] 백엔드 저장소 `git pull origin dev` 완료
- [ ] DTO 교차 검증 통과 (또는 불일치 시 중단)
- [ ] QA URL 요약에 출력
- [ ] `cn()` 사용, 재사용 컴포넌트 적용, 프로젝트 토큰만 사용
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` 전체 통과
- [ ] Chrome ↔ Figma 반복 루프 — 모든 검사 동시 통과 (최대 2회) 후 종료 (8b단계)
- [ ] hover/click으로 인터랙티브 상태 검증 (8b단계)
- [ ] 크로스 세션 시: Figma 스크린샷 재취득 후 비교 (8b단계)
- [ ] Figma 스크린샷 URL 사용자에게 제공 (9단계)
- [ ] 시각적 일치 사용자 확인 후 커밋
- [ ] 현재 브랜치에 단일 커밋, 본문에 TODO 및 편차 기록
- [ ] 종료 메시지에서 `/pr` 실행 안내
