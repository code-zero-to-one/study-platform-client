import { Metadata } from 'next';
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
      <div className="m-600 flex-1 pb-[100px]">
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}
