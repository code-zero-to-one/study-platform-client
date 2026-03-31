import type { Metadata } from 'next';
import { normalizeCommunityPageParam } from '@/features/community/model/community-route';
import CommunityQnaQuestionWritePageClient from '@/features/community/ui/pages/community-qna-question-write-page-client';

interface CommunityQuestionWritePageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export const metadata: Metadata = {
  title: '커뮤니티 질문 작성 | ZERO-ONE',
  description: 'ZERO-ONE 커뮤니티 질문 작성 페이지입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CommunityQuestionWritePage({
  searchParams,
}: CommunityQuestionWritePageProps) {
  const { page } = await searchParams;

  return (
    <CommunityQnaQuestionWritePageClient
      mode="create"
      returnPage={normalizeCommunityPageParam(page)}
    />
  );
}
