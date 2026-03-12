import { Metadata } from 'next';
import MyPageContentLayout from '@/components/common/layout/sidebar/my-page-content-layout';
import Sidebar from '@/components/common/layout/sidebar/my-page-sidebar';

export const metadata: Metadata = {
  title: '마이페이지',
  description: 'ZERO-ONE 마이페이지',
};

export default function MyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <MyPageContentLayout>{children}</MyPageContentLayout>
    </div>
  );
}
