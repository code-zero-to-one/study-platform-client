'use client';

import { useMentoringApplyController } from '@/features/mentoring/model/apply/use-mentoring-apply-controller';
import MentoringApplyPageView from '@/features/mentoring/ui/apply/mentoring-apply-page-view';
import type {
  MentorProfile,
  MentoringMethodType,
} from '@/types/mentoring/domain';

interface MentoringApplyPageProps {
  mentor: MentorProfile;
  selectedMethod: MentoringMethodType;
}

export default function MentoringApplyPage({
  mentor,
  selectedMethod,
}: MentoringApplyPageProps) {
  const controller = useMentoringApplyController({
    mentor,
    selectedMethod,
  });

  return (
    <MentoringApplyPageView
      mentor={mentor}
      selectedMethod={selectedMethod}
      controller={controller}
    />
  );
}
