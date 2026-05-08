import { useCallback, useEffect, useMemo, useState } from 'react';

export type AdminDraftStatus = 'idle' | 'saving' | 'saved' | 'restored';

interface AdminDraftPayload<T> {
  value: T;
  updatedAt: string;
}

const ADMIN_DRAFT_PREFIX = 'zeroone:admin-course-draft';

const canUseStorage = () => typeof window !== 'undefined';

export const removeAdminDraft = (draftKey: string) => {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(`${ADMIN_DRAFT_PREFIX}:${draftKey}`);
  } catch {
    // no-op
  }
};

export const readAdminDraft = <T>(draftKey: string): T | undefined => {
  if (!canUseStorage()) return undefined;

  try {
    const rawValue = window.localStorage.getItem(
      `${ADMIN_DRAFT_PREFIX}:${draftKey}`,
    );
    if (!rawValue) return undefined;

    return (JSON.parse(rawValue) as AdminDraftPayload<T>).value;
  } catch {
    return undefined;
  }
};

export function useAdminLocalDraft<T>({
  draftKey,
  value,
  enabled = true,
}: {
  draftKey: string;
  value: T;
  enabled?: boolean;
}) {
  const [status, setStatus] = useState<AdminDraftStatus>('idle');
  const storageKey = useMemo(
    () => `${ADMIN_DRAFT_PREFIX}:${draftKey}`,
    [draftKey],
  );

  useEffect(() => {
    if (!enabled || !canUseStorage()) return;

    setStatus('saving');
    const timeoutId = window.setTimeout(() => {
      const payload: AdminDraftPayload<T> = {
        value,
        updatedAt: new Date().toISOString(),
      };
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(payload));
        setStatus('saved');
      } catch {
        setStatus('idle');
      }
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [enabled, storageKey, value]);

  const clearDraft = useCallback(() => removeAdminDraft(draftKey), [draftKey]);

  return {
    status,
    setStatus,
    clearDraft,
  };
}
