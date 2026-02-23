'use client';

import MentoringApplyPageView from '@/components/mentoring/mentoring-apply-page-view';
import { useMentoringApplyController } from '@/features/mentoring/model/use-mentoring-apply-controller';
import {
  type MentorProfile,
  type MentoringMethodType,
} from '@/mocks/mentoring-mock-data';

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
