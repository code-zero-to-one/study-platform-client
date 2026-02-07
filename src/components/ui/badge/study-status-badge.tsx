'use client';

import Badge from './index';

export type StudyStatus = 'RECRUITING' | 'DEADLINE_IMMINENT' | 'IN_PROGRESS' | 'COMPLETED';

interface StudyStatusBadgeProps {
  status: StudyStatus;
  daysLeft?: number;
  hoursLeft?: number; // 24시간 미만 시 사용
  className?: string;
}

/**
 * 스터디 상태 배지 컴포넌트
 * - 모집 중: 기본 색상
 * - 마감까지 D-3: 초록색
 * - 마감까지 D-2: 주황색
 * - 마감까지 D-1: 빨간색
 * - 마감 24시간 미만: 빨간색 + 카운트다운 (배지 내부에 통합)
 * - 진행 중: 회색
 * - 종료: 비활성화 회색
 */
export default function StudyStatusBadge({
  status,
  daysLeft,
  hoursLeft,
  className,
}: StudyStatusBadgeProps) {
  // 마감 임박 (일자별 색상)
  if (status === 'DEADLINE_IMMINENT' && daysLeft !== undefined) {
    const badgeColor = daysLeft === 3 ? 'green' : daysLeft === 2 ? 'orange' : 'red';
    return (
      <Badge color={badgeColor} className={className}>
        마감까지 D-{daysLeft}
      </Badge>
    );
  }

  const statusConfig = {
    RECRUITING: { label: '모집 중', color: 'blue' as const },
    DEADLINE_IMMINENT: { label: '마감 임박', color: 'red' as const },
    IN_PROGRESS: { label: '진행 중', color: 'purple' as const },
    COMPLETED: { label: '종료', color: 'gray' as const },
  };

  const config = statusConfig[status];

  return (
    <Badge color={config.color} className={className}>
      {config.label}
    </Badge>
  );
}
