'use client';

import { Eye, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface FloatingInfoBarProps {
  currentViewers: number;
  currentMembers: number;
  maxMembers: number;
  className?: string;
}

/**
 * 플로팅 정보 바 컴포넌트
 * - 실시간 조회자 수
 * - 현재 가입자 수 및 남은 자리
 * - 배경 투명
 * - 1초마다 메시지 carousel
 */
export default function FloatingInfoBar({
  currentViewers,
  currentMembers,
  maxMembers,
  className = '',
}: FloatingInfoBarProps) {
  // 잔여 좌석 계산 (최소값 0)
  const seatsLeft = Math.max(0, maxMembers - currentMembers);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 2);
    }, 3000); // 3초마다 전환

    return () => clearInterval(interval);
  }, []);

  const messages = [
    {
      icon: <Eye className="h-200 w-200 text-gray-400" />,
      content: (
        <p className="font-designer-16m text-text-default">
          지금{' '}
          <span className="font-designer-16b text-text-error">
            {currentViewers}명
          </span>
          이 이 스터디를 보고 있어요.
        </p>
      ),
    },
    {
      icon: <Flame className="h-200 w-200 text-red-500" />,
      content: (
        <p className="font-designer-16m text-text-default">
          <span className="font-designer-16b text-text-brand">
            {currentMembers}명
          </span>
          이 가입했고 현재{' '}
          <span className="font-designer-16b text-text-error">
            {seatsLeft}자리
          </span>{' '}
          남았어요.
        </p>
      ),
    },
  ];

  return (
    <div
      className={`rounded-200 bg-transparent border border-border-brand p-400 ${className}`}
    >
      <div className="relative h-[44px] overflow-hidden">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex items-center gap-150 transition-all duration-500 ${
              index === currentIndex
                ? 'translate-y-0 opacity-100'
                : 'translate-y-full opacity-0'
            }`}
          >
            {message.icon}
            {message.content}
          </div>
        ))}
      </div>
    </div>
  );
}
