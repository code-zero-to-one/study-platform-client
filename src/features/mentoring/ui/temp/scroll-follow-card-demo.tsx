'use client';

import { ArrowDown, ArrowUp, Eye } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

const SCROLL_NUDGE_RATIO = 0.55;
const SCROLL_NUDGE_MAX = 160;
const SCROLL_IDLE_DETECTION_MS = 120;
const SCROLL_SMOOTHING_FACTOR = 0.16;
const SCROLL_STOP_THRESHOLD = 0.25;
const CARD_FLOATING_WIDTH = 320;
const CARD_HORIZONTAL_SHIFT = 168;
const SECTION_SEED = [
  '멘토링 신청 작성 포인트를 빠르게 검토합니다.',
  '소개글이 실제 카드에 어떻게 보이는지 확인합니다.',
  '가격/상담 방식 설정이 상세 페이지에 반영되는지 봅니다.',
  '사전 질문 등록 시 신청 단계 안내가 자연스러운지 봅니다.',
  '오프라인/온라인 일정 슬롯 구성 흐름을 점검합니다.',
  '신청함에서 수락 이후 상태 전이가 맞는지 확인합니다.',
  '후기 작성 이후 평점 합산 노출을 확인합니다.',
  '상세 페이지 CTA 버튼 라벨이 의도대로 노출되는지 확인합니다.',
] as const;
const SCROLL_TEST_SECTION_COUNT = 72;
const DEMO_SECTIONS = Array.from(
  { length: SCROLL_TEST_SECTION_COUNT },
  (_, i) => {
    const template = SECTION_SEED[i % SECTION_SEED.length];

    return `${template} · TEST ${String(i + 1).padStart(2, '0')}`;
  },
);

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value));
};

type ScrollDirection = 'up' | 'down' | 'idle';

const getScrollDirection = (
  previous: number,
  next: number,
): ScrollDirection => {
  if (next > previous) {
    return 'down';
  }

  if (next < previous) {
    return 'up';
  }

  return 'idle';
};

export default function ScrollFollowCardDemo() {
  const [scrollDirection, setScrollDirection] =
    useState<ScrollDirection>('idle');
  const [scrollY, setScrollY] = useState(0);
  const [cardNudgeOffset, setCardNudgeOffset] = useState(0);
  const prevScrollYRef = useRef(0);
  const currentOffsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const animateOffset = () => {
      const currentOffset = currentOffsetRef.current;
      const targetOffset = targetOffsetRef.current;
      const nextOffset =
        currentOffset +
        (targetOffset - currentOffset) * SCROLL_SMOOTHING_FACTOR;

      currentOffsetRef.current = nextOffset;
      setCardNudgeOffset(nextOffset);

      const offsetGap = Math.abs(targetOffset - nextOffset);
      const shouldStop =
        offsetGap < SCROLL_STOP_THRESHOLD &&
        Math.abs(nextOffset) < SCROLL_STOP_THRESHOLD &&
        Math.abs(targetOffset) < SCROLL_STOP_THRESHOLD;

      if (shouldStop) {
        currentOffsetRef.current = 0;
        targetOffsetRef.current = 0;
        setCardNudgeOffset(0);
        animationFrameRef.current = null;

        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const startAnimationLoop = () => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(animateOffset);
    };

    const handleScroll = () => {
      const nextScrollY = window.scrollY;
      const previousScrollY = prevScrollYRef.current;
      const delta = nextScrollY - previousScrollY;

      prevScrollYRef.current = nextScrollY;
      setScrollY(nextScrollY);
      setScrollDirection(getScrollDirection(previousScrollY, nextScrollY));
      if (delta === 0) {
        return;
      }

      targetOffsetRef.current = clamp(
        targetOffsetRef.current + delta * SCROLL_NUDGE_RATIO,
        -SCROLL_NUDGE_MAX,
        SCROLL_NUDGE_MAX,
      );

      startAnimationLoop();

      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }

      resetTimerRef.current = setTimeout(() => {
        targetOffsetRef.current = 0;
        startAnimationLoop();
        resetTimerRef.current = null;
      }, SCROLL_IDLE_DETECTION_MS);
    };

    prevScrollYRef.current = window.scrollY;
    setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (resetTimerRef.current !== null) {
        clearTimeout(resetTimerRef.current);
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <section className="rounded-200 border-border-subtle bg-background-default mb-250 border p-250">
      <div className="mb-150">
        <h2 className="font-designer-20b text-text-default mb-75">
          스크롤 추적 카드 데모
        </h2>
        <p className="font-designer-14r text-text-subtle">
          페이지를 아래로 내리면 카드가 내려가고, 위로 올리면 카드도 위로
          이동합니다. 카드 기준 자리는 항상 가운데이며, 스크롤 속도를 따라
          관성으로 움직였다가 멈추면 중앙으로 자연스럽게 복귀합니다.
        </p>
      </div>

      <div className="relative">
        <div className="space-y-100">
          {DEMO_SECTIONS.map((description, index) => (
            <article
              key={description}
              className="rounded-125 border-border-subtle bg-background-alternative border px-175 py-150"
            >
              <p className="font-designer-12b text-text-subtlest mb-25">
                CHECKPOINT {index + 1}
              </p>
              <p className="font-designer-14m text-text-default">
                {description}
              </p>
            </article>
          ))}
        </div>

        <aside
          className="pointer-events-none fixed [top:50%] z-40"
          style={{ left: `calc(50% + ${CARD_HORIZONTAL_SHIFT}px)` }}
        >
          <article
            className="rounded-150 border-border-brand bg-background-default shadow-2 pointer-events-auto w-[320px] border p-200 will-change-transform"
            style={{
              width: `min(${CARD_FLOATING_WIDTH}px, calc(100vw - 32px))`,
              transform: `translate(-50%, calc(-50% + ${cardNudgeOffset}px))`,
            }}
          >
            <div className="mb-100 flex items-center gap-75">
              <Eye className="text-text-brand h-16 w-16" />
              <span className="font-designer-14b text-text-default">
                시선 추적 카드
              </span>
            </div>

            <div className="space-y-75">
              <p className="font-designer-13m text-text-subtle">스크롤 방향</p>
              <p className="font-designer-14b text-text-default flex items-center gap-50">
                {scrollDirection === 'down' && (
                  <ArrowDown className="h-14 w-14" />
                )}
                {scrollDirection === 'up' && <ArrowUp className="h-14 w-14" />}
                <span
                  className={cn(
                    scrollDirection === 'down' && 'text-text-brand',
                    scrollDirection === 'up' && 'text-text-default',
                    scrollDirection === 'idle' && 'text-text-subtle',
                  )}
                >
                  {scrollDirection === 'down' && '아래로 이동 중'}
                  {scrollDirection === 'up' && '위로 이동 중'}
                  {scrollDirection === 'idle' && '대기 중'}
                </span>
              </p>
            </div>

            <div className="border-border-subtle mt-150 border-t pt-150">
              <p className="font-designer-13m text-text-subtle">
                현재 스크롤: {Math.round(scrollY)}px
              </p>
              <p className="font-designer-13m text-text-subtle">
                카드 애니메이션 이동량: {Math.round(cardNudgeOffset)}px
              </p>
            </div>
          </article>
        </aside>
      </div>
    </section>
  );
}
