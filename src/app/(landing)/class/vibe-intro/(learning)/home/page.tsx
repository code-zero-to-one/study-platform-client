'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { RoadmapTab } from '@/components/pages/class/vibe-intro/roadmap-tab';
import { FeedTab } from '../_components/feed-tab';
import { QnaTab } from '../_components/qna-tab';

function HomeTabSwitch() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'roadmap';

  if (tab === 'feed') return <FeedTab />;
  if (tab === 'qna') return <QnaTab />;
  return <RoadmapTab />;
}

export default function LearningHomePage() {
  return (
    <Suspense>
      <HomeTabSwitch />
    </Suspense>
  );
}
