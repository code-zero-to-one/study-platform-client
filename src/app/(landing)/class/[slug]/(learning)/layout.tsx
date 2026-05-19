'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { cn } from '@/components/common/ui/(shadcn)/lib/utils';

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
  const { slug } = useParams<{ slug: string }>();

  return (
    <>
      {/* Banner */}
      <div
        className="flex h-1500 w-full items-center justify-center pt-[29px] pb-[34px]"
        style={{
          background:
            'linear-gradient(90deg, var(--color-rose-100) 0%, var(--color-gray-0) 53.37%, var(--color-rose-100) 100%)',
        }}
      >
        <div className="flex items-center gap-350">
          <Image
            src="/class/discord-avatar.png"
            alt="Discord"
            width={54}
            height={54}
            className="rounded-150 shrink-0"
          />
          <div className="flex flex-col">
            <p className="text-[22px] font-semibold text-gray-800">
              Study with Me,{' '}
              <span className="text-text-brand">디스코드에서 함께 공부</span>
              해요
            </p>
            <p className="font-designer-16r text-gray-800">
              실시간으로 운영진이 도와드려요! 빌더들과 소통해요.
            </p>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <Suspense>
        <TabNavigation />
      </Suspense>

      {children}
    </>
  );
}
