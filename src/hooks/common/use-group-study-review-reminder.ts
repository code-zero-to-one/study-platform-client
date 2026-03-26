import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import { axiosInstance } from '@/api/client/axios';
import { useAuthReady } from '@/features/auth/model/use-auth';
import { groupStudyReviewQueryKeys } from '@/hooks/queries/group-study-review-api';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';

interface UseGroupStudyReviewReminderOptions {
  /** 'GROUP_STUDY' | 'MENTOR_STUDY' — 목록 페이지 유형에 맞게 지정 */
  studyType: 'GROUP_STUDY' | 'MENTOR_STUDY';
}

const REVIEW_AVAILABLE_DAYS = 7;

export const isWithinReviewAvailableWindow = (endTime?: string) => {
  if (!endTime) return false;

  const endDate = dayjs(endTime).startOf('day');
  if (!endDate.isValid()) return false;

  const today = dayjs().startOf('day');
  const elapsedDays = today.diff(endDate, 'day');

  // 종료 후 7일 이내.
  // 음수인 경우는 아직 계획된 종료일 이전이지만, 이미 COMPLETED 상태인 경우(조기 종료 등)에도 노출해야 하므로
  // 호출부에서 status === 'COMPLETED'를 함께 확인하도록 하고, 여기서는 상한선만 체크한다.
  return elapsedDays <= REVIEW_AVAILABLE_DAYS;
};

/**
 * 그룹스터디·멘토스터디 목록 페이지에서 미작성 후기 모달을 자동으로 트리거하는 훅.
 *
 * useQueries로 PARTICIPANT 스터디 전체를 병렬 체크:
 * - 첫 번째 스터디만 확인하다 이미 작성된 경우 나머지를 건너뛰는 문제 해결
 */
export function useGroupStudyReviewReminder({
  studyType,
}: UseGroupStudyReviewReminderOptions) {
  const { memberId } = useAuthReady();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const hasAutoOpenedRef = useRef(false);

  const { data: memberStudies } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType,
    studyStatus: 'COMPLETED',
    completedPage: 1,
    completedPageSize: 10,
  });

  // 리더(LEADER)는 평가(evaluation)를 쓰므로 스터디원(PARTICIPANT)만 대상
  const participantStudies =
    memberStudies?.completed?.content?.filter(
      (study) => study.studyRole === 'PARTICIPANT',
    ) ?? [];

  // 종료 후 7일 이내인 스터디만 후기 대상
  const reviewTargetStudies = participantStudies.filter((study) =>
    isWithinReviewAvailableWindow(study.endTime),
  );

  // 모든 PARTICIPANT 스터디의 리뷰 작성 여부를 병렬로 조회
  const reviewWrittenResults = useQueries({
    queries: reviewTargetStudies.map((study) => ({
      queryKey: groupStudyReviewQueryKeys.written(study.studyId),
      queryFn: async () => {
        const { data } = await axiosInstance.get<{ content: boolean }>(
          `/group-studies/${study.studyId}/reviews/written`,
        );

        return data.content;
      },
      enabled: !!study.studyId,
      staleTime: 60 * 1000,
    })),
  });

  // 리뷰 미작성(false)인 첫 번째 스터디 탐색
  const pendingIndex = reviewWrittenResults.findIndex(
    (result) => result.data === false,
  );
  const pendingStudy =
    pendingIndex >= 0 ? reviewTargetStudies[pendingIndex] : undefined;

  const allLoaded =
    reviewTargetStudies.length > 0 &&
    reviewWrittenResults.every(
      (r) => r.status === 'success' || r.status === 'error',
    );

  useEffect(() => {
    if (pendingStudy && allLoaded && !hasAutoOpenedRef.current) {
      hasAutoOpenedRef.current = true;
      setShowReviewModal(true);
    }
  }, [pendingStudy?.studyId, allLoaded, pendingStudy]);

  const reviewDetailInfo = pendingStudy
    ? { title: pendingStudy.title }
    : undefined;

  const reviewBasicInfo = pendingStudy
    ? {
        startDate: dayjs(pendingStudy.startTime).format('YYYY.MM.DD'),
        endDate: dayjs(pendingStudy.endTime).format('YYYY.MM.DD'),
      }
    : undefined;

  return {
    showReviewModal,
    setShowReviewModal,
    showCompletionModal,
    setShowCompletionModal,
    reviewStudyId: pendingStudy?.studyId,
    reviewDetailInfo,
    reviewBasicInfo,
  };
}
