'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';
import type { ReactElement } from 'react';

declare global {
  interface Window {
    __clarityInitialized?: boolean;
  }
}

interface ClarityInitProps {
  projectId?: string;
}

export default function ClarityInit({
  projectId,
}: ClarityInitProps): ReactElement {
  useEffect(() => {
    if (!projectId || typeof window === 'undefined') return;
    if (window.__clarityInitialized) return;

    Clarity.init(projectId);
    window.__clarityInitialized = true;
  }, [projectId]);

  return <></>;
}
