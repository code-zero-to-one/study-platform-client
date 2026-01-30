import VotingDetailPageClient from '@/components/insights/weekly/voting-detail-page-client';

export default function VotingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const votingId = Number(params.id);

  return <VotingDetailPageClient votingId={votingId} />;
}
