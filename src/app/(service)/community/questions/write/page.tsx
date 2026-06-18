import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import {
  buildCommunityWriteHref,
  normalizeCommunityPageParam,
} from '@/features/community/model/community-route';
import { COMMUNITY_BOARD } from '@/types/community/domain';

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
  redirect(
    buildCommunityWriteHref(
      normalizeCommunityPageParam(page),
      COMMUNITY_BOARD.QNA,
    ),
  );
}
