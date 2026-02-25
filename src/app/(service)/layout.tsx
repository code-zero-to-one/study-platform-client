import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import ClarityInit from '@/components/analytics/clarity-init';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import MainProvider from '@/providers';
import { getServerCookie } from '@/utils/server-cookie';
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

export default async function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAccessToken = await getServerCookie('accessToken');

  return (
    <html lang="ko">
      <head>{GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}</head>
      <body className={clsx(pretendard.className, 'min-h-screen w-screen')}>
        <MainProvider initialAccessToken={initialAccessToken ?? undefined}>
          <ClarityInit projectId={CLARITY_PROJECT_ID} />
          <PageViewTracker />
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="w-full flex-1">{children}</main>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
