import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '바이브 코딩 입문자 코스 | ZERO-ONE',
  description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력 UP!',
  alternates: { canonical: 'https://www.zeroone.it.kr/class' },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    title: '바이브 코딩 입문자 코스 | ZERO-ONE',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력 UP!',
    url: 'https://www.zeroone.it.kr/class',
    images: [
      {
        url: 'https://www.zeroone.it.kr/images/og-image.png',
        width: 1200,
        height: 630,
        alt: '바이브 코딩 입문자 코스 | ZERO-ONE',
      },
    ],
  },
  twitter: {
    title: '바이브 코딩 입문자 코스 | ZERO-ONE',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력 UP!',
  },
};

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
