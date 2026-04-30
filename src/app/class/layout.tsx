import './class.css';
import type { Metadata } from 'next';
import GlobalToast from '@/components/common/ui/global-toast';
import { ClassGNB } from '@/components/pages/class/_components/class-gnb';

export const metadata: Metadata = {
  title: 'ZERO-ONE 클래스',
  description:
    '지금 가장 빠르게 만드는 사람이 되는 길 — ZERO-ONE 클래스 카탈로그',
};

export default function ClassLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-background-default text-text-default min-h-screen">
      <ClassGNB />
      <main>{children}</main>
      <GlobalToast />
    </div>
  );
}
