'use client';

const listeners = new Set<() => void>();
const AUTH_SESSION_CHANGE_STORAGE_KEY = 'zeroone-auth-session-change';

const notifyListener = (listener: () => void): void => {
  try {
    listener();
  } catch (error) {
    console.error('인증 세션 변경 리스너 실행에 실패했습니다.', error);
  }
};

export const notifyAuthSessionChanged = (): void => {
  listeners.forEach((listener) => {
    notifyListener(listener);
  });

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      AUTH_SESSION_CHANGE_STORAGE_KEY,
      String(Date.now()),
    );
  } catch {
    // storage 접근이 막힌 환경에서는 같은 탭 listener만 사용한다.
  }
};

export const subscribeAuthSessionChange = (
  onStoreChange: () => void,
): (() => void) => {
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
};

export const isAuthSessionStorageEvent = (event: StorageEvent): boolean =>
  event.key === AUTH_SESSION_CHANGE_STORAGE_KEY;
