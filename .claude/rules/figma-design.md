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

**Step 1 — Always run in parallel (no exceptions):**
- `get_design_context(rootNode)` — layout, transforms, typography, effects, hierarchy
- `get_metadata(rootNode)` — full child tree (required for Step 2 drill)
- `get_screenshot(rootNode)` — reference image (save URL for visual verification step)
- `get_variable_defs(rootNode)` — design tokens

**Critical — silent truncation:** `get_design_context` response is capped at ~50KB. The response looks complete even when sub-nodes are cut. There is no error or warning. **Never wait for visible signs of truncation** — always call `get_metadata` and drill sub-nodes regardless.

**Step 2 — Sub-section drill (mandatory for any page-level frame):**
From `get_metadata` results, call `get_design_context` on each direct child section individually, run in parallel. For variant components, sample **every variant cell** (size × state × type) — default-only sampling causes missed token divergence.

**Step 3 — Screenshot** — never rely on screenshot alone. It hides rotations under perspective and merges layered effects.

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

## Spec Re-Verification

Figma MCP responses and plan files are point-in-time snapshots. They may be partial (token-truncated) or outdated by the time of implementation.

### When implementing from a plan or prior analysis

1. **Re-fetch current Figma data** — do not rely on property values recorded in a plan. Call `get_design_context` / `get_variable_defs` again at implementation time.
2. **Verify all states for any bidirectional logic** — for toggles, accordions, rotations, mirrors: read BOTH states (open/closed, expanded/collapsed, before/after) from Figma simultaneously before writing the condition. Reading only one state produces an inverted implementation 50% of the time.
3. **Plan says "change X to Y" + current code has X** — treat as a conflict signal. Re-verify against current Figma before applying. The plan may have been written from partial data.
4. **Token values in plans** — re-check against current `global.css`. Tokens may have been added or renamed since the plan was written.

### Principle

Plans describe **intent at write time**. Implementation requires **current facts**. When the two diverge, read the source of truth (Figma, `global.css`) and update the plan — do not blindly follow the plan.

## Pre-Code Gate (mandatory before writing any code)

Complete all four checks before opening an editor.

### A. Token Mapping Table

For every Figma raw value (px, color hex), cross-verify against `global.css` before coding:

```bash
# Check spacing tokens (formula: px × 12.5 = token number)
grep -E '--spacing-[0-9]+:' src/app/global.css | sort -t: -k2 -n

# Check color tokens
grep -E '--color-' src/app/global.css
```

Produce a table before coding:

| Figma raw | global.css actual | Project token | Notes |
|-----------|------------------|---------------|-------|

Color not in `@theme inline`? Decide before coding — do not guess a nearest token:
- Draft design → arbitrary value + `/* TODO: add token */` comment
- Final design → report to user and wait for decision

**Why:** Spacing scale is non-linear (`--spacing-N` ≠ `N/4px`). Guessing from Figma px produces wrong tokens (e.g., `gap: 20px` → `gap-300` (24px) instead of `gap-250` (20px)).

### B. Interactive Element Wrapper Padding

For every Tab / Button / Chip / Nav Item in the design: explicitly read the **wrapper container's padding** from Figma, not just the text/icon inner content. Interactive elements almost always have wrapper padding. Missing it breaks the hit area and visual rhythm.

### C. Stacking Context Pre-Check

If the design contains Tooltip / Dropdown / Modal / Popover:
1. Identify the parent layout's `overflow` value
2. Check if any ancestor has `transform`, `filter`, or `will-change` (each creates a new stacking context)
3. If yes → plan for Portal rendering before coding

### D. Figma Asset URL Lifetime

Figma MCP asset URLs (`https://www.figma.com/api/mcp/asset/<uuid>`) are **session-scoped**. The same asset returns a different UUID on every `get_design_context` call. Plan files from previous sessions contain expired URLs.

**Never reuse an asset URL from a plan file.** Re-call `get_design_context` in the current session and download fresh:

```bash
curl -s -o public/{route-slug}/{name}.png "<current-session-mcp-url>"
file public/{route-slug}/{name}.png   # must say PNG/SVG, not HTML
```

---

## Visual Verification (Mandatory Completion Gate)

**Figma → HTML translation is never complete without a visual diff.** Code can be structurally correct and typecheck-passing while rendering wrong — wrong position, missing shadow bleed, wrong stacking order.

### Required before marking any Figma implementation done

1. Run `yarn dev` (dev server must be running)
2. Open the target route in browser at 1280px viewport
3. Place Figma screenshot side-by-side with the browser output
4. Diff visually: position, shadow, spacing, color, transform
5. Only mark complete when visual output matches the Figma screenshot

### What automated checks cannot catch

| Failure | Why lint/typecheck misses it |
|---|---|
| Cat on wrong side (left vs right) | `absolute right-0` is valid CSS — position conflict silent |
| Shadow flat strip instead of soft ellipse | `<img style={{height:9}}>` is valid HTML |
| Wrong rotation angle | CSS transform is a string — compiler has no Figma ground truth |
| Missing bleed effect | Nested div structure is optional — no type error |

**If `yarn dev` is not running and browser verification is not possible, explicitly state this rather than claiming completion.**

---

## Triggering Conditions

Apply this rule whenever:

- User shares a Figma URL (`figma.com/design/...`, `figma.com/board/...`, `figma.com/make/...`)
- User asks to "implement this design", "convert to component", "check the Figma", "구현 계획", "디자인 확인"
- Any Figma MCP tool is invoked

The rule applies even for "simple" designs — properties hidden in nested groups break trivial-looking layouts.
