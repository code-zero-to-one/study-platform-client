'use client';

import React from 'react';
import { createPortal } from 'react-dom';

export interface TutorialStep {
  id: string;
  title: string;
  description: React.ReactNode;
  targetSelector?: string;
  targetRef?: React.RefObject<HTMLElement | null>;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
  spotlightPadding?: number;
  spotlightRadius?: number;
  scrollBlock?: ScrollLogicalPosition;
}

interface TutorialOverlayProps {
  open: boolean;
  steps: TutorialStep[];
  activeIndex?: number;
  onStepChange?: (nextIndex: number) => void;
  onClose: () => void;
  onFinish?: () => void;
}

interface SpotlightRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface TooltipRect {
  width: number;
  height: number;
}

const DEFAULT_SPOTLIGHT_PADDING = 8;
const DEFAULT_SPOTLIGHT_RADIUS = 12;
const TOOLTIP_GAP = 12;
const VIEWPORT_MARGIN = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTargetElement = (step: TutorialStep) => {
  if (typeof document === 'undefined') return null;
  if (step.targetRef?.current) return step.targetRef.current;
  if (!step.targetSelector) return null;

  return document.querySelector(step.targetSelector) as HTMLElement | null;
};

const getSpotlightRect = (
  targetRect: DOMRect,
  padding: number,
): SpotlightRect => {
  const left = Math.max(0, targetRect.left - padding);
  const top = Math.max(0, targetRect.top - padding);
  const width = targetRect.width + padding * 2;
  const height = targetRect.height + padding * 2;

  return { left, top, width, height };
};

const getTooltipPosition = ({
  placement,
  align,
  targetRect,
  tooltipRect,
}: {
  placement: 'top' | 'bottom' | 'left' | 'right';
  align: 'start' | 'center' | 'end';
  targetRect: DOMRect | null;
  tooltipRect: TooltipRect | null;
}) => {
  if (typeof window === 'undefined') {
    return {
      left: 0,
      top: 0,
      transform: 'translate(0, 0)',
    } as const;
  }
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (!targetRect || !tooltipRect) {
    return {
      left: viewportWidth / 2,
      top: viewportHeight / 2,
      transform: 'translate(-50%, -50%)',
    } as const;
  }

  let left = targetRect.left;
  let top = targetRect.top;

  if (placement === 'top') {
    top = targetRect.top - tooltipRect.height - TOOLTIP_GAP;
  }
  if (placement === 'bottom') {
    top = targetRect.bottom + TOOLTIP_GAP;
  }
  if (placement === 'left') {
    left = targetRect.left - tooltipRect.width - TOOLTIP_GAP;
  }
  if (placement === 'right') {
    left = targetRect.right + TOOLTIP_GAP;
  }

  if (placement === 'top' || placement === 'bottom') {
    if (align === 'center') {
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    }
    if (align === 'end') {
      left = targetRect.right - tooltipRect.width;
    }
  } else {
    if (align === 'center') {
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
    }
    if (align === 'end') {
      top = targetRect.bottom - tooltipRect.height;
    }
  }

  left = clamp(
    left,
    VIEWPORT_MARGIN,
    viewportWidth - tooltipRect.width - VIEWPORT_MARGIN,
  );
  top = clamp(
    top,
    VIEWPORT_MARGIN,
    viewportHeight - tooltipRect.height - VIEWPORT_MARGIN,
  );

  return { left, top, transform: 'none' } as const;
};

export default function TutorialOverlay({
  open,
  steps,
  activeIndex: activeIndexProp,
  onStepChange,
  onClose,
  onFinish,
}: TutorialOverlayProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [spotlightRect, setSpotlightRect] =
    React.useState<SpotlightRect | null>(null);
  const [tooltipRect, setTooltipRect] = React.useState<TooltipRect | null>(
    null,
  );
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const frameRef = React.useRef<number | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [recheckKey, setRecheckKey] = React.useState(0);
  const missingCountRef = React.useRef(0);

  const isControlled = typeof activeIndexProp === 'number';
  const resolvedActiveIndex = isControlled ? activeIndexProp : activeIndex;

  const setStepIndex = React.useCallback(
    (nextIndex: number) => {
      if (isControlled) {
        onStepChange?.(nextIndex);
      } else {
        setActiveIndex(nextIndex);
      }
    },
    [isControlled, onStepChange],
  );

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (!isControlled) {
      setActiveIndex(0);
    }
    setTooltipRect(null);
    missingCountRef.current = 0;
  }, [open, isControlled]);

  const requestClose = React.useCallback(() => {
    onClose();
  }, [onClose]);

  const requestFinish = React.useCallback(() => {
    onFinish?.();
    onClose();
  }, [onFinish, onClose]);

  const goNext = React.useCallback(() => {
    if (resolvedActiveIndex >= steps.length - 1) {
      requestFinish();

      return;
    }
    setStepIndex(resolvedActiveIndex + 1);
  }, [resolvedActiveIndex, steps.length, requestFinish, setStepIndex]);

  const goPrev = React.useCallback(() => {
    setStepIndex(Math.max(0, resolvedActiveIndex - 1));
  }, [resolvedActiveIndex, setStepIndex]);

  const scheduleSpotlightUpdate = React.useCallback(() => {
    if (frameRef.current) return;
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const step = steps[resolvedActiveIndex];
      const target = step ? getTargetElement(step) : null;
      if (!step || !target) {
        setSpotlightRect(null);

        return;
      }
      const rect = target.getBoundingClientRect();
      setSpotlightRect(
        getSpotlightRect(
          rect,
          step.spotlightPadding ?? DEFAULT_SPOTLIGHT_PADDING,
        ),
      );
    });
  }, [resolvedActiveIndex, steps]);

  React.useEffect(() => {
    if (!open) return;

    const step = steps[resolvedActiveIndex];
    if (!step) return;

    const target = getTargetElement(step);
    if (!target) {
      missingCountRef.current += 1;
      if (missingCountRef.current <= 20) {
        const id = window.setTimeout(() => {
          setRecheckKey((prev) => prev + 1);
        }, 50);

        return () => window.clearTimeout(id);
      }
      missingCountRef.current = 0;

      return;
    }
    missingCountRef.current = 0;

    if (typeof window !== 'undefined') {
      target.scrollIntoView({
        behavior: 'smooth',
        block: step.scrollBlock ?? 'center',
        inline: 'nearest',
      });
    }

    scheduleSpotlightUpdate();

    const handleScroll = () => scheduleSpotlightUpdate();
    const handleResize = () => scheduleSpotlightUpdate();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [
    open,
    resolvedActiveIndex,
    scheduleSpotlightUpdate,
    steps,
    recheckKey,
    requestClose,
    setStepIndex,
  ]);

  React.useEffect(() => {
    if (!open) return;
    if (!tooltipRef.current) return;
    const id = window.requestAnimationFrame(() => {
      if (!tooltipRef.current) return;
      const rect = tooltipRef.current.getBoundingClientRect();
      setTooltipRect({ width: rect.width, height: rect.height });
    });

    return () => window.cancelAnimationFrame(id);
  }, [open, resolvedActiveIndex, spotlightRect]);

  React.useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', handleKey);

    return () => window.removeEventListener('keydown', handleKey);
  }, [open, goNext, goPrev, requestClose]);

  const currentStep = steps[resolvedActiveIndex];
  const tooltipPosition = React.useMemo(() => {
    if (!open || !currentStep) return null;
    const target = getTargetElement(currentStep);
    const targetRect = target?.getBoundingClientRect() ?? null;

    return getTooltipPosition({
      placement: currentStep.placement ?? 'bottom',
      align: currentStep.align ?? 'center',
      targetRect,
      tooltipRect,
    });
  }, [open, currentStep, spotlightRect, tooltipRect]);

  if (!open || !mounted || !currentStep) return null;

  const overlay = (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={goNext}
        style={{
          position: 'absolute',
          inset: 0,
        }}
        aria-hidden
      />
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        <defs>
          <mask id="tutorial-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.left}
                y={spotlightRect.top}
                width={spotlightRect.width}
                height={spotlightRect.height}
                rx={currentStep.spotlightRadius ?? DEFAULT_SPOTLIGHT_RADIUS}
                ry={currentStep.spotlightRadius ?? DEFAULT_SPOTLIGHT_RADIUS}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(12, 14, 20, 0.65)"
          mask="url(#tutorial-spotlight-mask)"
        />
        {spotlightRect && (
          <rect
            x={spotlightRect.left}
            y={spotlightRect.top}
            width={spotlightRect.width}
            height={spotlightRect.height}
            rx={currentStep.spotlightRadius ?? DEFAULT_SPOTLIGHT_RADIUS}
            ry={currentStep.spotlightRadius ?? DEFAULT_SPOTLIGHT_RADIUS}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="2"
          />
        )}
      </svg>

      <div
        ref={tooltipRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${resolvedActiveIndex + 1}단계 안내`}
        style={{
          position: 'fixed',
          left: tooltipPosition?.left ?? '50%',
          top: tooltipPosition?.top ?? '50%',
          transform: tooltipPosition?.transform ?? 'translate(-50%, -50%)',
          background: '#ffffff',
          color: '#111827',
          borderRadius: 16,
          padding: '16px 18px',
          boxShadow:
            '0 20px 40px rgba(0, 0, 0, 0.25), 0 4px 16px rgba(0, 0, 0, 0.2)',
          maxWidth: 360,
          width: 'min(360px, 92vw)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
          {resolvedActiveIndex + 1} / {steps.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
          {currentStep.title}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.45, color: '#374151' }}>
          {currentStep.description}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 14,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            {resolvedActiveIndex > 0 && (
              <button
                type="button"
                onClick={goPrev}
                style={{
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  color: '#111827',
                  borderRadius: 999,
                  padding: '6px 12px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                이전
              </button>
            )}
            <button
              type="button"
              onClick={goNext}
              style={{
                border: '1px solid #111827',
                background: '#111827',
                color: '#ffffff',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              {resolvedActiveIndex === steps.length - 1 ? '완료' : '다음'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
