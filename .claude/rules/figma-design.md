# Figma Design Inspection Rules

When inspecting any Figma component, frame, or node (URL like `figma.com/design/<fileKey>/...?node-id=<id>`), exhaustively read **all Properties** before producing any plan, code, or analysis.

## Required Inspection Pass

For every Figma node passed in, collect all of the following — never partial, never skipped:

### 1. Layout & Geometry

- Width, height (px), and aspect ratio
- Position (`left`, `top` from parent or absolute)
- Auto-layout vs absolute children (Frame vs Group)
- Padding (top/right/bottom/left), gap (item spacing), alignment (`items-*`, `justify-*`)
- Constraints (left/right/center, top/bottom/scale) — affects responsive intent

### 2. Transform Properties (CRITICAL)

- **Rotation** — every node, including children. Record exact degree (e.g., `−9.38°`, `+18.03°`).
- **Scale** — `scale-x`, `scale-y`. Negative scale = mirror.
- **Skew** if any
- Combined transforms (`-scale-y-100 + rotate(165deg)` = mirror + rotate). Group as transform pipeline, not individual values.

Why: rotations and mirrors are the most common silently-omitted properties. Missing one breaks the visual.

### 3. Appearance

- Fills (solid, linear gradient, radial gradient, image)
  - Gradient: stops with offset + color + opacity, gradient transform matrix, gradient type
- Strokes (color, weight, alignment inside/center/outside, dash pattern)
- Corner radius (per-corner if mixed)
- Effects: drop shadow, inner shadow, layer blur, background blur (with x/y/blur/spread/color/opacity)
- Blend mode (normal, multiply, screen, etc.)
- Opacity (node-level, separate from fill alpha)

### 4. Typography

- Font family, weight, style (italic)
- Font size, line height (px or %), letter spacing (px or em)
- Text align (horizontal + vertical)
- Text decoration, text case
- Color (separate from fill list when applicable)
- Truncation, max lines

### 5. Hierarchy & Composition

- Parent → child relationships
- Z-order (Figma layer order)
- Absolute vs relative positioning intent
- Boolean operations (union, subtract, intersect, exclude)
- Mask layers
- Component instances vs detached copies (instances signal reusable design tokens)

**Sibling spatial relationship (critical for layout):**
`get_metadata` reports **absolute page coordinates**, not relative to the parent frame. To get true in-frame position:
```
child_x_relative = child_x_absolute - frame_x_absolute
child_y_relative = child_y_absolute - frame_y_absolute
```
After converting, check: are siblings **inside** each other's bounds, or **outside**? A button at frame-relative x=0 and a card at frame-relative x=89 means the button is *outside* the card — completely different layout from a button at x=0 inside a full-width card. This check must be explicit, not assumed from the screenshot.

### 6. Variables & Tokens

- Bound design tokens (color variables, spacing variables, radius variables)
- Mode (light/dark) variations
- Component properties (variant props, boolean props, instance swap)

### 7. Interaction Hints

- Prototype connections (hover, click, drag)
- Component states (default, hover, pressed, disabled)
- Smart animate / motion
- Annotations / dev mode notes from designer

## Tool Usage Pattern

**Step 1 — Start with `get_design_context(node)`**

Single call first. `get_design_context` returns layout, transforms, typography, effects, and hierarchy for most nodes within the ~50KB response cap.

**Step 2 — Check for silent truncation; if truncated, drill with `get_metadata`**

`get_design_context` is capped at ~50KB. The response looks complete even when sub-nodes are cut — no error, no warning. Truncation signals:
- Child node count in response is suspiciously low vs. the visual complexity
- Deep nesting appears shallow in the returned tree
- Expected variant states or sections are missing

**If truncated:** call `get_metadata(node)` to get the full child map, then re-fetch only the required sub-nodes with `get_design_context` (in parallel). For variant components, sample **every variant cell** (size × state × type) — default-only sampling causes missed token divergence.

**Step 3 — `get_screenshot(node)` for visual reference**

Get the screenshot after design context is confirmed. Never rely on the screenshot alone — it hides rotations under perspective and merges layered effects.

**Step 4 — `get_variable_defs(node)` when tokens are referenced**

Only needed when the design context response references bound design tokens (color variables, spacing variables, radius variables).

**Step 5 — Download assets immediately**

Figma MCP asset URLs are session-scoped and expire. After `get_screenshot` or any asset URL appears in `get_design_context`, download immediately:
```bash
curl -s -o public/{route-slug}/{name}.png "<mcp-asset-url>"
file public/{route-slug}/{name}.png   # must say PNG/SVG, not HTML
```

**Step 6 — Validate implementation against Figma (mandatory before marking complete)**

Follow `figma-verification.md`. Attempt browser tools in order: Playwright MCP → Chrome DevTools MCP → browser-harness. If all blocked, run code-level audit and hand off to user. **Never mark complete without running at least one path.**

## Code Connect

Before generating raw code from a Figma component:

1. Call `get_code_connect_suggestions(node)` — maps Figma components to existing project components
2. If a match is found (e.g., Figma Button → `src/components/common/ui/Button`), use the existing component. Do not generate duplicate code.
3. Only generate raw code when `get_code_connect_suggestions` returns no match for the target node.

## Reporting Format

When summarizing a Figma inspection, produce:

- **Inventory table** — every node with id, name, position, size, rotation, key fills/strokes
- **Transform group** — nodes sharing the same rotation/mirror, grouped to expose designer intent (e.g., "Code card system: all children at −15°")
- **Anomalies** — sub-degree differences (e.g., card +18.03° vs child +19.63°) flagged as intentional, not noise

## What NOT to Do

- Do not skim the design context output and write code from the screenshot alone.
- Do not collapse `-scale-y-100 rotate(165deg)` into `rotate(-15deg)` without verifying the SVG path is symmetric.
- Do not "round" rotations (`+18.03°` → `+18°`). Sub-degree precision is designer intent.
- Do not omit decorative nodes (sparkles, dots, orbit rings, indicator dots) — they are part of the composition.
- Do not assume default values. Always read the explicit value from the Figma response.
- **Do not treat `get_metadata` coordinates as relative to the parent frame.** They are absolute page coordinates. Always subtract the parent frame's (x, y) before reasoning about layout.
- **Do not assume siblings are nested inside each other.** A button at frame-relative x=0 next to a card at x=89 means the button is *outside* the card. Check sibling bounds explicitly.
- **Do not use `w-full` for a child when Figma shows it constrained.** If the child's width < frame width, the code container must reflect that — use percentage margins, max-width, or explicit sizing.

## Triggering Conditions

Apply this rule whenever:

- User shares a Figma URL (`figma.com/design/...`, `figma.com/board/...`, `figma.com/make/...`)
- User asks to "implement this design", "convert to component", "check the Figma", "구현 계획", "디자인 확인"
- Any Figma MCP tool is invoked

The rule applies even for "simple" designs — properties hidden in nested groups break trivial-looking layouts.

---

Related rules:
- `figma-pre-code-gate.md` — token mapping, node coverage, asset URLs (run before coding)
- `figma-verification.md` — visual diff, JS precision measurement, adjacent re-measurement (run after coding)
- `figma-overlap-to-css.md` — overlap layout translation, CSS positioning pitfalls
