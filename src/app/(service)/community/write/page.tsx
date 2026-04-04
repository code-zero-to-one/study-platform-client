import type { Metadata } from 'next';
import {
  normalizeCommunityBoardParam,
  normalizeCommunityPageParam,
} from '@/features/community/model/community-route';
import CommunityWritePageClient from '@/features/community/ui/pages/community-write-page-client';

interface CommunityWritePageProps {
  searchParams: Promise<{
    board?: string | string[];
    page?: string | string[];
  }>;
}

export const metadata: Metadata = {
  title: '커뮤니티 글 작성 | ZERO-ONE',
  description: 'ZERO-ONE 커뮤니티 글 작성 페이지입니다.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CommunityWritePage({
  searchParams,
}: CommunityWritePageProps) {
  const { board, page } = await searchParams;

  return (
    <CommunityWritePageClient
      mode="create"
      initialBoard={normalizeCommunityBoardParam(board)}
      returnPage={normalizeCommunityPageParam(page)}
    />
  );
}
