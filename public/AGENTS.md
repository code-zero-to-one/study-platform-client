<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# public/

## Purpose

Static assets served at the root URL by Next.js 15. Contains fonts, icons, images, animations, and responsive design screenshots for PR documentation. All files are automatically cached and optimized by the Next.js build pipeline.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `fonts/` | Web fonts (Pretendard Variable WOFF2 for typography system) |
| `icons/` | SVG icons (48+ Material Design and custom icons for UI components) |
| `images/` | PNG/SVG images (landing page graphics, error states, social logos) |
| `lottie/` | Lottie animations (JSON-based vector animations for interactive UI) |
| `pr-screenshots/` | Responsive design screenshots (375px, 768px, 1280px viewports for PR documentation) |

## Root-Level Assets

**SVGs & Icons:**
- `apply-study.svg` — large hero graphic (561 KB)
- `feedback.svg` — feedback illustration (460 KB)
- `graphic-area.svg` — decorative area graphic (926 KB)
- `*.svg` — OAuth icons (Kakao, Google, Naver), component icons (file, globe, profile, window, next, vercel)

**Metadata & Config:**
- `manifest.json` — PWA manifest
- `favicon.ico` — browser tab icon

**Images:**
- `profile-default.jpg` — default user avatar (6.8 KB)
- `profile-default.svg` — SVG fallback for avatar

## For AI Agents

### Working In This Directory

**When adding static assets:**
1. **Icons**: Place SVGs in `icons/` (imported as React components via `@svgr/webpack` in next.config.ts)
2. **Images**: Place PNGs/JPGs in `images/` (optimized by `next/image` component)
3. **Animations**: Place Lottie JSON files in `lottie/` (imported dynamically for code splitting)
4. **Fonts**: Web fonts in `fonts/` are referenced in `src/app/global.css` via `@font-face`
5. **PR Screenshots**: Store responsive screenshots in `pr-screenshots/` with naming: `{page}-{viewport}.png` (e.g., `01-landing-1280.png`)

**Import patterns:**
```typescript
// SVG icons as React components
import { CheckIcon } from '@/public/icons/check.svg';
// or direct path
import CheckIcon from '@/public/icons/check.svg';

// Images with next/image
import Image from 'next/image';
<Image src="/images/banner.png" alt="..." width={1200} height={400} />

// Lottie animations
const LottieComponent = dynamic(() =>
  import('react-lottie-player').then(mod => mod.Player),
  { ssr: false }
);
<LottieComponent src="/lottie/community-featured-fire.lottie" />
```

**File naming conventions:**
- Icons: kebab-case, descriptive (e.g., `arrow-down.svg`, `seal-check.svg`)
- Images: kebab-case, context-aware (e.g., `book-in-landing-page.svg`, `one-by-one-study.png`)
- Screenshots: `{sequence}-{page}-{viewport}.png` (e.g., `05-study-detail-info-1280.png`)

**SVG optimization:**
- Use SVGR for component imports (reduces bundle size vs. inline SVGs)
- Ensure SVGs have no hardcoded colors — use `currentColor` for Tailwind color inheritance
- Keep SVGs under 100 KB (compress before adding)

**Image optimization:**
- Use Next.js `<Image>` component (automatic WebP, responsive srcset)
- Provide `width` and `height` props to prevent layout shift
- For decorative images, use `aria-hidden="true"`

### Static Generation & Caching

- Next.js automatically serves `public/` files with immutable cache headers (`Cache-Control: public, max-age=31536000, immutable`)
- Files are served directly without processing (except through `@svgr/webpack` for SVG imports)
- Versioning is handled by Next.js content hash (rebuild triggers cache invalidation)

### Common Patterns

**Adding a new icon:**
1. Place SVG in `icons/` with kebab-case name
2. Import in component: `import IconName from '@/public/icons/icon-name.svg'`
3. Use as React component: `<IconName className="w-5 h-5" />`

**Adding a new image:**
1. Place PNG/JPG in `images/`
2. Import and use with `<Image>` component
3. Specify `width`, `height`, and `alt` for accessibility

**Adding responsive screenshots for PR:**
1. Capture at 375px, 768px, 1280px viewports
2. Name as `{seq}-{feature}-{viewport}.png`
3. Store in `pr-screenshots/` for CI/PR workflows

<!-- MANUAL: -->
