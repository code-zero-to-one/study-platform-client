'use client';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import { useNow } from '@/hooks/use-now';
import { getCountdownState } from '@/lib/countdown';

interface StudyActiveTickerProps {
  approvedCount: number;
  maxMembersCount: number;
  startDate: string; // YYYY-MM-DD
  viewCount?: number;
}

export default function StudyActiveTicker({
  approvedCount,
  maxMembersCount,
  startDate,
  viewCount = 0,
}: StudyActiveTickerProps) {
  const remaining = maxMembersCount - approvedCount;

  const messages = [
    remaining > 3
      ? `🔥 마감까지 ${remaining}석`
      : remaining > 0
        ? `🔥 마지막 ${remaining}자리`
        : '🔥 모집 마감',
    `지금 ${viewCount}명이 이 스터디를 보고 있어요.`,
    `${approvedCount}명이 가입했고 현재 ${remaining}자리 남았어요.`,
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % messages.length);
        setVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const now = useNow();

  const start = dayjs(startDate);
  const diffMs = start.diff(now);
  const state = getCountdownState(diffMs);

  const countdown =
    state?.urgent === true
      ? { text: state.label, color: state.textColorClass, pulse: state.pulse }
      : null;

  const isPulse = remaining > 0 && remaining <= 3;

  return (
    <div className="rounded-150 flex w-[335px] flex-col gap-0 overflow-hidden border border-[#D5D7DA] bg-white">
      {/* 전광판 섹션 */}
      <div className="flex items-center gap-200 px-300 py-250">
        <span className="font-designer-12m rounded-50 shrink-0 bg-[#F4F4F5] px-150 py-50 text-[#71717A]">
          전광판
        </span>
        <span
          className={`font-designer-14m text-text-default transition-opacity duration-300 ${
            visible ? 'opacity-100' : 'opacity-0'
          } ${isPulse && currentIndex === 0 ? 'animate-pulse' : ''}`}
        >
          {messages[currentIndex]}
        </span>
      </div>

      {/* 마감 카운트다운 섹션 */}
      {countdown && (
        <>
          <div className="h-px w-full bg-[#D5D7DA]" />
          <div className="flex items-center justify-between px-300 py-250">
            <span className="font-designer-14m text-text-subtle">
              모집 마감까지
            </span>
            <span
              className={`font-designer-14b ${countdown.color} ${countdown.pulse ? 'animate-pulse' : ''}`}
            >
              {countdown.text}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
