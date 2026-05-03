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

**A.0 — Frame enumeration FIRST (REQUIRED for variant frames)**
```
get_metadata(node-id)
  → enumerate ALL child symbols/nodes inside the frame
  → never assume the root node alone defines the component
  → for design-system files: a single Button frame can contain 96+ variants
    (sizes × colors × states × icon arrangements)
  → record every child node-id; later Steps must cover every cell of the matrix
```

If `get_design_context` is called without first enumerating children, hidden
variants (e.g. Disabled, Pressed, edge-case sizes) will be silently skipped.
This has caused real mismatches (e.g. Primary-Disabled text color drifting from
Secondary-Disabled because only one was sampled).

**A.0.1 — Coordinates ≠ Visual structure (REQUIRED interpretation step)**

`get_metadata` returns absolute (x, y) for every symbol, but the X/Y *grouping
intent* is NOT directly inferable from coordinate clusters. A 96-variant frame
could be either:

  (a) outer = Size (4 columns), inner = Interaction (4 sub-cols), then Type rows
  (b) outer = Type (2 big blocks vertically), inner = Size × State combined row

Both produce similar coordinate clusters but **render in completely different
shapes**. Coordinate-based assumption alone failed in real session: Button
frame `164:1175` was structured as (b), not (a).

Mitigation:
  1. After A.0 enumeration, ALSO call `get_screenshot(frame-node-id)` BEFORE
     building any layout. Visually inspect: are there 2 horizontal mega-bands
     or 4 vertical mega-columns?
  2. Do NOT start writing render code until you have looked at the screenshot.
  3. If structure is ambiguous, build a 1-row prototype, screenshot it, and
     ask the user to confirm orientation BEFORE expanding to all 96 cells.

**A.0.2 — Symbol name ≠ Visual asset (REQUIRED for icon symbols)**

Symbol names like `Icon_left=true, Icon_right=false` only declare position
flags — they do NOT identify which icon graphic is rendered inside. Real case:
metadata showed `Icon_left=true` and the implementer assumed a `<Plus />` icon,
but Figma actually rendered the same `<ArrowRight />` in both positions
(generic placeholder pattern).

Mitigation:
  - For any icon-bearing variant, call `get_design_context(child-node-id)` on
    at least one Primary+icon and one Secondary+icon cell to inspect the actual
    SVG / instance reference.
  - When the icon is a placeholder (same icon in left & right slots), use the
    same component for both positions in code.
  - Never infer icon identity from the variant prop name.

**A.1 — Per-node design context**
```
get_design_context(node-id)            # the parent frame (overview + screenshot)
get_design_context(child-node-id) × N  # MUST sample every (size × color × state) cell
                                       # at minimum: one of each Interaction state
                                       # AND one of each Type per state (Primary vs Secondary
                                       # may use DIFFERENT tokens in the same state)
  → layout: auto-layout vs absolute, padding, gap, alignment
  → transforms: rotation (exact degree e.g. -9.38°), scale, mirror
  → typography: family, weight, size, line-height, letter-spacing
  → effects: drop-shadow, backdrop-blur, blend-mode, opacity
  → hierarchy: parent→child, z-order, masks

get_variable_defs(node-id) × N         # call PER variant — token sets differ
                                       # (e.g. Primary-Disabled may bind a unique
                                       # `color/text/disabled` not used elsewhere)
  → extract design tokens
  → map each to global.css @theme inline variables

get_screenshot()
  → save as reference image for Step 4 comparison
```

**A.2 — Large response handling**
```
If get_design_context output > 50KB, MCP returns persisted-output path.
Use grep + sort + uniq -c on the persisted file to extract token usage
frequency (e.g. how many variants use gap-50 vs gap-75) — this reveals
matrix coverage without re-reading the whole blob.
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

#### Step 3.5 — Spec-matrix story (REQUIRED for design-system frames)

When the source frame contains a variant matrix (e.g. Button = Size × Type ×
State × Icon = 96 cells), add a `FigmaFullSpec` story that reproduces the
Figma layout **pixel-faithfully** for visual regression and design review.

Rules:

1. **Use absolute positioning, NOT flex/gap.** Variant matrices have variable
   column widths (e.g. Large 145px, XSmall 112px) and variable row heights
   (28~48px) that flex containers cannot reproduce without per-cell hacks.

2. **Normalize Figma absolute coords to (0,0) origin and store as a
   single source-of-truth table:**

```typescript
// Pattern from real Button (node 164:1175) implementation
const SIZE_BASE_X: Record<ButtonSize, number> = {
  large: 0, medium: 604, small: 1176, xsmall: 1664,  // from Figma x - 147
};
const STATE_DX: Record<ButtonSize, Record<ButtonState, number>> = {
  large:  { default: 0, hover: 145, pressed: 290, disabled: 435 },
  medium: { default: 0, hover: 137, pressed: 274, disabled: 411 },
  small:  { default: 0, hover: 116, pressed: 232, disabled: 348 },
  xsmall: { default: 0, hover: 112, pressed: 224, disabled: 336 },
};
const ICON_DY: Record<IconArrangement, number> = { none: 0, right: 78, left: 156 };
const TYPE_BASE_Y: Record<ButtonType, number> = { primary: 0, secondary: 354 };

const cells = SIZE_ORDER.flatMap((size) =>
  STATE_ORDER.flatMap((state) =>
    TYPE_ORDER.flatMap((type) =>
      ICON_ORDER.map((icon) => ({
        ...keys,
        x: SIZE_BASE_X[size] + STATE_DX[size][state],
        y: TYPE_BASE_Y[type] + ICON_DY[icon],
      })),
    ),
  ),
);
```

3. **Wrap in `overflow: auto` container** when normalized width exceeds
   viewport (Button matrix = 2072px). Faithful matching > viewport fit.

4. **Statically simulate hover/pressed states** — CSS `:hover` cannot show all
   4 interaction states simultaneously. Use `!important` overrides on cva-
   generated bg classes:

```typescript
const STATE_OVERRIDE: Record<ButtonType, Record<ButtonState, string>> = {
  primary: {
    default: '',
    hover:    '!bg-fill-brand-default-hover',
    pressed:  '!bg-fill-brand-default-pressed',
    disabled: '',  // use disabled prop instead
  },
  // ...
};
```

5. **Disable matrix-axis controls** in story `argTypes` so users don't get
   confused why color/size dropdowns appear inert (they're locked by render
   loop):

```typescript
argTypes: {
  color:        { table: { disable: true } },
  size:         { table: { disable: true } },
  iconPosition: { table: { disable: true } },
  icon:         { table: { disable: true } },
  disabled:     { table: { disable: true } },
}
```

### Step 4 — Figma ↔ Storybook visual comparison

```
1. Start Storybook (yarn storybook → port 6006)
2. Capture each story via Chrome DevTools MCP (take_screenshot fullPage)
3. Re-fetch Figma reference via mcp__claude_ai_Figma__get_screenshot
   (do not reuse a stale screenshot from Step 1 — short-lived URLs may expire)
4. Read BOTH images in the SAME response (parallel Read calls) so the model
   sees them side-by-side, not from memory.

Compare in two modes:
  Visual (multimodal): block structure, column count, row count, color,
                       spacing, typography, radius, shadows, icon identity
  Numeric (text):      transforms — rotation °, scale, mirror
                       coordinate sampling — getBoundingClientRect on key cells
                       to confirm absolute positions match Figma metadata

Output report:
  ✅ Match    — list matched properties
  ⚠️ Deviation — acceptable (sub-pixel rounding, +1px from border, etc.)
                 with explanation
  ❌ Mismatch  — fix → re-capture → re-compare

Only proceed after all ❌ items resolved.
```

#### Step 4.0 — NEVER self-approve a matrix on first pass (REQUIRED)

DOM assertions like "96 buttons rendered, all bg colors correct" prove the
**cells exist** but NOT that the **layout matches Figma**. Real session: a
build with all 96 buttons + correct colors + correct sizes was reported as
"Figma 1:1 match" — but the outer block grouping was completely wrong (4
size-columns vs Figma's 2 type-rows). The user had to point this out.

Required protocol for ANY matrix/spec story:

1. **Always do an explicit screenshot diff** — even when DOM checks pass.
2. **Read both images in one response** so the LLM sees them side-by-side,
   not from prior-message memory.
3. **State the layout structure aloud** before claiming match:
   - "Figma: 2 horizontal mega-blocks (Primary top, Secondary bottom),
     each block has 3 icon-rows × 16-cell rows."
   - "My render: 2 horizontal mega-blocks (...), each block has ..."
   - If the two descriptions differ → it is NOT a match. Fix first.
4. **Defer to user confirmation** when the structure is non-trivial. Phrase
   completion as "structure appears to match — please confirm against the
   Figma file" rather than "1:1 match achieved".

#### Step 4.5 — Token cross-check matrix (REQUIRED)

Pixel-level visual diff misses token-level drift (e.g. `#d1d2d4` vs `#d5d7da` —
3 RGB units, invisible in screenshots but wrong token binding).

Build an explicit table where rows = (size × color × state × icon) cells from
Step A.0 enumeration, and columns = each design property:

| Variant | Figma value | Project token | Resolved px/hex | Match |
|---|---|---|---|---|
| L Primary Default bg | #f63d68 | `bg-fill-brand-default-default` | rose-500 → #f63d68 | ✓ |
| L Secondary Disabled text | #d5d7da | `text-text-disabled` | gray-300 → #d5d7da | ✓ |
| L Primary Disabled text | #d1d2d4 | `text-text-disabled` | gray-300 → #d5d7da | ❌ |
| M/L gap | 6px | `gap-75` | spacing-75 → 6px | ✓ |
| XS/S gap | 4px | `gap-50` | spacing-50 → 4px | ✓ |

Verification commands (project side):
```bash
# Resolve project token to CSS value
grep -E "^\s*--color-text-disabled|^\s*--spacing-75" src/app/global.css

# Extract Figma-side raw hex from variable defs (per node)
get_variable_defs(node-id)
```

Failure modes this catches but visual diff misses:
- Two states map to the same project token but Figma uses two distinct tokens
  (e.g. Primary-Disabled vs Secondary-Disabled text)
- Project token name matches Figma name but resolves to different value
- Spacing scale offsets (4 vs 6 px) inside <10px range
- Hover/Pressed bound to wrong color step (rose-600 vs rose-700)

Each ❌ row is a blocker — either fix the token binding or document the
deviation with explicit user approval before Step 5.

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
