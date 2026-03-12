import { Metadata } from 'next';
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
      <div className="flex-1 px-400 pt-400 pb-[100px] lg:m-600 lg:px-0 lg:pt-0">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
