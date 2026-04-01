import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import React from 'react';
import ClarityInit from '@/components/common/analytics/clarity-init';
import PageViewTracker from '@/components/common/analytics/page-view-tracker';
import Header from '@/components/common/layout/home-header';
import SentryInit from '@/components/common/sentry-init';
import FloatingInquiryButton from '@/components/common/ui/floating-inquiry-button';
import GlobalToast from '@/components/common/ui/global-toast';
import { createAuthHydrationSession } from '@/features/auth/model/auth-hydration-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';
import MainProvider from '@/providers';

export const metadata: Metadata = {
  title: 'ZERO-ONE',
  description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼, ZERO-ONE',
  icons: {
    icon: '/favicon.ico',
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default async function ServiceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await readServerAuthSession();
  const initialHydrationSession = createAuthHydrationSession(initialSession);

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <SentryInit />
      <MainProvider initialSession={initialHydrationSession}>
        <GlobalToast />
        <ClarityInit projectId={CLARITY_PROJECT_ID} />
        <PageViewTracker />
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
          <Header />
          <main className="w-full flex-1">{children}</main>
          <FloatingInquiryButton />
        </div>
      </MainProvider>
    </>
  );
}
