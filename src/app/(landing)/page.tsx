import { Metadata } from 'next';
import LandingContent from '@/components/pages/landing/landing-content';

export const metadata: Metadata = {
  title: 'ZERO-ONE | 따라만 하면 완성되는 바이브 코딩',
  description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력.',
  keywords: [
    '바이브코더',
    '개발자 커뮤니티',
    '멘토링',
    '1:1 스터디',
    '그룹 스터디',
    '유료 스터디',
    '인사이트',
    '주니어 개발자',
  ],
  alternates: { canonical: 'https://www.zeroone.it.kr' },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  openGraph: {
    type: 'website',
    url: 'https://www.zeroone.it.kr',
    title: 'ZERO-ONE | 따라만 하면 완성되는 바이브 코딩',
    description: '코딩 몰라도 OK. 따라만 하면 나도 AI 시대의 경쟁력.',
    siteName: 'ZERO-ONE',
    images: [
      {
        url: 'https://www.zeroone.it.kr/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZERO-ONE | 따라만 하면 완성되는 바이브 코딩',
      },
    ],
  },
};

export default async function Landing() {
  return <LandingContent />;
}
