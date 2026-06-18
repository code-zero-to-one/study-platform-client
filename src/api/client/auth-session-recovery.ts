import {
  getDocumentAuthRecoveryPath,
  hasDocumentAuthRecoveryParam,
  hasProtectedTransientRetryParam,
} from '@/features/auth/model/auth-route';
import { useToastStore } from '@/stores/use-toast-store';

let hasPendingDocumentAuthRecovery = false;

const readCurrentBrowserUrl = (): URL | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    return new URL(window.location.href);
  } catch {
    return undefined;
  }
};

export const requestDocumentAuthRecovery = (): boolean => {
  const currentUrl = readCurrentBrowserUrl();

  if (!currentUrl || hasPendingDocumentAuthRecovery) {
    return false;
  }

  if (
    hasProtectedTransientRetryParam(currentUrl.search) ||
    hasDocumentAuthRecoveryParam(currentUrl.search)
  ) {
    return false;
  }

  const nextPath = getDocumentAuthRecoveryPath({
    pathname: currentUrl.pathname,
    search: currentUrl.search,
  });
  const nextUrl = `${currentUrl.origin}${nextPath}${currentUrl.hash}`;

  useToastStore.getState().hideToast();
  hasPendingDocumentAuthRecovery = true;

  try {
    window.location.replace(nextUrl);
  } catch (error) {
    hasPendingDocumentAuthRecovery = false;
    throw error;
  }

  return true;
};
