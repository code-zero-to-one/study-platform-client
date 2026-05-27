import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '바이브 코딩 입문자 코스 | ZERO-ONE',
  description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력.',
  openGraph: {
    title: '바이브 코딩 입문자 코스 | ZERO-ONE',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력.',
  },
  twitter: {
    title: '바이브 코딩 입문자 코스 | ZERO-ONE',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력.',
  },
};

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
