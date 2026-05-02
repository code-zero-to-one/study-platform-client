import { Metadata } from 'next';
import MyPageMobileNav from '@/components/common/layout/sidebar/my-page-mobile-nav';
import Sidebar from '@/components/common/layout/sidebar/my-page-sidebar';

export const metadata: Metadata = {
  title: '마이페이지',
  description: 'ZERO-ONE 마이페이지',
};

// prototype 한정: 비로그인 상태에서도 마이페이지 데모를 볼 수 있도록 인증 가드 우회.
// 정식 머지 전에는 requireAuthenticatedMemberRoute() 복구 필요.
export default async function MyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* 모바일 상단 탭 네비게이션 */}
      <MyPageMobileNav />
      {/* 데스크톱 사이드바 */}
      <Sidebar />
      <div className="flex-1 px-400 pt-400 pb-[100px] lg:px-0 lg:pt-500">
        <div className="w-full max-w-[780px] mx-auto">{children}</div>
      </div>
    </div>
  );
}
