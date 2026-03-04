'use client';

import { ApiError } from '@/api/client/api-error';
import {
  useMentorDetailQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/use-mentor-directory-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import MentorDetailPage from './mentor-detail-page';
import {
  MentorNotFoundState,
  MentorRouteErrorState,
  MentorRouteLoading,
} from './mentor-route-fallback';

interface MentorDetailRouteClientProps {
  mentorId: number;
}

export default function MentorDetailRouteClient({
  mentorId,
}: MentorDetailRouteClientProps) {
  const { isHydrated, isAuthenticated, data } = useAuthReady();
  const { showToast } = useToastStore();
  const mentorDetailQuery = useMentorDetailQuery(mentorId, isHydrated);
  const canCheckOwnMentorProfile =
    isAuthenticated &&
    (data?.roleIds?.includes('ROLE_MENTOR') ||
      data?.roleIds?.includes('ROLE_ADMIN'));
  const myMentorSettingsQuery = useMyMentorSettingsQuery(
    isHydrated && canCheckOwnMentorProfile,
  );

  if (!isHydrated) {
    return <MentorRouteLoading />;
  }

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
              '멘토 정보를 다시 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
              'error',
            );
          });
        }}
      />
    );
  }

  const mentor = mentorDetailQuery.data;
  const myMentorId =
    myMentorSettingsQuery.data?.kind === 'found'
      ? myMentorSettingsQuery.data.mentorId
      : undefined;
  const shouldShowSettingsEditButton =
    myMentorSettingsQuery.isSuccess && myMentorId === mentorId;

  if (!mentor) {
    return (
      <MentorRouteErrorState
        message="멘토 상세 응답 계약이 올바르지 않습니다."
        onRetry={() => {
          mentorDetailQuery.refetch({ throwOnError: true }).catch(() => {
            showToast(
              '멘토 정보를 다시 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
              'error',
            );
          });
        }}
      />
    );
  }

  return (
    <MentorDetailPage
      mentor={mentor}
      showSettingsEditButton={shouldShowSettingsEditButton}
    />
  );
}
