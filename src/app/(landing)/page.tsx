import { Metadata } from 'next';
import LandingContent from '@/components/landing/landing-content';

export const metadata: Metadata = {
  title: 'ZERO-ONE | 코딩 0에서 내 결과물 하나까지',
  description:
    '코딩 몰라도 OK. AI에게 시키는 법만 배우면 웹사이트도, 반복 업무 자동화도 내 손으로. 1챕터 무료로 시작하세요.',
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
    title: 'ZERO-ONE | 코딩 0에서 내 결과물 하나까지',
    description:
      '코딩 몰라도 OK. AI에게 시키는 법만 배우면 웹사이트도, 반복 업무 자동화도 내 손으로. 1챕터 무료로 시작하세요.',
    siteName: 'ZERO-ONE',
    images: [
      {
        url: 'https://www.zeroone.it.kr/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ZERO-ONE | 코딩 0에서 내 결과물 하나까지',
      },
    ],
  },
};

export default async function Landing() {
  return <LandingContent />;
}
