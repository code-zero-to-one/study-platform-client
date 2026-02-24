'use client';

import { isMentoringMethodType } from '@/features/mentoring/model/mentor-permission';
import { findMentorById } from '@/features/mentoring/model/use-mentor-directory';
import { useMentorDirectoryQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { getEnabledMentoringMethods } from '@/mocks/mentoring-mock-data';
import {
  MentorNotFoundState,
  MentorRouteLoading,
} from './mentor-route-fallback';
import MentoringApplyPage from './mentoring-apply-page';

interface MentoringApplyRouteClientProps {
  mentorId: number;
  selectedType?: string;
}

export default function MentoringApplyRouteClient({
  mentorId,
  selectedType,
}: MentoringApplyRouteClientProps) {
  const { mentors, hasHydrated } = useMentorDirectoryQuery();

  if (!hasHydrated) {
    return <MentorRouteLoading />;
  }

  const mentor = findMentorById(mentors, mentorId);

  if (!mentor) {
    return <MentorNotFoundState />;
  }

  const enabledMethods = getEnabledMentoringMethods(mentor);

  if (enabledMethods.length === 0) {
    return (
      <MentorNotFoundState message="현재 신청 가능한 멘토링 방식이 없습니다." />
    );
  }

  const fallbackType = enabledMethods[0];
  const resolvedType = isMentoringMethodType(selectedType)
    ? selectedType
    : fallbackType;
  const finalType = enabledMethods.includes(resolvedType)
    ? resolvedType
    : fallbackType;

  return <MentoringApplyPage mentor={mentor} selectedMethod={finalType} />;
}
