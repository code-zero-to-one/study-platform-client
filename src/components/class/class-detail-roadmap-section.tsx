'use client';

import {
  ArrowRight,
  Briefcase,
  CircleChevronDown,
  ClipboardCheck,
  Code,
  Lightbulb,
  type LucideIcon,
  Palette,
  Rocket,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';
import {
  INTRO_AFTER_ITEMS,
  INTRO_BEFORE_ITEMS,
  INTRO_RESULTS,
  INTRO_STATS,
  ROADMAP_STEPS,
  TARGET_AUDIENCE,
  type TargetAudienceIcon,
} from './class-detail-constants';

const TARGET_ICONS: Record<TargetAudienceIcon, LucideIcon> = {
  code: Code,
  rocket: Rocket,
  palette: Palette,
  clipboard: ClipboardCheck,
  bulb: Lightbulb,
  briefcase: Briefcase,
};

function useCountUp(end: number, duration: number, start: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const dur = reduce ? 0 : duration;

    let raf = 0;
    let startTime = 0;
    const tick = (now: number) => {
      if (!startTime) startTime = now;
      const progress = dur <= 0 ? 1 : Math.min((now - startTime) / dur, 1);
      setCount(Math.round(progress * end)); // linear
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [end, duration, start]);

  return count;
}

function StatCard({
  stat,
  visible,
}: {
  stat: (typeof INTRO_STATS)[number];
  visible: boolean;
}) {
  const animatable = /^\d+$/.test(stat.value);
  const target = animatable ? parseInt(stat.value, 10) : 0;
  const count = useCountUp(target, 800, visible);

  return (
    <div className="flex flex-col gap-50 rounded-200 border border-rose-300 bg-background-default px-300 py-250">
      <div className="flex items-center">
        <span className="text-[30px] font-bold leading-none text-text-brand">
          {animatable ? count.toLocaleString() : stat.value}
        </span>
        {stat.unit && (
          <span className="text-[24px] font-bold text-gray-800">
            {stat.unit}
          </span>
        )}
      </div>
      <span className="text-[14px] font-medium text-gray-800">
        {stat.label}
      </span>
    </div>
  );
}

function RoadmapJourney() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % ROADMAP_STEPS.length);
    }, 3500);
    return () => clearInterval(id);
  }, [active]);

  return (
    <div className="mt-400 flex h-auto w-full flex-col gap-250 overflow-hidden md:h-6000 md:flex-row">
      {ROADMAP_STEPS.map((step, i) => {
        const isActive = i === active;
        return (
          <button
            type="button"
            key={step.label}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            aria-expanded={isActive}
            className={cn(
              'flex w-full min-w-0 overflow-hidden rounded-200 md:h-full md:transition-[flex-grow] md:duration-500 md:ease-in-out',
              // 모바일: 항상 펼친 카드(세로 스택). 데스크톱: active flex 확장
              isActive
                ? cn('md:flex-[5]', step.activeBgClass)
                : 'bg-gray-100 md:flex-[1]',
            )}
          >
            {/* 모바일은 항상 펼친 카드 표시, 데스크톱은 active일 때만 */}
            <div
              className={cn(
                'h-full w-full flex-col items-stretch md:flex-row',
                isActive ? 'flex' : 'flex md:hidden',
              )}
            >
              <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center bg-[#d9d9d9] md:aspect-auto md:h-full md:w-[54%]">
                <span className="text-[20px] font-bold text-black">
                  레슨 이미지
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col px-350 py-400 text-left md:pt-400 md:duration-500 md:animate-in md:fade-in">
                <span className="font-designer-18m text-gray-800">
                  {step.label}
                </span>
                <p className="mt-450 whitespace-pre-line text-[20px] font-bold leading-snug text-gray-800">
                  {step.title}
                </p>
                <p className="mt-250 whitespace-pre-line font-designer-16m leading-relaxed text-gray-800">
                  {step.desc}
                </p>
              </div>
            </div>

            {/* 데스크톱 비활성 컬럼 레이블 */}
            {!isActive && (
              <div className="hidden h-full w-full justify-center pt-400 md:flex">
                <span className="text-[18px] font-bold text-black">
                  {step.label}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ClassDetailRoadmapSection() {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="roadmap">
      <h2 className="font-designer-20b text-gray-800 md:font-designer-24b">
        바이브 코딩, 나도 해보고 싶은데… 어디서부터?
      </h2>
      <p className="mt-300 font-designer-14r text-gray-800">
        코드 한 줄 몰라도 괜찮아요.
        <br className="hidden md:inline" />
        Claude가 만들고, 학습자가 결정합니다. 터미널 막막했던 그 벽, 여기서
        없애드릴게요.
      </p>

      <div
        ref={statsRef}
        className="mt-400 grid grid-cols-2 gap-175 sm:grid-cols-4"
      >
        {INTRO_STATS.map((stat) => (
          <StatCard key={stat.label} stat={stat} visible={statsVisible} />
        ))}
      </div>

      <section>
        <h3 className="mt-500 font-designer-28b text-gray-800">
          이런 분들이 들으면 좋아요!
        </h3>

        <div className="mt-300 grid grid-cols-1 gap-250 sm:grid-cols-2">
          {TARGET_AUDIENCE.map((a) => {
            const Icon = TARGET_ICONS[a.icon];
            return (
              <div
                key={a.title}
                className={cn(
                  'flex min-h-1750 items-center justify-between gap-200 overflow-hidden rounded-200 bg-gray-100 px-350',

                  'hover:border-2 hover:border-rose-400 hover:cursor-pointer hover:shadow-[0px_6px_13.6px_0px_#FD6F8E]',
                )}
              >
                <div className="flex flex-col gap-125">
                  <p className="font-designer-18b text-black">{a.title}</p>
                  <p className="whitespace-pre-line font-designer-16r text-black">
                    {a.desc}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex size-875 shrink-0 items-center justify-center rounded-150',
                    a.badgeClass,
                  )}
                >
                  <Icon className="size-700 text-white" strokeWidth={1.5} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mt-[80px]">
        <div className="font-designer-28b text-gray-800">
          <span>제로에서 배포까지, 막힘없는 4단계 로드맵</span>
        </div>
        <div className="font-designer-20r mt-150 text-gray-800">
          <span>
            코딩이 처음이어도 괜찮습니다. 개념 이해부터 나만의 웹사이트를 세상에
            선보이는 순간까지, 가장 확실하고 빠른 길을 안내해 드릴게요.
          </span>
        </div>
        <RoadmapJourney />
      </div>

      <h3 className="mt-500 font-designer-28b text-gray-800">
        이 코스를 완주하면 이런 걸 만들 수 있어요!
      </h3>
      <div className="mt-300 grid grid-cols-1 gap-300 sm:grid-cols-2">
        {INTRO_RESULTS.map((result, i) => (
          <div
            key={i}
            className="flex flex-col gap-200 rounded-200 bg-gray-100 p-300"
          >
            <div className="flex aspect-[370/230] items-center justify-center rounded-150 bg-[#bababa]">
              <span className="text-[50px] font-bold text-white">결과물</span>
            </div>
            <div className="flex flex-col items-center gap-50 pb-100">
              <div className="flex items-center gap-50 font-designer-16m text-text-brand">
                <span>{result.category}</span>
                <span>·</span>
                <span>{result.duration}</span>
              </div>
              <p className="text-[20px] font-bold text-gray-800">
                {result.title}
              </p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-150 font-designer-14r text-gray-800">
        형식은 자유예요. 중요한 건{' '}
        <span className="font-designer-14b text-text-brand">
          &quot;내가 만든 웹사이트&quot;
        </span>
        가 진짜로 인터넷에 올라간다는 거예요!
      </p>

      <div className="mt-500 flex flex-col items-center gap-300 sm:flex-row sm:items-stretch sm:justify-center">
        <div className="flex w-full flex-col rounded-200 border border-gray-300 bg-gray-50 p-400 sm:max-w-4875">
          <p className="text-center text-[20px] font-semibold text-gray-800">
            Before(지금의 나)
          </p>
          <ul className="mt-400 flex flex-col gap-100">
            {INTRO_BEFORE_ITEMS.map((t) => (
              <li key={t} className="flex items-center gap-100">
                <X className="size-175 shrink-0 text-gray-500" />
                <span className="font-designer-16r text-gray-800">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center justify-center">
          <ArrowRight className="size-300 rotate-90 text-text-brand sm:rotate-0" />
        </div>
        <div className="flex w-full flex-col rounded-200 border-[3px] border-rose-300 bg-rose-50 p-400 sm:max-w-4875">
          <p className="text-center text-[20px] font-bold text-text-brand">
            After(14일 후의 나)
          </p>
          <ul className="mt-400 flex flex-col gap-100">
            {INTRO_AFTER_ITEMS.map((it) => (
              <li key={it.bold} className="flex items-center gap-100">
                <CircleChevronDown className="size-175 shrink-0 text-text-brand" />
                <span className="font-designer-16r text-gray-800">
                  {it.normal}
                  <span className="font-designer-16b text-gray-800">
                    {it.bold}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
