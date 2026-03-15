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
      <div className="m-auto pt-500 pb-[100px]">
        <div className="w-[780px]">{children}</div>
      </div>
    </div>
  );
}
