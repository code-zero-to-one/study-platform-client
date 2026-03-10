import { useState } from 'react';

/**
 * 컴포넌트의 lazy mount를 관리하는 훅.
 * `open`이 한 번이라도 true가 되면 mounted를 true로 유지하여
 * Radix Dialog 등의 exit 애니메이션이 정상 동작하도록 한다.
 */
export function useLazyMount(open: boolean): boolean {
  const [mounted, setMounted] = useState(false);

  if (open && !mounted) {
    setMounted(true);
  }

  return mounted;
}
