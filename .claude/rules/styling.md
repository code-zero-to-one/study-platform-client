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
