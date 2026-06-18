'use client';

import dayjs from 'dayjs';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import Badge from '@/components/common/ui/badge';
import { useNow } from '@/hooks/use-now';
import { getCountdownState } from '@/lib/countdown';

interface Props {
  startDate?: string;
  status?: string;
  remaining?: number;
}

export default function StudyCardCountdownBadge({
  startDate,
  status,
  remaining,
}: Props) {
  const now = useNow();

  if (status === 'COMPLETED') {
    return <Badge color="gray">종료</Badge>;
  }

  if (status === 'IN_PROGRESS') {
    return <Badge color="gray">진행 중</Badge>;
  }

  const isRecruiting = status === 'RECRUITING' || status === 'ENDING_SOON';
  if (!isRecruiting) return null;

  if (remaining !== undefined && remaining <= 0) {
    return <Badge className="bg-red-500 px-200 text-white">모집 마감</Badge>;
  }

  if (!startDate) return null;

  const start = dayjs(startDate);
  const diffMs = start.diff(now);
  const state = getCountdownState(diffMs);

  if (!state || !state.urgent) {
    if (status === 'ENDING_SOON') {
      return (
        <Badge className="bg-green-500 px-200 text-white">마감 임박</Badge>
      );
    }

    return <Badge color="green">모집 중</Badge>;
  }

  return (
    <Badge
      className={cn(
        'px-100',
        state.bgClass,
        state.textColorClass,
        state.borderClass,
        state.pulse && 'animate-pulse',
        state.isHourly && 'font-bold',
      )}
    >
      마감까지 {state.label}
    </Badge>
  );
}
