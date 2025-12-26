import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import { clsx } from 'clsx';
import type { Metadata } from 'next';
import localFont from 'next/font/local';
import PageViewTracker from '@/components/analytics/page-view-tracker';
import MainProvider from '@/providers';
import AdminSideBar from '@/widgets/admin/ui/admin-side-bar';

export const metadata: Metadata = {
  title: '관리자 - ZERO-ONE',
  description: 'ZERO-ONE 플랫폼 관리자 영역',
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
  },
};

const pretendard = localFont({
  src: '../../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>{GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}</head>
      <body className={clsx(pretendard.className, 'h-screen w-screen')}>
        <MainProvider>
          <PageViewTracker />
          <div className="flex min-w-[1200px]">
            <AdminSideBar />

            <main className="flex-1 p-300">{children}</main>
          </div>
        </MainProvider>
      </body>
    </html>
  );
}
