# 401 Unauthenticated → Login Modal Pattern

**Type**: Architecture Guide  
**Date**: 2026-04-09  
**Status**: Pattern defined in `.claude/rules/error-handling.md` — pending implementation

---

## 1. Overview — Why Modal Instead of Redirect or Toast

When a 401 response occurs (session expired or unauthenticated action), the current implementation redirects the user via `window.location.replace()`. This loses page context: any in-progress form state, scroll position, and the URL the user was on are all discarded.

The target pattern shows a login modal **in place**:

| Approach | UX Impact | When to use |
|----------|-----------|-------------|
| Redirect (`window.location.replace`) | Destroys page context, forces full navigation | ❌ Legacy pattern — being replaced |
| Toast (error message only) | Confusing — no clear recovery action | ❌ Wrong for auth failures |
| Login Modal (in-place) | Page stays intact, user logs back in and continues | ✅ Target pattern |

The modal approach is especially important for flows where the user has filled out a form or navigated deep into the app. A redirect would restart that journey from scratch.

---

## 2. Core Concepts

### Two Interception Points

401 errors can originate from two distinct paths. Each has its own interception point:

#### Point 1 — Token Refresh Failure (`auth-session-recovery.ts`)

Triggered when the access token has expired and the silent refresh also fails (e.g., refresh token expired or invalid). Currently calls `window.location.replace()`.

**Target behavior**: Call `useLoginModalStore.getState().open()` instead.

```typescript
// src/api/client/auth-session-recovery.ts
// Current (loses page context)
window.location.replace(nextUrl);

// Target
import { useLoginModalStore } from '@/stores/use-login-modal-store';
useLoginModalStore.getState().open();
```

`hasPendingDocumentAuthRecovery` acts as an idempotency flag — prevents multiple concurrent failing requests from each triggering a separate modal open. Reset this flag when the modal closes.

#### Point 2 — Unauthenticated Mutation (`query-client.ts`)

Triggered when a guest user (not logged in) attempts an action that requires auth. Currently all `MutationCache.onError` failures show a generic error toast.

**Target behavior**: Check `statusCode === 401` before the toast path.

```typescript
// src/config/query-client.ts (target)
mutationCache: new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (mutation.options.onError) return;
    if (isServer) return;

    const errorInfo = analyzeError(error);

    if (errorInfo.statusCode === 401) {
      useLoginModalStore.getState().open();
      return; // no Sentry — this is expected flow, same as AUTH001
    }

    useToastStore.getState().showToast(errorInfo.userMessage, 'error');
    sendErrorToSentry(errorInfo, { source: 'MutationCache.onError' });
  },
}),
```

### Zustand Store Pattern

Model this after `use-toast-store.ts`, which demonstrates the key technique: calling `.getState()` to trigger state changes from **outside React** (inside axios interceptors, module-level functions).

```typescript
// src/stores/use-login-modal-store.ts (to be created)
import { create } from 'zustand';

interface LoginModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
```

Usage outside React (interceptors, module-level callbacks):
```typescript
useLoginModalStore.getState().open();
```

Usage inside React components:
```typescript
const { isOpen, close } = useLoginModalStore();
```

### LoginModal Controlled Mode

The current `LoginModal` component manages `isOpen` internally with `useState` and requires `openTrigger`. To allow Zustand to drive it, add optional controlled props while keeping the existing `openTrigger` usage intact:

```typescript
// src/components/auth/modals/login-modal.tsx
export default function LoginModal({
  openTrigger,
  open,           // new: optional controlled open
  onOpenChange,   // new: optional controlled setter
}: {
  openTrigger?: ReactNode;  // made optional — not needed in controlled mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled props if provided, otherwise fall back to internal state
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // ... rest of component unchanged
}
```

### Global Mount Point

Mount `<GlobalLoginModal />` in `(service)/layout.tsx` alongside `<GlobalToast />`:

```tsx
// src/app/(service)/layout.tsx — inside <MainProvider>
<GlobalToast />
<GlobalLoginModal />  // reads isOpen from useLoginModalStore
```

```tsx
// src/components/auth/modals/global-login-modal.tsx
'use client';

import { useLoginModalStore } from '@/stores/use-login-modal-store';
import LoginModal from './login-modal';

export function GlobalLoginModal() {
  const { isOpen, close } = useLoginModalStore();
  return <LoginModal open={isOpen} onOpenChange={(v) => !v && close()} />;
}
```

### AUTH Error Code Classification

Understanding which error codes map to which behavior prevents both over- and under-triggering the modal:

| Code | HTTP | Cause | Frontend Action |
|------|------|-------|----------------|
| AUTH001 | 401 | Missing / expired / invalid access token | Login modal |
| AUTH002 | 403 | Authenticated but insufficient role | Error toast |
| AUTH003 | 401 | Unsupported OAuth code (OAuth flow) | Login modal |
| AUTH004 | **400** | Refresh token invalid/expired | `auth-session-recovery.ts` only — never reaches `MutationCache` |

AUTH004 returns **400**, not 401. This means it bypasses the `statusCode === 401` gate in `query-client.ts` automatically. It is handled exclusively by `auth-session-recovery.ts`.

---

## 3. Patterns in This Project

### Idempotency: `hasPendingDocumentAuthRecovery`

In `auth-session-recovery.ts`, the module-level flag prevents concurrent requests from each opening a new modal:

```typescript
let hasPendingDocumentAuthRecovery = false;

export const requestDocumentAuthRecovery = (): boolean => {
  if (!currentUrl || hasPendingDocumentAuthRecovery) {
    return false; // already opening — skip
  }

  hasPendingDocumentAuthRecovery = true;
  useLoginModalStore.getState().open();

  return true;
};
```

Reset when the modal closes — wire it to the store's `close()` action or to `GlobalLoginModal`'s `onOpenChange`:

```typescript
onOpenChange={(v) => {
  if (!v) {
    close();
    hasPendingDocumentAuthRecovery = false;
  }
}}
```

### Why No Sentry on 401

AUTH001 is explicitly excluded from Sentry in `sentry.client.config.ts` via `beforeSend`. The same reasoning applies to 401s in `MutationCache.onError`: token expiry is expected, not an error to alert on. Only unexpected errors should fire Sentry.

### `getState()` vs Hook

| Context | Pattern |
|---------|---------|
| Inside React component | `const { isOpen, close } = useLoginModalStore()` |
| Outside React (interceptor, module function) | `useLoginModalStore.getState().open()` |

This is the same pattern used by `useToastStore` today — `use-toast-store.ts:13` shows the `create()` call that enables both usages.

---

## 4. Decision Guide

Use this flowchart when deciding how to handle an auth-related error:

```
Error received
│
├── Is it 401?
│   ├── YES → Show login modal (in-place, preserves context)
│   │         Don't show toast. Don't report to Sentry.
│   └── NO  ↓
│
├── Is it 403?
│   ├── YES → Show error toast (user is logged in, just lacks permission)
│   │         Report to Sentry if unexpected.
│   └── NO  ↓
│
├── Is it 400 with AUTH004?
│   ├── YES → Handled only in auth-session-recovery.ts.
│   │         Never reaches MutationCache.onError.
│   └── NO  ↓
│
└── Other error → Show error toast + report to Sentry
```

**Never** show the login modal for 403 — the user is authenticated, they just lack the right role. Showing a login modal would incorrectly imply they need to log in again.

**Never** redirect using `window.location.replace()` on 401 — this is the legacy pattern being replaced. The modal preserves page context, which is the whole point.

---

## Implementation Checklist

When implementing this pattern:

- [ ] Create `src/stores/use-login-modal-store.ts`
- [ ] Update `src/components/auth/modals/login-modal.tsx` to accept optional `open?`/`onOpenChange?`
- [ ] Create `src/components/auth/modals/global-login-modal.tsx`
- [ ] Mount `<GlobalLoginModal />` in `src/app/(service)/layout.tsx`
- [ ] Update `src/api/client/auth-session-recovery.ts`: replace `window.location.replace()` with `useLoginModalStore.getState().open()`, reset `hasPendingDocumentAuthRecovery` on modal close
- [ ] Update `src/config/query-client.ts`: add `statusCode === 401` gate before toast in `MutationCache.onError`
