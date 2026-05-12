# Figma Overlap → CSS Layout Translation

When a Figma child element overlaps its parent frame boundary, the CSS translation requires distinguishing three distinct measurements. Conflating them is the single most common source of missing gaps and invisible elements.

## The Three Measurements

Given: child element positioned at `top=T` within a parent frame of height `H`, child total height `C`.

| Measurement | Formula | Use for |
|---|---|---|
| **Overlap** (hidden inside parent) | `H − T` | How much of child is covered by parent background |
| **Visible height** (extends outside parent) | `C − (H − T)` | Actual rendered height below parent |
| **Gap to next element** | `next.y − (parent.y + H + visible_height)` | CSS margin/padding/viewBox space needed |

### Example (this project's Start tooltip)

```
parent frame H=36px, child top=28px, child height=21px
→ overlap      = 36 − 28 = 8px   (hidden inside button background)
→ visible      = 21 − 8  = 13px  (below button bottom)
→ gap to stamp = 164 − (104 + 36 + 13) = 11px
```

**Never** read gap as `next.y − parent.frame.bottom`. That ignores the visible extension entirely.

---

## Rule 1: `position: absolute` Breaks Flex Height

An `absolute` child is removed from normal flow. The flex/grid parent computes its height from **in-flow children only**. Consequences:

- Parent height shrinks (absolute child not counted)
- `bottom-full` or `top-full` on siblings resolves to the shrunken height
- The absolute child overlaps DOM siblings painted later → invisible

**Fix pattern**: If the element needs to contribute to parent height (e.g., to push `bottom-full` calculation down), make it **in-flow**. Remove `absolute`. Use `flex-col` to stack naturally.

```
❌ flex-col container (height = button only)
     [button 36px]   ← in-flow
     [SVG absolute]  ← out-of-flow, painted under stamp

✅ flex-col container (height = button + SVG)
     [button 36px]   ← in-flow
     [SVG 13px]      ← in-flow, container bottom = stamp top
```

---

## Rule 2: Encode Gaps Without Tokens When No Matching Token Exists

When a gap from Figma has no exact project token (e.g., 11px → no `gap-137` between `gap-125`=10px and `gap-150`=12px), prefer encoding the gap **inside the element itself** over using arbitrary CSS values.

### SVG viewBox padding

Extend the SVG `height` and `viewBox` height by the gap amount. The transparent space below the drawn content acts as CSS padding — without adding a new token or an arbitrary value:

```tsx
// 13px triangle + 11px gap = 24px total
<svg width="21" height="24" viewBox="0 0 21 24">
  <polygon points="0,0 21,0 10.5,13" />  {/* tip at y=13; gap below is transparent */}
</svg>
```

This works because the SVG container bottom aligns with the anchor point (`bottom-full`), and the transparent bottom section creates the visual gap automatically.

**When this applies**: The element is a decorative shape (triangle, arrow, ornament) whose only neighbor is a container edge.

**When this does NOT apply**: The gap is between two interactive or text elements where screen readers or hit-test areas matter. Use a real layout token in that case, even if it requires adding one to `global.css`.

---

## Pre-Code Checklist for Figma Overlap Layouts

Before writing any CSS for a Figma layout where a child overlaps a parent boundary:

- [ ] **Read child `top` from Figma** (position within parent frame, not absolute page y)
- [ ] **Compute overlap** = `parent_height − child_top`
- [ ] **Compute visible height** = `child_height − overlap`
- [ ] **Compute gap** = `next_element.y − (parent.y + parent_height + visible_height)`
- [ ] **Decide positioning model**: does this child need to contribute to parent height? → in-flow. Is it purely decorative overlay? → absolute with explicit stacking context check.
- [ ] **Check token availability** for the gap value. If missing: add token OR encode in viewBox (decorative shapes only).
