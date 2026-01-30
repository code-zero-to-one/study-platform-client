import VotingDetailPageClient from '@/features/study/one-to-one/balance-game/ui/voting-detail-page-client';

export default async function VotingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const votingId = Number(id);

  return <VotingDetailPageClient votingId={votingId} />;
}
