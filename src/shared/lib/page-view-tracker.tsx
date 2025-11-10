'use client';

import { sendGTMEvent } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function PageViewTracker(): null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    sendGTMEvent({
      event: 'page_view',
      page_title: document.title || pathname,
      page_location: window.location.href,
      page_path: pathname,
    });
  }, [pathname]);

  return null;
}
