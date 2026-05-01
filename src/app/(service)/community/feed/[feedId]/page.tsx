import type { Metadata } from 'next';
import { FEED_ITEMS } from '@/components/pages/class/_data/feed-data';
import { CommunityFeedDetailPage } from '@/components/pages/community/_components/community-feed-detail-page';

interface PageProps {
  params: Promise<{ feedId: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { feedId } = await params;
  const item = FEED_ITEMS.find((it) => String(it.id) === feedId);
  if (!item) {
    return {
      title: '빌더 피드 | ZERO-ONE 커뮤니티',
    };
  }
  return {
    title: `${item.title} | 빌더 피드`,
    description: item.motiv,
  };
}

export default async function Page({ params }: PageProps) {
  const { feedId } = await params;
  return <CommunityFeedDetailPage feedId={Number(feedId)} />;
}
