'use client';

import type {
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  HomeworkDetailResponseDto,
} from '@/api/openapi/models';
import Button from '@/components/ui/button';
import SubmitHomeworkModal from '../modals/submit-homework-modal';

const GRADE_SCORE_CONFIG: Record<
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  { label: string; score: number; name: string }
> = {
  A_PLUS: { label: 'A+', score: 4.5, name: 'Great' },
  A: { label: 'A', score: 4.0, name: 'Good' },
  B_PLUS: { label: 'B+', score: 3.5, name: 'Nice' },
  B: { label: 'B', score: 3.0, name: 'Fine' },
  C_PLUS: { label: 'C+', score: 2.5, name: 'OK' },
  C: { label: 'C', score: 2.0, name: 'Try' },
  D_PLUS: { label: 'D+', score: 1.5, name: 'Weak' },
  D: { label: 'D', score: 1.0, name: 'Poor' },
  F: { label: 'F', score: 0, name: 'Fail' },
};

interface MyHomeworkStatusProps {
  missionId: number;
  myHomework?: HomeworkDetailResponseDto;
  isMissionClosed?: boolean;
  onSelectHomework: (homeworkId: number) => void;
}

export default function MyHomeworkStatus({
  missionId,
  myHomework,
  isMissionClosed = false,
  onSelectHomework,
}: MyHomeworkStatusProps) {
  // 미제출 상태
  if (!myHomework || myHomework.homeworkStatus === 'NOT_SUBMITTED') {
    return (
      <div className="flex flex-col gap-300">
        <span className="font-designer-18b text-text-default">
          내 과제 현황
        </span>
        <div className="border-border-default rounded-100 flex flex-col items-center justify-center gap-200 border py-400">
          <span className="text-text-subtlest font-designer-14r">
            아직 과제를 제출하지 않았습니다.
          </span>
          <SubmitHomeworkModal missionId={missionId} />
        </div>
      </div>
    );
  }

  // 제출 완료 상태 (평가 대기)
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
          <span className="text-text-subtlest font-designer-14r">
            리더의 과제 평가를 기다려 주세요.
          </span>
          <Button
            color="outlined"
            className="mt-100"
            onClick={() =>
              myHomework.homeworkId && onSelectHomework(myHomework.homeworkId)
            }
          >
            과제 상세 보기
          </Button>
        </div>
        {isMissionClosed && (
          <div className="flex flex-col gap-300">
            <span className="font-designer-18b text-text-default">
              리더 평가
            </span>
            <div className="border-border-default rounded-100 flex flex-col items-center justify-center border py-400">
              <span className="text-text-subtlest font-designer-14r">
                리더의 과제 평가를 기다려 주세요.
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 평가 완료 상태
  if (
    myHomework.homeworkStatus === 'EVALUATION_COMPLETED' &&
    myHomework.evaluation?.evaluationGrade
  ) {
    const gradeConfig =
      GRADE_SCORE_CONFIG[myHomework.evaluation.evaluationGrade];

    return (
      <div className="flex flex-col gap-300">
        <span className="font-designer-18b text-text-default">
          내 과제 현황
        </span>
        <div className="border-border-default rounded-100 flex items-center justify-between border px-400 py-300">
          <div className="flex items-center gap-300">
            <div className="border-border-default flex flex-col items-center border-r pr-300">
              <span className="text-text-brand font-designer-28b">
                {gradeConfig.label}
              </span>
              <span className="text-text-subtlest font-designer-12r">
                {gradeConfig.name} ({gradeConfig.score})
              </span>
            </div>
            <span className="text-text-default font-designer-14r">
              {myHomework.evaluation.evaluationComment}
            </span>
          </div>
          <Button
            color="outlined"
            onClick={() =>
              myHomework.homeworkId && onSelectHomework(myHomework.homeworkId)
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
