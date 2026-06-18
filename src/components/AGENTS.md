<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-06-11 -->

# components/

## Purpose

Central React component library for the ZERO-ONE Study Platform. This directory houses all UI components, from low-level reusable primitives (`common/ui/`) to domain-specific composites (mentoring, group-study, payment, etc.). Organized by domain and responsibility level, not by feature file type.

## Subdirectories

| Directory | Purpose | Key Files/Exports |
|-----------|---------|-------------------|
| **common/** | Shared, reusable UI primitives and layouts (no domain business logic) | See breakdown below |
| **admin/** | Admin-only components (protected routes via ROLE_ADMIN JWT claim) | Admin-specific forms, panels |
| **auth/** | Authentication flows and modals (login, OAuth callbacks) | `auth/modals/login-modal.tsx` (controlled via `useLoginModalStore`) |
| **class/** | Class/course feature composites (detail sections, curriculum, journey, `payment/`) — maps to `(class-lesson)`/`(landing)` class routes | `class-detail-*`, `journey-*`, `payment/checkout-form.tsx` |
| **landing/** | Public landing page composites — maps to `(landing)` `/` route | `landing-content.tsx`, `hero-flip-card.tsx`, `study-ready-form.tsx` |
| **forms/** | Reusable form components (fieldsets, wrappers, common patterns) | React Hook Form + Zod integration helpers |
| **group-study/** | Group study feature composites (12+ subdirs: mission, discussion, review, schedule, participation, filtering, summary, etc.) | `pages/`, `modals/`, `section/` components for group study workflows |
| **home/** | Home page components and sections | Hero, featured studies, recommendations |
| **mentoring/** | 1:1 mentoring feature (15+ subdirs: apply, detail, management, registration, review, mentor-directory, note-consultation, etc.) | **Note: NOT MentorStudy** — MentorStudy is a group study type, see domain-entities.md |
| **my-page/** | User profile/dashboard components | User info, history, settings |
| **one-to-one/** | 1-on-1 session components | Session scheduling, join screens |
| **payment/** | Payment flow components (Toss integration) | Payment form, approval screen, refund UI |

### common/ Breakdown

| Subdirectory | Purpose |
|--------------|---------|
| **ui/** | 50+ shadcn-based design system components (Button, Dialog, Input, Modal, Badge, Carousel, DatePicker, Editor, Pagination, Toast, FloatingInquiryButton, etc.). **All UI work should prefer these.** No custom icon/button implementations. |
| **layout/** | App-level layouts: Header (home, service), AdminSideBar, PageContainer, MobileMenuDrawer, HeaderNav, UserDropdown |
| **modals/** | Global modals (GlobalLoginModal, others). Login modal is controlled via `useLoginModalStore` |
| **analytics/** | Analytics tracking components (Clarity, GTM, Sentry integration) |
| **cards/** | Card templates and wrappers |
| **seo/** | SEO meta tag components, structured data |
| **sentry-init.tsx** | Sentry error boundary initialization |

## 컴포넌트 배치 4축 규칙 (Placement — the only rules that decide *where*)

목표: "이 컴포넌트 어디 있지?"의 답을 **하나로** 만든다. 위치를 예측 가능하게 해 탐색 비용을 없앤다. 새 컴포넌트를 놓거나 기존 것을 옮길 때, 아래 4축 외의 조직 규칙(종류별 통, feature 그룹핑 등)을 새로 만들지 않는다.

**축 1 — 최상위 = 도메인 (종류 아님).** `src/components/` 바로 아래는 항상 도메인 폴더(`home/`, `group-study/`, `payment/` …)다. `pages/`·`cards/` 같은 *종류* 폴더를 최상위에 두지 않는다. 유일한 예외 = `common/`(축 4).

**축 2 — 라우트 뷰 = `<domain>/pages/`.** 라우트(`src/app/...`)에 1:1로 대응하는 페이지 레벨 composite는 그 도메인의 `pages/`에 둔다 (`home/pages/`, `group-study/pages/`). 최상위 `components/pages/`는 **숨은 도메인** — 만들지 말고, 발견하면 도메인으로 승격한다.

**축 3 — 하위 폴더 임계치 = 같은 종류 5개.** 같은 종류 파일이 **5개 이상**일 때만 묶음 폴더를 만든다. 5 미만이면 도메인 루트에 flat. 목표 최대 깊이 = `src/components/<domain>/<group>/file.tsx` (5세그먼트).
  - **kind-bucket** (`modals/`·`cards/` 처럼 *종류*로 묶은 통) → 5+ 규칙 적용. 3개면 풀어서 flat.
  - **component-colocation** (한 컴포넌트를 여러 파일로 쪼갠 것, 예 `onboarding-modal/index.tsx` + 조각들) → **임계치 예외**, 5 미만이어도 폴더 유지. 단 그 안에 불필요한 중간 폴더(`steps/` 등)는 금지 — 조각은 colocation 폴더 루트에 평탄하게.

**축 4 — `common/` 자격 = 2개 이상 도메인이 import OR 도메인 지식 0(순수 primitive).** 한 도메인만 쓰면 `common/`에 둘 자격이 없다 → 그 도메인으로 강등. 신규 기본값 = **자기 도메인**, 입증된 재사용(2+ 도메인)만 `common/`으로 승격. (`common/ui/` 디자인 시스템은 순수 primitive로 항상 자격 충족.)

### 신규 컴포넌트 결정 트리

```
1. 어느 도메인? (home / group-study / payment / auth …)
2. 라우트 뷰인가? ──예──▶ <domain>/pages/file.tsx               (축 2)
        │ 아니오
        ▼
3. 같은 종류가 이미 5개 이상인가? ──예──▶ <domain>/<group>/file.tsx (축 3, kind-bucket)
        │ 아니오
        ▼
4. <domain>/file.tsx 에 flat                                   (축 3)
        │
        ▼
5. 2+ 도메인이 import 하게 됐는가(입증)? ──예──▶ common/ 으로 승격   (축 4)
   (한 컴포넌트를 여러 파일로 쪼갠 경우 → <domain>/<name>/ colocation, 중간 폴더 금지)
```

이동(기존 정리)은 같은 트리를 역으로 적용: kind-bucket 5 미만 → 풀고, 최상위 종류 폴더 → 도메인 승격, 단일-도메인 `common/` 파일 → 강등.

## For AI Agents

### Working In This Directory

1. **New feature component?** → Apply the **4축 결정 트리** above. Short version:
   - Route view → `<domain>/pages/` (never top-level `components/pages/` — that's a hidden domain).
   - Domain composite → `<domain>/` flat, or `<domain>/<group>/` only when same-kind ≥ 5.
   - Reusable across 2+ domains (proven) → `common/` (never put business logic here).
   - **This directory is the target structure for new UI code.** Do not add new components under `src/features/` — it is frozen legacy, migrated here one domain per PR.

2. **New UI primitive?** → Add to `common/ui/` if reusable across 2+ domains. Otherwise, keep it domain-scoped.
   - Check `common/ui/` first before creating custom inputs, buttons, modals, etc.
   - Follow shadcn patterns: use CVA for variants, `cn()` for className composition, Radix UI for accessible behavior.

3. **Auth modal needed?** → Use existing `auth/modals/login-modal.tsx`.
   - Control via `useLoginModalStore.getState().open()` (outside React) or hook inside React.
   - See error-handling.md for 401 interception patterns.

4. **Form fields?** → Leverage `forms/` utilities + React Hook Form + Zod.
   - Avoid `<input>` directly; use `common/ui/input/`.
   - See api-patterns.md for mutation patterns with form handling.

5. **Global layout?** → Modify `common/layout/` only for app-wide changes (Header, AdminSideBar).
   - Route-specific layouts live in `src/app/` (Next.js app router pattern).

### Common Patterns

#### Class Composition (Always)

```typescript
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

// ✅ ALWAYS use cn()
<div className={cn('flex items-center', active && 'bg-fill-brand-default')}>

// ❌ Never template literals
<div className={`flex items-center ${active ? 'bg-fill-brand-default' : ''}`}>
```

#### Tailwind Tokens (No Arbitrary Values)

```typescript
// ✅ Use custom tokens from src/app/global.css
<div className="p-200 rounded-150 shadow-2 text-text-primary">

// ❌ Never arbitrary pixel/color values
<div className="p-[4px] rounded-[8px] shadow-[0_2px_4px_#000]">
```

#### CVA for Component Variants

```typescript
import { cva, VariantProps } from 'class-variance-authority';

const buttonVariants = cva('flex items-center', {
  variants: {
    size: {
      small: 'px-100 h-350',
      large: 'px-200 h-600',
    },
  },
  defaultVariants: { size: 'medium' },
});

function Button({ size, className, ...props }) {
  return <button className={cn(buttonVariants({ size }), className)} {...props} />;
}
```

#### Optional Field Safety in Keys & Handlers

See backend-data-safety.md:

```typescript
// ✅ Use ?? with index fallback
{items.map((item, index) => <div key={item.id ?? index}>...

// ✅ Guard handlers for optional fields
const handleClick = (id: number | undefined) => {
  if (!id) {
    showToast('정보를 불러올 수 없습니다.', 'error');
    return;
  }
  // proceed
};
```

#### Enum/Union Type Safety

```typescript
// ✅ Use `in` guard with fallback
const status = type && type in STATUS_LABELS ? (type as Status) : undefined;

// ❌ Never bare `as` assertion
const status = type as Status; // unsafe at runtime
```

#### Login Modal Pattern (401 Handling)

```typescript
import { useLoginModalStore } from '@/stores/use-login-modal-store';

// In mutation onError or auth-session-recovery
useLoginModalStore.getState().open(); // preserves page context
```

#### Toast Usage

```typescript
import { useToastStore } from '@/stores/use-toast-store';

// Inside React
const showToast = useToastStore((state) => state.showToast);
showToast('완료되었습니다.', 'success');

// Outside React (e.g., axios interceptor, mutation callback)
useToastStore.getState().showToast(message, 'error');
```

## Dependencies

### Internal

- **`src/app/global.css`** — Tailwind token definitions (colors, spacing, typography, shadows). **No arbitrary values.** Always check this before using hardcoded values.
- **`src/components/common/ui/`** — shadcn-based design system. Primary import for Button, Dialog, Input, Modal, Badge, Toast, etc.
- **`src/stores/`** — Zustand stores: `useUserStore`, `useLoginModalStore`, `useToastStore`, `useLeaderStore`.
- **`src/utils/error-handler.ts`** — `analyzeError()`, `logError()` for centralized error classification and Sentry reporting.
- **`src/hooks/queries/`** — TanStack Query hooks for server state. Domain-specific API integrations.

### External

- **`class-variance-authority` (CVA)** — Variant management for component styling. Used in all design system components.
- **`@radix-ui/*`** — Accessible primitive behavior: Slot, Dialog, Dropdown, Tabs, Accordion, etc.
- **`clsx`, `tailwind-merge`** — Utility dependencies for `cn()` function. Automatically composed in `common/ui/(shadcn)/lib/utils.ts`.
- **`react-hook-form`** — Form state management. Used in `forms/` and domain-specific form components.
- **`zod`** — Runtime schema validation for forms. Schema definitions in `src/types/schemas/`.
- **`@sentry/nextjs`** — Error tracking and monitoring. Auto-captured via `logError()` and global error boundaries.

## Notes

- **No business logic in `common/`** — `common/` is purely presentational. Domain logic lives in feature directories (mentoring, group-study, etc.) or `src/hooks/queries/`.
- **Server Components in `src/app/`** — This directory is for client-side React components. Server-side rendering happens in `src/app/` route layouts and pages.
- **Storybook stories** — Many components have `.stories.tsx` files. Run `yarn storybook` to develop components in isolation.
- **Mentoring vs MentorStudy** — See `.claude/rules/domain-entities.md`: Mentoring (`/mentoring/`) is 1:1 consultation; MentorStudy is a premium group study type. Do not confuse.

<!-- MANUAL: -->
