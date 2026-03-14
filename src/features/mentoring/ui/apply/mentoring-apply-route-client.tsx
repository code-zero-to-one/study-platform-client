'use client';

import { ApiError } from '@/api/client/api-error';
import { getEnabledMentoringMethods } from '@/features/mentoring/model/mentor-profile-utils';
import { getMentorPublicReadiness } from '@/features/mentoring/model/mentor-public-readiness';
import { useMentorDetailQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { MentorProfile, MentoringMethodType } from '@/types/mentoring/domain';
import MentoringApplyPage from './mentoring-apply-page';
import {
  MentorNotFoundState,
  MentorRouteErrorState,
  MentorRouteLoading,
  MentorRouteUnavailableState,
} from '../detail/mentor-route-fallback';

interface MentoringApplyRouteClientProps {
  mentorId: number;
  selectedType?: MentoringMethodType;
}

const resolveApplyPage = ({
  mentor,
  selectedType,
}: {
  mentor: MentorProfile;
  selectedType?: MentoringMethodType;
}) => {
  const publicReadiness = getMentorPublicReadiness(mentor);

  if (!publicReadiness.isApplicationReady) {
    return (
      <MentorRouteUnavailableState
        title={publicReadiness.applyUnavailableTitle}
        message={publicReadiness.applyUnavailableMessage}
        ctaHref={`/mentoring/${mentor.id}`}
        ctaLabel="상세로 돌아가기"
      />
    );
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
};

export default function MentoringApplyRouteClient({
  mentorId,
  selectedType,
}: MentoringApplyRouteClientProps) {
  const { showToast } = useToastStore();
  const mentorDetailQuery = useMentorDetailQuery(mentorId);

  if (mentorDetailQuery.isLoading) {
    return <MentorRouteLoading />;
  }

  if (mentorDetailQuery.isError) {
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
    return <MentorNotFoundState />;
  }

  return resolveApplyPage({
    mentor,
    selectedType,
  });
}
