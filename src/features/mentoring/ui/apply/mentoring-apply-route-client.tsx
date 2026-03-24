'use client';

import { ApiError } from '@/api/client/api-error';
import {
  getMentorPublicReadiness,
  MENTOR_APPLY_UNSUPPORTED_MESSAGE,
} from '@/features/mentoring/model/mentor-public-readiness';
import { useMentorDetailQuery } from '@/features/mentoring/model/use-mentor-directory-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { MentoringMethodType } from '@/types/mentoring/domain';
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

export default function MentoringApplyRouteClient({
  mentorId,
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

  return (
    <MentorRouteUnavailableState
      title={MENTOR_APPLY_UNSUPPORTED_MESSAGE}
      message="멘토 상세에서 공개 상태만 확인할 수 있으며, 신청 접수는 추후 지원될 예정입니다."
      ctaHref={`/mentoring/${mentor.id}`}
      ctaLabel="상세로 돌아가기"
    />
  );
}
