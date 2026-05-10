---
name: extract-common-component
description: 'Extract a shared component from 2+ inline page occurrences. Has two modes: Discovery (auto-scan codebase for candidates) and Direct (user names the component). Runs Figma divergence check, generates component + mandatory Storybook stories, replaces all inline duplicates. Activates on "공통 컴포넌트로 빼줘", "공통화해줘", "여러 페이지에서 쓰이는", "재사용 컴포넌트", "공통 컴포넌트 만들어줘", "extract common", "common component", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘", "자동으로 찾아줘", "중복 찾아줘". Stops at user confirmation; user runs /pr.'
---

# extract-common-component

## Purpose

Locate a UI pattern repeated inline across 2+ page files, confirm visual identity via Figma (if URLs provided) or codebase analysis, generate one shared component under `src/components/common/`, write mandatory Storybook stories, and replace all inline duplicates. Pauses for user confirmation before committing.

This skill differs from `design-to-dev` in three critical ways:
- Storybook is **always** generated (not opt-in)
- Existing page files are **modified** (inline JSX replaced with import)
- Divergence check is **mandatory** — aborts if designs differ structurally

## Modes

| Mode | Entry condition | First step |
|------|----------------|-----------|
| **Discovery** | User does not name a specific component ("자동으로 찾아줘", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘") | Step 0 |
| **Direct** | User names a component or describes a specific pattern | Step 1 |

## Use_When

- User says "공통 컴포넌트로 빼줘", "공통화해줘", "여러 페이지에서 쓰이는", "재사용 컴포넌트", "공통 컴포넌트 만들어줘", "extract common", "common component"
- User says "자동으로 찾아줘", "중복 컴포넌트 찾아줘", "공통화 후보 찾아줘", "중복 찾아줘" (→ Discovery mode)
- A UI pattern appears identically or with prop-level variants in 2+ page files
- Output should go under `src/components/common/`

## Do_Not_Use_When

- Only one occurrence exists — use `design-to-dev` instead
- User wants a new component with no existing inline implementation — use `design-to-dev`
- User explicitly wants domain-specific (not shared) components — handle inline
- Designs are structurally diverged (>30% layout diff) — abort and report to user

## Inputs

- Component name or description (optional in Discovery mode — skill finds candidates automatically)
- Figma URLs for each occurrence (optional but recommended — enables divergence check)
- List of page files where it appears inline (optional — skill will grep if not provided)

---

## Steps

### 0. Discovery Mode (skip if Direct mode)

**Goal:** Surface the top 5–10 extraction candidates ranked by duplication value, then ask the user to pick one.

#### 0a. Structural Pattern Scan (AST grep)

Use `mcp__plugin_oh-my-claudecode_t__ast_grep_search` to find JSX patterns that recur in multiple files. Run these queries in parallel:

```
# Card-like patterns: outer div with className containing multiple children
pattern: <div className="$CLASS">$$$CHILDREN</div>
files: src/app/**/*.tsx, src/components/pages/**/*.tsx

# Section/banner patterns
pattern: <section className="$CLASS">$$$CHILDREN</section>

# List item patterns repeated inside map
pattern: {$LIST.map(($ITEM) => (<$TAG className="$CLASS">$$$BODY</$TAG>))}
```

For each match, record:
- File path
- Line range (start–end)
- Rough JSX block size (line count)
- `className` fingerprint (first 60 chars of the className value)

#### 0b. className Fingerprint Scan (grep)

```bash
# Extract all className strings longer than 30 chars from page files
grep -rh 'className="[^"]\{30,\}"' src/app/ src/components/pages/ --include="*.tsx" \
  | sed 's/.*className="\([^"]*\)".*/\1/' \
  | sort | uniq -d -c | sort -rn | head -20
```

Cross-reference: any `className` string appearing in 2+ files is a candidate fingerprint.

#### 0c. Rank Candidates

Score each candidate:

```
score = file_count × block_line_count
```

Deduplicate (AST and className results may overlap). Keep top 10.

#### 0d. Present Candidate Table

Print a ranked table. **Pause for user selection.**

```
Duplicate UI patterns found — pick one to extract:

 #  Pattern                          Files  Lines  Suggested name
 1  EmptyState (icon + text + CTA)      4     18   EmptyState
 2  SectionHeader (title + subtitle)    3     12   SectionHeader
 3  StudyCard thumbnail row             3     24   StudyCardThumbnail
 4  Badge + label stack                 2      8   BadgeLabel
 5  Pagination controls                 2     14   Pagination
 ...

Reply with a number (e.g. "2"), or "none" to cancel.
```

- If user replies with a number → set `{ComponentPattern}` and `{suggested name}` from that row → proceed to Step 1
- If user replies "none" → stop, print "No extraction performed."
- If user names a different component not in the list → treat as Direct mode, proceed to Step 1 with that input

---

### 1. Locate Inline Occurrences

If page files are not provided by the user, grep the codebase:

```bash
grep -r "{ComponentPattern}" src/app/ src/components/pages/ --include="*.tsx" -l
```

Replace `{ComponentPattern}` with the component name or a distinctive JSX snippet from the description (or the className fingerprint from Discovery Step 0b).

List all files found.

**Blocker S1:** Fewer than 2 locations found → **Abort**. Report: "Only 1 occurrence found. Use `design-to-dev` instead."

### 2. Figma Divergence Check (if URLs provided)

Run in parallel for **each** Figma URL:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)`
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)`

Follow `.claude/rules/figma-design.md` exhaustively — read **all** properties (rotation, gradients, effects, hierarchy). Never rely on screenshot alone.

Classify across all occurrences:

| Result | Definition | Action |
|--------|-----------|--------|
| **Identical** | Zero visual diff | Single component, no variant props |
| **Prop variants** | Same structure, different colors/text/states | Single component with typed `variant` props |
| **Structurally diverged** | >30% layout diff (different grid, different element count, different nesting) | **Abort S2** — report diff to user |

If no Figma URLs provided: proceed with codebase-only analysis (compare JSX structure across files manually).

**Blocker S2:** Designs structurally diverged → **Abort**. Report exact diff: which nodes differ, which layout properties conflict.

### 3. Asset Download (if Figma image assets found)

Follow `figma-fetch` rules:
- Download all image assets referenced in designs to `/public/{route-slug}/`
- **Never** hardcode Figma MCP URLs in component source — always use local `/public/` paths

### 4. Token Mapping

For every Figma variable (or inline Tailwind class in existing code), map to `src/app/global.css` `@theme inline` tokens:

| Match | Action |
|-------|--------|
| ✅ Exact | Use project token (`p-200`, `rounded-150`) |
| ⚠️ Close | Use **nearest** project token — record deviation for commit body |
| ❌ None | Use nearest — **never** use arbitrary values (`p-[4px]`) or base Tailwind scale (`p-4`) |

Base Tailwind scale is **prohibited** — resolves to `undefined` after the project's `@theme inline` reset.

### 5. Determine Component Location

| Component nature | Location |
|-----------------|---------|
| Pure UI (no domain data, no API) | `src/components/common/ui/{ComponentName}.tsx` |
| Shared with domain context or layout | `src/components/common/{ComponentName}.tsx` |

### 6. Generate Component

Write to the location determined in Step 5.

Requirements:
- `cn()` for **all** `className` composition — no template literals
- Custom project tokens only — no arbitrary values, no base Tailwind scale
- TypeScript `Props` interface required (exported)
- Variant props typed with a `variant` or `type` field if designs differ
- Optional backend fields → `?` with safe guards per `.claude/rules/backend-data-safety.md`

After writing:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

**Blocker S3:** `yarn typecheck` fails → **Abort**. Report exact TypeScript errors.

### 7. Generate Storybook Story (Always — Not Opt-In)

Write co-located `{ComponentName}.stories.tsx` in the same directory as the component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {ComponentName} } from './{ComponentName}';

const meta = {
  title: 'Components/{ComponentName}',
  component: {ComponentName},
} satisfies Meta<typeof {ComponentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { /* props matching the first Figma occurrence or primary usage */ },
};

// One story per variant found in Figma or codebase
export const {Variant}: Story = {
  args: { /* variant-specific props */ },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  args: { /* same as Default */ },
};
```

**Degrade S4:** If story generation fails (compile error, missing args) → Continue with component only + print warning. Do **not** abort.

### 8. Replace Inline Duplicates

For **each** file found in Step 1:

1. Add import at top of file:
   ```typescript
   import { {ComponentName} } from '@/components/common/{path}';
   ```
2. Replace inline JSX block with:
   ```tsx
   <{ComponentName} {...existingProps} />
   ```
3. Preserve all existing prop values exactly — do not alter logic, only the JSX structure

After all replacements:

```bash
yarn typecheck
```

**Blocker S3 (repeat):** `yarn typecheck` fails → Abort. Report errors.

### 9. Verify Gate

**Pause.** Print summary and wait for user confirmation before committing:

```
✓ Component:  src/components/common/{path}/{ComponentName}.tsx
✓ Story:      src/components/common/{path}/{ComponentName}.stories.tsx
✓ Replaced:   {N} page files updated
  - src/app/(landing)/{page1}/page.tsx
  - src/components/pages/{page2}.tsx
✓ Typecheck:  passed

Token deviations (if any):
  - {Figma token} → nearest: {project token} (delta: {value})

TODOs (if any):
  - [ ] {pending item}

Reply OK to commit, or describe any mismatch to fix first.
```

Do **not** commit until user replies "OK" or equivalent confirmation.

### 10. Commit

After user confirmation:

```bash
git add src/components/common/{path}/{ComponentName}.tsx \
        src/components/common/{path}/{ComponentName}.stories.tsx \
        {all modified page files}

git commit -m "feat : {ComponentName} 공통 컴포넌트 추출"
```

Commit body must include:
- List of replaced page files
- Token deviations recorded in Step 4
- Any TODOs deferred to follow-up

### 11. Stop

Print: `Run /pr to open a PR against develop.`

Do **not** push or open a PR automatically.

---

## Blockers Reference

| ID | Condition | Action |
|----|-----------|--------|
| **S1** | Fewer than 2 occurrence locations found | Abort — direct user to `design-to-dev` |
| **S2** | Figma designs structurally diverged (>30% layout diff) | Abort — report exact diff to user |
| **S3** | `yarn typecheck` fails (after component write or after replacements) | Abort — report TypeScript errors |
| **S4** | Storybook story fails (compile error) | Continue with warning — do not abort |

---

## Key Differences from `design-to-dev`

| Aspect | design-to-dev | extract-common-component |
|--------|--------------|--------------------------|
| Storybook | Opt-in (user must request) | **Always generated** |
| Existing page files | Not touched | **All inline duplicates replaced** |
| Input | Single Figma URL | 2+ URLs or codebase grep |
| Component location | `src/components/...` (flexible) | `src/components/common/` (fixed) |
| Divergence check | N/A | **Required** — abort if designs differ |
| Trigger | Single component to build | Existing duplication to consolidate |
| Discovery | N/A | **Auto-scan** when no component named |

---

## Final Checklist

- [ ] Mode determined: Discovery (Step 0) or Direct (Step 1)
- [ ] **Discovery only:** Candidate table presented, user selected one
- [ ] At least 2 occurrence locations confirmed (Step 1)
- [ ] Figma designs classified: identical / prop-variant / diverged (Step 2)
- [ ] Diverged → aborted with report (S2)
- [ ] All Figma image assets downloaded to `/public/` (Step 3)
- [ ] Token mapping table built (Step 4)
- [ ] Component uses `cn()`, custom tokens only, TypeScript `Props` interface (Step 6)
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` pass (Step 6)
- [ ] Storybook story generated: Default + variant stories + Mobile story (Step 7)
- [ ] All inline duplicates replaced with `import` + `<ComponentName />` (Step 8)
- [ ] `yarn typecheck` passes after replacements (Step 8)
- [ ] User confirmed before commit (Step 9)
- [ ] Single commit — component + story + all modified pages (Step 10)
