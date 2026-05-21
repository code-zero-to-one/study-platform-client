# No lucide-react Icon Substitution for Design Assets

## Rule

When a Figma design specifies a custom icon (non-standard shape, brand icon, or project-specific glyph), **do NOT substitute it with a lucide-react icon**.

## What This Means

If the designer used a custom SVG icon that isn't in lucide-react:

```tsx
// ❌ Wrong — lucide-react substitute when Figma has a custom icon
import { CircleCheck } from 'lucide-react';
<CircleCheck className="h-250 w-250" />

// ✅ Correct — inline SVG from Figma asset
<svg width="20" height="20" viewBox="..." fill="currentColor" aria-hidden="true">
  <path d="..." />
</svg>
```

## How to Get the Real Icon

1. In Figma MCP, call `get_design_context` on the parent node
2. Find the icon child node (usually named with the icon type)
3. Call `get_screenshot` on that child node to get the asset URL
4. Download immediately: `curl -s -o public/<route>/<name>.svg "<asset-url>"`
5. Verify: `file public/<route>/<name>.svg` — must say SVG, not HTML
6. Use as inline SVG with `fill="currentColor"` for color inheritance

## When lucide-react IS Allowed

lucide-react is the standard icon library for generic UI icons (arrows, close buttons, chevrons, etc.) that have no custom Figma counterpart. Use it freely for:
- Navigation icons (ChevronLeft, ChevronRight, X, ArrowLeft, etc.)
- Form icons (Search, Eye, EyeOff, etc.)
- Generic utility icons not specified as custom assets in Figma

## The Problem This Prevents

lucide-react substitutes silently change the visual identity of design-specific icons. The designer chose a specific icon shape intentionally — substituting it breaks brand consistency.
