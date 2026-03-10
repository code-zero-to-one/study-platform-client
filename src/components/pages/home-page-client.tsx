'use client';

import { type ReactNode } from 'react';
import StudyReviewModal from '@/components/common/modals/study-review-modal';
import StartStudyButton from '@/components/home/start-study-button';
import TabNavigation from '@/components/home/tab-navigation';
import GlobalToast from '@/components/ui/global-toast';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import { useReviewReminder } from '@/hooks/common/use-reminder-review';
import Banner from '@/widgets/home/banner';
import FeedbackLink from '@/widgets/home/feedback-link';

interface HomePageClientProps {
  activeTab: HomeTab;
  content: ReactNode;
  memberId?: number;
}

export default function HomePageClient({
  activeTab,
  content,
  memberId,
}: HomePageClientProps) {
  const {
    showReviewReminder,
    setShowReviewReminder,
    applyDismissPreference,
    targetStudySpaceId,
  } = useReviewReminder(memberId);

  return (
    <div className="mx-auto flex w-[1496px] flex-col gap-500 px-600 py-600">
      <StudyReviewModal
        open={showReviewReminder}
        onOpenChange={setShowReviewReminder}
        onDismissPreferenceChange={applyDismissPreference}
        targetStudySpaceId={targetStudySpaceId}
      />
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
