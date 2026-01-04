'use client';

import { ComponentProps } from 'react';
import { MissionListResponse } from '@/api/openapi/models';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useIsLeader } from '@/providers/study-leader-context';

interface MissionCardProps {
  mission: MissionListResponse;
  onSelectMission: (missionId: number) => void;
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
  const date = new Date(dateString);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isCardClickable(
  status: MissionListResponse['status'],
  isLeader: boolean
): boolean {
  // 진행 예정은 리더/비리더 모두 클릭 불가
  if (status === 'NOT_STARTED') {
    return false;
  }

  if (isLeader) {
    // 리더: 진행중, 평가완료, 제출마감(평가하기) 시 클릭 가능
    return (
      status === 'IN_PROGRESS' ||
      status === 'EVALUATION_COMPLETED' ||
      status === 'ENDED'
    );
  }

  // 비리더: 진행중, 평가완료만 클릭 가능 (제출마감은 클릭 불가)
  return status === 'IN_PROGRESS' || status === 'EVALUATION_COMPLETED';
}

export default function MissionCard({
  mission,
  onSelectMission,
}: MissionCardProps) {
  const isLeader = useIsLeader();
  const statusConfig =
    mission.status && mission.status in STATUS_CONFIG
      ? STATUS_CONFIG[mission.status as keyof typeof STATUS_CONFIG]
      : STATUS_CONFIG.NOT_STARTED;

  const handleSelectMission = () => {
    if (mission.missionId) {
      onSelectMission(mission.missionId);
    }
  };

  const clickable = isCardClickable(mission.status, isLeader);

  // 리더 + 진행 예정: 수정/삭제 버튼만 노출
  if (isLeader && mission.status === 'NOT_STARTED') {
    return (
      <li className="border-border-default rounded-100 flex items-center justify-between border p-300">
        <MissionCardContent
          title={mission.title}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
        />
        <div className="flex flex-col gap-100">
          <Button color="outlined" size="small">
            수정하기
          </Button>
          <Button color="outlined" size="small">
            삭제하기
          </Button>
        </div>
      </li>
    );
  }

  // 리더 + 제출 마감: 평가하기 버튼 노출
  if (isLeader && mission.status === 'ENDED') {
    return (
      <li
        className="border-border-default rounded-100 flex cursor-pointer items-center justify-between border p-300"
        onClick={handleSelectMission}
      >
        <MissionCardContent
          title={mission.title}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
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
        className="border-border-default rounded-100 flex cursor-pointer items-center justify-between border p-300"
        onClick={handleSelectMission}
      >
        <MissionCardContent
          title={mission.title}
          statusConfig={statusConfig}
          startDate={mission.startDate}
          endDate={mission.endDate}
        />
      </li>
    );
  }

  // 클릭 불가능한 카드 (비리더: 진행예정/제출마감)
  return (
    <li className="border-border-default rounded-100 flex items-center justify-between border p-300">
      <MissionCardContent
        title={mission.title}
        statusConfig={statusConfig}
        startDate={mission.startDate}
        endDate={mission.endDate}
      />
    </li>
  );
}

function MissionCardContent({
  title,
  statusConfig,
  startDate,
  endDate,
}: {
  title?: string;
  statusConfig: { label: string; color: ComponentProps<typeof Badge>['color'] };
  startDate?: string;
  endDate?: string;
}) {
  return (
    <div className="flex flex-col gap-100">
      <div className="flex items-center gap-100">
        <span className="font-designer-16b text-text-default">{title}</span>
        <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
      </div>
      <span className="text-text-subtlest font-designer-12r">
        미션 기간 : {formatDate(startDate)} ~ {formatDate(endDate)}
      </span>
    </div>
  );
}
