# Styling

Tailwind CSS 4 + `@tailwindcss/postcss` plugin.

Class utilities: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA).
`prettier-plugin-tailwindcss` sorts Tailwind classes automatically.

## Token System

`@theme inline` in `src/app/global.css` resets all base tokens (`--color-*`, `--radius-*`, `--spacing-*`, `--shadow-*`).

**Base Tailwind scale classes are prohibited** — they resolve to `undefined` after the reset:

```
❌ p-4, m-2, rounded-lg, shadow-md, text-sm, gap-4
✅ p-200, m-100, rounded-150, shadow-2, font-designer-body, gap-150
```

Use only project custom tokens:

- Spacing: `p-200`, `m-100`, `gap-150`, etc.
- Radius: `rounded-150`, `rounded-200`, etc.
- Shadow: `shadow-2`, `shadow-3`, etc.
- Typography: `font-designer-*`, `text-text-*`
- Colors: `@theme inline` variables from `global.css` only — no hardcoded hex values

## Responsive Layout

Use breakpoint prefixes with fluid-first approach — never fixed widths:

```
❌ w-[400px]
✅ w-full max-w-container

❌ grid-cols-3 (fixed)
✅ grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

Standard breakpoints: `sm:` (640px) · `md:` (768px) · `lg:` (1024px)

## Pre-Commit Verification

`yarn lint:fix && yarn prettier:fix && yarn typecheck` catch syntax and type errors but have structural blind spots for convention violations. These patterns pass all three checks yet violate project conventions:

| Pattern | Why automated checks miss it |
|---------|------------------------------|
| `style={{ prop: value }}` | ESLint `no-arbitrary-values` inspects `className` strings only — the `style` prop is invisible to it |
| `className="... [14px] ..."` | Only caught if `no-arbitrary-values` ESLint rule is explicitly configured |
| `bg-white`, `text-white`, `bg-black` | Valid Tailwind class names; the underlying CSS variable is simply absent → renders transparent/invisible with no error |
| `p-4`, `m-2`, `gap-4` (base scale) | Valid class names; `@theme inline` resets the variable → undefined, same silent failure |

### Required checks before committing modified files

```bash
# 1. Inline styles (style prop bypasses token system)
grep -n 'style={{' <file>

# 2. Tailwind arbitrary values (exclude TypeScript generics and comments)
grep -n 'className.*\[' <file> | grep -v '^\s*//'

# 3. Base color classes (undefined after @theme inline reset)
grep -n 'bg-white\|text-white\|bg-black\|text-black' <file>

# 4. Base numeric scale classes (spot-check)
grep -nP '(?<!\w)(p|m|gap|px|py|pt|pb|pl|pr)-[0-9]\b' <file>
```

All results must be zero. If a needed token is missing from `global.css`, add it first — never use `style={}` or `[value]` as a temporary workaround.

### Adding missing tokens

Spacing scale formula: `px_value × 12.5 = token_number`

```css
/* Example: need 30px spacing */
/* 30 × 12.5 = 375 → add to global.css: */
--spacing-375: 30px;
/* then use: p-375, gap-375, etc. */
```
