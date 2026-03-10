'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ApiError } from '@/api/client/api-error';
import { MENTOR_REGISTRATION_TOAST_MESSAGES } from '@/features/mentoring/const/mentor-registration-labels';
import {
  findLocalFallbackMentor,
  shouldUseLocalMentorFallback,
} from '@/features/mentoring/model/mentor-directory-local-fallback';
import {
  useMentorDetailQuery,
  useMyMentorSettingsQuery,
} from '@/features/mentoring/model/use-mentor-directory-query';
import { useAuthReady } from '@/hooks/common/use-auth';
import { useToastStore } from '@/stores/use-toast-store';
import { useMentorDirectoryStore } from '@/stores/useMentorDirectoryStore';
import MentorDetailPage from './mentor-detail-page';
import {
  MentorNotFoundState,
  MentorRouteErrorState,
  MentorRouteLoading,
} from './mentor-route-fallback';

interface MentorDetailRouteClientProps {
  mentorId: number;
  showSavedToast?: boolean;
}

export default function MentorDetailRouteClient({
  mentorId,
  showSavedToast = false,
}: MentorDetailRouteClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated, isAuthenticated } = useAuthReady();
  const { showToast } = useToastStore();
  const createdMentors = useMentorDirectoryStore(
    (state) => state.createdMentors,
  );
  const mentorDetailQuery = useMentorDetailQuery(mentorId, isHydrated);
  const myMentorSettingsQuery = useMyMentorSettingsQuery(
    isHydrated && isAuthenticated,
  );
  const isSavedToastShownRef = useRef(false);
  const fallbackMentor = findLocalFallbackMentor({
    mentorId,
    createdMentors,
  });

  useEffect(() => {
    if (!showSavedToast || !mentorDetailQuery.isSuccess) {
      return;
    }

    if (isSavedToastShownRef.current) {
      return;
    }

    isSavedToastShownRef.current = true;
    showToast(MENTOR_REGISTRATION_TOAST_MESSAGES.settingsSaved, 'success');
    router.replace(pathname, { scroll: false });
  }, [
    mentorDetailQuery.isSuccess,
    pathname,
    router,
    showSavedToast,
    showToast,
  ]);

  if (!isHydrated) {
    return <MentorRouteLoading />;
  }

  if (mentorDetailQuery.isLoading) {
    return <MentorRouteLoading />;
  }

  if (mentorDetailQuery.isError) {
    if (
      fallbackMentor &&
      shouldUseLocalMentorFallback(mentorDetailQuery.error)
    ) {
      return (
        <MentorDetailPage
          mentor={fallbackMentor}
          showSettingsEditButton={false}
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
    if (fallbackMentor) {
      return (
        <MentorDetailPage
          mentor={fallbackMentor}
          showSettingsEditButton={false}
        />
      );
    }

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
