---
name: design-to-dev
description: 'Convert a single Figma component node into a project component. Activates on "컴포넌트 만들어줘", "컴포넌트 구현해줘", "Figma 컴포넌트", "스토리북 만들어줘", "Figma 컴포넌트 구현". Stops at commit; user runs /pr.'
---

# design-to-dev

## Purpose

Take one Figma component node, generate a TypeScript component honoring project conventions, pause for user visual verification, then commit on the current branch. PR creation is **not** part of this skill — user invokes `/pr` afterwards.

Storybook story is generated **only when** the user explicitly requests it ("스토리북", "스토리북도", "story", "storybook").

This skill **coexists** with `.claude/commands/design-to-dev.md` (the legacy slash command). Use the skill for keyword-triggered flows; use the command for explicit `/design-to-dev <url>` invocation.

## Use_When

- User says "컴포넌트 만들어줘", "컴포넌트 구현해줘", "Figma 컴포넌트", "스토리북 만들어줘", "Figma 컴포넌트 구현"
- User shares a Figma URL and the target node is a **single component** (button, card, badge, modal piece) — not a full page
- Output should be one file under `src/components/...`

## Do_Not_Use_When

- Figma node is a full page or route — use `dev-start` skill instead
- User wants only design tokens extracted (no component) — handle inline
- User explicitly invokes the legacy `/design-to-dev` slash command — let that command run
- No Figma URL is available — ask user for one before proceeding

## Inputs

- Figma URL (with `node-id` query param)
- Optional: target component name (PascalCase). If omitted, derive from Figma node name.

## Steps

### 1. Figma Fetch

Run all three Figma MCP calls in parallel:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)` — layout, transforms (rotation/scale), typography, effects, hierarchy
- `mcp__claude_ai_Figma__get_variable_defs(nodeId, fileKey)` — design tokens
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)` — reference image

Follow `.claude/rules/figma-design.md` exhaustively — read **all** properties (rotation precision, gradients, blend modes, effects, etc.). Never implement from screenshot alone.

### 2. Token Mapping

For every Figma variable, look up matching `@theme inline` token in `src/app/global.css`.

| Result | Action |
|--------|--------|
| ✅ Exact match | Use project token (`p-200`, `rounded-150`, etc.) |
| ⚠️ Close match | Use **nearest** project token. Record deviation in commit body. |
| ❌ No match | Still use nearest. Never use Tailwind arbitrary values (`p-[4px]`, `w-[320px]`). |

Base Tailwind scale (`p-4`, `rounded-lg`) is **prohibited** — it resolves to `undefined` after the project's `@theme inline` reset.

### 3. Component Generation

Write to `src/components/...` (location chosen based on component nature: `common/ui/`, `pages/`, or domain folder).

Rules (from CLAUDE.md + `.claude/rules/styling.md`):

- `cn()` for all `className` composition. **No template literal classNames.**
- Custom tokens only. **No arbitrary values, no base Tailwind scale.**
- TypeScript props interface required.
- Optional backend fields → marked with `?` and used safely (see `.claude/rules/backend-data-safety.md`).
- No hardcoded colors / hex values.

```typescript
import { cn } from '@/lib/utils';

interface {ComponentName}Props {
  // ...
}

export function {ComponentName}({ ... }: {ComponentName}Props) {
  return (
    <div className={cn('flex flex-col gap-150 p-200 rounded-200', ...)}>
      ...
    </div>
  );
}
```

After write, run **in order**:

```bash
yarn lint:fix
yarn prettier:fix
yarn typecheck
```

If `yarn typecheck` fails → **abort** (blocker D2). Report errors to user. Do not commit.

### 4. Storybook Story Generation (opt-in)

**Only run this step if the user explicitly said "스토리북", "스토리북도", "story", or "storybook".**

Write co-located `{ComponentName}.stories.tsx` next to the component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { {ComponentName} } from './{ComponentName}';

const meta = {
  title: 'Components/{ComponentName}',
  component: {ComponentName},
} satisfies Meta<typeof {ComponentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { /* ... */ } };

// State variants present in Figma (hover/disabled/loading/error)
export const {Variant}: Story = { args: { /* ... */ } };

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
```

If story generation fails (missing types, etc.) → **continue** with component only + emit warning (degrade rule D3).

### 5. Verify Gate

**Pause here.** Print:

```
✓ Component: src/components/.../{ComponentName}.tsx
{if storybook: ✓ Story: src/components/.../{ComponentName}.stories.tsx}

Next:
  Compare the component against the Figma reference screenshot.
  Reply OK to commit, or describe mismatch to fix.
```

Wait for user OK before continuing.

### 6. Commit

On user OK:

```bash
git add src/components/.../{ComponentName}.tsx
{if storybook: git add src/components/.../{ComponentName}.stories.tsx}
git commit -m "feat : {ComponentName} 컴포넌트 구현"
```

Korean commit message, `feat : <subject>` format, ≤50 chars (CLAUDE.md global convention).

If token deviations exist, include them in commit body:

```
feat : {ComponentName} 컴포넌트 구현

Token deviations:
- Figma color/accent/300 → bg-accent-200 (nearest, +50 lightness)
```

### 7. Stop

Print:

```
Run `/pr` to open PR against `develop`.
```

**Do not auto-create PR.** User invokes `/pr` manually.

## Blockers

| ID | Condition | Action |
|----|-----------|--------|
| D1 | Token mapping has no match | Use nearest, record deviation in commit body, continue |
| D2 | `yarn typecheck` fails | **Abort**, report errors |
| D3 | Storybook story generation fails | Continue with component only + warn |

## Tool_Usage

- `mcp__claude_ai_Figma__*` for design fetch (parallel)
- `Write` for component, story
- `Bash` for `yarn lint:fix`, `yarn prettier:fix`, `yarn typecheck`, `git add`, `git commit`
- Never `Bash` for file edits — use `Edit` / `Write`

## Final_Checklist

- [ ] All Figma properties read (transforms, gradients, typography, effects)
- [ ] Component uses `cn()` only, no arbitrary values, no base Tailwind scale
- [ ] `yarn lint:fix && yarn prettier:fix && yarn typecheck` all pass
- [ ] Storybook story only generated if user explicitly requested
- [ ] User confirmed visual match before commit
- [ ] Single commit on current branch (no PR)
- [ ] Final output instructs user to run `/pr`
