'use client';

import dayjs from 'dayjs';

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

  if (status !== 'RECRUITING') return null;

  if (remaining !== undefined && remaining <= 0) {
    return (
      <span className="rounded-50 bg-red-500 px-200 py-50 text-[12px] font-semibold text-white">
        모집 마감
      </span>
    );
  }

  if (!startDate) return null;

  const start = dayjs(startDate);
  const diffMs = start.diff(now);
  const state = getCountdownState(diffMs);

  if (!state || !state.urgent) {
    return (
      <span className="rounded-50 bg-blue-500 px-200 py-50 text-[12px] font-semibold text-white">
        모집 중
      </span>
    );
  }

  return (
    <span
      className={`rounded-50 px-200 py-50 text-[12px] font-semibold text-white ${state.bgClass} ${state.pulse ? 'animate-pulse' : ''}`}
    >
      마감까지 {state.label}
    </span>
  );
}
