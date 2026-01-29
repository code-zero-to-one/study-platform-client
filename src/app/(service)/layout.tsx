import '../global.css';

import Clarity from '@microsoft/clarity';
import { GoogleTagManager } from '@next/third-parties/google';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import MainProvider from '@/providers';
import Header from '@/widgets/home/header';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
  icons: {
    icon: '/favicon.ico',
  },
};

const pretendard = localFont({
  src: '../../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (typeof window !== 'undefined' && CLARITY_PROJECT_ID) {
    Clarity.init(CLARITY_PROJECT_ID);
  }

  return (
    <html lang="ko">
      <head>{GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}</head>
      <body className={clsx(pretendard.className, 'h-screen w-screen')}>
        <MainProvider>
          <PageViewTracker />
          <div className="flex h-screen w-full flex-col overflow-hidden">
            <Header />
            <main className="flex-1 w-full overflow-auto">{children}</main>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
