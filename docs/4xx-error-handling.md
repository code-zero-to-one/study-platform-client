# 401 미인증 → 로그인 모달 패턴

**유형**: 아키텍처 가이드  
**작성일**: 2026-04-09  
**상태**: `.claude/rules/error-handling.md`에 컨벤션 정의 완료 — 구현 대기 중

---

## 1. 개요 — 왜 리다이렉트·토스트 대신 모달인가

401 응답이 발생했을 때 현재 구현은 `window.location.replace()`로 페이지를 이동시킨다. 이렇게 하면 작성 중이던 폼 내용, 스크롤 위치, 현재 URL이 모두 날아간다.

목표 패턴은 **현재 페이지 위에서** 로그인 모달을 띄우는 것이다:

| 방식 | UX 영향 | 사용 시점 |
|------|---------|----------|
| 리다이렉트 (`window.location.replace`) | 페이지 컨텍스트 파괴, 강제 전체 이동 | ❌ 레거시 — 교체 대상 |
| 토스트 (에러 메시지만 표시) | 혼란스러움 — 사용자가 뭘 해야 할지 알 수 없음 | ❌ 인증 실패에는 부적절 |
| 로그인 모달 (제자리 표시) | 페이지 유지, 재로그인 후 흐름 이어서 진행 | ✅ 목표 패턴 |

특히 폼을 절반쯤 작성한 상태거나 몇 단계를 거쳐 진입한 화면이라면 리다이렉트는 치명적이다. 로그인 화면으로 튕겨 나갔다가 돌아오면 다시 처음부터 해야 한다.

---

## 2. 핵심 개념

### 두 가지 인터셉션 포인트

401 에러가 발생하는 경로는 두 가지다. 각 경로마다 별도의 인터셉션 포인트가 있다.

#### 포인트 1 — 토큰 갱신 실패 (`auth-session-recovery.ts`)

액세스 토큰이 만료된 상태에서 자동 갱신도 실패했을 때(리프레시 토큰 만료 등) 발동된다. 현재는 `window.location.replace()`를 호출한다.

**목표 동작**: 대신 `useLoginModalStore.getState().open()`을 호출한다.

```typescript
// src/api/client/auth-session-recovery.ts
// 현재 (페이지 컨텍스트 소실)
window.location.replace(nextUrl);

// 목표
import { useLoginModalStore } from '@/stores/use-login-modal-store';
useLoginModalStore.getState().open();
```

`hasPendingDocumentAuthRecovery`는 멱등성 플래그다. 동시에 여러 요청이 실패해도 모달이 중복으로 열리지 않도록 막는다. 모달이 닫힐 때 이 플래그를 초기화해야 한다.

#### 포인트 2 — 미인증 Mutation (`query-client.ts`)

비로그인 사용자가 인증이 필요한 액션을 시도할 때 발동된다. 현재는 `MutationCache.onError`에서 모든 실패를 일반 에러 토스트로 처리한다.

**목표 동작**: 토스트 경로 앞에 `statusCode === 401` 분기를 추가한다.

```typescript
// src/config/query-client.ts (목표)
mutationCache: new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (mutation.options.onError) return;
    if (isServer) return;

    const errorInfo = analyzeError(error);

    if (errorInfo.statusCode === 401) {
      useLoginModalStore.getState().open();
      return; // Sentry 전송 안 함 — AUTH001과 동일한 정상 흐름
    }

    useToastStore.getState().showToast(errorInfo.userMessage, 'error');
    sendErrorToSentry(errorInfo, { source: 'MutationCache.onError' });
  },
}),
```

### Zustand Store 패턴

`use-toast-store.ts`를 그대로 본떠서 만든다. 핵심은 `.getState()`를 써서 **React 밖**(axios 인터셉터, 모듈 레벨 함수)에서도 상태를 바꿀 수 있다는 점이다.

```typescript
// src/stores/use-login-modal-store.ts (생성 예정)
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

React 밖에서 사용 (인터셉터, 모듈 레벨 콜백):
```typescript
useLoginModalStore.getState().open();
```

React 컴포넌트 안에서 사용:
```typescript
const { isOpen, close } = useLoginModalStore();
```

### LoginModal 제어 모드(Controlled Mode)

현재 `LoginModal`은 `useState`로 열림/닫힘을 내부에서 관리하고 `openTrigger`를 필수로 받는다. Zustand에서 외부로 열 수 있게 하려면, 기존 `openTrigger` 방식은 그대로 두고 선택적 제어 prop을 추가한다:

```typescript
// src/components/auth/modals/login-modal.tsx
export default function LoginModal({
  openTrigger,
  open,           // 신규: 외부 제어용 open 상태
  onOpenChange,   // 신규: 외부 제어용 setter
}: {
  openTrigger?: ReactNode;  // 선택적으로 변경 — 제어 모드에서는 불필요
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);

  // 제어 prop이 있으면 그걸 쓰고, 없으면 내부 state로 폴백
  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // ... 이하 컴포넌트 내용 동일
}
```

### 전역 마운트 포인트

`(service)/layout.tsx`에서 `<GlobalToast />`와 나란히 `<GlobalLoginModal />`을 마운트한다:

```tsx
// src/app/(service)/layout.tsx — <MainProvider> 내부
<GlobalToast />
<GlobalLoginModal />  // useLoginModalStore의 isOpen을 구독
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

### AUTH 에러 코드 분류

어떤 코드가 어떤 동작으로 이어지는지 정확히 알아야 모달을 잘못 트리거하거나 누락하는 실수를 막을 수 있다:

| 코드 | HTTP | 원인 | 프론트엔드 동작 |
|------|------|------|---------------|
| AUTH001 | 401 | 액세스 토큰 없음/만료/유효하지 않음 | 로그인 모달 |
| AUTH002 | 403 | 인증은 됐으나 권한 부족 | 에러 토스트 |
| AUTH003 | 401 | OAuth 코드 미지원 (OAuth 플로우) | 로그인 모달 |
| AUTH004 | **400** | 리프레시 토큰 유효하지 않음/만료 | `auth-session-recovery.ts` 전용 — `MutationCache`까지 오지 않음 |

AUTH004는 **400**을 반환하기 때문에 `query-client.ts`의 `statusCode === 401` 분기를 자연스럽게 통과하지 않는다. `auth-session-recovery.ts`에서만 처리되면 된다.

---

## 3. 프로젝트 내 패턴

### 멱등성: `hasPendingDocumentAuthRecovery`

`auth-session-recovery.ts`의 모듈 레벨 플래그가 동시 다발로 실패한 요청들이 각각 모달을 여는 상황을 막는다:

```typescript
let hasPendingDocumentAuthRecovery = false;

export const requestDocumentAuthRecovery = (): boolean => {
  if (!currentUrl || hasPendingDocumentAuthRecovery) {
    return false; // 이미 처리 중 — 건너뜀
  }

  hasPendingDocumentAuthRecovery = true;
  useLoginModalStore.getState().open();

  return true;
};
```

모달이 닫힐 때 초기화한다. `GlobalLoginModal`의 `onOpenChange`에 연결하면 된다:

```typescript
onOpenChange={(v) => {
  if (!v) {
    close();
    hasPendingDocumentAuthRecovery = false;
  }
}}
```

### 401에서 Sentry를 전송하지 않는 이유

AUTH001은 `sentry.client.config.ts`의 `beforeSend`에서 명시적으로 제외돼 있다. `MutationCache.onError`의 401도 마찬가지다. 토큰 만료는 언제든 일어날 수 있는 정상 흐름이고, 알림을 받아야 할 오류가 아니다.

### `getState()` vs Hook

| 컨텍스트 | 패턴 |
|---------|------|
| React 컴포넌트 안 | `const { isOpen, close } = useLoginModalStore()` |
| React 밖 (인터셉터, 모듈 함수) | `useLoginModalStore.getState().open()` |

지금도 `useToastStore`가 동일한 방식으로 쓰이고 있다 — `use-toast-store.ts:13`의 `create()` 호출이 두 가지 사용 방식을 모두 가능하게 한다.

---

## 4. 판단 가이드

인증 관련 에러가 생겼을 때 어떻게 처리할지 판단하는 흐름도다:

```
에러 수신
│
├── 401인가?
│   ├── YES → 로그인 모달 표시 (페이지 유지)
│   │         토스트 표시 안 함. Sentry 전송 안 함.
│   └── NO  ↓
│
├── 403인가?
│   ├── YES → 에러 토스트 표시 (로그인은 됐는데 권한이 없는 것)
│   │         예상치 못한 경우 Sentry 전송.
│   └── NO  ↓
│
├── AUTH004 (400)인가?
│   ├── YES → auth-session-recovery.ts에서만 처리.
│   │         MutationCache.onError까지 오지 않음.
│   └── NO  ↓
│
└── 그 외 에러 → 에러 토스트 표시 + Sentry 전송
```

**403에는 절대 로그인 모달을 띄우지 않는다.** 이미 로그인된 상태고 권한만 없는 것이다. 로그인 모달을 보여주면 다시 로그인해야 한다는 잘못된 신호를 주게 된다.

**401에는 절대 `window.location.replace()`를 쓰지 않는다.** 교체 대상인 레거시 패턴이다. 모달의 핵심 가치는 페이지 컨텍스트를 날리지 않는 것이다.

---

## 구현 체크리스트

- [ ] `src/stores/use-login-modal-store.ts` 생성
- [ ] `src/components/auth/modals/login-modal.tsx`에 선택적 `open?`/`onOpenChange?` prop 추가
- [ ] `src/components/auth/modals/global-login-modal.tsx` 생성
- [ ] `src/app/(service)/layout.tsx`에 `<GlobalLoginModal />` 마운트
- [ ] `src/api/client/auth-session-recovery.ts`: `window.location.replace()` → `useLoginModalStore.getState().open()` 교체, 모달 닫힐 때 `hasPendingDocumentAuthRecovery` 초기화
- [ ] `src/config/query-client.ts`: `MutationCache.onError`의 토스트 처리 앞에 `statusCode === 401` 분기 추가
