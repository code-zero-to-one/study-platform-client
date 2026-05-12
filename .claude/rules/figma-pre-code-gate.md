# Figma Pre-Code Gate

Run all checks below **before opening any editor**. These gates catch the most expensive class of errors: wrong token, missing node, stale plan data, expired asset URL.

## Spec Re-Verification

Figma MCP responses and plan files are point-in-time snapshots. They may be partial (token-truncated) or outdated by the time of implementation.

### When implementing from a plan or prior analysis

1. **Re-fetch current Figma data** — do not rely on property values recorded in a plan. Call `get_design_context` / `get_variable_defs` again at implementation time.
2. **Verify all states for any bidirectional logic** — for toggles, accordions, rotations, mirrors: read BOTH states (open/closed, expanded/collapsed, before/after) from Figma simultaneously before writing the condition. Reading only one state produces an inverted implementation 50% of the time.
3. **Plan says "change X to Y" + current code has X** — treat as a conflict signal. Re-verify against current Figma before applying. The plan may have been written from partial data.
4. **Token values in plans** — re-check against current `global.css`. Tokens may have been added or renamed since the plan was written.

Plans describe **intent at write time**. Implementation requires **current facts**. When the two diverge, read the source of truth (Figma, `global.css`) and update the plan — do not blindly follow the plan.

---

## Gate A: Token Mapping Table

For every Figma raw value (px, color hex), cross-verify against `global.css` before coding:

```bash
# Check spacing tokens (formula: px × 12.5 = token number)
grep -E '--spacing-[0-9]+:' src/app/global.css | sort -t: -k2 -n

# Check color tokens
grep -E '--color-' src/app/global.css
```

Produce this table before coding:

| Figma raw | global.css actual | Project token | Notes |
|-----------|------------------|---------------|-------|

Color not in `@theme inline`? Decide before coding — do not guess a nearest token:
- Draft design → arbitrary value + `/* TODO: add token */` comment
- Final design → report to user and wait for decision

**Why:** Spacing scale is non-linear (`--spacing-N` ≠ `N/4px`). Guessing from Figma px produces wrong tokens (e.g., `gap: 20px` → `gap-300` (24px) instead of `gap-250` (20px)).

## Gate B: Interactive Element Wrapper Padding

For every Tab / Button / Chip / Nav Item in the design: explicitly read the **wrapper container's padding** from Figma, not just the text/icon inner content. Interactive elements almost always have wrapper padding. Missing it breaks the hit area and visual rhythm.

## Gate C: Stacking Context Pre-Check

If the design contains Tooltip / Dropdown / Modal / Popover:
1. Identify the parent layout's `overflow` value
2. Check if any ancestor has `transform`, `filter`, or `will-change` (each creates a new stacking context)
3. If yes → plan for Portal rendering before coding

## Gate D: Figma Asset URL Lifetime

Figma MCP asset URLs (`https://www.figma.com/api/mcp/asset/<uuid>`) are **session-scoped**. The same asset returns a different UUID on every `get_design_context` call. Plan files from previous sessions contain expired URLs.

**Never reuse an asset URL from a plan file.** Re-call `get_design_context` in the current session and download fresh:

```bash
curl -s -o public/{route-slug}/{name}.png "<current-session-mcp-url>"
file public/{route-slug}/{name}.png   # must say PNG/SVG, not HTML
```

## Gate E: Node Coverage & Container Width Audit

Before writing any code, produce a two-column table from `get_metadata`:

| Figma node (id · name) | Present in current code? |
|---|---|
| 42:2451 · pagination item (left) | ✅ / ❌ |
| 42:2463 · 인디케이터 | ✅ / ❌ |

Any ❌ row = must implement. Do not skip nodes because they "seem minor" (dots, dividers, labels).

**Container width mismatch check:**
If a child node's width < parent frame width AND x > 0, the child is **constrained and offset** — the parent container in code must NOT use a full-width child. Check:
- Child width / frame width = what percentage?
- Child x (relative) = left margin?
- Is the current code using `w-full` where the Figma uses a constrained width?

Example: image card 682/860px wide at x=89 → code needs `mx-[10.35%]` or equivalent, not `w-full`.

---

Related rules:
- `figma-design.md` — what properties to read from Figma (run first)
- `figma-verification.md` — visual diff and JS measurement (run after coding)
