'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import SubmitHomeworkModal from '@/components/common/modals/submit-homework-modal';
import Button from '@/components/common/ui/button';
import { useGetMission } from '@/hooks/queries/group-study/mission-api';
import { useUserStore } from '@/stores/useUserStore';

interface MyHomeworkStatusProps {
  missionId: number;
}

export default function MyHomeworkStatusCard({
  missionId,
}: MyHomeworkStatusProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const memberId = useUserStore((state) => state.memberId);

  const { data: mission } = useGetMission(missionId);

  const myHomework = useMemo(() => {
    if (!mission?.homeworks || !memberId) return null;

    return mission.homeworks.find((hw) => hw.submitterId === memberId) ?? null;
  }, [mission?.homeworks, memberId]);

  const handleSelectHomework = (homeworkId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('homeworkId', String(homeworkId));
    router.push(`?${params.toString()}`);
  };

  const isSubmissionOpen = mission?.status === 'IN_PROGRESS';
  const isSubmissionNotOpened = mission?.status === 'NOT_STARTED';
  const isSubmissionClosed =
    mission?.status === 'ENDED' || mission?.status === 'EVALUATION_COMPLETED';

  if (!myHomework || myHomework.homeworkStatus === 'NOT_SUBMITTED') {
    return (
      <div className="flex flex-col gap-300">
        <span className="font-designer-18b text-text-default">
          내 과제 현황
        </span>
        <div className="border-border-default rounded-100 flex flex-col items-center justify-center gap-200 border py-400">
          <span className="text-text-subtlest font-designer-14r">
            {isSubmissionOpen && '아직 과제를 제출하지 않았습니다.'}
          </span>
          <span className="text-text-subtlest font-designer-14r">
            {isSubmissionNotOpened && '아직 제출 기간이 아닙니다.'}
          </span>
          <span className="text-text-subtlest font-designer-14r">
            {isSubmissionClosed && '제출 기간이 종료되었습니다.'}
          </span>
          {isSubmissionOpen && <SubmitHomeworkModal missionId={missionId} />}
        </div>
      </div>
    );
  }

  // 제출 완료 상태
  if (myHomework.homeworkStatus === 'SUBMITTED') {
    return (
      <div className="flex flex-col gap-300">
        <span className="font-designer-18b text-text-default">
          내 과제 현황
        </span>
        <div className="border-border-default rounded-100 flex flex-col items-center justify-center gap-100 border py-400">
          <span className="text-text-default font-designer-14b">
            {myHomework.submissionTime?.split('T')[0]}일 과제를 제출
            완료하였습니다.
          </span>

          <Button
            color="outlined"
            className="mt-100"
            onClick={() =>
              myHomework.homeworkId &&
              handleSelectHomework(myHomework.homeworkId)
            }
          >
            과제 상세 보기
          </Button>
        </div>
      </div>
    );
  }

  // 평가 완료 상태
  if (
    myHomework.homeworkStatus === 'EVALUATION_COMPLETED' &&
    myHomework.evaluation
  ) {
    return (
      <div className="flex flex-col gap-300">
        <span className="font-designer-18b text-text-default">
          내 과제 현황
        </span>
        <div className="border-border-default rounded-100 flex items-center justify-between border px-400 py-300">
          <div className="flex items-center gap-300">
            <div className="border-border-default flex flex-col items-center border-r pr-300">
              <span className="text-text-brand font-designer-28b">
                {myHomework.evaluation.evaluationGradeLabel}
              </span>
              <span className="text-text-subtlest font-designer-12r">
                {myHomework.evaluation.evaluationGradeCode} (
                {myHomework.evaluation.evaluationGradeScore})
              </span>
            </div>
            <span className="text-text-default font-designer-14r">
              {myHomework.evaluation.evaluationComment}
            </span>
          </div>
          <Button
            color="outlined"
            onClick={() =>
              myHomework.homeworkId &&
              handleSelectHomework(myHomework.homeworkId)
            }
          >
            과제 상세 보기
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
