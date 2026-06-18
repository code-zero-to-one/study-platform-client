import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import PageViewTracker from '@/components/common/analytics/page-view-tracker';
import { Footer } from '@/components/common/layout/footer';
import Header from '@/components/common/layout/home-header';
import FloatingClassActionButtons from '@/components/common/ui/floating-class-action-buttons';
import GlobalToast from '@/components/common/ui/global-toast';
import { createAuthHydrationSession } from '@/features/auth/model/auth-hydration-session';
import { readServerAuthSession } from '@/features/auth/model/server-auth-session';
import MainProvider from '@/providers';
import { getOrganizationSchema, getWebsiteSchema } from '@/utils/seo';

export const metadata: Metadata = {
  title: 'ZERO-ONE - 1:1 기상 스터디 플랫폼',
  description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력 UP!',
  keywords: ['스터디', '기상', '멘토링', '1:1 스터디', '개발자', '면접 준비'],
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://www.zeroone.it.kr',
    siteName: 'ZERO-ONE',
    title: 'ZERO-ONE - 1:1 기상 스터디 플랫폼',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력 UP!',
    images: [
      {
        url: 'https://www.zeroone.it.kr/images/banner.png',
        width: 1200,
        height: 630,
        alt: 'ZERO-ONE',
      },
    ],
  },
  alternates: {
    canonical: 'https://www.zeroone.it.kr',
  },
};

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await readServerAuthSession();
  const initialHydrationSession = createAuthHydrationSession(initialSession);
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <MainProvider initialSession={initialHydrationSession}>
        <PageViewTracker />
        <div className="min-h-screen w-full">
          <div className="mx-auto flex min-h-screen w-full flex-col items-center">
            <Header />
            <main className="w-full flex-1">{children}</main>
          </div>
        </div>
        <Footer />
        <GlobalToast />
        <FloatingClassActionButtons />
      </MainProvider>
    </>
  );
}
