import VotingDetailPageClient from '@/features/balance-game/ui/voting-detail-page-client';

export default function VotingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const votingId = Number(params.id);

  return <VotingDetailPageClient votingId={votingId} />;
}
