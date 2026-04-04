import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { normalizeCommunityPageParam } from '@/features/community/model/community-route';
import CommunityWritePageClient from '@/features/community/ui/pages/community-write-page-client';

interface CommunityEditPageProps {
  params: Promise<{ postId: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}

const parsePostId = (rawPostId: string) => {
  const normalizedPostId = Number(rawPostId);

  return Number.isInteger(normalizedPostId) && normalizedPostId > 0
    ? normalizedPostId
    : undefined;
};

export const metadata: Metadata = {
  title: 'Edit Community Post | ZERO-ONE',
  description: 'Edit your ZERO-ONE community post.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CommunityEditPage({
  params,
  searchParams,
}: CommunityEditPageProps) {
  const { postId: rawPostId } = await params;
  const { page } = await searchParams;
  const normalizedPostId = parsePostId(rawPostId);

  if (!normalizedPostId) {
    notFound();
  }

  return (
    <CommunityWritePageClient
      mode="edit"
      postId={normalizedPostId}
      returnPage={normalizeCommunityPageParam(page)}
    />
  );
}
