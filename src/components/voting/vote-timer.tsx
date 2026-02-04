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
  // 초기값을 null로 설정하여 서버와 클라이언트가 동일한 HTML을 렌더링하도록 함
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 클라이언트에서만 마운트되었음을 표시
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!endsAt || !isActive || !isMounted) return;

    // 초기 시간 계산
    const initialTimeLeft = calculateTimeLeft(endsAt);
    setTimeLeft(initialTimeLeft);

    if (!initialTimeLeft) return;

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(endsAt);
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endsAt, isActive, isMounted]);

  if (!isActive) {
    return (
      <div className="bg-fill-brand-subtle-default text-text-brand flex items-center gap-100 rounded-full px-200 py-100">
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

  // 서버와 클라이언트가 동일한 HTML을 렌더링하도록 보장
  // 마운트되지 않았거나 timeLeft가 계산되지 않았을 때는 placeholder 표시
  if (!isMounted || !timeLeft) {
    return (
      <div className="flex items-center gap-100 rounded-full border border-orange-100 bg-orange-50 px-200 py-100 text-orange-600">
        <Timer className="h-4 w-4" />
        <div className="flex items-baseline gap-150">
          <span className="font-designer-12b">남은 시간</span>
          <span className="font-designer-14b font-mono tabular-nums">
            <span>00</span>
            <span className="mx-0.5 opacity-50">:</span>
            <span>00</span>
            <span className="mx-0.5 opacity-50">:</span>
            <span>00</span>
          </span>
        </div>
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
