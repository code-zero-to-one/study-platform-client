import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeCommunityPageParam } from '@/features/community/model/community-route';
import CommunityQnaQuestionWritePageClient from '@/features/community/ui/pages/community-qna-question-write-page-client';

interface CommunityQuestionEditPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

const parseQuestionId = (rawQuestionId: string) => {
  const normalizedQuestionId = Number(rawQuestionId);

  return Number.isInteger(normalizedQuestionId) && normalizedQuestionId > 0
    ? normalizedQuestionId
    : undefined;
};

export const metadata: Metadata = {
  title: '커뮤니티 질문 수정 | ZERO-ONE',
  description: 'ZERO-ONE 커뮤니티 질문 수정 페이지입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CommunityQuestionEditPage({
  params,
  searchParams,
}: CommunityQuestionEditPageProps) {
  const { questionId: rawQuestionId } = await params;
  const { page } = await searchParams;
  const normalizedQuestionId = parseQuestionId(rawQuestionId);

  if (!normalizedQuestionId) {
    notFound();
  }

  return (
    <CommunityQnaQuestionWritePageClient
      mode="edit"
      questionId={normalizedQuestionId}
      returnPage={normalizeCommunityPageParam(page)}
    />
  );
}
