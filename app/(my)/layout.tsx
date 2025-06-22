import { Metadata } from 'next';
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
    <div className="flex">
      <Sidebar />
      <div className="w-full px-[150px] pt-[var(--spacing-500)] pb-[100px]">
        {children}
      </div>
    </div>
  );
}
