# Class List Page (클래스 리스트페이지)

## Source
- File: ghct7wh8uZ62eUi6JPU758
- Node: 2:3
- URL: https://www.figma.com/design/ghct7wh8uZ62eUi6JPU758/ZeroOne-%ED%81%B4%EB%9E%98%EC%8A%A4?node-id=2-3&m=dev
- Captured: 2026-05-07
- Screenshot: https://www.figma.com/api/mcp/asset/4dd9f145-0d9a-4c04-a1e4-c2fc4b08a1f6 (7-day expiry)

## Route
- Target path: src/app/(landing)/class/page.tsx
- Layout group: (landing)
- Auth required: no

## Sections
| Section | Type | Data Source | Notes |
|---------|------|-------------|-------|
| GNB | static | — | Provided by (landing)/layout.tsx Header |
| Banner | static | — | Hero text + decorative illustrations + marquee ticker |
| 필터 | interactive | — | Sort chip with dropdown (최신순/인기순/완주율순) |
| 코스 list | static | TODO: API not found | 3 hardcoded courses; see API TODO below |

## Component Reuse
| Figma instance | Codebase path | Status |
|----------------|---------------|--------|
| GNB | src/components/common/layout/home-header.tsx | ✅ via layout |
| 코스 card | — | ❌ inline CourseCard component |
| segment (chevron icon) | lucide-react ChevronDown | ✅ equivalent |

## Token Mapping
| Figma Variable | Project Token | Status |
|----------------|---------------|--------|
| main_color/Brand_Primary_500 (#f63d68) | rose-500 | ✅ exact |
| gradation/1000 (#0a0d12) | gray-1000 | ✅ exact |
| gradation/0 (#ffffff) | gray-0 | ✅ exact |
| gradation/800 (#252b37) | gray-800 | ✅ exact |
| gradation/400 (#a4a7ae) | gray-400 | ✅ exact |
| gradation/500 (#717680) | gray-500 | ✅ exact |
| 16px radius | rounded-200 | ✅ exact |
| padding=8 | p-100 | ✅ exact |
| space/XL=24 | gap-300 | ✅ exact |

## Token Deviations
- Banner bg `#ffe6ec` → rose-100 (#ffe4e8): ⚠️ 2-unit blue channel diff (decorative, acceptable)
- Card thumbnail gradient `#ffc4e1` → rose-200: ⚠️ lighter approximation
- Work card gradient end `#ff7293` → rose-400 (#fd6f8e): ⚠️ closest rose token
- Coming-soon thumbnail `#d6d6d6` → gray-300 (#d5d7da): ⚠️ 1-unit diff, visually identical
- Tag bg `#e5e5e5` → gray-200 (#e9eaeb): ⚠️ slightly lighter
- Tag text `#666` → gray-500 (#717680): ⚠️ closest mid-gray
- Price strikethrough `#999` → gray-400: ⚠️ closest
- Card body text `#121212` → gray-1000 (#0a0d12): ⚠️ closest dark token
- Hero font 62px → font-display-headings2 (64px): ⚠️ 2px over
- Card title 26px → font-designer-28b (28px): ⚠️ 2px over

## Transforms
| Node | Rotation | Scale | Notes |
|------|----------|-------|-------|
| Ellipse 1207 (orbit ring) | -9.38° | 1x | Decorative ellipse around card cluster |
| code_vector (Code card) | -15° | 1x | Left decorative card |
| `<` bracket inside code card | -15° | 1x | Matches parent card |
| `<` bracket (mirrored) | -160.37° | -scale-y-100 | Mirror + rotate = closing bracket effect |
| community_vector (Community card) | +18.03° | 1x | Right decorative card |
| Community Vector (chat arrow) | +19.63° | 1x | Intentional +1.6° diff from card |
| Community Vector mirror | -160.37° | -scale-y-100 | Mirror + rotate |
| Ellipse 1208 (small decor) | +15° | 1x | Sparkle near left curve |
| Ellipse 1210 (small decor) | -28.4° | 1x | Small sparkle |
| Ellipse 1209 (small decor) | +141.54° | 1x | Sparkle near right |
| Vector 3 (wave left) | 180° | 1x | Decorative wave rotated |

## API Mapping
| Region | Hook | DTO Type | File |
|--------|------|----------|------|
| 코스 list | TODO: no class/course API in backend | — | — |
| Learner count | TODO: no class/course API in backend | — | — |

## Notes
- **API TODO**: No backend controller or endpoint for classes/courses exists in `study-platform-mvp`. All course data is currently hardcoded as static constants. When backend adds class API, replace `COURSES` const with TanStack Query hook.
- Designer annotation on marquee ticker: `data-development-annotations="문구 흘러가게 구현"` → implemented as CSS `@keyframes marquee` + `animate-marquee` utility in global.css.
- Marquee uses two copies of MARQUEE_ITEMS in one flex container with `translateX(-50%)` loop.
- Decorative illustrations (orbit ring, Code/Community cards, sparkles) hidden on mobile, shown on `lg:` and above.
- Chat bubble SVG paths in Community card not reproduced (Figma asset URLs expire in 7 days). Community card shows text label only.
- Card thumbnails use CSS gradients only (no expired Figma asset URLs).
- Sort filter currently UI-only; sorting logic must be wired when course list API exists.
