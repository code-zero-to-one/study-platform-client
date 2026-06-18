'use client';

import type { MotionValue } from 'framer-motion';
import { LazyMotion, m, useReducedMotion, useTransform } from 'framer-motion';
import { domAnimation } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import { useVideoFrameScrubber } from '@/hooks/use-video-frame-scrubber';

// How many full walk-cycle loops play across the whole section (progress 0..1).
const WALK_LOOPS = 4;
// Character video intrinsic size (px). Canvas + shadow offsets assume this box.
const CHAR_WIDTH = 251;
const CHAR_HEIGHT = 337;
const CHAR_TOP_OFFSET = 38;

// Four ground shadows under the character. Each box uses spacing tokens; the
// inner wrapper bleeds the SVG out via symmetric percentage insets.
const SHADOWS = [
  {
    box: 'left-525 top-3625 h-112 w-950',
    y: '-81.11%',
    x: '-8.11%',
    src: '/class/detail/shadow-outer.svg',
  },
  {
    box: 'left-700 top-3625 h-112 w-587',
    y: '-161.11%',
    x: '-25.89%',
    src: '/class/detail/shadow-inner.svg',
  },
  {
    box: 'left-1662 top-3625 h-112 w-950',
    y: '-81.11%',
    x: '-8.11%',
    src: '/class/detail/shadow-outer.svg',
  },
  {
    box: 'left-1837 top-3625 h-112 w-587',
    y: '-161.11%',
    x: '-25.89%',
    src: '/class/detail/shadow-inner.svg',
  },
];

interface Props {
  /** Section scroll progress (0..1) driving frame selection + vertical travel. */
  progress: MotionValue<number>;
}

export function BenefitScrollCharacter({ progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  // Vertical travel distance: from top of the stack to just above its bottom.
  const [travelY, setTravelY] = useState(0);
  const y = useTransform(progress, [0, 1], [CHAR_TOP_OFFSET, travelY]);

  // Measure the stack height (parent + sibling cards) for the travel distance.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    const cards = Array.from(parent.children).filter(
      (el) => el !== container,
    ) as HTMLElement[];

    const updateTravel = () => {
      const max = parent.scrollHeight - CHAR_HEIGHT - CHAR_TOP_OFFSET;
      setTravelY(Math.max(max, CHAR_TOP_OFFSET));
    };

    const ro = new ResizeObserver(updateTravel);
    ro.observe(parent);
    cards.forEach((card) => ro.observe(card));
    return () => ro.disconnect();
  }, []);

  useVideoFrameScrubber({
    videoRef,
    canvasRef,
    containerRef,
    progress,
    loops: WALK_LOOPS,
    enabled: !reducedMotion,
  });

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 hidden lg:block"
    >
      <LazyMotion features={domAnimation}>
        <m.div
          style={{ y }}
          className="pointer-events-none absolute right-300 top-0"
        >
          {SHADOWS.map((shadow, i) => (
            <div key={i} className={cn('absolute', shadow.box)}>
              <div
                style={{
                  position: 'absolute',
                  top: shadow.y,
                  bottom: shadow.y,
                  left: shadow.x,
                  right: shadow.x,
                }}
              >
                <Image alt="" fill unoptimized sizes="100vw" src={shadow.src} />
              </div>
            </div>
          ))}
          {/* Decode source — rendered but visually hidden; canvas is the output. */}
          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute inset-0 opacity-0"
            width={CHAR_WIDTH}
            height={CHAR_HEIGHT}
          >
            <source src="/class/zerowoni_walk.webm" type="video/webm" />
          </video>
          <canvas
            ref={canvasRef}
            width={CHAR_WIDTH}
            height={CHAR_HEIGHT}
            tabIndex={-1}
            aria-hidden="true"
            className="block"
          />
        </m.div>
      </LazyMotion>
    </div>
  );
}
