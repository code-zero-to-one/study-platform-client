# GNB (Global Navigation Bar)

## Source
- File: `ghct7wh8uZ62eUi6JPU758`
- Node: `439:4774`
- URL: https://www.figma.com/design/ghct7wh8uZ62eUi6JPU758/ZeroOne-클래스?node-id=439-4774
- Captured: 2026-05-08

## Route
- Target: shared layout component (not a route)
- Affected files:
  - `src/components/common/layout/header-nav.tsx`
  - `src/components/common/layout/home-header.tsx`
  - `src/components/common/layout/home-header-client.tsx`
  - `src/components/common/layout/mobile-menu-drawer.tsx`

## Sections

| Section | Type | Notes |
|---------|------|-------|
| Logo | static | ZERO ONE IT logo + BETA badge |
| Nav tabs | interactive | 클래스 (active), 커뮤니티 (coming soon), 인사이트 (coming soon) |
| Comming Soon tooltip | hover decoration | Pink badge with upward triangle arrow, appears on hover over coming-soon tabs |
| 마이 클래스 button | auth-conditional | Shown when logged in; pink button with monitor icon |
| User profile | auth-conditional | Avatar + nickname + level badge + dropdown |
| 로그인/회원가입 button | auth-conditional | Shown when logged out |

## Nav Items (updated from Figma)

| Label | href | State |
|-------|------|-------|
| 클래스 | `/class` | Active (navigable) |
| 커뮤니티 | `/community` | Coming soon — non-navigable, hover shows tooltip |
| 인사이트 | `/insight` | Coming soon — non-navigable, hover shows tooltip |

**Removed from nav:** 질문답변 (was `/qna`)

## Hidden Sections (user instruction)

Per product decision (2026-05-08), the following are hidden until further notice:

- `StudyMatchingToggle` (1:1 스터디 매칭) — removed from desktop header and mobile drawer
- `NotificationDropdown` (알림) — removed from desktop header and mobile drawer

Code is commented out in `home-header-client.tsx`, not deleted, for easy re-enable.

## Token Mapping

| Figma Variable | Project Token | Status |
|----------------|---------------|--------|
| main_color/Brand_Primary_500 (#f63d68) | `bg-background-brand-default` | ✅ exact |
| gradation/0 (white) | `text-gray-0` | ✅ exact |
| padding: 8px | `p-100` | ✅ exact |

## Asset Downloaded

| File | Usage |
|------|-------|
| `/public/icons/comming-soon-arrow.svg` | Upward triangle polygon in "Comming Soon" tooltip |

## Stacking Context Note

`mix-blend-multiply` on `<header>` creates a CSS stacking context. Without `position: relative; z-index: 10`, the header's stacking context renders below `<main>` (later in DOM), clipping the tooltip. Fixed by adding `relative z-10` to `<header>`.

## Component Reuse

| Section | Component | Status |
|---------|-----------|--------|
| User dropdown | `HeaderUserDropdown` | ✅ reused |
| Login modal | `LoginModal` (dynamic) | ✅ reused |
| Mobile nav | `MobileMenuDrawer` | ✅ updated in-place |
| 마이 클래스 button | `Button` (common/ui) | ✅ reused |
