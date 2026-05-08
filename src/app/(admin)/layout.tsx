import '../global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import PageViewTracker from '@/components/common/analytics/page-view-tracker';
import AdminSideBar from '@/components/common/layout/sidebar/admin-sidebar';
import GlobalToast from '@/components/common/ui/global-toast';
import { requireAdminRoute } from '@/features/auth/model/server-route-guard';
import MainProvider from '@/providers';

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

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { accessToken } = await requireAdminRoute();
  const initialSession = {
    accessToken,
  };

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <MainProvider initialSession={initialSession}>
        <PageViewTracker />
        <div className="isolate flex min-w-[1200px] items-start overflow-x-hidden">
          <div className="sticky top-0 z-20 shrink-0 self-start">
            <AdminSideBar />
          </div>
          <main className="w-0 min-w-0 flex-1 overflow-x-hidden p-300">
            {children}
          </main>
        </div>
        <GlobalToast />
      </MainProvider>
    </>
  );
}
