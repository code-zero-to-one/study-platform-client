import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import ClarityInit from '@/components/common/analytics/clarity-init';
import PageViewTracker from '@/components/common/analytics/page-view-tracker';
import Header from '@/components/common/layout/home-header';
import MainProvider from '@/providers';
import { getOrganizationSchema, getWebsiteSchema } from '@/utils/seo';
import { getServerCookie } from '@/utils/server-cookie';

export const metadata: Metadata = {
  title: 'ZERO-ONE - 1:1 기상 스터디 플랫폼',
  description:
    '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼. 현직 멘토와 함께 성장하세요.',
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
    description: '매일 아침을 함께 시작하는 1:1 기상 스터디 플랫폼',
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

const pretendard = localFont({
  src: '../../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export default async function LandingPageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAccessToken = await getServerCookie('accessToken');
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();

  return (
    <html lang="ko">
      <head>
        {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        {/* Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
        {/* Additional Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={clsx(pretendard.className, 'h-screen w-screen')}>
        <MainProvider initialAccessToken={initialAccessToken ?? undefined}>
          <ClarityInit projectId={CLARITY_PROJECT_ID} />
          <PageViewTracker />
          <div className="w-full overflow-auto">
            {/** 1400 + 48*2 패딩 양옆 48로 임의적용 */}
            <div className="m-auto flex min-w-[1496px] flex-1 flex-col items-center">
              <Header />
              <main className="w-full">{children}</main>
            </div>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
