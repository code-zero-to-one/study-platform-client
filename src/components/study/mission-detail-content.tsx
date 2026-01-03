'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type {
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  HomeworkDetailResponseDto,
} from '@/api/openapi/models';
import Avatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Progress from '@/components/ui/progress';
import { useGetMission } from '@/hooks/queries/mission-api';

interface MissionDetailContentProps {
  groupStudyId: number;
  missionId: number;
  isLeader?: boolean;
}

const HOMEWORK_STATUS_CONFIG = {
  SUBMITTED: { label: '제출 완료', color: 'blue' },
  NOT_SUBMITTED: { label: '미제출', color: 'gray' },
  EVALUATION_COMPLETED: { label: '평가 완료', color: 'green' },
} as const;

const GRADE_LABEL_CONFIG: Record<
  EvaluationDetailResponseDtoEvaluationGradeEnum,
  string
> = {
  A_PLUS: 'A+',
  A: 'A',
  B_PLUS: 'B+',
  B: 'B',
  C_PLUS: 'C+',
  C: 'C',
  D_PLUS: 'D+',
  D: 'D',
  F: 'F',
};

export default function MissionDetailContent({
  missionId,
}: MissionDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: mission, isLoading } = useGetMission(missionId);

  const handleSelectHomework = (homeworkId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('homeworkId', String(homeworkId));
    router.push(`?${params.toString()}`);
  };

  if (isLoading || !mission) {
    return null;
  }

  const progressValue =
    ((mission.currentHomeworkSubmissionCount ?? 0) /
      (mission.maxHomeworkSubmissionCount ?? 1)) *
    100;

  return (
    <div className="flex flex-col gap-400">
      {/* 미션 상세 정보 */}
      <div className="border-border-default rounded-100 flex flex-col gap-200 border p-400">
        <div className="flex items-center gap-100">
          <span className="font-designer-18b text-text-default">
            {mission.weekNum}주차 미션: {mission.missionTitle}
          </span>
        </div>
        <p className="text-text-subtlest font-designer-14r">
          제출 기간 : {mission.missionStartDate} - {mission.missionEndDate}
        </p>
        <div className="bg-background-alternative rounded-100 mt-100 p-300 whitespace-pre-wrap">
          <p className="text-text-default font-designer-14r">
            {mission.missionGuide}
          </p>
        </div>
      </div>

      {/* 제출 현황 */}
      <div className="flex flex-col gap-300">
        <div className="flex items-center justify-between">
          <span className="font-designer-18b text-text-default">제출 현황</span>
          <div className="flex items-center gap-200">
            <span className="text-text-subtlest font-designer-14r">
              {mission.currentHomeworkSubmissionCount ?? 0} /{' '}
              {mission.maxHomeworkSubmissionCount ?? 0} 제출
            </span>
            <div className="w-[120px]">
              <Progress
                value={progressValue}
                indicatorColor="bg-fill-danger-default-default"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-200">
          {mission.homeworks?.map((homework) => (
            <HomeworkCard
              key={homework.homeworkId}
              homework={homework}
              onSelectHomework={handleSelectHomework}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface HomeworkCardProps {
  homework: HomeworkDetailResponseDto;
  onSelectHomework: (homeworkId: number) => void;
}

function HomeworkCard({ homework, onSelectHomework }: HomeworkCardProps) {
  const statusConfig =
    HOMEWORK_STATUS_CONFIG[homework.homeworkStatus ?? 'NOT_SUBMITTED'] ||
    HOMEWORK_STATUS_CONFIG.NOT_SUBMITTED;

  const profileImageUrl =
    homework.submitterProfileImage?.resizedImages?.[0]?.resizedImageUrl ??
    '/profile-default.svg';

  const formatSubmissionTime = (time?: string) => {
    if (!time) return '';

    return time.split('T')[0];
  };

  const handleClick = () => {
    if (homework.homeworkId) {
      onSelectHomework(homework.homeworkId);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="border-border-default hover:bg-background-alternative rounded-100 flex w-full cursor-pointer items-center justify-between border p-200 transition-colors"
    >
      <div className="flex items-center gap-150">
        <Avatar image={profileImageUrl} size={40} />
        <div className="flex flex-col gap-50 text-left">
          <span className="font-designer-14b text-text-default">
            {homework.submitterNickname}
          </span>
          <span className="text-text-subtlest font-designer-12r">
            {formatSubmissionTime(homework.submissionTime)} 제출
          </span>
        </div>
      </div>

      <div className="flex items-center gap-100">
        {homework.homeworkStatus === 'EVALUATION_COMPLETED' &&
        homework.evaluation?.evaluationGrade ? (
          <div className="flex flex-col items-center gap-50">
            <span className="text-text-brand font-designer-16m">
              {GRADE_LABEL_CONFIG[homework.evaluation.evaluationGrade]}
            </span>
            <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
        ) : homework.homeworkStatus === 'SUBMITTED' ? (
          <div className="flex flex-col items-end gap-50">
            <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
          </div>
        ) : (
          <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
        )}
      </div>
    </button>
  );
}
