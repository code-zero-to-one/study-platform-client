'use client';

import { useCallback, useEffect, useRef } from 'react';

export const useScrollToHomeContent = (offset: number = 24) => {
  return useCallback(() => {
    const anchor = document.getElementById('home-content-anchor');
    if (!anchor) return;
    const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }, [offset]);
};

const stabilizeScrollAfterLayout = (
  scrollToHomeContent: () => void,
  durationMs: number,
) => {
  const anchor = document.getElementById('home-content-anchor');
  if (!anchor || typeof ResizeObserver === 'undefined') return;

  const initialHeight = document.body.scrollHeight;
  let didAdjust = false;
  const observer = new ResizeObserver(() => {
    const nextHeight = document.body.scrollHeight;
    if (didAdjust || nextHeight === initialHeight) return;
    didAdjust = true;
    requestAnimationFrame(scrollToHomeContent);
  });

  observer.observe(document.body);
  window.setTimeout(() => observer.disconnect(), durationMs);
};

export const useScrollToHomeContentWithStabilize = (options?: {
  offset?: number;
  stabilizeDurationMs?: number;
}) => {
  const scrollToHomeContent = useScrollToHomeContent(options?.offset);

  return useCallback(() => {
    scrollToHomeContent();
    stabilizeScrollAfterLayout(
      scrollToHomeContent,
      options?.stabilizeDurationMs ?? 800,
    );
  }, [scrollToHomeContent, options?.stabilizeDurationMs]);
};

export const useScrollToHomeContentOnChange = (
  deps: React.DependencyList,
  options?: {
    offset?: number;
    enabled?: boolean;
    stabilize?: boolean;
    stabilizeDurationMs?: number;
  },
) => {
  const scrollToHomeContent = useScrollToHomeContent(options?.offset);
  const isFirst = useRef(true);

  useEffect(() => {
    if (options?.enabled === false) return;
    if (isFirst.current) {
      isFirst.current = false;

      return;
    }
    scrollToHomeContent();
    if (options?.stabilize) {
      stabilizeScrollAfterLayout(
        scrollToHomeContent,
        options?.stabilizeDurationMs ?? 800,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
