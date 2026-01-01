'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import Avatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Progress from '@/components/ui/progress';

interface MissionDetailContentProps {
  groupStudyId: number;
  missionId: number;
  isLeader?: boolean;
}

interface ResizedImage {
  resizedImageId: number;
  imageUrl: string;
  width: number;
  height: number;
}

interface ProfileImage {
  imageId: number;
  resizedImages: ResizedImage[];
}

interface Evaluation {
  evaluationId: number;
  evaluationGrade:
    | 'A_PLUS'
    | 'A'
    | 'B_PLUS'
    | 'B'
    | 'C_PLUS'
    | 'C'
    | 'D_PLUS'
    | 'D'
    | 'F';
  evaluationComment: string;
}

interface Homework {
  homeworkId: number;
  homeworkStatus: 'EVALUATION_COMPLETED' | 'SUBMITTED' | 'NOT_SUBMITTED';
  submissionTime: string;
  submitterId: number;
  submitterApplyRole: 'PARTICIPANT' | 'LEADER';
  submitterNickname: string;
  submitterProfileImage?: ProfileImage;
  homeworkTextContent: string;
  homeworkLink?: string;
  evaluation?: Evaluation;
}

interface MissionDetail {
  missionId: number;
  weekNum: number;
  missionTitle: string;
  missionContent: string;
  missionStartDate: string;
  missionEndDate: string;
  maxHomeworkSubmissionCount: number;
  currentHomeworkSubmissionCount: number;
  homeworks: Homework[];
}

// TODO: API 연결 시 삭제
const MOCK_MISSION_DETAIL: MissionDetail = {
  missionId: 1,
  weekNum: 1,
  missionTitle: 'Spring Boot 프로젝트 세팅',
  missionContent: 'Spring Boot 프로젝트를 생성하고 기본 설정을 완료하세요.',
  missionStartDate: '2025-12-20',
  missionEndDate: '2025-12-27',
  maxHomeworkSubmissionCount: 3,
  currentHomeworkSubmissionCount: 2,
  homeworks: [
    {
      homeworkId: 1,
      homeworkStatus: 'EVALUATION_COMPLETED',
      submissionTime: '2025-12-21T14:30:00',
      submitterId: 10,
      submitterApplyRole: 'PARTICIPANT',
      submitterNickname: '김철수',
      submitterProfileImage: {
        imageId: 5,
        resizedImages: [
          {
            resizedImageId: 15,
            imageUrl: 'https://example.com/profile_small.jpg',
            width: 100,
            height: 100,
          },
        ],
      },
      homeworkTextContent: '프로젝트 세팅을 완료했습니다.',
      homeworkLink: 'https://github.com/user/spring-boot-project',
      evaluation: {
        evaluationId: 1,
        evaluationGrade: 'A_PLUS',
        evaluationComment: '잘 작성하셨습니다.',
      },
    },
    {
      homeworkId: 2,
      homeworkStatus: 'SUBMITTED',
      submissionTime: '2025-12-22T09:15:00',
      submitterId: 11,
      submitterApplyRole: 'PARTICIPANT',
      submitterNickname: '이영희',
      submitterProfileImage: undefined,
      homeworkTextContent: '기본 설정 완료',
      homeworkLink: undefined,
      evaluation: undefined,
    },
  ],
};

const HOMEWORK_STATUS_CONFIG = {
  SUBMITTED: { label: '제출 완료', color: 'blue' },
  NOT_SUBMITTED: { label: '미제출', color: 'gray' },
  EVALUATION_COMPLETED: { label: '평가 완료', color: 'green' },
} as const;

const GRADE_LABEL_CONFIG: Record<Evaluation['evaluationGrade'], string> = {
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
  groupStudyId: _groupStudyId,
  missionId: _missionId,
  isLeader: _isLeader,
}: MissionDetailContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // TODO: API 연결
  const mission = MOCK_MISSION_DETAIL;

  const progressValue =
    (mission.currentHomeworkSubmissionCount /
      mission.maxHomeworkSubmissionCount) *
    100;

  const handleSelectHomework = (homeworkId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('homeworkId', String(homeworkId));
    router.push(`?${params.toString()}`);
  };

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
            {mission.missionContent}
          </p>
        </div>
      </div>

      {/* 제출 현황 */}
      <div className="flex flex-col gap-300">
        <div className="flex items-center justify-between">
          <span className="font-designer-18b text-text-default">제출 현황</span>
          <div className="flex items-center gap-200">
            <span className="text-text-subtlest font-designer-14r">
              {mission.currentHomeworkSubmissionCount} /{' '}
              {mission.maxHomeworkSubmissionCount} 제출
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
          {mission.homeworks.map((homework) => (
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
  homework: Homework;
  onSelectHomework: (homeworkId: number) => void;
}

function HomeworkCard({ homework, onSelectHomework }: HomeworkCardProps) {
  const statusConfig =
    HOMEWORK_STATUS_CONFIG[homework.homeworkStatus] ||
    HOMEWORK_STATUS_CONFIG.NOT_SUBMITTED;

  const profileImageUrl =
    homework.submitterProfileImage?.resizedImages[0]?.imageUrl ??
    '/profile-default.svg';

  const formatSubmissionTime = (time: string) => {
    return time.split('T')[0];
  };

  const handleClick = () => {
    onSelectHomework(homework.homeworkId);
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
        homework.evaluation ? (
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
