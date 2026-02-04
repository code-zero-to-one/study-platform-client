import { Clock, Timer } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface VoteTimerProps {
  endsAt?: string;
  isActive: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(endsAt: string): TimeLeft | null {
  const difference = new Date(endsAt).getTime() - new Date().getTime();

  if (difference <= 0) {
    return null;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function VoteTimer({ endsAt, isActive }: VoteTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(
    endsAt ? calculateTimeLeft(endsAt) : null,
  );

  useEffect(() => {
    if (!endsAt || !isActive) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endsAt);
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, isActive]);

  if (!isActive) {
    return (
      <div className="flex items-center gap-100 rounded-full border border-orange-100 bg-orange-50 px-200 py-100 text-orange-600">
        <Clock className="h-4 w-4" />
        <span className="font-designer-12b">종료된 투표</span>
      </div>
    );
  }

  if (!endsAt) {
    return (
      <div className="bg-fill-brand-subtle-default flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5">
        <Clock className="text-text-brand h-3.5 w-3.5" />
        <span className="text-text-brand text-xs font-bold">진행 중</span>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="flex items-center gap-100 rounded-full border border-orange-100 bg-orange-50 px-200 py-100 text-orange-600">
        <Clock className="h-4 w-4" />
        <span className="font-designer-12b">종료</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-100 rounded-full border border-orange-100 bg-orange-50 px-200 py-100 text-orange-600">
      <Timer className="h-4 w-4" />
      <div className="flex items-baseline gap-150">
        <span className="font-designer-12b">남은 시간</span>
        <span className="font-designer-14b font-mono tabular-nums">
          {timeLeft.days > 0 && (
            <>
              <span>{timeLeft.days}일</span>
              <span className="mx-0.5 opacity-50">:</span>
            </>
          )}
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="mx-0.5 opacity-50">:</span>
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="mx-0.5 opacity-50">:</span>
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
        </span>
      </div>
    </div>
  );
}
