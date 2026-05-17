# Figma Verification Rules

Run after implementation is complete. **Never mark a task complete without completing at least one of Path A or Path B below.**

## Path A: Browser Tool Available (Primary)

Attempt browser tools in this order — stop at the first one that succeeds:

### 1. Playwright MCP (try first — no Chrome dependency)

```python
# Take screenshot of implemented component/page
mcp__playwright__browser_navigate(url="http://localhost:3000/<route>")
mcp__playwright__browser_take_screenshot()
```

### 2. Chrome DevTools MCP (try second — requires Chrome running)

```python
mcp__chrome-devtools__take_screenshot()
```

### 3. browser-harness (try third)

```bash
browser-harness -c '
new_tab("http://localhost:3000/<route>")
wait_for_load()
capture_screenshot()
'
```

### Visual Comparison Steps

1. Place browser screenshot next to Figma `get_screenshot` result
2. Check all of:
   - [ ] 레이아웃 / 간격 — 육안으로 일치하는가
   - [ ] 색상 — 배경, 텍스트, 테두리
   - [ ] 타이포그래피 — 폰트 크기, 굵기, 줄간격
   - [ ] 상태 (hover, disabled, active) — 각 variant 확인
   - [ ] 반응형 — 모바일/태블릿 뷰포트 (`mcp__playwright__browser_resize`)

### Pixel-Level Measurement (의심 수치 있을 때)

```javascript
// Playwright MCP evaluate 또는 Chrome DevTools evaluate
const el = document.querySelector('<selector>');
const rect = el.getBoundingClientRect();
console.log(rect); // top, left, width, height in px
```

Figma `get_design_context` 수치와 대조. 오차 2px 이내 = 허용.

---

## Path B: All Browser Tools Blocked (Fallback)

If all three tools above are denied or unavailable, run code-level audit then hand off to user.

### Code-Level Audit

```bash
# 1. 임의 px 값 없는지 확인 (수정된 파일만)
grep -nP 'className.*\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|gap|top|right|bottom|left|rounded)-\[[0-9]' <modified-files>

# 2. style prop에 px 고정값 없는지 확인
grep -n 'style={{' <modified-files>

# 3. 하드코딩 색상 없는지 확인
grep -nP 'style=.*color.*#[0-9a-fA-F]' <modified-files>
```

All three must return zero matches.

### Node Coverage Check

From `get_design_context` response, verify every named node has a corresponding element in code:

| Figma node | 코드에 존재? |
|---|---|
| (목록 작성) | ✅ / ❌ |

### User Handoff (필수)

Path B 사용 시 반드시 아래 형식으로 사용자에게 전달:

```
⚠ 브라우저 툴 사용 불가 — 코드 레벨 감사 완료, 아래 항목은 직접 확인 필요:

브라우저에서 http://localhost:3000/<route> 열어서 확인:
- [ ] <구체적 항목 1>
- [ ] <구체적 항목 2>
- [ ] hover / active 상태
- [ ] 모바일 뷰포트 (375px)

Figma 레퍼런스: <get_screenshot URL 또는 저장 경로>
```

**"완료"라고 선언하지 말 것.** 사용자 확인 후 완료 처리.

---

## Never-Skip Rule

- Path A도 Path B도 수행하지 않고 완료 처리 = 금지
- "브라우저 툴이 없어서 검증 생략" = 금지
- 툴 호출이 차단되면 다음 툴로 넘어가고, 셋 다 실패 시 Path B 실행

---

Related rules:
- `figma-design.md` — Figma 데이터 읽기 (구현 전)
- `figma-pre-code-gate.md` — 토큰 매핑, 노드 커버리지 (코딩 전)
- `figma-overlap-to-css.md` — 오버랩 레이아웃 CSS 변환
