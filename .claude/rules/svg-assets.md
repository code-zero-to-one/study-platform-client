# SVG Asset Rules

SVG rendering behavior is determined by `preserveAspectRatio` and viewBox dimensions. These properties are invisible in code review and silent on mismatch — a correctly written `<img>` or `<Image>` tag produces distorted output with no error.

## Before Using Any SVG File

For every SVG added to `public/` or referenced via `<Image src="*.svg">` or `<img>`:

1. **Check viewBox dimensions** — if `width ≠ height`, the SVG has a non-square aspect ratio.
2. **Check `preserveAspectRatio`** — if set to `"none"`, x and y axes scale independently to fill the container. Combined with a non-square viewBox and a square container, this produces guaranteed distortion (x-axis and y-axis scale at different multipliers).
3. **Check container size** — if the container is a fixed square and the viewBox is not, either set explicit `width`/`height` props matching the viewBox ratio, or replace the SVG with a better source.

## Prefer the Project Icon Library

Before adding a custom SVG glyph, check `lucide-react` first. It is the project's standard icon library: square viewBox, `preserveAspectRatio="xMidYMid meet"` by default, consistent stroke weight, tree-shakeable.

Common Figma-to-lucide mappings:

| Figma icon name | lucide-react component |
|----------------|------------------------|
| `keyboard_arrow_up` / `expand_less` | `ChevronUp` |
| `keyboard_arrow_down` / `expand_more` | `ChevronDown` |
| `keyboard_arrow_left` | `ChevronLeft` |
| `keyboard_arrow_right` | `ChevronRight` |
| `close` / `cancel` | `X` |
| `lock_open` | `LockOpen` |
| `lock` | `Lock` |
| Other Material icons | Search [lucide.dev](https://lucide.dev) |

If a lucide equivalent exists, do not add a custom SVG file.

## When Custom SVG Is Necessary

For complex shapes that must match exact Figma geometry (organic paths, decorative elements with custom curves):

- Use **inline `<svg>`** — not `<Image src="*.svg">` or `<img>`
- Set `viewBox` to the exact Figma dimensions
- Omit `width`/`height` attributes on the `<svg>` element; control size via `className`
- Do not set `preserveAspectRatio="none"` — omit the attribute or use the default (`xMidYMid meet`)
- Apply mirroring via CSS transform on the wrapping element (`style={{ transform: 'scaleX(-1)' }}`), not by modifying path coordinates

## What NOT to Do

- Do not use `<Image src="*.svg">` for icons without checking `preserveAspectRatio` and viewBox ratio first.
- Do not set `preserveAspectRatio="none"` on any SVG — use aspect-ratio-preserving scaling or fix the container.
- Do not duplicate a lucide-react icon as a custom SVG file — use the library component directly.
