'use client';

import { Eye, Flame } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudyActiveTickerProps {
  approvedCount: number;
  maxMembersCount: number;
  startDate: string;
  viewCount?: number;
  className?: string;
}

export default function StudyActiveTicker({
  approvedCount,
  maxMembersCount,
  viewCount = 0,
  className = '',
}: StudyActiveTickerProps) {
  const remaining = Math.max(0, maxMembersCount - approvedCount);
  const totalCount = maxMembersCount - remaining;
  const [currentIndex, setCurrentIndex] = useState(0);

  const messages = [
    {
      icon: <Eye className="h-200 w-200 text-gray-400" />,
      content: (
        <p className="font-designer-16m text-text-default">
          지금{' '}
          <span className="font-designer-16b text-text-error">
            {viewCount}명
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
            {totalCount}명
          </span>
          이 가입했고 현재{' '}
          <span className="font-designer-16b text-text-error">
            {remaining}자리
          </span>{' '}
          남았어요.
        </p>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className={`rounded-200 bg-transparent pt-400 pb-150 ${className}`}>
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
