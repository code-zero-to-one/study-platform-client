'use client';

import { type ReactNode } from 'react';
import StartStudyButton from '@/components/home/start-study-button';
import TabNavigation from '@/components/home/tab-navigation';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import GlobalToast from '@/components/common/ui/global-toast';
import Banner from '@/components/home/banner';
import FeedbackLink from '@/components/home/feedback-link';

interface HomePageClientProps {
  activeTab: HomeTab;
  content: ReactNode;
}

export default function HomePageClient({
  activeTab,
  content,
}: HomePageClientProps) {
  return (
    <div className="mx-auto flex w-[1496px] flex-col gap-500 px-600 py-600">
      <GlobalToast />
      <Banner />
      <FeedbackLink />
      <StartStudyButton />
      <TabNavigation activeTab={activeTab} />
      {content}
      <div className="h-[400px]" aria-hidden />
    </div>
  );
}
