import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  normalizeCommunityBoardParam,
  normalizeCommunityPageParam,
} from '@/features/community/model/community-route';
import CommunityDetailPageClient from '@/features/community/ui/pages/community-detail-page-client';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

interface CommunityDetailPageProps {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{
    page?: string | string[];
    board?: string | string[];
  }>;
}

const parsePostId = (rawPostId: string) => {
  const normalizedPostId = Number(rawPostId);

  return Number.isInteger(normalizedPostId) && normalizedPostId > 0
    ? normalizedPostId
    : undefined;
};

export async function generateMetadata({
  params,
}: CommunityDetailPageProps): Promise<Metadata> {
  const { postId: rawPostId } = await params;
  const normalizedPostId = parsePostId(rawPostId);

  if (!normalizedPostId) {
    return {
      title: '페이지를 찾을 수 없음',
      robots: { index: false, follow: false },
    };
  }

  return generateSEOMetadata({
    title: '커뮤니티 글 | ZERO-ONE',
    description: 'ZERO-ONE 커뮤니티 글 상세 페이지입니다.',
    path: `/community/${normalizedPostId}`,
    keywords: ['ZERO-ONE 커뮤니티', '개발자 커뮤니티', '디스코드 커뮤니티'],
    canonicalUrl: `https://www.zeroone.it.kr/community/${normalizedPostId}`,
  });
}

export default async function CommunityDetailPage({
  params,
  searchParams,
}: CommunityDetailPageProps) {
  const { postId: rawPostId } = await params;
  const { page, board } = await searchParams;
  const normalizedPostId = parsePostId(rawPostId);

  if (!normalizedPostId) {
    notFound();
  }

  return (
    <CommunityDetailPageClient
      postId={normalizedPostId}
      returnPage={normalizeCommunityPageParam(page)}
      returnBoard={normalizeCommunityBoardParam(board)}
    />
  );
}
