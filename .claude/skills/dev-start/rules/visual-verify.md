# Visual Verification Rules (Steps 8b + 8c)

Referenced by `dev-start` SKILL.md. Apply these rules after page generation (Step 8).

---

## Step 8b. Iterative Chrome ↔ Figma Visual Verification

**Required for ALL pages.** Run for every implemented section — decorative layers, spacing, typography, layout, interactive states. Also required when implementing a plan written in a previous session.

### Setup

1. If implementing from a cross-session plan or new session: re-call `mcp__claude_ai_Figma__get_screenshot` to get a fresh reference image
2. `mcp__chrome-devtools__navigate_page` → route URL
3. If page has hover/interactive states to verify: use `mcp__chrome-devtools__hover` or `mcp__chrome-devtools__click` to activate them before screenshotting

### Comparison Checklist (run every iteration)

| Check | Pass condition | What to count/measure |
|-------|---------------|----------------------|
| Spacing between elements | Chrome gaps match Figma gaps — use exact token values (e.g. `gap-250` not `gap-300`) | Measure visually; mismatches are usually 4–8px off |
| Padding on interactive items | Items have correct padding area matching Figma `p-[Xpx]` | Click/hover area should match text + padding extent |
| Typography | Font size, weight, color match Figma per element | Compare text nodes explicitly |
| Distinct visual shape count | Chrome count == Figma count per layer type | Count rings, cards, sparkles separately |
| Content fill within containers | Content occupies similar % of container as in Figma | Measure content vs container visually |
| Element overflow | No element bleeds outside its intended container | Check cards, panels |
| Shape overlap | Absolute-positioned shapes do not compound unexpectedly | Each shape reads as distinct |
| Tooltip / overlay position | Tooltip appears in correct position, not clipped by parent stacking context | Verify tooltip visible over page content |
| Asset integrity | Every Figma `<img src={imgX}>` has a local counterpart — no substitution with inline SVG, text chars, or CSS | Audit code vs Figma `const imgX` list |
| Interactive state accuracy | Hover/focus/active states match Figma variant | Trigger each state and screenshot |

### Iteration Loop (mandatory)

```
LOOP:
  1. mcp__chrome-devtools__take_screenshot  →  Chrome state
  2. Compare Chrome screenshot against Figma reference for ALL checks above
  3. List every ❌ failing check
  4. If zero ❌ → EXIT LOOP → proceed to Step 8c
  5. For each ❌:
       a. Identify root cause (see table below)
       b. Apply fix to code
       c. mcp__chrome-devtools__navigate_page (reload)
  6. GOTO 1
```

**Exit condition:** Every check in the table passes simultaneously.
**Never exit Step 8b with any ❌ remaining.** Do not hand a visual mismatch to the user.
**Maximum iterations: 2.** If still failing after 2 → halt, list remaining ❌ in Step 9 summary for user to review.

### Root Cause Reference

| Symptom | Root cause | Fix |
|---------|-----------|-----|
| Spacing between items too wide or narrow | Gap token mismatch (e.g., `gap-300` used instead of `gap-250`) | Read Figma `gap-[Xpx]` → map to exact token |
| Item hit-area or visual padding wrong | Missing `p-[token]` on tab/item wrapper | Add matching padding token per Figma |
| Tooltip or floating element clipped behind page content | Parent element has `mix-blend-multiply` / `filter` / `transform` → creates stacking context; sibling `<main>` paints on top | Add `relative z-{n}` to the parent element so its stacking context is ordered above `<main>` |
| More visual instances of a shape type than Figma shows | Duplicate element compounding with existing one | Remove duplicate or change visual form |
| Content element too small inside container | Size estimated from page-level call, not container sub-node drill (Step 2e) | Re-drill container node, apply exact px |
| Content element bleeds outside container | Missing `overflow-hidden` or dimensions exceed container | Add `overflow-hidden` or reduce dimensions |
| Icon/illustration wrong color, weight, or shape | Asset substituted with hand-crafted SVG/text/CSS instead of downloaded Figma asset | Download actual asset via `curl`, replace approximation |
| Text content mismatch (typo, capitalization) | Figma text was misread or a different node variant was sampled | Re-read Figma node text field exactly — copy verbatim |

