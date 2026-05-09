# Figma Fetch Rules (Steps 1 + 1b + 2)

Referenced by `dev-start` SKILL.md. Apply these rules during Steps 1 and 2.

---

## Step 1. Figma Fetch

Run **in parallel**:

- `mcp__claude_ai_Figma__get_design_context(nodeId, fileKey)` — layout, transforms, typography, effects, hierarchy
- `mcp__claude_ai_Figma__get_variable_defs(nodeId, fileKey)` — design tokens
- `mcp__claude_ai_Figma__get_screenshot(nodeId, fileKey)` — reference image (save URL for Step 9)
- `mcp__claude_ai_Figma__get_metadata(nodeId, fileKey)` — full child tree for Step 2 drill

Follow `.claude/rules/figma-design.md` exhaustively. After receiving results:

- If `get_design_context` output appears truncated (ends mid-property or contains `...`) → flag for re-call in Step 2.

---

## Step 1b. Figma Asset URL Lifecycle

**CRITICAL:** Figma MCP asset URLs (`https://www.figma.com/api/mcp/asset/<uuid>`) are **session-scoped**. Each call to `get_design_context` returns a unique set of signed URLs — the same logical asset gets a different UUID every session. URLs from a previous session or plan document **will not load** in a new session.

**Rule:** Immediately after Step 1 (or any `get_design_context` call), download all image assets to `/public/{route-slug}/`:

```bash
mkdir -p public/{route-slug}/
curl -s -o public/{route-slug}/{asset-name}.svg "<figma-mcp-asset-url>"
# verify: file command should show SVG or PNG, not HTML error
file public/{route-slug}/*.svg
```

Use local paths (`/class/sphere.svg`) in all generated code. **Never hardcode Figma MCP URLs in source files.**

When implementing from a cross-session plan that contains hardcoded Figma asset URLs:
1. Re-call `get_design_context` immediately — do not reuse plan URLs
2. Download fresh assets to `/public/` before writing any code
3. Replace all Figma URLs in the plan with local `/public/` paths

### Asset Substitution Prohibition

**NEVER substitute a Figma image asset with any of the following:**

| Prohibited substitution | Example (DO NOT do this) |
|------------------------|--------------------------|
| HTML text characters | `<`, `/`, `>` for a code-bracket icon |
| Hand-crafted inline SVG shapes | `<rect>` + `<path>` approximating a chat bubble illustration |
| CSS-only reconstructions | `border-radius: 50%` for an orbit ellipse image |
| Custom SVG path drawings | `M16 2 L17.5 14...` for a sparkle that exists as an asset |

**Why:** Substitutions differ in visual weight, gradient detail, shape fidelity, and exact geometry. Even "simple" icons must be downloaded — the designer's intent is in the rendered file.

**Do not reuse existing `/public/` assets from a different Figma context.** The same SVG path can have completely different fill colors per context (e.g., white-filled bracket on dark background vs pink-gradient bracket on light background). Always download fresh for each context.

**Rule:** Every `<img src={imgX}>` in the Figma output = one downloaded file in `/public/{route-slug}/`. Audit before writing code:

```bash
# Count must match between Figma output const imgX lines and downloaded files
ls -1 public/{route-slug}/ | wc -l
```

If a URL fails to download (returns HTML error), it has expired — re-call `get_design_context` immediately. Do not fall back to substitution.

---

## Step 2. Sub-section Drill + Variant Sampling

**Do not skip.** Page-level frames are too large for a single `get_design_context` call — sections must be drilled individually.

### 2a. Enumerate Level-1 sections

From `get_metadata` result, extract all direct children of the page frame:

| Node type | Action |
|-----------|--------|
| Data-bearing (list, grid, card group, form) | `get_design_context` individually |
| Complex layout (3+ nested levels) | `get_design_context` individually |
| Variant component instance | enumerate all variant cells → `get_design_context` each cell |
| Static / decorative (hero text, divider) | re-use parent call result |

Run all individual `get_design_context` calls in parallel.

### 2b. Variant matrix sampling

For any Component with Variants:

1. Identify all variant dimensions (e.g., `state × size × type`)
2. Call `get_design_context` on **every cell** of the matrix — not just the default
3. Record exact per-cell diffs (color changes, size changes, show/hide layers)

Missing a variant cell = that state will not be implemented.

### 2c. Transform capture

For every node (including children):

- Record **exact rotation** in degrees (e.g., `-9.38°`, `+18.03°`) — never round
- Record negative scale (mirror transform)
- Group nodes sharing the same transform — they form a designer-intentional system

### 2d. Truncation recovery

If any `get_design_context` sub-call still appears truncated → call `get_metadata` on that sub-node, drill one level deeper.

### 2e. Visual content sizing within bounded containers

**Never derive rendered size from a page-level screenshot.** At 1920px artboard scale, the page thumbnail compresses all elements.

For any bounded container (card, tile, badge, panel) whose primary visual content is an illustration, icon group, SVG shape, or image:

1. Call `get_design_context` on the **container node directly**
2. Extract the content child's exact `width` and `height` in px
3. Compute fill ratio: `content_width / container_width`

| Fill ratio | Interpretation | Action |
|-----------|----------------|--------|
| > 0.5 | Primary visual element | Use exact pixel dimensions |
| 0.25–0.5 | Secondary decorative | Use exact dimensions, verify against screenshot |
| < 0.25 | Accent/badge | May approximate |

### 2f. Recursive Component Instance Walk

After Level-1 sections are drilled, traverse each section's own metadata for nested instances.

For each Level-1 section that returned `INSTANCE` children:

```bash
# Get children of each Level-1 section node
get_metadata(sectionNodeId, fileKey)
```

For any nested `type === "INSTANCE"` node found:

| Node depth | Action |
|-----------|--------|
| Depth 2 (inside a section) | `get_design_context` if not already covered by section drill |
| Depth 3+ | Sample one representative instance — note if it repeats a pattern |

**Completeness audit.** After all drills, print:

```
Components found: N (Level-1 sections: A, Nested instances: B, Variant cells: C)
```

This number becomes the baseline for Step 4 (Component Reuse Check).
