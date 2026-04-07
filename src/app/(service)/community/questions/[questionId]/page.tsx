import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeCommunityPageParam } from '@/features/community/model/community-route';
import CommunityQnaDetailPageClient from '@/features/community/ui/pages/community-qna-detail-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface CommunityQuestionDetailPageProps {
  params: Promise<{ questionId: string }>;
  searchParams: Promise<{
    page?: string | string[];
    answerPage?: string | string[];
    commentPage?: string | string[];
  }>;
}

const parseQuestionId = (rawQuestionId: string) => {
  const normalizedQuestionId = Number(rawQuestionId);

  return Number.isInteger(normalizedQuestionId) && normalizedQuestionId > 0
    ? normalizedQuestionId
    : undefined;
};

export async function generateMetadata({
  params,
}: CommunityQuestionDetailPageProps): Promise<Metadata> {
  const { questionId: rawQuestionId } = await params;
  const normalizedQuestionId = parseQuestionId(rawQuestionId);

  if (!normalizedQuestionId) {
    return {
      title: '페이지를 찾을 수 없음',
      robots: { index: false, follow: false },
    };
  }

  return generateSEOMetadata({
    title: '커뮤니티 질문 | ZERO-ONE',
    description: 'ZERO-ONE 커뮤니티 질문 상세 페이지입니다.',
    path: `/community/questions/${normalizedQuestionId}`,
    keywords: ['ZERO-ONE 커뮤니티', '질문답변', '개발자 질문'],
    canonicalUrl: `https://www.zeroone.it.kr/community/questions/${normalizedQuestionId}`,
  });
}

export default async function CommunityQuestionDetailPage({
  params,
  searchParams,
}: CommunityQuestionDetailPageProps) {
  const { questionId: rawQuestionId } = await params;
  const { page, answerPage, commentPage } = await searchParams;
  const normalizedQuestionId = parseQuestionId(rawQuestionId);

  if (!normalizedQuestionId) {
    notFound();
  }

  return (
    <CommunityQnaDetailPageClient
      questionId={normalizedQuestionId}
      returnPage={normalizeCommunityPageParam(page)}
      initialAnswerPage={normalizeCommunityPageParam(answerPage)}
      initialCommentPage={normalizeCommunityPageParam(commentPage)}
    />
  );
}
