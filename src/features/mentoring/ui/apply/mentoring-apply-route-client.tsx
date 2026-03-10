'use client';

import { ApiError } from '@/api/client/api-error';
import {
  findLocalFallbackMentor,
  shouldUseLocalMentorFallback,
} from '@/features/mentoring/model/mentor-directory-local-fallback';
import { getEnabledMentoringMethods } from '@/features/mentoring/model/mentor-profile-utils';
import { useMentorDetailQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import type { MentoringMethodType } from '@/types/mentoring/domain';
import MentoringApplyPage from './mentoring-apply-page';
import {
  MentorNotFoundState,
  MentorRouteErrorState,
  MentorRouteLoading,
} from '../detail/mentor-route-fallback';

interface MentoringApplyRouteClientProps {
  mentorId: number;
  selectedType?: MentoringMethodType;
}

export default function MentoringApplyRouteClient({
  mentorId,
  selectedType,
}: MentoringApplyRouteClientProps) {
  const { showToast } = useToastStore();
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorDetailQuery = useMentorDetailQuery(mentorId);
  const fallbackMentor = findLocalFallbackMentor({
    mentorId,
    createdMentors,
  });

  if (mentorDetailQuery.isLoading) {
    return <MentorRouteLoading />;
  }

  if (mentorDetailQuery.isError) {
    if (
      fallbackMentor &&
      shouldUseLocalMentorFallback(mentorDetailQuery.error)
    ) {
      const enabledFallbackMethods = getEnabledMentoringMethods(fallbackMentor);

      if (enabledFallbackMethods.length === 0) {
        return (
          <MentorNotFoundState message="현재 신청 가능한 멘토링 방식이 없습니다." />
        );
      }

      const fallbackType = enabledFallbackMethods[0];
      const resolvedType = selectedType ?? fallbackType;
      const finalType = enabledFallbackMethods.includes(resolvedType)
        ? resolvedType
        : fallbackType;

      return (
        <MentoringApplyPage
          mentor={fallbackMentor}
          selectedMethod={finalType}
        />
      );
    }

    if (
      mentorDetailQuery.error instanceof ApiError &&
      mentorDetailQuery.error.statusCode === 404
    ) {
      return <MentorNotFoundState />;
    }

    const errorMessage =
      mentorDetailQuery.error instanceof Error
        ? mentorDetailQuery.error.message
        : undefined;

    return (
      <MentorRouteErrorState
        message={errorMessage}
        onRetry={() => {
          mentorDetailQuery.refetch({ throwOnError: true }).catch(() => {
            showToast(
              '신청 화면 데이터를 다시 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
              'error',
            );
          });
        }}
      />
    );
  }

  const mentor = mentorDetailQuery.data;

  if (!mentor) {
    if (fallbackMentor) {
      const enabledFallbackMethods = getEnabledMentoringMethods(fallbackMentor);

      if (enabledFallbackMethods.length === 0) {
        return (
          <MentorNotFoundState message="현재 신청 가능한 멘토링 방식이 없습니다." />
        );
      }

      const fallbackType = enabledFallbackMethods[0];
      const resolvedType = selectedType ?? fallbackType;
      const finalType = enabledFallbackMethods.includes(resolvedType)
        ? resolvedType
        : fallbackType;

      return (
        <MentoringApplyPage
          mentor={fallbackMentor}
          selectedMethod={finalType}
        />
      );
    }

    return <MentorNotFoundState />;
  }

  const enabledMethods = getEnabledMentoringMethods(mentor);

  if (enabledMethods.length === 0) {
    return (
      <MentorNotFoundState message="현재 신청 가능한 멘토링 방식이 없습니다." />
    );
  }

  const fallbackType = enabledMethods[0];
  const resolvedType = selectedType ?? fallbackType;
  const finalType = enabledMethods.includes(resolvedType)
    ? resolvedType
    : fallbackType;

  return <MentoringApplyPage mentor={mentor} selectedMethod={finalType} />;
}
