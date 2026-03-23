import { Metadata } from 'next';
import CommunityPageClient from '@/features/community/ui/pages/community-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'ZERO-ONE 커뮤니티',
  description:
    '질문답변, 자유 글, 자랑거리, IT 지식 글을 중심으로 구성한 ZERO-ONE 커뮤니티 페이지입니다.',
  path: '/community',
  keywords: [
    '개발자 커뮤니티',
    '질문답변',
    '자유 글',
    '자랑거리',
    'IT 지식',
    '디스코드 커뮤니티',
  ],
  canonicalUrl: 'https://www.zeroone.it.kr/community',
});

export default function CommunityPage() {
  return <CommunityPageClient />;
}
