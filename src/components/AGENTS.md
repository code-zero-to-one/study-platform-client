<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# components/

## Purpose

Central React component library for the ZERO-ONE Study Platform. This directory houses all UI components, from low-level reusable primitives (`common/ui/`) to domain-specific composites (mentoring, group-study, payment, etc.). Organized by domain and responsibility level, not by feature file type.

## Subdirectories

| Directory | Purpose | Key Files/Exports |
|-----------|---------|-------------------|
| **common/** | Shared, reusable UI primitives and layouts (no domain business logic) | See breakdown below |
| **admin/** | Admin-only components (protected routes via ROLE_ADMIN JWT claim) | Admin-specific forms, panels |
| **auth/** | Authentication flows and modals (login, OAuth callbacks) | `auth/modals/login-modal.tsx` (controlled via `useLoginModalStore`) |
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

## For AI Agents

### Working In This Directory

1. **New feature component?** → Check if it belongs in `pages/` (page-level composite) or a domain subdirectory.
   - Page-level composites use `pages/` **only if** they span multiple domains or are top-level route layout components.
   - Domain-specific composites live in their feature directory (e.g., `mentoring/pages/`, `group-study/pages/`).
   - Single reusable pieces go in `common/` (never put business logic here).

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
