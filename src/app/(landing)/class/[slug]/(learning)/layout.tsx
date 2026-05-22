'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
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
        d="M10.4396 23.6892C9.98331 23.2286 9.98331 22.4818 10.4396 22.0212L22.0055 10.3454C22.4618 9.88485 23.2015 9.88485 23.6578 10.3454C24.1141 10.806 24.1141 11.5528 23.6578 12.0134L12.0919 23.6892C11.6356 24.1498 10.8958 24.1498 10.4396 23.6892Z"
        fill="#A4A7AE"
      />
      <path
        d="M23.5604 35.6546C24.0167 35.194 24.0167 34.4472 23.5604 33.9866L11.9945 22.3108C11.5382 21.8502 10.7985 21.8502 10.3422 22.3108C9.88593 22.7714 9.88593 23.5182 10.3422 23.9788L21.9081 35.6546C22.3644 36.1151 23.1042 36.1151 23.5604 35.6546Z"
        fill="#A4A7AE"
      />
    </svg>
  );
}

function RoadmapIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 40.4775 39.977"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.2125 4.19351L14.9625 0.25601C14.0175 -0.0814898 12.9825 -0.0814897 12.0375 0.23351L3.06 3.24851C1.2375 3.87851 0 5.58851 0 7.52351V34.186C0 37.3585 3.1725 39.5185 6.12 38.371L12.7125 35.806C13.2075 35.6035 13.77 35.6035 14.265 35.7835L25.515 39.721C26.46 40.0585 27.495 40.0585 28.44 39.7435L37.4175 36.7285C39.24 36.121 40.4775 34.3885 40.4775 32.4535V5.79101C40.4775 2.61851 37.305 0.45851 34.3575 1.60601L27.765 4.17101C27.27 4.35101 26.73 4.37351 26.2125 4.19351ZM27 35.491L13.5 30.7435V4.48601L27 9.23351V35.491Z"
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
        d="M40.5 9H38.25V27C38.25 28.2375 37.2375 29.25 36 29.25H9V31.5C9 33.975 11.025 36 13.5 36H36L45 45V13.5C45 11.025 42.975 9 40.5 9ZM33.75 20.25V4.5C33.75 2.025 31.725 0 29.25 0H4.5C2.025 0 0 2.025 0 4.5V33.75L9 24.75H29.25C31.725 24.75 33.75 22.725 33.75 20.25Z"
        fill="#00C9A7"
      />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg
      className="size-full"
      viewBox="0 0 45.6637 45.6413"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M41.5181 9.65813L42.6206 7.27313L45.0056 6.17062C45.8831 5.76562 45.8831 4.52812 45.0056 4.12312L42.6206 3.02062L41.5181 0.658125C41.1131 -0.219375 39.8756 -0.219375 39.4706 0.658125L38.3681 3.04312L36.0056 4.14562C35.1281 4.55062 35.1281 5.78813 36.0056 6.19313L38.3906 7.29562L39.4931 9.65813C39.8756 10.5356 41.1356 10.5356 41.5181 9.65813Z"
        fill="#F63D68"
      />
      <path
        d="M15.6431 9.65813L16.7456 7.27313L19.1306 6.17062C20.0081 5.76562 20.0081 4.52812 19.1306 4.12312L16.7456 3.04312L15.6431 0.658125C15.2606 -0.219375 14.0006 -0.219375 13.6181 0.658125L12.5156 3.04312L10.1306 4.14562C9.25313 4.55062 9.25313 5.78813 10.1306 6.19313L12.5156 7.29562L13.6181 9.65813C14.0006 10.5356 15.2606 10.5356 15.6431 9.65813Z"
        fill="#F63D68"
      />
      <path
        d="M39.4931 26.5331L38.3906 28.9181L36.0056 30.0206C35.1281 30.4256 35.1281 31.6631 36.0056 32.0681L38.3906 33.1706L39.4931 35.5556C39.8981 36.4331 41.1356 36.4331 41.5406 35.5556L42.6431 33.1706L45.0056 32.0456C45.8831 31.6406 45.8831 30.4031 45.0056 29.9981L42.6206 28.8956L41.5181 26.5106C41.1356 25.6556 39.8756 25.6556 39.4931 26.5331Z"
        fill="#F63D68"
      />
      <path
        d="M35.3531 16.6781L28.9856 10.3106C28.1081 9.43312 26.6906 9.43312 25.8131 10.3106L0.658125 35.4431C-0.219375 36.3206 -0.219375 37.7381 0.658125 38.6156L7.02562 44.9831C7.90312 45.8606 9.32063 45.8606 10.1981 44.9831L35.3306 19.8506C36.2306 18.9956 36.2306 17.5556 35.3531 16.6781ZM27.4781 21.3806L24.3056 18.2081L27.4106 15.1031L30.5831 18.2756L27.4781 21.3806Z"
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
    <div className="flex items-center gap-175">
      <div className="relative size-675 shrink-0 overflow-hidden">
        <div className="absolute" style={{ inset: iconInset }}>
          <Icon />
        </div>
      </div>
      <div className="flex flex-col">
        <p className="whitespace-nowrap text-[22px] font-semibold tracking-[-0.418px] text-gray-800">
          {title}
        </p>
        <p className="font-designer-16r text-gray-800">{subtitle}</p>
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

  // Sync displayed banner when user navigates via URL tab
  useEffect(() => {
    setDisplayedTab(activeTab);
  }, [activeTab]);

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
      <AnimatePresence custom={direction}>
        <motion.div
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
        </motion.div>
      </AnimatePresence>

      <Link
        href={tabHref(slug, prevTab)}
        className="absolute left-1500 top-1/2 z-10 -translate-y-1/2"
        aria-label="이전"
        onClick={() => setDirection(-1)}
      >
        <ChevronLeft />
      </Link>

      <Link
        href={tabHref(slug, nextTab)}
        className="absolute right-1500 top-1/2 z-10 -translate-y-1/2 scale-x-[-1]"
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
    <div className="flex w-full justify-center">
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
              'flex h-875 w-6000 flex-col items-center justify-center gap-125',
              isActive
                ? 'font-designer-18b text-text-brand'
                : 'font-designer-18r text-gray-400',
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
