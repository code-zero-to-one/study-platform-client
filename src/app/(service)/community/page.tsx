import type { Metadata } from 'next';
import { CommunityHomePage } from '@/components/pages/community/_components/community-home-page';

export const metadata: Metadata = {
  title: '커뮤니티 | ZERO-ONE',
  description:
    '제로원 커뮤니티 — 빌더 피드, 질문답변, 테크 한입, 자유게시판을 한눈에.',
};

export default function Page() {
  return <CommunityHomePage />;
}
