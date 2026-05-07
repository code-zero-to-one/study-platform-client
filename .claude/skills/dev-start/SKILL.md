---
name: dev-start
description: 'Convert a Figma page or route node into a Next.js App Router page wired to real APIs. Activates on "페이지 구현해줘", "페이지 만들어줘", "Figma 페이지", "라우트 구현", "페이지 시작". Refreshes backend repo, cross-checks DTOs, stops at commit.'
---

# dev-start

## Purpose

Take one Figma page/route node, save its design context to `docs/Figma/`, decide route + API mappings, refresh `../study-platform-mvp/` backend repo + cross-check DTOs, generate a Next.js page wired to real hooks, pause for user verification (Chrome / staging-verify), then commit on the current branch. PR creation is **not** part of this skill — user invokes `/pr` afterwards.

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

## Steps

### 1. Figma Fetch

Run in parallel:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)` — layout, transforms, typography, effects, hierarchy
- `mcp__claude_ai_Figma__get_variable_defs(nodeId, fileKey)` — design tokens
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)` — reference image (save URL for Step 9)
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)` — full child tree for Step 2 drill
- `mcp__claude_ai_Figma__get_code_connect_suggestions(nodeId, fileKey)` — Code Connect JSX snippets if configured

Follow `.claude/rules/figma-design.md` exhaustively. After receiving results:

- If `get_design_context` output appears truncated (ends mid-property or contains `...`) → flag for re-call in Step 2.
- If `get_code_connect_suggestions` returns JSX for any child node → mark those instances as **CC-mapped** (used in Step 4).

### 2. Sub-section Drill + Variant Sampling

**Do not skip.** Page-level frames are too large for a single `get_design_context` call — sections must be drilled individually.

#### 2a. Enumerate Level-1 sections

From `get_metadata` result, extract all direct children of the page frame. For each child node:

| Node type | Action |
|-----------|--------|
| Data-bearing (list, grid, card group, form) | `get_design_context` individually |
| Complex layout (3+ nested levels) | `get_design_context` individually |
| Variant component instance | enumerate all variant cells → `get_design_context` each cell |
| Static / decorative (hero text, divider) | re-use parent call result |

Run all individual `get_design_context` calls in parallel.

#### 2b. Variant matrix sampling

For any section that is a Component with Variants:

1. Identify all variant dimensions (e.g., `state × size × type`)
2. Call `get_design_context` on **every cell** of the matrix — not just the default
3. Record exact per-cell diffs (color changes, size changes, show/hide layers)

Missing a variant cell = that state will not be implemented in the page.

#### 2c. Transform capture

For every node (including children):

- Record **exact rotation** in degrees (e.g., `-9.38°`, `+18.03°`) — never round
- Record negative scale (mirror transform)
- Group nodes sharing the same transform — they form a designer-intentional system

#### 2d. Truncation recovery

If any `get_design_context` sub-call still appears truncated → call `get_metadata` on that sub-node to expose its own children, then drill one level deeper.

### 3. Token Mapping

For every Figma variable from Step 1's `get_variable_defs`:

1. Read `src/app/global.css` → find all `@theme inline` token names (pattern: `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`)
2. Map each Figma variable:

| Result | Action |
|--------|--------|
| ✅ Exact name match | Use project token (e.g., `bg-gray-900`, `text-primary-500`) |
| ⚠️ Closest name match | Use nearest project token. Record deviation: `Figma color/accent/300 → bg-accent-200` |
| ❌ No match | Use nearest available token. **Never** use Tailwind arbitrary values (`p-[4px]`) or base Tailwind scale (`p-4`). Record deviation. |

3. Build mapping table — saved to spec doc in Step 5.

**Token naming reference for this project:**

- Colors: `bg-gray-{0|50|100|...|1000}`, `text-gray-*`, `border-gray-*`
- Semantic: `bg-primary-*`, `text-primary-*` (check global.css for exact names)
- Spacing: `p-{token}`, `gap-{token}`, `m-{token}` (project custom scale, not Tailwind default)
- Radius: `rounded-{token}` (project custom, not Tailwind default)

### 4. Component Reuse Check

Before writing any code, identify which Figma sections already exist as components.

#### 4a. Extract component instances

From `get_metadata`, collect all nodes where `type === "INSTANCE"` — these are Figma component instances.

#### 4b. Check codebase

For each instance:

```bash
# Search by component name (kebab-case and PascalCase)
grep -r "{ComponentName}" src/components/ --include="*.tsx" -l
```

| Result | Action |
|--------|--------|
| **Found in `src/components/`** | Record import path. Use in Step 8. Do not re-implement. |
| **CC-mapped** (Step 1 flag) | Use the Code Connect JSX snippet directly. Do not re-implement. |
| **Not found** | Mark as TODO. Add to summary. Note that `design-to-dev` skill should be run separately for this component. |

#### 4c. Output: Component reuse map

```
| Figma instance      | Codebase path                          | Status     |
|---------------------|----------------------------------------|------------|
| Button/Primary      | src/components/common/ui/Button.tsx    | ✅ reuse   |
| Card/Study          | src/components/pages/StudyCard.tsx     | ✅ reuse   |
| Badge/Status        | —                                      | ❌ TODO    |
```

### 5. Save to `docs/Figma/`

Create `docs/Figma/{page-slug}.md` (slug = kebab-case of route, e.g., `premium-study-detail`):

```markdown
# {RouteName}

## Source
- File: {fileKey}
- Node: {nodeId}
- URL: {original Figma URL}
- Captured: {YYYY-MM-DD}
- Screenshot: {get_screenshot URL or "see Figma URL"}

## Route
- Target path: src/app/(service)/.../page.tsx
- Layout group: (landing|service|admin)
- Auth required: yes/no

## Sections
| Section | Type | Data Source | Notes |
|---------|------|-------------|-------|
| Header | static | — | logo + nav |
| StudyList | data | useGetGroupStudyList | paginated |
| ... | ... | ... | ... |

## Component Reuse
| Figma instance | Codebase path | Status |
|----------------|---------------|--------|
| Button/Primary | src/components/common/ui/Button.tsx | ✅ reuse |
| Card/Study | src/components/pages/StudyCard.tsx | ✅ reuse |
| Badge/Status | — | ❌ TODO (run design-to-dev) |

## Token Mapping
| Figma Variable | Project Token | Status |
|----------------|---------------|--------|
| color/primary/500 | bg-primary-500 | ✅ exact |
| color/accent/300 | bg-accent-200 | ⚠️ nearest (+50 lightness) |

## Token Deviations
{list any ⚠️ or ❌ mappings with reasoning}

## Transforms
| Node | Rotation | Scale | Notes |
|------|----------|-------|-------|
| HeroDecoration | -9.38° | 1x | intentional tilt |

## API Mapping
| Region | Hook | DTO Type | File |
|--------|------|----------|------|
| StudyList | useGetGroupStudyList | GroupStudyListResponse | src/hooks/queries/group-study.ts |
| Profile | (none — TODO) | — | — |

## Notes
{deviations, missing APIs, variant anomalies, designer annotations}
```

### 6. Code Mapping (Route + API)

#### 6a. Route Mapping

Decide the target file path under `src/app/`:

| Figma frame name pattern | Project route group |
|--------------------------|---------------------|
| Public/Landing/Marketing | `src/app/(landing)/.../page.tsx` |
| Authenticated user pages | `src/app/(service)/.../page.tsx` |
| Admin pages | `src/app/(admin)/.../page.tsx` |

Honor existing route conventions (dynamic segments `[id]`, route groups `(group)`). Confirm the chosen path with user **only if ambiguous**.

#### 6b. API Mapping

For every data-bearing region from Step 2:

1. Search `src/hooks/queries/`, `src/api/`, `src/api/openapi/` for matching hook
2. **Found** → record in mapping table (Step 5's `## API Mapping`)
3. **Not found** → leave `// TODO: API not found - <region description>` placeholder in generated code (degrade rule S1, per CLAUDE.md mandate "Never fabricate API endpoints")

**Never invent endpoints.**

### 7. Backend Repo Refresh + DTO Cross-Check

#### 7a. Repo presence check

```bash
test -d ../study-platform-mvp || { echo "Backend repo missing"; exit 1; }
```

If missing → **abort** (blocker S3).

#### 7b. Refresh

```bash
cd ../study-platform-mvp && git pull origin dev
```

#### 7c. DTO cross-check

For every hook used in Step 6b:

1. Find the DTO it consumes (from `src/types/api/` or `src/api/openapi/`)
2. Find the matching backend class in `../study-platform-mvp/src/main/...`
3. Compare: endpoint path + HTTP method, query/path param names + types, response field names/types/optionality, enum values

**Mismatch found** → **abort** (blocker S2). Report exact field-level diff.

#### 7d. Print QA URL

```
QA Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html
QA API base:   https://test-api.zeroone.it.kr
```

### 8. Page Generation

Write `page.tsx` at the path from Step 6a. Apply:

- Component reuse map from Step 4 — import and use existing components. Do not re-implement.
- Code Connect JSX snippets (CC-mapped instances) as-is, adapted to project conventions.
- Token mapping from Step 3 — project tokens only, no arbitrary values, no base Tailwind scale.
- `cn()` for all `className` composition. No template literal classNames.
- TanStack Query hooks from Step 6b.
- Optional backend fields: `??` for nullables, `in` guards for enums.
- TODO placeholders where API hooks or components are missing.

```typescript
'use client'; // or omit for Server Component

import { cn } from '@/lib/utils';
import { Button } from '@/components/common/ui/Button'; // reused from Step 4
import { StudyCard } from '@/components/pages/StudyCard'; // reused from Step 4
import { useGetGroupStudyList } from '@/hooks/queries/group-study';

export default function {PageName}Page() {
  const { data, isLoading } = useGetGroupStudyList();

  if (isLoading) return <Loading />;
  if (!data) return null;

  return (
    <main className={cn('flex flex-col gap-200 p-200')}>
      {/* sections from Figma — using reused components where available */}
    </main>
  );
}
```

After write, run **in order**:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

If `yarn typecheck` fails → **abort** (blocker S4). Report errors.

### 9. Verify Gate

**Pause here.** Print:

```
✓ Page:       src/app/.../page.tsx
✓ Spec:       docs/Figma/{slug}.md
✓ DTO check:  passed
✓ Reference:  {Figma screenshot URL from Step 1} — use this as visual baseline
{TODO list if any APIs or components missing}

Next:
  Option A: Use the `staging-verify` skill → localhost:3000
  Option B: yarn dev → http://localhost:3000{route}, compare against Figma screenshot
  Option C: mcp__chrome-devtools__navigate_page

Reply OK to commit, or describe mismatch to fix.
```

Wait for user OK before continuing.

### 10. Commit

On user OK:

```bash
git add src/app/.../page.tsx \
        docs/Figma/{slug}.md \
        {any helper components created}
git commit -m "feat : {RouteName} 페이지 구현"
```

Korean commit message, `feat : <subject>` format, ≤50 chars.

If TODO placeholders exist (S1 fired) or token deviations exist (Step 3), include in commit body:

```
feat : {RouteName} 페이지 구현

API TODOs:
- {region}: matching hook not found in src/hooks/queries/

Token deviations:
- Figma color/accent/300 → bg-accent-200 (nearest, +50 lightness)

Component TODOs:
- Badge/Status: run design-to-dev skill separately
```

### 11. Stop

Print:

```
Run `/pr` to open PR against `develop`.
```

**Do not auto-create PR.**

## Blockers

| ID | Condition | Action |
|----|-----------|--------|
| S1 | API hook not found | Continue with `// TODO: API not found` placeholder, report in summary |
| S2 | Backend DTO mismatch | **Abort**, report field-level diff, await decision |
| S3 | `../study-platform-mvp/` missing | **Abort**, instruct clone |
| S4 | `yarn typecheck` fails | **Abort**, report errors |
| S5 | Sub-section `get_design_context` still truncated after retry | Record as partial, continue with best-effort, flag in spec Notes |

## Tool_Usage

- `mcp__claude_ai_Figma__get_design_context` — page + each sub-section (parallel)
- `mcp__claude_ai_Figma__get_variable_defs` — token extraction
- `mcp__claude_ai_Figma__get_screenshot` — visual reference
- `mcp__claude_ai_Figma__get_metadata` — child tree enumeration
- `mcp__claude_ai_Figma__get_code_connect_suggestions` — Code Connect JSX
- `Bash` — grep for component reuse, global.css token read, git pull, yarn commands, git add/commit
- `Read` — inspect existing hooks, DTOs, global.css, backend classes
- `Grep` — locate hook candidates (`useGet.*Study`), component files
- `Write` — page.tsx, helper components, spec doc
- `mcp__chrome-devtools__*` — only if user opts into Option C verify

## Final_Checklist

- [ ] All 5 Figma MCP calls made in parallel (Step 1)
- [ ] Every Level-1 section drilled individually via `get_design_context` (Step 2)
- [ ] All variant cells sampled — no state left unread (Step 2b)
- [ ] All transform values recorded at exact degree precision (Step 2c)
- [ ] Token mapping table built against global.css `@theme inline` (Step 3)
- [ ] No arbitrary values or base Tailwind scale used anywhere
- [ ] Component reuse map built — existing components identified and imported (Step 4)
- [ ] `docs/Figma/{slug}.md` written with all tables (Step 5)
- [ ] Route under correct group (landing/service/admin)
- [ ] Every data region either mapped to real hook or marked TODO
- [ ] Backend repo refreshed via `git pull origin dev`
- [ ] DTO cross-check passed (or aborted on mismatch)
- [ ] QA URL printed in summary
- [ ] Page uses `cn()`, reused components, project tokens only
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` all pass
- [ ] Figma screenshot URL shown to user for visual comparison (Step 9)
- [ ] User confirmed visual match before commit
- [ ] Single commit on current branch, body lists TODOs and deviations
- [ ] Final output instructs user to run `/pr`
