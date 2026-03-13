'use client';

import { useEffect } from 'react';
import { initClientSentry } from '@/config/sentry-instrumentation-client';

export default function SentryInit(): null {
  useEffect(() => {
    // 클라이언트 사이드에서만 Sentry 초기화
    initClientSentry();
  }, []);

  return null;
}

