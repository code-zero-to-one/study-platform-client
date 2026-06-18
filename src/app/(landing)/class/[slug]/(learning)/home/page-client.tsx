'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { RoadmapTab } from '@/components/class/roadmap-tab';
import { FeedTab } from '../_components/feed-tab';
import { QnaTab } from '../_components/qna-tab';

function HomeTabSwitch() {
  const { slug } = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'roadmap';

  if (tab === 'feed') return <FeedTab />;
  if (tab === 'qna') return <QnaTab />;
  return <RoadmapTab slug={slug} />;
}

export default function LearningHomePage() {
  return (
    <Suspense>
      <HomeTabSwitch />
    </Suspense>
  );
}
