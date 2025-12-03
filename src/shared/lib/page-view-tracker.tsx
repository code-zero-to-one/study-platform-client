'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { trackAttribution, getAttributionParams } from './attribution-tracker';
import { useAmplitude } from 'react-amplitude-provider/dist/use-amplitude';

export default function PageViewTracker(): null {
  const pathname = usePathname();
  const { trackPageView } = useAmplitude();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 유입경로 추적 (첫 방문 시 저장, 이후 방문 시 업데이트)
    trackAttribution();

    // Attribution 파라미터 가져오기
    const attributionParams = getAttributionParams();

    sendGTMEvent({
      event: 'page_view',
      page_title: document.title || pathname,
      page_location: window.location.href,
      page_path: pathname,
      ...attributionParams,
    });
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
