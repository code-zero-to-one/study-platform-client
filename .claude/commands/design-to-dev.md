# /design-to-dev — Figma to Component Pipeline

Converts a Figma URL into committed component code + Storybook stories + visual comparison report.

## Input

```
/design-to-dev <figma-url> [component-name]
```

Example:
```
/design-to-dev https://figma.com/design/xxx?node-id=123 StudyCard
```

## Execution Order

### Step 1 — Parallel preparation

Run all three simultaneously:

**A. Figma analysis** (Figma MCP)
```
get_design_context(node-id)
  → layout: auto-layout vs absolute, padding, gap, alignment
  → transforms: rotation (exact degree e.g. -9.38°), scale, mirror
  → typography: family, weight, size, line-height, letter-spacing
  → effects: drop-shadow, backdrop-blur, blend-mode, opacity
  → hierarchy: parent→child, z-order, masks

get_variable_defs()
  → extract design tokens
  → map each to global.css @theme inline variables

get_screenshot()
  → save as reference image for Step 4 comparison
```

**B. Token audit**
```
Build mapping table: Figma token → project custom token

✅ Mapped  → use project token (p-200, rounded-150, etc.)
⚠️ Close   → use nearest token, note deviation in report
❌ No match → BLOCK: report to user before proceeding
             Never use arbitrary values (p-[3px], w-[320px])
```

**C. Backend sync**
```
cd ../study-platform-mvp && git pull origin dev

If component renders backend data:
  → identify related DTO in src/types/api/ or src/api/openapi/
  → extract optional fields list → mark as ? in component props
```

### Step 2 — Component generation

```typescript
// Rules enforced:
// - Custom tokens only (p-200, gap-150, rounded-200)
// - cn() for all className composition
// - TypeScript props interface required
// - Optional backend fields marked with ?
// - No hardcoded colors or hex values

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className={cn('flex flex-col gap-150 p-200 rounded-200', ...)}>
      ...
    </div>
  );
}
```

After writing component:
```bash
yarn lint:fix && yarn prettier:fix && yarn typecheck
```
All three must pass before continuing.

### Step 3 — Storybook story generation

Generate alongside component (same PR):

```typescript
// ComponentName.stories.tsx
export default {
  title: 'Components/ComponentName',
  component: ComponentName,
} satisfies Meta<typeof ComponentName>;

// Required stories:
export const Default: Story = { args: { ... } };
export const [StateVariant]: Story = { ... }; // hover, disabled, loading, error
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
```

### Step 4 — Figma ↔ Storybook visual comparison

```
1. Start Storybook (yarn storybook → port 6006)
2. Capture each story via Claude Preview MCP (preview_screenshot)
3. Load Figma reference image from Step 1

Compare in two modes:
  Visual (multimodal): color, spacing, typography, radius, shadows
  Numeric (text):      transforms — rotation °, scale, mirror
                       (screenshots cannot reliably show transform values)

Output report:
  ✅ Match    — list matched properties
  ⚠️ Deviation — acceptable (sub-pixel rounding, etc.) with explanation
  ❌ Mismatch  — fix → re-capture → re-compare

Only proceed after all ❌ items resolved.
```

### Step 5 — Commit to feature branch

```
git add src/components/... src/stories/...
commit message: "feat : <ComponentName> 컴포넌트 구현"
```

Include in commit:
- Component file
- Storybook story file
- Token mapping deviations (if any) noted in commit body

## Output

```
✓ Token audit — 12 tokens mapped, 0 blocked
✓ Component — src/components/common/ui/StudyCard.tsx
✓ Story — src/stories/StudyCard.stories.tsx
✓ Visual comparison — 8 ✅ match, 1 ⚠️ deviation (rounded 8.03° → 8°)
✓ Committed: feat : StudyCard 컴포넌트 구현
```

## Blockers (stop and report to user)

- Token audit: Figma token has no matching project token
- Typecheck fails after generation
- Visual comparison: ❌ mismatch that cannot be resolved with available tokens
- Backend DTO not found for a component that renders API data

## Notes

- Transform values (rotation, scale) must be compared numerically, not visually.
  `-9.38°` and `-9°` are different — use exact Figma value.
- `get_screenshot` is for reference only. Never implement from screenshot alone.
- Component and story always committed together — never separately.
- This command does NOT create a PR. Run `/pr` after feature dev is complete (Phase 2).
