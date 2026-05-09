---
name: dev-start
description: 'Convert a Figma page or route node into a Next.js App Router page wired to real APIs. Activates on "페이지 구현해줘", "페이지 만들어줘", "Figma 페이지", "라우트 구현", "페이지 시작". Refreshes backend repo, cross-checks DTOs, stops at commit.'
---

# dev-start

## Purpose

Take one Figma page/route node, save its design context to `docs/Figma/`, decide route + API mappings, refresh `../study-platform-mvp/` backend repo + cross-check DTOs, generate a Next.js page wired to real hooks, run iterative Chrome ↔ Figma verification until zero mismatches, then commit on the current branch. PR creation is **not** part of this skill — user invokes `/pr` afterwards.

## Use_When

- User says "페이지 구현해줘", "페이지 만들어줘", "Figma 페이지", "라우트 구현", "페이지 시작"
- User shares a Figma URL and the target node is a **page-level frame** (full route, multi-section composition with data areas)
- Output should be one `page.tsx` under `src/app/(landing|service|admin)/.../` plus any helper components

## Do_Not_Use_When

- Figma node is a single component — use `design-to-dev` skill instead
- User wants only design tokens / no API wiring — handle inline
- Backend repo at `../study-platform-mvp/` is not present — abort early (S3)
- No Figma URL is available — ask user for one before proceeding

## Inputs

- Figma URL (with `node-id` query param) for a page/frame node
- Optional: target route path (e.g., `/premium-study/[id]`). If omitted, derive from Figma frame name + project routing convention.

---

## Steps

### 1–2. Figma Fetch + Asset Lifecycle + Sub-section Drill

→ **Full protocol:** `.claude/skills/dev-start/rules/figma-fetch.md`

Summary:
- Run 4 Figma MCP calls in parallel (`get_design_context`, `get_variable_defs`, `get_screenshot`, `get_metadata`)
- Immediately download all image assets to `/public/{route-slug}/` — never hardcode Figma MCP URLs
- Never substitute assets with hand-crafted SVG, HTML text chars, or CSS — download the actual file
- Drill every Level-1 section individually; sample all variant matrix cells; record exact rotation degrees

### 3. Token Mapping

For every Figma variable from Step 1's `get_variable_defs`:

1. Read `src/app/global.css` → find all `@theme inline` token names (`--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`)
2. Map each variable:

| Result | Action |
|--------|--------|
| ✅ Exact match | Use project token (`bg-gray-900`, `text-primary-500`) |
| ⚠️ Nearest match | Use closest token. Record deviation. |
| ❌ No match | Use nearest available. **Never** use arbitrary values (`p-[4px]`) or base Tailwind scale (`p-4`). Record deviation. |

3. Build mapping table — saved to spec doc in Step 5.

Token reference: `bg-gray-{0…1000}`, `p-{token}` / `gap-{token}` (custom scale), `rounded-{token}` (custom).

### 4. Component Reuse Check

Before writing any code, identify which Figma sections already exist as components.

From `get_metadata`, collect all `type === "INSTANCE"` nodes. For each:

```bash
grep -r "{ComponentName}" src/components/ --include="*.tsx" -l
```

| Result | Action |
|--------|--------|
| Found in `src/components/` | Record import path. Use in Step 8. Do not re-implement. |
| Not found | Mark TODO. Run `design-to-dev` skill separately. |

Output: Component reuse map table (Figma instance → codebase path → status).

### 5. Save to `docs/Figma/`

Create `docs/Figma/{page-slug}.md`:

```markdown
# {RouteName}

## Source
- File: {fileKey} | Node: {nodeId} | URL: {Figma URL} | Captured: {YYYY-MM-DD}

## Route
- Target path: src/app/(service)/.../page.tsx
- Layout group: (landing|service|admin) | Auth required: yes/no

## Sections
| Section | Type | Data Source | Notes |

## Component Reuse
| Figma instance | Codebase path | Status |

## Token Mapping
| Figma Variable | Project Token | Status |

## Token Deviations
## Transforms
| Node | Rotation | Scale | Notes |

## API Mapping
| Region | Hook | DTO Type | File |

## Notes
```

### 6. Code Mapping (Route + API)

#### 6a. Route Mapping

| Figma frame name pattern | Project route group |
|--------------------------|---------------------|
| Public/Landing/Marketing | `src/app/(landing)/.../page.tsx` |
| Authenticated user pages | `src/app/(service)/.../page.tsx` |
| Admin pages | `src/app/(admin)/.../page.tsx` |

#### 6b. API Mapping

For every data-bearing region from Step 2:
1. Search `src/hooks/queries/`, `src/api/`, `src/api/openapi/` for matching hook
2. Found → record in mapping table; Not found → `// TODO: API not found - <region>` placeholder

**Never invent endpoints.**

#### 6c. Middleware Route Registration

**Always run this step.** Unregistered paths redirect to `/`.

```bash
grep -n "'/path'" src/features/auth/server/middleware/route-policy.ts
```

| Route group | Required policy |
|-------------|-----------------|
| `(landing)` | `PUBLIC_SESSION` |
| `(service)` | Already protected (default) |
| `(admin)` | Already protected (default) |

If `(landing)` path not registered, add to `ROUTE_POLICIES` in `route-policy.ts`:

```typescript
{
  kind: ROUTE_POLICY_KINDS.PUBLIC_SESSION,
  path: '/{route-path}',
  match: ROUTE_MATCH_TYPES.PREFIX,
},
```

### 7. Backend Repo Refresh + DTO Cross-Check

```bash
test -d ../study-platform-mvp || { echo "Backend repo missing"; exit 1; }
cd ../study-platform-mvp && git pull origin dev
```

For every hook used in Step 6b, cross-check against backend DTO:
- Endpoint path + HTTP method
- Query/path param names + types
- Response field names, types, optionality
- Enum values

**Mismatch → abort (S2).** Report field-level diff.

```
QA Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html
QA API base:   https://test-api.zeroone.it.kr
```

### 8. Page Generation

Write `page.tsx` at the path from Step 6a. Apply:

- Component reuse map from Step 4 — import existing components, do not re-implement
- Token mapping from Step 3 — project tokens only, no arbitrary values
- `cn()` for all `className` composition
- TanStack Query hooks from Step 6b
- Optional backend fields: `??` for nullables, `in` guards for enums
- TODO placeholders where API hooks or components are missing

After write, run **in order**:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

If `yarn typecheck` fails → **abort (S4)**. Report errors.

### 8b. Chrome ↔ Figma Visual Verification

→ **Full protocol:** `.claude/skills/dev-start/rules/visual-verify.md`

Summary:
- Take Chrome screenshot → compare ALL checks against Figma reference → fix every ❌ → repeat
- Exit only when zero ❌ checks remain simultaneously — never hand a mismatch to the user
- Max 2 iterations; if still failing → list remaining ❌ in Step 9 summary for user

### 9. Verify Gate

**Pause here.** Print:

```
✓ Page:       src/app/.../page.tsx
✓ Spec:       docs/Figma/{slug}.md
✓ DTO check:  passed
✓ Visual:     Chrome ↔ Figma — all checks passed (N iterations)
✓ Reference:  {Figma screenshot URL from Step 1}
{TODO list if any APIs or components missing}

Reply OK to commit, or describe mismatch to fix.
```

Wait for user OK before continuing.

### 10. Commit

```bash
git add src/app/.../page.tsx \
        docs/Figma/{slug}.md \
        {any helper components or problem docs created}
git commit -m "feat : {RouteName} 페이지 구현"
```

Korean commit message, `feat : <subject>` format, ≤50 chars. Include TODOs and token deviations in commit body if any.

### 11. Stop

Print: `Run /pr to open PR against develop.` Do not auto-create PR.

---

## Blockers

| ID | Condition | Action |
|----|-----------|--------|
| S1 | API hook not found | Continue with `// TODO: API not found` placeholder, report in summary |
| S2 | Backend DTO mismatch | **Abort**, report field-level diff, await decision |
| S3 | `../study-platform-mvp/` missing | **Abort**, instruct clone |
| S4 | `yarn typecheck` fails | **Abort**, report errors |
| S5 | Sub-section `get_design_context` truncated after retry | Record as partial, continue best-effort, flag in spec Notes |
| S6 | Visual check not converging after 2 iterations | List remaining ❌ in Step 9 summary, hand off to user |

## Tool_Usage

- `mcp__claude_ai_Figma__get_design_context` — page + each sub-section (parallel)
- `mcp__claude_ai_Figma__get_variable_defs` — token extraction
- `mcp__claude_ai_Figma__get_screenshot` — visual reference
- `mcp__claude_ai_Figma__get_metadata` — child tree enumeration
- `Bash` — grep for component reuse, global.css token read, git pull, yarn commands, git add/commit
- `Read` — inspect existing hooks, DTOs, global.css, backend classes
- `Grep` — locate hook candidates, component files
- `Write` — page.tsx, helper components, spec doc, problem doc
- `mcp__chrome-devtools__navigate_page` — load/reload route for verification
- `mcp__chrome-devtools__take_screenshot` — capture Chrome state at each iteration
- `mcp__chrome-devtools__hover` / `mcp__chrome-devtools__click` — activate interactive states
- `mcp__chrome-devtools__take_snapshot` — find element UIDs for hover/click targets

## Final_Checklist

- [ ] All Figma image assets downloaded to `/public/{route-slug}/` — no Figma MCP URLs in source (Step 1b)
- [ ] No asset substituted with HTML text chars, inline SVG, or CSS — img count matches `const imgX` count (Step 1b)
- [ ] Cross-session plan: `get_design_context` re-called for fresh asset URLs (Step 1b)
- [ ] All 4 Figma MCP calls made in parallel (Step 1)
- [ ] Every Level-1 section drilled individually (Step 2)
- [ ] All variant cells sampled (Step 2b)
- [ ] All transform values recorded at exact degree precision (Step 2c)
- [ ] Visual content sizes derived from container sub-node call, not page-level (Step 2e)
- [ ] Token mapping table built against global.css `@theme inline` (Step 3)
- [ ] No arbitrary values or base Tailwind scale used anywhere
- [ ] Component reuse map built — existing components identified and imported (Step 4)
- [ ] `docs/Figma/{slug}.md` written with all tables (Step 5)
- [ ] Route under correct group (landing/service/admin)
- [ ] `(landing)` route registered as `PUBLIC_SESSION` in `route-policy.ts` (Step 6c)
- [ ] Every data region either mapped to real hook or marked TODO
- [ ] Backend repo refreshed via `git pull origin dev`
- [ ] DTO cross-check passed (or aborted on mismatch)
- [ ] QA URL printed in summary
- [ ] Page uses `cn()`, reused components, project tokens only
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` all pass
- [ ] Chrome ↔ Figma loop — ALL checks passed (max 2 iterations) before exiting (Step 8b)
- [ ] Interactive states verified via hover/click (Step 8b)
- [ ] Cross-session: Figma screenshot re-fetched before visual comparison (Step 8b)
- [ ] Figma screenshot URL shown to user for visual comparison (Step 9)
- [ ] User confirmed visual match before commit
- [ ] Single commit on current branch, body lists TODOs and deviations
- [ ] Final output instructs user to run `/pr`
