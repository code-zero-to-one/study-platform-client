'use client';

import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import StudyReviewModal from '@/components/common/modals/study-review-modal';
import GlobalToast from '@/components/common/ui/global-toast';
import Banner from '@/components/home/banner';
import FeedbackLink from '@/components/home/feedback-link';
import StartStudyButton from '@/components/home/start-study-button';
import TabNavigation from '@/components/home/tab-navigation';
import type { HomeTab } from '@/features/home/model/home-page-search-params';
import { useReviewReminder } from '@/hooks/common/use-reminder-review';

const StudyCompletionModal = dynamic(
  () => import('@/components/common/modals/study-completion-modal'),
  { ssr: false },
);

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

  const [showCompletionModal, setShowCompletionModal] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-[1496px] flex-col gap-400 px-300 py-400 md:gap-500 md:px-600 md:py-600">
      <StudyReviewModal
        open={showReviewReminder}
        onOpenChange={setShowReviewReminder}
        onDismissPreferenceChange={applyDismissPreference}
        targetStudySpaceId={targetStudySpaceId}
        onSubmitSuccess={() =>
          setTimeout(() => setShowCompletionModal(true), 300)
        }
      />
      <StudyCompletionModal
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
      />
      <GlobalToast />
      <Banner />
      <FeedbackLink />
      <StartStudyButton />
      <TabNavigation activeTab={activeTab} />
      {content}
      <div className="h-200 md:h-[400px]" aria-hidden />
    </div>
  );
}
