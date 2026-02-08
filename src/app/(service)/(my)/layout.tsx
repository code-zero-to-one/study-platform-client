import { Metadata } from 'next';
import GlobalToast from '@/components/ui/global-toast';
import Sidebar from '@/widgets/my-page/sidebar';

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
      <GlobalToast />
      <Sidebar />
      <div className="m-auto pt-500 pb-[100px]">
        <div className="w-[780px]">{children}</div>
      </div>
    </div>
  );
}
