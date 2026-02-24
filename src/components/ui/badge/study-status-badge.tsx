'use client';

import Badge from './index';

export type StudyStatus =
  | 'RECRUITING'
  | 'DEADLINE_IMMINENT'
  | 'IN_PROGRESS'
  | 'COMPLETED';

interface StudyStatusBadgeProps {
  status: StudyStatus;
  daysLeft?: number;
  hoursLeft?: number; // 24시간 미만 시 사용
  className?: string;
}

/**
 * 스터디 상태 배지 컴포넌트
 * - 모집 중: 초록색 (green)
 * - 마감까지 D-1, D-2, D-3: 빨간색 (red)
 * - 마감 24시간 미만: 빨간색 + 카운트다운
 * - 진행 중: 회색 (gray)
 * - 종료: 회색 (gray)
 */
export default function StudyStatusBadge({
  status,
  daysLeft,
  hoursLeft,
  className,
}: StudyStatusBadgeProps) {
  // 마감 임박 (모두 빨간색)
  if (status === 'DEADLINE_IMMINENT' && daysLeft !== undefined) {
    return (
      <Badge color="red" className={className}>
        마감까지 D-{daysLeft}
      </Badge>
    );
  }

  const statusConfig = {
    RECRUITING: { label: '모집 중', color: 'green' as const },
    DEADLINE_IMMINENT: { label: '마감 임박', color: 'red' as const },
    IN_PROGRESS: { label: '진행 중', color: 'gray' as const },
    COMPLETED: { label: '종료', color: 'gray' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  );
}
