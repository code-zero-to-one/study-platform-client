import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isAuthSessionStorageEvent,
  notifyAuthSessionChanged,
  subscribeAuthSessionChange,
} from './client-auth-sync';

const createLocalStorageMock = (): Storage => {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key) => store.get(key) ?? null,
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
};

describe('client auth sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('notifies same-tab listeners and writes the cross-tab storage signal', () => {
    const localStorage = createLocalStorageMock();
    const listener = vi.fn();
    const unsubscribe = subscribeAuthSessionChange(listener);

    Object.assign(globalThis, {
      window: {
        localStorage,
      },
    });

    notifyAuthSessionChanged();

    expect(listener).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('zeroone-auth-session-change')).toBeTruthy();

    unsubscribe();
  });

  it('recognizes only the auth session storage key as a sync event', () => {
    expect(
      isAuthSessionStorageEvent({
        key: 'zeroone-auth-session-change',
      } as StorageEvent),
    ).toBe(true);
    expect(
      isAuthSessionStorageEvent({
        key: 'other-key',
      } as StorageEvent),
    ).toBe(false);
  });
});
