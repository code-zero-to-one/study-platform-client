import type { Metadata } from 'next';
import { CommunityQnaPage } from '@/components/pages/community/_components/community-qna-page';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: '질문답변 - ZERO-ONE 커뮤니티',
  description:
    '모든 코스의 질문과 운영팀 답변을 한눈에 확인하세요. ZERO-ONE 커뮤니티 질문답변 게시판.',
  path: '/community/qna',
  keywords: ['질문답변', 'QnA', '바이브코딩', 'ZERO-ONE 커뮤니티'],
  canonicalUrl: 'https://www.zeroone.it.kr/community/qna',
});

export default function Page() {
  return <CommunityQnaPage />;
}
