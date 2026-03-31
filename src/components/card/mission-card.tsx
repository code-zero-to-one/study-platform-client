'use client';

import dayjs from 'dayjs';
import { Lock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { ComponentProps, SyntheticEvent } from 'react';

import type { MissionListResponse } from '@/api/openapi/models';
import Badge from '@/components/common/ui/badge';
import Button from '@/components/common/ui/button';
import Tooltip from '@/components/common/ui/tooltip';
import { cn } from '../common/ui/(shadcn)/lib/utils';

const DeleteMissionModal = dynamic(
  () => import('@/components/common/modals/delete-mission-modal'),
  { ssr: false },
);

const EditMissionModal = dynamic(
  () => import('@/components/common/modals/edit-mission-modal'),
  { ssr: false },
);

interface MissionCardProps {
  mission: MissionListResponse;
  groupStudyId: number;
  onSelectMission: (missionId: number) => void;
  showDeadline?: boolean;
  isMember?: boolean;
  isLeader?: boolean;
  isLocked?: boolean;
  onLockedClick?: () => void;
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

  return true;
}

export default function MissionCard({
  mission,
  groupStudyId,
  onSelectMission,
  showDeadline = false,
  isMember = false,
  isLeader = false,
  isLocked = false,
  onLockedClick,
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

  const stopActionAreaPropagation = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  // 비가입자 2주차+ 잠금 카드
  if (isLocked) {
    return (
      <Tooltip
        trigger={
          <li className="border-border-default rounded-100 border bg-background-default">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between p-300"
              onClick={onLockedClick}
            >
              <MissionCardContent
                title={mission.title}
                weekNum={mission.weekNum}
                statusConfig={statusConfig}
                startDate={mission.startDate}
                endDate={mission.endDate}
                deadlineInfo={undefined}
              />
              <Lock className="text-text-subtle h-[18px] w-[18px] shrink-0" />
            </button>
          </li>
        }
        value="스터디 가입 후 확인 가능"
        side="top"
      />
    );
  }

  // 리더 + 진행 예정: 클릭 가능 + 수정/삭제 버튼 노출
  if (isLeader && mission.status === 'NOT_STARTED') {
    return (
      <li className="border-border-default rounded-100 border bg-[#fff]">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between p-300"
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
          <div
            className="flex flex-col gap-100"
            role="none"
            onClick={stopActionAreaPropagation}
          >
            <EditMissionModal
              missionId={mission.missionId}
              groupStudyId={groupStudyId}
            />
            <DeleteMissionModal
              missionId={mission.missionId}
              groupStudyId={groupStudyId}
            />
          </div>
        </button>
      </li>
    );
  }

  if (isLeader && mission.status === 'ENDED') {
    return (
      <li className="border-border-default rounded-100 border bg-[#fff]">
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between p-300"
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
        </button>
      </li>
    );
  }

  // 클릭 가능한 카드 (리더: 진행중/평가완료, 비리더: 진행중/평가완료)
  if (clickable) {
    return (
      <li
        className={cn(
          'rounded-100 border bg-[#fff]',
          deadlineInfo?.isUrgent
            ? 'border-status-error'
            : 'border-border-default',
        )}
      >
        <button
          type="button"
          className="flex w-full cursor-pointer items-center justify-between p-300"
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
        </button>
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
