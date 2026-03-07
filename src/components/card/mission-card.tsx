'use client';

import dayjs from 'dayjs';
import { ComponentProps } from 'react';

import { MissionListResponse } from '@/api/openapi/models';
import DeleteMissionModal from '@/components/common/modals/delete-mission-modal';
import EditMissionModal from '@/components/common/modals/edit-mission-modal';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import { cn } from '../common/ui/(shadcn)/lib/utils';

interface MissionCardProps {
  mission: MissionListResponse;
  groupStudyId: number;
  onSelectMission: (missionId: number) => void;
  showDeadline?: boolean;
  isMember?: boolean;
  isLeader?: boolean;
}

const STATUS_CONFIG = {
  NOT_STARTED: {
    label: '진행 예정',
    color: 'gray',
  },
  IN_PROGRESS: {
    label: '진행중',
    color: 'blue',
  },
  ENDED: {
    label: '제출 마감',
    color: 'blue',
  },
  EVALUATION_COMPLETED: {
    label: '평가 완료',
    color: 'green',
  },
} as const satisfies Record<
  string,
  { label: string; color: ComponentProps<typeof Badge>['color'] }
>;

function formatDate(dateString?: string) {
  if (!dateString) return '';

  return dayjs(dateString).format('YYYY-MM-DD');
}

function getDeadlineInfo(endDate?: string):
  | {
      text: string;
      isUrgent: boolean;
    }
  | undefined {
  if (!endDate) return undefined;

  const now = dayjs();
  const end = dayjs(endDate).endOf('day');

  if (end.isBefore(now)) return undefined;

  const diffHours = end.diff(now, 'hour');
  const diffDays = Math.ceil(end.diff(now, 'day', true));

  if (diffHours <= 24) {
    return { text: '오늘 제출 마감', isUrgent: true };
  }

  return { text: `제출 마감까지 D-${diffDays}`, isUrgent: false };
}

function isCardClickable(
  status: MissionListResponse['status'],
  isLeader: boolean,
  isMember: boolean,
): boolean {
  // 가입자(리더 포함): 모든 상태 클릭 가능
  if (isLeader || isMember) return true;
  // 비회원/미가입자: 1주차 필터는 상위에서 처리되므로 모든 상태 클릭 가능

  return status !== 'NOT_STARTED';
}

export default function MissionCard({
  mission,
  groupStudyId,
  onSelectMission,
  showDeadline = false,
  isMember = false,
  isLeader = false,
}: MissionCardProps) {
  const statusConfig =
    mission.status && mission.status in STATUS_CONFIG
      ? STATUS_CONFIG[mission.status as keyof typeof STATUS_CONFIG]
      : STATUS_CONFIG.NOT_STARTED;

  const handleSelectMission = () => {
    if (mission.missionId) {
      onSelectMission(mission.missionId);
    }
  };

  const clickable = isCardClickable(mission.status, isLeader, isMember);
  const deadlineInfo =
    showDeadline && mission.status === 'IN_PROGRESS'
      ? getDeadlineInfo(mission.endDate)
      : undefined;

  // 리더 + 진행 예정: 클릭 가능 + 수정/삭제 버튼 노출
  if (isLeader && mission.status === 'NOT_STARTED') {
    return (
      <li
        className="border-border-default rounded-100 flex cursor-pointer items-center justify-between border bg-[#fff] p-300"
        onClick={handleSelectMission}
      >
        <MissionCardContent
          title={mission.title}
          weekNum={mission.weekNum}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
          deadlineInfo={undefined}
        />
        <div className="flex flex-col gap-100">
          <EditMissionModal
            missionId={mission.missionId}
            groupStudyId={groupStudyId}
          />
          <DeleteMissionModal
            missionId={mission.missionId}
            groupStudyId={groupStudyId}
          />
        </div>
      </li>
    );
  }

  // 리더 + 제출 마감: 평가하기 버튼 노출
  if (isLeader && mission.status === 'ENDED') {
    return (
      <li
        className="border-border-default rounded-100 flex cursor-pointer items-center justify-between border bg-[#fff] p-300"
        onClick={handleSelectMission}
      >
        <MissionCardContent
          title={mission.title}
          weekNum={mission.weekNum}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
          deadlineInfo={undefined}
        />
        <Button
          color="outlined"
          size="medium"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectMission();
          }}
        >
          평가하기
        </Button>
      </li>
    );
  }

  // 클릭 가능한 카드 (리더: 진행중/평가완료, 비리더: 진행중/평가완료)
  if (clickable) {
    return (
      <li
        className={cn(
          'rounded-100 flex cursor-pointer items-center justify-between border bg-[#fff] p-300',
          deadlineInfo?.isUrgent
            ? 'border-status-error'
            : 'border-border-default',
        )}
        onClick={handleSelectMission}
      >
        <MissionCardContent
          title={mission.title}
          weekNum={mission.weekNum}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
          deadlineInfo={deadlineInfo}
        />
      </li>
    );
  }

  // 클릭 불가능한 카드 (비리더: 진행예정/제출마감)
  return (
    <li
      className={cn(
        'rounded-100 flex items-center justify-between border bg-[#fff] p-300',
        deadlineInfo?.isUrgent
          ? 'border-border-brand'
          : 'border-border-default',
      )}
    >
      <MissionCardContent
        title={mission.title}
        weekNum={mission.weekNum}
        statusConfig={statusConfig}
        startDate={mission.startDate}
        endDate={mission.endDate}
        deadlineInfo={deadlineInfo}
      />
    </li>
  );
}

function MissionCardContent({
  title,
  weekNum,
  statusConfig,
  startDate,
  endDate,
  deadlineInfo,
}: {
  title?: string;
  weekNum?: number;
  statusConfig: { label: string; color: ComponentProps<typeof Badge>['color'] };
  startDate?: string;
  endDate?: string;
  deadlineInfo: { text: string; isUrgent: boolean } | undefined;
}) {
  const displayTitle = weekNum ? `${weekNum}주차 미션 : ${title}` : title;

  return (
    <div className="flex flex-col gap-100">
      {deadlineInfo && (
        <span className={cn('font-designer-12b', 'text-text-brand')}>
          {deadlineInfo.text}
        </span>
      )}
      <div className="flex items-center gap-100">
        <span className="font-designer-16b text-text-default">
          {displayTitle}
        </span>
        <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
      </div>
      <span className="text-text-subtlest font-designer-12r">
        제출 기간 : {formatDate(startDate)} ~ {formatDate(endDate)}
      </span>
    </div>
  );
}
