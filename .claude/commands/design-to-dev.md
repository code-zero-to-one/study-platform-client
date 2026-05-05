# /design-to-dev-en — Turn a Figma Design Into Component Code

Takes a Figma URL and produces component code + Storybook stories + a visual comparison report, then commits everything.

## Usage

```
/design-to-dev-en <figma-url> [component-name]
```

Example:
```
/design-to-dev-en https://figma.com/design/xxx?node-id=123 StudyCard
```

---

### Step 0 — Figure out what kind of frame this is (before writing any code)

Look at the Figma frame and decide which type it is. The type determines which stories you need to build.

| Type | What it looks like | Stories needed |
|------|--------------------|----------------|
| **A — Single component** | One component, different states (hover, disabled, etc.) | Default + each state + Mobile |
| **B — Variant grid** | A table of size × state × type combinations | VisualMatrix + Interactive |
| **C — Composite screen** | Multiple different components placed together | Composite story |

If you can't tell, call `get_screenshot(frame-node-id)` to look at the frame visually before deciding.

---

### Step 1 — Preparation (run A, B, C at the same time)

#### A. Read the Figma design

**A.0 — List all child nodes first (required)**

If you only look at the root node, you'll miss hidden states like Disabled or Pressed.

```
get_metadata(node-id)
  → list every child node inside the frame
  → a single Button frame can have 96+ variants inside
  → write down every child node-id and name
```

**A.0.0 — Check Code Connect mapping first (required)**

Before writing any code, check whether the Figma node is already mapped to a codebase component.

```
get_code_connect_map(node-id)
  → mapping exists → import the mapped component, skip code generation
  → no mapping → continue with the normal workflow (A.0.1 onward)
```

After Step 5 commit, optionally register the new component to Code Connect:
```
get_code_connect_suggestions(node-id) → send_code_connect_mappings(...)
```
(Optional — prevents duplicate generation on the next run against the same design.)

**A.0.1 — Don't guess the layout from coordinates alone (required)**

Figma gives you absolute (x, y) positions, but those numbers don't tell you whether the grid reads left-to-right or top-to-bottom. The same coordinate spread could mean:
- (a) Size changes across columns, state changes within sub-columns
- (b) Type makes the big blocks, size × state fills each block

These look similar in raw numbers but are completely different visually.

What to do:
1. After A.0, call `get_screenshot(frame-node-id)` before writing anything
2. Look at the screenshot — how many big columns? How many big rows?
3. **Do not write render code until you've seen the screenshot**
4. If still unclear, build a one-row prototype → take screenshot → ask the user to confirm → then expand

**A.0.2 — A symbol's name doesn't tell you which icon it is (required)**

`Icon_left=true` just means "icon on the left" — it doesn't say which icon. You can't guess the icon from the prop name.

- For any icon-bearing variant, call `get_design_context(child-node-id)` to see the actual SVG
- If both left and right slots use the same icon (placeholder pattern), use the same component for both in code

**A.0.3 — Draw an ASCII grid of the frame layout (required)**

After looking at the screenshot, write out the frame structure as a grid. This becomes the reference for Step 3.1 coordinates.

```
Example:
         │ Default │ Hover │ Pressed │ Disabled │
─────────┼─────────┼───────┼─────────┼──────────┤
L/none   │   ██    │  ██   │   ██    │    ██    │  ← Primary block
L/right  │   ██    │  ██   │   ██    │    ██    │
L/left   │   ██    │  ██   │   ██    │    ██    │
─────────┼─────────┼───────┼─────────┼──────────┤
L/none   │   ░░    │  ░░   │   ░░    │    ░░    │  ← Secondary block
...
```

Label each direction clearly:
- **Row axis**: what changes going down (icon position, variant type, etc.)
- **Col axis**: what changes going right (state, size, etc.)
- **Block axis**: what creates the major sections (type, color, etc.)

**A.1 — Read the design details for each node**

```
get_design_context(node-id)            # overview of the parent frame + screenshot
get_design_context(child-node-id) × N  # sample every (size × color × state) cell
                                       # Primary and Secondary can use different tokens
                                       # even in the same state
  → layout: auto-layout vs absolute, padding, gap, alignment
  → transforms: rotation (exact degrees), scale, mirror
  → typography: family, weight, size, line-height, letter-spacing
  → effects: drop shadow, blur, blend mode, opacity
  → hierarchy: parent→child, z-order, masks

get_variable_defs(node-id) × N         # call per variant — token sets differ
  → extract design tokens
  → map each to global.css @theme inline variables
```

**A.2 — When the response is too large**

If `get_design_context` returns more than 50 KB, MCP gives you a file path instead.
Use `grep + sort + uniq -c` on that file to find which tokens appear most often — no need to read the whole thing.

**A.3 — Identify the layout type**

This decides how to structure the story container:
- **Auto-layout frame** → use `flex`/`gap` in the story wrapper
- **Absolute frame** → use `position: relative` container + `position: absolute` per child
- **Variant grid (Type B)** → always absolute (column widths and row heights vary per cell, flex won't work)
- **Form field** (TextField, TextArea, etc.) → flag for Step 4.3 audit

#### B. Token audit

```
Build a mapping table: Figma token → project token

✅ Found    → use the project token (p-200, rounded-150, etc.)
⚠️ Close    → use the nearest token, note the difference in the report
❌ No match → STOP: never use arbitrary values (p-[3px]). Report to user before continuing.
```

#### C. Backend sync (only for components that show API data)

Skip this for pure design system components like Button, TextField, and Icon.

```bash
cd ../study-platform-mvp && git pull origin dev

# If the component renders backend data:
#   → find the related DTO in src/types/api/ or src/api/openapi/
#   → note which fields are optional → mark those with ? in component props
```

---

### Step 2 — Write the component code

```typescript
// Rules:
// - Custom tokens only (p-200, gap-150, rounded-200)
// - Use cn() for every className
// - TypeScript props interface is required
// - Optional backend fields use ?
// - No hardcoded colors or hex values

export function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  return (
    <div className={cn('flex flex-col gap-150 p-200 rounded-200', ...)}>
      ...
    </div>
  );
}
```

After writing, all three of these must pass before moving on:

```bash
yarn lint:fix && yarn prettier:fix && yarn typecheck
```

---

### Step 3 — Write Storybook stories

Story files live **next to the component** (co-located):
```
src/components/.../ComponentName.stories.tsx
```

**Type A (single component):**
```typescript
export const Default: Story = { args: { ... } };
export const Disabled: Story = { args: { disabled: true } };
export const Error: Story = { args: { error: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};
```

**Type B (variant grid):** VisualMatrix (Step 3.1) + Interactive (Step 3.2) — both are required.

**Type C (composite):** One `Composite` story that places all components together with the same layout and spacing as the Figma frame — not in isolation.

#### Step 3.1 — VisualMatrix story (required for Type B)

This story reproduces the Figma variant grid pixel-for-pixel, for visual regression and design review.

**Rules:**

1. **Use absolute positioning, not flex/gap.** Each cell has its own width and height, so flex containers can't reproduce the layout without per-cell hacks.

2. **Normalize Figma coordinates to (0, 0).** Subtract the frame's top-left x/y from every child's position. Store this as a single reference table, derived from the ASCII grid (A.0.3).

3. **Generic coordinate table pattern** — name the axes based on your A.0.3 grid, then rename them to match your component:

```typescript
// Axis keys come from the A.0.3 grid — rename for each component
const COL_BASE_X: Record<SizeKey, number> = {
  // normalized x per size column (Figma x - frame.x)
};
const STATE_DX: Record<SizeKey, Record<StateKey, number>> = {
  // x offset per interaction state within each size column
};
const ROW_DY: Record<RowKey, number> = {
  // y offset per row type (icon arrangement, variant, etc.)
};
const BLOCK_BASE_Y: Record<BlockKey, number> = {
  // y starting point per major block (type, color, etc.)
};

const cells = BLOCK_KEYS.flatMap((block) =>
  ROW_KEYS.flatMap((row) =>
    COL_KEYS.flatMap((col) =>
      STATE_KEYS.map((state) => ({
        block, row, col, state,
        x: COL_BASE_X[col] + STATE_DX[col][state],
        y: BLOCK_BASE_Y[block] + ROW_DY[row],
      })),
    ),
  ),
);
```

4. **Match the story container size to the Figma frame:**

```typescript
parameters: {
  layout: 'fullscreen',
},
render: () => (
  // width/height from Figma frame metadata; overflow: auto when wider than viewport
  <div style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT, position: 'relative', overflow: 'auto' }}>
    {cells.map((cell) => (
      <div key={`${cell.block}-${cell.row}-${cell.col}-${cell.state}`}
           style={{ position: 'absolute', left: cell.x, top: cell.y }}>
        <Component {...deriveProps(cell)} className={STATE_OVERRIDE[cell.block][cell.state]} />
      </div>
    ))}
  </div>
),
```

5. **Simulate interaction states statically** — CSS `:hover` can only show one element's hover state at a time. Use `!important` overrides on cva-generated classes to show all states at once:

```typescript
// Static overrides so all states appear simultaneously.
// Real interaction behavior is verified in the Interactive story (Step 3.2).
const STATE_OVERRIDE: Record<BlockKey, Record<StateKey, string>> = {
  primary:   { default: '', hover: '!bg-fill-brand-default-hover', pressed: '!bg-fill-brand-default-pressed', disabled: '' },
  secondary: { default: '', hover: '!bg-...', pressed: '!bg-...', disabled: '' },
};
```

6. **Disable the grid axis controls** so reviewers don't see confusing dropdowns that don't do anything:

```typescript
argTypes: {
  size:     { table: { disable: true } },
  state:    { table: { disable: true } },
  disabled: { table: { disable: true } },
  // ... other grid axes
},
```

#### Step 3.2 — Interactive story (required alongside VisualMatrix)

The `!important` overrides in VisualMatrix bypass the real CSS interaction chain (`hover:`, `focus-within:`, `active:`). Interactive verifies the real chain works correctly — no overrides, just actual interactive instances.

```typescript
export const Interactive: Story = {
  render: () => (
    <div className="flex gap-200 p-200">
      <Component />           {/* default — hover/press manually in Storybook */}
      <Component disabled />  {/* disabled */}
    </div>
  ),
};
```

---

### Step 4 — Compare Figma to Storybook visually

**Before starting: make sure Storybook is running at `http://localhost:6006`. If not, start it with `yarn storybook`.**

#### Step 4.1 — Comparison protocol

```
A. Build the story URL
   Story ID: kebab-case(meta.title) + '--' + kebab-case(export-name)
   Example: title='Common/UI/TextField', export='VisualMatrix'
     → id = 'common-ui-textfield--visual-matrix'
   URL: http://localhost:6006/iframe.html?id=<story-id>&viewMode=story

B. If the URL doesn't work, find the story ID
   Go to: http://localhost:6006/index.json
   Run: Object.keys(json.entries).filter(k => k.includes('<keyword>'))

C. Take a Storybook screenshot
   navigate_page(url) → take_screenshot(fullPage: true)

D. Re-fetch the Figma reference (never reuse the Step 1 screenshot — it expires after ~7 days)
   get_screenshot(nodeId, fileKey, enableBase64Response: true)

E. Read both images in ONE response — never compare from memory.

F. Say the layout out loud before claiming a match:
   "Figma: <N> blocks, <R> rows × <C> cols per block"
   "Storybook: <same format>"
   If the descriptions don't match → it's not a match. Fix first.

G. Compare:
   - Visual: block/row/col structure, colors, spacing, typography, border-radius
   - Numeric: use getBoundingClientRect on key cells to check pixel values

H. Report:
   ✅ Match — list what matched
   ⚠️ Deviation — explain it (sub-pixel rounding, +1px border, etc.)
   ❌ Mismatch — BLOCKER: fix → re-capture both → re-compare
```

**Re-comparison loop:** After fixing any ❌, re-capture both screenshots in one response and re-run the report. Only move to Step 5 when there are zero ❌ items. Never report a fix as done without screenshot evidence.

**Never self-approve on the first pass.** DOM checks prove that cells exist — not that the layout matches Figma. Always do an explicit screenshot comparison.

#### Step 4.2 — Token cross-check (required)

Screenshots miss token-level drift. For example, `#d1d2d4` vs `#d5d7da` is only 3 RGB units apart — invisible in a screenshot but the wrong token binding.

| Variant | Figma value | Project token | Resolved hex | Match |
|---------|-------------|---------------|--------------|-------|
| L Primary Default bg | #f63d68 | `bg-fill-brand-default-default` | #f63d68 | ✓ |
| L Secondary Disabled text | #d5d7da | `text-text-disabled` | #d5d7da | ✓ |
| M/L gap | 6px | `gap-75` | spacing-75 → 6px | ✓ |

```bash
# Verify a project token resolves to the expected value
grep -E "^\s*--color-text-disabled|^\s*--spacing-75" src/app/global.css
```

Each ❌ row is a blocker — fix the token or get explicit user approval before Step 5.

What this catches that screenshots miss:
- Two states use the same project token but Figma uses two different ones
- Spacing values that are off by a few pixels (4 vs 6px)
- Hover/Pressed wired to the wrong color step (rose-600 vs rose-700)

#### Step 4.3 — Form field traps (required for input/textarea/select)

When A.3 flagged a form field, check each of these explicitly:

**1. Don't confuse container height with input box height.**

A Figma symbol height (e.g. TextArea L = 125px) almost always includes the helper-text row and gap. The actual input box is shorter:

```
input_box_height = symbol_height − helper_height − container_gap
```

For single-line inputs, the heights are reliable (48/40px in DS 2.0) — verify they're in the spacing scale before using arbitrary `[Npx]`. For textareas, skip `min-h` entirely and use the `rows` attribute instead.

**2. Trailing icon padding is asymmetric.**

When there's an icon on the right, Figma usually reduces right padding by ~4px (12→8). Compare at least one cell without an icon and one with. If `pl` ≠ `pr`, encode it as a cva variant:

```typescript
hasTrailingIcon: { true: 'pr-100', false: 'pr-150' }
```

**3. Helper text token inconsistency.**

Sample the helper text color in all states (default, focused, disabled, error, success). If 4 out of 5 use Subtlest but 1 uses Default, treat it as a Figma bug — implement Subtlest and note the outlier in the report.

**4. Static grid overrides aren't real interactions.**

The `!bg-...` overrides in VisualMatrix bypass the real `hover:`/`focus-within:`/`active:` chain. The Interactive story (Step 3.2) is required to verify that real interactions work.

**5. Don't copy Figma typos into code.**

Variable definitions sometimes contain typos (`Disableed`, `Hoverr`). Map them to correctly spelled project tokens — always.

---

### Step 5 — Commit to the feature branch

```bash
git add src/components/... src/stories/...
# commit message: "feat : <ComponentName> 컴포넌트 구현"
```

Include in the commit:
- Component file
- Storybook story file (VisualMatrix + Interactive for Type B)
- Any token mapping deviations noted in the commit body

---

## Output

```
✓ Token audit — 12 tokens mapped, 0 blocked
✓ Component — src/components/common/ui/Button/Button.tsx
✓ Story — src/components/common/ui/Button/Button.stories.tsx
✓ Visual comparison — 8 ✅ match, 1 ⚠️ deviation (rounded 8.03° → 8°)
✓ Committed: feat : Button 컴포넌트 구현
```

## Stop and report to user when

- Token audit finds a Figma token with no matching project token
- Typecheck fails after writing the component
- Visual comparison has a ❌ mismatch that can't be fixed with available tokens
- Component renders API data but no backend DTO exists

## Things to keep in mind

- Rotation and scale values must match numerically. `-9.38°` and `-9°` are different — use the exact Figma value.
- `get_screenshot` is for reference only. Never implement from a screenshot alone.
- Component and story are always committed together — never separately.
- This command does not create a PR. Run `/pr` after feature development is complete.
