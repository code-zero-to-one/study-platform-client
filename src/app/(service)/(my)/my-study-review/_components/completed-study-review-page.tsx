'use client';

import { useQueries } from '@tanstack/react-query';
import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { axiosInstance } from '@/api/client/axios';
import type {
  GroupStudyBasicInfoResponseDto,
  GroupStudyDetailInfoResponseDto,
} from '@/api/openapi';
import GroupStudyReviewModal from '@/components/common/modals/group-study-review-modal';
import Pagination from '@/components/common/ui/pagination';
import { useAuthReady } from '@/hooks/common/use-auth';
import { groupStudyReviewQueryKeys } from '@/hooks/queries/group-study-review-api';
import { useMemberStudyListQuery } from '@/hooks/queries/use-member-study-list-query';
import { useToastStore } from '@/stores/use-toast-store';
import type { MemberStudyItem } from '@/types/api/group-study.types';
import StudyReviewTabNav from './study-review-tab-nav';
import MemberStudyCard from '../group/_components/member-study-card';

const StudyCompletionModal = dynamic(
  () => import('@/components/common/modals/study-completion-modal'),
  { ssr: false },
);

const StudyReviewModal = dynamic(
  () => import('@/components/common/modals/study-review-modal'),
  { ssr: false },
);

interface CompletedStudyReviewPageProps {
  basePath: string;
  studyType: 'GROUP_STUDY' | 'PREMIUM_STUDY' | 'ONE_ON_ONE_STUDY';
  studyTypeName: string;
}

interface StudyRoleSectionProps {
  title: string;
  studies: MemberStudyItem[];
  basePath: string;
  emptyMessage: string;
  onMemberClick?: (study: MemberStudyItem) => void;
}

function StudyRoleSection({
  title,
  studies,
  basePath,
  emptyMessage,
  onMemberClick,
}: StudyRoleSectionProps) {
  return (
    <section className="flex flex-col gap-200">
      <div className="flex flex-col gap-50">
        <div className="flex items-center gap-100">
          <h2 className="font-designer-20b text-text-default">{title}</h2>
        </div>
      </div>

      {studies.length > 0 ? (
        <ul className="grid grid-cols-1 gap-300 sm:grid-cols-2 lg:grid-cols-3">
          {studies.map((study, index) => (
            <MemberStudyCard
              key={study.studyId ?? index}
              study={study}
              basePath={basePath}
              onMemberClick={onMemberClick}
            />
          ))}
        </ul>
      ) : (
        <div className="font-designer-14r text-text-subtle flex h-200 items-center justify-center rounded-100 border border-border-subtle text-center">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}

export default function CompletedStudyReviewPage({
  basePath,
  studyType,
  studyTypeName,
}: CompletedStudyReviewPageProps) {
  const [page, setPage] = useState(1);
  const [reviewStudy, setReviewStudy] = useState<MemberStudyItem | null>(null);
  const [submittedStudyIds, setSubmittedStudyIds] = useState<number[]>([]);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const { memberId } = useAuthReady();
  const showToast = useToastStore((state) => state.showToast);

  const { data: completedStudyResponse } = useMemberStudyListQuery({
    memberId: memberId ?? 0,
    studyType,
    studyStatus: 'COMPLETED',
    completedPage: page,
    completedPageSize: 6,
  });

  const completedStudies = useMemo(
    () => completedStudyResponse?.completed.content ?? [],
    [completedStudyResponse?.completed.content],
  );
  const participantStudies = completedStudies.filter(
    (study) => study.studyRole === 'PARTICIPANT',
  );
  const leaderStudies = completedStudies.filter(
    (study) => study.studyRole === 'LEADER',
  );

  const writtenResults = useQueries({
    queries: participantStudies.map((study) => ({
      queryKey:
        studyType === 'ONE_ON_ONE_STUDY'
          ? ['one-to-one', 'written', study.studyId]
          : groupStudyReviewQueryKeys.written(study.studyId),
      queryFn: async () => {
        const url =
          studyType === 'ONE_ON_ONE_STUDY'
            ? `/study-spaces/${study.studyId}/reviews/written`
            : `/group-studies/${study.studyId}/reviews/written`;
        const { data } = await axiosInstance.get<{ content: boolean }>(url);

        return data.content;
      },
      enabled: !!study.studyId,
      staleTime: 60_000,
    })),
  });

  const reviewWrittenByStudyId = new Map<number, boolean | undefined>();

  participantStudies.forEach((study, index) => {
    const writtenResult = writtenResults[index];
    const isRecentlySubmitted = submittedStudyIds.includes(study.studyId);

    reviewWrittenByStudyId.set(
      study.studyId,
      isRecentlySubmitted || writtenResult?.data === true
        ? true
        : writtenResult?.data,
    );
  });

  const handleParticipantStudyClick = (study: MemberStudyItem) => {
    const reviewWritten = reviewWrittenByStudyId.get(study.studyId);

    if (reviewWritten === true) {
      showToast('이미 후기를 작성한 스터디입니다.', 'info');

      return;
    }

    if (reviewWritten === undefined) {
      showToast(
        '후기 작성 가능 여부를 확인하는 중입니다. 잠시 후 다시 시도해주세요.',
        'info',
      );

      return;
    }

    setReviewStudy(study);
  };

  const activeReviewStudyId = reviewStudy?.studyId;
  const emptyParticipatedMessage = `아직 참여한 ${studyTypeName}가 없습니다.`;
  const emptyLedMessage = `아직 개설한 ${studyTypeName}가 없습니다.`;

  return (
    <div className="flex flex-col gap-400">
      <StudyReviewTabNav />

      {completedStudies.length === 0 ? (
        <div className="font-designer-14r text-text-subtle flex h-200 items-center justify-center text-center">
          {emptyParticipatedMessage}
        </div>
      ) : (
        <>
          <StudyRoleSection
            title="참여한 스터디"
            studies={participantStudies}
            basePath={basePath}
            emptyMessage={emptyParticipatedMessage}
            onMemberClick={handleParticipantStudyClick}
          />

          <StudyRoleSection
            title="종료된 스터디"
            studies={leaderStudies}
            basePath={basePath}
            emptyMessage={emptyLedMessage}
          />

          <Pagination
            page={page}
            onChangePage={setPage}
            totalPages={completedStudyResponse?.completed.totalPages ?? 1}
          />
        </>
      )}

      {activeReviewStudyId !== undefined &&
        reviewStudy &&
        studyType !== 'ONE_ON_ONE_STUDY' && (
          <GroupStudyReviewModal
            open={!!reviewStudy}
            onOpenChange={(open) => {
              if (!open) {
                setReviewStudy(null);
              }
            }}
            groupStudyId={activeReviewStudyId}
            detailInfo={
              { title: reviewStudy.title } as GroupStudyDetailInfoResponseDto
            }
            basicInfo={
              {
                startDate: dayjs(reviewStudy.startTime).format('YYYY.MM.DD'),
                endDate: dayjs(reviewStudy.endTime).format('YYYY.MM.DD'),
              } as GroupStudyBasicInfoResponseDto
            }
            onSubmitSuccess={() => {
              setSubmittedStudyIds((prev) =>
                prev.includes(activeReviewStudyId)
                  ? prev
                  : [...prev, activeReviewStudyId],
              );
              setTimeout(() => setShowCompletionModal(true), 300);
            }}
          />
        )}

      {activeReviewStudyId !== undefined &&
        reviewStudy &&
        studyType === 'ONE_ON_ONE_STUDY' && (
          <StudyReviewModal
            open={!!reviewStudy}
            onOpenChange={(open) => {
              if (!open) {
                setReviewStudy(null);
              }
            }}
            targetStudySpaceId={activeReviewStudyId}
            onSubmitSuccess={() => {
              setSubmittedStudyIds((prev) =>
                prev.includes(activeReviewStudyId)
                  ? prev
                  : [...prev, activeReviewStudyId],
              );
              setTimeout(() => setShowCompletionModal(true), 300);
            }}
          />
        )}

      <StudyCompletionModal
        open={showCompletionModal}
        onOpenChange={setShowCompletionModal}
      />
    </div>
  );
}
