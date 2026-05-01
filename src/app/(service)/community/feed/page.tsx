import type { Metadata } from 'next';
import { CommunityFeedPage } from '@/components/pages/community/_components/community-feed-page';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '빌더 피드 - ZERO-ONE 커뮤니티',
  description:
    '모든 코스의 빌더들이 만든 작업물 모음. 피드를 둘러보고 영감을 받아보세요.',
  path: '/community/feed',
  keywords: ['빌더 피드', '결과물', '바이브코딩', 'ZERO-ONE 커뮤니티'],
  canonicalUrl: 'https://www.zeroone.it.kr/community/feed',
});

export default function Page() {
  return <CommunityFeedPage />;
}
