'use client';

import dynamic from 'next/dynamic';
import { useState, type ReactNode } from 'react';
import GlobalToast from '@/components/common/ui/global-toast';
import StudyReviewModal from '@/components/group-study/modals/study-review-modal';
import Banner from '@/components/home/banner';
import FeedbackLink from '@/components/home/feedback-link';
import StartStudyButton from '@/components/home/start-study-button';
import TabNavigation from '@/components/home/tab-navigation';
import { useReviewReminder } from '@/hooks/common/use-reminder-review';
import type { HomeTab } from '@/utils/home-page-search-params';

const StudyCompletionModal = dynamic(
  () => import('@/components/group-study/modals/study-completion-modal'),
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
    <div className="mx-auto flex w-full max-w-1496 flex-col gap-400 px-300 py-400 md:gap-500 md:px-600 md:py-600">
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
