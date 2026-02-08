'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string; // ISO date string
  className?: string;
}

/**
 * 실시간 카운트다운 컴포넌트
 * - 24시간 미만: HH:mm:ss 포맷
 * - 24시간 이상: n일 남음
 */
export default function Countdown({
  targetDate,
  className = '',
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        return '마감';
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      // 24시간 미만
      if (difference < 24 * 60 * 60 * 1000) {
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }

      // 24시간 이상
      return `${days}일 남음`;
    };

    // 초기 계산
    setTimeLeft(calculateTimeLeft());

    // 1초마다 업데이트
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <span className={`text-text-error text-xs font-bold ${className}`}>
      {timeLeft}
    </span>
  );
}
