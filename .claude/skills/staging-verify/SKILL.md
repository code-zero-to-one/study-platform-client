---
name: staging-verify
description: Use Chrome DevTools MCP to verify a route on local (localhost:3000) or staging. Checks login redirects, console errors, UI rendering, and responsive layout. Activates on "크롬에서 확인해줘", "크롬에서 테스트해줘", "로컬에서 확인해줘", "반응형 확인해줘". Staging is used only when "스테이징" is explicitly mentioned.
---

# Staging Verify Skill

## Trigger Patterns

- "크롬에서 확인해줘"
- "스테이징에서 확인해줘"
- "크롬에 접속해서 다시 확인해줘"
- "로컬에서 확인해줘"
- "반응형 확인해줘"
- Any verification request that includes a study ID like "(스터디 id: XXX)"

## Environment Selection

Default is local (`localhost:3000`). Use staging only when arguments contain `"스테이징"` or `"test.zeroone.it.kr"`.

| Condition | Base URL |
|-----------|----------|
| Default (no explicit mention → local) | `http://localhost:3000` |
| Includes "스테이징" / "test.zeroone.it.kr" | `https://test.zeroone.it.kr` |

**Pre-check when local is selected:**
```bash
lsof -i :3000 -sTCP:LISTEN
```
If port 3000 is not listening, respond: "로컬 서버가 실행 중이지 않습니다. `yarn dev`로 먼저 서버를 시작해주세요."

## Execution Order

### 1. Path Parsing

Parse the target path from arguments:

| Input | Resolved Path |
|-------|---------------|
| 그룹스터디 {id} | `/group-study/{id}` |
| 그룹스터디 {id} 미션 탭 | `/group-study/{id}?tab=mission` |
| 그룹스터디 {id} 평가 탭 | `/group-study/{id}?tab=evaluation` |
| 결제 {id} | `/payment/{id}` |
| 홈 | `/home` |
| 마이페이지 | `/my-page` |
| 랜딩 / 루트 | `/` |
| Direct path | use as-is |

### 2. Chrome DevTools MCP Flow

```
1. mcp__chrome-devtools__list_pages — list currently open tabs
2. If no tab targets the chosen environment → mcp__chrome-devtools__new_page
3. mcp__chrome-devtools__navigate_page → {base_url}{path}
4. mcp__chrome-devtools__wait_for — wait for page text (detects redirects)
5. mcp__chrome-devtools__take_screenshot — capture current view
6. mcp__chrome-devtools__list_console_messages — collect console errors
```

### 3. Responsive Verification Mode

If arguments include "반응형" or follow a responsive change, verify three viewports in order:

```
375px  (iPhone SE — mobile)
768px  (iPad Mini — tablet)
1280px (desktop)
```

Per viewport:
1. `mcp__chrome-devtools__resize_page` — change size
2. `mcp__chrome-devtools__take_screenshot` — capture
3. Inspect for layout issues (horizontal scroll, overlapping elements, text clipping)

### 4. Verification Checklist

- **Redirect detection**: did the final URL change to `/` or `/login`?
- **Console errors**: any `error`-level messages?
- **Render state**: blank screen or error UI in screenshot?
- **Expected UI**: did the intended page component render?
- **Responsive** (when mode active): layout breakage per viewport

### 5. Result Report

```
## Verification Result ({Environment}: Local / Staging)

**URL**: {base_url}{path}
**Final URL**: {URL after navigation}

### Redirect
✅ None / ❌ Occurred → {redirect target}

### Console Errors
✅ None / ❌ Found:
- {error message}

### Rendering
✅ OK / ❌ Issue:
- {screenshot-based description}

### Responsive (when mode active)
| Viewport | Status | Notes |
|----------|--------|-------|
| 375px  | ✅/❌ | |
| 768px  | ✅/❌ | |
| 1280px | ✅/❌ | |
```

## Notes

- Results depend on login state. For guest tests, request guest mode explicitly.
- Staging may return 502 during deploys. Report as "배포 중으로 보입니다" in that case.
- Local server must run on port 3000 (`yarn dev`).
- If sensitive PII (name, email, etc.) appears in a screenshot, do not quote it.
- After responsive verification, restore the viewport to 1280px.
