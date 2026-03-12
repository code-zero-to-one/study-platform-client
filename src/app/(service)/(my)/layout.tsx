import { Metadata } from 'next';
import MyPageContentLayout from '@/components/common/layout/sidebar/my-page-content-layout';
import MyPageMobileNav from '@/components/common/layout/sidebar/my-page-mobile-nav';
import Sidebar from '@/components/common/layout/sidebar/my-page-sidebar';
import { requireAuthenticatedMemberRoute } from '@/features/auth/model/server-route-guard';

export const metadata: Metadata = {
  title: '마이페이지',
  description: 'ZERO-ONE 마이페이지',
};

export default async function MyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAuthenticatedMemberRoute();

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* 모바일 상단 탭 네비게이션 */}
      <MyPageMobileNav />
      {/* 데스크톱 사이드바 */}
      <Sidebar />
      <MyPageContentLayout>{children}</MyPageContentLayout>
    </div>
  );
}
