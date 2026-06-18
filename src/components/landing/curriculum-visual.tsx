'use client';

import { AnimatePresence, m, useInView, useReducedMotion } from 'framer-motion';
import { Check, Heart } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

/* ─────────────────────────────────────────────────────────────────────────
   Curriculum micro-interactions — replaces the static "움직이는 인터랙션"
   placeholders (Figma 682×467). One faux-UI per roadmap step, replayed once
   on viewport enter. prefers-reduced-motion → final state, no motion.
   ──────────────────────────────────────────────────────────────────────── */

function useTypewriter(full: string, active: boolean, speed = 42) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(reduce ? full : '');
  useEffect(() => {
    if (reduce) {
      setOut(full);
      return;
    }
    if (!active) {
      setOut('');
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setOut(full.slice(0, i));
      if (i >= full.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [full, active, speed, reduce]);
  return out;
}

/* Shared faux-window chrome (traffic-light dots + body). */
function Frame({ children, bar }: { children: ReactNode; bar?: ReactNode }) {
  return (
    <div className="flex aspect-[682/467] w-full flex-col overflow-hidden rounded-200 border border-gray-200 bg-gray-50">
      <div className="flex items-center gap-100 border-b border-gray-200 bg-gray-0 px-250 py-150">
        <span className="size-125 rounded-full bg-rose-300" />
        <span className="size-125 rounded-full bg-gray-300" />
        <span className="size-125 rounded-full bg-gray-300" />
        {bar && <div className="ml-150 min-w-0 flex-1">{bar}</div>}
      </div>
      <div className="relative min-h-0 flex-1 p-300">{children}</div>
    </div>
  );
}

/* ─── 01 · 전자책 — 코드가 타이핑된다 ─────────────────────────────────── */

function EbookVisual({ active }: { active: boolean }) {
  const code = "const me = '코딩 0';\nbuild(me); // 첫 결과물 ✨";
  const typed = useTypewriter(code, active);
  return (
    <Frame>
      <p className="text-[13px] font-bold leading-[1.5] text-rose-500 md:text-[15px]">
        Lesson 01 · 핵심만 짚는 학습지
      </p>
      <pre
        className="mt-200 whitespace-pre-wrap rounded-150 bg-gray-1000 p-250 text-[12px] leading-[1.7] text-gray-0 md:text-[15px]"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}
      >
        {typed}
        <m.span
          className="ml-50 inline-block w-50 bg-rose-400 align-middle"
          style={{ height: '1em' }}
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </pre>
    </Frame>
  );
}

/* ─── 02 · 무제한 질문답변 — 막히면 즉시 답이 온다 ───────────────────── */

function QnaVisual({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(reduce ? 2 : 0);
  useEffect(() => {
    if (reduce) {
      setStep(2);
      return;
    }
    if (!active) {
      setStep(0);
      return;
    }
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [active, reduce]);

  return (
    <Frame>
      <div className="flex h-full flex-col justify-center gap-200">
        <m.div
          className="max-w-[80%] self-end rounded-150 rounded-tr-50 bg-gray-200 px-250 py-150 text-[12px] leading-[1.5] text-gray-800 md:text-[15px]"
          initial={{ opacity: 0, y: 8 }}
          animate={active || reduce ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          이 에러 왜 나는 거예요? 😵
        </m.div>

        <AnimatePresence>
          {step >= 1 && (
            <m.div
              key="answer"
              className="flex max-w-[88%] items-start gap-150 self-start"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <span className="mt-25 flex size-300 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[11px] font-bold text-white">
                AI
              </span>
              <div className="rounded-150 rounded-tl-50 bg-rose-100 px-250 py-150 text-[12px] leading-[1.5] text-gray-800 md:text-[15px]">
                {step === 1 ? (
                  <span className="flex items-center gap-50">
                    <Dot d={0} />
                    <Dot d={0.15} />
                    <Dot d={0.3} />
                  </span>
                ) : (
                  '세미콜론 한 칸이 빠졌어요. 4번 줄만 고치면 바로 돌아갑니다 👍'
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

function Dot({ d }: { d: number }) {
  return (
    <m.span
      className="size-100 rounded-full bg-rose-400"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 0.7, repeat: Infinity, delay: d }}
    />
  );
}

/* ─── 03 · 빌더 피드 — 결과물이 흘러오고 좋아요가 오른다 ──────────────── */

function FeedVisual({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const [likes, setLikes] = useState(reduce ? 24 : 23);
  const [liked, setLiked] = useState(reduce);
  useEffect(() => {
    if (reduce || !active) return;
    const t = setTimeout(() => {
      setLiked(true);
      setLikes(24);
    }, 900);
    return () => clearTimeout(t);
  }, [active, reduce]);

  const cards = [
    '지우 · 카페 큐레이션',
    '도현 · 팀 프로필',
    '하늘 · 포트폴리오',
  ];
  return (
    <Frame>
      <div className="flex h-full flex-col gap-150">
        {cards.map((label, i) => (
          <m.div
            key={label}
            className="flex items-center gap-200 rounded-150 border border-gray-200 bg-gray-0 px-250 py-150"
            initial={{ opacity: 0, x: 24 }}
            animate={active || reduce ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.4, delay: i * 0.18 }}
          >
            <span className="size-400 shrink-0 rounded-100 bg-gradient-to-br from-rose-300 to-rose-500" />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium leading-[1.5] text-gray-800 md:text-[14px]">
              {label}
            </span>
            {i === 0 && (
              <span className="flex shrink-0 items-center gap-50 text-[12px] text-gray-500 md:text-[14px]">
                <m.span
                  animate={liked ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  <Heart
                    className={cn(
                      'size-225',
                      liked ? 'fill-rose-500 text-rose-500' : 'text-gray-400',
                    )}
                  />
                </m.span>
                {likes}
              </span>
            )}
          </m.div>
        ))}
      </div>
    </Frame>
  );
}

/* ─── 04 · 배포 — URL이 찍히고 라이브가 된다 ─────────────────────────── */

function DeployVisual({ active }: { active: boolean }) {
  const reduce = useReducedMotion();
  const url = useTypewriter('soa.zeroone.it.kr', active, 70);
  const [done, setDone] = useState(reduce);
  useEffect(() => {
    if (reduce || !active) {
      if (reduce) setDone(true);
      return;
    }
    const t = setTimeout(() => setDone(true), 1700);
    return () => clearTimeout(t);
  }, [active, reduce]);

  return (
    <Frame
      bar={
        <div className="flex items-center gap-100 rounded-full bg-gray-100 px-200 py-50">
          <span className="size-100 shrink-0 rounded-full bg-green-500" />
          <span
            className="truncate text-[11px] leading-[1.5] text-gray-600 md:text-[13px]"
            style={{
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            }}
          >
            https://{reduce ? 'soa.zeroone.it.kr' : url}
          </span>
        </div>
      }
    >
      <div className="flex h-full flex-col items-center justify-center gap-200">
        <AnimatePresence mode="wait">
          {done ? (
            <m.div
              key="done"
              className="flex flex-col items-center gap-150"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            >
              <span className="flex size-700 items-center justify-center rounded-full bg-green-500">
                <Check className="size-400 text-white" strokeWidth={3} />
              </span>
              <p className="text-[14px] font-bold leading-[1.5] text-gray-800 md:text-[18px]">
                배포 완료 · 내 URL이 생겼어요
              </p>
            </m.div>
          ) : (
            <m.p
              key="deploying"
              className="text-[13px] font-medium leading-[1.5] text-gray-500 md:text-[16px]"
              exit={{ opacity: 0 }}
            >
              배포하는 중…
            </m.p>
          )}
        </AnimatePresence>
      </div>
    </Frame>
  );
}

/* ─── Dispatcher ─────────────────────────────────────────────────────── */

const VISUALS: Record<string, (p: { active: boolean }) => ReactElement> = {
  '01': EbookVisual,
  '02': QnaVisual,
  '03': FeedVisual,
  '04': DeployVisual,
};

export function CurriculumVisual({ num }: { num: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInView(ref, { once: true, amount: 0.4 });
  const Visual = VISUALS[num] ?? EbookVisual;
  return (
    <div ref={ref}>
      <Visual active={active} />
    </div>
  );
}
