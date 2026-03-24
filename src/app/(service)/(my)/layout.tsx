import { Metadata } from 'next';
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
    <div className="flex h-full">
      <Sidebar />
      <div className="flex-1 px-400 pt-400 pb-[100px] lg:px-0 lg:pt-500">
        <div className="w-full max-w-[780px] mx-auto">{children}</div>
      </div>
    </div>
  );
}
