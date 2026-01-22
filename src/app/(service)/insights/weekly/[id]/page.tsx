'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import VotingDetailView from '@/components/voting/voting-detail-view';

export default function VotingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const votingId = Number(params.id);

  return (
    <VotingDetailView 
      votingId={votingId} 
      onBack={() => router.back()} 
    />
  );
}
