import { Metadata } from 'next';
import LandingContent from '@/components/pages/landing/landing-content';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'ZERO-ONE - 바이브코더 X 개발자 성장 루프',
  description:
    'AI로 해결이 어려운 문제는 바이브코더의 답변으로. 개발자는 활동하면 돈이 되는 실전 커뮤니티/스터디 플랫폼입니다.',
  path: '/',
  ogImage: 'https://www.zeroone.it.kr/images/og-image.png',
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
  canonicalUrl: 'https://www.zeroone.it.kr/',
});

export default async function Landing() {
  return <LandingContent />;
}
