<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-04-18 | Updated: 2026-04-18 -->

# stores/

## Purpose
Global client state management using Zustand v5. Stores are categorized into three groups:
1. **User & Auth**: `useUserStore` (persisted user profile)
2. **Notifications**: `useToastStore` (global toast notifications — **only way to show alerts**)
3. **Mentoring Domain**: `useMentorDirectoryStore`, `useMentoringManagementStore`, `useMentorOperationStore`, `useMentorScreeningStore` (mentor profiles, mentoring applications, operations)
4. **Other**: `useLeaderStore` (leaderboard state), `usePhoneVerificationStore` (phone verification flow)

**Critical rule**: `useToastStore` is the **ONLY interface for user notifications**. Never use `alert()`, `window.alert()`, or browser dialogs.

## Key Files

| File | Size | Description |
|------|------|-------------|
| `useUserStore.ts` | 85L | Persisted user profile (`memberId`, `nickname`, `profileImageUrl`, etc.). Auto-loads on app init. Survives page refresh via localStorage. |
| `use-toast-store.ts` | 20L | Global toast notifications. Used inside components via hook, or outside React via `.getState()`. |
| `useLeaderStore.ts` | 26L | Leaderboard/leader state (lightweight, non-persisted). |
| `useMentorDirectoryStore.ts` | 407L | Mentor directory state — created mentors, filtered search results, form values, settings (large, complex filter logic). |
| `useMentoringManagementStore.ts` | 1747L | **Largest store** — comprehensive mentoring management: applications, scheduling, feedback, contract tracking, payment, settlement. Multi-step forms and domain logic. |
| `useMentorOperationStore.ts` | 150L | Mentor operation records by mentor ID (persisted). |
| `useMentorScreeningStore.ts` | 149L | Mentor screening/application state (persisted). Records by mentor ID. |
| `use-phone-verification-store.ts` | 57L | Phone verification OTP flow state (persisted). |

## For AI Agents

### Working In This Directory

#### When Adding or Modifying a Store
1. **Decide on persistence**: Use `persist()` middleware if state must survive page refresh (e.g., form values, user selection). Example: `useMentorDirectoryStore` persists filter state.
2. **Choose the scope**: 
   - **Global non-persisted** (default): `create<State>((set) => ({ ... }))`
   - **Persisted**: `create<State>()(persist((set) => ({ ... }), { name: 'storage-key' }))`
3. **External access**: If the store needs to be called outside React (e.g., in error handlers), ensure it exports `.getState()`:
   ```typescript
   useToastStore.getState().showToast('message', 'error');
   ```
4. **Typing**: Define the full `State` interface first, then implement. Example:
   ```typescript
   interface MentorDirectoryState {
     memberId: number | undefined;
     createdMentors: MentorProfile[];
     // ... setters and methods
   }
   ```

#### Toast Usage Pattern (Inside Components)
```typescript
import { useToastStore } from '@/stores/use-toast-store';

// Inside a component
const showToast = useToastStore((state) => state.showToast);
showToast('작업이 완료되었습니다.', 'success');
showToast('오류가 발생했습니다.', 'error');
showToast('정보', 'info');
```

#### Toast Usage Pattern (Outside React)
```typescript
import { useToastStore } from '@/stores/use-toast-store';

// Inside query error handler, middleware, or utility function
useToastStore.getState().showToast('토큰이 만료되었습니다.', 'error');
```

#### User Store Pattern
`useUserStore` is auto-initialized with user profile on app load. Accessing it:
```typescript
import { useUserStore } from '@/stores/useUserStore';

// Inside a component
const { memberId, nickname, profileImageUrl } = useUserStore();

// Outside React (e.g., in API interceptor)
const userId = useUserStore.getState().memberId;
```

#### Mentoring Store Patterns
Mentor-related stores (`useMentorDirectoryStore`, `useMentoringManagementStore`, etc.) are domain-specific:
- **Directory**: Filterable list of mentors, form state for mentor registration
- **Management**: Full CRUD for mentoring sessions, applications, contracts
- **Operation**: Record tracking by mentor ID (e.g., session history)
- **Screening**: Application screening workflow state

All follow the same `create<State>()(persist(...))` pattern.

### Common Patterns

#### Pattern 1: Form State with Persistence
```typescript
interface FormState {
  formValues: { /* ... */ };
  setFormValues: (values: Partial<FormState['formValues']>) => void;
  resetForm: () => void;
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      formValues: { /* defaults */ },
      setFormValues: (values) =>
        set((state) => ({
          formValues: { ...state.formValues, ...values },
        })),
      resetForm: () => set({ formValues: { /* defaults */ } }),
    }),
    { name: 'form-storage' }
  )
);
```

#### Pattern 2: Computed Selector (Avoid Recreating Functions)
When deriving state, use selectors inside `useSelector` to prevent unnecessary re-renders:
```typescript
// Inside a component
const mentors = useMentorDirectoryStore(
  (state) => state.createdMentors.filter(m => m.active)
);
```

#### Pattern 3: Batch Updates
For multiple state updates, group them:
```typescript
useMentorDirectoryStore.setState((state) => ({
  createdMentors: [...state.createdMentors, newMentor],
  mentorIdByMember: { ...state.mentorIdByMember, [newMentor.memberId]: newMentor.id },
}));
```

#### Pattern 4: External State Access (Non-React Contexts)
Always use `.getState()` outside React components:
```typescript
// ❌ Wrong (requires React context)
// const store = useUserStore();

// ✅ Correct (works anywhere)
const memberId = useUserStore.getState().memberId;
```

### Testing & Validation

All stores are tested via:
```bash
yarn typecheck  # Verify State interface types
yarn lint:fix   # Check naming conventions
```

**Zustand v5 conventions**:
- Action methods (setters) are part of the State interface
- No separate actions object
- Use `set` callback for immutable updates
- Use `persist` middleware for localStorage integration

### Integration Points

- **Error handlers** (`src/utils/error-handler.ts`): Call `useToastStore.getState().showToast()` to show errors
- **API interceptors** (`src/api/client/`): Use toast for auth failures, network errors
- **Query client** (`src/config/query-client.ts`): Global mutation error handler triggers toast
- **Route middleware** (`src/middleware.ts`): May trigger user store updates on token refresh
- **Components**: All stores are consumed directly by React components via hooks

### Store Dependency Map

```
useUserStore
  ├─ Auto-initialized on app load
  ├─ Read by: middleware, API interceptors, components
  └─ Modified by: auth routes, profile update mutations

useToastStore
  ├─ Called from: error handlers, mutations, components
  ├─ Accessed via: .getState() (outside React) or hook (inside)
  └─ Never modified externally — internal state only

useMentorDirectoryStore
  ├─ Persists: filter state, form values
  ├─ Read by: mentor directory page, mentor list components
  └─ Modified by: filter UI, mentor registration form

useMentoringManagementStore
  ├─ Persists: active mentoring sessions, application records
  ├─ Read by: mentoring management page, session detail components
  └─ Modified by: API mutations, form handlers

useMentorOperationStore / useMentorScreeningStore
  ├─ Persists: records by mentor ID
  ├─ Read by: mentor-specific pages
  └─ Modified by: CRUD mutations

useLeaderStore / usePhoneVerificationStore
  ├─ Non-persisted, lightweight
  ├─ Scoped to specific features
  └─ Auto-reset on page reload
```

## Dependencies

### External
- `zustand@5` — state management library
- `zustand/middleware` — `persist` for localStorage integration

### Internal
- `@/types/mentoring/*` — TypeScript types for mentoring domain
- `@/features/mentoring/model/*` — Mentoring business logic utilities
- `@/api/endpoints/*` — Server-side data fetching functions

## Notes for AI Agents

1. **Never use `alert()`**: All user notifications must go through `useToastStore`.
2. **Preserve persistence**: When modifying persisted stores, ensure the `persist` config matches the intended storage key and state shape.
3. **Mentoring stores are interconnected**: `useMentorDirectoryStore`, `useMentoringManagementStore`, and `useMentorOperationStore` often work together. Changes to one may affect others.
4. **Type safety first**: Always define the full State interface before implementation — Zustand is not type-safe by default without explicit typing.
5. **Testing mentoring flows**: The largest store (`useMentoringManagementStore`) contains complex multi-step workflows. Verify all update paths before committing.

<!-- MANUAL: -->
