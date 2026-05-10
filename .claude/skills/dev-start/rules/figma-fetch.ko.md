# Figma 수집 규칙 (1단계 + 1b단계 + 2단계)

`dev-start` SKILL.md에서 참조합니다. 1단계와 2단계 실행 시 이 규칙을 따릅니다.

---

## 1단계. Figma 수집

**병렬**로 실행:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)` — 레이아웃, 변환, 타이포그래피, 이펙트, 계층
- `mcp__claude_ai_Figma__get_variable_defs(nodeId, fileKey)` — 디자인 토큰
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)` — 참조 이미지 (9단계용으로 URL 저장)
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)` — 2단계 드릴용 전체 자식 트리

`.claude/rules/figma-design.md` 규칙을 **빠짐없이** 따릅니다. 결과 수신 후:

- `get_design_context` 출력이 잘린 것으로 보이면 → 2단계에서 재호출 표시.

---

## 1b단계. Figma 에셋 URL 수명주기

> "The best way to ensure your images are always available is to download them to your codebase and reference those local files instead." — Figma official

**중요:** Figma MCP 에셋 URL (`https://www.figma.com/api/mcp/asset/<uuid>`)은 **세션 범위**입니다. `get_design_context`를 호출할 때마다 같은 에셋에 대해 다른 UUID의 URL이 반환됩니다. 이전 세션이나 플랜 문서의 URL은 **새 세션에서 로드되지 않습니다**.

**규칙:** 1단계 (또는 모든 `get_design_context` 호출) 직후 모든 이미지 에셋을 `/public/{route-slug}/`에 다운로드:

```bash
mkdir -p public/{route-slug}/
curl -s -o public/{route-slug}/{asset-name}.svg "<figma-mcp-asset-url>"
# 검증: file 명령으로 SVG 또는 PNG인지 확인 (HTML 오류 아님)
file public/{route-slug}/*.svg
```

생성 코드에는 로컬 경로 (`/class/sphere.svg`) 사용. **Figma MCP URL을 소스 파일에 하드코딩 금지.**

이전 세션 플랜에 Figma 에셋 URL이 하드코딩된 경우:
1. `get_design_context` 즉시 재호출 — 플랜 URL 재사용 금지
2. 새 에셋을 `/public/`에 다운로드 후 코드 작성
3. 플랜의 Figma URL을 모두 로컬 `/public/` 경로로 교체

### 에셋 대체 금지

**다음 항목으로 Figma 이미지 에셋을 절대 대체하지 말 것:**

| 금지된 대체 | 예시 (절대 하지 말 것) |
|------------|----------------------|
| HTML 텍스트 문자 | `<`, `/`, `>` 로 코드 괄호 아이콘 대체 |
| 수제 인라인 SVG | `<rect>` + `<path>`로 채팅 버블 일러스트 근사 |
| CSS 전용 재현 | `border-radius: 50%`로 궤도 타원 이미지 대체 |
| 커스텀 SVG 경로 | 에셋으로 존재하는 스파클을 `M16 2 L17.5 14...`로 그리기 |

**이유:** 대체물은 시각적 무게감, 그라디언트 디테일, 형태 정밀도, 정확한 기하학에서 차이가 납니다. 단순해 보이는 아이콘도 다운로드해야 합니다.

**다른 Figma 컨텍스트의 기존 `/public/` 에셋 재사용 금지.** 동일한 SVG 경로도 컨텍스트에 따라 다른 fill 색상을 가질 수 있습니다. 항상 새로 다운로드하세요.

**규칙:** Figma 출력의 모든 `<img src={imgX}>`는 `/public/{route-slug}/`의 하나의 다운로드 파일에 대응합니다. 코드 작성 전 감사:

```bash
# Figma 출력의 const imgX 줄 수와 다운로드 파일 수 일치 확인
ls -1 public/{route-slug}/ | wc -l
```

URL 다운로드 실패 시 (HTML 오류 반환) → 즉시 `get_design_context` 재호출. 대체로 돌아가지 말 것.

---

## 2단계. 서브섹션 드릴 + Variant 샘플링

**절대 생략 불가.** 페이지 레벨 프레임은 단일 `get_design_context` 호출로 완전히 읽을 수 없습니다.

### 2a. Level-1 섹션 열거

`get_metadata` 결과에서 페이지 프레임의 직계 자식 추출:

| 노드 유형 | 처리 방법 |
|----------|----------|
| 데이터 영역 (리스트, 그리드, 카드 그룹, 폼) | `get_design_context` 개별 호출 |
| 복잡한 레이아웃 (3단계 이상 중첩) | `get_design_context` 개별 호출 |
| Variant 컴포넌트 인스턴스 | 모든 variant 셀 열거 → 각 셀 `get_design_context` |
| 정적/장식 영역 (히어로 텍스트, 구분선) | 상위 호출 결과 재사용 |

개별 `get_design_context` 호출은 모두 **병렬** 실행.

### 2b. Variant 매트릭스 샘플링

Variants가 있는 컴포넌트:

1. 모든 variant 차원 파악 (예: `state × size × type`)
2. 매트릭스의 **모든 셀**에 `get_design_context` 호출 — 기본값만 읽으면 안 됨
3. 셀별 차이 기록 (색상 변화, 크기 변화, 레이어 표시/숨김)

variant 셀 하나라도 빠트리면 → 해당 상태가 구현되지 않음.

### 2c. 변환(Transform) 값 캡처

모든 노드(자식 포함)에서:

- **정확한 회전각** 기록 (예: `-9.38°`, `+18.03°`) — 절대 반올림하지 않음
- 음수 스케일 기록 (미러 변환)
- 같은 변환값 공유 노드를 그룹으로 묶음 — 디자이너의 의도적 시스템

### 2d. 잘린 출력 복구

서브 호출이 여전히 잘린 경우 → 해당 노드에 `get_metadata` 재호출 → 한 단계 더 드릴.

### 2e. 컨테이너 내 시각 콘텐츠 크기 측정

**페이지 레벨 스크린샷에서 콘텐츠 요소 크기를 추정하지 말 것.** 1920px 아트보드에서 썸네일은 모든 요소를 압축합니다.

시각 콘텐츠(일러스트, 아이콘 그룹, SVG 형태, 이미지)가 주요 콘텐츠인 카드, 타일, 배지, 패널:

1. **컨테이너 노드에 직접** `get_design_context` 호출
2. 콘텐츠 자식 노드의 정확한 `width` × `height` (px) 추출
3. 채움 비율 계산: `콘텐츠_너비 / 컨테이너_너비`

| 채움 비율 | 해석 | 처리 |
|---------|------|------|
| > 0.5 | 주요 시각 요소 | 정확한 픽셀 치수 사용 |
| 0.25–0.5 | 보조 장식 | 정확한 치수 사용, 스크린샷 대비 검증 |
| < 0.25 | 악센트/배지 | 근사치 허용 |

### 2f. 중첩 컴포넌트 인스턴스 재귀 탐색

Level-1 섹션 드릴 완료 후, 각 섹션의 메타데이터에서 중첩 인스턴스를 탐색합니다.

`INSTANCE` 자식을 가진 각 Level-1 섹션에 대해:

```bash
# 각 Level-1 섹션 노드의 자식 조회
get_metadata(sectionNodeId, fileKey)
```

중첩된 `type === "INSTANCE"` 노드 발견 시:

| 노드 깊이 | 처리 |
|---------|------|
| Depth 2 (섹션 내부) | 섹션 드릴에서 이미 다루지 않은 경우 `get_design_context` 호출 |
| Depth 3 이상 | 대표 인스턴스 하나 샘플링 — 패턴 반복 여부 기록 |

**완전성 감사.** 모든 드릴 완료 후 출력:

```
Components found: N (Level-1 sections: A, Nested instances: B, Variant cells: C)
```

이 숫자가 4단계 (컴포넌트 재사용 확인)의 기준값이 됩니다.
