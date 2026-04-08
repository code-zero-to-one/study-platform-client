'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import VotingDetailView from '@/components/one-to-one/balance-game/voting/voting-detail-view';

interface VotingDetailPageClientProps {
  votingId: number;
}

export default function VotingDetailPageClient({
  votingId,
}: VotingDetailPageClientProps) {
  const router = useRouter();

  return <VotingDetailView votingId={votingId} onBack={() => router.back()} />;
}
