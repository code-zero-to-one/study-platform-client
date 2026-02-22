export const URGENT_DAYS_THRESHOLD = 3;

export const COUNTDOWN_STAGE_CONFIG = [
  {
    minDays: 3,
    maxDays: 3,
    label: 'D-3',
    bgClass: 'bg-green-500',
    textColorClass: 'text-green-600',
    pulse: false,
  },
  {
    minDays: 2,
    maxDays: 2,
    label: 'D-2',
    bgClass: 'bg-orange-500',
    textColorClass: 'text-orange-500',
    pulse: false,
  },
  {
    minDays: 1,
    maxDays: 1,
    label: 'D-1',
    bgClass: 'bg-red-500',
    textColorClass: 'text-red-500',
    pulse: false,
  },
] as const;

interface UrgentStageResult {
  urgent: true;
  label: string;
  bgClass: string;
  textColorClass: string;
  pulse: boolean;
  isHourly: boolean;
}

type CountdownState = { urgent: false } | UrgentStageResult;

export function getCountdownState(diffMs: number): CountdownState {
  if (diffMs <= 0) return null;

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > URGENT_DAYS_THRESHOLD) return { urgent: false };

  const stage = COUNTDOWN_STAGE_CONFIG.find(
    (s) => s.minDays <= diffDays && diffDays <= s.maxDays,
  );

  if (stage) {
    return { urgent: true, ...stage, isHourly: false };
  }

  const hh = String(Math.floor(diffMs / (1000 * 60 * 60))).padStart(2, '0');
  const mm = String(
    Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)),
  ).padStart(2, '0');
  const ss = String(Math.floor((diffMs % (1000 * 60)) / 1000)).padStart(2, '0');

  return {
    urgent: true,
    label: `${hh}:${mm}:${ss}`,
    bgClass: 'bg-red-500',
    textColorClass: 'text-red-500',
    pulse: true,
    isHourly: true,
  };
}
