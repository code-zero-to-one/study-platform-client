import { beforeEach, describe, expect, it, vi } from 'vitest';

const hideToast = vi.fn();

vi.mock('@/stores/use-toast-store', () => ({
  useToastStore: {
    getState: () => ({
      hideToast,
    }),
  },
}));

const installWindowMock = ({ href = 'https://zeroone.it.kr/home' } = {}) => {
  const replace = vi.fn();
  const currentUrl = new URL(href);

  Object.assign(globalThis, {
    window: {
      location: {
        href,
        search: currentUrl.search,
        replace,
      },
    },
  });

  return {
    replace,
  };
};

const loadRequestDocumentAuthRecovery = async () => {
  const loadedModule = await import('./auth-session-recovery');

  return loadedModule.requestDocumentAuthRecovery;
};

describe('requestDocumentAuthRecovery', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    hideToast.mockReset();
  });

  it('reloads the current document once with the auth recovery marker and preserves existing query/hash', async () => {
    const { replace } = installWindowMock({
      href: 'https://zeroone.it.kr/home?tab=mentor#hero',
    });
    const requestDocumentAuthRecovery = await loadRequestDocumentAuthRecovery();

    expect(requestDocumentAuthRecovery()).toBe(true);
    expect(hideToast).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(
      'https://zeroone.it.kr/home?tab=mentor&__authRecovery=1#hero',
    );
  });

  it('suppresses repeated recovery attempts in the same document lifecycle', async () => {
    const { replace } = installWindowMock();
    const requestDocumentAuthRecovery = await loadRequestDocumentAuthRecovery();

    expect(requestDocumentAuthRecovery()).toBe(true);
    expect(requestDocumentAuthRecovery()).toBe(false);
    expect(hideToast).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledTimes(1);
  });

  it('does not start browser recovery while the protected-route retry marker is already in progress', async () => {
    const { replace } = installWindowMock({
      href: 'https://zeroone.it.kr/payment/3?__authRetry=1',
    });
    const requestDocumentAuthRecovery = await loadRequestDocumentAuthRecovery();

    expect(requestDocumentAuthRecovery()).toBe(false);
    expect(hideToast).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('does not start browser recovery when the document auth recovery marker already exists', async () => {
    const { replace } = installWindowMock({
      href: 'https://zeroone.it.kr/home?tab=mentor&__authRecovery=1',
    });
    const requestDocumentAuthRecovery = await loadRequestDocumentAuthRecovery();

    expect(requestDocumentAuthRecovery()).toBe(false);
    expect(hideToast).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  it('returns false when called outside the browser', async () => {
    const requestDocumentAuthRecovery = await loadRequestDocumentAuthRecovery();

    expect(requestDocumentAuthRecovery()).toBe(false);
  });
});
