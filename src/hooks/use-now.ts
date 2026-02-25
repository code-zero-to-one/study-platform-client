'use client';

import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';

// 모듈 레벨 싱글턴 — 구독 컴포넌트 수와 무관하게 setInterval은 1개만 실행
const listeners = new Set<(now: Dayjs) => void>();
let currentNow = dayjs();
let intervalId: ReturnType<typeof setInterval> | null = null;

function tick() {
  currentNow = dayjs();
  listeners.forEach((fn) => fn(currentNow));
}

/**
 * 1초마다 갱신되는 현재 시각을 반환합니다.
 * 여러 컴포넌트에서 호출해도 setInterval은 전역 1개만 실행됩니다.
 */
export function useNow(): Dayjs {
  const [now, setNow] = useState(() => currentNow);

  useEffect(() => {
    listeners.add(setNow);
    if (!intervalId) {
      intervalId = setInterval(tick, 1000);
    }

    return () => {
      listeners.delete(setNow);
      if (listeners.size === 0 && intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
  }, []);

  return now;
}
