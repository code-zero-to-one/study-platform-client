'use client';

import { AnimatePresence, domAnimation, LazyMotion, m } from 'framer-motion';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import {
  type ComponentType,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Suspense } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

type TabParam = 'roadmap' | 'feed' | 'qna';

const TAB_ORDER: TabParam[] = ['roadmap', 'feed', 'qna'];

function tabHref(slug: string, tab: TabParam) {
  return `/class/${slug}/home?tab=${tab}`;
}

function getActiveTab(
  pathname: string,
  tabParam: string | null,
  slug: string,
): TabParam {
  if (pathname.startsWith(`/class/${slug}/feed`)) return 'feed';
  if (pathname.startsWith(`/class/${slug}/qa`)) return 'qna';
  if (tabParam === 'feed') return 'feed';
  if (tabParam === 'qna') return 'qna';
  return 'roadmap';
}

function ChevronLeft() {
  return (
    <svg
      width={34}
      height={46}
      viewBox="0 0 34 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10.44 23.69C9.98 23.23 9.98 22.48 10.44 22.02L22.01 10.35C22.46 9.88 23.2 9.88 23.66 10.35C24.11 10.81 24.11 11.55 23.66 12.01L12.09 23.69C11.64 24.15 10.9 24.15 10.44 23.69Z"
        fill="#A4A7AE"
      />
      <path
        d="M23.56 35.65C24.02 35.19 24.02 34.45 23.56 33.99L11.99 22.31C11.54 21.85 10.8 21.85 10.34 22.31C9.89 22.77 9.89 23.52 10.34 23.98L21.91 35.65C22.36 36.12 23.1 36.12 23.56 35.65Z"
        fill="#A4A7AE"
      />
    </svg>
  );
}

function RoadmapIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 40.48 39.98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.21 4.19L14.96 0.26C14.02 -0.08 12.98 -0.08 12.04 0.23L3.06 3.25C1.24 3.88 0 5.59 0 7.52V34.19C0 37.36 3.17 39.52 6.12 38.37L12.71 35.81C13.21 35.6 13.77 35.6 14.27 35.78L25.52 39.72C26.46 40.06 27.5 40.06 28.44 39.74L37.42 36.73C39.24 36.12 40.48 34.39 40.48 32.45V5.79C40.48 2.62 37.31 0.46 34.36 1.61L27.77 4.17C27.27 4.35 26.73 4.37 26.21 4.19ZM27 35.49L13.5 30.74V4.49L27 9.23V35.49Z"
        fill="#2E90FA"
      />
    </svg>
  );
}

function QnaIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 45 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M40.5 9H38.25V27C38.25 28.24 37.24 29.25 36 29.25H9V31.5C9 33.98 11.03 36 13.5 36H36L45 45V13.5C45 11.03 42.98 9 40.5 9ZM33.75 20.25V4.5C33.75 2.03 31.73 0 29.25 0H4.5C2.03 0 0 2.03 0 4.5V33.75L9 24.75H29.25C31.73 24.75 33.75 22.73 33.75 20.25Z"
        fill="#00C9A7"
      />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 45.66 45.64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M41.52 9.66L42.62 7.27L45.01 6.17C45.88 5.77 45.88 4.53 45.01 4.12L42.62 3.02L41.52 0.66C41.11 -0.22 39.88 -0.22 39.47 0.66L38.37 3.04L36.01 4.15C35.13 4.55 35.13 5.79 36.01 6.19L38.39 7.3L39.49 9.66C39.88 10.54 41.14 10.54 41.52 9.66Z"
        fill="#F63D68"
      />
      <path
        d="M15.64 9.66L16.75 7.27L19.13 6.17C20.01 5.77 20.01 4.53 19.13 4.12L16.75 3.04L15.64 0.66C15.26 -0.22 14 -0.22 13.62 0.66L12.52 3.04L10.13 4.15C9.25 4.55 9.25 5.79 10.13 6.19L12.52 7.3L13.62 9.66C14 10.54 15.26 10.54 15.64 9.66Z"
        fill="#F63D68"
      />
      <path
        d="M39.49 26.53L38.39 28.92L36.01 30.02C35.13 30.43 35.13 31.66 36.01 32.07L38.39 33.17L39.49 35.56C39.9 36.43 41.14 36.43 41.54 35.56L42.64 33.17L45.01 32.05C45.88 31.64 45.88 30.4 45.01 30L42.62 28.9L41.52 26.51C41.14 25.66 39.88 25.66 39.49 26.53Z"
        fill="#F63D68"
      />
      <path
        d="M35.35 16.68L28.99 10.31C28.11 9.43 26.69 9.43 25.81 10.31L0.66 35.44C-0.22 36.32 -0.22 37.74 0.66 38.62L7.03 44.98C7.9 45.86 9.32 45.86 10.2 44.98L35.33 19.85C36.23 19 36.23 17.56 35.35 16.68ZM27.48 21.38L24.31 18.21L27.41 15.1L30.58 18.28L27.48 21.38Z"
        fill="#F63D68"
      />
    </svg>
  );
}

interface BannerConfig {
  gradient: string;
  Icon: ComponentType;
  iconInset: string;
  title: ReactNode;
  subtitle: string;
}

const BANNERS: Record<TabParam, BannerConfig> = {
  roadmap: {
    gradient:
      'linear-gradient(90deg, var(--color-blue-100) 0%, var(--color-gray-0) 53.37%, var(--color-blue-100) 100%)',
    Icon: RoadmapIcon,
    iconInset: '12.98% 12.52%',
    title: (
      <>
        Step by Step, <span className="text-blue-600">20일 완성 로드맵</span>을
        차근차근 따라가 보세요!
      </>
    ),
    subtitle:
      '오늘 해야 할 미션은 무엇일까요? 도장 찍듯 퀘스트를 하나씩 클리어하며 성취감을 느껴보세요.',
  },
  feed: {
    gradient:
      'linear-gradient(90deg, #ffe6ec 0%, var(--color-gray-0) 53.37%, #ffe6ec 100%)',
    Icon: FeedIcon,
    iconInset: '7.74% 7.72%',
    title: (
      <>
        Share your Vibe,{' '}
        <span className="text-rose-500">다른 빌더들의 프로젝트</span>를 구경해
        보세요!
      </>
    ),
    subtitle:
      '수많은 아이디어가 실시간으로 공유되고 있어요. 레퍼런스를 얻고 피드백을 나누며 함께 성장해요.',
  },
  qna: {
    gradient:
      'linear-gradient(90deg, #ddf6f1 0%, var(--color-gray-0) 53.37%, #ddf6f1 100%)',
    Icon: QnaIcon,
    iconInset: '8.33%',
    title: (
      <>
        Ask Us Anything, 혼자 끙끙 앓지 말고{' '}
        <span className="text-[#00ad82]">무엇이든 물어보세요!</span>
      </>
    ),
    subtitle:
      '알 수 없는 에러부터 사소한 궁금증까지, 운영진이 속 시원하게 해결해 드립니다.',
  },
};

function BannerSlideContent({ tab }: { tab: TabParam }) {
  const { Icon, iconInset, title, subtitle } = BANNERS[tab];
  return (
    <div className="flex items-center gap-100 px-750 md:gap-175 md:px-0">
      <div className="relative size-500 shrink-0 overflow-hidden md:size-675">
        <div className="absolute" style={{ inset: iconInset }}>
          <Icon />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="text-[14px] font-semibold tracking-[-0.418px] text-gray-800 sm:text-[18px] md:text-[22px]">
          {title}
        </p>
        <p className="hidden font-designer-16r text-gray-800 md:block">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

const slideVariants = {
  enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%' }),
  center: { x: 0 },
  exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%' }),
};

function BannerSection() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = getActiveTab(pathname, searchParams.get('tab'), slug);
  const [displayedTab, setDisplayedTab] = useState<TabParam>(activeTab);
  const [direction, setDirection] = useState(1);

  // URL 탭이 바뀌면 배너를 동기화 — effect 대신 렌더 중 이전값 비교(공식 패턴).
  // displayedTab은 자동 넘김 타이머로도 변하므로 순수 파생 불가. 이전 탭은 ref로 추적.
  const prevActiveTabRef = useRef<TabParam>(activeTab);
  if (activeTab !== prevActiveTabRef.current) {
    prevActiveTabRef.current = activeTab;
    setDisplayedTab(activeTab);
  }

  // Auto-advance banner only (no URL change)
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setDisplayedTab((prev) => {
        const i = TAB_ORDER.indexOf(prev);
        return TAB_ORDER[(i + 1) % TAB_ORDER.length];
      });
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const displayedIdx = TAB_ORDER.indexOf(displayedTab);
  const prevTab =
    TAB_ORDER[(displayedIdx - 1 + TAB_ORDER.length) % TAB_ORDER.length];
  const nextTab = TAB_ORDER[(displayedIdx + 1) % TAB_ORDER.length];

  return (
    <div className="relative h-1500 w-full overflow-hidden">
      <LazyMotion features={domAnimation}>
        <AnimatePresence custom={direction}>
          <m.div
            key={displayedTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: BANNERS[displayedTab].gradient }}
          >
            <BannerSlideContent tab={displayedTab} />
          </m.div>
        </AnimatePresence>
      </LazyMotion>

      <Link
        href={tabHref(slug, prevTab)}
        className="absolute left-200 top-1/2 z-10 -translate-y-1/2 md:left-1500"
        aria-label="이전"
        onClick={() => setDirection(-1)}
      >
        <ChevronLeft />
      </Link>

      <Link
        href={tabHref(slug, nextTab)}
        className="absolute right-200 top-1/2 z-10 -translate-y-1/2 scale-x-[-1] md:right-1500"
        aria-label="다음"
        onClick={() => setDirection(1)}
      >
        <ChevronLeft />
      </Link>
    </div>
  );
}

function TabNavigation() {
  const { slug } = useParams<{ slug: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'roadmap';

  const TABS = [
    {
      label: '학습 여정 맵',
      href: `/class/${slug}/home?tab=roadmap`,
      tabParam: 'roadmap',
      pathPrefix: null as string | null,
    },
    {
      label: '빌더 피드',
      href: `/class/${slug}/home?tab=feed`,
      tabParam: 'feed',
      pathPrefix: `/class/${slug}/feed`,
    },
    {
      label: '질문답변',
      href: `/class/${slug}/home?tab=qna`,
      tabParam: 'qna',
      pathPrefix: `/class/${slug}/qa`,
    },
  ];

  return (
    <div className="flex w-full justify-center mt-250 px-400 md:px-3000">
      {TABS.map((t) => {
        let isActive = false;
        if (pathname === `/class/${slug}/home`) {
          isActive = tab === t.tabParam;
        } else if (t.pathPrefix) {
          isActive = pathname.startsWith(t.pathPrefix);
        }
        return (
          <Link
            key={t.tabParam}
            href={t.href}
            className={cn(
              'flex h-875 flex-1 min-w-0 flex-col items-center justify-center gap-125 text-center',
              isActive
                ? 'font-designer-14b text-text-brand md:font-designer-18b'
                : 'font-designer-14r text-gray-400 md:font-designer-18r',
            )}
          >
            {t.label}
            <div
              className={cn(
                'w-full',
                isActive
                  ? 'h-25 bg-background-brand-default'
                  : 'h-px bg-border-default',
              )}
            />
          </Link>
        );
      })}
    </div>
  );
}

export default function VibeIntroLearningLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={<div className="h-1500 w-full" />}>
        <BannerSection />
      </Suspense>

      <Suspense>
        <TabNavigation />
      </Suspense>

      {children}
    </>
  );
}
