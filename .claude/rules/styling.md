# Styling

Tailwind CSS 4 + `@tailwindcss/postcss` plugin.

Class utilities: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA).
`prettier-plugin-tailwindcss` sorts Tailwind classes automatically.

## Token System

`@theme inline` in `src/app/global.css` resets all base tokens. Base unit = **8px** (from Figma design system).

Token formula: `px × 12.5 = token_number` (equivalent: `px ÷ 8 × 100`).

| Figma token | px   | Project class      |
|-------------|------|--------------------|
| space 50    | 4px  | `gap-50`, `p-50`   |
| space 100   | 8px  | `gap-100`, `p-100` |
| space 200   | 16px | `gap-200`, `p-200` |
| space 300   | 24px | `gap-300`, `p-300` |
| space 400   | 32px | `gap-400`, `p-400` |
| space 600   | 48px | `gap-600`, `p-600` |

For values beyond space 600 (layout-level sizes), add a `--spacing-N` entry to `global.css` using the same formula.

## Spacing/Sizing Arbitrary Values — Banned

Spacing and sizing utilities must use project tokens. Arbitrary px values silently render as `undefined` after the `@theme inline` reset.

**Banned (spacing/sizing utilities):**
```
❌ p-[4px], w-[320px], h-[100px], gap-[10px], top-[20px]
✅ p-50, w-4000, h-1250, gap-125, top-250
```

Target utilities: `p/px/py/pt/pb/pl/pr`, `m/mx/my/mt/mb/ml/mr`, `w/h/min-w/max-w/min-h/max-h/size`, `gap`, `top/right/bottom/left`, `rounded`

**Allowed — no token equivalent exists:**
```
✅ grid-cols-[200px_1fr], grid-rows-[auto_1fr]
✅ bg-[url('/image.png')], bg-[image:url('/icon.svg')]
✅ text-[#hexcolor]
✅ aspect-[16/9], delay-[200ms], duration-[300ms]
```

## Responsive Layout

Fluid-first approach — never fixed widths:

```
❌ w-[400px]
✅ w-full max-w-container
✅ grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

Standard breakpoints: `sm:` (640px) · `md:` (768px) · `lg:` (1024px)

## Pre-Commit Check

Run on modified files only:

```bash
# 1. Inline style props with px values on spacing properties
grep -n 'style={{' <file>
# Skip: transform, %, vh/vw, linear-gradient with CSS vars

# 2. Spacing/sizing arbitrary px values — must be zero
grep -nP 'className.*\b(p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|min-w|max-w|min-h|max-h|size|gap|top|right|bottom|left|rounded)-\[[0-9]' <file>
```

### Adding missing tokens

```css
/* Formula: px × 12.5 = token_number */
/* Example: need 30px → 30 × 12.5 = 375 */
--spacing-375: 30px;
/* Usage: p-375, gap-375 */
```
