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

Use `mcp__claude_ai_Figma__get_design_context` first — returns code, screenshot, and metadata. Then:

1. **If output truncated or properties hidden** — call `mcp__claude_ai_Figma__get_metadata` on the same node for tree overview, then drill into sub-nodes individually.
2. **Sub-node drill** — for any group with non-trivial transforms or multiple children, call `get_design_context` on the sub-node id to expose its internal properties.
3. **Screenshot** — never rely on screenshot alone. It hides rotations under perspective and merges layered effects.

## Reporting Format

When summarizing a Figma inspection, produce:

- **Inventory table** — every node with id, name, position, size, rotation, key fills/strokes
- **Transform group** — nodes sharing the same rotation/mirror, grouped to expose designer intent (e.g., "Code card system: all children at −15°")
- **Anomalies** — sub-degree differences (e.g., card +18.03° vs child +19.63°) flagged as intentional, not noise

## What NOT to Do

- Do not skim the design context output and write code from the screenshot alone.
- Do not collapse `-scale-y-100 rotate(165deg)` into `rotate(-15deg)` without verifying the SVG path is symmetric.
- Do not "round" rotations (`+18.03°` → `+18°`). Sub-degree precision is designer intent.
- Do not omit decorative nodes (sparkles, dots, orbit rings) — they are part of the composition.
- Do not assume default values. Always read the explicit value from the Figma response.

## Triggering Conditions

Apply this rule whenever:

- User shares a Figma URL (`figma.com/design/...`, `figma.com/board/...`, `figma.com/make/...`)
- User asks to "implement this design", "convert to component", "check the Figma", "구현 계획", "디자인 확인"
- Any Figma MCP tool is invoked

The rule applies even for "simple" designs — properties hidden in nested groups break trivial-looking layouts.
