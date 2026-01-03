'use client';

import { ComponentProps } from 'react';
import { MissionListResponse } from '@/api/openapi/models';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';

interface MissionCardProps {
  mission: MissionListResponse;
  isLeader?: boolean;
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

export default function MissionCard({
  mission,
  isLeader,
  onSelectMission,
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

  return (
    <li className="border-border-default rounded-100 flex items-center justify-between border p-300">
      <div className="flex flex-col gap-100">
        <div className="flex items-center gap-100">
          <span className="font-designer-16b text-text-default">
            {mission.title}
          </span>
          <Badge color={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
        <span className="text-text-subtlest font-designer-12r">
          미션 기간 : {formatDate(mission.startDate)} ~{' '}
          {formatDate(mission.endDate)}
        </span>
      </div>

      <MissionActionButton
        status={mission.status}
        isLeader={isLeader}
        onSelectMission={handleSelectMission}
      />
    </li>
  );
}

function MissionActionButton({
  status,
  isLeader,
  onSelectMission,
}: {
  status?: MissionListResponse['status'];
  isLeader?: boolean;
  onSelectMission: () => void;
}) {
  // 진행 예정
  if (status === 'NOT_STARTED') {
    return null;
  }

  // 진행 중 또는 종료된 미션 - 리더에게 평가하기 버튼 표시
  if (status === 'IN_PROGRESS' || status === 'ENDED') {
    if (!isLeader) return null;

    return (
      <Button color="outlined" size="medium" onClick={onSelectMission}>
        평가하기
      </Button>
    );
  }

  // 평가 완료
  if (status === 'EVALUATION_COMPLETED') {
    return (
      <Button color="outlined" size="small" onClick={onSelectMission}>
        결과 보기
      </Button>
    );
  }

  return null;
}
