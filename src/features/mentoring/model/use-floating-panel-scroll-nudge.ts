'use client';

import { type RefObject, useEffect, useRef } from 'react';

const DEFAULT_DESKTOP_MEDIA_QUERY = '(min-width: 1280px)';
const DEFAULT_SCROLL_NUDGE_MAX = 44;
const DEFAULT_SCROLL_RESPONSE_RATIO = 0.6;
const DEFAULT_SCROLL_TARGET_DAMPING = 0.62;
const DEFAULT_SCROLL_SMOOTHING = 0.42;
const DEFAULT_SCROLL_IDLE_THRESHOLD = 0.18;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

interface UseFloatingPanelScrollNudgeOptions<
  TPanelElement extends HTMLElement,
> {
  enabled: boolean;
  panelRef: RefObject<TPanelElement>;
  cssVariableName: string;
  desktopMediaQuery?: string;
  maxOffset?: number;
  minOffset?: number;
  responseRatio?: number;
  targetDamping?: number;
  smoothing?: number;
  idleThreshold?: number;
}

export const useFloatingPanelScrollNudge = <TPanelElement extends HTMLElement>({
  enabled,
  panelRef,
  cssVariableName,
  desktopMediaQuery = DEFAULT_DESKTOP_MEDIA_QUERY,
  maxOffset = DEFAULT_SCROLL_NUDGE_MAX,
  minOffset = -maxOffset,
  responseRatio = DEFAULT_SCROLL_RESPONSE_RATIO,
  targetDamping = DEFAULT_SCROLL_TARGET_DAMPING,
  smoothing = DEFAULT_SCROLL_SMOOTHING,
  idleThreshold = DEFAULT_SCROLL_IDLE_THRESHOLD,
}: UseFloatingPanelScrollNudgeOptions<TPanelElement>) => {
  const previousScrollYRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const resetOffset = () => {
      previousScrollYRef.current = window.scrollY;
      currentOffsetRef.current = 0;
      targetOffsetRef.current = 0;
      panelRef.current?.style.setProperty(cssVariableName, '0px');

      if (animationFrameRef.current === null) {
        return;
      }

      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    };

    if (!enabled) {
      resetOffset();

      return;
    }

    const desktopQuery = window.matchMedia(desktopMediaQuery);

    const animateOffset = () => {
      targetOffsetRef.current *= targetDamping;
      const nextOffset =
        currentOffsetRef.current +
        (targetOffsetRef.current - currentOffsetRef.current) * smoothing;

      currentOffsetRef.current = nextOffset;
      panelRef.current?.style.setProperty(cssVariableName, `${nextOffset}px`);

      const shouldStop =
        Math.abs(nextOffset) < idleThreshold &&
        Math.abs(targetOffsetRef.current) < idleThreshold;

      if (shouldStop) {
        currentOffsetRef.current = 0;
        targetOffsetRef.current = 0;
        panelRef.current?.style.setProperty(cssVariableName, '0px');
        animationFrameRef.current = null;

        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const startAnimation = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const delta = nextScrollY - previousScrollYRef.current;
      previousScrollYRef.current = nextScrollY;

      if (!desktopQuery.matches || delta === 0) {
        return;
      }

      targetOffsetRef.current = clamp(
        targetOffsetRef.current + delta * responseRatio,
        minOffset,
        maxOffset,
      );
      startAnimation();
    };

    const handleViewportChange = () => {
      if (desktopQuery.matches) {
        return;
      }

      targetOffsetRef.current = 0;
      startAnimation();
    };

    previousScrollYRef.current = window.scrollY;
    panelRef.current?.style.setProperty(cssVariableName, '0px');
    window.addEventListener('scroll', handleScroll, { passive: true });
    desktopQuery.addEventListener('change', handleViewportChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      desktopQuery.removeEventListener('change', handleViewportChange);
      resetOffset();
    };
  }, [
    cssVariableName,
    desktopMediaQuery,
    enabled,
    idleThreshold,
    maxOffset,
    minOffset,
    panelRef,
    responseRatio,
    smoothing,
    targetDamping,
  ]);
};
