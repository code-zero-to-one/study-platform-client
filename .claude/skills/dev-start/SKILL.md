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

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_variable_defs(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)` — full child tree for sub-section drill

Follow `.claude/rules/figma-design.md` rules. Annotate which sub-nodes are **data-bearing regions** (lists, badges, conditional UI) — these drive the API mapping pass.

### 2. Save to `docs/Figma/`

Create `docs/Figma/{page-slug}.md` (slug = kebab-case of route, e.g., `premium-study-detail`):

```markdown
# {RouteName}

## Source
- File: {fileKey}
- Node: {nodeId}
- URL: {original Figma URL}
- Captured: {YYYY-MM-DD}

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

## API Mapping
| Region | Hook | DTO Type | File |
|--------|------|----------|------|
| StudyList | useGetGroupStudyList | GroupStudyListResponse | src/hooks/queries/group-study.ts |
| Profile | (none — TODO) | — | — |

## Tokens (Figma → Project)
{same table as design-to-dev}

## Notes
{deviations, missing APIs, designer annotations}
```

### 3. Code Mapping (Route + API)

#### 3a. Route Mapping

Decide the target file path under `src/app/`:

| Figma frame name pattern | Project route group |
|--------------------------|---------------------|
| Public/Landing/Marketing | `src/app/(landing)/.../page.tsx` |
| Authenticated user pages | `src/app/(service)/.../page.tsx` |
| Admin pages | `src/app/(admin)/.../page.tsx` |

Honor existing route conventions (dynamic segments `[id]`, route groups `(group)`). Confirm the chosen path with user **only if ambiguous**.

#### 3b. API Mapping

For every data-bearing region from Step 1:

1. Search `src/hooks/queries/`, `src/api/`, `src/api/openapi/` for matching hook
2. **Found** → record in mapping table (Step 2's `## API Mapping`)
3. **Not found** → leave `// TODO: API not found - <region description>` placeholder in generated code, record in summary (degrade rule S1, per CLAUDE.md mandate "Never fabricate API endpoints")

**Never invent endpoints.** Per CLAUDE.md global rule.

### 4. Backend Repo Refresh + DTO Cross-Check

#### 4a. Repo presence check

```bash
test -d ../study-platform-mvp || { echo "Backend repo missing"; exit 1; }
```

If missing → **abort** (blocker S3). Instruct user:

```
Clone backend repo:
  git clone <backend-repo-url> ../study-platform-mvp
```

#### 4b. Refresh

```bash
cd ../study-platform-mvp && git pull origin dev
```

#### 4c. DTO cross-check

For every hook used in Step 3b:

1. Find the DTO it consumes (from `src/types/api/` or `src/api/openapi/`)
2. Find the matching backend class in `../study-platform-mvp/src/main/...` (Java/Kotlin)
3. Compare per CLAUDE.md required fields:
   - Endpoint path + HTTP method
   - Query/path param names + types
   - Response field names, types, optionality
   - Enum values

**Mismatch found** → **abort** (blocker S2). Report exact field-level mismatch:

```
DTO mismatch for GroupStudyResponse:
  Frontend: maxMembersCount: number (required)
  Backend:  maxMembersCount: Integer? (optional)
Decision needed: update frontend type, or coordinate with backend team?
```

#### 4d. Print QA URL

Always print in summary:

```
QA Swagger UI: https://test-api.zeroone.it.kr/swagger-ui/index.html
QA API base:   https://test-api.zeroone.it.kr
```

Manual verification against QA stays user's responsibility.

### 5. Page Generation

Write `page.tsx` at the path decided in Step 3a. Honor:

- `cn()` for all `className` composition
- Custom tokens only (no arbitrary values, no base Tailwind scale)
- TanStack Query hooks per `.claude/rules/api-patterns.md`
- Optional backend fields per `.claude/rules/backend-data-safety.md` (use `??` for keys, `in` guards for enums)
- TODO placeholders where API hooks are missing

```typescript
'use client'; // or omit for Server Component, decide per data fetching pattern

import { cn } from '@/lib/utils';
import { useGet... } from '@/hooks/queries/...';

export default function {PageName}Page() {
  const { data, isLoading } = useGet...();

  if (isLoading) return <Loading />;
  if (!data) return null;

  return (
    <main className={cn('flex flex-col gap-200 p-200', ...)}>
      {/* sections from Figma */}
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

If `yarn typecheck` fails → **abort** (blocker S4). Report errors to user.

### 6. Verify Gate (delegated)

**Pause here.** Print:

```
✓ Page:   src/app/.../page.tsx
✓ Spec:   docs/Figma/{slug}.md
✓ DTO check: passed
{TODO list if any APIs missing}

Next:
  Option A: Use the `staging-verify` skill to run the page on localhost:3000
  Option B: Run `yarn dev`, open http://localhost:3000{route}, compare against Figma
  Option C: Use Chrome DevTools MCP via `mcp__chrome-devtools__navigate_page`

Reply OK to commit, or describe mismatch to fix.
```

Wait for user OK before continuing.

### 7. Commit

On user OK:

```bash
git add src/app/.../page.tsx \
        docs/Figma/{slug}.md \
        {any helper components created}
git commit -m "feat : {RouteName} 페이지 구현"
```

Korean commit message, `feat : <subject>` format, ≤50 chars.

If TODO placeholders exist (S1 fired), include in commit body:

```
feat : {RouteName} 페이지 구현

API TODOs:
- {region}: matching hook not found in src/hooks/queries/
```

### 8. Stop

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

## Tool_Usage

- `mcp__claude_ai_Figma__*` for design fetch (parallel)
- `Bash` for backend `git pull`, `yarn` commands, `git add`, `git commit`
- `Read` to inspect existing hooks, DTOs, backend classes
- `Grep` to locate hook candidates by pattern (e.g., `useGet.*Study`)
- `Write` for page, helper components, spec
- `mcp__chrome-devtools__*` only if user opts into Option C verify

## Final_Checklist

- [ ] All Figma properties read; data-bearing regions annotated
- [ ] `docs/Figma/{slug}.md` written with route + API mapping tables
- [ ] Route under correct group (landing/service/admin)
- [ ] Every data region either mapped to real hook or marked TODO
- [ ] Backend repo refreshed via `git pull origin dev`
- [ ] DTO cross-check passed (or aborted on mismatch)
- [ ] QA URL printed in summary
- [ ] Page uses `cn()`, custom tokens only, no fabricated APIs
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` all pass
- [ ] User confirmed visual match before commit
- [ ] Single commit on current branch (no PR)
- [ ] Final output instructs user to run `/pr`
